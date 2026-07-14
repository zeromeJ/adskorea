export function scrollToSection(id: string, headerOffset?: number) {
  if (typeof window === "undefined") return;

  const target = document.getElementById(id);

  if (!target) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const defaultOffset =
    document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ??
    56;
  const offset = headerOffset ?? defaultOffset;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}
