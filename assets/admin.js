(function initializeGTCCAdmin() {
  "use strict";

  const store = window.GTCCContentStore;
  const entityLabels = {
    courses: { title: "강좌 관리", description: "홈페이지에 표시할 강좌를 추가하거나 수정합니다.", add: "새 강좌 추가", singular: "강좌" },
    notices: { title: "공지 관리", description: "새 소식과 과정 안내를 등록합니다.", add: "새 공지 추가", singular: "공지" },
    slides: { title: "슬라이드 관리", description: "메인 화면의 사진과 표시 순서를 관리합니다.", add: "새 슬라이드 추가", singular: "슬라이드" },
  };
  const state = {
    entity: "courses",
    items: [],
    deleted: false,
    editing: null,
    optimizedImage: null,
    imagePreviewUrl: "",
  };

  const elements = {
    setupScreen: document.getElementById("setupScreen"),
    loginScreen: document.getElementById("loginScreen"),
    adminApp: document.getElementById("adminApp"),
    loginForm: document.getElementById("loginForm"),
    loginError: document.getElementById("loginError"),
    adminName: document.getElementById("adminName"),
    sectionTitle: document.getElementById("sectionTitle"),
    sectionDescription: document.getElementById("sectionDescription"),
    newButton: document.getElementById("newButton"),
    trashButton: document.getElementById("trashButton"),
    historyButton: document.getElementById("historyButton"),
    importButton: document.getElementById("importButton"),
    listSearch: document.getElementById("listSearch"),
    dataStatus: document.getElementById("dataStatus"),
    contentList: document.getElementById("contentList"),
    editorDialog: document.getElementById("editorDialog"),
    editorForm: document.getElementById("editorForm"),
    editorTitle: document.getElementById("editorTitle"),
    editorFields: document.getElementById("editorFields"),
    previewButton: document.getElementById("previewButton"),
    previewDialog: document.getElementById("previewDialog"),
    previewContent: document.getElementById("previewContent"),
    historyDialog: document.getElementById("historyDialog"),
    historyList: document.getElementById("historyList"),
    helpDialog: document.getElementById("helpDialog"),
    toast: document.getElementById("toast"),
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^\w가-힣]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function normalizeTags(value) {
    const seen = new Set();
    return String(value || "")
      .split(",")
      .map((tag) => tag.trim().replace(/^#+/, "").trim())
      .filter((tag) => {
        const key = tag.toLocaleLowerCase("ko-KR");
        if (!tag || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function formatDate(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: value.includes("T") ? "short" : undefined }).format(new Date(value));
  }

  function displayImageUrl(value) {
    const url = String(value || "");
    if (!url || /^(https?:|blob:|data:|\/)/i.test(url)) return url;
    return `../${url.replace(/^\.?\//, "")}`;
  }

  function showToast(message, error = false) {
    elements.toast.textContent = message;
    elements.toast.classList.toggle("is-error", error);
    elements.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 3200);
  }

  function setScreen(name) {
    elements.setupScreen.hidden = name !== "setup";
    elements.loginScreen.hidden = name !== "login";
    elements.adminApp.hidden = name !== "app";
  }

  async function loadItems() {
    elements.dataStatus.textContent = "내용을 불러오는 중입니다...";
    elements.contentList.innerHTML = '<div class="loading-state">잠시만 기다려 주세요.</div>';
    try {
      state.items = await store.list(state.entity, { deleted: state.deleted });
      renderList();
      if (state.deleted) {
        elements.dataStatus.textContent = `휴지통에 ${state.items.length}개가 있습니다.`;
      } else {
        const publishedCount = state.items.filter((item) => item.published).length;
        elements.dataStatus.textContent = `현재 ${state.items.length}개가 등록되어 있고 ${publishedCount}개가 홈페이지에 공개 중입니다.`;
        if (state.items.length && publishedCount === 0) {
          elements.dataStatus.textContent += " 수정 화면에서 '홈페이지에 공개'를 확인해 주세요.";
        }
      }
    } catch (error) {
      elements.contentList.innerHTML = `<div class="empty-state">내용을 불러오지 못했습니다.<br />${escapeHtml(error.message)}</div>`;
      elements.dataStatus.textContent = "";
    }
  }

  function renderList() {
    const query = elements.listSearch.value.trim().toLowerCase();
    const items = state.items.filter((item) => {
      const text = `${item.title || ""} ${item.alt_text || ""} ${item.category || ""}`.toLowerCase();
      return !query || text.includes(query);
    });
    if (!items.length) {
      elements.contentList.innerHTML = `<div class="empty-state">${state.deleted ? "휴지통이 비어 있습니다." : "등록된 내용이 없습니다.<br />위의 새로 추가 버튼을 눌러 시작하세요."}</div>`;
      return;
    }
    elements.contentList.innerHTML = items.map((item) => listItemMarkup(item)).join("");
  }

  function listItemMarkup(item) {
    const title = item.title || item.alt_text;
    const image = state.entity === "notices" ? "" : `<img src="${escapeHtml(displayImageUrl(item.image_url))}" alt="" />`;
    let description = "";
    let meta = "";
    if (state.entity === "courses") {
      description = item.summary || `${item.category} 과정`;
      meta = [item.category, ...(item.tags || [])].map((value) => `<span>${escapeHtml(value)}</span>`).join("");
    } else if (state.entity === "notices") {
      description = `${item.author} · ${formatDate(item.published_at)}`;
      meta = `<span>공지번호 ${item.number || "자동"}</span>`;
    } else {
      description = `표시 순서 ${Number(item.sort_order || 0) + 1}`;
    }
    const reorder = state.entity === "slides" && !state.deleted
      ? `<button class="admin-secondary" type="button" data-move="-1" data-id="${item.id}">위로</button><button class="admin-secondary" type="button" data-move="1" data-id="${item.id}">아래로</button>`
      : "";
    const actions = state.deleted
      ? `<button class="admin-primary" type="button" data-restore="${item.id}">복구하기</button>`
      : `${reorder}<button class="admin-secondary" type="button" data-edit="${item.id}">수정</button><button class="admin-danger" type="button" data-delete="${item.id}">삭제</button>`;
    return `
      <article class="admin-list-item ${state.entity === "notices" ? "no-image" : ""}">
        ${image}
        <div class="item-copy">
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(description)}</p>
          <div class="item-meta"><span class="publish-status ${item.published ? "is-live" : ""}">${item.published ? "공개 중" : "비공개"}</span>${meta}</div>
        </div>
        <div class="item-actions">${actions}</div>
      </article>
    `;
  }

  function updateSectionHeader() {
    const labels = entityLabels[state.entity];
    elements.sectionTitle.textContent = state.deleted ? `${labels.singular} 휴지통` : labels.title;
    elements.sectionDescription.textContent = state.deleted ? "삭제한 내용을 30일 안에 복구할 수 있습니다." : labels.description;
    elements.newButton.textContent = labels.add;
    elements.newButton.hidden = state.deleted;
    elements.trashButton.textContent = state.deleted ? "목록으로 돌아가기" : "휴지통";
  }

  function field(label, name, value = "", options = {}) {
    const classes = `admin-field ${options.full ? "full" : ""}`;
    const required = options.required ? "required" : "";
    const help = options.help ? `<small>${escapeHtml(options.help)}</small>` : "";
    if (options.type === "textarea") {
      return `<label class="${classes}">${label}<textarea name="${name}" ${required}>${escapeHtml(value)}</textarea>${help}</label>`;
    }
    if (options.type === "select") {
      return `<label class="${classes}">${label}<select name="${name}" ${required}>${options.options.map(([optionValue, text]) => `<option value="${escapeHtml(optionValue)}" ${optionValue === value ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}</select>${help}</label>`;
    }
    return `<label class="${classes}">${label}<input type="${options.type || "text"}" name="${name}" value="${escapeHtml(value)}" ${required} ${options.accept ? `accept="${options.accept}"` : ""} />${help}</label>`;
  }

  function imageField(item) {
    const current = displayImageUrl(item?.image_url);
    return `
      <label class="admin-field full">사진
        <div class="image-picker">
          <img id="editorImagePreview" src="${escapeHtml(current)}" alt="선택한 사진 미리보기" />
          <div>
            <input id="imageInput" type="file" name="image_file" accept="image/jpeg,image/png,image/webp" ${item ? "" : "required"} />
            <small>JPG, PNG, WebP · 최대 5MB<br />선택하면 자동으로 WebP와 적절한 크기로 바뀝니다.</small>
          </div>
        </div>
      </label>
    `;
  }

  function openEditor(item = null) {
    state.editing = item;
    state.optimizedImage = null;
    state.imagePreviewUrl = item?.image_url || "";
    const labels = entityLabels[state.entity];
    elements.editorTitle.textContent = item ? `${labels.singular} 수정` : labels.add;
    const today = new Date().toISOString().slice(0, 10);
    if (state.entity === "courses") {
      elements.editorFields.innerHTML = `
        <div class="admin-form-grid">
          ${field("강좌명", "title", item?.title, { required: true })}
          ${field("분야 설명", "category", item?.category, { required: true, help: "예: 상담교육, 외국어교육" })}
          ${field("메인 노출 위치", "group_key", item?.group_key || "popular", { type: "select", required: true, options: [["popular", "추천 과정"], ["new", "신규 과정"], ["middle", "다시 시작하는 과정"], ["career", "취업·커리어 과정"], ["pass", "누구나 도전 과정"]] })}
          ${field("해시태그", "tags", (item?.tags || []).join(", "), { required: true, help: "쉼표로 구분합니다. 예: 상담, 청소년" })}
          ${field("강좌 소개", "summary", item?.summary, { type: "textarea", full: true, required: true })}
          ${field("과정 구성", "curriculum", (item?.curriculum || []).join("\n"), { type: "textarea", full: true, required: true, help: "한 줄에 한 항목씩 입력합니다." })}
          ${field("수강 기간", "duration", item?.duration || "4주", { required: true })}
          ${field("시험 방식", "exam_type", item?.exam_type || "온라인시험", { required: true })}
          ${field("혜택 표시", "benefit_label", item?.benefit_label || "장학지원", { required: true })}
          ${imageField(item)}
          <label class="admin-field full"><span class="check-field"><input type="checkbox" name="published" ${item?.published !== false ? "checked" : ""} /> 홈페이지에 공개</span></label>
        </div>
      `;
    } else if (state.entity === "notices") {
      elements.editorFields.innerHTML = `
        <div class="admin-form-grid">
          ${field("공지 제목", "title", item?.title, { full: true, required: true })}
          ${field("공지 내용", "body", item?.body, { type: "textarea", full: true, required: true, help: "줄바꿈은 홈페이지에도 그대로 표시됩니다." })}
          ${field("작성자", "author", item?.author || "GTCC대학교평생교육원", { required: true })}
          ${field("게시일", "published_at", item?.published_at || today, { type: "date", required: true })}
          <label class="admin-field full"><span class="check-field"><input type="checkbox" name="published" ${item?.published !== false ? "checked" : ""} /> 홈페이지에 공개</span></label>
        </div>
      `;
    } else {
      elements.editorFields.innerHTML = `
        <div class="admin-form-grid">
          ${field("사진 설명", "alt_text", item?.alt_text, { full: true, required: true, help: "예: GTCC 민간안전지도사 과정 안내 이미지" })}
          ${imageField(item)}
          <label class="admin-field full"><span class="check-field"><input type="checkbox" name="published" ${item?.published !== false ? "checked" : ""} /> 홈페이지에 공개</span></label>
        </div>
      `;
    }
    bindImageInput();
    elements.editorDialog.showModal();
  }

  function bindImageInput() {
    const input = document.getElementById("imageInput");
    if (!input) return;
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        state.optimizedImage = await optimizeImage(file);
        if (state.imagePreviewUrl.startsWith("blob:")) URL.revokeObjectURL(state.imagePreviewUrl);
        state.imagePreviewUrl = URL.createObjectURL(state.optimizedImage);
        document.getElementById("editorImagePreview").src = state.imagePreviewUrl;
        showToast(`사진을 최적화했습니다. ${Math.round(state.optimizedImage.size / 1024)}KB`);
      } catch (error) {
        input.value = "";
        state.optimizedImage = null;
        showToast(error.message, true);
      }
    });
  }

  async function optimizeImage(file) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("JPG, PNG, WebP 사진만 선택할 수 있습니다.");
    if (file.size > 5 * 1024 * 1024) throw new Error("사진 크기는 5MB 이하여야 합니다.");
    const image = await loadImageSource(file);
    const maxWidth = 1600;
    const scale = Math.min(1, maxWidth / image.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext("2d").drawImage(image.source, 0, 0, canvas.width, canvas.height);
    image.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!blob) throw new Error("사진을 변환하지 못했습니다.");
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
  }

  async function loadImageSource(file) {
    if ("createImageBitmap" in window) {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(objectUrl),
    };
  }

  function valuesFromForm() {
    const data = new FormData(elements.editorForm);
    if (state.entity === "courses") {
      return {
        slug: slugify(data.get("title")),
        title: String(data.get("title")).trim(),
        category: String(data.get("category")).trim(),
        group_key: data.get("group_key"),
        tags: normalizeTags(data.get("tags")),
        summary: String(data.get("summary")).trim(),
        curriculum: String(data.get("curriculum")).split("\n").map((line) => line.trim()).filter(Boolean),
        duration: String(data.get("duration")).trim(),
        exam_type: String(data.get("exam_type")).trim(),
        benefit_label: String(data.get("benefit_label")).trim(),
        published: data.get("published") === "on",
      };
    }
    if (state.entity === "notices") {
      return {
        title: String(data.get("title")).trim(),
        body: String(data.get("body")).trim(),
        author: String(data.get("author")).trim(),
        published_at: data.get("published_at"),
        published: data.get("published") === "on",
      };
    }
    return {
      alt_text: String(data.get("alt_text")).trim(),
      published: data.get("published") === "on",
    };
  }

  function showPreview() {
    if (!elements.editorForm.reportValidity()) return;
    const values = valuesFromForm();
    const image = state.imagePreviewUrl;
    if (state.entity === "courses") {
      elements.previewContent.innerHTML = `<article class="preview-card">${image ? `<img src="${escapeHtml(image)}" alt="" />` : ""}<div><span class="admin-kicker">${escapeHtml(values.category)}</span><h3>${escapeHtml(values.title)}</h3><p>${escapeHtml(values.summary)}</p><p>${values.tags.map((tag) => `#${escapeHtml(tag)}`).join(" ")}</p></div></article>`;
    } else if (state.entity === "notices") {
      elements.previewContent.innerHTML = `<article class="preview-card"><div><span class="admin-kicker">${escapeHtml(values.published_at)}</span><h3>${escapeHtml(values.title)}</h3><p>${escapeHtml(values.body).replaceAll("\n", "<br />")}</p><p>${escapeHtml(values.author)}</p></div></article>`;
    } else {
      elements.previewContent.innerHTML = `<article class="preview-card">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(values.alt_text)}" />` : ""}<div><h3>${escapeHtml(values.alt_text)}</h3></div></article>`;
    }
    elements.previewDialog.showModal();
  }

  async function saveEditor(event) {
    event.preventDefault();
    if (!elements.editorForm.reportValidity()) return;
    if (!state.editing && state.entity !== "notices" && !state.optimizedImage) {
      showToast("사진을 먼저 선택해 주세요.", true);
      return;
    }
    if (!window.confirm("입력한 내용을 저장하고 홈페이지에 바로 공개할까요?")) return;
    const submitButton = elements.editorForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "저장 중...";
    try {
      const values = valuesFromForm();
      if (state.optimizedImage) {
        const folder = state.entity === "slides" ? "slides" : "courses";
        values.image_url = await store.uploadMedia(state.optimizedImage, folder, state.optimizedImage.name);
      } else if (state.editing?.image_url) {
        values.image_url = state.editing.image_url;
      }
      if (!state.editing) {
        // 공지에는 정렬 번호가 없으므로 강좌와 슬라이드에만 순서를 부여합니다.
        if (state.entity !== "notices") {
          values.sort_order = state.items.length ? Math.max(...state.items.map((item) => Number(item.sort_order || 0))) + 10 : 0;
        }
        await store.insert(state.entity, values);
      } else {
        await store.update(state.entity, state.editing.id, values, state.editing.updated_at);
      }
      elements.editorDialog.close();
      showToast("저장했습니다. 홈페이지에 바로 반영됩니다.");
      await loadItems();
    } catch (error) {
      showToast(error.message, true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "저장하고 바로 공개";
    }
  }

  async function deleteItem(item) {
    if (!window.confirm(`"${item.title || item.alt_text}"을(를) 휴지통으로 옮길까요?`)) return;
    try {
      await store.softDelete(state.entity, item);
      showToast("휴지통으로 옮겼습니다. 30일 안에 복구할 수 있습니다.");
      await loadItems();
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function restoreItem(item) {
    try {
      await store.restore(state.entity, item);
      showToast("내용을 복구하고 다시 공개했습니다.");
      await loadItems();
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function moveSlide(item, direction) {
    const index = state.items.findIndex((row) => row.id === item.id);
    const target = index + direction;
    if (target < 0 || target >= state.items.length) return;
    const reordered = [...state.items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    try {
      // 서버 함수 한 번으로 전체 순서를 바꿔 중간 저장 실패를 방지합니다.
      state.items = await store.reorderSlides(reordered.map((row) => row.id));
      renderList();
      showToast("슬라이드 순서를 변경했습니다.");
    } catch (error) {
      showToast(error.message, true);
      await loadItems();
    }
  }

  async function openHistory() {
    elements.historyList.innerHTML = '<div class="loading-state">변경 기록을 불러오는 중입니다.</div>';
    elements.historyDialog.showModal();
    try {
      const rows = await store.listHistory();
      if (!rows.length) {
        elements.historyList.innerHTML = '<div class="empty-state">아직 변경 기록이 없습니다.</div>';
        return;
      }
      const actionLabels = { insert: "새로 추가", update: "수정", delete: "삭제", restore: "복구" };
      const entityNames = { courses: "강좌", notices: "공지", slides: "슬라이드" };
      elements.historyList.innerHTML = rows.map((row) => {
        const snapshot = row.after_data || row.before_data || {};
        const name = snapshot.title || snapshot.alt_text || "콘텐츠";
        return `<article class="history-item"><div><strong>${entityNames[row.entity_type]} · ${actionLabels[row.action]} · ${escapeHtml(name)}</strong><span>${formatDate(row.created_at)}</span></div><button class="admin-secondary" type="button" data-history-restore="${row.id}">이 시점으로 복구</button></article>`;
      }).join("");
    } catch (error) {
      elements.historyList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
  }

  async function restoreHistory(id) {
    if (!window.confirm("선택한 변경 전 상태로 되돌릴까요? 현재 상태도 변경 기록에 남습니다.")) return;
    try {
      await store.restoreHistory(Number(id));
      elements.historyDialog.close();
      showToast("선택한 시점의 내용으로 복구했습니다.");
      await loadItems();
    } catch (error) {
      showToast(error.message, true);
    }
  }

  function bindEvents() {
    elements.loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = elements.loginForm.querySelector("button");
      button.disabled = true;
      elements.loginError.textContent = "";
      try {
        const data = new FormData(elements.loginForm);
        const result = await store.signIn(String(data.get("email")).trim(), String(data.get("password")));
        elements.adminName.textContent = result.profile.display_name;
        setScreen("app");
        await store.purgeExpiredTrash().catch(() => null);
        await loadItems();
      } catch (error) {
        elements.loginError.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
    document.getElementById("logoutButton").addEventListener("click", async () => {
      await store.signOut();
      setScreen("login");
    });
    document.querySelectorAll("[data-entity]").forEach((button) => {
      button.addEventListener("click", async () => {
        state.entity = button.dataset.entity;
        state.deleted = false;
        document.querySelectorAll("[data-entity]").forEach((node) => node.classList.toggle("is-active", node === button));
        updateSectionHeader();
        await loadItems();
      });
    });
    elements.newButton.addEventListener("click", () => openEditor());
    elements.trashButton.addEventListener("click", async () => {
      state.deleted = !state.deleted;
      updateSectionHeader();
      await loadItems();
    });
    elements.listSearch.addEventListener("input", renderList);
    elements.previewButton.addEventListener("click", showPreview);
    elements.editorForm.addEventListener("submit", saveEditor);
    elements.historyButton.addEventListener("click", openHistory);
    document.getElementById("helpButton").addEventListener("click", () => elements.helpDialog.showModal());
    elements.importButton.addEventListener("click", async () => {
      if (!window.confirm("현재 홈페이지의 기본 강좌, 공지, 슬라이드 내용을 관리자 서버로 가져올까요? 최초 한 번만 실행합니다.")) return;
      try {
        await store.importDefaults(window.GTCC_DEFAULT_CONTENT);
        showToast("기본 내용을 가져왔습니다.");
        await loadItems();
      } catch (error) {
        showToast(error.message, true);
      }
    });
    elements.contentList.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const id = button.dataset.edit || button.dataset.delete || button.dataset.restore || button.dataset.id;
      const item = state.items.find((row) => row.id === id);
      if (!item) return;
      if (button.dataset.edit) openEditor(item);
      if (button.dataset.delete) deleteItem(item);
      if (button.dataset.restore) restoreItem(item);
      if (button.dataset.move) moveSlide(item, Number(button.dataset.move));
    });
    elements.historyList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-history-restore]");
      if (button) restoreHistory(button.dataset.historyRestore);
    });
    document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => elements.editorDialog.close()));
    document.querySelectorAll("[data-close-preview]").forEach((button) => button.addEventListener("click", () => elements.previewDialog.close()));
    document.querySelectorAll("[data-close-history]").forEach((button) => button.addEventListener("click", () => elements.historyDialog.close()));
    document.querySelectorAll("[data-close-help]").forEach((button) => button.addEventListener("click", () => elements.helpDialog.close()));
  }

  async function start() {
    bindEvents();
    updateSectionHeader();
    if (!store?.configured) {
      setScreen("setup");
      return;
    }
    const session = await store.getSession();
    if (!session) {
      setScreen("login");
      return;
    }
    try {
      const profile = await store.getAdminProfile();
      if (!profile) throw new Error("관리자 권한이 없습니다.");
      elements.adminName.textContent = profile.display_name;
      setScreen("app");
      await store.purgeExpiredTrash().catch(() => null);
      await loadItems();
    } catch {
      await store.signOut();
      setScreen("login");
    }
  }

  start();
})();
