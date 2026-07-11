import PalletVisual from "@/components/ui/PalletVisual";
import StatCard from "@/components/ui/StatCard";
import { LinkButton } from "@/components/ui/Button";
import { trustNumbers } from "@/lib/constants";

export default function HeroSection() {
  return (
    <section id="hero" className="mx-auto grid w-full max-w-[1200px] gap-10 px-5 py-14 md:grid-cols-[1.1fr_0.9fr] md:items-center lg:px-8 lg:py-24">
      <div>
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
          <LinkButton href="#comparison" variant="secondary">
            제품 비교 보기
          </LinkButton>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {trustNumbers.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute -right-4 -top-4 hidden h-28 w-28 border border-[var(--accent-gold)] md:block" />
        <PalletVisual />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-[var(--primary-deep)] p-5 text-white">
            <p className="en text-sm font-bold text-[var(--accent-gold)]">
              Export Packaging
            </p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              훈증 부담을 낮춘 글로벌 수출 포장 대응
            </p>
          </div>
          <div className="rounded-lg bg-white p-5">
            <p className="en text-sm font-bold text-[var(--primary)]">
              Molded Precision
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--sub-text)]">
              제품 형상에 맞춘 안정적인 적재 설계
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
