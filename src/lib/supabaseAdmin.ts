import { createClient } from "@supabase/supabase-js";

export const inquiryAttachmentBucket =
  process.env.SUPABASE_INQUIRY_BUCKET || "inquiry-attachments";
export const websiteContentBucket =
  process.env.SUPABASE_CONTENT_BUCKET || "website-content";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function ensureWebsiteContentBucket() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase.storage.getBucket(websiteContentBucket);
  if (!data) {
    const { error } = await supabase.storage.createBucket(websiteContentBucket, {
      public: true,
      fileSizeLimit: 20 * 1024 * 1024,
      allowedMimeTypes: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ],
    });
    if (error && !error.message.toLowerCase().includes("already exists")) {
      throw error;
    }
  }
  return supabase;
}

export async function ensureInquiryAttachmentBucket() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase.storage.getBucket(inquiryAttachmentBucket);
  if (!data) {
    const { error } = await supabase.storage.createBucket(
      inquiryAttachmentBucket,
      {
        public: false,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/webp",
        ],
      },
    );
    if (error && !error.message.toLowerCase().includes("already exists")) {
      throw error;
    }
  }

  return supabase;
}
