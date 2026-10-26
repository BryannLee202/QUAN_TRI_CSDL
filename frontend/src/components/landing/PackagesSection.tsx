import React from "react";

const packages = [
  {
    id: "pkg-1",
    name: "Gói Nấm Bào Ngư Xám",
    species: "Bào Ngư Xám Phòng Cleanroom",
    price: "299.000 VNĐ",
    expectedYield: "2.5 - 3.0 kg",
    duration: "30 Ngày",
    features: [
      "Định danh khay bằng mã QR riêng",
      "Giám sát nhiệt độ, độ ẩm 24/7",
      "Xem Timelapse nấm phát triển",
      "Miễn phí giao hàng tận nhà khi thu hoạch",
    ],
  },
  {
    id: "pkg-2",
    name: "Gói Nấm Linh Chi Đỏ Luxury",
    species: "Linh Chi Đỏ Dược Liệu High-Tech",
    price: "899.000 VNĐ",
    expectedYield: "1.2 - 1.5 kg",
    duration: "90 Ngày",
    isPopular: true,
    features: [
      "Khay nấm đặt vị trí vi khí hậu tối ưu",
      "Cam kết sản lượng tiêu chuẩn dược liệu",
      "Quyền điều khiển quạt hút / phun sương từ xa",
      "Báo cáo tự động bằng AI hình ảnh",
    ],
  },
  {
    id: "pkg-3",
    name: "Gói Đông Trùng Hạ Thảo",
    species: "Đông Trùng Hạ Thảo Chủng Cordyceps",
    price: "1.499.000 VNĐ",
    expectedYield: "0.8 - 1.0 kg",
    duration: "60 Ngày",
    features: [
      "Môi trường vô trùng tuyệt đối ISO Class 5",
      "Camera Live Stream độ phân giải 4K riêng",
      "Hỗ trợ sấy thăng hoa đóng gói cao cấp",
      "Bảo hiểm 100% rủi ro nuôi trồng",
    ],
  },
];

export default function PackagesSection() {
  return (
    <section id="packages" className="py-20 px-6 bg-[#F8FAFC] text-slate-800">
      <div className="max-w-6xl mx-auto text-center space-y-4 mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">
          Danh Mục Các Gói Thuê Nấm
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Lựa chọn gói nuôi trồng phù hợp với nhu cầu sử dụng hoặc làm quà tặng cao cấp. Cam kết sản lượng minh bạch.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative bg-white rounded-2xl p-8 shadow-sm border transition hover:shadow-xl flex flex-col justify-between ${
              pkg.isPopular
                ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20"
                : "border-slate-200"
            }`}
          >
            {pkg.isPopular && (
              <span className="absolute -top-3 right-6 bg-[#D4AF37] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                Ưa Chuộng
              </span>
            )}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#0D5C3A]">{pkg.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{pkg.species}</p>
              <div className="border-b border-slate-100 pb-4">
                <span className="text-3xl font-extrabold text-[#0F172A]">
                  {pkg.price}
                </span>
                <span className="text-slate-400 text-sm"> / {pkg.duration}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-sm font-semibold text-slate-700">
                ⚖️ Sản lượng:{" "}
                <span className="text-[#0D5C3A]">{pkg.expectedYield}</span>
              </div>
              <ul className="space-y-3 pt-2 text-sm text-slate-600">
                {pkg.features.map((ft, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#0D5C3A] font-bold">✓</span>
                    <span>{ft}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-8 w-full py-3 px-4 rounded-xl font-semibold bg-[#0F172A] hover:bg-[#0D5C3A] text-white transition">
              Đăng Ký Thuê Ngay
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
