"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  BookOpen,
  Menu,
  MessageSquareText,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navItems } from "@/lib/constants";
import { trackEvent } from "@/lib/trackEvent";

export default function Header({
  logoUrl,
  brandName = "아델슨 코리아",
}: {
  logoUrl?: string;
  brandName?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const desktopCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const catalogNavItems = [
    { label: "제품", href: "/catalog#product-overview", children: [{ label: "제품 개요", href: "/catalog#product-overview" }, { label: "제품 라인업", href: "/catalog#lineup" }] },
    { label: "성능", href: "/catalog#test-2025", children: [{ label: "2025 물리성능", href: "/catalog#test-2025" }, { label: "2026 TBK 시험", href: "/catalog#test-2026" }, { label: "환경 검증", href: "/catalog#carbon-footprint" }] },
    { label: "적용사례", href: "/catalog#applications", children: [] },
    { label: "자료", href: "/catalog#documents", children: [{ label: "공식 문서 자료실", href: "/catalog#documents" }] },
    { label: "회사", href: "/catalog#company", children: [{ label: "회사 및 생산 역량", href: "/catalog#company" }, { label: "R&D·품질관리", href: "/catalog#rnd-quality" }] },
  ];
  const resolvedNavItems = pathname === "/catalog" ? catalogNavItems : navItems;
  const contactHref = pathname === "/catalog" ? "/catalog#contact" : "/#inquiry";

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (event.key === "Tab") {
        const dialog = document.getElementById("mobile-navigation");
        const focusable = dialog?.querySelectorAll<HTMLElement>(
          "button, a[href], [tabindex]:not([tabindex='-1'])",
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDesktopMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (desktopCloseTimerRef.current) {
        clearTimeout(desktopCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const ids = pathname === "/catalog"
      ? ["market", "product-overview", "advantages", "comparison", "structure", "manufacturing", "performance-videos", "test-2025", "test-2026", "formaldehyde", "carbon-footprint", "lineup", "specifications", "application-check", "applications", "company", "rnd-quality", "documents", "application-review", "contact"]
      : pathname === "/"
        ? ["customer-applications"]
        : [];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);
        if (visible[0]) setActiveAnchor(visible[0].target.id);
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) {
      return pathname === "/" && activeAnchor === href.split("#")[1];
    }
    if (href.startsWith("/catalog#")) {
      if (pathname !== "/catalog") return false;
      const target = href.split("#")[1];
      const groups: Record<string, string[]> = {
        "product-overview": ["market", "product-overview", "advantages", "comparison", "structure", "manufacturing", "lineup", "specifications"],
        "test-2025": ["performance-videos", "test-2025", "test-2026", "formaldehyde", "carbon-footprint"],
        applications: ["application-check", "applications"],
        documents: ["documents"],
        company: ["company", "rnd-quality"],
        contact: ["application-review", "contact"],
      };
      return (groups[target] || [target]).includes(activeAnchor);
    }
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  function cancelDesktopMenuClose() {
    if (!desktopCloseTimerRef.current) return;
    clearTimeout(desktopCloseTimerRef.current);
    desktopCloseTimerRef.current = null;
  }

  function openDesktopMenu() {
    cancelDesktopMenuClose();
    setDesktopMenuOpen(true);
  }

  function closeDesktopMenu() {
    cancelDesktopMenuClose();
    setDesktopMenuOpen(false);
  }

  function scheduleDesktopMenuClose() {
    cancelDesktopMenuClose();
    desktopCloseTimerRef.current = setTimeout(() => {
      setDesktopMenuOpen(false);
      desktopCloseTimerRef.current = null;
    }, 140);
  }

  function closeMenu() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-[rgba(247,245,239,0.96)] backdrop-blur-xl ${scrolled ? "border-b border-[var(--line)]" : "border-b border-transparent"}`}
      data-site-header
    >
      <div className="mx-auto flex h-16 w-[calc(100%-32px)] max-w-[1240px] items-center justify-between gap-4 lg:grid lg:h-[76px] lg:w-[calc(100%-40px)] lg:grid-cols-[92px_minmax(0,1fr)_112px] lg:gap-8">
        <Link
          aria-label={`${brandName} 홈`}
          className="flex shrink-0 items-center"
          href="/"
        >
          <Image
            alt=""
            className="h-8 w-auto object-contain lg:h-10"
            height={540}
            priority
            src={logoUrl || "/images/logo_new.png"}
            unoptimized={Boolean(logoUrl?.startsWith("http"))}
            width={966}
          />
        </Link>

        <nav
          aria-label="주요 메뉴"
          className="hidden min-w-0 grid-cols-5 items-center gap-2 whitespace-nowrap text-sm text-[var(--sub-text)] lg:grid"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              scheduleDesktopMenuClose();
            }
          }}
          onMouseEnter={openDesktopMenu}
          onMouseLeave={scheduleDesktopMenuClose}
        >
          {resolvedNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                aria-controls="desktop-sitemap"
                aria-current={active ? "page" : undefined}
                aria-expanded={desktopMenuOpen}
                aria-haspopup="true"
                className={`inline-flex min-h-11 items-center justify-center px-2 text-center transition-colors focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
                  active
                    ? "font-extrabold text-[var(--primary-dark)]"
                    : "font-medium hover:text-[var(--primary)]"
                }`}
                href={item.href}
                key={item.href}
                onClick={closeDesktopMenu}
                onFocus={openDesktopMenu}
              >
                {item.label}
                <ChevronDown
                  aria-hidden="true"
                  className={`ml-1 h-3.5 w-3.5 transition-transform ${
                    desktopMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-3 text-sm font-extrabold text-white transition hover:bg-[var(--primary-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:px-4"
            href={contactHref}
          >
            <MessageSquareText aria-hidden="true" size={17} />
            <span className="hidden sm:inline">견적 문의</span>
            <span className="sm:hidden">문의</span>
          </Link>
          <button
            aria-controls="mobile-navigation"
            aria-expanded={open}
            aria-label="전체 메뉴 열기"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--line)] bg-white text-[var(--primary-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] lg:hidden"
            onClick={() => setOpen(true)}
            ref={triggerRef}
            type="button"
          >
            <Menu aria-hidden="true" size={22} />
          </button>
        </div>
      </div>

      {desktopMenuOpen ? (
        <div
          className="absolute top-full left-0 z-[60] hidden w-full border-t border-[var(--line)] bg-[rgba(247,245,239,0.98)] shadow-[0_12px_22px_rgba(16,37,29,0.08)] backdrop-blur-xl motion-safe:animate-[header-dropdown-in_160ms_ease-out] lg:block"
          id="desktop-sitemap"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              scheduleDesktopMenuClose();
            }
          }}
          onFocus={cancelDesktopMenuClose}
          onMouseEnter={cancelDesktopMenuClose}
          onMouseLeave={scheduleDesktopMenuClose}
        >
          <div className="mx-auto grid w-[calc(100%-40px)] max-w-[1240px] grid-cols-[92px_minmax(0,1fr)_112px] gap-8 py-4">
            <div aria-hidden="true" />
            <div className="grid min-w-0 grid-cols-5 gap-2">
              {resolvedNavItems.map((item) => (
                <div className="grid min-w-0 content-start gap-1" key={item.href}>
                  {item.children.map((child) => (
                    <Link
                      className="flex min-h-9 items-center justify-center px-2 text-center text-xs font-medium text-[var(--sub-text)] transition-colors hover:bg-white/70 hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
                      href={child.href}
                      key={`${item.href}:${child.label}`}
                      onClick={closeDesktopMenu}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <div aria-hidden="true" />
          </div>
        </div>
      ) : null}

      {open ? (
        <div
          aria-label="모바일 전체 메뉴"
          aria-modal="true"
          className="fixed inset-0 z-[70] bg-[rgba(9,24,18,0.5)] lg:hidden"
          id="mobile-navigation"
          role="dialog"
        >
          <div className="ml-auto flex min-h-dvh w-[min(88vw,380px)] flex-col bg-[var(--background)] shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-[var(--line)] px-5">
              <strong className="text-base">전체 메뉴</strong>
              <button
                aria-label="전체 메뉴 닫기"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--line)] bg-white focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
                onClick={closeMenu}
                ref={closeButtonRef}
                type="button"
              >
                <X aria-hidden="true" size={22} />
              </button>
            </div>
            <nav aria-label="모바일 주요 메뉴" className="grid p-5">
              {resolvedNavItems.map((item) => (
                <Link
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`flex min-h-14 items-center border-l-4 px-4 text-base font-extrabold ${
                    isActive(item.href)
                      ? "border-[var(--accent-gold)] bg-[var(--primary-dark)] text-white"
                      : "border-transparent border-b-[var(--line)] text-[var(--primary-deep)]"
                  }`}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                className="mt-3 flex min-h-14 items-center border-l-4 border-transparent px-4 text-base font-extrabold text-[var(--primary-deep)]"
                href={contactHref}
                onClick={() => setOpen(false)}
              >
                견적 문의
              </Link>
            </nav>
            <div className="mt-auto border-t border-[var(--line)] p-5">
              <Link
                className="flex min-h-12 items-center justify-center gap-2 border border-[var(--sub-sage)] bg-[var(--sub-mint)] px-4 font-extrabold text-[var(--primary-deep)]"
                href={pathname === "/catalog" ? "/catalog#catalog-guide" : "/catalog"}
                onClick={() => trackEvent("catalog_view", { location: "mobile_menu" })}
              >
                <BookOpen aria-hidden="true" size={19} />
                {pathname === "/catalog" ? "카탈로그 목차" : "웹 카탈로그 보기"}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
