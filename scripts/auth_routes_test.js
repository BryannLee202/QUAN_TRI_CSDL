/**
 * MushroomCloud - Authentication Pages & Routes Verification Test
 * Phụ trách: Vo Duy Thinh <thinh20032006@gmail.com>
 *
 * Kiểm tra mã phản hồi HTTP 200 và tính toàn vẹn của các trang đăng nhập / đăng ký riêng biệt:
 * 1. /login
 * 2. /register
 * 3. /dang-nhap (Alias tiếng Việt)
 * 4. /dang-ky (Alias tiếng Việt)
 */

const http = require('http');

const HOST = '127.0.0.1';
const PORT = 3000;

function checkRoute(routePath) {
  return new Promise((resolve) => {
    http
      .get(`http://${HOST}:${PORT}${routePath}`, (res) => {
        resolve({ path: routePath, status: res.statusCode });
      })
      .on('error', (err) => {
        resolve({ path: routePath, status: 500, error: err.message });
      });
  });
}

async function verifyAuthRoutes() {
  console.log('===========================================================');
  console.log('🚪 [ROUTING TEST] DEDICATED AUTHENTICATION PAGES CHECK');
  console.log('   Mục tiêu: Đảm bảo các trang đăng nhập / đăng ký riêng biệt hoạt động 100%');
  console.log('===========================================================\n');

  const routes = ['/login', '/register', '/dang-nhap', '/dang-ky'];
  let passedCount = 0;

  for (const r of routes) {
    const res = await checkRoute(r);
    if (res.status === 200) {
      passedCount++;
      console.log(`  ✅ [PASS] ${r.padEnd(15)} -> Status 200 OK`);
    } else {
      console.log(`  ❌ [FAIL] ${r.padEnd(15)} -> Status ${res.status}`);
    }
  }

  console.log('\n-----------------------------------------------------------');
  console.log(`KẾT QUẢ: ${passedCount}/${routes.length} Tuyến đường xác thực hoạt động ổn định.`);
  console.log('===========================================================\n');
}

if (require.main === module) {
  verifyAuthRoutes();
}

module.exports = { verifyAuthRoutes };
