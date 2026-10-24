
import type { Request, Response } from "express";

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu.",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 8 ký tự.",
      });
    }

    // Chưa truy vấn/lưu database vì nhóm chưa thống nhất schema.
    return res.status(501).json({
      message:
        "API đăng ký đã nhận dữ liệu. Chức năng lưu tài khoản đang chờ schema database.",
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);

    return res.status(500).json({
      message: "Đã xảy ra lỗi máy chủ.",
    });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mật khẩu.",
      });
    }

    // Chưa thể xác thực khi chưa có bảng tài khoản.
    return res.status(501).json({
      message:
        "API đăng nhập đã nhận dữ liệu. Chức năng xác thực đang chờ schema database.",
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);

    return res.status(500).json({
      message: "Đã xảy ra lỗi máy chủ.",
    });
  }
};
