# GTCC 관리자 최초 연결 가이드

이 문서는 개발 담당자가 **처음 한 번만** 진행합니다. 연결이 끝나면 운영자는 GitHub나 코드를 열지 않고 `홈페이지주소/admin/`에서 강좌, 공지, 슬라이드를 관리합니다.

## 1. Supabase 프로젝트 만들기

1. [Supabase](https://supabase.com/)에 로그인하고 `New project`를 누릅니다.
2. 프로젝트 이름과 데이터베이스 비밀번호를 정한 뒤 프로젝트 생성을 기다립니다.
3. 왼쪽 `SQL Editor`에서 `New query`를 누릅니다.
4. 이 저장소의 `supabase/schema.sql` 전체 내용을 붙여 넣고 `Run`을 누릅니다.

이 SQL은 콘텐츠 표, 변경 기록, 30일 휴지통, 이미지 저장소와 관리자 보안 규칙을 한 번에 만듭니다.

## 2. 관리자 계정 두 개 만들기

1. Supabase 왼쪽 `Authentication` → `Users`로 이동합니다.
2. `Add user` → `Create new user`를 눌러 본인 계정을 만듭니다.
3. 같은 방법으로 아버님 계정을 따로 만듭니다.
4. 두 사용자의 `User UID`를 각각 복사합니다.
5. `SQL Editor`에서 아래 문장의 UID와 이름을 바꿔 실행합니다.

```sql
insert into public.admin_users(user_id, display_name)
values
  ('첫-번째-사용자-UID', '운영자'),
  ('두-번째-사용자-UID', '관리자');
```

계정은 서로 공유하지 않는 것을 권장합니다. 누가 내용을 바꿨는지 변경 기록에서 구분할 수 있습니다.

## 3. 홈페이지와 Supabase 연결하기

1. Supabase 왼쪽 `Project Settings` → `API`로 이동합니다.
2. `Project URL`과 `anon public key`를 복사합니다.
3. `assets/config.js`의 따옴표 안에 각각 붙여 넣습니다.

```js
window.GTCC_SUPABASE_CONFIG = Object.freeze({
  url: "https://프로젝트주소.supabase.co",
  anonKey: "공개-anon-key",
});
```

`service_role` 키는 절대로 브라우저 코드나 GitHub에 넣지 않습니다. 이 사이트에는 공개용 `anon` 키만 사용하며, 실제 쓰기 권한은 로그인과 RLS 정책이 검사합니다.

## 4. GitHub Pages에 배포하기

설정 파일을 포함한 변경을 커밋하고 `main`에 푸시합니다. GitHub Pages 배포가 끝난 뒤 아래 주소를 엽니다.

```text
https://PeterKimCode.github.io/korea-kca/admin/
```

로그인 화면이 표시되면 연결이 완료된 것입니다.

## 5. 기존 홈페이지 내용 가져오기

1. 관리자 화면에 로그인합니다.
2. 상단의 `기본 내용 가져오기`를 누릅니다.
3. 확인 창에서 승인합니다.

현재 저장소의 강좌, 공지, 슬라이드 중 아직 등록되지 않은 항목만 Supabase로 복사됩니다. 관리자가 직접 만든 강좌와 기존 수정 내용은 그대로 유지되며, 같은 기본 데이터는 중복 등록되지 않습니다.

## 보안 확인

- 로그인하지 않은 방문자는 공개된 콘텐츠만 읽을 수 있습니다.
- `admin_users`에 등록되지 않은 계정은 로그인해도 수정할 수 없습니다.
- 공지 본문은 일반 글과 줄바꿈만 저장하며 HTML을 실행하지 않습니다.
- 사진은 JPG, PNG, WebP만 받고 5MB 이하로 제한합니다.
- 삭제한 내용은 30일간 휴지통에 보관됩니다. 관리자가 접속하면 30일이 지난 항목을 정리합니다.
- 두 관리자가 같은 항목을 동시에 고치면 나중 저장을 막고 새로고침 안내를 표시합니다.

## 문제 해결

### 관리자 연결이 필요하다는 화면이 나옴

`assets/config.js`의 URL과 anon key가 비어 있거나 잘못되었습니다. Project URL은 `https://...supabase.co` 형식이어야 합니다.

### 로그인은 되지만 다시 로그인 화면으로 돌아감

해당 사용자의 UID가 `public.admin_users`에 등록되었는지 확인합니다.

```sql
select * from public.admin_users;
```

### 사진 업로드가 실패함

`supabase/schema.sql`을 끝까지 실행했는지, Storage에 `site-media` 버킷이 생성되었는지 확인합니다. 파일은 5MB 이하 JPG, PNG, WebP여야 합니다.

### 홈페이지에 새 내용이 바로 안 보임

강좌·공지·슬라이드의 `홈페이지에 공개`가 켜져 있는지 확인하고 브라우저를 새로고침합니다. Supabase 장애가 있으면 방문자에게 마지막 정상 데이터 또는 저장소 기본 콘텐츠가 표시됩니다.
