
import sql from "mssql/msnodesqlv8.js";

const dbConfig = {
  server: "localhost\\SQL2025",
  database: "SmartMushroomDB",
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
  driver: "ODBC Driver 17 for SQL Server",
};

export const connectDB = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("Kết nối SQL Server thành công!");
    return pool;
  } catch (error) {
    console.error("Lỗi kết nối SQL Server:", error);
    process.exit(1);
  }
};
