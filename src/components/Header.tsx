"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { navItems } from "@/lib/constants";
import { scrollToSection } from "@/lib/scrollToSection";
import { LinkButton } from "@/components/ui/Button";

type NavigationItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const desktopNavItems: NavigationItem[] = navItems;

const trackedNavItems: NavigationItem[] = [
  ...navItems,
  { label: "견적 문의", href: "#inquiry" },
];

const mobileNavItems: NavigationItem[] = [
  { label: "홈", href: "#hero" },
  { label: "도입 전 과제", href: "#problem" },
  ...trackedNavItems,
];

const trackedSectionIds = Array.from(
  new Set(
    mobileNavItems.flatMap((item) => [
      item.href.slice(1),
      ...(item.children ?? []).map((child) => child.href.slice(1)),
    ]),
  ),
);

export default function Header({
  logoUrl,
  brandName = "ADS 아델슨",
}: {
  logoUrl?: string;
  brandName?: string;
}) {
  const [activeSection, setActiveSection] = useState("");
  const [mobileLogoVisible, setMobileLogoVisible] = useState(true);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const closeMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchPrimedMenuRef = useRef<string | null>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const activeMobileSection =
    mobileNavItems.find(
      (item) =>
        activeSection === item.href.slice(1) ||
        item.children?.some((child) => activeSection === child.href.slice(1)),
    )?.href.slice(1) ?? activeSection;

  useEffect(() => {
    let frameId = 0;
    const updateActiveSection = () => {
      frameId = 0;
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      const headerHeight = Math.max(header?.getBoundingClientRect().bottom ?? 64, 0);
      const activationLine = headerHeight + 28;
      let current = "";
      let nearestTop = Number.NEGATIVE_INFINITY;

      for (const sectionId of trackedSectionIds) {
        const section = document.getElementById(sectionId);
        const sectionTop = section?.getBoundingClientRect().top;
        if (
          sectionTop !== undefined &&
          sectionTop <= activationLine &&
          sectionTop > nearestTop
        ) {
          current = sectionId;
          nearestTop = sectionTop;
        }
      }

      setActiveSection(current);
    };
    const handleScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    let lastY = Math.max(window.scrollY, 0);
    let accumulatedDistance = 0;
    let direction: "up" | "down" | null = null;
    let frameId = 0;

    const updateLogoVisibility = () => {
      frameId = 0;
      const currentY = Math.max(window.scrollY, 0);

      if (window.innerWidth >= 1024 || currentY <= 24) {
        setMobileLogoVisible(true);
        lastY = currentY;
        accumulatedDistance = 0;
        direction = null;
        return;
      }

      const delta = currentY - lastY;
      lastY = currentY;
      if (Math.abs(delta) < 1) return;

      const nextDirection = delta > 0 ? "down" : "up";
      if (nextDirection !== direction) {
        direction = nextDirection;
        accumulatedDistance = 0;
      }
      accumulatedDistance += Math.abs(delta);

      if (
        direction === "down" &&
        currentY > 80 &&
        accumulatedDistance >= 48
      ) {
        setMobileLogoVisible(false);
        accumulatedDistance = 0;
      } else if (direction === "up" && accumulatedDistance >= 32) {
        setMobileLogoVisible(true);
        accumulatedDistance = 0;
      }
    };

    const handleViewportChange = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateLogoVisibility);
    };

    updateLogoVisibility();
    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    return () => {
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!activeMobileSection || !mobileNavRef.current) return;
    const activeItem = mobileNavRef.current.querySelector<HTMLElement>(
      `[data-mobile-section="${activeMobileSection}"]`,
    );
    if (!activeItem) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = mobileNavRef.current;
    const centeredPosition =
      activeItem.offsetLeft + activeItem.offsetWidth / 2 - nav.clientWidth / 2;
    const maxScrollPosition = Math.max(nav.scrollWidth - nav.clientWidth, 0);
    mobileNavRef.current.scrollTo({
      left: Math.min(Math.max(centeredPosition, 0), maxScrollPosition),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [activeMobileSection]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenDesktopMenu(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      if (closeMenuTimerRef.current) clearTimeout(closeMenuTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const storageKey = `ads-scroll-position:${window.location.pathname}`;
    const previousRestoration = window.history.scrollRestoration;
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const shouldRestore = !window.location.hash && (navigation?.type === "reload" || navigation?.type === "back_forward");
    let frameId = 0;
    let restoring = shouldRestore;

    window.history.scrollRestoration = "manual";
    if (shouldRestore) {
      const savedPosition = Number(window.sessionStorage.getItem(storageKey));
      if (Number.isFinite(savedPosition)) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            window.scrollTo({ top: savedPosition, behavior: "auto" });
            restoring = false;
          });
        });
      } else {
        restoring = false;
      }
    }

    const savePosition = () => {
      frameId = 0;
      if (restoring) return;
      window.sessionStorage.setItem(storageKey, String(window.scrollY));
    };
    const handleScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(savePosition);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", savePosition);
    return () => {
      savePosition();
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", savePosition);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  function navigate(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    setOpenDesktopMenu(null);
    scrollToSection(href.slice(1));
  }

  function cancelScheduledMenuClose() {
    if (!closeMenuTimerRef.current) return;
    clearTimeout(closeMenuTimerRef.current);
    closeMenuTimerRef.current = null;
  }

  function openMenu(label: string) {
    cancelScheduledMenuClose();
    setOpenDesktopMenu(label);
  }

  function scheduleMenuClose() {
    cancelScheduledMenuClose();
    closeMenuTimerRef.current = setTimeout(() => {
      setOpenDesktopMenu(null);
      closeMenuTimerRef.current = null;
    }, 180);
  }

  function handleTopLevelNavigation(
    event: React.MouseEvent<HTMLAnchorElement>,
    item: NavigationItem,
  ) {
    const usesTouchNavigation = window.matchMedia(
      "(hover: none), (pointer: coarse)",
    ).matches;
    if (
      usesTouchNavigation &&
      (touchPrimedMenuRef.current === item.label || openDesktopMenu !== item.label)
    ) {
      event.preventDefault();
      touchPrimedMenuRef.current = null;
      openMenu(item.label);
      return;
    }
    navigate(event, item.href);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-[rgba(247,245,239,0.96)] backdrop-blur-xl transition-transform duration-200 motion-reduce:transition-none ${openDesktopMenu ? "border-transparent" : "border-[var(--line)]"} ${mobileLogoVisible ? "translate-y-0" : "-translate-y-12 md:-translate-y-14 lg:translate-y-0"}`}
      data-site-header
    >
      <div
        className={`mx-auto flex h-12 w-[calc(100%-32px)] max-w-[1240px] items-center justify-between gap-4 overflow-hidden transition-opacity duration-200 md:h-14 md:w-[calc(100%-40px)] lg:grid lg:h-[76px] lg:grid-cols-[72px_minmax(0,1fr)_104px] lg:gap-6 lg:overflow-visible lg:opacity-100 xl:grid-cols-[82px_minmax(0,1fr)_112px] xl:gap-8 ${mobileLogoVisible ? "opacity-100" : "opacity-0"}`}
      >
        <a
          aria-label={`${brandName} 홈`}
          className="flex shrink-0 items-center"
          href="#hero"
          onClick={(event) => navigate(event, "#hero")}
        >
          <Image
            alt={`${brandName} logo`}
            className="h-7 w-auto object-contain md:h-8 lg:h-9 xl:h-10"
            height={540}
            priority
            src={logoUrl || "/images/logo_new.png"}
            unoptimized={Boolean(logoUrl?.startsWith("http"))}
            width={966}
          />
        </a>

        <div className="hidden lg:contents">
          <nav
            className="grid min-w-0 grid-cols-6 items-center gap-2 whitespace-nowrap text-sm text-[var(--sub-text)] xl:gap-3"
            onMouseEnter={() => openMenu("sitemap")}
            onMouseLeave={scheduleMenuClose}
          >
            {desktopNavItems.map((item) => {
              const selected =
                activeSection === item.href.slice(1) ||
                item.children?.some(
                  (child) => activeSection === child.href.slice(1),
                );
              const isOpen = Boolean(openDesktopMenu);
              return (
                <div
                  className="relative min-w-0"
                  key={item.href}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      scheduleMenuClose();
                    }
                  }}
                  onFocus={() => openMenu(item.label)}
                >
                  <a
                    aria-controls="desktop-sitemap"
                    aria-current={selected ? "page" : undefined}
                    aria-expanded={Boolean(openDesktopMenu)}
                    aria-haspopup="true"
                    className={`inline-flex min-h-11 w-full items-center justify-center gap-1 px-1 text-center transition-colors duration-200 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] xl:px-2 ${
                      selected
                        ? "font-extrabold text-[var(--primary-dark)]"
                        : "font-medium hover:text-[var(--primary)]"
                    }`}
                    href={item.href}
                    onClick={(event) => handleTopLevelNavigation(event, item)}
                    onPointerDown={(event) => {
                      if (
                        event.pointerType !== "mouse" &&
                        openDesktopMenu !== item.label
                      ) {
                        touchPrimedMenuRef.current = item.label;
                      }
                    }}
                  >
                    {item.label}
                    <svg
                      aria-hidden="true"
                      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 16 16"
                    >
                      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                    </svg>
                  </a>
                </div>
              );
            })}
          </nav>
          <LinkButton aria-current={activeSection === "inquiry" ? "page" : undefined} className={`w-full shrink-0 whitespace-nowrap px-3 xl:px-4 ${activeSection === "inquiry" ? "ring-2 ring-[var(--sub-sage)] ring-offset-2" : ""}`} href="#inquiry">
            견적 문의
          </LinkButton>
        </div>

      </div>

      {openDesktopMenu ? (
        <div
          className="absolute top-full left-0 z-[70] hidden w-full bg-[rgba(247,245,239,0.96)] shadow-[0_12px_22px_rgba(16,37,29,0.08)] backdrop-blur-xl motion-safe:animate-[header-dropdown-in_160ms_ease-out] lg:block"
          id="desktop-sitemap"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              scheduleMenuClose();
            }
          }}
          onFocus={cancelScheduledMenuClose}
          onMouseEnter={cancelScheduledMenuClose}
          onMouseLeave={scheduleMenuClose}
        >
          <div className="mx-auto grid w-[calc(100%-40px)] max-w-[1240px] grid-cols-[72px_minmax(0,1fr)_104px] items-start gap-6 pt-1.5 pb-4 xl:grid-cols-[82px_minmax(0,1fr)_112px] xl:gap-8 xl:pt-2 xl:pb-5">
            <div aria-hidden="true" />
            <div className="grid min-w-0 grid-cols-6 gap-2 xl:gap-3">
              {desktopNavItems.map((item) => (
                <div className="grid min-w-0 content-start gap-0.5" key={item.href}>
                  {(item.children ?? []).map((child) => {
                    const childSelected = activeSection === child.href.slice(1);
                    return (
                      <a
                        aria-current={childSelected ? "page" : undefined}
                        className={`flex min-h-9 min-w-0 items-center justify-center whitespace-nowrap rounded-md px-1 text-center text-xs tracking-[-0.02em] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)] xl:px-2 xl:text-[13px] ${
                          childSelected
                            ? "font-extrabold text-[var(--primary-dark)]"
                            : "font-medium text-[var(--sub-text)] hover:bg-white/55 hover:text-[var(--primary)]"
                        }`}
                        href={child.href}
                        key={child.href}
                        onClick={(event) => navigate(event, child.href)}
                      >
                        {child.label}
                      </a>
                    );
                  })}
                </div>
              ))}
            </div>
            <div aria-hidden="true" />
          </div>
        </div>
      ) : null}

      <nav
        aria-label="모바일 섹션 내비게이션"
        className="touch-horizontal-scroller no-scrollbar flex w-full snap-x gap-2 overflow-x-auto border-t border-[var(--line)] px-4 py-2 lg:hidden"
        ref={mobileNavRef}
      >
        {mobileNavItems.map((item) => {
          const section = item.href.slice(1);
          const selected = activeMobileSection === section;
          return (
            <a
              aria-current={selected ? "page" : undefined}
              className={`inline-flex min-h-10 shrink-0 snap-start items-center justify-center rounded-xl border px-3.5 text-sm whitespace-nowrap transition ${selected ? "border-[var(--primary)] bg-[var(--primary)] font-extrabold text-white" : "border-[var(--line)] bg-transparent font-medium text-[var(--text)]"}`}
              data-mobile-section={section}
              href={item.href}
              key={item.href}
              onClick={(event) => navigate(event, item.href)}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </header>
  );
}
