export const websiteSections = [
  { key: "main-images", title: "메인·대표 이미지", requiredCount: 6 },
  { key: "product-images", title: "제품 이미지", requiredCount: 4 },
  { key: "intro-videos", title: "소개영상", requiredCount: 3 },
  { key: "performance-tests", title: "성능 시험", requiredCount: 3 },
  { key: "performance-videos", title: "성능 시연 영상", requiredCount: 6 },
  { key: "documents", title: "기술자료·PDF", requiredCount: 4 },
  { key: "catalog", title: "카탈로그", requiredCount: 1 },
  { key: "company", title: "회사·공장", requiredCount: 1 },
  { key: "site-settings", title: "사이트 기본정보", requiredCount: 1 },
] as const;

export const mainImageSlots = [
  { key: "heroDesktop", label: "Hero 데스크톱 이미지", ratio: "16:9", width: 1920, height: 1080, description: "홈페이지 첫 화면의 데스크톱 대표 이미지" },
  { key: "heroMobile", label: "Hero 모바일 이미지", ratio: "4:5", width: 1080, height: 1350, description: "모바일 첫 화면의 대표 이미지" },
  { key: "overview", label: "제품 개요 이미지", ratio: "4:3", width: 1200, height: 900, description: "제품 소개 영역에 표시되는 이미지" },
  { key: "verification", label: "성능 시험 대표 이미지", ratio: "4:3", width: 1200, height: 900, description: "성능 시험 영역에 표시되는 이미지" },
  { key: "verificationReport", label: "시험성적서 대표 썸네일", ratio: "A4", width: 900, height: 1273, description: "시험성적서 미리보기 이미지" },
  { key: "carbonStatement", label: "탄소발자국 검증 성명서 썸네일", ratio: "A4", width: 900, height: 1273, description: "환경 데이터 검증서 미리보기 이미지" },
] as const;

export function getWebsiteSection(key: string) {
  return websiteSections.find((section) => section.key === key);
}
