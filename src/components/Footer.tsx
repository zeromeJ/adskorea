import Image from "next/image";
import { company, navItems } from "@/lib/constants";

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
  const phoneHref = phone ? `tel:${phone.replace(/[^+\d]/g, "")}` : "";
  const footerNavigation = [
    ...navItems.map((item) => ({
      ...item,
      children:
        item.href === "#performance" && hasCatalog
          ? [...item.children, { label: "제품 카탈로그", href: "#catalog" }]
          : item.children,
    })),
    { label: "견적 문의", href: "#inquiry", children: [] },
  ];

  return (
    <footer className="bg-[var(--primary-deep)] px-5 py-12 text-white lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 md:grid-cols-[1.35fr_1fr]">
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
          <div>
            <h3 className="en text-sm font-bold text-[var(--accent-gold)]">
              Contact
            </h3>
            <div className="mt-4 grid gap-2 text-sm leading-7 text-white/68">
              {email ? <p>Email: <a className="transition hover:text-white" href={`mailto:${email}`}>{email}</a></p> : null}
              {phone ? <p>Phone: <a className="transition hover:text-white" href={phoneHref}>{phone}</a></p> : null}
              {address ? <p>Address: {address}</p> : null}
            </div>
          </div>
        </div>

        <nav
          aria-label="푸터 메뉴"
          className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 border-y border-white/10 py-8 sm:grid-cols-3 lg:grid-cols-7"
        >
          {footerNavigation.map((item) => (
            <div className="min-w-0" key={item.href}>
              <a
                className="text-sm font-bold text-[var(--accent-gold)] transition hover:text-white"
                href={item.href}
              >
                {item.label}
              </a>
              {item.children.length ? (
                <div className="mt-3 grid gap-2">
                  {item.children.map((child) => (
                    <a
                      className="text-xs leading-5 text-white/68 transition hover:text-white"
                      href={child.href}
                      key={child.href}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </div>
      <div className="mx-auto mt-6 max-w-[1200px]">
        <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60"><a className="hover:text-white" href="/privacy">개인정보처리방침</a><a className="hover:text-white" href="#documents">자료 이용 안내</a></div>
        <p className="en text-xs text-white/50">
          Copyright © 2026 {brandNameEn}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
