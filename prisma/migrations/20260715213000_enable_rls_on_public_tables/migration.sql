-- All application access goes through trusted Next.js server routes.
-- Browser-facing PostgREST roles must not access these tables directly.
--
-- Do not use FORCE ROW LEVEL SECURITY here. Prisma connects as the `postgres`
-- table owner, which must retain access for server CRUD and migrations.

ALTER TABLE public."AdminUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AdminDevice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Inquiry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InquiryAttachment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InquiryCompletionLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WebsiteSection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WebsiteAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WebsiteChangeLog" ENABLE ROW LEVEL SECURITY;

-- Defense in depth: remove direct Data API privileges from all browser roles.
-- No anon/authenticated policies are intentionally created, so RLS remains
-- default-deny even if privileges are granted accidentally in the future.
REVOKE ALL PRIVILEGES ON TABLE
  public."AdminUser",
  public."AdminDevice",
  public."Inquiry",
  public."InquiryAttachment",
  public."InquiryCompletionLog",
  public."WebsiteSection",
  public."WebsiteAsset",
  public."WebsiteChangeLog"
FROM PUBLIC, anon, authenticated;

-- The trusted Supabase service role keeps only the DML privileges required by
-- server-side clients. service_role has BYPASSRLS in Supabase.
REVOKE ALL PRIVILEGES ON TABLE
  public."AdminUser",
  public."AdminDevice",
  public."Inquiry",
  public."InquiryAttachment",
  public."InquiryCompletionLog",
  public."WebsiteSection",
  public."WebsiteAsset",
  public."WebsiteChangeLog"
FROM service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public."AdminUser",
  public."AdminDevice",
  public."Inquiry",
  public."InquiryAttachment",
  public."InquiryCompletionLog",
  public."WebsiteSection",
  public."WebsiteAsset",
  public."WebsiteChangeLog"
TO service_role;

-- Prisma owns this bookkeeping table. It is not application data and must not
-- be reachable through the Supabase Data API, including with service_role.
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."_prisma_migrations"
FROM PUBLIC, anon, authenticated, service_role;
