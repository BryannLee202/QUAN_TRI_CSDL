/**
 * MushroomCloud k6 Load Testing Script
 * Standard k6 performance script (https://k6.io/)
 * Included in TheJambo/awesome-testing #Performance & Load Testing
 * Phụ trách: Dang <dang0382482793@gmail.com>
 *
 * Cách chạy: k6 run scripts/k6_rental_stress.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 20 },  // Ramp-up lên 20 VUs
    { duration: '10s', target: 50 }, // Duy trì tải cao 50 VUs
    { duration: '5s', target: 0 },   // Ramp-down về 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% request phải phản hồi dưới 300ms
    http_req_failed: ['rate<0.05'],    // Tỷ lệ lỗi mạng dưới 5%
  },
};

const BASE_URL = 'http://127.0.0.1:5000/api';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'x-test-suite': 'true',
  };

  // 1. Giám sát vi khí hậu buồng nuôi
  const resRooms = http.get(`${BASE_URL}/operator/rooms`, { headers });
  check(resRooms, {
    'GET /operator/rooms status is 200': (r) => r.status === 200,
    'Rooms payload has data': (r) => JSON.parse(r.body).success === true,
  });

  // 2. Thử nghiệm thuê khay nấm đồng thời
  const payload = JSON.stringify({
    userId: 3,
    packageId: 1,
    durationMonths: 1,
    totalPrice: 299000,
  });

  const resRental = http.post(`${BASE_URL}/rentals`, payload, { headers });
  check(resRental, {
    'Rental request handled gracefully (200, 201, 400 or 409)': (r) =>
      [200, 201, 400, 409].includes(r.status),
    'No unhandled 500 server crash': (r) => r.status !== 500,
  });

  sleep(0.1);
}
