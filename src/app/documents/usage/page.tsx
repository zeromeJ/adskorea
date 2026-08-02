import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "자료 이용 안내",
  description: "아델슨 코리아 웹사이트의 시험자료, 제조사 사양과 공식 문서 이용 범위를 안내합니다.",
  alternates: { canonical: "/documents/usage" },
};

const notices = [
  "사이트에 표시된 시험결과는 각 보고서에 기재된 제출 시료에 한해 적용됩니다.",
  "제조사 제시 하중은 제품군과 모델별 제조사 사양이며, 제3자 시험결과와 동일한 의미가 아닙니다.",
  "시험자료와 인증문서는 문서가 증명하는 제품, 기간과 범위 안에서만 해석해야 합니다.",
  "목적국의 목재 포장재 요건은 국가와 제품 구성에 따라 달라질 수 있습니다.",
  "시험성적서와 인증서의 무단 복제, 부분 편집과 재배포는 각 문서의 제한사항을 따라야 합니다.",
  "실제 적용 가능 여부는 화물, 랙, 지게차, 자동화 설비와 보관환경 검토 후 확정됩니다.",
];

export default function DocumentUsagePage() {
  return (
    <main className="bg-white" id="main-content" tabIndex={-1}>
      <header className="border-b border-[var(--line)] bg-[var(--background)] px-5 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-[920px]">
          <p className="en text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent-gold-dark)]">Document Use Notice</p>
          <h1 className="mt-4 text-4xl font-extrabold text-[var(--primary-deep)] lg:text-5xl">자료 이용 안내</h1>
          <p className="mt-5 text-lg leading-8 text-[var(--sub-text)]">시험결과, 제조사 사양과 공식 문서는 출처와 증명 범위를 구분해 확인해야 합니다.</p>
        </div>
      </header>
      <div className="mx-auto max-w-[920px] px-5 py-14 lg:px-0 lg:py-20">
        <ol className="grid gap-4">
          {notices.map((notice, index) => (
            <li className="grid grid-cols-[48px_1fr] gap-4 border border-[var(--line)] p-5 text-lg leading-8" key={notice}>
              <span className="number font-bold text-[var(--accent-gold-dark)]">{String(index + 1).padStart(2, "0")}</span>
              <p>{notice}</p>
            </li>
          ))}
        </ol>
        <Link className="mt-10 inline-flex min-h-12 items-center bg-[var(--primary)] px-5 font-extrabold text-white" href="/catalog#documents">공식 문서 자료실로 돌아가기</Link>
      </div>
    </main>
  );
}
