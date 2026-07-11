import Image from "next/image";
import SectionTitle from "@/components/ui/SectionTitle";
import StatCard from "@/components/ui/StatCard";
import { companyNetwork, companyStats } from "@/lib/constants";

export default function AboutSection() {
  return (
    <section id="about" className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="overflow-hidden rounded-lg bg-[var(--primary-deep)] p-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-white/5">
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
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {companyStats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {companyNetwork.map((item) => (
            <div
              className="rounded-lg border border-[var(--line)] bg-white p-5 text-sm font-bold leading-6 text-[var(--primary-dark)]"
              key={item}
            >
              {item}
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
