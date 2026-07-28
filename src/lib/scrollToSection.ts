export function scrollToSection(id: string, headerOffset?: number) {
  if (typeof window === "undefined") return;

  const target = document.getElementById(id);

  if (!target) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isMobileNavigation = window.matchMedia("(max-width: 1023px)").matches;
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const mobileNavigation = document.querySelector<HTMLElement>(
    "[data-mobile-navigation]",
  );
  const defaultOffset = isMobileNavigation
    ? (mobileNavigation?.offsetHeight ?? 56)
    : Math.max(header?.getBoundingClientRect().bottom ?? 76, 0);
  const offset = headerOffset ?? defaultOffset;
  const top =
    id === "hero"
      ? 0
      : target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: Math.max(top, 0),
    behavior:
      prefersReducedMotion || isMobileNavigation ? "auto" : "smooth",
  });
}
