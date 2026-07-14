export const inquiryTypes = [
  {
    value: "product",
    label: "제품 정보 문의",
    description: "제품 특징, 사양, 적용 가능 여부 및 시험·인증 자료 문의",
  },
  {
    value: "quote",
    label: "견적 요청",
    description: "제품 규격, 수량, 납품 지역 및 가격 문의",
  },
  {
    value: "consulting",
    label: "적용·주문제작 상담",
    description: "화물 조건, 랙·자동화 설비, 비규격 제품 및 맞춤 제작 상담",
  },
  {
    value: "other",
    label: "자료·기타 문의",
    description: "카탈로그, 시험성적서, 유통·파트너십 및 기타 문의",
  },
] as const;

export type InquiryType = (typeof inquiryTypes)[number]["value"];

export type ContactFormData = {
  inquiryType: InquiryType | "";
  companyName: string;
  contactPerson: string;
  department: string;
  email: string;
  phone: string;
  responseMethod: "EMAIL" | "PHONE" | "TEXT" | "ANY";
  industry: string;
  productInterest: string;
  estimatedQuantity: string;
  message: string;
  details: Record<string, string>;
  privacyAgreed: boolean;
  website: string;
};

export const initialContactFormData: ContactFormData = {
  inquiryType: "",
  companyName: "",
  contactPerson: "",
  department: "",
  email: "",
  phone: "",
  responseMethod: "ANY",
  industry: "",
  productInterest: "",
  estimatedQuantity: "",
  message: "",
  details: {},
  privacyAgreed: false,
  website: "",
};

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string) {
  if (!/^\+?[0-9()\-\s]+$/.test(phone.trim())) return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export function submitLabel(inquiryType: ContactFormData["inquiryType"]) {
  if (inquiryType === "quote") return "견적 요청";
  if (inquiryType === "consulting") return "적용 상담 요청";
  return "문의 접수";
}

export function inquiryTypeLabel(value: string) {
  return inquiryTypes.find((item) => item.value === value)?.label ?? value;
}

export function validateContactForm(data: ContactFormData) {
  if (!data.inquiryType) return "문의 유형을 선택해 주세요.";
  if (!data.companyName.trim()) return "회사명을 입력해 주세요.";
  if (!data.contactPerson.trim()) return "담당자명을 입력해 주세요.";
  if (!data.phone.trim()) return "연락처를 입력해 주세요.";
  if (!isValidPhone(data.phone)) return "올바른 전화번호 형식으로 입력해 주세요. 국가번호도 입력할 수 있습니다.";
  if (!data.email.trim()) return "이메일을 입력해 주세요.";
  if (!isValidEmail(data.email)) return "올바른 이메일 형식을 입력해 주세요.";
  if (!data.responseMethod) return "회신 방법을 선택해 주세요.";
  if (data.message.trim() && data.message.trim().length < 10) return "문의 내용을 입력하는 경우 10자 이상 작성해 주세요.";
  if (data.message.length > 1500) return "문의 내용은 최대 1,500자까지 입력해 주세요.";

  if (data.inquiryType === "quote") {
    if (!data.productInterest) return "관심 제품 또는 제품군을 선택해 주세요.";
    if (!data.details.requiredPalletSize?.trim()) return "필요한 팔레트 규격을 입력해 주세요.";
    if (!data.estimatedQuantity.trim()) return "예상 주문수량을 입력해 주세요.";
    if (!data.details.deliveryRegion?.trim()) return "납품 희망 지역 또는 국가를 입력해 주세요.";
  }

  if (!data.privacyAgreed) return "개인정보 수집 및 이용에 동의해 주세요.";
  return "";
}
