"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { scrollToSection } from "@/lib/scrollToSection";

export default function HashScrollHandler() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;

    function scrollToHash(hash = window.location.hash) {
      const rawId = hash.replace(/^#/, "");
      if (!rawId) return;

      let id = rawId;
      try {
        id = decodeURIComponent(rawId);
      } catch {
        // 잘못 인코딩된 해시는 원문 그대로 조회합니다.
      }

      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => scrollToSection(id));
      });
    }

    function handleAnchorClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      const hash = url.hash;
      if (!hash) return;

      if (url.origin !== window.location.origin) return;

      event.preventDefault();
      const destination = `${url.pathname}${url.search}${hash}`;
      const samePage =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;

      if (samePage) {
        if (destination !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
          window.history.pushState(null, "", destination);
        }
        scrollToHash(hash);
        return;
      }

      router.push(destination, { scroll: false });
    }

    const handleHashChange = () => scrollToHash();

    scrollToHash();
    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [pathname, router]);

  return null;
}
