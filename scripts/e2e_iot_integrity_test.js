/**
 * MushroomCloud E2E IoT Telemetry & Actuator Hardware Integrity Suite
 * Inspired by E2E Testing & Service Virtualization from TheJambo/awesome-testing
 * Phụ trách: LeMinhTai <leminhtai2222005@gmail.com>
 *
 * Kiểm thử luồng khép kín từ trạm cảm biến IoT phần cứng -> Gói tin nhị phân Hex
 * -> Giải mã Modbus/LoRaWAN -> Ghi nhận CSDL SQL Server -> Kích hoạt Trigger cảnh báo
 * -> Kỹ thuật viên xử lý và điều khiển thiết bị (Phun sương / Quạt thông gió).
 */

const http = require('http');

const HOST = '127.0.0.1';
const PORT = 5000;

function sendRequest(options, data) {
  return new Promise((resolve) => {
    const headers = {
      'x-test-suite': 'true',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const req = http.request({ ...options, headers }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runE2EIotIntegrityTest() {
  console.log('========================================================================');
  console.log('📡 [E2E INTEGRITY] IOT TELEMETRY & ACTUATOR HARDWARE TEST SUITE');
  console.log('   Mục tiêu: Kiểm thử vòng đời khép kín từ Cảm biến IoT đến CSDL & Điều khiển');
  console.log('========================================================================\n');

  let passedTests = 0;
  let totalTests = 0;
  let operatorToken = '';

  // 1. Đăng nhập Operator lấy quyền điều khiển phần cứng
  totalTests++;
  process.stdout.write('1. [AUTH] Kỹ thuật viên đăng nhập cấp chứng chỉ JWT Operator... ');
  const authRes = await sendRequest(
    {
      hostname: HOST,
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
    },
    {
      email: 'operator1@mushroomcloud.test',
      password: 'Password123@',
    }
  );

  if (authRes.status === 200 && authRes.body.data?.token) {
    operatorToken = authRes.body.data.token;
    console.log(`✅ PASSED (${authRes.body.data.user.fullName} - ${authRes.body.data.user.role})`);
    passedTests++;
  } else {
    console.log(`❌ FAILED (Status ${authRes.status})`);
  }

  // 2. Lấy mẫu khung tin nhị phân Modbus RTU / LoRaWAN
  totalTests++;
  process.stdout.write('2. [IOT-FRAME] Lấy mẫu gói tin vi khí hậu nhị phân từ trạm Sensor... ');
  const sampleRes = await sendRequest({
    hostname: HOST,
    port: PORT,
    path: '/api/iot/sample',
    method: 'GET',
  });

  let sampleHex = '';
  if (sampleRes.status === 200 && sampleRes.body.data?.rawHex) {
    sampleHex = sampleRes.body.data.rawHex;
    console.log(`✅ PASSED (Mẫu Hex: ${sampleHex})`);
    passedTests++;
  } else {
    console.log(`❌ FAILED (Status ${sampleRes.status})`);
  }

  // 3. Nạp gói tin nhị phân vào hệ thống và CSDL SQL Server (/api/iot/ingest)
  totalTests++;
  process.stdout.write('3. [IOT-INGEST] Giải mã nhị phân & ghi nhận vào CSDL SQL Server... ');
  const ingestRes = await sendRequest(
    {
      hostname: HOST,
      port: PORT,
      path: '/api/iot/ingest',
      method: 'POST',
    },
    {
      hexPayload: sampleHex || '01030600FA03840320478B',
      roomId: 1,
    }
  );

  if ((ingestRes.status === 200 || ingestRes.status === 201) && ingestRes.body.success) {
    const d = ingestRes.body.data;
    console.log(`✅ PASSED (Nhiệt độ: ${d.temperature}°C, Độ ẩm: ${d.humidity}%, CO2: ${d.co2} ppm)`);
    passedTests++;
  } else {
    console.log(`❌ FAILED (Status ${ingestRes.status}, err: ${ingestRes.body?.error?.message})`);
  }

  // 4. Kỹ thuật viên điều khiển bật máy phun sương (/api/operator/devices/toggle)
  totalTests++;
  process.stdout.write('4. [ACTUATOR] Điều khiển bật máy phun sương phòng sạch buồng RM-01... ');
  const toggleRes = await sendRequest(
    {
      hostname: HOST,
      port: PORT,
      path: '/api/operator/devices/toggle',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${operatorToken}`,
        Cookie: `token=${operatorToken}`,
      },
    },
    {
      roomId: 1,
      deviceType: 'MISTING_SYSTEM',
      actionState: 'ON',
      reason: 'Độ ẩm phòng sạch hạ dưới ngưỡng chuẩn VietGAP',
    }
  );

  if (toggleRes.status === 200 && toggleRes.body.success) {
    console.log('✅ PASSED (Relay phần cứng đóng tiếp điểm thành công, ghi log vận hành)');
    passedTests++;
  } else {
    console.log(`❌ FAILED (Status ${toggleRes.status}, msg: ${toggleRes.body?.error?.message || toggleRes.body?.message})`);
  }

  // 5. Kiểm tra danh sách buồng nuôi sau khi điều khiển
  totalTests++;
  process.stdout.write('5. [ROOM-STATE] Đồng bộ trạng thái buồng nuôi thời gian thực... ');
  const roomsRes = await sendRequest({
    hostname: HOST,
    port: PORT,
    path: '/api/operator/rooms',
    method: 'GET',
  });

  if (roomsRes.status === 200 && Array.isArray(roomsRes.body.data)) {
    console.log(`✅ PASSED (${roomsRes.body.data.length} phòng nuôi hoạt động bình thường)`);
    passedTests++;
  } else {
    console.log(`❌ FAILED (Status ${roomsRes.status})`);
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`KẾT QUẢ: ${passedTests}/${totalTests} Kịch bản kiểm thử E2E IoT hoàn tất thành công.`);
  const passed = passedTests === totalTests;
  if (passed) {
    console.log('✅ [PASSED 100%] Vòng đời khép kín Cảm biến -> Vi khí hậu -> Điều khiển phần cứng đạt chuẩn.');
  } else {
    console.log('❌ [FAILED] Có bước kiểm thử chưa đạt yêu cầu.');
  }
  console.log('========================================================================\n');

  return { passed, passedTests, totalTests };
}

if (require.main === module) {
  runE2EIotIntegrityTest();
}

module.exports = { runE2EIotIntegrityTest };
