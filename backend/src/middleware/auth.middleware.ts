import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../config/jwt.js";

// Mở rộng kiểu dữ liệu Request của Express để chứa user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware bắt buộc đăng nhập (Require Authentication)
 * Trích xuất token từ Cookie HttpOnly hoặc Authorization Bearer Header
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Phiên làm việc chưa xác thực. Vui lòng đăng nhập để tiếp tục.",
        },
      });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
      },
    });
  }
};

/**
 * Middleware phân quyền theo vai trò (Role-Based Access Control)
 * @param allowedRoles Danh sách vai trò được phép (ví dụ: ["Admin", "Operator"])
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Vui lòng đăng nhập để thực hiện quyền này.",
        },
      });
      return;
    }

    const userRole = (req.user.roleName || "").toLowerCase();
    const hasPermission = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Truy cập bị từ chối: Tài khoản vai trò '${req.user.roleName}' không có quyền thực hiện thao tác này.`,
          requiredRoles: allowedRoles,
        },
      });
      return;
    }

    next();
  };
};
