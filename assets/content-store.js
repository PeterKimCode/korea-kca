(function createGTCCContentStore(global) {
  "use strict";

  const config = global.GTCC_SUPABASE_CONFIG || {};
  const baseUrl = String(config.url || "").replace(/\/+$/, "");
  const anonKey = String(config.anonKey || "");
  const configured = /^https:\/\/.+\.supabase\.co$/.test(baseUrl) && anonKey.length > 20;
  const cacheKey = "gtcc-public-content-v1";
  const sessionKey = "gtcc-admin-session-v1";
  const entityNames = new Set(["courses", "notices", "slides", "books", "faculty", "videos"]);

  function headers(token = "", extra = {}) {
    return {
      apikey: anonKey,
      Authorization: `Bearer ${token || anonKey}`,
      "Content-Type": "application/json",
      ...extra,
    };
  }

  async function request(path, options = {}) {
    if (!configured) throw new Error("Supabase 연결 설정이 필요합니다.");
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: headers(options.token, options.headers),
    });
    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!response.ok) {
      const message = data?.message || data?.msg || data?.error_description || "요청을 처리하지 못했습니다.";
      const error = new Error(message);
      error.status = response.status;
      error.details = data;
      throw error;
    }
    return data;
  }

  function readCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (!cached?.content) return null;
      return cached.content;
    } catch {
      return null;
    }
  }

  function writeCache(content) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), content }));
    } catch {
      // 저장 공간이 부족해도 공개 사이트 렌더링은 계속합니다.
    }
  }

  async function loadPublicContent(fallback) {
    if (!configured) return { ...fallback, source: "fallback" };
    try {
      const [courses, notices, slides] = await Promise.all([
        request("/rest/v1/courses?select=*&published=eq.true&deleted_at=is.null&order=group_key.asc,sort_order.asc"),
        request("/rest/v1/notices?select=*&published=eq.true&deleted_at=is.null&order=published_at.desc,number.desc"),
        request("/rest/v1/slides?select=*&published=eq.true&deleted_at=is.null&order=sort_order.asc"),
      ]);
      let books = [];
      try {
        books = await request("/rest/v1/books?select=*&published=eq.true&deleted_at=is.null&order=sort_order.asc");
      } catch (error) {
        // 교재 마이그레이션 전에도 기존 강좌·공지·슬라이드는 정상적으로 표시합니다.
        console.warn("교재 데이터가 아직 준비되지 않았습니다.", error);
      }
      let faculty = fallback.faculty || [];
      let videos = fallback.videos || [];
      try {
        [faculty, videos] = await Promise.all([
          request("/rest/v1/faculty?select=*&published=eq.true&deleted_at=is.null&order=sort_order.asc"),
          request("/rest/v1/videos?select=*&published=eq.true&deleted_at=is.null&order=sort_order.asc"),
        ]);
      } catch (error) {
        // 새 테이블을 설치하기 전에는 저장소에 포함된 기본 교수진과 영상을 표시합니다.
        console.warn("교수진·영상 데이터가 아직 준비되지 않았습니다.", error);
      }
      const content = {
        // 비공개 또는 삭제로 빈 목록이 된 경우 기본 콘텐츠를 다시 노출하지 않습니다.
        courses,
        notices,
        slides,
        books,
        faculty,
        videos,
        source: "remote",
      };
      writeCache(content);
      return content;
    } catch (error) {
      console.warn("GTCC 콘텐츠 서버 연결 실패. 저장된 기본 콘텐츠를 표시합니다.", error);
      const cached = readCache();
      return cached ? { ...cached, source: "cache" } : { ...fallback, source: "fallback" };
    }
  }

  function saveSession(session) {
    localStorage.setItem(sessionKey, JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at || Math.floor(Date.now() / 1000) + Number(session.expires_in || 3600),
      user: session.user,
    }));
  }

  function clearSession() {
    localStorage.removeItem(sessionKey);
  }

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(sessionKey) || "null");
    } catch {
      clearSession();
      return null;
    }
  }

  async function refreshSession(session) {
    const refreshed = await request("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    saveSession(refreshed);
    return readSession();
  }

  async function getSession() {
    let session = readSession();
    if (!session) return null;
    if (Number(session.expires_at || 0) - 60 <= Math.floor(Date.now() / 1000)) {
      try {
        session = await refreshSession(session);
      } catch {
        clearSession();
        return null;
      }
    }
    return session;
  }

  async function requireSession() {
    const session = await getSession();
    if (!session?.access_token) throw new Error("로그인이 만료되었습니다. 다시 로그인해 주세요.");
    return session;
  }

  async function signIn(email, password) {
    const session = await request("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveSession(session);
    const profile = await getAdminProfile();
    if (!profile) {
      clearSession();
      throw new Error("관리자로 등록되지 않은 계정입니다.");
    }
    return { session: readSession(), profile };
  }

  async function signOut() {
    const session = readSession();
    if (session?.access_token) {
      try {
        await request("/auth/v1/logout", { method: "POST", token: session.access_token });
      } catch {
        // 서버 로그아웃이 실패해도 이 브라우저의 세션은 제거합니다.
      }
    }
    clearSession();
  }

  async function getAdminProfile() {
    const session = await requireSession();
    const rows = await request(`/rest/v1/admin_users?select=user_id,display_name&user_id=eq.${encodeURIComponent(session.user.id)}`, {
      token: session.access_token,
    });
    return rows[0] || null;
  }

  async function list(entity, options = {}) {
    if (!entityNames.has(entity)) throw new Error("지원하지 않는 콘텐츠 종류입니다.");
    const session = await requireSession();
    const order = entity === "notices" ? "published_at.desc,number.desc" : "sort_order.asc";
    const recoveryLimit = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const deletedFilter = options.deleted
      ? `deleted_at=gte.${encodeURIComponent(recoveryLimit)}`
      : "deleted_at=is.null";
    return request(`/rest/v1/${entity}?select=*&${deletedFilter}&order=${order}`, {
      token: session.access_token,
    });
  }

  async function insert(entity, values) {
    if (!entityNames.has(entity)) throw new Error("지원하지 않는 콘텐츠 종류입니다.");
    const session = await requireSession();
    const rows = await request(`/rest/v1/${entity}`, {
      method: "POST",
      token: session.access_token,
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(values),
    });
    return rows[0];
  }

  async function update(entity, id, values, expectedUpdatedAt) {
    if (!entityNames.has(entity)) throw new Error("지원하지 않는 콘텐츠 종류입니다.");
    const session = await requireSession();
    const condition = expectedUpdatedAt ? `&updated_at=eq.${encodeURIComponent(expectedUpdatedAt)}` : "";
    const rows = await request(`/rest/v1/${entity}?id=eq.${encodeURIComponent(id)}${condition}`, {
      method: "PATCH",
      token: session.access_token,
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(values),
    });
    if (!rows.length) {
      const error = new Error("다른 관리자가 먼저 수정했습니다. 목록을 새로 불러온 뒤 다시 시도해 주세요.");
      error.code = "CONTENT_CONFLICT";
      throw error;
    }
    return rows[0];
  }

  async function softDelete(entity, record) {
    return update(entity, record.id, {
      published: false,
      deleted_at: new Date().toISOString(),
    }, record.updated_at);
  }

  async function restore(entity, record) {
    return update(entity, record.id, {
      published: true,
      deleted_at: null,
    }, record.updated_at);
  }

  async function listHistory(limit = 60) {
    const session = await requireSession();
    return request(`/rest/v1/content_history?select=*&order=created_at.desc&limit=${Math.min(limit, 100)}`, {
      token: session.access_token,
    });
  }

  async function restoreHistory(historyId) {
    const session = await requireSession();
    return request("/rest/v1/rpc/restore_content_version", {
      method: "POST",
      token: session.access_token,
      body: JSON.stringify({ history_id: historyId }),
    });
  }

  async function reorderSlides(slideIds) {
    const session = await requireSession();
    return request("/rest/v1/rpc/reorder_slides", {
      method: "POST",
      token: session.access_token,
      body: JSON.stringify({ slide_ids: slideIds }),
    });
  }

  async function reorderBooks(bookIds) {
    const session = await requireSession();
    return request("/rest/v1/rpc/reorder_books", {
      method: "POST",
      token: session.access_token,
      body: JSON.stringify({ book_ids: bookIds }),
    });
  }

  async function reorderFaculty(facultyIds) {
    const session = await requireSession();
    return request("/rest/v1/rpc/reorder_faculty", {
      method: "POST",
      token: session.access_token,
      body: JSON.stringify({ faculty_ids: facultyIds }),
    });
  }

  async function reorderVideos(videoIds) {
    const session = await requireSession();
    return request("/rest/v1/rpc/reorder_videos", {
      method: "POST",
      token: session.access_token,
      body: JSON.stringify({ video_ids: videoIds }),
    });
  }

  async function purgeExpiredTrash() {
    const session = await requireSession();
    return request("/rest/v1/rpc/purge_deleted_content", {
      method: "POST",
      token: session.access_token,
      body: "{}",
    });
  }

  async function uploadMedia(blob, folder, filename) {
    const session = await requireSession();
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    const objectPath = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const response = await fetch(`${baseUrl}/storage/v1/object/site-media/${objectPath}`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": blob.type || "image/webp",
        "x-upsert": "false",
      },
      body: blob,
    });
    if (!response.ok) {
      const details = await response.json().catch(() => null);
      throw new Error(details?.message || "이미지를 업로드하지 못했습니다.");
    }
    return `${baseUrl}/storage/v1/object/public/site-media/${objectPath}`;
  }

  async function importDefaults(content) {
    const session = await requireSession();
    const [existingCourses, existingNotices, existingSlides, existingFaculty, existingVideos] = await Promise.all([
      request("/rest/v1/courses?select=id,slug", { token: session.access_token }),
      request("/rest/v1/notices?select=id,number", { token: session.access_token }),
      request("/rest/v1/slides?select=id,image_url", { token: session.access_token }),
      request("/rest/v1/faculty?select=id,slug", { token: session.access_token }).catch(() => []),
      request("/rest/v1/videos?select=id,youtube_url", { token: session.access_token }).catch(() => []),
    ]);
    const existingKeys = {
      courses: new Set(existingCourses.map((row) => String(row.slug).toLocaleLowerCase("ko-KR"))),
      notices: new Set(existingNotices.map((row) => String(row.number))),
      slides: new Set(existingSlides.map((row) => String(row.image_url))),
      faculty: new Set(existingFaculty.map((row) => String(row.slug).toLocaleLowerCase("ko-KR"))),
      videos: new Set(existingVideos.map((row) => String(row.youtube_url))),
    };
    const missingContent = {
      courses: (content.courses || []).filter((row) => !existingKeys.courses.has(String(row.slug).toLocaleLowerCase("ko-KR"))),
      notices: (content.notices || []).filter((row) => !existingKeys.notices.has(String(row.number))),
      slides: (content.slides || []).filter((row) => !existingKeys.slides.has(String(row.image_url))),
      faculty: (content.faculty || []).filter((row) => !existingKeys.faculty.has(String(row.slug).toLocaleLowerCase("ko-KR"))),
      videos: (content.videos || []).filter((row) => !existingKeys.videos.has(String(row.youtube_url))),
    };
    const imported = { courses: [], notices: [], slides: [], faculty: [], videos: [], total: 0 };

    for (const entity of ["courses", "notices", "slides", "faculty", "videos"]) {
      if (!missingContent[entity].length) continue;
      imported[entity] = await request(`/rest/v1/${entity}`, {
        method: "POST",
        token: session.access_token,
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(missingContent[entity]),
      });
      imported.total += imported[entity].length;
      if (entity === "notices") {
        await request("/rest/v1/rpc/sync_notice_number_sequence", {
          method: "POST",
          token: session.access_token,
          body: "{}",
        });
      }
    }
    if (!imported.total) throw new Error("기본 데이터가 모두 등록되어 있어 추가할 내용이 없습니다.");
    return imported;
  }

  global.GTCCContentStore = Object.freeze({
    configured,
    loadPublicContent,
    signIn,
    signOut,
    getSession,
    getAdminProfile,
    list,
    insert,
    update,
    softDelete,
    restore,
    listHistory,
    restoreHistory,
    reorderSlides,
    reorderBooks,
    reorderFaculty,
    reorderVideos,
    purgeExpiredTrash,
    uploadMedia,
    importDefaults,
  });
})(window);
