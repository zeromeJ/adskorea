import type { Metadata } from "next";
import Image from "next/image";
import { Fragment } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Factory,
  Gauge,
  PackageCheck,
  Settings2,
  Sparkles,
  Sprout,
  Wind,
} from "lucide-react";
import ResponsiveVideo from "@/components/ResponsiveVideo";
import { companyStats, processSteps } from "@/lib/constants";
import { getWebsiteContent } from "@/lib/websiteContent";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "회사",
  description:
    "아델슨의 산업 경험, 생산 부지와 설계 생산능력, 7단계 제조공정 및 회사·생산 소개영상을 확인하세요.",
  alternates: { canonical: "/company" },
};

const processIcons = [
  Sprout,
  Settings2,
  Sparkles,
  Wind,
  Gauge,
  Factory,
  PackageCheck,
];

const processDescriptions = [
  "원료 상태와 제조 적합성을 확인합니다.",
  "성형에 적합한 크기로 원료를 파쇄합니다.",
  "균일한 혼합을 위해 입도를 조정합니다.",
  "건조와 함수율 조정을 진행합니다.",
  "MDI계 접착 시스템을 균일하게 혼합합니다.",
  "금형에서 고온·고압으로 일체형 성형합니다.",
  "제품 상태를 확인한 뒤 출하합니다.",
];

export default async function CompanyPage() {
  const cms = await getWebsiteContent();
  const settings = cms?.siteSettings;
  const officialInfo = [
    ["정식 법인명", settings?.legalCompanyName],
    ["대표자명", settings?.representativeName],
    ["사업자등록번호", settings?.businessRegistrationNumber],
    ["주소", settings?.address],
    ["대표 전화", settings?.primaryPhone || settings?.phone],
    ["대표 이메일", settings?.primaryContactEmail || settings?.email],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <main id="main-content">
      <section className="px-5 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
          <div>
            <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold-dark)]">
              Company & Manufacturing
            </p>
            <h1 className="mt-4 text-4xl font-extrabold text-[var(--primary-deep)] lg:text-6xl">
              산업 경험을
              <br />
              생산 기반으로 연결합니다
            </h1>
            <p className="mt-6 text-lg leading-8 text-[var(--sub-text)]">
              생산 역량과 제조공정을 구분해 투명하게 소개합니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-[var(--muted-surface)] lg:order-first">
            {cms?.factoryImage ? (
              <Image
                alt="아델슨 제조 공장 전경"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 32vw"
                src={cms.factoryImage}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Factory
                  aria-hidden="true"
                  className="text-[var(--sub-sage)]"
                  size={52}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        className="bg-[var(--primary-deep)] px-5 py-14 text-white lg:px-8 lg:py-20"
        id="capacity"
      >
        <div className="mx-auto max-w-[1200px]">
          <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold)]">
            Production Capacity
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">회사·생산 역량</h2>
          <div className="mt-10 grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {companyStats.map((stat) => (
              <article
                className="min-h-44 bg-[var(--primary-deep)] p-6"
                key={stat.label}
              >
                <p className="number text-4xl font-bold text-[var(--accent-gold)]">
                  {stat.value}
                </p>
                <p className="en mt-4 text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                  {stat.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  {stat.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-8 lg:py-24" id="process">
        <div className="mx-auto max-w-[1200px]">
          <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold-dark)]">
            Manufacturing Process
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">7단계 제조공정</h2>
          <p className="mt-4 max-w-3xl leading-8 text-[var(--sub-text)]">
            추가 생산공정 사진을 임의로 만들지 않고, 현재 확인 가능한 공정을
            선형 타임라인으로 설명합니다.
          </p>
          <div
            className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-[repeat(6,minmax(0,1fr)_1.5rem)_minmax(0,1fr)] lg:gap-0"
            role="list"
          >
            {processSteps.map((step, index) => {
              const Icon = processIcons[index];
              return (
                <Fragment key={step}>
                  <article
                    className="border border-[var(--line)] bg-white p-5"
                    role="listitem"
                  >
                    <div className="flex items-center justify-between">
                      <Icon
                        aria-hidden="true"
                        className="text-[var(--primary)]"
                        size={23}
                      />
                      <span className="number text-sm font-bold text-[var(--accent-gold-dark)]">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-extrabold">{step}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--sub-text)]">
                      {processDescriptions[index]}
                    </p>
                  </article>
                  {index < processSteps.length - 1 ? (
                    <div
                      aria-hidden="true"
                      className="hidden items-center justify-center text-[var(--primary)] lg:flex"
                    >
                      <ArrowRight size={18} />
                    </div>
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 lg:px-8 lg:py-24" id="company-video">
        <div className="mx-auto max-w-[1200px]">
          <p className="en text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-gold-dark)]">
            Company Film
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">
            회사·생산 및 기술 소개영상
          </h2>
          <div className="mt-8 w-full max-w-[700px]">
            <ResponsiveVideo
              fallback={cms?.homePage?.productOverviewVideo}
              poster={cms?.homePage?.productOverviewPoster}
              title="회사·생산 및 기술 소개영상"
              video1080={cms?.homePage?.productOverviewVideo1080}
              video720={cms?.homePage?.productOverviewVideo720}
            />
          </div>
        </div>
      </section>

      {officialInfo.length ? (
        <section className="px-5 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex items-center gap-3">
              <BadgeCheck
                aria-hidden="true"
                className="text-[var(--primary)]"
                size={24}
              />
              <h2 className="text-2xl font-extrabold">공식 회사정보</h2>
            </div>
            <dl className="mt-7 grid gap-px bg-[var(--line)] md:grid-cols-2">
              {officialInfo.map(([label, value]) => (
                <div className="bg-white p-5" key={label}>
                  <dt className="text-xs text-[var(--sub-text)]">{label}</dt>
                  <dd className="mt-2 font-bold">{value}</dd>
                </div>
              ))}
              {officialInfo.length % 2 ? (
                <div aria-hidden="true" className="hidden bg-white md:block" />
              ) : null}
            </dl>
          </div>
        </section>
      ) : null}
    </main>
  );
}
