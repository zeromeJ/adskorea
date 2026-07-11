import AboutSection from "@/components/AboutSection";
import BenefitsSection from "@/components/BenefitsSection";
import EcoDataSection from "@/components/EcoDataSection";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import IndustriesSection from "@/components/IndustriesSection";
import InquirySection from "@/components/InquirySection";
import PerformanceSection from "@/components/PerformanceSection";
import ProblemSection from "@/components/ProblemSection";
import ProductIntroSection from "@/components/ProductIntroSection";
import ProductLineup from "@/components/ProductLineup";
import VideoSection from "@/components/VideoSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <ProductIntroSection />
        <VideoSection variant="product" />
        <BenefitsSection />
        <PerformanceSection />
        <EcoDataSection />
        <ProductLineup />
        <IndustriesSection />
        <AboutSection />
        <VideoSection variant="company" />
        <InquirySection />
      </main>
      <FloatingContactButtons />
      <Footer />
    </>
  );
}
