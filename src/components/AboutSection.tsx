import PalletVisual from "@/components/ui/PalletVisual";
import SectionTitle from "@/components/ui/SectionTitle";

const credentials = [
  "20+ years in logistics packaging",
  "40,000㎡ manufacturing area",
  "12M annual capacity",
  "Exported to 50+ countries",
  "Strategic cooperation with German TOGREEN",
  "Intelligent production line",
  "Precision molded production technology",
];

export default function AboutSection() {
  return (
    <section id="about" className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="rounded-lg bg-[var(--primary-deep)] p-5">
          <PalletVisual dark />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-md bg-white/8 p-4 text-white">
              <p className="number text-3xl font-bold text-[var(--accent-gold)]">
                40,000㎡
              </p>
              <p className="mt-2 text-sm text-white/72">manufacturing area</p>
            </div>
            <div className="rounded-md bg-white/8 p-4 text-white">
              <p className="number text-3xl font-bold text-[var(--accent-gold)]">
                12M
              </p>
              <p className="mt-2 text-sm text-white/72">annual capacity</p>
            </div>
          </div>
        </div>
        <div>
          <SectionTitle
            eyebrow="About Manufacturing"
            title="Trusted Global Manufacturing Partner"
            description="ADS 아델슨은 친환경 물류 포장 기술과 정밀 몰드 생산 역량을 바탕으로 글로벌 수출 기업의 운영 효율을 지원합니다."
          />
          <div className="mt-8 grid gap-3">
            {credentials.map((item) => (
              <div
                className="flex items-center gap-3 rounded-md border border-[var(--line)] bg-white p-4"
                key={item}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-gold)]" />
                <span className="en text-sm font-bold text-[var(--text)]">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
