'use client';

import React, { PointerEvent, ReactNode } from "react";
import { motion, useMotionTemplate, useSpring } from "framer-motion";

/**
 * Hiệu ứng Thẻ 3D Parallax & Vệt Sáng Di Chuyển Theo Chuột
 * Kế thừa tinh hoa từ Seal_Hackathon_Webapp, tùy biến theo phong cách hoàng gia MushroomCloud
 * Phụ trách: Đăng
 */
export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const rotateX = useSpring(0, { stiffness: 300, damping: 25 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 25 });
  const glowX = useSpring(50, { stiffness: 300, damping: 30 });
  const glowY = useSpring(50, { stiffness: 300, damping: 30 });

  const transform = useMotionTemplate`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  // Vệt sáng ánh kim Champagne Gold & ngọc lục bảo Pine Green
  const glowBackground = useMotionTemplate`radial-gradient(280px circle at ${glowX}% ${glowY}%, rgba(212, 175, 55, 0.22), transparent 75%)`;

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 12);
    rotateX.set((0.5 - py) * 12);
    glowX.set(px * 100);
    glowY.set(py * 100);
  }

  function handlePointerLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={{ transform, transformStyle: "preserve-3d" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: glowBackground,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <div style={{ position: "relative", transform: "translateZ(20px)", zIndex: 2 }}>
        {children}
      </div>
    </motion.div>
  );
}
