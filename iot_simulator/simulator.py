"""IoT Simulator - giả lập cảm biến buồng nấm, ghi vào SmartMushroomDB.SensorData."""
import math
import os
import random
import sys
import time
from pathlib import Path

import pyodbc

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "1433")
DB_NAME = os.getenv("DB_NAME", "SmartMushroomDB")
DB_USER = os.getenv("DB_USER", "sa")
DB_PASSWORD = os.getenv("MSSQL_SA_PASSWORD", "")
INTERVAL = float(os.getenv("SIM_INTERVAL", "3"))      # giây giữa 2 lần gửi
MAX_TICKS = int(os.getenv("SIM_MAX_TICKS", "0"))      # 0 = chạy mãi


def connect(retries=30, delay=5):
    conn_str = (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        f"SERVER={DB_HOST},{DB_PORT};DATABASE={DB_NAME};"
        f"UID={DB_USER};PWD={DB_PASSWORD};"
        "TrustServerCertificate=yes;Connection Timeout=10"
    )
    for attempt in range(1, retries + 1):
        try:
            conn = pyodbc.connect(conn_str, autocommit=False)
            print(f"[OK] Đã kết nối {DB_HOST}:{DB_PORT}/{DB_NAME}")
            return conn
        except pyodbc.Error as e:
            print(f"[..] Kết nối thất bại ({attempt}/{retries}): {str(e)[:120]}")
            time.sleep(delay)
    sys.exit("Không kết nối được CSDL. Kiểm tra Docker, mật khẩu và ODBC Driver 18.")


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


class RoomSim:
    """Trạng thái cảm biến của 1 buồng: random walk + kéo về giá trị mục tiêu."""

    def __init__(self, row):
        self.room_id, self.code = row.RoomID, row.RoomCode
        self.t_lo, self.t_hi = float(row.TempMin) + 0.5, float(row.TempMax) - 0.5
        self.h_lo, self.h_hi = float(row.HumidityMin) + 1.0, float(row.HumidityMax) - 1.0
        self.co2_lo, self.co2_hi = 450.0, float(row.CO2Max) - 100.0
        self.temp = random.uniform(self.t_lo, self.t_hi)
        self.hum = random.uniform(self.h_lo, self.h_hi)
        self.co2 = random.uniform(self.co2_lo, self.co2_hi)
        self.phase = random.uniform(0, 2 * math.pi)   # lệch pha ngày/đêm giữa các buồng

    def step(self, now):
        # Nhiệt độ dao động nhẹ theo chu kỳ ngày (24h) quanh giữa khoảng cho phép
        mid = (self.t_lo + self.t_hi) / 2
        amp = (self.t_hi - self.t_lo) / 4
        day = math.sin(2 * math.pi * (now % 86400) / 86400 + self.phase)
        self.temp += 0.15 * ((mid + amp * day) - self.temp) + random.gauss(0, 0.08)
        self.hum += 0.10 * (((self.h_lo + self.h_hi) / 2) - self.hum) + random.gauss(0, 0.35)
        self.co2 += 0.05 * (((self.co2_lo + self.co2_hi) / 2) - self.co2) + random.gauss(0, 12)

        self.temp = clamp(self.temp, self.t_lo, self.t_hi)
        self.hum = clamp(self.hum, self.h_lo, self.h_hi)
        self.co2 = clamp(self.co2, self.co2_lo, self.co2_hi)
        lux = clamp(random.gauss(220, 25), 100, 400)
        return (self.room_id, None, round(self.temp, 2), round(self.hum, 2),
                round(self.co2, 2), round(lux, 1))


def load_rooms(cur):
    cur.execute("SELECT RoomID, RoomCode, TempMin, TempMax, HumidityMin, HumidityMax, CO2Max "
                "FROM Rooms WHERE IsActive = 1")
    return [RoomSim(r) for r in cur.fetchall()]


def main():
    conn = connect()
    cur = conn.cursor()
    cur.fast_executemany = True
    rooms = load_rooms(cur)
    if not rooms:
        sys.exit("Bảng Rooms đang trống. Hãy chạy 03_seed_data.sql trước.")
    print(f"[OK] Giả lập {len(rooms)} buồng: {', '.join(r.code for r in rooms)}")

    sql = ("INSERT INTO SensorData (RoomID, TrayID, Temperature, Humidity, CO2Level, LightLux) "
           "VALUES (?, ?, ?, ?, ?, ?)")
    ticks = 0
    while True:
        try:
            now = time.time()
            batch = [r.step(now) for r in rooms]
            cur.executemany(sql, batch)
            conn.commit()
            ticks += 1
            sample = batch[0]
            print(f"[{time.strftime('%H:%M:%S')}] tick {ticks}: {len(batch)} bản tin | "
                  f"Room {sample[0]}: {sample[2]}°C, {sample[3]}%, {sample[4]} ppm")
            if MAX_TICKS and ticks >= MAX_TICKS:
                break
            time.sleep(INTERVAL)
        except pyodbc.Error as e:
            print(f"[!!] Lỗi DB: {str(e)[:150]} -> kết nối lại")
            try:
                conn.close()
            except pyodbc.Error:
                pass
            conn = connect()
            cur = conn.cursor()
            cur.fast_executemany = True
        except KeyboardInterrupt:
            print("\nDừng simulator.")
            break
    conn.close()


if __name__ == "__main__":
    main()
