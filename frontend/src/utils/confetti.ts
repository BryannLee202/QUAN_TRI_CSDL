import confetti from "canvas-confetti";

/**
 * Tiện ích kích hoạt hiệu ứng pháo hoa mừng thành công
 * Phụ trách: Đăng
 */
export const triggerSuccessConfetti = (): void => {
  const count = 180;
  const defaults = {
    origin: { y: 0.65 },
    zIndex: 99999,
    colors: ["#10b981", "#059669", "#34d399", "#fbbf24", "#38bdf8"],
  };

  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  };

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
