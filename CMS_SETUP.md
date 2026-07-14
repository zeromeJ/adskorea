# ADS 아델슨 콘텐츠 CMS 설정

문의 관리자 앱과 콘텐츠 CMS는 역할이 분리되어 있습니다.

- Flutter 관리자 앱: 문의, 상태, 담당자, 회신과 관리자 메모
- Sanity Studio (`/studio`): 홈페이지 문구, 제품, 미디어, 시험자료, 문서, 카탈로그와 노출 상태

## 1. 런타임

Node.js 22.12 이상을 사용합니다. `.nvmrc`가 포함되어 있으므로 nvm 사용 시 `nvm use`로 맞출 수 있습니다.

## 2. Sanity 프로젝트 연결

Sanity에서 프로젝트와 `production` dataset을 생성한 뒤 다음 환경변수를 로컬과 배포 환경에 등록합니다.

```env
NEXT_PUBLIC_SANITY_PROJECT_ID="프로젝트_ID"
NEXT_PUBLIC_SANITY_DATASET="production"
```

환경변수가 없으면 공개 사이트는 코드에 포함된 검증 데이터로 빌드되고, `/studio`는 실제 Content Lake에 연결되지 않습니다.

## 3. CORS

Sanity 관리 화면에서 다음 origin을 credentials 허용 상태로 등록합니다.

- `http://localhost:3000`
- 실제 운영 도메인

## 4. 실행

```bash
npm run dev
```

- 공개 사이트: `http://localhost:3000`
- 콘텐츠 CMS: `http://localhost:3000/studio`

별도 Studio 개발 서버가 필요하면 `npm run studio`를 사용합니다.

## 5. 공개 규칙

- 제품·영상·문서·사례·공장 이미지는 `active`가 켜진 항목만 조회합니다.
- 카탈로그는 `active`, `featured`, `publicDownload`가 모두 켜진 최신 카드 1개만 노출합니다.
- 문서 파일이 없으면 다운로드 버튼이 활성화되지 않습니다.
- 시험 영상에는 적용 제품, 시료 규격, 시험 주체와 주의문구를 입력해야 합니다.
- 미디어가 없으면 개발 화면에는 CMS field key가 표시되며 운영 화면에는 field key가 숨겨집니다.

## 6. 콘텐츠 점검

Studio의 `대시보드 경고` 메뉴에서 다음 항목을 확인할 수 있습니다.

- 시험조건·썸네일 누락 영상
- 관련 시험성적서 없는 영상
- 공개 중이지만 파일 없는 문서
- 적용모델 없는 시험자료

## 7. 문의 DB

`20260715090000_add_b2b_inquiry_conditions` 마이그레이션은 다음 조건을 문의 DB에 추가합니다.

- 화물 종류
- 팔레트당 화물중량
- 필요한 팔레트 규격
- 랙 적재 여부
- 자동화 설비 사용 여부
- 지게차 사용 여부
- 핸드파레트트럭 사용 여부

기존 문의 데이터 호환을 위해 DB 컬럼은 nullable이며, 새 웹 문의에서는 핵심 화물 조건을 필수 검증합니다.
