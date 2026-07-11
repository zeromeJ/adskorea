import AboutSection from "@/components/AboutSection";
import BenefitsSection from "@/components/BenefitsSection";
import ComparisonSection from "@/components/ComparisonSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import IndustriesSection from "@/components/IndustriesSection";
import InquirySection from "@/components/InquirySection";
import PerformanceSection from "@/components/PerformanceSection";
import ProductLineup from "@/components/ProductLineup";
import TrustNumbers from "@/components/TrustNumbers";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustNumbers />
        <BenefitsSection />
        <ProductLineup />
        <ComparisonSection />
        <PerformanceSection />
        <IndustriesSection />
        <AboutSection />
        <InquirySection />
      </main>
      <Footer />
    </>
  );
}
