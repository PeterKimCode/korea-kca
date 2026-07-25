// 사이트 전역에서 함께 사용하는 외부 링크입니다. 주소 변경 시 이 상수부터 수정하세요.
const KAKAO_URL = "https://open.kakao.com/o/pfJrLjVh";
const CERTIFICATE_CHECK_URL = "https://www.kcqa.kr/";

// 메인 히어로 슬라이드: gtcc-slide-01.webp부터 번호가 끊기지 않도록 저장하고 개수만 조정합니다.
const HERO_SLIDES = Array.from({ length: 8 }, (_, index) => `assets/hero-slides/gtcc-slide-${String(index + 1).padStart(2, "0")}.webp`);

// 공통 아이콘 원본입니다. 화면에서는 data-icon 속성 또는 icon() 함수로 불러옵니다.
const icons = {
  search:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.35-4.35"/><circle cx="11" cy="11" r="7"/></svg>',
  message:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-8.8 8.4 9.8 9.8 0 0 1-3.7-.7L3 21l1.8-5.1a8.2 8.2 0 0 1-1-4.1A8.4 8.4 0 0 1 12.5 3 8.3 8.3 0 0 1 21 11.5Z"/><path d="M8 10.5h8M8 14h5"/></svg>',
  award:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="m8.5 12.5-1.6 7 5.1-3 5.1 3-1.6-7"/></svg>',
  monitor:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  certificate:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 10h6M9 14h6M9 18h3"/></svg>',
  book:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8"/></svg>',
  play:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/></svg>',
  arrow:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  "arrow-up":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m20 6-11 11-5-5"/></svg>',
  file:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h4M9.5 12h5M9.5 16h5"/></svg>',
  headset:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13a8 8 0 0 1 16 0"/><path d="M4 13v4a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2ZM20 13v4a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2ZM16 19c0 1.2-1.4 2-4 2"/></svg>',
  shield:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v6c0 5-3.2 8-8 9-4.8-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-5"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  layers:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></svg>',
};

/*
 * 메인/전체강좌/상세페이지가 함께 사용하는 강좌 원본입니다.
 * 각 항목 형식: ["강좌명", "분야 설명", "이미지"]
 * 이미지는 Unsplash 사진 ID, assets 내부 경로, 또는 https 전체 주소를 사용할 수 있습니다.
 */
const courseGroups = {
  popular: [
    ["청소년상담", "청소년상담", "photo-1548199973-03cce0bbc87b"],
    ["펫푸드스타일리스트 1급", "반려동물식품전문가", "photo-1548199973-03cce0bbc87b"],
    ["병원상담사", "의료서비스상담전문가", "photo-1576091160550-2173dba999ef"],
    ["커피바리스타전문가", "커피추출실무전문가", "photo-1495474472287-4d71bcdd2085"],
    ["건강관리사", "생활건강관리전문가", "photo-1505576399279-565b52d4ac71"],
    ["간병사", "돌봄서비스전문가", "photo-1584515933487-779824d29309"],
    ["AIST심리상담사", "상담교육", "photo-1551836022-deb4988cc6c0"],
    ["방과후지도사", "아동교육", "photo-1509062522246-3755977927d7"],
    ["노인교육지도사", "시니어교육", "photo-1573497019940-1c28c88b4f3e"],
  ],
  new: [
    ["반려동물관리사 1급", "반려동물복지전문가", "photo-1583337130417-3346a1be7dee"],
    ["유기농 식품관리전문가 1급", "식품안전관리", "photo-1542838132-92c53300491e"],
    ["TESOL(테솔)지도사", "영어전문", "photo-1517841905240-472988babdf9"],
    ["정리수납전문가", "공간컨설팅", "photo-1558618666-fcd25c85cd64"],
    ["문해교육지도사", "성인학습지원", "photo-1513258496099-48168024aec0"],
    ["감정코칭지도사", "정서지원교육", "photo-1491438590914-bc09fcaaf77a"],
    ["재난안전지도사", "생활안전", "photo-1504384308090-c894fdcc538d"],
    ["스피치지도사", "커뮤니케이션", "photo-1475721027785-f74eccf877e2"],
  ],
  middle: [
    ["디지털문서관리사", "교무행정", "photo-1554224155-6726b3ff858f"],
    ["스마트폰활용지도사", "생활디지털교육", "photo-1512428559087-560fa5ceab42"],
    ["홈케어정리전문가", "생활공간관리", "photo-1524758631624-e2822e304c36"],
    ["산림치유상담사", "자연치유", "photo-1441974231531-c6227db76b6e"],
    ["부동산권리분석사", "실무자격", "photo-1560518883-ce09059eeffa"],
    ["실버케어지도사", "돌봄교육", "photo-1573496359142-b8d87734a5a2"],
    ["생활지원사", "복지서비스", "photo-1543269865-cbf427effbad"],
    ["아동요리지도사", "창의교육", "photo-1556911220-bff31c812dba"],
  ],
  career: [
    ["가족관계상담지도사", "가족상담", "photo-1522202176988-66273c2fd55f"],
    ["AI엔지니어링", "AI실무활용", "photo-1677442136019-21780ecad995"],
    ["AI프롬프트전문가", "AI기초역량", "photo-1516321318423-f06f85e504b3"],
    ["방송미디어전문지도사", "콘텐츠마케팅", "photo-1460925895917-afdab827c52f"],
    ["스마트사진콘텐츠지도사", "디지털마케팅", "photo-1611162617213-7d7a39e9b1d7"],
    ["교회행정지도사", "오피스역량", "photo-1450101499163-c8848c66ca85"],
    ["영성코칭전문가", "고객응대", "photo-1556761175-b413da4baf72"],
    ["진로코칭지도사", "커리어코칭", "photo-1552664730-d307ca884978"],
  ],
  pass: [
    ["사역계승지도사", "선교문화교육실무", "photo-1500530855697-b586d89ba3ee"],
    ["국제탐정사", "탐정업무", "photo-1497366811353-6870744d04b2"],
    ["민간탐정사", "민간탐정업무", "photo-1551836022-deb4988cc6c0"],
    ["사도영성상담지도사", "사도영성상담", "photo-1517841905240-472988babdf9"],
    ["민간안전지도사", "안전교육", "photo-1507537297725-24a1c029d3ca"],
    ["학교폭력예방상담사", "청소년상담", "photo-1529390079861-591de354faf5"],
    ["AI미술심리상담사", "예술상담", "photo-1513364776144-60967b0f800f"],
    ["AI협업지도사", "디지털교육", "photo-1515879218367-8466d910aaa4"],
  ],
};

// 공지사항 목록 원본입니다. 형식: [번호, 제목, 작성자, "YYYY.MM.DD"]
// 메인 화면의 최신 공지 4개는 index.html에도 있으므로 새 공지 등록 시 함께 갱신합니다.
const noticeRows = [
  [16, "[신규 개설] TESOL(테솔) 과정안내", "GTCC평생교육원", "2026.07.13"],
  [15, "[신규 개설] 커피바리스타 과정안내", "GTCC평생교육원", "2026.07.03"],
  [14, "[신규 개설] 국제탐정사 과정안내", "GTCC평생교육원", "2026.06.19"],
  [13, "[신규 개설] 민간안전 경비사 과정안내", "GTCC평생교육원", "2026.06.12"],
  [12, "[신규 개설] 붙임머리전문가 1급 과정 안내", "GTCC평생교육원", "2026.06.08"],
  [11, "[신규 개설] 유기농식품교육전문가 1급 과정 안내", "GTCC평생교육원", "2026.05.18"],
  [10, "[신규 개설] 가족공예지도사 1급 과정 안내", "GTCC평생교육원", "2026.04.24"],
  [9, "[신규 개설] 발효효소관리사 1급 과정 안내", "GTCC평생교육원", "2026.04.22"],
  [8, "[신규 개설] 민간안전경비사 1급 과정 안내", "GTCC평생교육원", "2026.04.15"],
  [7, "[신규 개설] 스마트스토어마케팅전문가 1급 과정 안내", "GTCC평생교육원", "2026.04.14"],
];

const flatCourses = Object.values(courseGroups).flat();

// 전체강좌 필터에 사용하는 해시태그입니다. 키는 courseGroups의 강좌명과 정확히 같아야 합니다.
const courseTagMap = {
  "청소년상담": ["상담", "정서"],
  "펫푸드스타일리스트 1급": ["돌봄", "반려동물"],
  "병원상담사": ["상담", "의료서비스"],
  "커피바리스타전문가 1급": ["문화", "식음료"],
  "건강관리사": ["돌봄", "건강"],
  "간병사": ["돌봄", "복지"],
  "심리상담사 1급": ["상담", "심리"],
  "방과후지도사": ["문화", "아동교육"],
  "노인교육지도사": ["돌봄", "시니어"],
  "반려동물관리사 1급": ["돌봄", "반려동물"],
  "유기농 식품관리전문가 1급": ["안전", "식품"],
  "가족문화상담사 1급": ["상담", "가족"],
  "정리수납전문가": ["문화", "생활"],
  "문해교육지도사": ["문화", "교육"],
  "감정코칭지도사": ["상담", "정서"],
  "재난안전지도사": ["안전", "생활안전"],
  "스피치지도사": ["문화", "커뮤니케이션"],
  "디지털문서관리사": ["디지털", "행정"],
  "스마트폰활용지도사": ["디지털", "생활"],
  "홈케어정리전문가": ["돌봄", "공간관리"],
  "산림치유상담사": ["상담", "자연치유"],
  "부동산권리분석사": ["문화", "실무"],
  "실버케어지도사": ["돌봄", "시니어"],
  "생활지원사": ["돌봄", "복지"],
  "아동요리지도사": ["문화", "아동교육"],
  "독서지도사 1급": ["문화", "아동교육"],
  "챗GPT활용가 1급": ["디지털", "AI"],
  "인공지능(AI)전문가 1급": ["디지털", "AI"],
  "광고기획전문가 1급": ["디지털", "마케팅"],
  "SNS마케팅전문가": ["디지털", "마케팅"],
  "문서실무전문가": ["디지털", "오피스"],
  "CS강사 1급": ["상담", "고객응대"],
  "진로코칭지도사": ["상담", "커리어"],
  "한국문화전문가 1급": ["문화", "교육"],
  "컴퓨터활용가 1급": ["디지털", "업무자동화"],
  "커리어상담가 1급": ["상담", "진로"],
  "명상지도사 1급": ["상담", "마음건강"],
  "안전교육지도사": ["안전", "교육"],
  "학교폭력예방상담사": ["상담", "청소년"],
  "미술심리상담사": ["상담", "예술"],
  "코딩지도사": ["디지털", "교육"],
};

function icon(name) {
  return `<span class="icon">${icons[name] || icons.book}</span>`;
}

function initializeIcons(scope = document) {
  scope.querySelectorAll("[data-icon]").forEach((node) => {
    node.classList.add("icon");
    node.innerHTML = icons[node.dataset.icon] || icons.book;
  });
}

function initHeroSlider() {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider || slider.dataset.ready === "true") return;
  slider.dataset.ready = "true";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  slider.innerHTML = `
    <div class="hero-slide-stage">
      ${HERO_SLIDES.map((src, index) => `<img class="hero-slide ${index === 0 ? "is-active" : ""}" src="${src}" alt="GTCC평생교육원 과정 이미지 ${index + 1}" ${index === 0 ? "" : "loading=\"lazy\""} />`).join("")}
    </div>
    <div class="hero-slide-caption">
      <span>GTCC Programs</span>
      <strong>전문 자격 과정 이미지</strong>
      <small>자동 · 수동 슬라이드</small>
    </div>
    <div class="hero-slide-controls" aria-label="슬라이드 조작">
      <button type="button" class="hero-slide-control is-prev" data-slide-prev aria-label="이전 이미지">${icons.arrow}</button>
      <div class="hero-slide-dots">
        ${HERO_SLIDES.map((_, index) => `<button type="button" class="${index === 0 ? "is-active" : ""}" data-slide-dot="${index}" aria-label="${index + 1}번 이미지 보기"></button>`).join("")}
      </div>
      <button type="button" class="hero-slide-control" data-slide-next aria-label="다음 이미지">${icons.arrow}</button>
    </div>
    <div class="hero-slide-progress"><span></span></div>
  `;
  const slides = slider.querySelectorAll(".hero-slide");
  const dots = slider.querySelectorAll("[data-slide-dot]");
  const progress = slider.querySelector(".hero-slide-progress span");
  let active = 0;
  let timer = null;

  function restartProgress() {
    if (!progress) return;
    progress.style.animation = "none";
    progress.offsetHeight;
    progress.style.animation = "";
  }

  function showSlide(next) {
    slides[active].classList.remove("is-active");
    dots[active].classList.remove("is-active");
    active = (next + slides.length) % slides.length;
    slides[active].classList.add("is-active");
    dots[active].classList.add("is-active");
    restartProgress();
  }

  function startAuto() {
    if (prefersReducedMotion) return;
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(active + 1), 3600);
  }

  slider.querySelector("[data-slide-prev]").addEventListener("click", () => {
    showSlide(active - 1);
    startAuto();
  });
  slider.querySelector("[data-slide-next]").addEventListener("click", () => {
    showSlide(active + 1);
    startAuto();
  });
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.slideDot));
      startAuto();
    });
  });
  startAuto();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^\w가-힣]+/g, "-")
    .replace(/^-|-$/g, "");
}

function courseHref(title) {
  return `page.html?page=course-${encodeURIComponent(slugify(title))}`;
}

function getCourseTags(title, category = "") {
  return courseTagMap[title] || [category.replace(/전문가|전문|교육|관리/g, "").slice(0, 4) || "자격"];
}

function getCourseByTitle(title) {
  return flatCourses.find(([courseTitle]) => courseTitle === title);
}

// 짧은 값은 Unsplash 사진 ID로, 경로나 전체 URL은 그대로 이미지 주소로 사용합니다.
function courseImageUrl(imageSource, width = 520) {
  if (/^(https?:\/\/|\.{0,2}\/|assets\/)/.test(imageSource)) return imageSource;
  return `https://images.unsplash.com/${imageSource}?auto=format&fit=crop&w=${width}&q=80`;
}

function tagMarkup(tags) {
  return `<div class="course-tags">${tags.map((tag) => `<span>#${tag}</span>`).join("")}</div>`;
}

function createCourseCard([title, category, imageId]) {
  const tags = getCourseTags(title, category);
  return `
    <article class="course-card" data-href="${courseHref(title)}" role="link" tabindex="0" draggable="false">
      <img src="${courseImageUrl(imageId)}" alt="${title}" loading="lazy" draggable="false" />
      <span>${category}</span>
      <strong>${title}</strong>
      ${tagMarkup(tags)}
      <small>수강기간 4주 · 온라인시험</small>
      <em>장학지원</em>
    </article>
  `;
}

function bindCourseCardNavigation(scope = document) {
  scope.querySelectorAll(".course-card[data-href]").forEach((card) => {
    if (card.dataset.bound === "true") return;
    card.dataset.bound = "true";
    let pointerStart = null;
    const navigate = () => {
      window.location.href = card.dataset.href;
    };
    card.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      pointerStart = { x: event.clientX, y: event.clientY };
    });
    card.addEventListener("pointerup", (event) => {
      if (!pointerStart) return;
      const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
      pointerStart = null;
      if (moved <= 10) navigate();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      navigate();
    });
  });
}

function enableDragScroll(row) {
  // 카드 클릭과 가로 드래그를 구분해, 드래그 도중 상세페이지로 이동하지 않게 합니다.
  let isDragging = false;
  let didMove = false;
  let startX = 0;
  let startScrollLeft = 0;

  function startDrag(clientX) {
    isDragging = true;
    didMove = false;
    startX = clientX;
    startScrollLeft = row.scrollLeft;
    row.classList.add("is-grabbing");
  }

  function moveDrag(clientX) {
    if (!isDragging) return;
    const distance = clientX - startX;
    if (Math.abs(distance) > 4) didMove = true;
    row.scrollLeft = startScrollLeft - distance;
  }

  function finishDrag() {
    if (!isDragging) return;
    isDragging = false;
    row.classList.remove("is-grabbing");
  }

  row.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    startDrag(event.clientX);
  });
  row.addEventListener("pointermove", (event) => {
    moveDrag(event.clientX);
    if (isDragging) event.preventDefault();
  });
  row.addEventListener("pointerup", (event) => {
    finishDrag();
  });
  row.addEventListener("pointercancel", finishDrag);
  row.addEventListener("dragstart", (event) => event.preventDefault());
  row.addEventListener("click", (event) => {
    if (!didMove) return;
    event.preventDefault();
    event.stopPropagation();
    didMove = false;
  }, true);
}

function initHomeCourseRows() {
  for (const [key, courses] of Object.entries(courseGroups)) {
    const row = document.querySelector(`[data-course-row="${key}"]`);
    if (!row) continue;
    row.innerHTML = courses.map(createCourseCard).join("");
    bindCourseCardNavigation(row);
    enableDragScroll(row);
  }
}

function getParams() {
  return new URLSearchParams(window.location.search);
}

function courseTitleFromPage(page) {
  const slug = decodeURIComponent(page.replace(/^course-/, ""));
  const found = flatCourses.find(([title]) => slugify(title) === slug);
  return found ? found[0] : slug.split("-").filter(Boolean).join(" ");
}

function setActiveNav(page) {
  const group = page.startsWith("course-") || page === "all-courses" || page === "search" ? "all-courses"
    : page.startsWith("notice") ? "notice"
    : ["course-question", "delivery-question", "payment-question", "group-question", "faq", "one-to-one", "support"].includes(page) ? "support"
    : page === "certificates" || page === "certificate-guide" ? "certificates"
    : page === "scholarship" ? "scholarship"
    : "";
  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.nav === group);
  });
}

function pageHero(title, eyebrow, text) {
  return `
    <section class="sub-hero">
      <div>
        <span class="eyebrow">${eyebrow}</span>
        <h1>${title}</h1>
        <p>${text}</p>
      </div>
      <nav aria-label="현재 위치">
        <a href="index.html">홈</a>
        <span>/</span>
        <strong>${title}</strong>
      </nav>
    </section>
  `;
}

function renderCatalog(query = "", categoryParam = "") {
  // category 쿼리와 courseTagMap을 대조해 해당 태그의 강좌만 표시합니다.
  const normalized = query.trim().toLowerCase();
  const selectedCategory = categoryParam || "전체";
  const categories = ["전체", "돌봄", "상담", "디지털", "안전", "문화"];
  const courses = flatCourses.filter(([title, category]) => {
    const tags = getCourseTags(title, category);
    const searchable = `${title} ${category} ${tags.join(" ")}`.toLowerCase();
    const matchesQuery = normalized ? searchable.includes(normalized) : true;
    const matchesCategory = selectedCategory === "전체" ? true : tags.includes(selectedCategory);
    return matchesQuery && matchesCategory;
  });
  return `
    ${pageHero(normalized ? "검색 결과" : "전체강좌", "Course Catalog", normalized ? `"${query}"에 해당하는 과정을 확인하세요.` : "관심 분야별 온라인 자격 과정을 한눈에 확인하세요.")}
    <section class="catalog-shell">
      <div class="catalog-filter">
        ${categories.map((item) => {
          const href = item === "전체" ? "page.html?page=all-courses" : `page.html?page=all-courses&category=${encodeURIComponent(item)}`;
          return `<a class="${item === selectedCategory ? "is-active" : ""}" href="${href}">#${item}</a>`;
        }).join("")}
      </div>
      <div class="catalog-grid">
        ${courses.length ? courses.map(createCourseCard).join("") : `<p class="catalog-empty">해당 조건의 과정이 없습니다. 다른 분야를 선택해 주세요.</p>`}
      </div>
    </section>
  `;
}

function renderCourseDetail(title) {
  const course = getCourseByTitle(title) || [title, "온라인 자격 과정", "photo-1552664730-d307ca884978"];
  const [courseTitle, category, imageId] = course;
  const tags = getCourseTags(courseTitle, category);
  const curriculum = ["과정 이해", "핵심 이론", "현장 사례", "실무 체크리스트", "평가 대비", "자격 발급 안내"];
  return `
    <section class="course-detail-shell">
      <article class="course-intro-hero">
        <div class="course-intro-copy">
          <span class="eyebrow">${category}</span>
          <h1>${courseTitle}</h1>
          <p>기초 개념부터 현장에서 바로 쓰는 실무 흐름까지 4주 안에 정리하는 온라인 자격 과정입니다.</p>
          ${tagMarkup(tags)}
          <div class="hero-actions">
            <a class="primary-btn" href="${KAKAO_URL}" target="_blank" rel="noopener">${icon("message")} 수강 상담</a>
            <a class="ghost-btn" href="page.html?page=certificates">${icon("certificate")} 발급 절차</a>
          </div>
        </div>
        <img src="${courseImageUrl(imageId, 960)}" alt="${courseTitle} 과정 이미지" />
      </article>

      <div class="course-intro-grid">
        <section class="intro-main">
          <div class="intro-block">
            <span>Course Overview</span>
            <h2>이런 분께 추천합니다</h2>
            <p>관련 분야 입문자, 재취업을 준비하는 학습자, 현재 업무에 자격 기반 역량을 더하고 싶은 분들이 부담 없이 시작할 수 있도록 구성했습니다.</p>
          </div>
          <div class="course-outline">
            <h2>과정 구성</h2>
            <ol>
              ${curriculum.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><strong>${item}</strong><p>${courseTitle} 학습에 필요한 핵심 내용을 단계별로 확인합니다.</p></li>`).join("")}
            </ol>
          </div>
        </section>

        <aside class="intro-side">
          <div class="course-summary">
            <article>${icon("clock")}<strong>학습기간</strong><span>4주 온라인 수강</span></article>
            <article>${icon("monitor")}<strong>평가방식</strong><span>온라인 시험</span></article>
            <article>${icon("certificate")}<strong>수료혜택</strong><span>자격 발급 안내</span></article>
          </div>
          <div class="contact-panel compact-panel">
            ${icon("headset")}
            <h2>과정 선택이 고민되시나요?</h2>
            <p>학습 목적과 일정에 맞는 과정을 카카오톡으로 상담받을 수 있습니다.</p>
            <a class="primary-btn" href="${KAKAO_URL}" target="_blank" rel="noopener">${icon("message")} 고객센터 문의</a>
          </div>
        </aside>
      </div>
    </section>
  `;
}

function renderCertificates() {
  return `
    ${pageHero("자격증 발급신청", "Certificate", "수료와 시험 기준 충족 후 자격증 발급 절차를 확인하고 신청하세요.")}
    <section class="content-shell two-column">
      <div class="process-list">
        ${[
          ["수료 기준 확인", "LMS를 통한 강의 출석률과 시험 점수를 확인합니다."],
          ["발급 신청서 작성", "이름, 연락처, 배송 정보를 정확히 입력합니다."],
          ["발급비 결제", "과정별 발급 비용 및 배송 정책을 확인합니다."],
          ["제작 및 배송", "접수 후 제작이 진행되며 배송 상태를 안내합니다."],
        ].map((item, index) => `<article><span>${index + 1}</span><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join("")}
      </div>
      <aside class="contact-panel">
        ${icon("certificate")}
        <h2>발급된 모든자격증을 온라인을 통하여 확인하실수 있습니다.</h2>
        <p>자격증확인에 들어가셔서 본인의 이름과 전화번호를 치시면 발급받은 자격증을 확인하실수 있으며 재발급도 받으실수 있습니다.</p>
        <div class="contact-actions">
          <a class="primary-btn" href="${KAKAO_URL}" target="_blank" rel="noopener">${icon("message")} 고객센터 문의</a>
          <a class="ghost-btn" href="${CERTIFICATE_CHECK_URL}" target="_blank" rel="noopener">${icon("shield")} 자격증 확인</a>
        </div>
      </aside>
    </section>
  `;
}

function renderScholarship() {
  return `
    ${pageHero("장학혜택", "Scholarship", "대상 과정과 기간에 따라 수강료 지원 및 학습 혜택을 제공합니다.")}
    <section class="content-shell benefit-list">
      ${[
        ["수강료 지원", "선정 과정은 장학 혜택가로 수강할 수 있습니다.", "award"],
        ["교안 제공", "시험 준비에 필요한 핵심 교안과 예상문제를 제공합니다.", "book"],
        ["학습 상담", "과정 선택과 학습 일정 상담을 카카오톡으로 지원합니다.", "message"],
      ].map(([title, text, name]) => `<article>${icon(name)}<h2>${title}</h2><p>${text}</p></article>`).join("")}
    </section>
  `;
}

function renderSupport() {
  return `
    ${pageHero("고객센터", "Support", "수강, 자격증 발급, 결제, 단체수강 문의를 안내합니다.")}
    <section class="support-shell">
      <aside class="customer-sidebar">
        <h2>고객센터</h2>
        <p>평일 09:00 - 18:00<br />토·일·공휴일 휴무</p>
        <strong>010-5909-9320</strong>
        <a class="primary-btn" href="${KAKAO_URL}" target="_blank" rel="noopener">${icon("message")} 고객센터 문의</a>
      </aside>
      <div class="support-grid">
        ${[
          ["수강관련문의", "수강 신청, 학습기간, 진도율 확인"],
          ["자격증배송문의", "발급 신청, 제작, 배송 상태 확인"],
          ["입금/결제문의", "결제 확인, 영수증, 환불 기준 안내"],
          ["단체수강문의", "기관·기업 단체 과정 운영 상담"],
          ["자주묻는질문", "학습자가 자주 묻는 질문 모음"],
          ["원격지원", "학습 환경 점검 및 오류 확인"],
        ].map(([title, text]) => `<a href="${KAKAO_URL}" target="_blank" rel="noopener">${icon("headset")}<h3>${title}</h3><p>${text}</p></a>`).join("")}
      </div>
    </section>
  `;
}

function renderNotice() {
  return `
    <section class="notice-board-shell">
      <aside class="customer-sidebar">
        <h1>고객센터</h1>
        <p>안녕하세요.<br />GTCC대학교 평생교육원입니다.</p>
        <a class="primary-btn" href="${KAKAO_URL}" target="_blank" rel="noopener">${icon("message")} 고객센터 문의</a>
        <nav>
          <a class="is-active" href="page.html?page=notice">${icon("check")} 공지사항</a>
          <a href="${KAKAO_URL}" target="_blank" rel="noopener">수강관련문의</a>
          <a href="${KAKAO_URL}" target="_blank" rel="noopener">자격증배송문의</a>
          <a href="${KAKAO_URL}" target="_blank" rel="noopener">입금/결제문의</a>
          <a href="page.html?page=faq">자주묻는질문</a>
        </nav>
      </aside>
      <section class="notice-board-content">
        <div class="board-title-row">
          <h2>공지사항</h2>
          <div class="board-line"></div>
          <nav><a href="index.html">홈</a><span>/</span><strong>공지사항</strong></nav>
        </div>
        <p class="board-count">공지사항 16건이 있습니다.</p>
        <div class="notice-table-wrap">
          <table class="notice-table">
            <thead><tr><th>번호</th><th>제목</th><th>작성자</th><th>작성일</th></tr></thead>
            <tbody>
              ${noticeRows.map(([number, title, writer, date]) => `<tr><td>${number}</td><td><a href="page.html?page=notice-${number}">${title}</a></td><td>${writer}</td><td>${date}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="board-pagination"><strong>1</strong><a href="page.html?page=notice-2">2</a><a href="page.html?page=notice-2">${icon("arrow")}</a></div>
      </section>
    </section>
  `;
}

function renderNoticeArticle(page) {
  const number = Number(page.replace("notice-", ""));
  const row = noticeRows.find(([id]) => id === number) || noticeRows[0];
  return `
    ${pageHero("공지사항", "Notice", "GTCC대학교 평생교육원의 과정 및 운영 안내입니다.")}
    <section class="article-shell">
      <h2>${row[1]}</h2>
      <dl><div><dt>작성자</dt><dd>${row[2]}</dd></div><div><dt>작성일</dt><dd>${row[3]}</dd></div></dl>
      <p>해당 과정의 수강 신청, 학습자료, 시험 응시, 자격증 발급 안내가 업데이트되었습니다. 자세한 상담이 필요하신 경우 고객센터 문의 버튼을 이용해 주세요.</p>
      <a class="primary-btn" href="${KAKAO_URL}" target="_blank" rel="noopener">${icon("message")} 고객센터 문의</a>
    </section>
  `;
}

function renderSimplePage(title, text, iconName = "book") {
  return `
    ${pageHero(title, "GTCC", text)}
    <section class="content-shell simple-page">
      <article>${icon(iconName)}<h2>${title}</h2><p>${text}</p><a class="primary-btn" href="${KAKAO_URL}" target="_blank" rel="noopener">${icon("message")} 고객센터 문의</a></article>
    </section>
  `;
}

function renderPage() {
  // page.html?page=... 값을 실제 하위 페이지 렌더러에 연결하는 중앙 라우터입니다.
  const mount = document.getElementById("pageMount");
  if (!mount) return;
  const params = getParams();
  const page = params.get("page") || "all-courses";
  const query = params.get("q") || "";
  const category = params.get("category") || "";
  setActiveNav(page);

  let title = "GTCC대학교 평생교육원";
  let html = "";
  if (page.startsWith("course-")) {
    const courseTitle = courseTitleFromPage(page);
    title = `${courseTitle} | GTCC대학교 평생교육원`;
    html = renderCourseDetail(courseTitle);
  } else if (page === "all-courses") {
    title = "전체강좌 | GTCC대학교 평생교육원";
    html = renderCatalog("", category);
  } else if (page === "search") {
    title = "검색 결과 | GTCC대학교 평생교육원";
    html = renderCatalog(query, category);
  } else if (page === "certificates") {
    title = "자격증 발급신청 | GTCC대학교 평생교육원";
    html = renderCertificates();
  } else if (page === "scholarship") {
    title = "장학혜택 | GTCC대학교 평생교육원";
    html = renderScholarship();
  } else if (page === "support") {
    title = "고객센터 | GTCC대학교 평생교육원";
    html = renderSupport();
  } else if (page === "notice") {
    title = "공지사항 | GTCC대학교 평생교육원";
    html = renderNotice();
  } else if (page.startsWith("notice-")) {
    title = "공지사항 | GTCC대학교 평생교육원";
    html = renderNoticeArticle(page);
  } else {
    const labels = {
      faq: ["자주 묻는 질문", "학습 환경, 시험 응시, 자격증 발급 관련 질문을 정리했습니다.", "headset"],
      "course-guide": ["수강안내", "신청부터 학습, 시험 응시까지의 기본 절차를 안내합니다.", "monitor"],
      "certificate-guide": ["자격증 발급안내", "수료 후 자격증 신청과 배송 절차를 안내합니다.", "certificate"],
      instructors: ["전문 교수진", "분야별 실무 경험을 바탕으로 구성된 강사진을 소개합니다.", "layers"],
      "sample-lecture": ["샘플 강의", "과정 선택 전 온라인 강의 흐름을 미리 확인할 수 있습니다.", "play"],
      lms: ["LMS", "등록한 과정의 학습 현황, 시험 응시, 수료 정보를 확인하는 학습자 전용 공간입니다.", "monitor"],
    };
    const [pageTitle, text, name] = labels[page] || ["서비스 안내", "해당 메뉴의 상세 콘텐츠를 준비했습니다. 필요한 내용은 고객센터로 문의해 주세요.", "book"];
    title = `${pageTitle} | GTCC대학교 평생교육원`;
    html = renderSimplePage(pageTitle, text, name);
  }
  document.title = title;
  mount.innerHTML = html;
  initializeIcons(mount);
  bindCourseCardNavigation(mount);
}

// index.html과 page.html이 같은 스크립트를 사용하므로, 존재하는 영역만 선택적으로 초기화합니다.
initializeIcons();
initHeroSlider();
initHomeCourseRows();
renderPage();
