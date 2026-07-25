# GTCC대학교평생교육원 홈페이지 운영 가이드

이 저장소는 별도 빌드 과정 없이 동작하는 정적 HTML/CSS/JavaScript 사이트입니다. 메인 페이지는 `index.html`, 하위 페이지는 `page.html`, 공통 데이터와 화면 생성 로직은 `assets/app.js`, 전체 스타일은 `assets/styles.css`에서 관리합니다.

## 빠른 실행

저장소 폴더에서 아래 명령을 실행합니다.

```powershell
python -m http.server 4173
```

브라우저에서 `http://127.0.0.1:4173/index.html`을 엽니다. 파일을 직접 더블클릭하는 것보다 로컬 서버로 확인해야 링크와 이미지 동작을 정확히 볼 수 있습니다.

## 파일 구조

```text
korea-kca/
├─ index.html                 메인 페이지와 최신 공지 미리보기
├─ page.html                  모든 하위 페이지의 공통 헤더·푸터
├─ mock.html                  예전 mock.html 주소를 page.html로 연결
├─ assets/
│  ├─ app.js                 강좌·공지 데이터, 슬라이드, 하위 페이지 렌더링
│  ├─ styles.css             공통/메인/하위/반응형 스타일
│  ├─ gtcc-logo.png          헤더와 푸터 로고
│  ├─ favicon.*              브라우저 탭 아이콘
│  └─ hero-slides/
│     └─ gtcc-slide-01.webp  메인 히어로 슬라이드 이미지
└─ README.md
```

## 수정 전 기본 원칙

- 텍스트 파일은 `UTF-8`로 저장합니다.
- 다른 팀원의 작업을 덮지 않도록 작업 전 `git status`와 `git pull --rebase`를 확인합니다.
- 강좌명은 강좌 데이터와 해시태그 데이터에서 완전히 동일하게 작성합니다.
- 공통 헤더, 현황 전광판, 푸터는 `index.html`과 `page.html` 양쪽에 있으므로 함께 수정합니다.
- 외부 링크를 바꿀 때 카카오톡, LMS, 자격증 확인 링크가 메인과 하위 페이지에서 모두 열리는지 확인합니다.
- 이미지와 동영상 파일은 저장소 용량을 고려해 최적화한 뒤 추가합니다.

## 메인 슬라이드 이미지 교체 및 추가

슬라이드 원본은 `assets/hero-slides/`에 있습니다.

1. 이미지를 WebP로 변환하고 가로형은 약 1600px, 세로형은 약 1200px 정도로 줄입니다.
2. 품질은 75~85를 권장하며 가능하면 파일당 300KB 이하로 맞춥니다.
3. 파일명을 `gtcc-slide-01.webp`, `gtcc-slide-02.webp`처럼 번호가 끊기지 않게 저장합니다.
4. `assets/app.js` 상단의 슬라이드 개수를 실제 파일 수와 맞춥니다.

```js
const HERO_SLIDES = Array.from(
  { length: 8 }, // 슬라이드가 10장이면 10으로 변경
  (_, index) =>
    `assets/hero-slides/gtcc-slide-${String(index + 1).padStart(2, "0")}.webp`,
);
```

번호가 중간에 빠지면 해당 슬라이드가 깨져 보입니다. 순서는 파일 번호 순서이며, 자동 전환 시간은 `initHeroSlider()` 안의 `3600`(3.6초) 값으로 조정할 수 있습니다. 이전/다음 버튼과 하단 점 버튼은 자동으로 이미지 수에 맞춰 생성됩니다.

`hero-slides` 폴더에 다른 이름의 JPG·PNG 원본을 보관해도 자동으로 노출되지는 않습니다. 화면에 표시하려면 위 파일명 규칙에 맞는 WebP 파일로 변환해 추가해야 합니다.

## 로고와 파비콘 교체

- 메인 로고: `assets/gtcc-logo.png`
- 일반 파비콘: `assets/favicon.png`
- 브라우저 호환 파비콘: `assets/favicon.ico`
- 모바일 홈 화면 아이콘: `assets/favicon-192.png`

같은 파일명으로 교체하면 HTML을 수정하지 않아도 됩니다. 로고는 투명 배경 PNG를 권장하며, 교체 후 강력 새로고침(`Ctrl+F5`)으로 캐시를 비우고 확인합니다.

## 강좌 추가

강좌 원본은 `assets/app.js`의 `courseGroups`입니다. 그룹은 메인 페이지의 노출 행을 뜻합니다.

| 그룹 | 메인 노출 영역 |
|---|---|
| `popular` | GTCC대학교 평생교육원 추천 과정 |
| `new` | 새롭게 열린 자격 과정 |
| `middle` | 다시 시작하는 커리어 과정 |
| `career` | 취업 저격 과정 |
| `pass` | 누구나 도전 과정 |

원하는 그룹 배열에 아래 형식으로 한 줄을 추가합니다.

```js
["새 강좌명 1급", "분야 설명", "photo-1234567890-abcdef"],
```

세 번째 값인 이미지는 다음 세 방식 중 하나를 사용할 수 있습니다.

```js
// Unsplash 사진 ID
["새 강좌명 1급", "분야 설명", "photo-1234567890-abcdef"],

// 저장소 내부 이미지
["새 강좌명 1급", "분야 설명", "assets/course-images/new-course.webp"],

// 외부 이미지 전체 주소
["새 강좌명 1급", "분야 설명", "https://example.com/course.webp"],
```

로컬 강좌 이미지는 `assets/course-images/` 폴더를 만들어 관리하는 것을 권장합니다. 카드 비율은 약 `1.6:1`이므로 800×500px 전후의 WebP 이미지가 적당합니다.

강좌를 추가하면 메인 카드, 전체강좌 목록, 강좌 소개 페이지가 자동으로 생성됩니다. 별도 HTML 페이지를 만들 필요는 없습니다.

## 강좌 해시태그와 필터 추가

`assets/app.js`의 `courseTagMap`에 강좌명과 태그를 추가합니다.

```js
"새 강좌명 1급": ["상담", "청소년"],
```

첫 번째 태그가 `돌봄`, `상담`, `디지털`, `안전`, `문화` 중 하나이면 전체강좌 페이지의 분야 필터에서 노출됩니다. 새로운 대분류를 만들려면 `renderCatalog()` 안의 `categories` 배열에도 같은 이름을 추가합니다.

```js
const categories = ["전체", "돌봄", "상담", "디지털", "안전", "문화", "신규분류"];
```

주의: `courseTagMap`의 키와 `courseGroups`의 강좌명이 띄어쓰기까지 같아야 합니다.

## 강좌 소개 내용 수정

강좌 상세 화면은 `assets/app.js`의 `renderCourseDetail()`에서 만듭니다. 현재 모든 강좌가 같은 커리큘럼 기본 틀을 공유하며, 강좌명·분야·이미지·태그만 강좌 데이터에서 자동으로 가져옵니다.

공통 커리큘럼 문구를 바꾸려면 아래 배열을 수정합니다.

```js
const curriculum = [
  "과정 이해",
  "핵심 이론",
  "현장 사례",
  "실무 체크리스트",
  "평가 대비",
  "자격 발급 안내",
];
```

강좌마다 서로 다른 상세 설명이나 유튜브 영상을 운영하려면 강좌 데이터를 객체 형식으로 확장해야 합니다. 이 경우 카드 렌더러와 상세 렌더러를 함께 수정하고 전체 강좌를 점검하세요.

## 공지사항 추가

공지 목록 원본은 `assets/app.js`의 `noticeRows`입니다. 새 공지는 가장 위에 추가하고 번호는 기존 최댓값보다 크게 지정합니다.

```js
const noticeRows = [
  [17, "[신규 개설] 새 강좌 과정 안내", "GTCC평생교육원", "2026.07.25"],
  // 기존 공지...
];
```

공지 목록과 상세 주소 `page.html?page=notice-17`은 자동 생성됩니다. 현재 상세 본문은 모든 공지에서 공통 안내 문구를 사용하며 `renderNoticeArticle()`에서 수정할 수 있습니다.

메인 페이지의 최신 공지 4개는 자동 생성이 아니므로 `index.html`의 `notice-section`도 함께 수정합니다.

```html
<a href="page.html?page=notice-17">
  <span>[신규 개설] 새 강좌 과정 안내</span>
  <time>2026.07.25</time>
</a>
```

## 현황 전광판 수정

상단 고정 전광판은 `index.html`과 `page.html`의 `stats-band`입니다. 자연스럽게 무한 반복하기 위해 동일한 `stats-set`이 각 파일에 3번 들어 있습니다.

문구를 바꿀 때는 다음 여섯 곳을 모두 같은 내용과 순서로 수정합니다.

- `index.html`의 `stats-set` 3개
- `page.html`의 `stats-set` 3개

속도는 `assets/styles.css`의 `.stats-track`에 있는 `24s`로 조정합니다. 숫자가 작을수록 빠르게 움직입니다.

## 메인 페이지 일반 콘텐츠 수정

`index.html`에서 직접 수정하는 주요 영역은 다음과 같습니다.

- `hero-copy`: 메인 문구와 버튼
- `benefit-grid`: 장학, 온라인 학습, 자격 발급 안내
- `faculty-section`: 교수진
- `review-section`: 수강 후기
- `news-section`: 교육원 소식
- `notice-section`: 최신 공지와 고객센터

강좌 카드 영역은 비어 있는 `data-course-row` 컨테이너만 두고 `assets/app.js`가 채우므로, 카드 내용을 HTML에 직접 추가하지 않습니다.

## 하위 페이지 추가 및 수정

하위 페이지는 모두 `page.html?page=페이지이름` 형식입니다. 실제 분기는 `assets/app.js`의 `renderPage()`에서 처리합니다.

간단한 안내 페이지는 `labels`에 한 줄을 추가하면 됩니다.

```js
const labels = {
  // 기존 항목...
  privacy: ["개인정보처리방침", "개인정보 처리 기준을 안내합니다.", "shield"],
};
```

주소는 `page.html?page=privacy`가 됩니다. 전용 화면이 필요한 경우 `render새페이지()` 함수를 만들고 `renderPage()`의 조건 분기에 연결합니다.

## 헤더, 푸터, 문의 링크 수정

공통 헤더와 푸터 HTML은 `index.html`과 `page.html`에 각각 있습니다. 메뉴명, 로고, LMS 링크, 기관 정보를 변경할 때 두 파일을 함께 수정합니다.

JavaScript로 생성되는 문의 버튼 주소는 `assets/app.js` 상단 상수에서 관리합니다.

```js
const KAKAO_URL = "https://open.kakao.com/o/pfJrLjVh";
const CERTIFICATE_CHECK_URL = "https://www.kcqa.kr/";
```

HTML에 직접 작성된 카카오 링크도 있으므로 주소 변경 시 전체 검색으로 누락을 확인합니다.

```powershell
rg "open.kakao.com|kcqa.kr" .
```

## 디자인 수정

전체 디자인은 `assets/styles.css`에서 관리합니다.

- `:root`: 브랜드 색상, 공통 그림자, 전광판 폭
- `.site-header`, `.main-nav`: 헤더와 메뉴
- `.stats-band`: 상단 전광판
- `.hero-*`: 메인 히어로와 슬라이드
- `.course-*`: 강좌 행, 카드, 상세페이지
- `.sub-hero`, `.content-shell`: 하위 페이지 공통 구조
- `.notice-*`: 공지사항
- `@media (max-width: 980px)`: 태블릿
- `@media (max-width: 620px)`: 모바일

색상을 바꿀 때는 개별 선택자보다 `:root` 변수를 먼저 수정합니다. 모바일 스타일을 추가할 때는 파일 하단의 기존 미디어 쿼리 안에 배치합니다.

## Git 협업 절차

한 기능은 한 브랜치와 한 커밋 단위로 작업하는 것을 권장합니다.

```powershell
git status
git pull --rebase
git switch -c feature/course-name

# 파일 수정 후
git diff
git add README.md assets/app.js
git commit -m "Add course content"
git push -u origin feature/course-name
```

작업 중 다른 팀원의 변경이 들어오면 현재 변경을 먼저 커밋한 뒤 기본 브랜치를 반영합니다.

```powershell
git fetch origin
git rebase origin/main
```

충돌이 나면 두 사람의 내용을 확인해서 직접 합친 뒤 `git add 충돌파일`, `git rebase --continue` 순서로 진행합니다. 공유 브랜치에서 `git push --force`는 사용하지 않습니다.

## 배포 전 체크리스트

- 메인 페이지와 주요 하위 페이지가 모두 열리는가
- 슬라이드 이미지가 깨지지 않고 자동/수동으로 움직이는가
- 새 강좌가 메인, 전체강좌, 상세페이지에 모두 표시되는가
- 해시태그 필터와 검색이 동작하는가
- 새 공지가 목록, 상세, 메인 미리보기에 표시되는가
- 카카오톡, LMS, 자격증 확인 외부 링크가 올바른가
- 데스크톱과 모바일에서 가로 스크롤이나 겹침이 없는가
- 브라우저 개발자 도구 콘솔에 오류가 없는가
- `git status`에 의도하지 않은 파일이 포함되지 않았는가

## 자주 생기는 문제

### 한글이 깨져 보임

파일을 `UTF-8`로 다시 저장하고 `<meta charset="utf-8" />`를 유지합니다. Windows 터미널 출력만 깨지고 브라우저는 정상일 수도 있으므로 브라우저에서 먼저 확인합니다.

### 슬라이드 일부가 빈 화면임

파일 번호가 `01, 02, 03...` 순서로 연속인지, 확장자가 `.webp`인지, `HERO_SLIDES`의 개수가 실제 파일 수와 같은지 확인합니다.

### 강좌 필터에 새 강좌가 안 나옴

`courseTagMap`의 강좌명이 `courseGroups`의 강좌명과 정확히 같은지, 태그가 `categories` 배열에 들어 있는지 확인합니다.

### 수정했는데 브라우저에 반영되지 않음

`Ctrl+F5`로 강력 새로고침합니다. 배포 환경에서도 이전 CSS/JS가 남으면 HTML의 파일 주소에 버전 쿼리를 붙일 수 있습니다.

```html
<link rel="stylesheet" href="assets/styles.css?v=20260725" />
<script src="assets/app.js?v=20260725"></script>
```
