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
    <main className="min-h-screen bg-[#FDFBF8] dark:bg-[#140D08] transition-colors">
      <Navbar />
      <HeroSection />
      
      {/* Thống kê sinh động bằng CountUp */}
      <StatsSection />

      {/* Cổng Khách Hàng (Customer Portal) */}
      <section id="portal" className="py-20 px-6 max-w-7xl mx-auto space-y-8">
        <div className="bg-[#FAF7F2]/80 dark:bg-[#170E08]/90 rounded-3xl p-6 sm:p-10 border border-[#E0D3C1] dark:border-[#422C1D] shadow-xl shadow-[#C28E58]/5 dark:shadow-none space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5EE] dark:bg-[#2B1C13] border border-[#DECFC0] dark:border-[#422C1D] text-xs font-bold text-[#6B442C] dark:text-[#E2BA78]">
              <span className="w-2 h-2 rounded-full bg-[#C28E58] animate-ping"></span>
              <span>TRỰC TUYẾN 24/7 • TRUY XUẤT NGUỒN GỐC VIETGAP</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#24170E] dark:text-[#FFF5EA]">
              Cổng Khách Hàng Giám Sát Buồng Nấm
            </h2>
            <p className="text-[#735843] dark:text-[#DAC7B5] text-sm sm:text-base leading-relaxed">
              Quản lý khay nấm cá nhân, quan sát buồng kính phòng sạch qua camera góc cận, theo dõi chỉ số vi khí hậu và gửi yêu cầu thu hoạch.
            </p>
          </div>

          {/* Cụm 2 Cột Đối Xứng: Camera Giám Sát Trực Tiếp & Thước Tua Sinh Trưởng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <CameraFeed />
            <TimelapseSlider />
          </div>

          {/* Băng Nghiệm Thu Thu Hoạch & Chứng Nhận VietGAP Trải Dài Toàn Chiều Ngang */}
          <HarvestModal />

          {/* Biểu Đồ Vi Khí Hậu 24h Realtime */}
          <SensorCharts />
        </div>
      </section>

      <PackagesSection />

      <Footer />
    </main>
  );
}
