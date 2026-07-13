"use client";

import Image from "next/image";
import { useState } from "react";
import PalletVisual from "@/components/ui/PalletVisual";

export default function HeroProductVisual() {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <>
        <div className="md:hidden">
          <PalletVisual aspect="aspect-square" />
        </div>
        <div className="hidden md:block">
          <PalletVisual aspect="aspect-[4/3]" />
        </div>
      </>
    );
  }

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--muted-surface)] md:aspect-[4/3]">
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet="/images/hero-mobile.webp"
        />
        <Image
          alt="ADS 친환경 몰드 팔레트 대표 제품"
          className="object-contain p-4 sm:p-6"
          fill
          onError={() => setImageFailed(true)}
          sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1200px) 45vw, 520px"
          src="/images/hero-desktop.webp"
        />
      </picture>
    </div>
  );
}
