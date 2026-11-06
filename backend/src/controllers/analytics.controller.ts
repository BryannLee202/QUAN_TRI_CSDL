import { Request, Response } from "express";
import { getPool } from "../config/db.js";

// GET /api/analytics/revenue-monthly
export const getMonthlyRevenueReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const result = await pool.request().query("SELECT * FROM vw_MonthlyRevenueReport");

    res.status(200).json({
      message: "Lấy báo cáo doanh thu theo tháng thành công",
      data: result.recordset,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi lấy báo cáo doanh thu", error: error.message });
  }
};
