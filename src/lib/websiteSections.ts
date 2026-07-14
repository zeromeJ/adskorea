export const websiteSections = [
  { key: "home", title: "홈", requiredCount: 2 },
  { key: "product-overview", title: "제품 소개", requiredCount: 3 },
  { key: "performance", title: "성능·기술", requiredCount: 12 },
  { key: "product-lineup", title: "제품 라인업", requiredCount: 4 },
  { key: "applications", title: "적용 분야", requiredCount: 0 },
  { key: "environment", title: "환경 데이터", requiredCount: 1 },
  { key: "company", title: "회사·생산", requiredCount: 3 },
  { key: "site-settings", title: "사이트 기본정보", requiredCount: 1 },
] as const;

export const mainImageSlots = [
  { key: "heroDesktop", label: "Hero 대표 이미지", ratio: "16:9 / 4:5 자동 생성", width: 1920, height: 1080, description: "한 장으로 PC와 모바일 Hero 이미지를 자동 생성" },
  { key: "overview", label: "제품 개요 이미지", ratio: "4:3", width: 1200, height: 900, description: "제품 소개 영역에 표시되는 이미지" },
  { key: "verification", label: "성능 시험 대표 이미지", ratio: "4:3", width: 1200, height: 900, description: "성능 시험 영역에 표시되는 이미지" },
  { key: "verificationReport", label: "시험성적서 대표 썸네일", ratio: "A4", width: 900, height: 1273, description: "시험성적서 미리보기 이미지" },
  { key: "carbonStatement", label: "탄소발자국 검증 성명서 썸네일", ratio: "A4", width: 900, height: 1273, description: "환경 데이터 검증서 미리보기 이미지" },
] as const;

export function getWebsiteSection(key: string) {
  return websiteSections.find((section) => section.key === key);
}
