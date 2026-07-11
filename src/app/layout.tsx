import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADS 아델슨 | Eco-tech Molded Pallet",
  description:
    "친환경 몰드 팔레트로 수출 포장, 보관 효율, B2B 물류 비용을 개선하는 ADS 아델슨 랜딩 페이지",
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
