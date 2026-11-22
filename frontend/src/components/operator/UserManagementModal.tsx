"use client";

import { useEffect, useState } from "react";
import {
  getManagedUsersApi,
  updateUserStatusApi,
  updateUserRoleApi,
  resetUserPasswordApi,
  type ManagedUser,
} from "@/services/api";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [notice, setNotice] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getManagedUsersApi();
      setUsers(data);
    } catch (err: any) {
      // Fallback demo data nếu lỗi kết nối
      setUsers([
        { userId: 1, fullName: "Nguyễn Quản Trị", email: "admin@mushroomcloud.test", phoneNumber: "0900000001", roleId: 1, roleName: "Admin", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
        { userId: 2, fullName: "Trần Kỹ Thuật", email: "operator1@mushroomcloud.test", phoneNumber: "0900000002", roleId: 2, roleName: "Operator", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
        { userId: 3, fullName: "Lê Vận Hành", email: "operator2@mushroomcloud.test", phoneNumber: "0900000003", roleId: 2, roleName: "Operator", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
        { userId: 4, fullName: "Phạm Minh An", email: "customer1@mushroomcloud.test", phoneNumber: "0900000011", roleId: 3, roleName: "Customer", isActive: true, createdAt: "2026-11-20T00:00:00Z" },
        { userId: 5, fullName: "Võ Thu Hà", email: "customer2@mushroomcloud.test", phoneNumber: "0900000012", roleId: 3, roleName: "Customer", isActive: false, createdAt: "2026-11-20T00:00:00Z" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: ManagedUser) => {
    try {
      setProcessingId(user.userId);
      const nextStatus = !user.isActive;
      await updateUserStatusApi(user.userId, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.userId === user.userId ? { ...u, isActive: nextStatus } : u))
      );
      showNotice(
        `Đã ${nextStatus ? "kích hoạt" : "vô hiệu hóa"} tài khoản ${user.fullName} (${user.email})!`,
        "success"
      );
    } catch (err: any) {
      showNotice(err.message || "Lỗi cập nhật trạng thái", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangeRole = async (user: ManagedUser, newRoleId: number) => {
    try {
      setProcessingId(user.userId);
      await updateUserRoleApi(user.userId, newRoleId);
      const roleName = newRoleId === 1 ? "Admin" : newRoleId === 2 ? "Operator" : "Customer";
      setUsers((prev) =>
        prev.map((u) => (u.userId === user.userId ? { ...u, roleId: newRoleId, roleName } : u))
      );
      showNotice(`Đã chuyển vai trò của ${user.fullName} sang [${roleName}] thành công!`, "success");
    } catch (err: any) {
      showNotice(err.message || "Lỗi thay đổi vai trò", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleResetPassword = async (user: ManagedUser) => {
    if (!confirm(`Xác nhận đặt lại mật khẩu của [${user.fullName}] về 'Password123@'?`)) return;

    try {
      setProcessingId(user.userId);
      await resetUserPasswordApi(user.userId);
      showNotice(`Đã đặt lại mật khẩu của ${user.email} về mặc định (Password123@)!`, "success");
    } catch (err: any) {
      showNotice(err.message || "Lỗi reset mật khẩu", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const showNotice = (message: string, type: "success" | "error") => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 4000);
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phoneNumber?.includes(searchQuery);
    const matchesRole = roleFilter === "ALL" || u.roleName.toUpperCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FFFDF9] dark:bg-[#1A120B] rounded-3xl border border-[#D9C8B5] dark:border-[#4A3222] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-[#D9C8B5] dark:border-[#4A3222] bg-gradient-to-r from-[#F5EBE1] to-[#FAF5EE] dark:from-[#24160E] dark:to-[#1A120B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#523522] dark:bg-[#E2BA78] text-[#FAF5EE] dark:text-[#1A120B] flex items-center justify-center font-black shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#382314] dark:text-[#F3EAD8] tracking-tight">
                  Quản Trị Người Dùng & Phân Quyền (RBAC)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  Chức Năng A3
                </span>
              </div>
              <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-0.5">
                Xem danh sách, phân công vai trò (Admin/Operator/Customer), kích hoạt hoặc vô hiệu hóa tài khoản và đặt lại mật khẩu.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Thông báo Toast thông tin */}
        {notice && (
          <div
            className={`mx-6 mt-4 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-slide-down ${
              notice.type === "success"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
                : "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300"
            }`}
          >
            <span>{notice.message}</span>
            <button onClick={() => setNotice(null)} className="text-sm font-black opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Bộ lọc và Tìm kiếm */}
        <div className="p-6 pb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#D9C8B5]/50 dark:border-[#4A3222]/50">
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên, Email hoặc Số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#24160E] text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#C28E58]"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#735843] dark:text-[#BFA895]">Lọc vai trò:</span>
            {["ALL", "ADMIN", "OPERATOR", "CUSTOMER"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === role
                    ? "bg-[#523522] dark:bg-[#E2BA78] text-white dark:text-[#1A120B] shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {role === "ALL" ? "Tất cả" : role}
              </button>
            ))}
          </div>
        </div>

        {/* Bảng dữ liệu người dùng */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {loading ? (
            <div className="py-20 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[#C28E58] border-t-transparent rounded-full animate-spin"></span>
              Đang tải danh sách người dùng từ SQL Server...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-xs font-bold text-slate-400">
              Không tìm thấy người dùng nào phù hợp với điều kiện tìm kiếm.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#D9C8B5] dark:border-[#4A3222] shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF5EE] dark:bg-[#24160E] border-b border-[#D9C8B5] dark:border-[#4A3222] text-[#523522] dark:text-[#E2BA78] font-black uppercase text-[10px] tracking-wider">
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Họ và Tên / Email</th>
                    <th className="p-3.5">Số Điện Thoại</th>
                    <th className="p-3.5">Vai Trò (Role)</th>
                    <th className="p-3.5">Trạng Thái (IsActive)</th>
                    <th className="p-3.5 text-right">Thao Tác Quản Trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9C8B5]/50 dark:divide-[#4A3222]/50 font-medium">
                  {filteredUsers.map((u) => {
                    const isSelfAdmin = u.userId === 1; // Tài khoản Root Admin
                    return (
                      <tr
                        key={u.userId}
                        className="hover:bg-[#FAF5EE]/60 dark:hover:bg-[#24160E]/60 transition-colors"
                      >
                        <td className="p-3.5 font-bold text-slate-400">#{u.userId}</td>
                        <td className="p-3.5">
                          <div className="font-extrabold text-[#382314] dark:text-[#F3EAD8] text-sm">
                            {u.fullName}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                            {u.email}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300 font-mono">
                          {u.phoneNumber || "---"}
                        </td>
                        <td className="p-3.5">
                          <select
                            disabled={isSelfAdmin || processingId === u.userId}
                            value={u.roleId}
                            onChange={(e) => handleChangeRole(u, Number(e.target.value))}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              u.roleName === "Admin"
                                ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300"
                                : u.roleName === "Operator"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300"
                                : "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300"
                            } ${isSelfAdmin ? "opacity-70 cursor-not-allowed" : ""}`}
                          >
                            <option value={1}>Admin (Quản trị)</option>
                            <option value={2}>Operator (Kỹ thuật)</option>
                            <option value={3}>Customer (Khách hàng)</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            disabled={isSelfAdmin || processingId === u.userId}
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              u.isActive
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-200"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 hover:bg-rose-200"
                            } ${isSelfAdmin ? "opacity-70 cursor-not-allowed" : ""}`}
                            title={u.isActive ? "Nhấn để vô hiệu hóa" : "Nhấn để kích hoạt"}
                          >
                            <span className={`w-2 h-2 rounded-full ${u.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                            <span>{u.isActive ? "Hoạt động" : "Bị vô hiệu"}</span>
                          </button>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={processingId === u.userId}
                              onClick={() => handleResetPassword(u)}
                              className="px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                              title="Đặt lại mật khẩu về Password123@"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v4" />
                                <path d="m16.2 7.8 2.9-2.9" />
                                <path d="M18 12h4" />
                                <path d="m16.2 16.2 2.9 2.9" />
                                <path d="M12 18v4" />
                                <path d="m4.9 19.1 2.9-2.9" />
                                <path d="M2 12h4" />
                                <path d="m4.9 4.9 2.9 2.9" />
                              </svg>
                              <span>Reset Pass</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 px-6 border-t border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF5EE] dark:bg-[#24160E] flex items-center justify-between text-xs text-[#735843] dark:text-[#BFA895]">
          <div className="flex items-center gap-2">
            <span className="font-bold">Tổng cộng:</span>
            <span className="font-black text-[#382314] dark:text-[#F3EAD8]">{filteredUsers.length} tài khoản</span>
            <span className="text-slate-400">|</span>
            <span className="text-[11px] text-slate-500">Mật khẩu reset mặc định: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">Password123@</code></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#523522] dark:bg-[#E2BA78] text-white dark:text-[#1A120B] font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Đóng bảng
          </button>
        </div>

      </div>
    </div>
  );
}
