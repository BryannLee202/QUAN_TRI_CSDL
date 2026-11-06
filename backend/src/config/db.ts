import sql from "mssql";

export const getDbConfig = (): sql.config => {
  const isTrusted = process.env.DB_TRUSTED_CONNECTION === "true";

  if (isTrusted) {
    return {
      server: process.env.DB_SERVER || "localhost",
      database: process.env.DB_NAME || "SmartMushroomDB",
      driver: process.env.DB_DRIVER || "ODBC Driver 17 for SQL Server",
      options: {
        trustedConnection: true,
        trustServerCertificate: true,
      },
    } as any;
  }

  return {
    server: process.env.DB_SERVER || "localhost",
    port: Number(process.env.DB_PORT) || 1433,
    user: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || process.env.MSSQL_SA_PASSWORD || "",
    database: process.env.DB_NAME || "SmartMushroomDB",
    options: {
      encrypt: process.env.DB_ENCRYPT === "true",
      trustServerCertificate: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
};

let pool: sql.ConnectionPool | null = null;
let isConnecting = false;
let reconnectTimer: NodeJS.Timeout | null = null;

export const isDbConnected = (): boolean => {
  return !!(pool && pool.connected);
};

/**
 * Cơ chế kết nối CSDL cơ bản
 */
export const connectDB = async (): Promise<sql.ConnectionPool> => {
  if (pool && pool.connected) {
    return pool;
  }

  if (isConnecting) {
    // Đợi kết nối đang diễn ra
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (pool && pool.connected) return pool;
  }

  isConnecting = true;

  try {
    const config = getDbConfig();
    const isTrusted = process.env.DB_TRUSTED_CONNECTION === "true";

    if (isTrusted) {
      const msnodesqlv8 = await import("mssql/msnodesqlv8.js");
      pool = await msnodesqlv8.default.connect(config);
    } else {
      pool = await sql.connect(config);
    }

    console.log(`✅ [Database] Kết nối CSDL ${config.database} thành công!`);

    // Lắng nghe sự kiện lỗi trên pool để tự động phục hồi kết nối
    pool.on("error", (err) => {
      console.error("⚠️  [Database Pool Error]:", err.message);
      scheduleReconnect();
    });

    return pool;
  } catch (error) {
    console.error("❌ [Database] Lỗi kết nối SQL Server:", error);
    scheduleReconnect();
    throw error;
  } finally {
    isConnecting = false;
  }
};

/**
 * Lên lịch tự động thử kết nối lại với thuật toán Exponential Backoff
 */
let retryAttempt = 0;
const MAX_BACKOFF_MS = 30000;

export const scheduleReconnect = (): void => {
  if (reconnectTimer || isConnecting) return;

  retryAttempt++;
  const delay = Math.min(1000 * Math.pow(2, retryAttempt), MAX_BACKOFF_MS);

  console.log(`🔄 [Database Health Loop] Sẽ thử kết nối lại CSDL sau ${(delay / 1000).toFixed(1)}s (Lần thử: ${retryAttempt})...`);

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      await connectDB();
      retryAttempt = 0; // Reset khi thành công
      console.log("🎉 [Database Health Loop] Phục hồi kết nối CSDL thành công!");
    } catch {
      // Tiếp tục backoff nếu chưa kết nối được
      scheduleReconnect();
    }
  }, delay);
};

/**
 * Kiểm tra sức khỏe kết nối CSDL thực tế (dùng cho /api/health)
 */
export const checkDbHealth = async (): Promise<{
  status: "healthy" | "unhealthy";
  latencyMs: number;
  database: string;
  error?: string;
}> => {
  const dbName = process.env.DB_NAME || "SmartMushroomDB";

  if (!isDbConnected()) {
    return {
      status: "unhealthy",
      latencyMs: -1,
      database: dbName,
      error: "Mất kết nối với ConnectionPool",
    };
  }

  const start = Date.now();
  try {
    const p = getPool();
    await p.request().query("SELECT 1 AS health");
    return {
      status: "healthy",
      latencyMs: Date.now() - start,
      database: dbName,
    };
  } catch (err: any) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      database: dbName,
      error: err.message,
    };
  }
};

export const getPool = (): sql.ConnectionPool => {
  if (!pool || !pool.connected) {
    throw new Error("Database pool chưa được kết nối. Hệ thống đang tự động kết nối lại...");
  }
  return pool;
};
