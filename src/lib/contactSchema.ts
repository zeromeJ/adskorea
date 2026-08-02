export const inquiryTypes = [
  {
    value: "product",
    label: "제품 문의",
    description: "제품 특징, 사양, 적용 가능 여부 및 시험·인증 자료 문의",
  },
  {
    value: "quote",
    label: "견적 요청",
    description: "제품 규격, 수량, 납품 지역 및 가격 문의",
  },
  {
    value: "consulting",
    label: "적용 검토",
    description: "화물 조건, 랙·자동화 설비와 실제 적용 가능성 검토",
  },
  {
    value: "custom",
    label: "맞춤 제작",
    description: "비규격 제품, 금형과 특수 구조의 설계 가능성 상담",
  },
  {
    value: "technical",
    label: "기술자료 요청",
    description: "시험성적서, 검증 성명서와 공식 등록문서 확인 요청",
  },
  {
    value: "other",
    label: "기타",
    description: "유통·파트너십 및 기타 문의",
  },
] as const;

export type InquiryType = (typeof inquiryTypes)[number]["value"];

export const palletSizeOptions = [
  "1200 × 1000 × 130mm",
  "1000 × 1000 × 145mm",
  "1100 × 1100 × 145mm",
] as const;

export const unknownPalletSizeOption = "잘 모르겠음";

export const estimatedQuantityOptions = [
  "100개 미만",
  "100~499개",
  "500~999개",
  "1,000~4,999개",
  "5,000개 이상",
  "미정",
] as const;

export const deliveryRegionOptions = [
  "서울",
  "경기/인천",
  "충청남도/대전",
  "충청북도",
  "경상남도/부산/울산",
  "경상북도/대구",
  "전라남도/광주/제주도",
  "전라북도",
] as const;

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
  requestedPalletSizes: string[];
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
  requestedPalletSizes: [],
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
  if (inquiryType === "custom") return "맞춤 제작 상담 요청";
  if (inquiryType === "technical") return "기술자료 요청";
  return "문의 접수";
}

export function inquiryTypeLabel(value: string) {
  return inquiryTypes.find((item) => item.value === value)?.label ?? value;
}

export type ContactFormFieldErrors = Partial<
  Record<
    | "inquiryType"
    | "companyName"
    | "contactPerson"
    | "phone"
    | "deliveryRegion"
    | "email"
    | "responseMethod"
    | "message"
    | "privacyAgreed",
    string
  >
>;

export function getContactFormFieldErrors(data: ContactFormData) {
  const errors: ContactFormFieldErrors = {};

  if (!data.inquiryType) {
    errors.inquiryType = "문의 유형을 선택해 주세요.";
  }
  if (!data.companyName.trim()) {
    errors.companyName = "회사명을 입력해 주세요.";
  }
  if (!data.contactPerson.trim()) {
    errors.contactPerson = "담당자명을 입력해 주세요.";
  }
  if (!data.phone.trim() && !data.email.trim()) {
    errors.phone = "전화번호 또는 이메일 중 하나를 입력해 주세요.";
    errors.email = "전화번호 또는 이메일 중 하나를 입력해 주세요.";
  } else if (data.phone.trim() && !isValidPhone(data.phone)) {
    errors.phone =
      "전화번호 형식을 확인해 주세요. 국가번호도 입력할 수 있습니다.";
  }
  if (
    (data.inquiryType === "quote" || data.inquiryType === "consulting" || data.inquiryType === "custom") &&
    !data.details.deliveryRegion?.trim()
  ) {
    errors.deliveryRegion = "납품 지역을 선택해 주세요.";
  }
  if (data.email.trim() && !isValidEmail(data.email)) {
    errors.email = "올바른 이메일 형식을 입력해 주세요.";
  }
  if (!data.responseMethod) {
    errors.responseMethod = "연락 선호 방식을 선택해 주세요.";
  }
  if (!data.message.trim()) {
    errors.message = "문의 내용을 입력해 주세요.";
  } else if (data.message.length > 1500) {
    errors.message = "문의 내용은 최대 1,500자까지 입력해 주세요.";
  }
  if (!data.privacyAgreed) {
    errors.privacyAgreed = "개인정보 수집 및 이용에 동의해 주세요.";
  }

  return errors;
}
