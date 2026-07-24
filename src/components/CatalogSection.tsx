import MediaPlaceholder from "@/components/ui/MediaPlaceholder";
import SectionTitle from "@/components/ui/SectionTitle";

type Catalog = {
  title: string;
  language: string;
  version: string;
  pages: string;
  updatedAt: string;
  fileSize: string;
  thumbnailUrl?: string;
  fileUrl?: string;
};

export default function CatalogSection({ catalog }: { catalog?: Catalog }) {
  if (!catalog?.fileUrl) return null;

  return (
    <section id="catalog" className="bg-white px-5 pt-12 pb-14 lg:px-8 lg:pb-[72px]">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          eyebrow="Latest Catalog"
          title="제품 카탈로그"
          description="제품군과 주요 사양을 확인할 수 있는 최신 공개 카탈로그입니다."
        />
        <div className="mt-8 grid items-center gap-6 rounded-lg border border-[var(--line)] bg-[var(--muted-surface)] p-5 sm:grid-cols-[180px_1fr] sm:p-6">
          <MediaPlaceholder
            alt={catalog ? `${catalog.title} 표지` : ""}
            desktopRatio="210:297"
            expandable={false}
            fieldName="siteSettings.catalogDocument"
            guide="최신 공개 카탈로그 A4 표지"
            label="카탈로그 썸네일"
            mediaType="document"
            mobileRatio="210:297"
            src={catalog?.thumbnailUrl}
          />
          <div className="self-center">
            <h3 className="text-xl font-bold text-[var(--text)]">{catalog.title}</h3>
            <dl className="mt-4 grid gap-2 text-sm text-[var(--sub-text)] sm:grid-cols-2">
              {catalog.language ? <div>언어: {catalog.language}</div> : null}
              {catalog.version ? <div>버전: {catalog.version}</div> : null}
              {catalog.pages ? <div>페이지: {catalog.pages}</div> : null}
              {catalog.updatedAt ? <div>최종 업데이트: {catalog.updatedAt}</div> : null}
              {catalog.fileSize ? <div>파일 크기: {catalog.fileSize}</div> : null}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                className="rounded-md bg-[var(--primary)] px-4 py-3 text-sm font-bold text-white"
                download
                href={catalog.fileUrl}
              >
                다운로드
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
