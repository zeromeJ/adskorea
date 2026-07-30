import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HashScrollHandler from "@/components/HashScrollHandler";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import { getWebsiteContent } from "@/lib/websiteContent";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://adskorea.co.kr"),
  title: {
    default: "아델슨 코리아 | MDI 압축성형 목재 팔레트",
    template: "%s | 아델슨 코리아",
  },
  description:
    "제3자 시험자료와 실제 운용조건을 바탕으로 검토하는 아델슨 MDI 압축성형 산업용 목재 팔레트",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "아델슨 코리아",
    title: "아델슨 코리아 | MDI 압축성형 목재 팔레트",
    description:
      "제3자 시험자료와 실제 운용조건을 바탕으로 검토하는 MDI 압축성형 산업용 목재 팔레트",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "아델슨 코리아 MDI 압축성형 목재 팔레트",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "아델슨 코리아 | MDI 압축성형 목재 팔레트",
    description:
      "제3자 시험자료와 실제 운용조건을 바탕으로 검토하는 MDI 압축성형 산업용 목재 팔레트",
    images: ["/og.png"],
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getWebsiteContent();
  const settings = content?.siteSettings;
  const displayName =
    settings?.siteDisplayName || settings?.brandName || "아델슨 코리아";

  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <a className="skip-link" href="#main-content">
          본문 바로가기
        </a>
        <Header brandName={displayName} logoUrl={settings?.logoUrl} />
        <HashScrollHandler />
        {children}
        <FloatingContactButtons />
        <Footer settings={settings} />
      </body>
    </html>
  );
}
