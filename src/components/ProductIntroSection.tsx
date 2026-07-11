import PalletVisual from "@/components/ui/PalletVisual";
import SectionTitle from "@/components/ui/SectionTitle";
import { processSteps } from "@/lib/constants";

export default function ProductIntroSection() {
  return (
    <section id="product" className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <PalletVisual />
          <div className="mt-4 rounded-lg border border-[var(--line)] bg-white p-5">
            <p className="en text-sm font-bold text-[var(--accent-gold)]">
              Integrated Molding Process
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {processSteps.map((step) => (
                <span
                  className="rounded-md bg-[var(--muted-surface)] px-3 py-2 text-sm font-bold text-[var(--primary-dark)]"
                  key={step}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div>
          <SectionTitle
            eyebrow="Product Intro"
            title="MDI 친환경 몰드 팔레트란?"
            description="MDI 친환경 몰드 팔레트는 목재 폐기물, 짚, 대나무 등 농림 부산물을 주원료로 사용하고, MDI 친환경 접착제를 더해 고온·고압 조건에서 일체형으로 성형한 물류 포장재입니다."
          />
          <p className="mt-6 text-base leading-8 text-[var(--sub-text)]">
            기존 목재 팔레트의 수출 처리 부담과 품질 편차를 줄이고,
            친환경성과 구조적 안정성을 동시에 고려한 차세대 팔레트
            솔루션입니다.
          </p>
          <div className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
            <p className="text-sm font-bold text-[var(--primary)]">자료 기준</p>
            <p className="mt-2 text-sm leading-7 text-[var(--sub-text)]">
              모델별 성능과 적용 조건은 제품 규격, 사용 환경, 시험 조건에 따라
              달라질 수 있습니다. 상세 사양은 문의를 통해 확인 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
