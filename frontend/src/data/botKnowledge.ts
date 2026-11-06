/**
 * Cơ sở tri thức AI Bot thông minh (MushroomCloud Knowledge Base)
 * Kế thừa ý tưởng Mascot Chat Assistant từ SEAL_HACKATHON
 * Phụ trách: Võ Duy Thịnh (thinh20032006@gmail.com)
 */

export interface FAQItem {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  category: 'rental' | 'microclimate' | 'mushroom' | 'system';
}

export const BOT_KNOWLEDGE: FAQItem[] = [
  {
    id: 'rental-process',
    keywords: ['thuê', 'quy trình', 'đặt khay', 'hợp đồng', 'thanh toán', 'rental'],
    question: 'Quy trình thuê khay nấm thông minh diễn ra như thế nào?',
    answer: 'Quy trình gồm 4 bước đơn giản: 1. Chọn loại nấm dược liệu (Đông Trùng Hạ Thảo, Linh Chi, Hoàng Kim...); 2. Lựa chọn khay nuôi có sẵn trong nhà kính; 3. Ký hợp đồng điện tử và kích hoạt hệ thống giám sát 24/7; 4. Theo dõi livestream và nhận nấm tươi thu hoạch tận nhà kèm chứng nhận xuất xứ.',
    category: 'rental',
  },
  {
    id: 'cordyceps-temp',
    keywords: ['đông trùng hạ thảo', 'nhiệt độ', 'độ ẩm', 'cordyceps', 'vi khí hậu'],
    question: 'Điều kiện vi khí hậu chuẩn cho Nấm Đông Trùng Hạ Thảo là gì?',
    answer: 'Nấm Đông Trùng Hạ Thảo (Cordyceps militaris) yêu cầu vi khí hậu khắt khe: Nhiệt độ duy trì từ 18°C - 22°C, độ ẩm không khí 85% - 92%, nồng độ CO2 dưới 800 ppm và cường độ ánh sáng quang phổ 500 - 1000 lux (12h sáng/12h tối) trong giai đoạn hình thành quả thể.',
    category: 'microclimate',
  },
  {
    id: 'reishi-climate',
    keywords: ['linh chi', 'reishi', 'nấm linh chi', 'khí hậu', 'ẩm độ'],
    question: 'Điều kiện chăm sóc Nấm Linh Chi đỏ như thế nào?',
    answer: 'Nấm Linh Chi (Ganoderma lucidum) ưa nhiệt đới: Nhiệt độ 26°C - 30°C, độ ẩm 80% - 90%, CO2 duy trì 1000 - 1500 ppm giai đoạn mầm sừng hươu và xả thoáng < 1000 ppm giai đoạn tán dù xòe.',
    category: 'microclimate',
  },
  {
    id: 'loss-warranty',
    keywords: ['bảo hành', 'chết nấm', 'hư hỏng', 'bảo hiểm', 'đền bù', 'rủi ro'],
    question: 'Nếu khay nấm gặp sự cố dịch bệnh hoặc suy thoái thì được xử lý ra sao?',
    answer: 'MushroomCloud áp dụng chính sách Bảo hiểm Sản Lượng 100%: Hệ thống IoT phát hiện bất thường sẽ tự động cách ly. Nếu sản lượng thu hoạch thực tế thấp hơn 80% mức cam kết do lỗi kỹ thuật/vi khí hậu, hệ thống sẽ tự động hoàn tiền hoặc đền bù khay nuôi mới miễn phí.',
    category: 'rental',
  },
  {
    id: 'db-concurrency',
    keywords: ['csdl', 'tranh chấp', 'lost update', 'dirty read', 'isolation', 'khoá'],
    question: 'Hệ thống bảo vệ dữ liệu chống đặt trùng khay (Lost Update) bằng cách nào?',
    answer: 'MushroomCloud áp dụng Stored Procedure T-SQL tích hợp giao dịch SERIALIZABLE / REPEATABLE READ với khoá UPDLOCK và ROWLOCK. Khi 2 khách hàng đồng thời đặt cùng 1 khay, chỉ người đầu tiên giao dịch thành công, giao dịch thứ hai sẽ được báo bận tức thì mà không bị xung đột dữ liệu.',
    category: 'system',
  },
  {
    id: 'iot-sensors',
    keywords: ['cảm biến', 'iot', 'camera', 'live', 'realtime', 'giám sát'],
    question: 'Dữ liệu cảm biến vi khí hậu được cập nhật bao lâu một lần?',
    answer: 'Cụm vi điều khiển ESP32 gửi dữ liệu telemetry qua giao thức MQTT/WebSocket mỗi 3 - 5 giây. Đồ thị vi khí hậu trên cổng khách hàng hiển thị real-time và cảnh báo ngưỡng tự động qua WebSocket.',
    category: 'system',
  },
];

export const SUGGESTED_QUESTIONS = [
  'Quy trình thuê khay nấm thế nào?',
  'Nhiệt độ nuôi Đông Trùng Hạ Thảo?',
  'Chính sách bảo hiểm sản lượng?',
  'Hệ thống chống đặt trùng khay thế nào?',
];
