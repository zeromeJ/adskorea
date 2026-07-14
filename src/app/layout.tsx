import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADS 아델슨 | MDI 압축성형 목재 팔레트",
  description:
    "시험 데이터와 제조사 제시 사양을 구분해 확인할 수 있는 ADS 아델슨 MDI 압축성형 목재 팔레트 B2B 제품 사이트",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
