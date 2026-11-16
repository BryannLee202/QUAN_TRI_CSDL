'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface FarmHub {
  id: string;
  name: string;
  city: string;
  address: string;
  chambers: number;
  totalTrays: number;
  activeRate: number;
  specialty: string;
  deliverySpeed: string;
  status: 'ACTIVE' | 'EXPANDING';
  tags: string[];
  description: string;
}

const FARM_HUBS: FarmHub[] = [
  {
    id: 'hub-hcm',
    name: 'Hub Công Nghệ Cao TP.HCM (Thủ Đức)',
    city: 'TP. Hồ Chí Minh',
    address: 'Khu Công Nghệ Cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP.HCM',
    chambers: 64,
    totalTrays: 2560,
    activeRate: 98,
    specialty: "Nấm Hầu Thủ (Lion's Mane) & Bào Ngư Xám",
    deliverySpeed: 'Giao hỏa tốc 30 - 60 phút',
    status: 'ACTIVE',
    tags: ['ISO Class 5', 'IoT Gateway LoRaWAN', 'Camera PTZ 4K', 'Giao Hỏa Tốc'],
    description: 'Trung tâm nghiên cứu và ươm cấy giống nấm dược liệu chủ lực phục vụ khách hàng đô thị. Trang bị hệ thống lọc khí HEPA H14 và điều khiển vi khí hậu đối lưu cưỡng bức.',
  },
  {
    id: 'hub-dalat',
    name: 'Trại Nấm Cao Nguyên Đà Lạt',
    city: 'Lâm Đồng',
    address: 'Thung Lũng Trại Mát, Phường 11, TP. Đà Lạt, Tỉnh Lâm Đồng',
    chambers: 128,
    totalTrays: 5120,
    activeRate: 94,
    specialty: 'Đông Trùng Hạ Thảo Sinh Khối & Linh Chi Đỏ',
    deliverySpeed: 'Đóng thùng lạnh bảo quản 4°C',
    status: 'ACTIVE',
    tags: ['Khí Hậu Ôn Đới 18-22°C', 'Sấy Thăng Hoa Vô Trùng', 'Chuẩn Dược Liệu'],
    description: 'Tận dụng biên độ nhiệt ngày đêm lý tưởng của vùng cao nguyên để tích lũy hàm lượng Polysaccharide và Cordycepin đạt đỉnh. Tích hợp phân xưởng sấy lạnh thăng hoa khép kín.',
  },
  {
    id: 'hub-dongnai',
    name: 'Hub Nông Nghiệp Khép Kín Long Khánh',
    city: 'Đồng Nai',
    address: 'Khu Nông Nghiệp Ứng Dụng Công Nghệ Cao, TP. Long Khánh, Tỉnh Đồng Nai',
    chambers: 96,
    totalTrays: 3840,
    activeRate: 88,
    specialty: 'Nấm Bào Ngư Thương Phẩm & Nấm Hoàng Kim',
    deliverySpeed: 'Cung ứng sỉ cho chuỗi siêu thị',
    status: 'ACTIVE',
    tags: ['Năng Suất Cao', 'Tự Động Hóa 100%', 'VietGAP Xuất Khẩu'],
    description: 'Quy mô công nghiệp ứng dụng robot cấp phôi tự động và hệ thống phun sương siêu âm nano. Cung ứng nấm ăn tươi sạch cho chuỗi cung ứng miền Đông Nam Bộ.',
  },
  {
    id: 'hub-cantho',
    name: 'Hub Sinh Học Đồng Bằng Sông Cửu Long',
    city: 'Cần Thơ',
    address: 'Khu Đô Thị Sinh Thái Nam Sông Cần Thơ, Quận Cái Răng, TP. Cần Thơ',
    chambers: 48,
    totalTrays: 1920,
    activeRate: 75,
    specialty: 'Nấm Mối Đen & Nấm Rơm Công Nghệ Cao',
    deliverySpeed: 'Giao trong ngày 13 tỉnh Miền Tây',
    status: 'EXPANDING',
    tags: ['Đang Mở Rộng Pha 2', 'Nấm Mối Đen Hữu Cơ', 'Tái Sinh Cơ Chất'],
    description: 'Trung tâm FaaS trọng điểm kết nối vùng Tây Nam Bộ, nghiên cứu tối ưu hóa giá thể từ phụ phẩm nông nghiệp hữu cơ tuần hoàn.',
  },
];

export default function FarmNetworkPage() {
  const [selectedHubId, setSelectedHubId] = useState<string>('hub-hcm');
  const [reserveSuccess, setReserveSuccess] = useState(false);

  const selectedHub = FARM_HUBS.find((h) => h.id === selectedHubId) || FARM_HUBS[0];

  const handleReserve = () => {
    setReserveSuccess(true);
    setTimeout(() => setReserveSuccess(false), 5000);
  };

  return (
    <main className="min-h-screen bg-[#FDFBF8] dark:bg-[#140D08] text-[#24170E] dark:text-[#F7EFE6] transition-colors flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Header */}
        <div className="bg-gradient-to-b from-[#F5EEE4] via-[#FBF7F0] to-[#FDFBF8] dark:from-[#20140D] dark:via-[#19100A] dark:to-[#140D08] border-b border-[#EAE1D3] dark:border-[#38261A] py-10 px-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8A5C38] dark:text-[#C28E58]">
              <Link href="/" className="hover:underline flex items-center gap-1">
                <span>← Trang Chủ</span>
              </Link>
              <span>/</span>
              <span className="text-[#3B2212] dark:text-[#FFF5EA]">Hạ Tầng Nông Nghiệp</span>
              <span>/</span>
              <span className="text-[#C28E58] font-bold">Mạng Lưới Farm FaaS</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 text-amber-900 dark:text-amber-300 text-xs font-bold mb-2">
                  <span>🌐 HẠ TẦNG PHÂN TÁN CHUẨN ISO CLASS 5</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#24170E] dark:text-white tracking-tight">
                  Mạng Lưới Nhà Nấm Thông Minh Phân Tán
                </h1>
                <p className="text-sm sm:text-base text-[#6E4B33] dark:text-[#DAC7B5] mt-2 max-w-2xl leading-relaxed">
                  Hệ thống 4 tổ hợp buồng kính phòng sạch chuẩn ISO Class 5 trải dài từ TP.HCM, Đà Lạt đến Đồng Nai và Cần Thơ, kết nối cảm biến IoT LoRaWAN thời gian thực.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/tinh-loi-nhuan"
                  className="px-4 py-2.5 rounded-xl border border-[#DECFC0] dark:border-[#422C1D] bg-white dark:bg-[#1C120C] text-xs font-bold hover:border-[#C28E58] transition"
                >
                  Tính Lợi Nhuận FaaS →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1009] border border-[#EAE1D3] dark:border-[#38261A] shadow-xs">
              <span className="text-[11px] text-[#8C6D53] block">Tổng số cơ sở Farm:</span>
              <span className="text-2xl font-black text-[#24170E] dark:text-white mt-1 block">4 Trung Tâm</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% Đang Hoạt Động</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1009] border border-[#EAE1D3] dark:border-[#38261A] shadow-xs">
              <span className="text-[11px] text-[#8C6D53] block">Quy mô buồng kính ISO:</span>
              <span className="text-2xl font-black text-[#C28E58] mt-1 block">336 Buồng</span>
              <span className="text-[10px] text-[#8A5C38]">Kiểm soát vi khí hậu độc lập</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1009] border border-[#EAE1D3] dark:border-[#38261A] shadow-xs">
              <span className="text-[11px] text-[#8C6D53] block">Tổng dung lượng khay nấm:</span>
              <span className="text-2xl font-black text-[#24170E] dark:text-white mt-1 block">13.440 Khay</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Tỷ lệ lấp đầy: 91.2%</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1009] border border-[#EAE1D3] dark:border-[#38261A] shadow-xs">
              <span className="text-[11px] text-[#8C6D53] block">Bán kính giao nấm tươi:</span>
              <span className="text-2xl font-black text-[#24170E] dark:text-white mt-1 block">&lt; 60 Phút</span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">Bảo quản mát 4°C tận nhà</span>
            </div>
          </div>

          {reserveSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <p className="font-bold text-sm">Đã ghi nhận yêu cầu giữ chỗ tại {selectedHub.name}!</p>
                  <p className="text-xs">Hệ thống FaaS sẽ tự động phân bổ khay nuôi cấy tại buồng kính gần bạn nhất khi bạn kích hoạt gói thuê.</p>
                </div>
              </div>
              <button onClick={() => setReserveSuccess(false)} className="text-xs font-bold underline">
                Đóng
              </button>
            </div>
          )}

          {/* Interactive Hub Grid & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cột Trái (5 Cột): Danh Sách Các Hub */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-base font-black text-[#24170E] dark:text-[#FFF5EA]">
                Chọn Cơ Sở Trang Trại Khép Kín:
              </h2>

              <div className="space-y-3">
                {FARM_HUBS.map((hub) => {
                  const isSelected = selectedHubId === hub.id;
                  return (
                    <button
                      key={hub.id}
                      type="button"
                      onClick={() => setSelectedHubId(hub.id)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#C28E58] bg-[#FAF5EE] dark:bg-[#281A12] shadow-md ring-2 ring-[#C28E58]/30'
                          : 'border-[#DECFC0] dark:border-[#38261A] bg-white dark:bg-[#1A1009] hover:border-[#C28E58]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-[#8A5C38] dark:text-[#D4AF7A]">
                            {hub.city}
                          </span>
                          <h3 className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA] mt-0.5">
                            {hub.name}
                          </h3>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            hub.status === 'ACTIVE'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {hub.status === 'ACTIVE' ? 'Đang Chạy' : 'Pha Mở Rộng'}
                        </span>
                      </div>

                      <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-2 line-clamp-1">
                        📍 {hub.address}
                      </p>

                      <div className="mt-3 pt-3 border-t border-[#EAE1D3] dark:border-[#332014] flex items-center justify-between text-xs">
                        <span className="text-[#8C6D53]">Quy mô:</span>
                        <span className="font-bold text-[#3B2212] dark:text-white">
                          {hub.chambers} buồng ({hub.totalTrays} khay)
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cột Phải (7 Cột): Chi Tiết Hub Đang Chọn & Bản Đồ Vận Hành */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1009] border border-[#DECFC0] dark:border-[#38261A] shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE1D3] dark:border-[#38261A]">
                  <div>
                    <span className="text-xs font-bold text-[#C28E58] uppercase">
                      Hồ Sơ Năng Lực Cơ Sở
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#24170E] dark:text-[#FFF5EA] mt-1">
                      {selectedHub.name}
                    </h3>
                    <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-1 flex items-center gap-1.5">
                      <span>📍</span>
                      <span>{selectedHub.address}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-[#8C6D53] block">Tỷ Lệ Nuôi:</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {selectedHub.activeRate}%
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#523522] dark:text-[#DAC7B5] leading-relaxed">
                  {selectedHub.description}
                </p>

                {/* Đặc điểm & Chuyên môn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF5EE] dark:bg-[#22160E] border border-[#EAE1D3] dark:border-[#332014] space-y-1">
                    <span className="text-[11px] font-bold text-[#8A5C38] block">Chủng nấm chuyên canh:</span>
                    <p className="text-xs font-bold text-[#24170E] dark:text-white">{selectedHub.specialty}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF5EE] dark:bg-[#22160E] border border-[#EAE1D3] dark:border-[#332014] space-y-1">
                    <span className="text-[11px] font-bold text-[#8A5C38] block">Thời gian giao hàng:</span>
                    <p className="text-xs font-bold text-[#C28E58]">{selectedHub.deliverySpeed}</p>
                  </div>
                </div>

                {/* Tags Công Nghệ */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#8A5C38] block">Trang Thiết Bị &amp; Chứng Nhận:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedHub.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FAF5EE] dark:bg-[#25170F] border border-[#DECFC0] dark:border-[#38261A] text-[#6E4B33] dark:text-[#E2BA78]"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Banner CTA Giữ Khay */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#26170E] to-[#3B2212] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="font-bold text-sm text-[#FFF5EA]">
                      Bạn muốn chọn khay nuôi cấy tại {selectedHub.city}?
                    </h4>
                    <p className="text-xs text-[#DAC7B5]">
                      Hệ thống tự động điều phối khay nấm của bạn vào cơ sở gần nhất để tối ưu thời gian nhận nấm tươi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReserve}
                    className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-[#C28E58] to-[#9E6845] text-[#170E08] font-black text-xs shadow-md hover:shadow-lg transition"
                  >
                    Thuê Khay Tại Đây →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
