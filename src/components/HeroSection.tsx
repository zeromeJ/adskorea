import PalletVisual from "@/components/ui/PalletVisual";
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
    <section id="hero" className="mx-auto grid w-full max-w-[1200px] gap-x-8 gap-y-9 px-5 py-14 md:grid-cols-[13fr_7fr] md:grid-rows-[1fr_auto] lg:px-8 lg:py-24">
      <div className="order-1 md:order-none md:col-start-1 md:row-start-1">
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
          친환경 몰드 팔레트로 글로벌 물류 환경에 최적화된 솔루션을
          제공합니다.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="#contact">견적 문의하기</LinkButton>
          <LinkButton href="#performance" variant="secondary">
            제품 사양 확인하기
          </LinkButton>
        </div>
        <div className="mt-6 flex max-w-3xl flex-wrap gap-2">
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
      </div>

      <div className="relative order-3 md:order-none md:col-start-2 md:row-start-1 md:self-end">
        <PalletVisual />
      </div>

      <div className="order-2 grid grid-cols-2 gap-3 md:order-none md:col-start-1 md:row-start-2 lg:grid-cols-4">
        {heroMetrics.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="order-4 grid grid-cols-2 gap-4 md:order-none md:col-start-2 md:row-start-2">
        <div className="h-full rounded-lg bg-[var(--primary-deep)] p-5 text-white">
          <p className="en text-sm font-bold text-[var(--accent-gold)]">
            Export Packaging
          </p>
          <p className="mt-2 text-sm leading-6 text-white/72">
            훈증·열처리 부담을 줄이는 데 도움을 주는 글로벌 수출 포장 대응
          </p>
        </div>
        <div className="h-full rounded-lg bg-white p-5">
          <p className="en text-sm font-bold text-[var(--primary)]">
            Molded Precision
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--sub-text)]">
            제품 형상에 맞춘 안정적인 적재 설계
          </p>
        </div>
      </div>
    </section>
  );
}
