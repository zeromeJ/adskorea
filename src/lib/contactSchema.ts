export type ContactFormData = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  responseMethod: "PHONE" | "TEXT" | "BOTH";
  industry: string;
  currentPalletType: string;
  productInterest: string;
  message: string;
  privacyAgreed: boolean;
  website: string;
};

export const initialContactFormData: ContactFormData = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  responseMethod: "BOTH",
  industry: "",
  currentPalletType: "",
  productInterest: "",
  message: "",
  privacyAgreed: false,
  website: "",
};

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string) {
  if (!/^\+?[0-9()\-\s]+$/.test(phone.trim())) {
    return false;
  }

  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export function validateContactForm(data: ContactFormData) {
  if (!data.companyName.trim()) {
    return "회사명을 입력해 주세요.";
  }

  if (!data.contactPerson.trim()) {
    return "담당자명을 입력해 주세요.";
  }

  if (!data.phone.trim()) {
    return "연락처를 입력해 주세요.";
  }

  if (!isValidPhone(data.phone)) {
    return "올바른 전화번호 형식으로 입력해 주세요. (예: 010-1234-5678)";
  }

  if (!data.responseMethod) {
    return "회신 방법을 선택해 주세요.";
  }

  if (data.email.trim() && !isValidEmail(data.email)) {
    return "올바른 이메일 형식을 입력해 주세요.";
  }

  if (data.message.length > 300) {
    return "문의 내용은 최대 300자까지 입력해 주세요.";
  }

  if (!data.privacyAgreed) {
    return "개인정보 수집 및 이용에 동의해 주세요.";
  }

  return "";
}
