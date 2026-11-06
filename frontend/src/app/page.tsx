import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';
import PackagesSection from '@/components/landing/PackagesSection';
import CameraFeed from '@/components/customer/CameraFeed';
import TimelapseSlider from '@/components/customer/TimelapseSlider';
import SensorCharts from '@/components/customer/SensorCharts';
import HarvestModal from '@/components/customer/HarvestModal';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors">
      <Navbar />
      <HeroSection />
      
      {/* Thống kê sinh động bằng CountUp */}
      <StatsSection />

      {/* Cổng Khách Hàng (Customer Portal) */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-[#0F172A] dark:text-emerald-400">
            Cổng Khách Hàng Giám Sát Trực Tuyến
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Quản lý khay nấm cá nhân, xem camera live stream, theo dõi vi khí hậu và gửi yêu cầu thu hoạch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CameraFeed />
          <div className="space-y-8">
            <TimelapseSlider />
            <HarvestModal />
          </div>
        </div>

        <SensorCharts />
      </section>

      <PackagesSection />
      <Footer />
    </main>
  );
}
