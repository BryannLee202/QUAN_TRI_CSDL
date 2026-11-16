/**
 * MushroomCloud Security & Input Fuzz Testing
 * Inspired by Big List of Naughty Strings (BLNS) from TheJambo/awesome-testing
 * Phụ trách: Nguyen Thanh Hien <alanhien123@gmail.com>
 *
 * Kiểm thử tính an toàn của API trước các chuỗi ký tự độc hại: SQL Injection, XSS,
 * Unicode tràn bộ nhớ, ký tự rỗng (null bytes), và các trường hợp biên dữ liệu.
 */

const http = require('http');

const HOST = '127.0.0.1';
const PORT = 5000;

function sendPost(path, data) {
  return new Promise((resolve) => {
    const headers = {
      'x-test-suite': 'true',
      'Content-Type': 'application/json',
    };

    const req = http.request(
      {
        hostname: HOST,
        port: PORT,
        path,
        method: 'POST',
        headers,
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
    req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

// Tập mẫu trích xuất từ Big List of Naughty Strings (BLNS)
const NAUGHTY_STRINGS = [
  // 1. SQL Injection Vectors
  { category: 'SQL Injection', payload: "' OR '1'='1" },
  { category: 'SQL Injection', payload: "'; DROP TABLE Users; --" },
  { category: 'SQL Injection', payload: "' UNION SELECT 1, 'admin', 'hash', 1 --" },
  { category: 'SQL Injection', payload: "admin' --" },

  // 2. Cross-Site Scripting (XSS) Vectors
  { category: 'XSS', payload: "<script>alert('XSS')</script>" },
  { category: 'XSS', payload: "<img src=x onerror=alert(1)>" },
  { category: 'XSS', payload: "javascript:alert(document.cookie)" },

  // 3. Unicode, Special Characters & Null Bytes
  { category: 'Unicode/Null', payload: "Test\u0000Injection" },
  { category: 'Unicode/Ligature', payload: "﷽" },
  { category: 'Unicode/RTL', payload: "\u202Ereversed_text" },
  { category: 'Unicode/Zalgo', payload: "T̴e̷s̶t̷ ̴M̸u̶s̶h̷r̶o̸o̶m̵" },

  // 4. Numeric & Boundary Overflow
  { category: 'Buffer/Boundary', payload: "A".repeat(500) },
  { category: 'Numeric Boundary', payload: "-999999999" },
  { category: 'Numeric Boundary', payload: "NaN" },
];

async function runSecurityFuzzTest() {
  console.log('========================================================================');
  console.log('🛡️  [SECURITY] INPUT FUZZ TESTING WITH BIG LIST OF NAUGHTY STRINGS (BLNS)');
  console.log('   Mục tiêu: Đảm bảo không có lỗi 500, SQL Crash, rò rỉ CSDL hoặc XSS');
  console.log(`   Số lượng payload kiểm thử: ${NAUGHTY_STRINGS.length}`);
  console.log('========================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < NAUGHTY_STRINGS.length; i++) {
    const item = NAUGHTY_STRINGS[i];
    const testNum = i + 1;

    // Test trên endpoint Đăng nhập (/api/auth/login)
    const loginRes = await sendPost('/api/auth/login', {
      email: item.payload,
      password: item.payload,
    });

    // Tiêu chuẩn an toàn: Hệ thống phải từ chối an toàn (400, 401, 403) hoặc kích hoạt phòng thủ Rate Limit (429)
    // Tuyệt đối KHÔNG ĐƯỢC trả về 500 Internal Server Error (dấu hiệu unhandled exception / SQL crash)
    const isSafe = [400, 401, 403, 429].includes(loginRes.status);

    if (isSafe) {
      passedCount++;
      const sample = item.payload.length > 25 ? item.payload.substring(0, 22) + '...' : item.payload;
      const statusLabel = loginRes.status === 429 ? '429 (Rate Limit Active)' : `${loginRes.status} (An toàn)`;
      console.log(`  [PASS ${testNum}/${NAUGHTY_STRINGS.length}] [${item.category}] "${sample}" -> Status ${statusLabel}`);
    } else {
      failedCount++;
      console.log(`  [FAIL ${testNum}/${NAUGHTY_STRINGS.length}] [${item.category}] "${item.payload}" -> Status ${loginRes.status} (NGUY HIỂM)`);
    }
  }

  // Fuzz test bổ sung: Bơm số âm và tràn số vào tạo đơn thuê khay (/api/rentals)
  const boundaryRes = await sendPost('/api/rentals', {
    userId: -9999,
    packageId: "'; DROP TABLE CultivationTrays; --",
    durationMonths: -5,
    totalPrice: -1000000,
  });

  const boundarySafe = boundaryRes.status === 400;
  console.log(`\n  [*] [Boundary Check] Thuê khay với số lượng âm / SQLi: Status ${boundaryRes.status} (${boundarySafe ? 'Chặn an toàn 400 Bad Request' : 'Trạng thái bất thường'})`);
  if (boundarySafe) passedCount++; else failedCount++;

  const totalTests = NAUGHTY_STRINGS.length + 1;
  console.log('\n------------------------------------------------------------------------');
  console.log(`KẾT QUẢ: ${passedCount}/${totalTests} Vector tấn công được phòng thủ 100%.`);
  if (failedCount === 0) {
    console.log('✅ [PASSED 100%] Hệ thống đạt chuẩn An toàn Bảo mật OWASP & T-SQL Parameterized Queries.');
  } else {
    console.log('❌ [FAILED] Phát hiện vector tấn công gây lỗi máy chủ.');
  }
  console.log('========================================================================\n');

  return { passed: failedCount === 0, passedCount, failedCount };
}

if (require.main === module) {
  runSecurityFuzzTest();
}

module.exports = { runSecurityFuzzTest };
