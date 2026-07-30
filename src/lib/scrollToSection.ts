export function scrollToSection(id: string, headerOffset?: number) {
  if (typeof window === "undefined") return;

  const target = document.getElementById(id);

  if (!target) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const isMobileNavigation = window.matchMedia("(max-width: 1023px)").matches;
  const defaultOffset = Math.ceil(
    header?.getBoundingClientRect().height ??
      (isMobileNavigation ? 65 : 77),
  );
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
