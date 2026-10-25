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

export const connectDB = async (): Promise<sql.ConnectionPool> => {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    const config = getDbConfig();
    const isTrusted = process.env.DB_TRUSTED_CONNECTION === "true";

    if (isTrusted) {
      const msnodesqlv8 = await import("mssql/msnodesqlv8.js");
      pool = await msnodesqlv8.default.connect(config);
    } else {
      pool = await sql.connect(config);
    }

    console.log(`[Database] Kết nối CSDL ${config.database} thành công!`);
    return pool;
  } catch (error) {
    console.error("[Database] Lỗi kết nối SQL Server:", error);
    throw error;
  }
};

export const getPool = (): sql.ConnectionPool => {
  if (!pool || !pool.connected) {
    throw new Error("Database pool chưa được kết nối. Hãy kiểm tra CSDL và connectDB().");
  }
  return pool;
};
