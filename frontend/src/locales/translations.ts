/**
 * Bộ từ điển song ngữ quốc tế (Tiếng Việt 🇻🇳 & English 🇬🇧)
 * Kế thừa cơ chế i18n từ SEAL_HACKATHON
 * Phụ trách: Đăng (dang0382482793@gmail.com)
 */

export type Language = "vi" | "en";

export const translations = {
  vi: {
    nav: {
      brand: "MushroomCloud",
      customerPortal: "Cổng Khách Hàng",
      operatorCenter: "Trung Tâm Điều Hành",
      swaggerDocs: "Tài Liệu Swagger",
      themeLight: "Sáng",
      themeDark: "Tối",
    },
    hero: {
      badge: "Nền Tảng Nông Trại Nấm Thông Minh FaaS",
      title: "Thuê Khay Nấm Công Nghệ Cao & Giám Sát Từ Xa 24/7",
      subtitle: "Trải nghiệm quy trình nuôi trồng nấm dược liệu chuẩn quốc tế với hệ thống cảm biến vi khí hậu thông minh, camera live stream và công nghệ bảo vệ đơn hàng tự động.",
      exploreBtn: "Khám Phá Gói Thuê",
      operatorBtn: "Bàn Điều Phối Kỹ Thuật",
    },
    packages: {
      title: "Danh Mục Các Gói Thuê Nấm",
      subtitle: "Lựa chọn gói nuôi trồng phù hợp với nhu cầu sử dụng hoặc làm quà tặng cao cấp. Cam kết sản lượng minh bạch.",
      popularBadge: "Ưa Chuộng",
      duration: "Ngày",
      yield: "Sản lượng:",
      rentBtn: "Đăng Ký Thuê Ngay",
      bookedTitle: "Đăng Ký Thuê Thành Công!",
      bookedDesc: "Hệ thống CSDL đang thực thi thủ tục sp_CreateRentalOrder với khóa bi quan để gán mã khay QR riêng biệt cho bạn.",
      closeBtn: "Vào Cổng Khách Hàng Theo Dõi",
    },
    portal: {
      title: "Cổng Khách Hàng Giám Sát Trực Tuyến",
      subtitle: "Quản lý khay nấm cá nhân, xem camera live stream, theo dõi vi khí hậu và gửi yêu cầu thu hoạch.",
      harvestCardTitle: "🧺 Yêu Cầu Thu Hoạch & Đóng Gói",
      harvestCardDesc: "Khay nấm đã đạt chu kỳ thu hoạch tiêu chuẩn. Nhấn nút để gửi lệnh thu hoạch đến kỹ thuật viên trang trại.",
      harvestBtn: "✨ Gửi Yêu Cầu Thu Hoạch",
    },
    stats: {
      trays: "Khay nấm đang nuôi trồng",
      gradeA: "Tỉ lệ nấm đạt chuẩn Loại A",
      iotLogs: "Bản tin cảm biến IoT đã xử lý",
      dbLatency: "Độ trễ phản hồi Trigger T-SQL",
    },
  },
  en: {
    nav: {
      brand: "MushroomCloud",
      customerPortal: "Customer Portal",
      operatorCenter: "Operator Center",
      swaggerDocs: "Swagger API",
      themeLight: "Light",
      themeDark: "Dark",
    },
    hero: {
      badge: "Smart Mushroom Farm-as-a-Service Platform",
      title: "High-Tech Mushroom Tray Rental & 24/7 Remote Monitoring",
      subtitle: "Experience international standard medicinal mushroom cultivation with smart microclimate sensors, live camera stream, and automated transactional ACID safety.",
      exploreBtn: "Explore Packages",
      operatorBtn: "Operator Center",
    },
    packages: {
      title: "Mushroom Rental Packages",
      subtitle: "Select the ideal cultivation package for personal use or premium gifts. Guaranteed transparent yields.",
      popularBadge: "Popular",
      duration: "Days",
      yield: "Yield:",
      rentBtn: "Rent This Tray Now",
      bookedTitle: "Rental Order Placed Successfully!",
      bookedDesc: "The database is executing stored procedure sp_CreateRentalOrder with pessimistic locking to allocate your exclusive QR tray.",
      closeBtn: "Go to Customer Portal",
    },
    portal: {
      title: "Online Customer Monitoring Portal",
      subtitle: "Manage personal trays, watch live camera stream, inspect real-time telemetry, and dispatch harvest requests.",
      harvestCardTitle: "🧺 Harvest & Packaging Request",
      harvestCardDesc: "Your mushroom tray has reached optimal maturity. Click below to submit a harvest dispatch to farm technicians.",
      harvestBtn: "✨ Request Harvest Dispatch",
    },
    stats: {
      trays: "Active Cultivation Trays",
      gradeA: "Grade A Quality Rate",
      iotLogs: "Processed IoT Telemetry",
      dbLatency: "T-SQL Trigger Latency",
    },
  },
};
