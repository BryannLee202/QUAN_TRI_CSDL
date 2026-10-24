
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Chưa cấu hình JWT_SECRET trong file .env");
}

export const generateToken = (userId: number): string => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
