import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MushroomCloud - Nông Nghiệp Thông Minh FaaS",
  description: "Hệ thống quản lý nuôi trồng nấm thông minh tích hợp cho thuê và giám sát từ xa 24/7.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
