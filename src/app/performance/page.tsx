import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  FileSearch,
} from "lucide-react";
import SourceBadge from "@/components/SourceBadge";
import TestVideosSection from "@/components/TestVideosSection";
import {
  performanceVideoFallbacks,
  sustainabilityData,
  testGroups,
} from "@/lib/constants";
import { getWebsiteContent } from "@/lib/websiteContent";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "성능",
  description:
    "2025 국가포장제품품질검사센터 시험, 2026 TBK 시험, 포름알데히드 시험과 SGS 탄소발자국 검증자료를 확인하세요.",
  alternates: { canonical: "/performance" },
};

const lifecycle = [
  { label: "원재료", value: "0.7915kg CO₂e", tone: "bg-[#dce8dd]" },
  { label: "제조", value: "2.1636kg CO₂e", tone: "bg-[#bfd3c2]" },
  { label: "완제품 운송", value: "0.9148kg CO₂e", tone: "bg-[#9fbea5]" },
  { label: "폐기", value: "-1.9840kg CO₂e", tone: "bg-[#f0dfaf]" },
];

export default async function PerformancePage() {
  const cms = await getWebsiteContent();
  const videos = (
    cms?.performanceVideos?.length
      ? cms.performanceVideos
      : performanceVideoFallbacks
  ).map((video) => ({
    ...video,
    videoUrl:
      "videoUrl" in video && typeof video.videoUrl === "string"
        ? video.videoUrl
        : undefined,
    poster:
      "poster" in video && typeof video.poster === "string"
        ? video.poster
        : undefined,
  }));
  return (
    <main id="main-content">
      <section className="bg-[var(--primary-deep)] px-5 py-14 text-white lg:px-8 lg:py-20">
        <div className="mx-auto max-w-[1200px]">
          <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold)]">
            Performance
          </p>
          <h1 className="mt-4 text-4xl font-extrabold lg:text-6xl">
            시험과 시연을 구분한 성능 검토
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-white/68">
            시험기관이 발행한 제3자 자료, SGS 환경 검증과 제조사 제공
            시연영상을 출처별로 나누어 제공합니다.
          </p>
          <nav
            aria-label="성능 페이지 목차"
            className="mt-9 flex flex-wrap gap-2 text-sm font-bold"
          >
            {[
              ["제3자 시험", "#third-party-tests"],
              ["포름알데히드", "#formaldehyde"],
              ["환경 검증", "#environment"],
              ["제조사 시연영상", "#performance-videos"],
            ].map(([label, href]) => (
              <a
                className="inline-flex min-h-11 items-center border border-white/25 px-4 hover:bg-white/10"
                href={href}
                key={href}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-8 lg:py-24" id="third-party-tests">
        <div className="mx-auto max-w-[1200px]">
          <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold-dark)]">
            Third-party Tests
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">제3자 성능시험</h2>
          <p className="mt-4 max-w-5xl leading-8 text-[var(--sub-text)]">
            아래 결과는 각 보고서에 기재된 제출 시료에 한해 적용됩니다.
            하나의 결과를 모든 제품군이나 다른 모델에 확대 적용하지 않습니다.
          </p>
          <div className="mt-10 grid gap-6">
            {testGroups.map((group, groupIndex) => (
              <article
                className="border border-[var(--line)] bg-white p-6 lg:p-8"
                key={group.id}
              >
                <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
                  <div>
                    <SourceBadge kind="third-party" />
                    <h3 className="mt-5 text-2xl font-extrabold">
                      {group.label}
                    </h3>
                    <dl className="mt-5 grid gap-3 text-sm leading-6">
                      {[
                        ["시험기관", group.organization],
                        ["보고서 번호", group.reportNumber],
                        ["시험기간", group.testDate],
                        ["시료", group.specimen],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="font-bold text-[var(--primary-deep)]">
                            {label}
                          </dt>
                          <dd className="mt-0.5 text-[var(--sub-text)]">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <Link
                      className="mt-7 inline-flex min-h-11 items-center gap-2 font-extrabold text-[var(--primary)] underline underline-offset-4"
                      href={`/documents#document-${groupIndex + 1}`}
                    >
                      <FileSearch aria-hidden="true" size={17} />
                      원문 시험자료 보기
                    </Link>
                  </div>
                  <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
                    {group.results.map((result) => (
                      <div className="bg-[var(--background)] p-5" key={result.name}>
                        <p className="text-xs font-bold text-[var(--sub-text)]">
                          {result.name}
                        </p>
                        <p className="number mt-2 text-2xl font-bold text-[var(--primary)]">
                          {result.value}
                        </p>
                        <p className="mt-3 text-xs text-[var(--sub-text)]">
                          기준 {result.referenceValue}
                        </p>
                        <p className="mt-1 text-xs font-extrabold text-[var(--primary-dark)]">
                          판정 {result.judgement}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                {"notices" in group && group.notices?.length ? (
                  <ul className="mt-6 border-t border-[var(--line)] pt-5 text-xs leading-6 text-[var(--sub-text)]">
                    {group.notices.map((notice) => (
                      <li key={notice}>· {notice}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 lg:px-8 lg:py-24" id="formaldehyde">
        <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="border-l-4 border-[var(--primary)] pl-6">
            <SourceBadge kind="third-party" />
            <p className="number mt-6 text-6xl font-bold text-[var(--primary)]">
              0.9
              <span className="ml-2 text-2xl">mg/L</span>
            </p>
            <h2 className="mt-3 text-2xl font-extrabold">
              포름알데히드 방출량
            </h2>
          </div>
          <div>
            <dl className="grid gap-px bg-[var(--line)] sm:grid-cols-2">
              {[
                ["시험방법", "GB/T 17657-2022"],
                ["보고서", "TBK20260318Lab10101-1A"],
                ["시험기관", "쑤저우 톈뱌오 시험기술유한회사"],
                ["시료", "1100 × 1100 · 1개"],
              ].map(([label, value]) => (
                <div className="bg-white p-5" key={label}>
                  <dt className="text-xs text-[var(--sub-text)]">{label}</dt>
                  <dd className="mt-2 text-sm font-extrabold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-8 lg:py-24" id="environment">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold-dark)]">
                Environmental Verification
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-extrabold">환경 검증</h2>
                <SourceBadge kind="sgs" />
              </div>
              <dl className="mt-6 grid gap-3 text-sm">
                <div>
                  <dt className="text-[var(--sub-text)]">적용 모델</dt>
                  <dd className="mt-1 font-extrabold">
                    {sustainabilityData.model}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--sub-text)]">검증기준</dt>
                  <dd className="mt-1 font-extrabold">
                    {sustainabilityData.standard}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--sub-text)]">성명서</dt>
                  <dd className="mt-1 font-extrabold">
                    {sustainabilityData.statementNumber} ·{" "}
                    {sustainabilityData.issueDate}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="border border-[var(--line)] bg-white p-6 lg:p-8">
              <p className="text-sm font-bold">생애주기 흐름</p>
              <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center">
                {lifecycle.map((stage, index) => (
                  <div className="contents" key={stage.label}>
                    <div className={`${stage.tone} min-h-28 p-4`}>
                      <p className="text-xs font-bold text-[var(--sub-text)]">
                        {stage.label}
                      </p>
                      <p className="number mt-4 text-lg font-bold">
                        {stage.value}
                      </p>
                    </div>
                    {index < lifecycle.length - 1 ? (
                      <ArrowRight
                        aria-hidden="true"
                        className="mx-auto hidden text-[var(--primary)] sm:block"
                        size={18}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
              <ArrowDown
                aria-hidden="true"
                className="mx-auto mt-5 text-[var(--primary)]"
                size={22}
              />
              <div className="mt-3 bg-[var(--primary-deep)] p-6 text-center text-white">
                <p className="text-xs text-white/60">최종 검증값 · 팔레트 1개</p>
                <p className="number mt-2 text-4xl font-bold text-[var(--accent-gold)]">
                  {sustainabilityData.value}
                  <span className="ml-2 text-lg">{sustainabilityData.unit}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestVideosSection videos={videos} />
    </main>
  );
}
