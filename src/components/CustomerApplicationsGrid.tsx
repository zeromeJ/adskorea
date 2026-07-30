"use client";

import Image from "next/image";
import SourceBadge from "@/components/SourceBadge";
import { trackEvent } from "@/lib/trackEvent";

export type CustomerApplicationItem = {
  title: string;
  description: string;
  imageUrl?: string;
  cargoType: string;
  operatingEnvironment: string;
  documentedWeight?: string;
  sourceLabel: string;
  sourcePage?: string;
  customerName?: string;
  showCustomerName: boolean;
  publicUseApproved: boolean;
  sortOrder: number;
  isVisible: boolean;
};

export default function CustomerApplicationsGrid({
  items,
}: {
  items: CustomerApplicationItem[];
}) {
  const visibleItems = items.filter(
    (item) => item.publicUseApproved && item.isVisible && item.imageUrl,
  );

  if (!visibleItems.length) {
    return (
      <div className="border border-[var(--line)] bg-white p-6 text-sm leading-7 text-[var(--sub-text)]">
        공개 사용 승인이 확인된 현장 사진을 등록한 뒤 사례 카드가 표시됩니다.
        고객사명과 제품 모델은 공개 승인 없이 노출하지 않습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {visibleItems.map((item) => (
        <article
          className="overflow-hidden border border-[var(--line)] bg-white"
          key={`${item.title}-${item.sortOrder}`}
          onMouseEnter={() =>
            trackEvent("customer_case_view", { case_title: item.title })
          }
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-[#e6ebe6]">
            {/* CMS image is already cropped from the source PDF without generative edits. */}
            <Image
              alt={`${item.title} 현장 적용 사진`}
              className="object-cover"
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
              src={item.imageUrl!}
            />
          </div>
          <div className="p-5">
            <SourceBadge kind="application" label={item.sourceLabel} />
            <h3 className="mt-4 text-xl font-extrabold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--sub-text)]">
              {item.description}
            </p>
            <dl className="mt-5 grid gap-2 border-t border-[var(--line)] pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--sub-text)]">화물 형태</dt>
                <dd className="text-right font-bold">{item.cargoType}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--sub-text)]">운용 환경</dt>
                <dd className="text-right font-bold">
                  {item.operatingEnvironment}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--sub-text)]">문서 기재 중량</dt>
                <dd className="text-right font-bold">
                  {item.documentedWeight || "중량 미기재"}
                </dd>
              </div>
              {item.showCustomerName && item.customerName ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--sub-text)]">고객사</dt>
                  <dd className="text-right font-bold">{item.customerName}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}
