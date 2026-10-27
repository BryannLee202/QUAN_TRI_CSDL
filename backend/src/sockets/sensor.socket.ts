import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import sql, { ConnectionPool } from "mssql";
const POLL_MS = Number(process.env.SOCKET_POLL_MS ?? 2000);
const BATCH = 500;
type Row = Record<string, any>;
export type Rooms = number[] | "all";

export const toReading = (r: Row) => ({
  dataId: Number(r.DataID),
  roomId: r.RoomID as number,
  trayId: (r.TrayID ?? null) as number | null,
  temperature: Number(r.Temperature),
  humidity: Number(r.Humidity),
  co2: Number(r.CO2Level),
  lightLux: r.LightLux == null ? null : Number(r.LightLux),
  recordedAt: new Date(r.RecordedAt).toISOString(),
});

export const toAlert = (r: Row) => ({
  alertId: r.AlertID as number,
  roomId: r.RoomID as number,
  alertType: r.AlertType as string,
  severity: r.Severity as string,
  message: r.Message as string,
  alertTime: new Date(r.AlertTime).toISOString(),
  isResolved: !!r.IsResolved,
});

export const toAction = (r: Row) => ({
  actionId: r.ActionID as number,
  roomId: r.RoomID as number,
  deviceType: r.DeviceType as string,
  actionState: r.ActionState as string,
  triggeredBy: r.TriggeredBy as string,
  details: (r.Details ?? null) as string | null,
  executedAt: new Date(r.ExecutedAt).toISOString(),
});

export function initSensorSocket(httpServer: HttpServer, pool: ConnectionPool) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN?.split(",") ?? "*" },
  });

  let lastData = 0;
  let polling = false;
  let timer: NodeJS.Timeout | undefined;

  const targets = (roomId: number) => ["farm", `room:${roomId}`];

  async function initCursors() {
    const r = await pool.request().query(
      "SELECT ISNULL((SELECT MAX(DataID) FROM SensorData), 0) AS d");
    lastData = Number(r.recordset[0].d);
  }

  async function pollOnce() {
    if (polling) return; 
    polling = true;
    try {
      const sensors = await pool.request().input("last", sql.BigInt, lastData).query(
        `SELECT TOP (${BATCH}) * FROM SensorData WHERE DataID > @last ORDER BY DataID`);
      for (const row of sensors.recordset) {
        const msg = toReading(row);
        io.to(targets(msg.roomId)).emit("sensor:update", msg);
        lastData = Math.max(lastData, msg.dataId);
      }
    } catch (err) {
      console.error("[sensor.socket] poll lỗi:", (err as Error).message);
    } finally {
      polling = false;
    }
  }

  io.on("connection", (socket: Socket) => {
    // Client gửi: { rooms: "all" } hoặc { rooms: [1, 2] }
    socket.on("subscribe", (payload: { rooms?: Rooms } = {}, ack?: (r: unknown) => void) => {
      const rooms = payload.rooms ?? "all";
      if (rooms === "all") socket.join("farm");
      else for (const id of rooms) if (Number.isInteger(id)) socket.join(`room:${id}`);
      ack?.({ ok: true });
    });

    socket.on("unsubscribe", (payload: { rooms?: Rooms } = {}) => {
      const rooms = payload.rooms ?? "all";
      if (rooms === "all") socket.leave("farm");
      else for (const id of rooms) socket.leave(`room:${id}`);
    });
  });

  initCursors()
    .then(() => {
      timer = setInterval(pollOnce, POLL_MS);
      console.log(`[sensor.socket] sẵn sàng, poll mỗi ${POLL_MS} ms`);
    })
    .catch((e) => console.error("[sensor.socket] không khởi tạo được:", e.message));

  return { io, stop: () => timer && clearInterval(timer) };
}