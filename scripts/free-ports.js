/**
 * scripts/free-ports.js
 * Quét và giải phóng các cổng mạng (mặc định 3000, 5000) trước khi khởi chạy hệ thống
 * Phụ trách: Lê Minh Tài (Trưởng nhóm / Lead Architect)
 */

const { execSync } = require('child_process');

const targetPorts = process.argv.slice(2).map(Number).filter(Boolean);
const ports = targetPorts.length > 0 ? targetPorts : [3000, 5000];

console.log('🔍 [Port Manager] Đang kiểm tra trạng thái các cổng: ' + ports.join(', ') + '...');

ports.forEach((port) => {
  try {
    if (process.platform === 'win32') {
      const stdout = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });

      const lines = stdout.trim().split('\n');
      const pids = new Set();

      lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(Number(pid)) && Number(pid) > 0 && Number(pid) !== process.pid) {
          pids.add(pid);
        }
      });

      if (pids.size > 0) {
        pids.forEach((pid) => {
          try {
            console.log(`⚠️  [Port Manager] Cổng ${port} đang bị chiếm bởi PID ${pid}. Đang giải phóng...`);
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            console.log(`✅ [Port Manager] Đã giải phóng thành công cổng ${port} (PID ${pid}).`);
          } catch (e) {
            console.warn(`⚠️  [Port Manager] Không thể ngắt PID ${pid}: ${e.message}`);
          }
        });
      } else {
        console.log(`✨ [Port Manager] Cổng ${port} hoàn toàn sạch, sẵn sàng khởi chạy.`);
      }
    } else {
      // POSIX fallback (macOS / Linux)
      try {
        const pid = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
        if (pid) {
          console.log(`⚠️  [Port Manager] Cổng ${port} đang bị chiếm bởi PID ${pid}. Đang giải phóng...`);
          execSync(`kill -9 ${pid}`);
          console.log(`✅ [Port Manager] Đã giải phóng thành công cổng ${port}.`);
        }
      } catch {
        console.log(`✨ [Port Manager] Cổng ${port} hoàn toàn sạch, sẵn sàng khởi chạy.`);
      }
    }
  } catch {
    console.log(`✨ [Port Manager] Cổng ${port} hoàn toàn sạch, sẵn sàng khởi chạy.`);
  }
});

console.log('🎯 [Port Manager] Hoàn tất chuẩn bị tài nguyên mạng!\n');
