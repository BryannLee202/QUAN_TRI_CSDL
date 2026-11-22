'use client';

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface SolenneScrollTourProps {
  onJumpToInteractive: () => void;
}

export default function SolenneScrollTour({
  onJumpToInteractive,
}: SolenneScrollTourProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 4 lớp chuyển cảnh zoom liên tục theo từng pixel cuộn chuột (chuẩn THE SOLENNE)
  // Lớp 1: Ngoại thất tòa nhà (0.00 -> 0.30)
  const opacity1 = useTransform(scrollYProgress, [0, 0.22, 0.32], [1, 1, 0]);
  const scale1 = useTransform(scrollYProgress, [0, 0.32], [1, 1.38]);

  // Lớp 2: Cắt lớp Isometric 3 buồng nuôi (0.22 -> 0.58)
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.32, 0.5, 0.6], [0, 1, 1, 0]);
  const scale2 = useTransform(scrollYProgress, [0.2, 0.6], [0.96, 1.42]);

  // Lớp 3: Hành lang giàn kệ 5 tầng phòng sạch (0.48 -> 0.84)
  const opacity3 = useTransform(scrollYProgress, [0.48, 0.6, 0.76, 0.86], [0, 1, 1, 0]);
  const scale3 = useTransform(scrollYProgress, [0.48, 0.86], [0.96, 1.36]);

  // Lớp 4: Cận cảnh khay nấm & cảm biến IoT (0.74 -> 1.00)
  const opacity4 = useTransform(scrollYProgress, [0.74, 0.86, 1], [0, 1, 1]);
  const scale4 = useTransform(scrollYProgress, [0.74, 1], [0.95, 1.12]);

  // Chú thích tối giản từng phân cảnh
  const caption1Opacity = useTransform(scrollYProgress, [0, 0.18, 0.28], [1, 1, 0]);
  const caption2Opacity = useTransform(scrollYProgress, [0.24, 0.34, 0.48, 0.56], [0, 1, 1, 0]);
  const caption3Opacity = useTransform(scrollYProgress, [0.52, 0.62, 0.74, 0.82], [0, 1, 1, 0]);
  const caption4Opacity = useTransform(scrollYProgress, [0.78, 0.88, 1], [0, 1, 1]);

  // Thanh tiến trình cuộn
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative h-[380vh] w-full bg-[#140D08]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Lớp 1: Ngoại thất */}
        <motion.div
          style={{ opacity: opacity1, scale: scale1 }}
          className="absolute inset-0 w-full h-full will-change-transform"
        >
          <img
            src="/images/farm3d/exterior-facility.jpg"
            alt="Ngoại thất MushroomCloud Agritech Center"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Lớp 2: Cắt lớp Isometric */}
        <motion.div
          style={{ opacity: opacity2, scale: scale2 }}
          className="absolute inset-0 w-full h-full will-change-transform"
        >
          <img
            src="/images/farm3d/overview-cutaway.jpg"
            alt="Mặt cắt kiến trúc 3 buồng nuôi"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Lớp 3: Hành lang phòng sạch */}
        <motion.div
          style={{ opacity: opacity3, scale: scale3 }}
          className="absolute inset-0 w-full h-full will-change-transform"
        >
          <img
            src="/images/hero-view-facility-multitier.jpg"
            alt="Hành lang giàn kệ 5 tầng"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Lớp 4: Cận cảnh khay nấm */}
        <motion.div
          style={{ opacity: opacity4, scale: scale4 }}
          className="absolute inset-0 w-full h-full will-change-transform"
        >
          <img
            src="/images/hero-view-mushroom-macro.jpg"
            alt="Cận cảnh khay nấm trưởng thành"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Lớp phủ gradient nhẹ giữ độ tương phản chữ kiểu editorial */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/45 pointer-events-none" />

        {/* Thanh trên tối giản kiểu THE SOLENNE */}
        <div className="absolute top-20 left-0 right-0 px-6 sm:px-10 flex items-center justify-between z-20">
          <div className="text-white">
            <span className="text-[10px] font-mono tracking-[0.28em] uppercase text-[#E2BA78] block">
              CLEANROOM ISO CLASS 5
            </span>
            <span className="text-sm sm:text-base font-black tracking-[0.18em] uppercase">
              MUSHROOMCLOUD SANCTUARY
            </span>
          </div>

          <button
            type="button"
            onClick={onJumpToInteractive}
            className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold tracking-wider uppercase transition cursor-pointer"
          >
            Chọn Khay Tương tác ↓
          </button>
        </div>

        {/* Chú thích phân cảnh tối giản ở góc dưới trái */}
        <div className="absolute bottom-10 left-6 sm:left-10 right-20 z-20 text-white pointer-events-none">
          <motion.div style={{ opacity: caption1Opacity }} className="max-w-lg">
            <span className="font-mono text-xs text-[#E2BA78] tracking-widest">01 / NGOẠI THẤT</span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-1">
              Kiến Trúc Nhà Kính Vô Trùng
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 mt-1.5">
              Cuộn chuột chậm xuống để xuyên qua vách kính vào thẳng bên trong buồng nuôi nấm.
            </p>
          </motion.div>

          <motion.div style={{ opacity: caption2Opacity }} className="absolute bottom-0 left-0 max-w-lg">
            <span className="font-mono text-xs text-[#E2BA78] tracking-widest">02 / TÁCH LỚP 3D</span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-1">
              3 Buồng Nuôi RM01 • RM02 • RM03
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 mt-1.5">
              Tách lớp mái toàn khu để quan sát 3 phân khu Bào Ngư, Hầu Thủ và Linh Chi Đỏ.
            </p>
          </motion.div>

          <motion.div style={{ opacity: caption3Opacity }} className="absolute bottom-0 left-0 max-w-lg">
            <span className="font-mono text-xs text-[#E2BA78] tracking-widest">03 / PHÒNG SẠCH</span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-1">
              Hành Lang Giàn Kệ 5 Tầng
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 mt-1.5">
              Hệ thống phun sương siêu âm và đèn LED quang phổ kiểm soát vi khí hậu 24/7.
            </p>
          </motion.div>

          <motion.div style={{ opacity: caption4Opacity }} className="absolute bottom-0 left-0 max-w-lg">
            <span className="font-mono text-xs text-[#E2BA78] tracking-widest">04 / KHAY NẤM THỰC TẾ</span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-1">
              Theo Dõi Từng Khay &amp; Thu Hoạch
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 mt-1.5">
              Tiếp tục cuộn xuống để chọn trực tiếp từng buồng và từng khay nấm thật trên CSDL.
            </p>
          </motion.div>
        </div>

        {/* Thanh tiến trình dọc bên phải */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2">
          <div className="w-1 h-32 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              style={{ height: progressHeight }}
              className="w-full bg-[#E2BA78] rounded-full"
            />
          </div>
          <span className="text-[10px] font-mono text-white/75 tracking-widest [writing-mode:vertical-rl]">
            SCROLL
          </span>
        </div>
      </div>
    </section>
  );
}
