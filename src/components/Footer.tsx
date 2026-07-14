import Image from "next/image";
import { company } from "@/lib/constants";

type FooterSettings = {
  brandName?: string;
  brandNameEn?: string;
  legalCompanyName?: string;
  manufacturerName?: string;
  salesCompanyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
};

export default function Footer({ settings, hasCatalog = false }: { settings?: FooterSettings; hasCatalog?: boolean }) {
  const brandName = settings?.brandName || company.brandName;
  const brandNameEn = settings?.brandNameEn || company.brandNameEn;
  const email = settings?.email || company.email;
  const phone = settings?.phone || company.phone;
  const address = settings?.address || company.address;
  const logoUrl = "/images/logo_white_new.png";

  return (
    <footer className="bg-[var(--primary-deep)] px-5 py-12 text-white lg:px-8">
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <Image
            alt={`${brandName} logo`}
            className="h-12 w-auto object-contain"
            height={540}
            src={logoUrl}
            width={966}
          />
          <p className="mt-5 max-w-md text-sm leading-7 text-white/68">
            MDI계 접착 시스템과 고온·고압 압축성형 공정을 적용한 산업용
            압축성형 목재 팔레트 솔루션을 제공합니다.
          </p>
          <div className="mt-4 grid gap-1 text-xs leading-5 text-white/52">
            {settings?.legalCompanyName ? <p>법인명: {settings.legalCompanyName}</p> : null}
            {settings?.manufacturerName ? <p>제조사: {settings.manufacturerName}</p> : null}
            {settings?.salesCompanyName ? <p>판매사: {settings.salesCompanyName}</p> : null}
          </div>
        </div>
        <nav className="grid gap-6 sm:grid-cols-2 md:grid-cols-1">
          <div>
            <h3 className="text-sm font-bold text-[var(--accent-gold)]">제품</h3>
            <div className="mt-3 grid gap-2">{[["제품 소개", "#product-overview"], ["제품 라인업", "#product-lineup"], ["적용 분야", "#applications"]].map(([label, href]) => <a className="text-sm text-white/68 transition hover:text-white" href={href} key={href}>{label}</a>)}</div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--accent-gold)]">성능·자료</h3>
            <div className="mt-3 grid gap-2">{[["성능·기술", "#performance"], ["제품 성능 시연 영상", "#performance-videos"], ["환경 데이터", "#environment"], ["기술자료·시험·인증", "#documents"], ...(hasCatalog ? [["제품 카탈로그", "#catalog"]] : [])].map(([label, href]) => <a className="text-sm text-white/68 transition hover:text-white" href={href} key={href}>{label}</a>)}</div>
          </div>
        </nav>
        <div>
          <h3 className="en text-sm font-bold text-[var(--accent-gold)]">
            Contact
          </h3>
          <div className="mt-4 grid gap-2 text-sm leading-7 text-white/68">
            {email ? <p>Email: {email}</p> : null}
            {phone ? <p>Phone: {phone}</p> : null}
            {address ? <p>Address: {address}</p> : null}
          </div>
          <div className="mt-5 grid gap-2 text-sm"><a className="text-white/68 hover:text-white" href="#company">회사·생산</a><a className="font-bold text-white hover:text-[var(--accent-gold)]" href="#inquiry">견적 문의</a></div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-[1200px] border-t border-white/10 pt-6">
        <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60"><a className="hover:text-white" href="/privacy">개인정보처리방침</a><a className="hover:text-white" href="#documents">자료 이용 안내</a></div>
        <p className="en text-xs text-white/50">
          Copyright © 2026 {brandNameEn}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
