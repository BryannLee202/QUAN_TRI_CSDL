'use client';

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

/**
 * Hiệu ứng Số Đếm Nhảy Mượt Mà (CountUp)
 * Kế thừa từ Seal_Hackathon_Webapp, hỗ trợ định dạng số vi-VN và prefers-reduced-motion
 * Phụ trách: Võ Duy Thịnh
 */
export function CountUp({
  target,
  duration = 2,
  suffix = "",
  locale = "vi-VN",
}: {
  target: number;
  duration?: number;
  suffix?: string;
  locale?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      springValue.jump(target);
    } else {
      motionValue.set(target);
    }
  }, [inView, motionValue, springValue, target]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplay(Math.floor(latest).toLocaleString(locale));
    });
    return unsubscribe;
  }, [springValue, locale]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}
