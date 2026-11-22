/**
 * Bộ từ điển dịch đồng bộ toàn cục Việt -> Anh (Global i18n Dictionary)
 * Bao phủ toàn bộ 12 trang, Modal, Sidebar, Operator Hub, Checkout & Profile.
 */

export const VI_TO_EN_EXACT: Array<[string, string]> = [
  // Navbar & Header
  ["Cổng Khách Hàng", "Customer Portal"],
  ["Gói Thuê Nấm", "Rental Packages"],
  ["Máy Tính Lợi Nhuận", "ROI Calculator"],
  ["Sàn Nông Sản FaaS", "FaaS Marketplace"],
  ["Mạng Lưới Farm", "Farm Network"],
  ["Hồ Sơ", "Profile"],
  ["Đăng Nhập", "Sign In"],
  ["Đăng Ký", "Sign Up"],
  ["Tạo Tài Khoản", "Create Account"],
  ["Tiện Ích & Cài Đặt", "Settings & Hub"],
  ["Trung Tâm Điều Hành", "Operator Hub"],
  ["Cổng Khách Hàng", "Customer Portal"],

  // RightControlHub (Sidebar)
  ["Trung Tâm Điều Khiển FaaS", "FaaS Control Center"],
  ["CÀI ĐẶT, TIỆN ÍCH & THÔNG BÁO", "SETTINGS, TOOLS & ALERTS"],
  ["TÀI KHOẢN THÀNH VIÊN", "MEMBER ACCOUNT"],
  ["Đăng nhập để giám sát khay nấm từ xa, theo dõi luồng camera trực tiếp và nhận thông báo thu hoạch chuẩn VietGAP.", "Sign in to monitor your mushroom trays remotely, watch live camera feeds, and receive VietGAP harvest alerts."],
  ["Xem Hồ Sơ & Lịch Sử Giao Dịch", "View Profile & Transaction History"],
  ["TÙY CHỌN HỆ THỐNG", "SYSTEM PREFERENCES"],
  ["Chế độ hiển thị:", "Display Mode:"],
  ["Ban Ngày (Light)", "Daylight (Light)"],
  ["Ban Đêm (Dark)", "Night (Dark)"],
  ["Giao Diện Sáng", "Light Mode"],
  ["Giao Diện Tối", "Dark Mode"],
  ["Ngôn ngữ hiển thị:", "Display Language:"],
  ["Thông Báo Vi Khí Hậu & Nông Trại", "Microclimate & Farm Alerts"],
  ["Đọc tất cả", "Mark all read"],
  ["3 mới", "3 new"],
  ["Cảnh Báo Vi Khí Hậu Buồng B-02", "Room B-02 Microclimate Alert"],
  ["Nhiệt độ đạt ngưỡng 24.5°C. Rèm lạnh đối lưu tự động đã được kích hoạt.", "Temperature reached 24.5°C. Auto convective cooling curtain activated."],
  ["Khay R01-001 Đã Sẵn Sàng Thu Hoạch", "Tray R01-001 Ready for Harvest"],
  ["Cụm Nấm Bào Ngư Xám đạt độ trưởng thành 98%. Có thể gửi lệnh thu hoạch ngay.", "Grey Oyster cluster reached 98% maturity. Ready for harvest dispatch."],
  ["Hợp Đồng VietGAP Đã Cấp Chứng Nhận", "VietGAP Certificate Issued"],
  ["Hồ sơ truy xuất nguồn gốc cho lô nấm Linh Chi Đỏ đã được đồng bộ CSDL.", "Traceability record for Red Reishi batch has been synced to database."],
  ["Đăng Xuất Khỏi Hệ Thống", "Sign Out"],
  ["Bàn Điều Hành Kỹ Thuật", "Operator Center"],
  ["Hồ Sơ & Giao Dịch", "Profile & Orders"],
  ["Quản Trị Viên", "Administrator"],
  ["Kỹ Thuật Viên", "Operator"],
  ["Khách Hàng", "Customer"],
  ["Phiên bản 2.5", "Version 2.5"],

  // Hero Section
  ["Vận Hành 24/7", "24/7 Operations"],
  ["120 Buồng Nuôi ISO Class 5", "120 ISO Class 5 Chambers"],
  ["AI Llama-3.1-8B Giám Sát", "AI Llama-3.1-8B Monitoring"],
  ["Nông Trại Nấm Thông Minh Trong Tầm Tay", "Smart Mushroom Farm At Your Fingertips"],
  ["Của Bạn", "Today"],
  ["Trải nghiệm mô hình nuôi trồng nấm dược liệu công nghệ cao khép kín chuẩn ISO: Thuê khay nấm trực tuyến, giám sát vi khí hậu 24/7 qua cảm biến IoT & Camera Live Stream, nhận nấm tươi thu hoạch tận nhà.", "Experience closed-loop ISO-certified medicinal mushroom cultivation: rent trays online, monitor 24/7 IoT microclimate telemetry & live cameras, and receive fresh harvests at your doorstep."],
  ["Thuê Khay Ngay (Khám Phá)", "Rent a Tray Now"],
  ["Xem Demo Camera Trực Tiếp", "Watch Live Camera Demo"],
  ["Buồng Kính 3D", "3D Smart Chamber"],
  ["Dàn Nuôi Đa Tầng", "Multi-Tier Racks"],
  ["Phòng Điều Hành", "Control Room"],
  ["Cận Cảnh 4K", "4K Macro View"],
  ["QUANG PHỔ & VI KHÍ HẬU:", "SPECTRUM & CLIMATE:"],
  ["Ngày (5000K)", "Day (5000K)"],
  ["Đêm Ấm", "Warm Night"],
  ["UV-C Khử Khuẩn", "UV-C Sterilize"],
  ["Buồng Nuôi ISO Class 5 • Cảm Biến IoT 24/7", "ISO Class 5 Chamber • 24/7 IoT Sensors"],
  ["Buồng Nuôi Thông Minh 3D", "3D Smart Cultivation Chamber"],
  ["Buồng kính lập phương vô trùng kiểm soát vi khí hậu độc lập, tích hợp phun sương siêu âm và camera góc rộng.", "Sterile glass chamber with independent microclimate control, ultrasonic misting, and wide-angle camera."],
  ["Bấm chọn các tab phía trên để chuyển đổi góc nhìn buồng nuôi và cơ sở công nghệ cao thực tế", "Click the tabs above to switch between chamber views and real cleanroom facility angles"],

  // Bento & Stats
  ["Khay Nấm Đang Nuôi", "Active Trays"],
  ["Độ Chuẩn VietGAP", "VietGAP Compliance"],
  ["Bản Tin Cảm Biến IoT", "IoT Telemetry Logs"],
  ["Độ Trễ Khóa Dòng T-SQL", "T-SQL Lock Latency"],
  ["Khóa Dòng ACID Zero-Overbooking", "ACID Row-Lock Zero-Overbooking"],
  ["Giao dịch thuê khay dùng UPDLOCK, ROWLOCK đảm bảo không trùng lịch.", "Tray bookings use UPDLOCK & ROWLOCK transactions to prevent double-booking."],
  ["Cảm Biến Vi Khí Hậu 24/7", "24/7 Microclimate Sensors"],
  ["Giám sát nhiệt độ, độ ẩm và CO2 liên tục theo thời gian thực.", "Continuous real-time monitoring of temperature, humidity, and CO2."],
  ["Camera PTZ & Timelapse 30 Ngày", "PTZ Camera & 30-Day Timelapse"],
  ["Quan sát trực tiếp từng kệ nấm và tua nhanh quá trình sinh trưởng.", "Inspect individual mushroom shelves live and scrub 30-day growth timelapse."],
  ["Chứng Nhận VietGAP Điện Tử", "Digital VietGAP Certification"],
  ["Truy xuất nguồn gốc minh bạch kèm mã QR và hợp đồng điện tử.", "Transparent traceability with QR verification and digital contracts."],

  // Packages Section
  ["Danh Mục Các Gói Thuê Nấm", "Mushroom Tray Rental Packages"],
  ["Lựa chọn gói nuôi trồng phù hợp với nhu cầu sử dụng hoặc làm quà tặng cao cấp. Cam kết sản lượng minh bạch.", "Choose a cultivation plan tailored for home use or premium gifting. Transparent yield guaranteed."],
  ["Ưa Chuộng", "Most Popular"],
  ["Phổ Biến Nhất", "Most Popular"],
  ["Đăng Ký Thuê Ngay", "Rent This Tray"],
  ["Thuê Khay Này", "Rent This Tray"],
  ["Nấm Bào Ngư Xám", "Grey Oyster Mushroom"],
  ["Nấm bào ngư xám", "Grey Oyster Mushroom"],
  ["Nấm Linh Chi Đỏ", "Red Reishi Mushroom"],
  ["Nấm Hầu Thủ", "Lion's Mane Mushroom"],
  ["Đông Trùng Hạ Thảo", "Cordyceps Militaris"],
  ["Chu kỳ nuôi trồng:", "Cultivation cycle:"],
  ["Sản lượng cam kết:", "Guaranteed yield:"],
  ["Sản lượng:", "Yield:"],

  // Customer Portal
  ["Cổng Khách Hàng Giám Sát Trực Tuyến", "Online Customer Monitoring Portal"],
  ["Cổng Giám Sát Buồng Nuôi Khách Hàng", "Customer Chamber Monitoring Portal"],
  ["Quản lý khay nấm cá nhân, xem camera live stream, theo dõi vi khí hậu và gửi yêu cầu thu hoạch.", "Manage your rented trays, watch live camera feeds, track microclimate telemetry, and request harvests."],
  ["Camera Trực Tiếp Buồng Nuôi", "Live Chamber Camera"],
  ["Biểu Đồ Vi Khí Hậu 24h", "24h Microclimate Telemetry"],
  ["Thước Tua Timelapse Sinh Trưởng", "Growth Timelapse Slider"],
  ["Yêu Cầu Thu Hoạch Tận Nhà", "Request Home Harvest"],
  ["Xem Chứng Thực VietGAP", "View VietGAP Certificate"],
  ["Nhiệt độ buồng", "Chamber Temp"],
  ["Độ ẩm không khí", "Air Humidity"],
  ["Nồng độ CO2", "CO2 Level"],

  // Checkout Modal
  ["Cổng Thanh Toán Điện Tử SmartMushroom", "SmartMushroom Payment Gateway"],
  ["Xác Nhận & Thanh Toán Đơn Thuê Khay", "Confirm & Pay Tray Rental"],
  ["Thông Tin Giao Nhận & Thanh Toán", "Delivery & Payment Details"],
  ["Họ và tên người nhận", "Recipient Full Name"],
  ["Số điện thoại liên hệ", "Contact Phone Number"],
  ["Địa chỉ nhận nấm thu hoạch", "Harvest Delivery Address"],
  ["Phương thức thanh toán", "Payment Method"],
  ["Quét mã VietQR Napas 247", "VietQR Napas 247"],
  ["Ví / Cổng VNPAY-QR", "VNPAY-QR Gateway"],
  ["Thẻ Quốc Tế Visa / Master", "Visa / Mastercard"],
  ["Thanh Toán Khi Nhận Nấm (COD)", "Cash on Delivery (COD)"],
  ["Xác Nhận Thanh Toán", "Confirm Payment"],
  ["Đang xử lý giao dịch...", "Processing transaction..."],
  ["Thanh Toán Thành Công!", "Payment Successful!"],
  ["Đóng", "Close"],
  ["Hủy Bỏ", "Cancel"],

  // Operator Hub
  ["Trung Tâm Điều Hành Trang Trại FaaS", "FaaS Farm Operator Hub"],
  ["Giám sát ma trận khay, mở rộng công suất kệ nuôi và can thiệp rơ-le IoT thời gian thực", "Monitor tray matrices, expand rack capacity, and control IoT relays in real time"],
  ["Sổ Tay Kỹ Thuật SOP", "SOP Technical Manual"],
  ["Sơ Đồ Kệ & Ma Trận Khay Nuôi", "Rack Layout & Tray Matrix"],
  ["Chọn buồng nuôi, lọc nhanh trạng thái hoặc khởi tạo thêm khay mới khi trang trại kín chỗ", "Select a chamber, filter by status, or provision new trays when capacity is full"],
  ["Tạo Khay Mới", "Add New Trays"],
  ["Điều Khiển Thiết Bị Buồng", "Chamber Hardware Controls"],
  ["Can thiệp cưỡng bức rơ-le phần cứng IoT", "Manual override for IoT hardware relays"],
  ["Quạt hút khí CO₂", "CO2 Exhaust Fan"],
  ["Máy phun sương siêu âm", "Ultrasonic Mist Maker"],
  ["Cảnh Báo Vi Khí Hậu", "Microclimate Alerts"],
  ["Đã xử lý", "Resolved"],
  ["Xử Lý Cảnh Báo", "Resolve Alert"],
  ["Tất cả:", "All:"],
  ["Đang nuôi:", "Occupied:"],
  ["Cảnh báo:", "Alert:"],
  ["Bảo trì:", "Maintenance:"],
  ["Trống:", "Available:"],
  ["Khay trống • Sẵn sàng", "Empty tray • Available"],
  ["Khử khuẩn & Bảo dưỡng", "Sanitizing & Maintenance"],
  ["Phân Tích Gói Tin Nhị Phân IoT (Binary Hex Decoder)", "IoT Binary Hex Packet Decoder"],
  ["Sinh Frame Mẫu", "Generate Sample"],
  ["Giải Mã Frame", "Decode Frame"],
  ["Nạp Vào CSDL SQL Server", "Ingest to SQL Server"],

  // Virtual Tray Inspector Modal
  ["Camera Đường Ray Quan Sát Thực Tế", "Real-Farm PTZ Rail Camera"],
  ["← Khay Trước", "← Prev Tray"],
  ["Khay Tiếp →", "Next Tray →"],
  ["Di chuyển đến Kệ:", "Move to Rack:"],
  ["Cận Cảnh Khay & Phôi Thật", "Real Tray & Spawn Close-up"],
  ["Dàn Kệ Phòng Sạch", "Cleanroom Racks"],
  ["Hành Lang Kệ Đa Tầng", "Multi-Tier Farm Aisle"],
  ["Tự Động Lia Kệ", "Auto-Patrol Rail"],
  ["Đang Tuần Tra Kệ...", "Patrolling Rack..."],
  ["Đầu Kệ (0%)", "Rack Start (0%)"],
  ["Giữa Kệ (50%)", "Rack Mid (50%)"],
  ["Cuối Kệ (100%)", "Rack End (100%)"],
  ["Rê Chuột: Bật", "Hover Pan: ON"],
  ["Rê Chuột: Khóa (Kéo tay)", "Hover Pan: Locked (Drag)"],
  ["Ẩn Khung AI", "Hide AI Boxes"],
  ["Hiện Khung AI", "Show AI Boxes"],
  ["Quét AI Kiểm Định Thực Tế", "Run Live AI Inspection"],
  ["Đang quét kiểm định...", "Scanning..."],
  ["Phun Sương Bù Ẩm Tại Kệ", "Trigger Rack Misting"],
  ["Đang phun sương kệ...", "Misting rack..."],
  ["Tiến Độ Chu Kỳ Sinh Trưởng", "Growth Cycle Progress"],
  ["Hồ Sơ Định Danh & Hợp Đồng", "Tray Identity & Contract"],
  ["Mã định danh khay:", "Tray Code:"],
  ["Tọa độ kệ nuôi:", "Rack Position:"],
  ["Trạng thái vận hành:", "Operational Status:"],
  ["Số hợp đồng FaaS:", "FaaS Contract No:"],
  ["Chủ sở hữu:", "Owner:"],
  ["Giống nấm canh tác:", "Cultivated Species:"],
  ["Đang nuôi nấm (Bảo vệ theo hợp đồng)", "Active Cultivation (Contract Protected)"],
  ["Chuyển Sang Bảo Trì (MAINTENANCE)", "Switch to Maintenance"],
  ["Mở Lại Sẵn Sàng (AVAILABLE)", "Reopen as Available"],
  ["Cấy phôi", "Inoculation"],
  ["Ủ sợi tơ", "Mycelium Run"],
  ["Kết nụ mầm", "Pinning"],
  ["Nuôi quả thể", "Fruiting"],
  ["Thu hoạch", "Harvest"],

  // Profile / Login / Register / Subpages
  ["Hồ Sơ Cá Nhân & Lịch Sử Giao Dịch", "Member Profile & Transaction History"],
  ["Quay Lại Trang Chủ", "Back to Home"],
  ["Đăng Nhập Hệ Thống", "Sign In to SmartMushroom"],
  ["Đăng Ký Tài Khoản", "Create Member Account"],
  ["Mật khẩu", "Password"],
  ["Họ và tên", "Full Name"],
  ["Số điện thoại", "Phone Number"],
  ["Địa chỉ", "Address"],
  ["Đăng Nhập Ngay", "Sign In Now"],
  ["Đang đăng nhập...", "Signing in..."],
  ["Không có khay nuôi nào thuộc trạng thái đang lọc trong buồng này.", "No trays match the selected filter in this chamber."],

  // Footer
  ["Trang Chủ", "Home"],
  ["Điều Khoản", "Terms"],
  ["Bảo Mật", "Privacy"],
  ["Liên Hệ", "Contact"],
  ["Bản quyền thuộc về", "Copyright belongs to"],
];

// Sắp xếp theo độ dài giảm dần để cụm từ dài được dịch trước, tránh dịch đè cụm ngắn
const SORTED_PAIRS = [...VI_TO_EN_EXACT].sort((a, b) => b[0].length - a[0].length);

export function translateTextViToEn(input: string): string {
  if (!input || !input.trim()) return input;
  let out = input;

  // 1. Áp dụng các mẫu câu động có số (Kệ, Tầng, Khay, Ngày...)
  out = out
    .replace(/\bKhay\s+(R\d{2}-\d{3})\b/g, "Tray $1")
    .replace(/\bKệ\s+(\d{2})\s*•\s*Tầng\s+(\d{2})\b/g, "Rack $1 • Shelf $2")
    .replace(/\bKệ\s+(\d{2})\b/g, "Rack $1")
    .replace(/\bBuồng\s+(RM\d+|B-\d+)\b/g, "Room $1")
    .replace(/\bNgày\s+(\d+-\d+)\b/g, "Day $1")
    .replace(/\bĐạt\s+(\d+)%\s+chu kỳ\b/g, "$1% Cycle Progress")
    .replace(/\bKhay trên Kệ\s+(\d{2}):/g, "Trays on Rack $1:")
    .replace(/\bRadar Ống Kính Kệ\s+(\d{2}):/g, "Rack $1 Lens Radar:")
    .replace(/\bCảm Biến Tại Kệ\s+(\d{2})\s*•\s*Tầng\s+(\d{2})/g, "Sensors at Rack $1 • Shelf $2")
    .replace(/\bVị trí ray:\s*(\d+)%\s*\/\s*100%/g, "Rail Pos: $1% / 100%")
    .replace(/\bTọa độ ray:\s*(\d+)%\s*\/\s*100%/g, "Rail Pos: $1% / 100%");

  // 2. Thay thế các cụm từ chính xác trong từ điển
  for (const [vi, en] of SORTED_PAIRS) {
    if (out.includes(vi)) {
      out = out.split(vi).join(en);
    }
  }

  return out;
}
