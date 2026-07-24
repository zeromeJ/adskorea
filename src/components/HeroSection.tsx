import MediaPlaceholder from "@/components/ui/MediaPlaceholder";
import { LinkButton } from "@/components/ui/Button";
import { heroMetrics } from "@/lib/constants";

type HeroSectionProps = {
  desktopImage?: string;
  mobileImage?: string;
  mobileAspectRatio?: string;
};

export default function HeroSection({
  desktopImage,
  mobileImage,
  mobileAspectRatio,
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="mx-auto w-full max-w-[1200px] px-[clamp(20px,3vw,32px)] pt-8 pb-12"
    >
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
        <div>
          <p className="en text-sm font-bold uppercase tracking-[0.12em] text-[var(--accent-gold)]">
            MDI-bonded Compressed Wood Pallet
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl leading-tight font-bold text-[var(--text)] sm:text-5xl lg:text-[54px]">
            수출은 더 간편하게,
            <br />
            보관은 더 효율적으로,
            <br />
            물류 비용은 더 낮게.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--sub-text)] sm:text-lg sm:leading-8">
            시험 데이터로 성능을 확인한, MDI 압축성형 산업용 목재 팔레트
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="#product-lineup">제품 라인업 보기</LinkButton>
            <LinkButton href="#inquiry" variant="secondary">
              견적 및 문의
            </LinkButton>
          </div>
        </div>

        <MediaPlaceholder
          alt="MDI 압축성형 목재 팔레트 또는 수출 적재 현장"
          desktopRatio="16:9"
          desktopSrc={desktopImage}
          fieldName="homePage.hero.desktopImage"
          guide="PC는 16:9 편집본, 모바일은 업로드한 원본 비율로 표시"
          label="히어로 이미지"
          mobileRatio={mobileAspectRatio ?? "16:9"}
          mobileSrc={mobileImage ?? desktopImage}
          expandable={false}
          required
        />
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {heroMetrics.map((metric) => (
          <article
            className="rounded-lg border border-[var(--line)] bg-white px-5 py-4"
            key={metric.description}
          >
            <p className="number whitespace-nowrap text-xl font-bold text-[var(--primary)] sm:text-3xl">
              {metric.value}
            </p>
            <p className="en mt-1 text-xs font-bold text-[var(--text)]">
              {metric.label}
            </p>
            <p className="mt-2 text-sm leading-5 text-[var(--sub-text)]">
              {metric.description}
            </p>
          </article>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--sub-text)]">
        각 수치는 서로 다른 시험·검증자료와 적용 모델을 기준으로 합니다. 상세 조건은 해당 문서를 참조하십시오.
      </p>
    </section>
  );
}
