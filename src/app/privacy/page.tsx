import type { Metadata } from "next";
import Link from "next/link";
import { getWebsiteContent } from "@/lib/websiteContent";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "아델슨 코리아 웹사이트 문의 접수와 고객관리 과정의 개인정보 처리 기준을 안내합니다.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const cms = await getWebsiteContent();
  const settings = cms?.siteSettings;
  const purpose =
    settings?.privacyPurposeText ||
    "문의 확인 및 회신, 견적·기술 상담, 상담 이력 관리, 재문의 대응과 고객관리";
  const retention =
    settings?.privacyRetentionText ||
    "고객관리 및 재문의 대응 목적이 유지되는 동안 보관하며, 삭제 요청이 접수된 경우 관련 기준에 따라 처리합니다.";
  const effectiveDate = settings?.privacyEffectiveDate;
  const contactEmail =
    settings?.primaryContactEmail || settings?.email || undefined;
  const phone = settings?.primaryPhone || settings?.phone || undefined;

  const sections = [
    ["collection", "수집항목"],
    ["purpose", "이용목적"],
    ["retention", "보유 기준"],
    ["deletion", "삭제 요청 방법"],
    ["contact", "개인정보 문의"],
  ];

  return (
    <main className="bg-white" id="main-content">
      <header className="border-b border-[var(--line)] bg-[var(--background)] px-5 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-[920px]">
          <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold-dark)]">
            Privacy Policy
          </p>
          <h1 className="mt-4 text-4xl font-extrabold text-[var(--primary-deep)] lg:text-5xl">
            개인정보처리방침
          </h1>
          <p className="mt-5 leading-8 text-[var(--sub-text)]">
            아델슨은 문의 확인과 회신, 견적·기술 상담 및 고객관리에 필요한
            범위에서 개인정보를 처리합니다.
          </p>
          {effectiveDate ? (
            <p className="mt-5 text-sm font-bold">시행일 {effectiveDate}</p>
          ) : null}
        </div>
      </header>

      <div className="mx-auto grid max-w-[920px] gap-12 px-5 py-14 lg:grid-cols-[220px_1fr] lg:px-0 lg:py-20">
        <nav aria-label="개인정보처리방침 목차">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--sub-text)]">
            목차
          </p>
          <ol className="mt-4 grid gap-1">
            {sections.map(([id, label], index) => (
              <li key={id}>
                <a
                  className="flex min-h-11 items-center border-l-2 border-[var(--line)] px-3 text-sm font-bold text-[var(--sub-text)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  href={`#${id}`}
                >
                  {index + 1}. {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0">
          <div className="grid gap-12 text-sm leading-8 text-[var(--sub-text)]">
            <section id="collection">
              <h2 className="text-2xl font-extrabold text-[var(--text)]">
                1. 수집항목
              </h2>
              <p className="mt-4">
                필수항목은 전화번호와 개인정보 수집·이용 동의입니다. 견적
                요청과 적용·주문제작 상담에는 납품 지역이 추가로 필요합니다.
                회사명, 담당자명, 이메일, 문의 내용, 화물·설비 상세정보와
                첨부파일은 사용자가 선택해 제공할 수 있습니다.
              </p>
            </section>

            <section id="purpose">
              <h2 className="text-2xl font-extrabold text-[var(--text)]">
                2. 이용목적
              </h2>
              <p className="mt-4">{purpose}</p>
              <p className="mt-3 font-bold text-[var(--primary-dark)]">
                수집정보는 위 목적 외에 사용하지 않습니다.
              </p>
            </section>

            <section id="retention">
              <h2 className="text-2xl font-extrabold text-[var(--text)]">
                3. 보유 기준
              </h2>
              <p className="mt-4">{retention}</p>
              <p className="mt-3 text-xs leading-6">
                관계 법령에 따라 별도 보존이 필요한 정보는 해당 기준에 따라
                처리합니다. 보유 기준은 운영정책과 법률 검토에 따라 변경될 수
                있습니다.
              </p>
            </section>

            <section id="deletion">
              <h2 className="text-2xl font-extrabold text-[var(--text)]">
                4. 삭제 요청 방법
              </h2>
              <p className="mt-4">
                본인 확인이 가능한 연락처와 함께 개인정보 삭제 요청을
                접수해 주세요. 요청 내용과 관련 기준을 확인한 뒤 처리
                절차를 안내합니다.
              </p>
              {contactEmail ? (
                <a
                  className="mt-4 inline-flex min-h-12 items-center border border-[var(--primary)] px-4 font-extrabold text-[var(--primary)]"
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent("개인정보 삭제 요청")}`}
                >
                  이메일로 삭제 요청
                </a>
              ) : null}
            </section>

            <section id="contact">
              <h2 className="text-2xl font-extrabold text-[var(--text)]">
                5. 개인정보 문의
              </h2>
              <div className="mt-4 border border-[var(--line)] bg-[var(--background)] p-5">
                {contactEmail ? (
                  <p>
                    이메일{" "}
                    <a
                      className="font-extrabold text-[var(--primary)] underline"
                      href={`mailto:${contactEmail}`}
                    >
                      {contactEmail}
                    </a>
                  </p>
                ) : null}
                {phone ? <p className="mt-1">전화 {phone}</p> : null}
                {!contactEmail && !phone ? (
                  <p>개인정보 문의 연락처는 운영자 확인 후 공개됩니다.</p>
                ) : null}
              </div>
            </section>
          </div>

          <Link
            className="mt-12 inline-flex min-h-12 items-center bg-[var(--primary)] px-5 font-extrabold text-white"
            href="/#inquiry"
          >
            문의 화면으로 이동
          </Link>
        </article>
      </div>
    </main>
  );
}
