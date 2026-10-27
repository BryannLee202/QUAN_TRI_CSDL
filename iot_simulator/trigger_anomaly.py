import argparse
import sys
import time

from simulator import connect


def room_info(cur, room_id):
    cur.execute("SELECT RoomCode, CO2Max FROM Rooms WHERE RoomID = ?", room_id)
    row = cur.fetchone()
    if not row:
        sys.exit(f"Không có RoomID = {room_id}")
    return row.RoomCode, float(row.CO2Max)


def baseline(cur, room_id):
    cur.execute("SELECT TOP (1) Temperature, Humidity, CO2Level FROM SensorData "
                "WHERE RoomID = ? ORDER BY DataID DESC", room_id)
    row = cur.fetchone()
    if row:
        return float(row.Temperature), float(row.Humidity), float(row.CO2Level)
    return 24.0, 88.0, 600.0


def push(cur, conn, room_id, temp, hum, co2):
    cur.execute(
        "INSERT INTO SensorData (RoomID, TrayID, Temperature, Humidity, CO2Level, LightLux) "
        "VALUES (?, NULL, ?, ?, ?, ?)",
        room_id, round(temp, 2), round(hum, 2), round(co2, 2), 220.0)
    conn.commit()
    print(f"  -> gửi CO2 = {co2:7.1f} ppm")


def ramp(cur, conn, room_id, temp, hum, start, end, steps, interval):
    for i in range(1, steps + 1):
        push(cur, conn, room_id, temp, hum, start + (end - start) * i / steps)
        time.sleep(interval)


def main():
    ap = argparse.ArgumentParser(description="Giả lập sự cố CO2 cao")
    ap.add_argument("--room", type=int, default=1, help="RoomID (mặc định 1)")
    ap.add_argument("--target", type=float, default=1250, help="CO2 đích (ppm)")
    args = ap.parse_args()

    conn = connect()
    cur = conn.cursor()
    code, co2_max = room_info(cur, args.room)
    temp, hum, co2_now = baseline(cur, args.room)
    print(f"[SỰ CỐ] {code}: ngưỡng CO2 = {co2_max:.0f} ppm, hiện tại {co2_now:.0f} -> {args.target:.0f} ppm")
    conn.close()


if __name__ == "__main__":
    main()