"use client";

import { MessageSquareText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function FloatingContactButtons() {
  const pathname = usePathname();
  const [inquiryVisible, setInquiryVisible] = useState(false);

  useEffect(() => {
    const inquiry = document.getElementById("inquiry");
    if (!inquiry) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInquiryVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(inquiry);
    return () => observer.disconnect();
  }, [pathname]);

  if (pathname === "/" && inquiryVisible) return null;

  return (
    <Link
      aria-label="견적 및 문의 작성 화면으로 이동"
      className="fixed right-8 bottom-8 z-40 hidden min-h-[52px] items-center justify-center gap-2 bg-[var(--primary-dark)] px-5 text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(16,37,29,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-gold)] md:inline-flex"
      href="/#inquiry"
    >
      <MessageSquareText aria-hidden="true" size={18} />
      견적 문의하기
    </Link>
  );
}
