import SectionTitle from "@/components/ui/SectionTitle";
import VideoCard from "@/components/ui/VideoCard";
import { videoLearningPoints } from "@/lib/constants";

type VideoSectionProps = {
  variant: "product" | "company";
};

export default function VideoSection({ variant }: VideoSectionProps) {
  const isProduct = variant === "product";

  return (
    <section className={`${isProduct ? "bg-[var(--muted-surface)]" : "bg-white"} px-5 pt-14 pb-16 lg:px-8 lg:pb-24`}>
      <div
        className={`mx-auto grid max-w-[1200px] gap-10 ${
          isProduct
            ? "lg:grid-cols-[1fr_0.8fr] lg:items-center"
            : "lg:grid-cols-[0.8fr_1fr] lg:items-start"
        }`}
      >
        <div className={isProduct ? "order-2 lg:order-1" : "order-2"}>
          <VideoCard
            description={
              isProduct
                ? "MDI 친환경 몰드 팔레트의 핵심 장점과 적용 효과를 소개합니다."
                : "ADS의 생산 인프라, R&D 협력, 제품 개발 및 글로벌 공급 역량을 소개합니다."
            }
            posterSrc={
              isProduct
                ? "/images/video-thumbnail-1.png"
                : "/images/video-thumbnail-2.png"
            }
            title={isProduct ? "제품 소개 영상" : "회사·기술 소개 영상"}
            videoSrc={
              isProduct
                ? "/videos/product-intro-placeholder.mp4"
                : "/videos/company-tech-placeholder.mp4"
            }
          />
        </div>
        <div className={isProduct ? "order-1 lg:order-2" : "order-1"}>
          <SectionTitle
            eyebrow={isProduct ? "Primary Video" : "Company Video"}
            title={
              isProduct
                ? "영상으로 확인하는 MDI 친환경 몰드 팔레트"
                : "회사와 생산 기술을 영상으로 확인하세요"
            }
            description={
              isProduct
                ? "제품 구조, 제조 공정, 친환경 소재, 수출 편의성, 글로벌 공급 역량을 한눈에 확인할 수 있습니다."
                : "생산 인프라, R&D 역량, 제조 공정, 글로벌 공급 네트워크를 영상으로 확인할 수 있습니다."
            }
          />
          {isProduct ? (
            <div className="mt-8 rounded-lg border border-[var(--line)] bg-white p-5">
              <p className="font-bold text-[var(--text)]">
                이 영상에서 확인할 수 있는 내용
              </p>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--sub-text)]">
                {videoLearningPoints.map((point) => (
                  <li className="flex gap-3" key={point}>
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
