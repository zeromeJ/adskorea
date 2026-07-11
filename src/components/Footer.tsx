import Image from "next/image";
import { company, navItems } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[var(--primary-deep)] px-5 py-12 text-white lg:px-8">
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <Image
            alt="ADS 아델슨 logo"
            className="h-12 w-auto object-contain brightness-0 invert"
            height={540}
            src="/images/logo-white.png"
            width={966}
          />
          <p className="mt-5 max-w-md text-sm leading-7 text-white/68">
            ADS 아델슨은 친환경 몰드 팔레트로 글로벌 수출 포장과 B2B
            물류 효율을 개선하는 제조 파트너입니다.
          </p>
        </div>
        <nav>
          <h3 className="en text-sm font-bold text-[var(--accent-gold)]">
            Navigation
          </h3>
          <div className="mt-4 grid gap-2">
            {navItems.map((item) => (
              <a
                className="text-sm text-white/68 transition hover:text-white"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
        <div>
          <h3 className="en text-sm font-bold text-[var(--accent-gold)]">
            Contact
          </h3>
          <div className="mt-4 grid gap-2 text-sm leading-7 text-white/68">
            <p>Email: {company.email}</p>
            <p>Phone: {company.phone}</p>
            <p>Address: {company.address}</p>
            <a className="transition hover:text-white" href="#">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-[1200px] border-t border-white/10 pt-6">
        <p className="en text-xs text-white/50">
          Copyright © 2026 ADS Adson. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
