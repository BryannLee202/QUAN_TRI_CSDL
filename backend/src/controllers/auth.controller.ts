import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import sql from "mssql";
import { getPool } from "../config/db.js";
import { generateToken, verifyToken } from "../config/jwt.js";

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, phoneNumber, address } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào bắt buộc
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng email không hợp lệ.",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 8 ký tự.",
      });
    }

    const pool = getPool();

    // 2. Kiểm tra email đã tồn tại trong CSDL chưa
    const checkEmail = await pool
      .request()
      .input("Email", sql.NVarChar(120), email.trim().toLowerCase())
      .query("SELECT UserID FROM Users WHERE Email = @Email");

    if (checkEmail.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email này đã được đăng ký trong hệ thống.",
      });
    }

    // 3. Tìm RoleID của vai trò Khách hàng (CUSTOMER)
    const roleQuery = await pool
      .request()
      .query("SELECT RoleID FROM Roles WHERE RoleName = 'CUSTOMER'");

    const customerRoleId =
      roleQuery.recordset.length > 0 ? roleQuery.recordset[0].RoleID : 3;

    // 4. Mã hóa mật khẩu bằng BCrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 5. Thêm người dùng mới vào bảng Users
    const insertResult = await pool
      .request()
      .input("RoleID", sql.Int, customerRoleId)
      .input("FullName", sql.NVarChar(100), fullName.trim())
      .input("Email", sql.NVarChar(120), email.trim().toLowerCase())
      .input("PhoneNumber", sql.VarChar(20), phoneNumber?.trim() || null)
      .input("PasswordHash", sql.NVarChar(255), passwordHash)
      .input("Address", sql.NVarChar(255), address?.trim() || null)
      .query(`
        INSERT INTO Users (RoleID, FullName, Email, PhoneNumber, PasswordHash, Address, IsActive)
        OUTPUT INSERTED.UserID, INSERTED.RoleID, INSERTED.FullName, INSERTED.Email, INSERTED.PhoneNumber, INSERTED.CreatedAt
        VALUES (@RoleID, @FullName, @Email, @PhoneNumber, @PasswordHash, @Address, 1);
      `);

    const newUser = insertResult.recordset[0];

    // 6. Tạo JWT token
    const token = generateToken({
      userId: newUser.UserID,
      email: newUser.Email,
      roleId: newUser.RoleID,
      roleName: "CUSTOMER",
    });

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      data: {
        user: {
          id: newUser.UserID,
          fullName: newUser.FullName,
          email: newUser.Email,
          phoneNumber: newUser.PhoneNumber,
          role: "CUSTOMER",
          createdAt: newUser.CreatedAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("[Register Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi đăng ký tài khoản.",
    });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ email và mật khẩu.",
      });
    }

    const pool = getPool();

    // 1. Truy vấn thông tin người dùng kèm vai trò từ CSDL
    const result = await pool
      .request()
      .input("Email", sql.NVarChar(120), email.trim().toLowerCase())
      .query(`
        SELECT u.UserID, u.RoleID, r.RoleName, u.FullName, u.Email, 
               u.PhoneNumber, u.PasswordHash, u.IsActive, u.CreatedAt
        FROM Users u
        JOIN Roles r ON u.RoleID = r.RoleID
        WHERE u.Email = @Email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác.",
      });
    }

    const user = result.recordset[0];

    // 2. Kiểm tra tài khoản có bị khóa không
    if (!user.IsActive) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    // 3. Đối soát mật khẩu BCrypt
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác.",
      });
    }

    // 4. Tạo JWT token
    const token = generateToken({
      userId: user.UserID,
      email: user.Email,
      roleId: user.RoleID,
      roleName: user.RoleName,
    });

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      data: {
        user: {
          id: user.UserID,
          fullName: user.FullName,
          email: user.Email,
          phoneNumber: user.PhoneNumber,
          role: user.RoleName,
          createdAt: user.CreatedAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("[Login Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi đăng nhập.",
    });
  }
};

// GET /api/auth/me
export const getMe = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Yêu cầu cung cấp Bearer token hợp lệ.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const pool = getPool();
    const result = await pool
      .request()
      .input("UserID", sql.Int, decoded.userId)
      .query(`
        SELECT u.UserID, u.RoleID, r.RoleName, u.FullName, u.Email, 
               u.PhoneNumber, u.Address, u.AvatarUrl, u.CreatedAt
        FROM Users u
        JOIN Roles r ON u.RoleID = r.RoleID
        WHERE u.UserID = @UserID AND u.IsActive = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
  }
};
