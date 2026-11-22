import React from "react";
import Link from "next/link";

/**
 * Footer Component - Chân Trang Tiêu Chuẩn Doanh Nghiệp Nông Nghiệp Công Nghệ Cao (FaaS)
 * Đồng bộ màu sắc Cafe Latte Bắc Âu sang trọng, hoàn chỉnh như một sản phẩm ứng dụng thực tế
 */
export default function Footer() {
  return (
    <footer className="bg-[#FAF7F2] dark:bg-[#1E1B18] text-[#523522] dark:text-[#DAC7B5] border-t border-[#EAE1D3] dark:border-[#474039] transition-colors">
      {/* Khung Nội Dung Chính */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Cột 1 & 2: Nhận Diện Thương Hiệu & Giới Thiệu */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div 
                className="w-10 h-10 logo-box rounded-2xl bg-gradient-to-b from-[#FAF5EE] via-[#F2E8DC] to-[#E8DCCE] dark:from-[#2B1C13] dark:via-[#27231F] dark:to-[#1E1B18] border border-[#D9C8B5] dark:border-[#474039] shadow-xs flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 duration-200 shrink-0"
                style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px', flexShrink: 0 }}
              >
                <svg 
                  width="28" 
                  height="28" 
                  className="w-full h-full logo-svg" 
                  style={{ width: '28px', height: '28px', maxWidth: '28px', maxHeight: '28px', display: 'block' }} 
                  viewBox="0 0 68 56" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14 27C14 16 23 8 34 8C45 8 54 16 54 27C54 30.5 50.5 32.5 46.5 31.5C41.5 30 38.5 26.5 34 26.5C29.5 26.5 26.5 30 21.5 31.5C17.5 32.5 14 30.5 14 27Z" fill="#6B442C" />
                  <path d="M22 26C24 19 28 15 34 15C40 15 44 19 46 26" stroke="#C28E58" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M28 32H40V41C40 43.8 37.3 46 34 46C30.7 46 28 43.8 28 41V32Z" fill="#6B442C" />
                  <circle cx="34" cy="20" r="3" fill="#C28E58" />
                  <circle cx="23" cy="22" r="2" fill="#C28E58" />
                  <circle cx="45" cy="22" r="2" fill="#C28E58" />
                </svg>
              </div>

              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-[#24170E] dark:text-[#FFF5EA] flex items-center gap-1.5 font-sans">
                  MushroomCloud
                  <span className="w-2 h-2 rounded-full bg-[#C28E58]"></span>
                </span>
                <span className="text-[10px] font-bold text-[#8A5C38] dark:text-[#D4AF7A] tracking-wider uppercase -mt-0.5">
                  Smart Farm Farm-as-a-Service
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#735843] dark:text-[#BFA895] leading-relaxed max-w-sm">
              Nền tảng Nông Trại Thông Minh Farm-as-a-Service (FaaS) tiên phong tại Việt Nam: Thuê khay nấm từ xa, kiểm soát vi khí hậu bằng cảm biến IoT, quan sát trực tuyến camera 4K và nghiệm thu nấm tươi chuẩn VietGAP tận nhà.
            </p>


          </div>

          {/* Cột 2: Nền Tảng Dịch Vụ */}
          <div className="space-y-3.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#24170E] dark:text-[#FFF5EA]">
              Dịch Vụ & Nền Tảng
            </h4>
            <ul className="space-y-2 text-xs text-[#735843] dark:text-[#DAC7B5]">
              <li>
                <a href="#portal" className="hover:text-[#C28E58] transition-colors">
                  Cổng Khách Hàng Giám Sát
                </a>
              </li>
              <li>
                <Link href="/khay-cua-toi" className="hover:text-[#C28E58] transition-colors">
                  Khay Nấm Của Tôi
                </Link>
              </li>
              <li>
                <a href="#packages" className="hover:text-[#C28E58] transition-colors">
                  Bảng Giá Thuê Khay Nấm FaaS
                </a>
              </li>
              <li>
                <a href="#portal" className="hover:text-[#C28E58] transition-colors">
                  Camera PTZ & Cảm Biến Realtime
                </a>
              </li>
              <li>
                <a href="#portal" className="hover:text-[#C28E58] transition-colors">
                  Thước Tua Timelapse Lịch Sử
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ Trợ Kỹ Thuật & Liên Hệ */}
          <div className="space-y-3.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#24170E] dark:text-[#FFF5EA]">
              Hỗ Trợ & Liên Hệ
            </h4>
            <div className="space-y-2 text-xs text-[#735843] dark:text-[#DAC7B5]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C28E58] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>Hotline: <strong>1900 8899</strong> (24/7)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C28E58] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>contact@mushroomcloud.vn</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dải Pháp Lý Dưới Cùng (Bottom Legal Bar) */}
      <div className="border-t border-[#EAE1D3] dark:border-[#2B1C13] bg-[#F2EDE4]/60 dark:bg-[#0D0805] py-4 px-6 text-xs text-[#8C6D53] dark:text-[#BFA895]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-[#735843] dark:text-[#DAC7B5]">
          <a href="#" className="hover:text-[#C28E58] transition-colors">Điều Khoản Dịch Vụ</a>
          <span>•</span>
          <a href="#" className="hover:text-[#C28E58] transition-colors">Chính Sách Bảo Mật</a>
          <span>•</span>
          <a href="#" className="hover:text-[#C28E58] transition-colors">Cam Kết VietGAP</a>
          <span>•</span>
          <a href="#" className="hover:text-[#C28E58] transition-colors">SLA Vận Hành 99.9%</a>
        </div>
      </div>
    </footer>
  );
}
