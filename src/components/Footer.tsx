"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/catalog/siteConfig";
import { company, navItems } from "@/lib/constants";

export type FooterSettings = {
  siteDisplayName?: string;
  brandName?: string;
  primaryContactEmail?: string;
  primaryPhone?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export default function Footer({ settings }: { settings?: FooterSettings }) {
  const pathname = usePathname();
  const brandName =
    settings?.siteDisplayName || settings?.brandName || company.brandName;
  const email = siteConfig.contact.email;
  const phone = siteConfig.contact.phoneDisplay;
  const address = siteConfig.contact.address;
  const phoneHref = siteConfig.contact.phoneHref;
  const footerItems = pathname === "/catalog"
    ? [
        { label: "제품", href: "#product-overview" },
        { label: "성능", href: "#test-2025" },
        { label: "적용사례", href: "#applications" },
        { label: "자료", href: "#documents" },
        { label: "회사", href: "#company" },
        { label: "견적 문의", href: "#contact" },
      ]
    : [...navItems, { label: "견적 문의", href: "/#inquiry", children: [] }];

  return (
    <footer className="bg-[var(--primary-deep)] px-5 py-12 text-white lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <Image
            alt=""
            className="h-10 w-auto object-contain"
            height={540}
            src="/images/logo_white_new.png"
            width={966}
          />
          <p className="mt-4 font-extrabold">{brandName}</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-white/65">
            제3자 시험자료와 실제 운용조건을 바탕으로 검토하는 MDI 압축성형
            산업용 목재 팔레트
          </p>
        </div>

        <nav aria-label="푸터 메뉴" className="grid content-start gap-1">
          {footerItems.map((item) => (
            <Link
              className="flex min-h-11 items-center text-sm font-bold text-white/75 hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="text-sm leading-7 text-white/70">
          <p className="en mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-gold)]">
            Contact
          </p>
          {phone ? (
            <p>
              대표 전화{" "}
              <a className="font-bold text-white hover:underline" href={phoneHref}>
                {phone}
              </a>
            </p>
          ) : null}
          {email ? (
            <p>
              대표 이메일{" "}
              <a
                className="break-all font-bold text-white hover:underline"
                href={`mailto:${email}`}
              >
                {email}
              </a>
            </p>
          ) : null}
          {address ? <p className="mt-1">주소 {address}</p> : null}
          {pathname !== "/catalog" ? <Link
            className="mt-5 inline-flex min-h-12 items-center gap-2 border border-[var(--sub-sage)] bg-[var(--sub-mint)] px-4 font-extrabold text-[var(--primary-deep)] hover:bg-[#cfe0d2]"
            href="/catalog"
          >
            <BookOpen aria-hidden="true" size={18} />
            웹 카탈로그 보기
          </Link> : null}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-[1200px] flex-col gap-4 border-t border-white/12 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-5">
          <Link className="hover:text-white" href="/privacy">
            개인정보처리방침
          </Link>
          <Link className="hover:text-white" href="/documents/usage">
            자료 이용 안내
          </Link>
        </div>
        <p>Copyright © 2026 아델슨 코리아. All rights reserved.</p>
      </div>
    </footer>
  );
}
