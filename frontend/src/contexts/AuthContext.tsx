"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeApi, loginApi, logoutApi, registerApi } from "@/services/api";

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

  // Tải trạng thái đăng nhập từ localStorage và gọi /api/auth/me
  useEffect(() => {
    async function initAuth() {
      try {
        const storedToken = localStorage.getItem("mc_token");
        const storedUser = localStorage.getItem("mc_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }

        // Kiểm tra tính hợp lệ với máy chủ
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
          localStorage.setItem("mc_user", JSON.stringify(u));
        }
      } catch (err) {
        // Token hết hạn hoặc chưa đăng nhập
        localStorage.removeItem("mc_token");
        localStorage.removeItem("mc_user");
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
      localStorage.setItem("mc_token", res.data.token);
      localStorage.setItem("mc_user", JSON.stringify(u));
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
      localStorage.setItem("mc_token", res.data.token);
      localStorage.setItem("mc_user", JSON.stringify(u));
      setIsAuthModalOpen(false);
      return { success: true, message: res.message, user: u };
    }
    return { success: false, message: res.message || "Đăng ký thất bại" };
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // bỏ qua lỗi nếu có
    } finally {
      localStorage.removeItem("mc_token");
      localStorage.removeItem("mc_user");
      setUser(null);
      setToken(null);
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
