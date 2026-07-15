import { inquiryTypes, isValidEmail, isValidPhone } from "@/lib/contactSchema";

export type ContactRequestBody = Record<string, unknown>;

function trimValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeResponseMethod(value: unknown): "EMAIL" | "PHONE" | "TEXT" | "ANY" | "" {
  if (value === "BOTH") return "ANY";
  return value === "EMAIL" || value === "PHONE" || value === "TEXT" || value === "ANY" ? value : "";
}

function normalizeDetails(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => typeof item === "string")
      .map(([key, item]) => [key.slice(0, 60), trimValue(item).slice(0, 500)]),
  );
}

export function normalizeContactBody(body: ContactRequestBody) {
  return {
    inquiryType: trimValue(body.inquiryType),
    companyName: trimValue(body.companyName),
    contactPerson: trimValue(body.contactPerson),
    department: trimValue(body.department),
    email: trimValue(body.email),
    phone: trimValue(body.phone),
    responseMethod: normalizeResponseMethod(body.responseMethod),
    industry: trimValue(body.industry),
    productInterest: trimValue(body.productInterest),
    estimatedQuantity: trimValue(body.estimatedQuantity),
    message: trimValue(body.message),
    details: normalizeDetails(body.details),
    privacyAgreed: body.privacyAgreed === true,
    website: trimValue(body.website),
  };
}

export function validateContactBody(data: ReturnType<typeof normalizeContactBody>) {
  if (!data.privacyAgreed) return "입력값을 확인해 주세요.";
  if (!inquiryTypes.some((item) => item.value === data.inquiryType)) return "문의 유형을 확인해 주세요.";
  if (!data.companyName || data.companyName.length > 100) return "입력값을 확인해 주세요.";
  if (!data.contactPerson || data.contactPerson.length > 50) return "입력값을 확인해 주세요.";
  if (data.department.length > 100) return "입력값을 확인해 주세요.";
  if (!data.phone || data.phone.length > 30 || !isValidPhone(data.phone)) return "올바른 전화번호 형식으로 입력해 주세요.";
  if (data.email.length > 254 || (data.email && !isValidEmail(data.email))) return "올바른 이메일 형식을 입력해 주세요.";
  if (!data.responseMethod) return "회신 방법을 확인해 주세요.";
  if (data.message.length > 1500) return "문의 내용은 최대 1,500자입니다.";
  if (data.productInterest.length > 100 || data.estimatedQuantity.length > 100 || data.industry.length > 100) return "입력값을 확인해 주세요.";

  if (data.inquiryType === "quote") {
    if (!data.productInterest || !data.estimatedQuantity || !data.details.requiredPalletSize || !data.details.deliveryRegion) return "견적 요청 필수 항목을 확인해 주세요.";
  }
  return "";
}
