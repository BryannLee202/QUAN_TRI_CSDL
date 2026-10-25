import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mushroomcloud_default_dev_secret_key_2026_@academic";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as string;

export interface TokenPayload {
  userId: number;
  email: string;
  roleId: number;
  roleName: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
