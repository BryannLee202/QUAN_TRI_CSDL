/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Tắt double-render ở dev mode, giúp F5 và live reload phản hồi siêu tốc
  swcMinify: true,
  images: {
    unoptimized: true, // Tải ảnh cục bộ trực tiếp, không bị trễ xử lý
  },
};

module.exports = nextConfig;
