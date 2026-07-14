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
  const targetPaddingTop = Number.parseFloat(
    window.getComputedStyle(target).paddingTop || "0",
  );
  // 섹션 앵커는 박스의 시작점이 아니라 내부 제목이 헤더 바로 아래에
  // 보이도록 맞춘다. 카드처럼 padding이 없는 하위 앵커는 기존 헤더
  // 오프셋을 그대로 사용한다.
  const offset =
    headerOffset ??
    Math.max(defaultOffset + 8 - Math.max(targetPaddingTop, 0), 8);
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
