import { isValidEmail } from "@/lib/contactSchema";

export type ContactRequestBody = {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  country?: string;
  industry?: string;
  currentPalletType?: string;
  productInterest?: string;
  estimatedQuantity?: string;
  exportCountry?: string;
  message?: string;
  privacyAgreed?: boolean;
  website?: string;
};

function trimValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeContactBody(body: ContactRequestBody) {
  return {
    companyName: trimValue(body.companyName),
    contactPerson: trimValue(body.contactPerson),
    email: trimValue(body.email),
    phone: trimValue(body.phone),
    country: trimValue(body.country),
    industry: trimValue(body.industry),
    currentPalletType: trimValue(body.currentPalletType),
    productInterest: trimValue(body.productInterest),
    estimatedQuantity: trimValue(body.estimatedQuantity),
    exportCountry: trimValue(body.exportCountry),
    message: trimValue(body.message),
    privacyAgreed: body.privacyAgreed === true,
    website: trimValue(body.website),
  };
}

export function validateContactBody(data: ReturnType<typeof normalizeContactBody>) {
  if (!data.privacyAgreed) {
    return "입력값을 확인해 주세요.";
  }

  if (!data.companyName || data.companyName.length > 100) {
    return "입력값을 확인해 주세요.";
  }

  if (!data.contactPerson || data.contactPerson.length > 50) {
    return "입력값을 확인해 주세요.";
  }

  if (!data.phone || data.phone.length > 30) {
    return "입력값을 확인해 주세요.";
  }

  if (data.email && !isValidEmail(data.email)) {
    return "입력값을 확인해 주세요.";
  }

  if (data.message.length > 3000) {
    return "입력값을 확인해 주세요.";
  }

  return "";
}
