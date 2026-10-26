import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import PackagesSection from '@/components/landing/PackagesSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <HeroSection />
      <PackagesSection />
      <Footer />
    </main>
  );
}