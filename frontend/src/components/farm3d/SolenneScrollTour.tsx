'use client';

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import type { Farm3DRoom, Farm3DTray, LightingMode } from "./Farm3DCanvas";

const ExplodedFarm3D = dynamic(() => import("./ExplodedFarm3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#EFE8DC] text-sm font-bold text-[#6B442C]">
      Đang khởi tạo mô hình 3D Bóc Tách Kiến Trúc...
    </div>
  ),
});

interface SolenneScrollTourProps {
  rooms: Farm3DRoom[];
  trays: Farm3DTray[];
  ownedTrayCodes: Set<string>;
  onJumpToInteractive: () => void;
}

export default function SolenneScrollTour({
  rooms,
  trays,
  ownedTrayCodes,
  onJumpToInteractive,
}: SolenneScrollTourProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [progress, setProgress] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [engineMode, setEngineMode] = useState<"3d" | "video">("3d");
  const [lightingMode, setLightingMode] = useState<LightingMode>("day");
  const [mistEnabled, setMistEnabled] = useState<boolean>(true);

  const jumpToPhase = (targetPct: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const docTop = window.scrollY + rect.top;
    const scrollable = Math.max(1, containerRef.current.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: docTop + scrollable * targetPct,
      behavior: "smooth",
    });
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Kiểm tra xem có sẵn file /videos/farm-flythrough.mp4 không (Phương án 1)
  useEffect(() => {
    fetch("/videos/farm-flythrough.mp4", { method: "HEAD" })
      .then((res) => {
        if (res.ok) {
          setVideoSrc("/videos/farm-flythrough.mp4");
          setEngineMode("video");
        }
      })
      .catch(() => {
        // Mặc định dùng ExplodedFarm3D nếu chưa đặt file video
      });
  }, []);

  // Đồng bộ scrollYProgress -> 3D Exploded Progress & Video Scrubbing
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setProgress(latest);
    if (engineMode === "video" && videoRef.current && videoRef.current.duration) {
      const targetTime = latest * videoRef.current.duration;
      if (Number.isFinite(targetTime)) {
        videoRef.current.currentTime = targetTime;
      }
    }
  });

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setEngineMode("video");
  };

  // Chú thích từng phân đoạn bóc tách
  const caption1Opacity = useTransform(scrollYProgress, [0, 0.16, 0.24], [1, 1, 0]);
  const caption2Opacity = useTransform(scrollYProgress, [0.22, 0.32, 0.45, 0.52], [0, 1, 1, 0]);
  const caption3Opacity = useTransform(scrollYProgress, [0.5, 0.58, 0.72, 0.78], [0, 1, 1, 0]);
  const caption4Opacity = useTransform(scrollYProgress, [0.76, 0.84, 1], [0, 1, 1]);
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative h-[420vh] w-full bg-[#EFE8DC]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Phương án 1: Video Scroll-Scrubbing (nếu có MP4) */}
        {engineMode === "video" && videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
        ) : (
          /* Phương án 2: Mô hình 3D Bóc Tách Từng Lớp (Exploded Cutaway + Studio PBR) */
          <ExplodedFarm3D
            progress={progress}
            rooms={rooms}
            trays={trays}
            ownedTrayCodes={ownedTrayCodes}
            lightingMode={lightingMode}
            mistEnabled={mistEnabled}
          />
        )}

        {/* Thanh điều khiển tối giản phía trên */}
        <div className="absolute top-20 left-0 right-0 px-6 sm:px-10 flex flex-wrap items-center justify-between gap-3 z-20 pointer-events-none">
          <div className="px-3.5 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-[#DECFC0] shadow-xs pointer-events-auto">
            <span className="text-[10px] font-mono tracking-[0.24em] uppercase text-[#8A5C38] block">
              MUSHROOMCLOUD • BÓC TÁCH KIẾN TRÚC
            </span>
            <span className="text-xs sm:text-sm font-black tracking-wide text-[#24170E]">
              Cuộn chuột để bóc mái, bay vào kệ &amp; tách lớp khay
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            {/* Bộ điều khiển vi khí hậu 3D trực tiếp (phong cách Dormer) */}
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-white/85 backdrop-blur-md border border-[#DECFC0] shadow-xs">
              {(["day", "night", "uvc"] as LightingMode[]).map((lm) => (
                <button
                  key={lm}
                  type="button"
                  onClick={() => setLightingMode(lm)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                    lightingMode === lm
                      ? "bg-[#24170E] text-[#E2BA78]"
                      : "text-[#5E4A3A] hover:bg-[#FAF5EE]"
                  }`}
                >
                  {lm === "day" ? "Ngày 5000K" : lm === "night" ? "Đêm Ấm" : "UV-C"}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setMistEnabled((m) => !m)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                  mistEnabled
                    ? "bg-emerald-700 text-white"
                    : "text-[#5E4A3A] hover:bg-[#FAF5EE]"
                }`}
              >
                {mistEnabled ? "Phun Sương: Bật" : "Phun Sương: Tắt"}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoUpload}
              className="hidden"
            />
            {videoSrc && (
              <button
                type="button"
                onClick={() =>
                  setEngineMode((m) => (m === "video" ? "3d" : "video"))
                }
                className="px-3.5 py-2 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-[#DECFC0] text-[#24170E] text-[11px] font-bold transition shadow-xs cursor-pointer"
              >
                {engineMode === "video" ? "Chuyển sang 3D Bóc Tách" : "Chuyển sang Video Scrub"}
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-[#DECFC0] text-[#4A3222] text-[11px] font-bold transition shadow-xs cursor-pointer"
              title="Nạp file video MP4 để tua theo nhịp cuộn chuột"
            >
              Nạp Video MP4
            </button>
            <button
              type="button"
              onClick={onJumpToInteractive}
              className="px-4 py-2 rounded-full bg-[#24170E] hover:bg-[#382417] text-white border border-[#C28E58] text-[11px] font-bold tracking-wider uppercase transition shadow-md cursor-pointer"
            >
              Chọn Khay Thật ↓
            </button>
          </div>
        </div>

        {/* Chú thích 4 giai đoạn bóc tách góc dưới trái */}
        <div className="absolute bottom-8 left-6 sm:left-10 right-20 z-20 pointer-events-none">
          <motion.div
            style={{ opacity: caption1Opacity }}
            className="max-w-md p-4 rounded-2xl bg-white/88 backdrop-blur-md border border-[#DECFC0] shadow-lg"
          >
            <span className="font-mono text-[11px] font-black text-[#C28E58]">
              01 / NGOẠI THẤT KÍN
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#24170E] mt-0.5">
              Nhà Kính Nhôm Champagne &amp; Sân Vườn
            </h2>
            <p className="text-xs text-[#6E4B33] mt-1">
              Cuộn xuống để bắt đầu bóc tách mái kính và nhìn vào 3 buồng nuôi bên trong.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: caption2Opacity }}
            className="absolute bottom-0 left-0 max-w-md p-4 rounded-2xl bg-white/88 backdrop-blur-md border border-[#DECFC0] shadow-lg"
          >
            <span className="font-mono text-[11px] font-black text-[#C28E58]">
              02 / BÓC TÁCH MÁI &amp; VÁCH KÍNH
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#24170E] mt-0.5">
              Lộ Rõ 3 Buồng Nuôi RM01 • RM02 • RM03
            </h2>
            <p className="text-xs text-[#6E4B33] mt-1">
              Mái kính và mặt tiền tự nâng lên để lộ hệ giàn kệ thép không gỉ 5 tầng.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: caption3Opacity }}
            className="absolute bottom-0 left-0 max-w-md p-4 rounded-2xl bg-white/88 backdrop-blur-md border border-[#DECFC0] shadow-lg"
          >
            <span className="font-mono text-[11px] font-black text-[#C28E58]">
              03 / BAY VÀO HÀNH LANG &amp; KÉO KHAY
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#24170E] mt-0.5">
              Trượt Khay Nấm Ra Khỏi Kệ
            </h2>
            <p className="text-xs text-[#6E4B33] mt-1">
              Camera tiến sát hành lang RM01 và kéo khay nấm ra như ngăn kéo kỹ thuật.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: caption4Opacity }}
            className="absolute bottom-0 left-0 max-w-md p-4 rounded-2xl bg-[#24170E]/92 backdrop-blur-md border border-[#E2BA78] text-white shadow-xl"
          >
            <span className="font-mono text-[11px] font-black text-[#E2BA78]">
              04 / BÓC TÁCH 3 LỚP KHAY NẤM
            </span>
            <h2 className="text-lg sm:text-xl font-black mt-0.5">
              Phôi Nấm • Cảm Biến IoT • Đèn Quang Phổ
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              Tách rời từng linh kiện của khay nấm. Cuộn tiếp xuống dưới để chọn thuê khay thật!
            </p>
          </motion.div>
        </div>

        {/* Nút chuyển nhanh 4 giai đoạn bóc tách ở góc dưới phải */}
        <div className="hidden sm:flex items-center gap-1.5 absolute bottom-8 right-14 z-20 px-2 py-1.5 rounded-full bg-white/88 backdrop-blur-md border border-[#DECFC0] shadow-lg">
          {[
            { label: "01 Ngoại thất", pct: 0.02 },
            { label: "02 Bóc mái", pct: 0.38 },
            { label: "03 Kéo khay", pct: 0.65 },
            { label: "04 Tách 3 lớp", pct: 0.94 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => jumpToPhase(item.pct)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold text-[#4A3222] hover:bg-[#24170E] hover:text-[#E2BA78] transition cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Thanh tiến trình dọc bên phải */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
          <div className="w-1.5 h-36 rounded-full bg-[#24170E]/15 overflow-hidden">
            <motion.div
              style={{ height: progressHeight }}
              className="w-full bg-[#C28E58] rounded-full"
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-[#6B442C] tracking-widest [writing-mode:vertical-rl]">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>
    </section>
  );
}
