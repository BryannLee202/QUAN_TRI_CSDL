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
      
      {/* 2. STATS SECTION: Midnight Telemetry Band (Dark Công Nghệ Cao Chuẩn SEAL) */}
      <StatsSection />

      {/* 3. PACKAGES SECTION: Light Editorial Pricing Canvas (3 Gói Nấm 3 Bản Sắc Màu Sắc) */}
      <PackagesSection />

      {/* 4. CỔNG KHÁCH HÀNG (CUSTOMER PORTAL): Deep Cyber Cleanroom Hub (Dark Command Bridge) */}
      <section id="portal" className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-[#080C10] via-[#0D1217] to-[#080C10] text-[#F3F4F6] border-y border-[#1E293B] relative overflow-hidden transition-colors">
        {/* Glow ambient background effects - Lớp ánh sáng dạ quang công nghệ cao */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[350px] bg-sky-500/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="bg-[#121820]/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-[#1E293B] shadow-2xl shadow-black/60 space-y-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>TRỰC TUYẾN 24/7 • TRUY XUẤT NGUỒN GỐC VIETGAP</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Cổng Khách Hàng Giám Sát Buồng Nấm
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
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
