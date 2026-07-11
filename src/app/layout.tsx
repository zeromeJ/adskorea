import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADS Korea",
  description:
    "친환경 MDI 몰드 팔레트로 수출 포장, 보관 효율, B2B 물류 비용 개선에 기여하는 ADS 아델슨 랜딩 페이지",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
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
