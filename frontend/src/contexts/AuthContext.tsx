"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeApi, loginApi, logoutApi, registerApi, updateProfileApi, changePasswordApi, loginWithGoogleApi } from "@/services/api";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: "Admin" | "Operator" | "Customer" | string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isOperator: boolean;
  isCustomer: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (params: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    address?: string;
  }) => Promise<{ success: boolean; message: string; user?: User }>;
  loginWithGoogle: (params: {
    credential?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; message: string; user?: User }>;
  updateProfile: (params: {
    fullName: string;
    phoneNumber?: string;
    address?: string;
  }) => Promise<{ success: boolean; message: string; user?: User }>;
  changePassword: (params: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  // Tải trạng thái đăng nhập độc lập theo từng Tab từ sessionStorage và xác thực /api/auth/me
  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = sessionStorage.getItem("mc_token");
        const storedUser = sessionStorage.getItem("mc_user");

        // Nếu Tab hiện tại chưa có token riêng -> giữ nguyên trạng thái Khách (không kế thừa cookie của Tab khác)
        if (!storedToken) {
          setUser(null);
          setToken(null);
          return;
        }

        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Kiểm tra tính hợp lệ với máy chủ bằng Bearer token của riêng Tab này
        const res = await getMeApi();
        if (res.success && res.data) {
          const u: User = {
            id: res.data.UserID,
            fullName: res.data.FullName,
            email: res.data.Email,
            role: res.data.RoleName,
            phoneNumber: res.data.PhoneNumber,
            address: res.data.Address,
            avatarUrl: res.data.AvatarUrl,
          };
          setUser(u);
          sessionStorage.setItem("mc_user", JSON.stringify(u));
        }
      } catch (err) {
        // Token hết hạn hoặc không hợp lệ -> xóa riêng phiên của Tab hiện tại
        sessionStorage.removeItem("mc_token");
        sessionStorage.removeItem("mc_user");
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginApi({ email, password });
    if (res.success && res.data) {
      const u: User = {
        id: res.data.user.id,
        fullName: res.data.user.fullName,
        email: res.data.user.email,
        role: res.data.user.role,
        phoneNumber: res.data.user.phoneNumber,
        createdAt: res.data.user.createdAt,
      } as any;

      setUser(u);
      setToken(res.data.token);
      sessionStorage.setItem("mc_token", res.data.token);
      sessionStorage.setItem("mc_user", JSON.stringify(u));
      setIsAuthModalOpen(false);
      return { success: true, message: res.message, user: u };
    }
    return { success: false, message: res.message || "Đăng nhập thất bại" };
  };

  const register = async (params: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    address?: string;
  }) => {
    const res = await registerApi(params);
    if (res.success && res.data) {
      const u: User = {
        id: res.data.user.id,
        fullName: res.data.user.fullName,
        email: res.data.user.email,
        role: res.data.user.role,
        phoneNumber: res.data.user.phoneNumber,
      };

      setUser(u);
      setToken(res.data.token);
      sessionStorage.setItem("mc_token", res.data.token);
      sessionStorage.setItem("mc_user", JSON.stringify(u));
      setIsAuthModalOpen(false);
      return { success: true, message: res.message, user: u };
    }
    return { success: false, message: res.message || "Đăng ký thất bại" };
  };

  const loginWithGoogle = async (params: {
    credential?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  }) => {
    try {
      const res = await loginWithGoogleApi(params);
      if (res.success && res.data) {
        const u: User = {
          id: res.data.user.id,
          fullName: res.data.user.fullName,
          email: res.data.user.email,
          role: res.data.user.role || "Customer",
          phoneNumber: res.data.user.phoneNumber,
          address: res.data.user.address,
          avatarUrl: res.data.user.avatarUrl,
        };

        setUser(u);
        setToken(res.data.token);
        sessionStorage.setItem("mc_token", res.data.token);
        sessionStorage.setItem("mc_user", JSON.stringify(u));
        setIsAuthModalOpen(false);
        return { success: true, message: res.message, user: u };
      }
      return { success: false, message: res.message || "Đăng nhập Google thất bại" };
    } catch (err: any) {
      return { success: false, message: err?.message || "Lỗi kết nối khi đăng nhập bằng Google." };
    }
  };

  const updateProfile = async (params: {
    fullName: string;
    phoneNumber?: string;
    address?: string;
  }) => {
    try {
      const res = await updateProfileApi(params);
      if (res.success && res.data) {
        const updated: User = {
          ...(user || {}),
          id: res.data.id || user?.id || 0,
          fullName: res.data.fullName,
          email: res.data.email || user?.email || "",
          role: res.data.role || user?.role || "Customer",
          phoneNumber: res.data.phoneNumber,
          address: res.data.address,
          avatarUrl: res.data.avatarUrl || user?.avatarUrl,
        };

        setUser(updated);
        sessionStorage.setItem("mc_user", JSON.stringify(updated));
        return { success: true, message: res.message || "Cập nhật thành công!", user: updated };
      }
      return { success: false, message: res.message || "Cập nhật hồ sơ thất bại" };
    } catch (err: any) {
      return { success: false, message: err?.message || "Lỗi khi cập nhật hồ sơ" };
    }
  };

  const changePassword = async (params: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      const res = await changePasswordApi(params);
      return { success: !!res.success, message: res.message || "Đổi mật khẩu thành công!" };
    } catch (err: any) {
      return { success: false, message: err?.message || "Lỗi khi đổi mật khẩu" };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // bỏ qua lỗi nếu có
    } finally {
      sessionStorage.removeItem("mc_token");
      sessionStorage.removeItem("mc_user");
      setUser(null);
      setToken(null);
      router.push("/login");
    }
  };

  const openAuthModal = (tab: "login" | "register" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(false);
    if (tab === "register") {
      router.push("/register");
    } else {
      router.push("/login");
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const roleLower = (user?.role || "").toLowerCase();
  const isAdmin = roleLower === "admin";
  const isOperator = roleLower === "operator" || isAdmin;
  const isCustomer = roleLower === "customer";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        isOperator,
        isCustomer,
        isAuthModalOpen,
        authModalTab,
        login,
        register,
        loginWithGoogle,
        updateProfile,
        changePassword,
        logout,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
