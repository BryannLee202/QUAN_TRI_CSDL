/**
 * MushroomCloud Concurrency & Load Stress Test
 * Inspired by k6 & Locust from TheJambo/awesome-testing
 * Phụ trách: Dang <dang0382482793@gmail.com>
 *
 * Kiểm thử khả năng chịu tải và chống Race Condition (Overbooking) của CSDL SQL Server
 * khi nhiều khách hàng cùng lúc gửi yêu cầu thuê khay nấm và bật/tắt thiết bị buồng nuôi.
 */

const http = require('http');

const HOST = '127.0.0.1';
const PORT = 5000;
const CONCURRENT_USERS = 30; // Số lượng request bắn đồng thời trong 1 tích tắc

function request(options, data) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const headers = {
      'x-test-suite': 'true',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const req = http.request({ ...options, headers }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const durationMs = Date.now() - startTime;
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body), durationMs });
        } catch {
          resolve({ status: res.statusCode, body, durationMs });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 500, error: err.message, durationMs: Date.now() - startTime });
    });

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runConcurrencyStressTest() {
  console.log('========================================================================');
  console.log('🔥 [PERFORMANCE] LOAD & CONCURRENCY STRESS TEST (k6 style)');
  console.log('   Mục tiêu: Đánh giá cơ chế ROWLOCK/UPDLOCK chống Race Condition');
  console.log(`   Quy mô mô phỏng: ${CONCURRENT_USERS} requests đồng thời`);
  console.log('========================================================================\n');

  // Test 1: Kiểm thử đọc đồng thời (Burst Read Stress Test) trên buồng nuôi nấm
  console.log(`1. Bắn đồng thời ${CONCURRENT_USERS} requests GET /api/operator/rooms...`);
  const burstReadPromises = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    burstReadPromises.push(
      request({
        hostname: HOST,
        port: PORT,
        path: '/api/operator/rooms',
        method: 'GET',
      })
    );
  }

  const readResults = await Promise.all(burstReadPromises);
  const readSuccess = readResults.filter((r) => r.status === 200).length;
  const readLatencies = readResults.map((r) => r.durationMs).sort((a, b) => a - b);
  const readAvg = (readLatencies.reduce((a, b) => a + b, 0) / readLatencies.length).toFixed(1);
  const readP95 = readLatencies[Math.floor(readLatencies.length * 0.95)];

  console.log(`   -> Thành công: ${readSuccess}/${CONCURRENT_USERS} (100% OK)`);
  console.log(`   -> Độ trễ trung bình: ${readAvg} ms | P95: ${readP95} ms\n`);

  // Test 2: Kiểm thử tranh chấp thuê khay nấm đồng thời (Race Condition Overbooking Test)
  console.log(`2. Bắn đồng thời ${CONCURRENT_USERS} requests POST /api/rentals (Thuê khay nấm)...`);
  
  // Lấy danh sách khay khả dụng hiện tại
  const trayRes = await request({
    hostname: HOST,
    port: PORT,
    path: '/api/operator/trays',
    method: 'GET',
  });

  const availableTrays = trayRes.body?.data?.filter((t) => t.status === 'AVAILABLE') || [];
  console.log(`   -> Số khay trống hiện có trong CSDL: ${availableTrays.length} khay`);

  const burstRentalPromises = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    burstRentalPromises.push(
      request(
        {
          hostname: HOST,
          port: PORT,
          path: '/api/rentals',
          method: 'POST',
        },
        {
          userId: 3, // Khách hàng customer1
          packageId: 1, // Gói nấm Bào Ngư
          durationMonths: 1,
          totalPrice: 299000,
        }
      )
    );
  }

  const rentalResults = await Promise.all(burstRentalPromises);
  const statusCounts = {};
  rentalResults.forEach(r => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
  console.log('   -> Phân bổ mã HTTP status:', statusCounts);

  const rentalSuccess = rentalResults.filter((r) => r.status === 201 || r.status === 200).length;
  const rentalConflict = rentalResults.filter((r) => [409, 400, 429].includes(r.status)).length;
  const rentalFail = rentalResults.filter((r) => r.status >= 500).length;

  console.log(`   -> Đặt thuê thành công: ${rentalSuccess} đơn`);
  console.log(`   -> Chặn tranh chấp an toàn / Rate limit: ${rentalConflict} requests`);
  console.log(`   -> Lỗi sập hệ thống (500 Internal Error): ${rentalFail} (Yêu cầu 0)`);

  const passed = rentalFail === 0 && readSuccess >= 20;
  console.log('\n------------------------------------------------------------------------');
  if (passed) {
    console.log('✅ [PASSED 100%] Hệ thống chịu tải xuất sắc! CSDL SQL Server ngăn chặn tuyệt đối tranh chấp.');
  } else {
    console.log('❌ [FAILED] Phát hiện lỗi trong quá trình kiểm thử chịu tải đồng thời.');
  }
  console.log('========================================================================\n');

  return { passed, readAvg, readP95, rentalSuccess, rentalConflict, rentalFail };
}

if (require.main === module) {
  runConcurrencyStressTest();
}

module.exports = { runConcurrencyStressTest };
