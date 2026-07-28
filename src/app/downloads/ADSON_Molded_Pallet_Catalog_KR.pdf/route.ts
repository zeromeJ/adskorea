import { productBrochureFileName } from "@/lib/downloads";
import { getWebsiteContent } from "@/lib/websiteContent";

export async function GET() {
  const content = await getWebsiteContent();
  const fileUrl = content?.catalog?.fileUrl;

  if (!fileUrl) {
    return Response.json(
      { message: "제품 소개서가 아직 등록되지 않았습니다." },
      { status: 404 },
    );
  }

  const source = await fetch(fileUrl, { cache: "no-store" });
  if (!source.ok || !source.body) {
    return Response.json(
      { message: "제품 소개서를 불러오지 못했습니다." },
      { status: 502 },
    );
  }

  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "Content-Disposition": `attachment; filename="${productBrochureFileName}"`,
    "Content-Type": source.headers.get("content-type") || "application/pdf",
    "X-Content-Type-Options": "nosniff",
  });
  const contentLength = source.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(source.body, { headers });
}
