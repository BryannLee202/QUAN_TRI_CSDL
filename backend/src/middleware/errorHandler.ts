import { Request, Response, NextFunction } from "express";

export interface AppErrorOptions {
  code?: string;
  statusCode?: number;
  details?: any;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = "AppError";
    this.code = options.code || "INTERNAL_ERROR";
    this.statusCode = options.statusCode || 500;
    this.details = options.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Middleware xử lý lỗi tập trung toàn hệ thống (Global Error Handler)
 * Phụ trách: Lê Minh Tài (Trưởng nhóm / Lead Architect)
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const timestamp = new Date().toISOString();

  // 1. Nếu là lỗi tùy biến của ứng dụng (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || null,
        timestamp,
      },
    });
    return;
  }

  // 2. Nếu là lỗi từ SQL Server (mssql driver / T-SQL RAISERROR / THROW)
  if (err.number || err.originalError || err.precedingErrors) {
    let statusCode = 400;
    let code = "DATABASE_ERROR";
    let message = err.message || "Lỗi xử lý cơ sở dữ liệu";

    // Phân loại mã lỗi SQL Server phổ biến
    switch (err.number) {
      case 2627:
      case 2601:
        code = "DUPLICATE_KEY";
        message = "Bản ghi đã tồn tại trong hệ thống (trùng khóa chính hoặc UNIQUE).";
        break;
      case 547:
        code = "FOREIGN_KEY_VIOLATION";
        message = "Vi phạm ràng buộc toàn vẹn dữ liệu hoặc khóa ngoại.";
        break;
      case 50000: // Thường là RAISERROR từ T-SQL Stored Procedure
        code = "BUSINESS_RULE_VIOLATION";
        // Rút gọn thông điệp lỗi nếu có tiền tố mssql
        message = err.message.replace(/^Error:\s*/, "");
        break;
      default:
        if (err.code === "ETIMEOUT" || err.code === "ESOCKET") {
          statusCode = 503;
          code = "DATABASE_UNAVAILABLE";
          message = "Không thể kết nối tới cơ sở dữ liệu SQL Server lúc này.";
        }
        break;
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        timestamp,
      },
    });
    return;
  }

  // 3. Lỗi không xác định khác (500 Internal Server Error)
  console.error("🔥 [Unhandled Error]:", err);
  const isDev = process.env.NODE_ENV !== "production";

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isDev ? err.message || "Lỗi máy chủ nội bộ" : "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.",
      details: isDev ? err.stack : undefined,
      timestamp,
    },
  });
};
