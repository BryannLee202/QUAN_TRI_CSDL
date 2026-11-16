import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';
import PackagesSection from '@/components/landing/PackagesSection';
import CameraFeed from '@/components/customer/CameraFeed';
import TimelapseSlider from '@/components/customer/TimelapseSlider';
import SensorCharts from '@/components/customer/SensorCharts';
import HarvestModal from '@/components/customer/HarvestModal';
import CustomerBanner from '@/components/customer/CustomerBanner';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDFBF8] dark:bg-[#140D08] transition-colors">
      <Navbar />
      
      {/* 1. HERO SECTION: Nền Kem Sáng Tinh Tế & Vi Khí Hậu Sương Sớm */}
      <HeroSection />
      
      {/* 2. STATS SECTION: Dải Băng Đo Đạc Kỹ Thuật Cleanroom (Màu Cát Ấm / Xám Bạc) */}
      <StatsSection />

      {/* 3. CỔNG KHÁCH HÀNG (CUSTOMER PORTAL): Phương Án 1 - Xanh Bạc Hà Khói Sương Dịu Nhẹ (Bio Sage Mist) */}
      <section id="portal" className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-[#EEF5F1] via-[#F4FAF6] to-[#EEF5F1] dark:from-[#131B16] dark:via-[#0F1712] dark:to-[#131B16] text-[#1C2E24] dark:text-[#E8F3EC] border-y border-[#D6E6DC] dark:border-[#223528] relative overflow-hidden transition-colors">
        {/* Glow ambient background effects - Lớp sương mù sinh học xanh dịu */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-emerald-400/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-teal-400/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="bg-white/95 dark:bg-[#18231C]/95 rounded-3xl p-6 sm:p-10 border border-[#D1E4D8] dark:border-[#263D2F] shadow-xl shadow-emerald-950/5 dark:shadow-none space-y-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E4F0E8] dark:bg-[#1F3025] border border-[#C5DEC9] dark:border-[#2B4534] text-xs font-bold text-[#1F5434] dark:text-[#A7DBB8]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>TRỰC TUYẾN 24/7 • TRUY XUẤT NGUỒN GỐC VIETGAP</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#152E20] dark:text-[#FFF5EA] tracking-tight">
                Cổng Khách Hàng Giám Sát Buồng Nấm
              </h2>
              <p className="text-[#436350] dark:text-[#B5CEBF] text-sm sm:text-base leading-relaxed">
                Quản lý khay nấm cá nhân, quan sát buồng kính phòng sạch qua camera góc cận, theo dõi chỉ số vi khí hậu và gửi yêu cầu thu hoạch.
              </p>
            </div>

            {/* Banner Cá Nhân Hóa Khách Hàng (Auth State) */}
            <CustomerBanner />

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
        </div>
      </section>

      {/* 4. PACKAGES SECTION: Nền Sáng Ấm & 3 Thẻ Nấm Mang Bản Sắc Riêng Biệt */}
      <PackagesSection />

      {/* 5. FOOTER: Nền Đen Cà Phê Sang Trọng */}
      <Footer />
    </main>
  );
}
