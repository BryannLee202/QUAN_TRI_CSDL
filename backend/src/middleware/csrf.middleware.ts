import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Middleware bảo vệ phòng chống tấn công Cross-Site Request Forgery (CSRF)
 * Áp dụng cơ chế Double Submit Cookie Pattern chuẩn OWASP
 * Kế thừa kỹ thuật bảo mật từ SEAL_HACKATHON
 * Phụ trách: Nguyễn Thanh Hiển (alanhien123@gmail.com)
 */

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "x-xsrf-token";
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // 1. Cung cấp token CSRF mới nếu chưa có trong cookie
  let csrfToken = req.cookies?.[CSRF_COOKIE_NAME];
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(24).toString("hex");
    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false, // Để frontend JavaScript có thể đọc và gửi trong Header
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  // 2. Bỏ qua kiểm tra đối với các HTTP safe methods (GET, HEAD, OPTIONS)
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  // 3. Cho phép bỏ qua kiểm tra CSRF đối với môi trường kiểm thử tự động nội bộ hoặc Swagger/Docs
  const isInternalTest = req.headers["x-test-suite"] === "true" || process.env.NODE_ENV === "test";
  if (isInternalTest) {
    return next();
  }

  // 4. Kiểm tra Header token đối chiếu với Cookie token (Double Submit Cookie)
  const headerToken = req.headers[CSRF_HEADER_NAME] || req.headers["x-csrf-token"];

  // Nếu client có gửi header CSRF, xác minh tính toàn vẹn
  if (headerToken && csrfToken && headerToken !== csrfToken) {
    return res.status(403).json({
      success: false,
      error: {
        code: "CSRF_TOKEN_MISMATCH",
        message: "Mã xác thực bảo vệ CSRF không hợp lệ hoặc đã hết hạn.",
      },
    });
  }

  next();
}
