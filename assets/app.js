const courseGroups = {
  popular: [
    ["펫푸드스타일리스트 1급", "반려동물식품전문가", "photo-1548199973-03cce0bbc87b"],
    ["병원상담사", "의료서비스상담전문가", "photo-1576091160550-2173dba999ef"],
    ["커피바리스타전문가 1급", "커피추출실무전문가", "photo-1495474472287-4d71bcdd2085"],
    ["건강관리사", "생활건강관리전문가", "photo-1505576399279-565b52d4ac71"],
    ["간병사", "돌봄서비스전문가", "photo-1584515933487-779824d29309"],
    ["심리상담사 1급", "상담교육", "photo-1551836022-deb4988cc6c0"],
    ["방과후지도사", "아동교육", "photo-1509062522246-3755977927d7"],
    ["노인교육지도사", "시니어교육", "photo-1573497019940-1c28c88b4f3e"]
  ],
  new: [
    ["반려동물관리사 1급", "반려동물복지전문가", "photo-1583337130417-3346a1be7dee"],
    ["유기농 식품관리전문가 1급", "식품안전관리", "photo-1542838132-92c53300491e"],
    ["가족문화상담사 1급", "관계회복상담", "photo-1517841905240-472988babdf9"],
    ["정리수납전문가", "공간컨설팅", "photo-1558618666-fcd25c85cd64"],
    ["문해교육지도사", "성인학습지원", "photo-1513258496099-48168024aec0"],
    ["감정코칭지도사", "정서지원교육", "photo-1491438590914-bc09fcaaf77a"],
    ["재난안전지도사", "생활안전", "photo-1504384308090-c894fdcc538d"],
    ["스피치지도사", "커뮤니케이션", "photo-1475721027785-f74eccf877e2"]
  ],
  middle: [
    ["디지털문서관리사", "교무행정", "photo-1554224155-6726b3ff858f"],
    ["스마트폰활용지도사", "생활디지털교육", "photo-1512428559087-560fa5ceab42"],
    ["홈케어정리전문가", "생활공간관리", "photo-1524758631624-e2822e304c36"],
    ["산림치유상담사", "자연치유", "photo-1441974231531-c6227db76b6e"],
    ["부동산권리분석사", "실무자격", "photo-1560518883-ce09059eeffa"],
    ["실버케어지도사", "돌봄교육", "photo-1573496359142-b8d87734a5a2"],
    ["생활지원사", "복지서비스", "photo-1543269865-cbf427effbad"],
    ["아동요리지도사", "창의교육", "photo-1556911220-bff31c812dba"]
  ],
  career: [
    ["독서지도사 1급", "아동독서코칭", "photo-1522202176988-66273c2fd55f"],
    ["챗GPT활용가 1급", "AI실무활용", "photo-1677442136019-21780ecad995"],
    ["인공지능(AI)전문가 1급", "AI기초역량", "photo-1516321318423-f06f85e504b3"],
    ["광고기획전문가 1급", "콘텐츠마케팅", "photo-1460925895917-afdab827c52f"],
    ["SNS마케팅전문가", "디지털마케팅", "photo-1611162617213-7d7a39e9b1d7"],
    ["문서실무전문가", "오피스역량", "photo-1450101499163-c8848c66ca85"],
    ["CS강사 1급", "고객응대", "photo-1556761175-b413da4baf72"],
    ["진로코칭지도사", "커리어코칭", "photo-1552664730-d307ca884978"]
  ],
  pass: [
    ["한국문화전문가 1급", "문화교육실무", "photo-1500530855697-b586d89ba3ee"],
    ["컴퓨터활용가 1급", "업무자동화", "photo-1497366811353-6870744d04b2"],
    ["커리어상담가 1급", "진로상담", "photo-1551836022-deb4988cc6c0"],
    ["명상지도사 1급", "마음건강지도", "photo-1517841905240-472988babdf9"],
    ["안전교육지도사", "안전교육", "photo-1507537297725-24a1c029d3ca"],
    ["학교폭력예방상담사", "청소년상담", "photo-1529390079861-591de354faf5"],
    ["미술심리상담사", "예술상담", "photo-1513364776144-60967b0f800f"],
    ["코딩지도사", "디지털교육", "photo-1515879218367-8466d910aaa4"]
  ]
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^\w가-힣]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createCourseCard([title, category, imageId]) {
  const slug = slugify(title);
  const href = `mock.html?page=course-${encodeURIComponent(slug)}`;
  return `
    <a class="course-card" href="${href}" draggable="false">
      <img src="https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=520&q=80" alt="${title}" loading="lazy" draggable="false" />
      <span>${category}</span>
      <strong>${title}</strong>
      <small>수강기간 4주 · 온라인시험</small>
      <em>100% 할인</em>
    </a>
  `;
}

for (const [key, courses] of Object.entries(courseGroups)) {
  const row = document.querySelector(`[data-course-row="${key}"]`);
  if (row) {
    row.innerHTML = courses.map(createCourseCard).join("");
    enableDragScroll(row);
  }
}

function enableDragScroll(row) {
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
    event.preventDefault();
    startDrag(event.clientX);
    row.setPointerCapture(event.pointerId);
  });

  row.addEventListener("pointermove", (event) => {
    moveDrag(event.clientX);
    if (!isDragging) return;
    event.preventDefault();
  });

  function endDrag(event) {
    finishDrag();
    if (row.hasPointerCapture(event.pointerId)) row.releasePointerCapture(event.pointerId);
  }

  row.addEventListener("pointerup", endDrag);
  row.addEventListener("pointercancel", endDrag);
  row.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
  row.addEventListener("mousedown", (event) => {
    if (event.button !== 0 || isDragging) return;
    startDrag(event.clientX);
    event.preventDefault();
  });
  window.addEventListener("mousemove", (event) => {
    if (!isDragging) return;
    moveDrag(event.clientX);
    event.preventDefault();
  });
  window.addEventListener("mouseup", finishDrag);
  row.addEventListener(
    "click",
    (event) => {
      if (!didMove) return;
      event.preventDefault();
      event.stopPropagation();
      didMove = false;
    },
    true
  );
}
