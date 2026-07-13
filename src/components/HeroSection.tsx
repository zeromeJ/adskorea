import HeroProductVisual from "@/components/ui/HeroProductVisual";
import StatCard from "@/components/ui/StatCard";
import { LinkButton } from "@/components/ui/Button";
import { heroMetrics } from "@/lib/constants";

const trustPoints = [
  "20년 이상 산업 경험",
  "50개국 이상 공급",
  "연간 1,200만대 생산능력",
  "특허 및 기술 인증",
  "수출 포장 대응",
];

export default function HeroSection() {
  return (
    <section id="hero" className="mx-auto grid w-full max-w-[1200px] gap-x-10 gap-y-6 px-[clamp(20px,3vw,32px)] pt-10 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:grid-rows-[auto_auto_auto]">
      <div className="order-1 lg:col-start-1 lg:row-start-1">
        <p className="en mb-5 text-sm font-bold uppercase tracking-[0.12em] text-[var(--accent-gold)]">
          Eco-tech Molded Pallet
        </p>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight text-[var(--text)] sm:text-5xl lg:text-6xl">
          수출은 더 간편하게,
          <br />
          보관은 더 효율적으로,
          <br />
          물류 비용은 더 낮게.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--sub-text)]">
          수출 포장부터 자동화 물류까지,
          <br className="hidden md:block" />
          <br className="block md:hidden" />
          효율적인 운송을 위한 친환경 몰드 팔레트 솔루션
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="#contact">견적 문의하기</LinkButton>
          <LinkButton href="#product" variant="secondary">
            제품 알아보기
          </LinkButton>
        </div>
      </div>

      <div className="order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
        <HeroProductVisual />
      </div>

      <div className="order-3 grid grid-cols-3 gap-2 sm:gap-3 lg:col-start-1 lg:row-start-2">
        {heroMetrics.map((stat) => (
          <StatCard compact key={stat.label} {...stat} />
        ))}
      </div>

      <div className="order-4 flex flex-wrap gap-2 lg:col-span-2 lg:row-start-3">
        {trustPoints.map((point) => (
          <span
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-3 py-1.5 text-xs font-semibold text-[var(--primary-dark)]"
            key={point}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]" />
            {point}
          </span>
        ))}
      </div>
    </section>
  );
}
