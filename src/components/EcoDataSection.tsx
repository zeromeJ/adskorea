import SectionTitle from "@/components/ui/SectionTitle";
import { carbonData, ecoCards } from "@/lib/constants";

const maxCarbonValue = Math.max(...carbonData.map((item) => item.value));

export default function EcoDataSection() {
  return (
    <section id="eco" className="bg-[var(--primary-deep)] px-5 pt-14 pb-16 lg:px-8 lg:pb-20">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <div>
          <SectionTitle
            dark
            eyebrow="Eco Data"
            title="저탄소 물류 전환을 위한 친환경 팔레트"
            description="농림 부산물을 활용한 원료와 MDI 친환경 접착제를 적용해 자원 순환성과 친환경성을 고려했습니다."
          />
          <p className="mt-6 text-base leading-8 text-white/72">
            MDI 친환경 몰드 팔레트는 농림 부산물을 활용해 자원 순환성을
            높이고, 친환경 MDI 접착제를 적용해 포름알데히드 방출 부담을
            줄입니다. 기존 플라스틱 팔레트와 원목 팔레트 대비 낮은 탄소
            배출량을 제시하며, 기업의 ESG 및 저탄소 물류 전환에 활용할 수
            있는 제품입니다.
          </p>
          <p className="mt-5 rounded-md border border-white/12 bg-white/[0.04] p-4 text-sm leading-6 text-white/62">
            자료 기준 제품별 총 탄소 배출량 비교 데이터입니다. 세부 기준과
            조건은 제품 탄소발자국 인증 자료를 기준으로 확인해야 합니다.
            제품 탄소발자국 인증서 유효기간: 2026년 6월 12일까지.
          </p>
        </div>
        <div className="flex flex-col">
          <div className="rounded-lg border border-white/12 bg-white/[0.04] p-5">
            <p className="en mb-6 text-sm font-bold text-[var(--accent-gold)]">
              Carbon Comparison / kg CO₂e
            </p>
            <div className="grid gap-5">
              {carbonData.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm text-white">
                    <span>{item.label}</span>
                    <span className="number font-bold">{item.value}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[var(--accent-gold)]"
                      style={{ width: `${(item.value / maxCarbonValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-auto lg:pt-4">
            {ecoCards.map((card) => (
              <div
                className="rounded-lg border border-white/12 bg-white/[0.04] p-3 text-[13px] leading-5 font-bold text-white sm:p-4 sm:text-sm"
                key={card}
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
