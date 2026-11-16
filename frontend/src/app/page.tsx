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
      
      {/* 1. HERO SECTION: Light Canvas Luxury (Trắng Sứ Ngọc Trai & Buồng Kính 3D) */}
      <HeroSection />
      
      {/* 2. STATS SECTION: Cleanroom Mint & Bio-Emerald (Thống Kê Sinh Học Vô Trùng) */}
      <StatsSection />

      {/* 3. PACKAGES SECTION: Light Editorial Pricing Canvas (3 Gói Nấm 3 Bản Sắc Màu Sắc) */}
      <PackagesSection />

      {/* 4. CỔNG KHÁCH HÀNG (CUSTOMER PORTAL): Cleanroom Bio-Lab Hub */}
      <section id="portal" className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-[#EEF8F3]/70 via-[#F8FAF9] to-[#EEF8F3]/70 text-slate-800 border-y border-emerald-200/60 relative overflow-hidden transition-colors">
        {/* Glow ambient background effects - Lớp sương mù sinh học xanh dịu mát */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-emerald-400/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[350px] bg-teal-400/10 blur-[140px] pointer-events-none rounded-full" />

        {/* Watermark Nấm Công Nghệ Cao Ẩn Sâu Dưới Nền Portal */}
        <div className="absolute -top-16 -left-16 w-96 h-96 text-emerald-600 opacity-[0.03] pointer-events-none select-none -rotate-45">
          <svg viewBox="0 0 200 200" fill="currentColor">
            <path d="M100 25 C50 25 20 60 20 90 C20 100 30 105 50 105 C60 105 65 110 68 120 C72 145 78 175 80 185 C83 190 117 190 120 185 C122 175 128 145 132 120 C135 110 140 105 150 105 C170 105 180 100 180 90 C180 60 150 25 100 25 Z" />
          </svg>
        </div>
        <div className="absolute -bottom-16 -right-16 w-96 h-96 text-teal-600 opacity-[0.03] pointer-events-none select-none rotate-45">
          <svg viewBox="0 0 200 200" fill="currentColor">
            <path d="M110 185 C105 150 100 120 95 90 C80 92 60 85 50 75 C30 55 45 30 75 25 C115 18 150 30 160 55 C165 68 155 82 135 88 C130 115 125 150 120 185 Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="bg-white/95 rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-xl shadow-emerald-950/5 space-y-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>TRỰC TUYẾN 24/7 • TRUY XUẤT NGUỒN GỐC VIETGAP</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#152E20] tracking-tight">
                Cổng Khách Hàng Giám Sát Buồng Nấm
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
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

      {/* 5. FOOTER: Nền Đen Cà Phê Sang Trọng */}
      <Footer />
    </main>
  );
}
