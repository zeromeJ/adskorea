"use client";

import Image from "next/image";
import { useState } from "react";
import { navItems } from "@/lib/constants";
import { scrollToSection } from "@/lib/scrollToSection";
import { LinkButton } from "@/components/ui/Button";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  function handleNavigation(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    event.preventDefault();
    scrollToSection(href.slice(1));
  }

  function handleMobileNavigation(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    event.preventDefault();
    setIsOpen(false);
    requestAnimationFrame(() => scrollToSection(href.slice(1)));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(247,245,239,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1200px] items-center justify-between px-5 lg:px-8">
        <a
          className="flex items-center"
          href="#hero"
          aria-label="ADS 아델슨 home"
          onClick={(event) => handleNavigation(event, "#hero")}
        >
          <Image
            alt="ADS 아델슨 logo"
            className="h-11 w-auto object-contain"
            height={540}
            priority
            src="/images/logo_new.png"
            width={966}
          />
        </a>

        <nav className="hidden items-center gap-3 text-[13px] font-bold text-[var(--sub-text)] xl:gap-5 xl:text-sm lg:flex">
          {navItems.map((item) => (
            <a
              className="transition hover:text-[var(--primary)]"
              href={item.href}
              key={item.href}
              onClick={(event) => handleNavigation(event, item.href)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LinkButton href="#contact" variant="secondary">
            카탈로그 다운로드
          </LinkButton>
          <LinkButton href="#contact">견적 문의하기</LinkButton>
        </div>

        <button
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-[var(--line)] lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <span className="flex w-5 flex-col gap-1.5">
            <span className="h-0.5 rounded-full bg-[var(--text)]" />
            <span className="h-0.5 rounded-full bg-[var(--text)]" />
            <span className="h-0.5 rounded-full bg-[var(--text)]" />
          </span>
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-[var(--line)] bg-[var(--background)] px-5 py-5 lg:hidden">
          <nav className="mx-auto grid max-w-[1200px] gap-3">
            {navItems.map((item) => (
              <a
                className="rounded-md px-3 py-3 text-sm font-bold text-[var(--text)] hover:bg-white"
                href={item.href}
                key={item.href}
                onClick={(event) => handleMobileNavigation(event, item.href)}
              >
                {item.label}
              </a>
            ))}
            <LinkButton
              className="mt-2 w-full"
              href="#contact"
              onClick={(event) => handleMobileNavigation(event, "#contact")}
            >
              견적 문의하기
            </LinkButton>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
