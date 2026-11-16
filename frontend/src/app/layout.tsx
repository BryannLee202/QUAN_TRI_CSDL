import type { Metadata } from "next";
import "./globals.css";
import NetworkStatusBanner from "../components/NetworkStatusBanner";
import { LanguageProvider } from "../context/LanguageContext";
import { AuthProvider } from "../contexts/AuthContext";
import AuthModalWrapper from "../components/auth/AuthModalWrapper";
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
      <body className="min-h-screen bg-[#FDFBF8] dark:bg-[#140E0A] text-[#24170E] dark:text-[#F7EFE6] antialiased selection:bg-[#E8DCCE] selection:text-[#3B2212]">
        <LanguageProvider>
          <AuthProvider>
            <NetworkStatusBanner />
            {children}
            <BotFloatingAction />
            <AuthModalWrapper />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
