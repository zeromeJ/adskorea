export function normalizePhone(value?: string | null) {
  return value?.replace(/\D/g, "") || null;
}

export function normalizeEmail(value?: string | null) {
  return value?.trim().toLocaleLowerCase() || null;
}

export function normalizeCompanyName(value?: string | null) {
  return value?.trim().toLocaleLowerCase("ko-KR").replace(/\s+/g, "") || null;
}
