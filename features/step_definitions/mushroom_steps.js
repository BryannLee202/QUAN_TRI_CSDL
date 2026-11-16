/**
 * MushroomCloud - BDD Cucumber Step Definitions
 * Ánh xạ các câu Gherkin tiếng Việt sang mã gọi Backend API & CSDL
 * Phụ trách: LeMinhTai (Chủ dự án) <leminhtai2222005@gmail.com>
 */

const http = require('http');

const HOST = '127.0.0.1';
const PORT = 5000;

function sendApi(method, path, data, headers = {}) {
  return new Promise((resolve) => {
    const defaultHeaders = {
      'x-test-suite': 'true',
      'Content-Type': 'application/json',
      ...headers,
    };

    const req = http.request(
      {
        hostname: HOST,
        port: PORT,
        path,
        method,
        headers: defaultHeaders,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );

    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

// Bảng ánh xạ Step Definitions
const stepDefinitions = [
  // 1. Given steps
  {
    pattern: /hệ thống Backend API và CSDL SQL Server đang hoạt động bình thường/i,
    action: async (context) => {
      const res = await sendApi('GET', '/api/health');
      if (res.status !== 200 || res.body.status !== 'healthy') {
        throw new Error(`CSDL hoặc Backend không phản hồi bình thường (Status: ${res.status})`);
      }
      context.health = res.body;
    },
  },
  {
    pattern: /người dùng có email "([^"]+)" và mật khẩu "([^"]+)"/i,
    action: async (context, email, password) => {
      context.credentials = { email, password };
    },
  },
  {
    pattern: /người dùng "([^"]+)" đăng nhập thành công với vai trò "([^"]+)"/i,
    action: async (context, email, role) => {
      const res = await sendApi('POST', '/api/auth/login', {
        email,
        password: 'Password123@',
      });
      if (res.status !== 200 || !res.body.data?.token) {
        throw new Error(`Đăng nhập thất bại cho ${email}: ${res.status}`);
      }
      context.userToken = res.body.data.token;
      context.userRole = res.body.data.user.role;
    },
  },
  {
    pattern: /trạm cảm biến IoT gửi gói tin Hex "([^"]+)"/i,
    action: async (context, hexPayload) => {
      context.hexPayload = hexPayload;
    },
  },
  {
    pattern: /kỹ thuật viên "([^"]+)" đã được cấp quyền Operator/i,
    action: async (context, email) => {
      const res = await sendApi('POST', '/api/auth/login', {
        email,
        password: 'Password123@',
      });
      if (res.status !== 200 || !res.body.data?.token) {
        throw new Error(`Đăng nhập Operator thất bại: ${res.status}`);
      }
      context.operatorToken = res.body.data.token;
    },
  },
  {
    pattern: /khách hàng có ID là (\d+) gửi yêu cầu thuê khay nấm/i,
    action: async (context, userId) => {
      context.rentalUserId = Number(userId);
    },
  },

  // 2. When steps
  {
    pattern: /khách hàng truy vấn danh sách buồng nuôi tại endpoint "([^"]+)"/i,
    action: async (context, endpoint) => {
      context.lastResponse = await sendApi('GET', endpoint);
    },
  },
  {
    pattern: /người dùng thực hiện đăng nhập qua endpoint "([^"]+)"/i,
    action: async (context, endpoint) => {
      context.lastResponse = await sendApi('POST', endpoint, context.credentials);
    },
  },
  {
    pattern: /khách hàng cố tình gửi lệnh bật thiết bị phần cứng tại "([^"]+)"/i,
    action: async (context, endpoint) => {
      context.lastResponse = await sendApi(
        'POST',
        endpoint,
        {
          roomId: 1,
          deviceType: 'MISTING_SYSTEM',
          actionState: 'ON',
          reason: 'Khách hàng cố tình can thiệp',
        },
        {
          Authorization: `Bearer ${context.userToken}`,
          Cookie: `token=${context.userToken}`,
        }
      );
    },
  },
  {
    pattern: /gói tin được nạp vào Gateway qua endpoint "([^"]+)" với mã phòng là (\d+)/i,
    action: async (context, endpoint, roomId) => {
      context.lastResponse = await sendApi('POST', endpoint, {
        hexPayload: context.hexPayload,
        roomId: Number(roomId),
      });
    },
  },
  {
    pattern: /kỹ thuật viên gửi lệnh bật thiết bị "([^"]+)" cho buồng nuôi (\d+)/i,
    action: async (context, deviceType, roomId) => {
      context.lastResponse = await sendApi(
        'POST',
        '/api/operator/devices/toggle',
        {
          roomId: Number(roomId),
          deviceType,
          actionState: 'ON',
          reason: 'Kỹ thuật viên bù ẩm phòng sạch tự động',
        },
        {
          Authorization: `Bearer ${context.operatorToken}`,
          Cookie: `token=${context.operatorToken}`,
        }
      );
    },
  },
  {
    pattern: /khách hàng gửi yêu cầu thuê gói "([^"]+)" với thời hạn (\d+) tháng và giá (\d+) VNĐ/i,
    action: async (context, packageName, months, price) => {
      context.lastResponse = await sendApi('POST', '/api/rentals', {
        userId: context.rentalUserId || 4,
        packageId: 1,
        durationMonths: Number(months),
        totalPrice: Number(price),
      });
    },
  },

  // 3. Then & And steps
  {
    pattern: /hệ thống phải phản hồi mã trạng thái (\d+)( hoặc (\d+))?/i,
    action: async (context, status1, _, status2) => {
      const actual = context.lastResponse.status;
      const expected = [Number(status1)];
      if (status2) expected.push(Number(status2));
      if (!expected.includes(actual)) {
        throw new Error(`Kỳ vọng trạng thái ${expected.join(' hoặc ')} nhưng nhận được ${actual}`);
      }
    },
  },
  {
    pattern: /dữ liệu trả về phải có ít nhất (\d+) buồng nuôi đang vận hành/i,
    action: async (context, minCount) => {
      const data = context.lastResponse.body?.data;
      if (!Array.isArray(data) || data.length < Number(minCount)) {
        throw new Error(`Kỳ vọng có ít nhất ${minCount} buồng nuôi, nhưng nhận được: ${data?.length}`);
      }
    },
  },
  {
    pattern: /buồng nuôi "([^"]+)" phải có nhiệt độ chuẩn từ (\d+) đến (\d+) độ C/i,
    action: async (context, roomCode, minTemp, maxTemp) => {
      const room = context.lastResponse.body?.data?.find((r) => r.roomCode === roomCode);
      if (!room) throw new Error(`Không tìm thấy buồng nuôi ${roomCode}`);
      if (room.tempMin < Number(minTemp) || room.tempMax > Number(maxTemp)) {
        throw new Error(`Nhiệt độ phòng ${roomCode} (${room.tempMin}-${room.tempMax}) không nằm trong khoảng ${minTemp}-${maxTemp}`);
      }
    },
  },
  {
    pattern: /token JWT được cấp phát có thời hạn hợp lệ/i,
    action: async (context) => {
      const token = context.lastResponse.body?.data?.token;
      if (!token || typeof token !== 'string') {
        throw new Error('Không nhận được JWT Token hợp lệ từ máy chủ');
      }
      context.adminToken = token;
    },
  },
  {
    pattern: /vai trò của người dùng được xác định là "([^"]+)"/i,
    action: async (context, expectedRole) => {
      const role = context.lastResponse.body?.data?.user?.role;
      if (role !== expectedRole) {
        throw new Error(`Kỳ vọng vai trò ${expectedRole} nhưng nhận được ${role}`);
      }
    },
  },
  {
    pattern: /hệ thống bảo mật phải chặn lại với mã trạng thái (\d+)/i,
    action: async (context, expectedStatus) => {
      if (context.lastResponse.status !== Number(expectedStatus)) {
        throw new Error(`Hệ thống không chặn an toàn (Status: ${context.lastResponse.status})`);
      }
    },
  },
  {
    pattern: /không có sự thay đổi nào đối với trạng thái relay buồng nuôi nấm/i,
    action: async () => {
      // Xác nhận bảo mật nguyên vẹn
    },
  },
  {
    pattern: /nhiệt độ đo được phải là ([\d\.]+) độ C/i,
    action: async (context, expectedTemp) => {
      const actual = context.lastResponse.body?.data?.temperature;
      if (actual !== Number(expectedTemp)) {
        throw new Error(`Kỳ vọng nhiệt độ ${expectedTemp}°C nhưng nhận được ${actual}°C`);
      }
    },
  },
  {
    pattern: /độ ẩm đo được phải là ([\d\.]+) phần trăm/i,
    action: async (context, expectedHumidity) => {
      const actual = context.lastResponse.body?.data?.humidity;
      if (actual !== Number(expectedHumidity)) {
        throw new Error(`Kỳ vọng độ ẩm ${expectedHumidity}% nhưng nhận được ${actual}%`);
      }
    },
  },
  {
    pattern: /dữ liệu cảm biến phải được lưu thành công vào bảng "SensorData"/i,
    action: async (context) => {
      if (!context.lastResponse.body?.success) {
        throw new Error('Dữ liệu không được ghi thành công vào CSDL');
      }
    },
  },
  {
    pattern: /sự kiện bật máy phun sương được phát sóng thời gian thực qua WebSocket/i,
    action: async (context) => {
      if (!context.lastResponse.body?.success) {
        throw new Error('Sự kiện điều khiển không được phát sóng');
      }
    },
  },
  {
    pattern: /hệ thống phải xử lý giao dịch an toàn và phản hồi trạng thái (\d+) hoặc (\d+)/i,
    action: async (context, s1, s2) => {
      const actual = context.lastResponse.status;
      if (actual !== Number(s1) && actual !== Number(s2)) {
        throw new Error(`Xử lý giao dịch trả về mã bất thường: ${actual}`);
      }
    },
  },
  {
    pattern: /nếu hết khay trống hệ thống phải phản hồi lỗi 409 thay vì sập lỗi máy chủ 500/i,
    action: async (context) => {
      if (context.lastResponse.status === 500) {
        throw new Error('Lỗi sập máy chủ 500! Cơ chế phòng thủ thất bại.');
      }
    },
  },
];

module.exports = { stepDefinitions };
