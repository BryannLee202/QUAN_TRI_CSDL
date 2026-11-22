'use client';

import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

interface SolenneScrollTourProps {
  customVideoUrl?: string | null;
  onJumpToInteractive: () => void;
}

export default function SolenneScrollTour({
  customVideoUrl,
  onJumpToInteractive,
}: SolenneScrollTourProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [autoVideoUrl, setAutoVideoUrl] = useState<string | null>(null);
  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);

  const activeVideoSrc = customVideoUrl || autoVideoUrl;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 1. Kích hoạt Lenis Smooth Scroll cho cảm giác cuộn trackpad mượt chuẩn THE SOLENNE
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // 2. Tự động nhận diện file video /videos/farm-flythrough.mp4 nếu đã đặt trong public/videos
  useEffect(() => {
    fetch("/videos/farm-flythrough.mp4", { method: "HEAD" })
      .then((res) => {
        if (res.ok) setAutoVideoUrl("/videos/farm-flythrough.mp4");
      })
      .catch(() => {
        // Dùng ảnh kiến trúc Cutaway tinh khiết nếu chưa nạp MP4
      });
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    targetProgressRef.current = latest;
  });

  // 3. Canvas Frame Scrubbing mượt 60fps với nội suy quán tính khi có video MP4
  useEffect(() => {
    if (!activeVideoSrc) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let rafId = 0;
    const renderLoop = () => {
      smoothProgressRef.current +=
        (targetProgressRef.current - smoothProgressRef.current) * 0.12;

      if (video.readyState >= 2 && video.duration > 0) {
        const targetTime = smoothProgressRef.current * video.duration;
        if (Math.abs(video.currentTime - targetTime) > 0.016) {
          video.currentTime = targetTime;
        }

        // Vẽ object-cover lên canvas sắc nét
        const cw = canvas.width;
        const ch = canvas.height;
        const vw = video.videoWidth || 16;
        const vh = video.videoHeight || 9;
        const scale = Math.max(cw / vw, ch / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;
        ctx.drawImage(video, dx, dy, dw, dh);
      }

      rafId = requestAnimationFrame(renderLoop);
    };
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [activeVideoSrc]);

  const fallbackScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.16]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[300vh] w-full bg-[#EFE8DC]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {activeVideoSrc ? (
          <>
            <video
              ref={videoRef}
              src={activeVideoSrc}
              muted
              playsInline
              preload="auto"
              className="hidden"
            />
            <canvas ref={canvasRef} className="w-full h-full block" />
          </>
        ) : (
          <motion.div
            style={{ scale: fallbackScale }}
            className="w-full h-full will-change-transform"
          >
            <img
              src="/images/farm3d/overview-cutaway.jpg"
              alt="MushroomCloud Sanctuary Cutaway"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Thanh trên tối giản tuyệt đối chuẩn THE SOLENNE */}
        <div className="absolute top-20 left-0 right-0 px-6 sm:px-10 flex items-center justify-between z-20 pointer-events-none">
          <span className="text-xs sm:text-sm font-black tracking-[0.22em] uppercase text-[#24170E] drop-shadow-xs">
            MUSHROOMCLOUD
          </span>

          <button
            type="button"
            onClick={onJumpToInteractive}
            className="px-4 py-2 rounded-full bg-[#24170E]/90 hover:bg-[#24170E] text-white text-[11px] font-bold tracking-[0.14em] uppercase transition shadow-md pointer-events-auto cursor-pointer"
          >
            CHỌN KHAY ↓
          </button>
        </div>

        {/* Gợi ý cuộn siêu mảnh ở đáy, tự mờ đi ngay khi bắt đầu cuộn */}
        <motion.div
          style={{ opacity: scrollHintOpacity }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        >
          <span className="px-4 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-[#DECFC0] text-[10px] font-bold tracking-[0.2em] uppercase text-[#4A3222] shadow-xs">
            Cuộn để khám phá ↓
          </span>
        </motion.div>
      </div>
    </section>
  );
}
