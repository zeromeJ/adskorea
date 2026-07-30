import type { Metadata } from "next";
import CatalogDownload from "@/components/CatalogDownload";
import DocumentExplorer, {
  type DocumentExplorerItem,
} from "@/components/DocumentExplorer";
import { documents as fallbackDocuments } from "@/lib/constants";
import { getWebsiteContent } from "@/lib/websiteContent";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "기술자료",
  description:
    "아델슨 제품 카탈로그, 제3자 성능시험, 포름알데히드 시험과 SGS 탄소발자국 검증 성명서를 미리보기·다운로드할 수 있습니다.",
  alternates: { canonical: "/documents" },
};

export default async function DocumentsPage() {
  const cms = await getWebsiteContent();
  const documents: DocumentExplorerItem[] = cms?.documents?.length
    ? cms.documents
    : fallbackDocuments.map((document) => ({
        ...document,
        relatedProducts: [document.relatedProducts],
      }));

  return (
    <main id="main-content">
      <section
        className="border-b border-[var(--line)] px-5 py-14 lg:px-8 lg:py-20"
        id="catalog"
      >
        <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold-dark)]">
              Technical Documents
            </p>
            <h1 className="mt-4 text-4xl font-extrabold text-[var(--primary-deep)] lg:text-6xl">
              구매 검토를 위한 원문 기술자료
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--sub-text)]">
              자료 유형과 검토 목적에 따라 찾고, 원문 PDF와 한국어 요약을 함께
              확인할 수 있습니다.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <CatalogDownload location="documents_hero" />
          </div>
        </div>
      </section>

      <section
        className="px-5 py-12 lg:px-8 lg:py-16"
        id="document-list"
      >
        <div className="mx-auto max-w-[1200px]">
          <DocumentExplorer documents={documents} />
        </div>
      </section>

      <section
        className="bg-[var(--primary-deep)] px-5 py-12 text-white lg:px-8"
        id="usage-notice"
      >
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-xl font-extrabold">자료 이용 안내</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
            한국어 요약은 원문 이해를 돕기 위한 참고자료입니다. 공식 내용은
            업로드된 시험성적서·검증 성명서·제조사 원문을 기준으로 하며,
            원문의 브랜드와 문서 표기는 임의로 변경하지 않습니다.
          </p>
        </div>
      </section>
    </main>
  );
}
