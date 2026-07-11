export type ContactFormData = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  productInterest: string;
  estimatedQuantity: string;
  message: string;
  privacyAgreed: boolean;
  website: string;
};

export const initialContactFormData: ContactFormData = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  country: "",
  productInterest: "",
  estimatedQuantity: "",
  message: "",
  privacyAgreed: false,
  website: "",
};

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateContactForm(data: ContactFormData) {
  if (!data.companyName.trim()) {
    return "회사명을 입력해 주세요.";
  }

  if (!data.contactPerson.trim()) {
    return "담당자명을 입력해 주세요.";
  }

  if (!data.email.trim()) {
    return "이메일을 입력해 주세요.";
  }

  if (!isValidEmail(data.email)) {
    return "올바른 이메일 형식을 입력해 주세요.";
  }

  if (!data.message.trim()) {
    return "문의 내용을 입력해 주세요.";
  }

  if (!data.privacyAgreed) {
    return "개인정보 수집 및 이용에 동의해 주세요.";
  }

  return "";
}
