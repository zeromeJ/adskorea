import {
  deliveryRegionOptions,
  estimatedQuantityOptions,
  inquiryTypes,
  isValidEmail,
  isValidPhone,
  palletSizeOptions,
  unknownPalletSizeOption,
} from "@/lib/contactSchema";

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

function normalizeRequestedPalletSizes(value: unknown) {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<string>([
    ...palletSizeOptions,
    unknownPalletSizeOption,
  ]);
  const values = [...new Set(
    value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => allowed.has(item)),
  )];
  return values.includes(unknownPalletSizeOption)
    ? [unknownPalletSizeOption]
    : values;
}

export function normalizeContactBody(body: ContactRequestBody) {
  const inquiryType = trimValue(body.inquiryType);
  return {
    inquiryType,
    companyName: trimValue(body.companyName),
    contactPerson: trimValue(body.contactPerson),
    department: trimValue(body.department),
    email: trimValue(body.email),
    phone: trimValue(body.phone),
    responseMethod: normalizeResponseMethod(body.responseMethod),
    industry: trimValue(body.industry),
    productInterest: trimValue(body.productInterest),
    estimatedQuantity: trimValue(body.estimatedQuantity),
    requestedPalletSizes:
      inquiryType === "other"
        ? []
        : normalizeRequestedPalletSizes(body.requestedPalletSizes),
    message: trimValue(body.message),
    details: normalizeDetails(body.details),
    privacyAgreed: body.privacyAgreed === true,
    website: trimValue(body.website),
  };
}

export function validateContactBody(data: ReturnType<typeof normalizeContactBody>) {
  if (!data.privacyAgreed) return "입력값을 확인해 주세요.";
  if (!inquiryTypes.some((item) => item.value === data.inquiryType)) return "문의 유형을 확인해 주세요.";
  if (!data.companyName || data.companyName.length > 100) return "회사명을 확인해 주세요.";
  if (!data.contactPerson || data.contactPerson.length > 50) return "담당자명을 확인해 주세요.";
  if (data.department.length > 100) return "입력값을 확인해 주세요.";
  if (!data.phone && !data.email) return "전화번호 또는 이메일 중 하나를 입력해 주세요.";
  if (data.phone && (data.phone.length > 30 || !isValidPhone(data.phone))) return "올바른 전화번호 형식으로 입력해 주세요.";
  const requiresDeliveryRegion =
    data.inquiryType === "quote" || data.inquiryType === "consulting" || data.inquiryType === "custom";
  if (
    requiresDeliveryRegion &&
    !deliveryRegionOptions.includes(
      data.details.deliveryRegion as (typeof deliveryRegionOptions)[number],
    )
  ) {
    return "납품 지역을 확인해 주세요.";
  }
  if (
    !requiresDeliveryRegion &&
    data.details.deliveryRegion &&
    !deliveryRegionOptions.includes(
      data.details.deliveryRegion as (typeof deliveryRegionOptions)[number],
    )
  ) {
    return "납품 지역을 확인해 주세요.";
  }
  if (data.email.length > 254 || (data.email && !isValidEmail(data.email))) return "올바른 이메일 형식을 입력해 주세요.";
  if (!data.responseMethod) return "회신 방법을 확인해 주세요.";
  if (!data.message || data.message.length > 1500) return "문의 내용을 입력해 주세요. 최대 1,500자입니다.";
  if (data.productInterest.length > 100 || data.estimatedQuantity.length > 100 || data.industry.length > 100) return "입력값을 확인해 주세요.";
  if (data.estimatedQuantity && !estimatedQuantityOptions.includes(data.estimatedQuantity as (typeof estimatedQuantityOptions)[number])) return "예상 수량을 확인해 주세요.";
  return "";
}
