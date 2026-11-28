// Giả lập ESP32 khi chưa có phần cứng (Node.js 18+). Dùng đúng API như firmware thật:
//   POST /api/iot/readings (header x-device-key) mỗi N giây, in ra lệnh relay server trả về.
//
// Cách chạy:  node scripts/simulate-esp32.mjs [API_KEY] [giây giữa các lần gửi] [địa chỉ server] [số lần gửi]
// Ví dụ:      node scripts/simulate-esp32.mjs MC-ESP32-RM03-DEMO 5 http://localhost:5000
//             node scripts/simulate-esp32.mjs MC-ESP32-RM03-DEMO 2 http://localhost:5000 5   (gửi 5 lần rồi dừng)
// Key demo MC-ESP32-RM03-DEMO được tạo sẵn trong database/06_iot_devices.sql (gắn buồng RM03).
//
// Lưu ý: KHÔNG chạy script này cùng lúc với ESP32 thật dùng chung key, vì sẽ trộn số đo thật và giả.

const key = process.argv[2] || 'MC-ESP32-RM03-DEMO';
const every = Number(process.argv[3] || 5) * 1000;
const base = (process.argv[4] || 'http://localhost:5000').replace(/\/$/, '');
const maxTicks = Number(process.argv[5] || 0);

let t = 26, h = 88, c = 650;
let ticks = 0;
const drift = (v, d, lo, hi) => Math.min(hi, Math.max(lo, v + (Math.random() - 0.5) * d));

async function tick() {
  t = drift(t, 1.5, 18, 34);
  h = drift(h, 5, 70, 99);
  c = drift(c, 250, 420, 1600);
  const body = { temperature: +t.toFixed(1), humidity: +h.toFixed(1), co2: Math.round(c) };
  try {
    const res = await fetch(`${base}/api/iot/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-device-key': key, 'x-firmware-version': 'simulator-1.0' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    const time = new Date().toLocaleTimeString('vi-VN');
    if (!res.ok) {
      console.log(time, body, '->', res.status, json.error?.message || json);
    } else {
      const cmds = (json.commands || [])
        .map((x) => `${x.kind}=${x.state ? 'BẬT' : 'tắt'}(${x.mode})`)
        .join(' ');
      console.log(time, body, '->', res.status, `buồng #${json.roomId}`, '| lệnh:', cmds);
    }
  } catch (e) {
    console.error('Lỗi gửi (backend đã chạy chưa?):', e.message);
  }
  ticks += 1;
  if (maxTicks > 0 && ticks >= maxTicks) process.exit(0);
}

console.log(`Giả lập ESP32 -> ${base} mỗi ${every / 1000}s (Ctrl+C để dừng)`);
tick();
setInterval(tick, every);
