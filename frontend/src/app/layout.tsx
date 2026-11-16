import type { Metadata } from "next";
import "./globals.css";
import NetworkStatusBanner from "../components/NetworkStatusBanner";
import { LanguageProvider } from "../context/LanguageContext";
import { AuthProvider } from "../contexts/AuthContext";
import BotFloatingAction from "../components/ai/BotFloatingAction";

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
      <head>
        {/* Critical Inline Defensive Styles - Chống vỡ layout & chống phóng to SVG/Image khi CSS đang nạp */}
        <style dangerouslySetInnerHTML={{ __html: `
          svg { max-width: 100%; }
          .logo-box { width: 40px !important; height: 40px !important; min-width: 40px !important; min-height: 40px !important; max-width: 40px !important; max-height: 40px !important; flex-shrink: 0 !important; }
          .logo-svg { width: 28px !important; height: 28px !important; max-width: 28px !important; max-height: 28px !important; display: block !important; }
          .bento-icon-box { width: 48px !important; height: 48px !important; min-width: 48px !important; min-height: 48px !important; max-width: 48px !important; max-height: 48px !important; flex-shrink: 0 !important; }
          .bento-svg { width: 28px !important; height: 28px !important; max-width: 28px !important; max-height: 28px !important; display: block !important; }
          img { max-width: 100%; height: auto; }
        `}} />
      </head>
      <body className="min-h-screen bg-[#FDFBF8] dark:bg-[#140E0A] text-[#24170E] dark:text-[#F7EFE6] antialiased selection:bg-[#E8DCCE] selection:text-[#3B2212]">
        <LanguageProvider>
          <AuthProvider>
            <NetworkStatusBanner />
            {children}
            <BotFloatingAction />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
