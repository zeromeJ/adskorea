import Image from "next/image";
import SectionTitle from "@/components/ui/SectionTitle";
import StatCard from "@/components/ui/StatCard";
import { companyNetwork, companyStats } from "@/lib/constants";

const mobileCompanyNetwork = [
  "중국 생산 기지",
  "상하이·허페이 거점",
  "뒤셀도르프 R&D",
  "TOGREEN 전략 협력",
  "독일 품질 기준",
];

export default function AboutSection() {
  return (
    <section id="about" className="px-5 pt-14 pb-16 lg:px-8 lg:pb-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="overflow-hidden rounded-lg bg-[var(--primary-deep)] p-5">
            <div className="relative aspect-[16/11] overflow-hidden rounded-md bg-white/5">
              <Image
                alt="Factory placeholder"
                className="h-full w-full object-contain p-10 brightness-0 invert"
                height={540}
                src="/images/factory-placeholder.png"
                width={966}
              />
            </div>
          </div>
          <div>
            <SectionTitle
              eyebrow="Company / Manufacturing"
              title="20년의 경험과 글로벌 생산·R&D 네트워크"
              description="ADS는 물류 포장 산업 경험과 생산 인프라, R&D 협력 기반을 바탕으로 친환경 성형 팔레트 솔루션을 개발해왔습니다."
            />
            <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {companyStats.map((stat) => (
                <StatCard company key={stat.label} {...stat} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {companyNetwork.map((item, index) => (
            <div
              className={`rounded-lg border border-[var(--line)] bg-white px-1.5 py-3 text-center text-[9px] leading-4 font-bold whitespace-nowrap text-[var(--primary-dark)] sm:px-3 sm:text-xs lg:p-5 lg:text-left lg:text-sm lg:leading-6 ${
                index < 3 ? "col-span-2" : "col-span-3"
              }`}
              key={item}
            >
              <span className="lg:hidden">{mobileCompanyNetwork[index]}</span>
              <span className="hidden lg:inline">{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-6 text-[var(--sub-text)]">
          생산 기지 수처럼 자료 간 차이가 있을 수 있는 항목은 고정 숫자 대신
          중국 내 주요 생산 기지로 표기했습니다. 독일 관련 표현은 제조국이
          아니라 R&D 협력 기반과 품질 기준 지향으로 한정했습니다.
        </p>
      </div>
    </section>
  );
}
