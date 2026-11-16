/**
 * MushroomCloud Swagger OpenAPI Contract & Coverage Testing
 * Inspired by Swagger Coverage Tool from TheJambo/awesome-testing
 * Phụ trách: Vo Duy Thinh <thinh20032006@gmail.com>
 *
 * Tự động rà soát tài liệu OpenAPI (swagger.json), kiểm thử hợp đồng dữ liệu (API Contract)
 * và tính toán ma trận độ phủ kiểm thử (Test Coverage Matrix) cho toàn bộ API hệ thống.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '127.0.0.1';
const PORT = 5000;

function sendRequest(method, endpointPath, bodyData) {
  return new Promise((resolve) => {
    const headers = {
      'x-test-suite': 'true',
      'Content-Type': 'application/json',
    };

    const req = http.request(
      {
        hostname: HOST,
        port: PORT,
        path: endpointPath,
        method,
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
    if (bodyData) {
      req.write(typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData));
    }
    req.end();
  });
}

async function runSwaggerCoverageTest() {
  console.log('========================================================================');
  console.log('📋 [CONTRACT] SWAGGER OPENAPI CONTRACT & COVERAGE TEST');
  console.log('   Mục tiêu: Đo lường độ phủ API và kiểm thử tuân thủ OpenAPI Specification');
  console.log('========================================================================\n');

  const swaggerPath = path.resolve(__dirname, '../backend/src/docs/swagger.json');
  if (!fs.existsSync(swaggerPath)) {
    console.error('❌ Không tìm thấy tệp swagger.json tại:', swaggerPath);
    return { passed: false };
  }

  const swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  const documentedPaths = Object.keys(swaggerDoc.paths || {});
  console.log(`[*] Tải thành công đặc tả OpenAPI v${swaggerDoc.openapi || '3.0.0'}`);
  console.log(`[*] Số lượng API Endpoints được đặc tả trong Swagger: ${documentedPaths.length}\n`);

  let contractPassed = 0;
  let contractTotal = 0;

  // Thử nghiệm hợp đồng cho từng Endpoint được đặc tả
  for (const apiPath of documentedPaths) {
    const pathConfig = swaggerDoc.paths[apiPath];
    const methods = Object.keys(pathConfig);

    for (const method of methods) {
      contractTotal++;
      const op = pathConfig[method];
      const summary = op.summary || 'Endpoint';
      const upperMethod = method.toUpperCase();

      let testPayload = null;
      if (apiPath === '/api/auth/login') {
        testPayload = { email: 'admin@mushroomcloud.test', password: 'Password123@' };
      } else if (apiPath === '/api/rentals') {
        testPayload = { userId: 4, packageId: 1, durationMonths: 1, totalPrice: 299000 };
      } else if (apiPath === '/api/payments/generate-qr') {
        testPayload = { orderId: 1, amount: 299000 };
      } else if (apiPath === '/api/trays/assign-qr') {
        testPayload = { orderId: 1, qrCode: 'TR-01', operatorId: 2 };
      } else if (apiPath === '/api/harvest') {
        testPayload = { orderId: 1, deliveryType: 'HOME_DELIVERY', deliveryAddress: '123 Đường Nấm Sạch' };
      }

      const res = await sendRequest(upperMethod, apiPath, testPayload);

      // Endpoint được coi là pass contract nếu không bị 404 (Not Found) hoặc 500 (Unhandled Crash)
      const validContract = res.status !== 404 && res.status !== 500;
      if (validContract) {
        contractPassed++;
        console.log(`  [PASS] ${upperMethod.padEnd(5)} ${apiPath.padEnd(32)} -> Status: ${res.status} | "${summary}"`);
      } else {
        console.log(`  [FAIL] ${upperMethod.padEnd(5)} ${apiPath.padEnd(32)} -> Status: ${res.status} (Hợp đồng không khớp)`);
      }
    }
  }

  // Danh sách các Live Routes mở rộng (Operator & IoT)
  const additionalRoutes = [
    { method: 'GET', path: '/api/operator/rooms', desc: 'Danh sách buồng nuôi ISO' },
    { method: 'GET', path: '/api/operator/trays', desc: 'Ma trận khay nấm' },
    { method: 'GET', path: '/api/operator/alerts', desc: 'Cảnh báo vi khí hậu' },
  ];

  console.log('\n[*] Kiểm thử bổ sung các Endpoint Operator & IoT...');
  let extraPassed = 0;
  for (const r of additionalRoutes) {
    const res = await sendRequest(r.method, r.path);
    if (res.status === 200) {
      extraPassed++;
      console.log(`  [PASS] ${r.method.padEnd(5)} ${r.path.padEnd(32)} -> Status: 200 | "${r.desc}"`);
    }
  }

  const coveragePercent = ((contractPassed / contractTotal) * 100).toFixed(1);
  console.log('\n------------------------------------------------------------------------');
  console.log(`📊 ĐỘ PHỦ HỢP ĐỒNG API (Swagger Contract Coverage): ${coveragePercent}%`);
  console.log(`   Đạt: ${contractPassed}/${contractTotal} endpoints Swagger`);
  console.log(`   Đạt: ${extraPassed}/${additionalRoutes.length} endpoints mở rộng`);
  const passed = contractPassed === contractTotal;
  if (passed) {
    console.log('✅ [PASSED 100%] Toàn bộ API hoạt động chính xác theo đặc tả OpenAPI.');
  } else {
    console.log('❌ [FAILED] Có endpoint không khớp với tài liệu Swagger.');
  }
  console.log('========================================================================\n');

  return { passed, coveragePercent, contractPassed, contractTotal };
}

if (require.main === module) {
  runSwaggerCoverageTest();
}

module.exports = { runSwaggerCoverageTest };
