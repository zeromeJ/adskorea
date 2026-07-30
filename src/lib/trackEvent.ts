export type TrackEventName =
  | "hero_product_click"
  | "hero_inquiry_click"
  | "catalog_download"
  | "product_view"
  | "product_inquiry_click"
  | "performance_detail_view"
  | "document_preview"
  | "document_summary_open"
  | "video_play"
  | "customer_case_view"
  | "application_guide_select"
  | "inquiry_type_select"
  | "inquiry_start"
  | "inquiry_file_upload"
  | "inquiry_submit_success"
  | "inquiry_submit_error"
  | "phone_click"
  | "email_copy";

export function trackEvent(
  name: TrackEventName,
  properties: Record<string, string | number | boolean | undefined> = {},
) {
  if (typeof window === "undefined") return;
  const safeProperties = Object.fromEntries(
    Object.entries(properties).filter(
      ([key, value]) =>
        value !== undefined &&
        !["phone", "email", "message", "companyName"].includes(key),
    ),
  );
  window.dispatchEvent(
    new CustomEvent("adson:analytics", {
      detail: { name, properties: safeProperties },
    }),
  );
  const dataLayer = (
    window as typeof window & {
      dataLayer?: Array<Record<string, unknown>>;
    }
  ).dataLayer;
  dataLayer?.push({ event: name, ...safeProperties });
}
