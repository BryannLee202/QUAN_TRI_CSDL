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
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
      <Navbar />
      <HeroSection />
      
      {/* Thống kê sinh động bằng CountUp */}
      <StatsSection />

      {/* Cổng Khách Hàng (Customer Portal) */}
      <section id="portal" className="py-20 px-6 max-w-7xl mx-auto space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>TRỰC TUYẾN 24/7 • TRUY XUẤT NGUỒN GỐC</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Cổng Khách Hàng Giám Sát Buồng Nấm
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              Quản lý khay nấm cá nhân, quan sát buồng kính phòng sạch qua camera góc cận, theo dõi chỉ số vi khí hậu và gửi yêu cầu thu hoạch.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <CameraFeed />
            <div className="space-y-6">
              <TimelapseSlider />
              <HarvestModal />
            </div>
          </div>

          <SensorCharts />
        </div>
      </section>

      <PackagesSection />
      <Footer />
    </main>
  );
}
