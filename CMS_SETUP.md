# ADS 아델슨 홈페이지 콘텐츠 관리

홈페이지 콘텐츠는 별도 외부 CMS 없이 기존 관리자 앱과 PostgreSQL DB, Supabase Storage로 관리합니다.

## 관리자 사용 방법

1. 아델슨 관리자 앱에 로그인합니다.
2. 좌측 메뉴에서 `홈페이지 관리`를 선택합니다.
3. 수정할 영역의 `관리하기`를 누릅니다.
4. 파일 선택 후 고정 비율 프레임 안에서 위치·확대·회전을 조정하고 `적용`을 누릅니다.
5. 화면 하단의 `변경사항 저장`을 눌러야 홈페이지에 반영됩니다.

적용만 누른 상태에서는 앱 안의 임시 미리보기만 바뀌며 공개 홈페이지는 유지됩니다. 저장하지 않고 화면을 나가면 확인창이 표시됩니다.

## 서버 설정

다음 환경변수가 필요합니다.

```env
DATABASE_URL="..."
DIRECT_URL="..."
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_CONTENT_BUCKET="website-content"
```

`website-content` 버킷은 최초 업로드 시 서버가 공개 버킷으로 생성합니다. 업로드 API는 관리자 Bearer 토큰 인증 없이는 사용할 수 없습니다.

## DB 적용

```bash
npx prisma migrate deploy
```

변경 이력에는 관리자, 시각, 섹션, 이전 데이터와 새 데이터가 기록됩니다. 최근 30건은 홈페이지 관리 API에서 조회합니다.
