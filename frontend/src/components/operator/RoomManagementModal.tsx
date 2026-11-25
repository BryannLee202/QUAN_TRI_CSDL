"use client";

import { useState } from "react";
import type { RoomOption } from "./types";
import {
  createOperatorRoomApi,
  updateOperatorRoomApi,
  deleteOperatorRoomApi,
  type CreateRoomParams,
  type UpdateRoomParams,
} from "@/services/api";

interface RoomManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: RoomOption[];
  onRoomsUpdated: (updatedRooms: RoomOption[]) => void;
}

export default function RoomManagementModal({
  isOpen,
  onClose,
  rooms,
  onRoomsUpdated,
}: RoomManagementModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // State Modal Tạo Buồng Nuôi Mới
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoomCode, setNewRoomCode] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newMaxTrays, setNewMaxTrays] = useState<number>(28);
  const [newTempMin, setNewTempMin] = useState<number>(20);
  const [newTempMax, setNewTempMax] = useState<number>(28);
  const [newHumMin, setNewHumMin] = useState<number>(80);
  const [newHumMax, setNewHumMax] = useState<number>(95);
  const [newCo2Max, setNewCo2Max] = useState<number>(1000);
  const [newDesc, setNewDesc] = useState("");
  const [newCamUrl, setNewCamUrl] = useState("");
  const [newInitTrays, setNewInitTrays] = useState<number>(10);

  // State Modal Chỉnh Sửa Buồng Nuôi
  const [editingRoom, setEditingRoom] = useState<RoomOption | null>(null);
  const [editRoomName, setEditRoomName] = useState("");
  const [editMaxTrays, setEditMaxTrays] = useState<number>(28);
  const [editTempMin, setEditTempMin] = useState<number>(20);
  const [editTempMax, setEditTempMax] = useState<number>(28);
  const [editHumMin, setEditHumMin] = useState<number>(80);
  const [editHumMax, setEditHumMax] = useState<number>(95);
  const [editCo2Max, setEditCo2Max] = useState<number>(1000);
  const [editDesc, setEditDesc] = useState("");
  const [editCamUrl, setEditCamUrl] = useState("");

  const showNotice = (message: string, type: "success" | "error") => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 4500);
  };

  // Mở Form Sửa Buồng
  const handleOpenEdit = (room: RoomOption) => {
    setEditingRoom(room);
    setEditRoomName(room.roomName || "");
    setEditMaxTrays(room.maxTrays || 28);
    setEditTempMin(room.tempMin != null ? Number(room.tempMin) : 20);
    setEditTempMax(room.tempMax != null ? Number(room.tempMax) : 28);
    setEditHumMin(room.humidityMin != null ? Number(room.humidityMin) : 80);
    setEditHumMax(room.humidityMax != null ? Number(room.humidityMax) : 95);
    setEditCo2Max(room.co2Max != null ? Number(room.co2Max) : 1000);
    setEditDesc(room.description || "");
    setEditCamUrl(room.cameraStreamUrl || "");
  };

  // Xử lý Tạo Buồng Nuôi Mới
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomCode.trim() || !newRoomName.trim()) {
      showNotice("Vui lòng nhập đầy đủ mã buồng và tên buồng.", "error");
      return;
    }
    if (newTempMin >= newTempMax) {
      showNotice("Nhiệt độ tối thiểu phải nhỏ hơn nhiệt độ tối đa (CK_Rooms_Temperature).", "error");
      return;
    }
    if (newHumMin >= newHumMax) {
      showNotice("Độ ẩm tối thiểu phải nhỏ hơn độ ẩm tối đa (CK_Rooms_Humidity).", "error");
      return;
    }
    if (newCo2Max <= 0 || newCo2Max > 5000) {
      showNotice("Nồng độ CO2 phải từ 1 đến 5000 ppm (CK_Rooms_CO2).", "error");
      return;
    }

    try {
      setIsProcessing(true);
      const params: CreateRoomParams = {
        roomCode: newRoomCode.trim().toUpperCase(),
        roomName: newRoomName.trim(),
        maxTrays: Number(newMaxTrays) || 28,
        tempMin: Number(newTempMin),
        tempMax: Number(newTempMax),
        humidityMin: Number(newHumMin),
        humidityMax: Number(newHumMax),
        co2Max: Number(newCo2Max),
        description: newDesc.trim() || undefined,
        cameraStreamUrl: newCamUrl.trim() || undefined,
        initialTraysCount: Number(newInitTrays) || 10,
      };

      const res = await createOperatorRoomApi(params);
      const created = res.data;

      const updated = [...rooms, created];
      onRoomsUpdated(updated);
      showNotice(`Đã khởi tạo thành công buồng nuôi [${created.roomName}] (${created.roomCode})!`, "success");
      setIsCreateOpen(false);

      // Reset form
      setNewRoomCode("");
      setNewRoomName("");
      setNewDesc("");
      setNewCamUrl("");
    } catch (err: any) {
      showNotice(err.message || "Lỗi tạo buồng nuôi", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý Cập Nhật Thông Số Buồng Nuôi
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    if (!editRoomName.trim()) {
      showNotice("Tên buồng không được để trống.", "error");
      return;
    }
    if (editTempMin >= editTempMax) {
      showNotice("Nhiệt độ tối thiểu phải nhỏ hơn nhiệt độ tối đa.", "error");
      return;
    }
    if (editHumMin >= editHumMax) {
      showNotice("Độ ẩm tối thiểu phải nhỏ hơn độ ẩm tối đa.", "error");
      return;
    }

    try {
      setIsProcessing(true);
      const params: UpdateRoomParams = {
        roomName: editRoomName.trim(),
        maxTrays: Number(editMaxTrays),
        tempMin: Number(editTempMin),
        tempMax: Number(editTempMax),
        humidityMin: Number(editHumMin),
        humidityMax: Number(editHumMax),
        co2Max: Number(editCo2Max),
        description: editDesc.trim() || undefined,
        cameraStreamUrl: editCamUrl.trim() || undefined,
      };

      await updateOperatorRoomApi(editingRoom.roomId, params);

      const updated = rooms.map((r) =>
        r.roomId === editingRoom.roomId
          ? {
              ...r,
              roomName: editRoomName.trim(),
              maxTrays: Number(editMaxTrays),
              tempMin: Number(editTempMin),
              tempMax: Number(editTempMax),
              humidityMin: Number(editHumMin),
              humidityMax: Number(editHumMax),
              co2Max: Number(editCo2Max),
              description: editDesc.trim(),
              cameraStreamUrl: editCamUrl.trim(),
            }
          : r
      );

      onRoomsUpdated(updated);
      showNotice(`Đã cập nhật thông số buồng nuôi [${editRoomName}] thành công!`, "success");
      setEditingRoom(null);
    } catch (err: any) {
      showNotice(err.message || "Lỗi cập nhật buồng nuôi", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý Xóa / Đóng Buồng Nuôi
  const handleDeleteRoom = async (room: RoomOption) => {
    if ((room.occupiedTrays || 0) > 0) {
      showNotice(
        `Không thể xóa buồng [${room.roomCode}] vì đang có ${room.occupiedTrays} khay nấm của khách đang phát triển!`,
        "error"
      );
      return;
    }

    if (
      !confirm(
        `Xác nhận đóng buồng nuôi [${room.roomName || room.roomCode}]? Các khay trống bên trong sẽ chuyển sang bảo dưỡng.`
      )
    ) {
      return;
    }

    try {
      setIsProcessing(true);
      await deleteOperatorRoomApi(room.roomId);
      const updated = rooms.filter((r) => r.roomId !== room.roomId);
      onRoomsUpdated(updated);
      showNotice(`Đã đóng buồng nuôi [${room.roomCode}] thành công!`, "success");
    } catch (err: any) {
      showNotice(err.message || "Lỗi đóng buồng nuôi", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const filteredRooms = rooms.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      r.roomCode.toLowerCase().includes(q) ||
      (r.roomName || "").toLowerCase().includes(q) ||
      (r.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FFFDF9] dark:bg-[#1A120B] rounded-3xl border border-[#D9C8B5] dark:border-[#4A3222] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-[#D9C8B5] dark:border-[#4A3222] bg-gradient-to-r from-[#F5EBE1] to-[#FAF5EE] dark:from-[#24160E] dark:to-[#1A120B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-800 dark:bg-amber-600 text-white flex items-center justify-center font-black shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-[#382314] dark:text-[#F3EAD8] tracking-tight">
                Quản Trị Buồng Nuôi Trồng
              </h2>
              <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-0.5">
                Xem danh sách buồng nuôi, thêm buồng mới, cấu hình ngưỡng vi khí hậu (Nhiệt độ, Độ ẩm, CO₂) và quản lý công suất khay.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Thêm Buồng Nuôi Mới</span>
            </button>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
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
            <button onClick={() => setNotice(null)} className="text-sm font-black opacity-60 hover:opacity-100 cursor-pointer">✕</button>
          </div>
        )}

        {/* Thanh tìm kiếm */}
        <div className="p-6 pb-3 flex items-center justify-between gap-4 border-b border-[#D9C8B5]/50 dark:border-[#4A3222]/50">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm buồng nuôi theo Mã (RM01, RM02...), Tên buồng hoặc Mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#24160E] text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#C28E58]"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Danh sách Thẻ Buồng Nuôi (Room Cards) */}
        <div className="flex-1 overflow-y-auto p-6 pt-3 space-y-4">
          {filteredRooms.length === 0 ? (
            <div className="py-16 text-center text-xs font-bold text-slate-400">
              Không tìm thấy buồng nuôi nào phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((r) => {
                const total = r.totalTrays || 0;
                const max = r.maxTrays || 28;
                const occupied = r.occupiedTrays || 0;
                const available = r.availableTrays || (total - occupied);
                const occPercent = Math.min(100, Math.round((occupied / max) * 100));

                return (
                  <div
                    key={r.roomId}
                    className="p-5 rounded-3xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#20150E] shadow-sm flex flex-col justify-between hover:border-[#C28E58] transition-all"
                  >
                    <div>
                      {/* Header Thẻ Buồng */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-[#523522] text-[#FAF5EE] dark:bg-[#E2BA78] dark:text-[#1A120B]">
                              {r.roomCode}
                            </span>
                            <h3 className="font-extrabold text-[#382314] dark:text-[#F3EAD8] text-sm">
                              {r.roomName || `Buồng ${r.roomCode}`}
                            </h3>
                          </div>
                          {r.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {r.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Công suất khay */}
                      <div className="my-3 p-3 rounded-2xl bg-[#FAF5EE] dark:bg-[#2A1C14] border border-[#DECFC0]/60 dark:border-[#4A3222]/60">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#523522] dark:text-[#DAC7B5] mb-1.5">
                          <span>Công suất khay:</span>
                          <span>
                            <strong className="text-rose-600 dark:text-rose-400">{occupied}</strong> đang nuôi / {max} khay ({occPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                          <div style={{ width: `${occPercent}%` }} className="bg-rose-500 transition-all duration-300"></div>
                          <div style={{ width: `${Math.min(100 - occPercent, Math.round((available / max) * 100))}%` }} className="bg-emerald-500 transition-all duration-300"></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
                          <span>🟢 Sẵn sàng: <strong>{available}</strong></span>
                          <span>🔴 Đang thuê: <strong>{occupied}</strong></span>
                        </div>
                      </div>

                      {/* Ngưỡng vi khí hậu chuẩn */}
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                          <span className="text-[#735843] dark:text-[#BFA895] font-semibold flex items-center gap-1.5">
                            🌡️ Nhiệt độ chuẩn:
                          </span>
                          <span className="font-bold text-[#382314] dark:text-[#F3EAD8] font-mono">
                            {r.tempMin != null ? r.tempMin : 20}°C - {r.tempMax != null ? r.tempMax : 28}°C
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40">
                          <span className="text-[#735843] dark:text-[#BFA895] font-semibold flex items-center gap-1.5">
                            💧 Độ ẩm chuẩn:
                          </span>
                          <span className="font-bold text-[#382314] dark:text-[#F3EAD8] font-mono">
                            {r.humidityMin != null ? r.humidityMin : 80}% - {r.humidityMax != null ? r.humidityMax : 95}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                          <span className="text-[#735843] dark:text-[#BFA895] font-semibold flex items-center gap-1.5">
                            🌬️ CO₂ tối đa:
                          </span>
                          <span className="font-bold text-[#382314] dark:text-[#F3EAD8] font-mono">
                            &lt; {r.co2Max != null ? r.co2Max : 1000} ppm
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Thao tác Quản trị */}
                    <div className="pt-4 mt-4 border-t border-[#D9C8B5]/50 dark:border-[#4A3222]/50 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(r)}
                        className="px-3 py-1.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 hover:bg-sky-100 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                        title="Chỉnh sửa buồng và cấu hình ngưỡng vi khí hậu"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                        <span>Sửa & Cấu Hình</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleDeleteRoom(r)}
                        className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                        title="Đóng buồng nuôi"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        <span>Đóng Buồng</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 px-6 border-t border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF5EE] dark:bg-[#24160E] flex items-center justify-between text-xs text-[#735843] dark:text-[#BFA895]">
          <div className="flex items-center gap-2">
            <span className="font-bold">Tổng số buồng nuôi:</span>
            <span className="font-black text-[#382314] dark:text-[#F3EAD8]">{filteredRooms.length} buồng</span>
            <span className="text-slate-400">|</span>
            <span className="text-[11px] text-slate-500">Ràng buộc vi khí hậu được kiểm soát tự động bởi CSDL</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Submodal 1: Form Thêm Buồng Nuôi Mới */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#1E1610] rounded-3xl border border-[#D9C8B5] dark:border-[#4A3222] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-scale-up max-h-[90vh]">
            <div className="p-5 border-b border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF5EE] dark:bg-[#2A1C14] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#382314] dark:text-[#F3EAD8]">Thêm Buồng Nuôi Mới</h3>
                  <p className="text-[11px] text-[#735843] dark:text-[#BFA895]">Khởi tạo buồng nuôi vật lý kèm ngưỡng vi khí hậu chuẩn</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-5 space-y-3.5 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#523522] dark:text-[#DAC7B5] mb-1">
                    Mã buồng (RoomCode) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: RM04"
                    value={newRoomCode}
                    onChange={(e) => setNewRoomCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#24160E] text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-[#C28E58] uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#523522] dark:text-[#DAC7B5] mb-1">
                    Tên buồng nuôi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Buồng Nấm Hầu Thủ"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#24160E] text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#C28E58]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#523522] dark:text-[#DAC7B5] mb-1">
                    Công suất khay tối đa (MaxTrays)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={newMaxTrays}
                    onChange={(e) => setNewMaxTrays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#24160E] text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#C28E58]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#523522] dark:text-[#DAC7B5] mb-1">
                    Khởi tạo khay sẵn sàng
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={newMaxTrays}
                    value={newInitTrays}
                    onChange={(e) => setNewInitTrays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#24160E] text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#C28E58]"
                  />
                </div>
              </div>

              {/* Ngưỡng vi khí hậu */}
              <div className="p-3.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#24160E] border border-[#D9C8B5]/60 dark:border-[#4A3222]/60 space-y-3">
                <span className="font-extrabold text-xs text-[#523522] dark:text-[#E2BA78] block">
                  ⚙️ Cấu hình Ngưỡng Vi Khí Hậu Chuẩn
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#735843] dark:text-[#BFA895] mb-1">
                      Nhiệt độ tối thiểu (°C)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={49}
                      value={newTempMin}
                      onChange={(e) => setNewTempMin(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#1E1610] text-slate-800 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#735843] dark:text-[#BFA895] mb-1">
                      Nhiệt độ tối đa (°C)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={1}
                      max={50}
                      value={newTempMax}
                      onChange={(e) => setNewTempMax(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#1E1610] text-slate-800 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#735843] dark:text-[#BFA895] mb-1">
                      Độ ẩm tối thiểu (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min={0}
                      max={99}
                      value={newHumMin}
                      onChange={(e) => setNewHumMin(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#1E1610] text-slate-800 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#735843] dark:text-[#BFA895] mb-1">
                      Độ ẩm tối đa (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min={1}
                      max={100}
                      value={newHumMax}
                      onChange={(e) => setNewHumMax(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#1E1610] text-slate-800 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#735843] dark:text-[#BFA895] mb-1">
                    Nồng độ CO₂ tối đa (ppm)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min={100}
                    max={5000}
                    value={newCo2Max}
                    onChange={(e) => setNewCo2Max(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#1E1610] text-slate-800 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#523522] dark:text-[#DAC7B5] mb-1">
                  Mô tả buồng nuôi
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Buồng vô trùng nuôi cấy giống nấm dược liệu cao cấp..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#24160E] text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#C28E58]"
                />
              </div>

              <div className="pt-3 border-t border-[#D9C8B5]/50 dark:border-[#4A3222]/50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? "Đang khởi tạo..." : "Xác Nhận Tạo Buồng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submodal 2: Form Chỉnh Sửa Buồng Nuôi */}
      {editingRoom && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#1E1610] rounded-3xl border border-[#D9C8B5] dark:border-[#4A3222] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-scale-up max-h-[90vh]">
            <div className="p-5 border-b border-[#D9C8B5] dark:border-[#4A3222] bg-[#FAF5EE] dark:bg-[#2A1C14] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#382314] dark:text-[#F3EAD8]">
                    Chỉnh Sửa Buồng [{editingRoom.roomCode}]
                  </h3>
                  <p className="text-[11px] text-[#735843] dark:text-[#BFA895]">Cập nhật tên buồng, công suất và ngưỡng vi khí hậu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#523522] dark:text-[#DAC7B5] mb-1">
                    Tên buồng nuôi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editRoomName}
                    onChange={(e) => setEditRoomName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#24160E] text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#C28E58]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#523522] dark:text-[#DAC7B5] mb-1">
                    Công suất khay tối đa
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={editMaxTrays}
                    onChange={(e) => setEditMaxTrays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#24160E] text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#C28E58]"
                  />
                </div>
              </div>

              {/* Ngưỡng vi khí hậu */}
              <div className="p-3.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#24160E] border border-[#D9C8B5]/60 dark:border-[#4A3222]/60 space-y-3">
                <span className="font-extrabold text-xs text-[#523522] dark:text-[#E2BA78] block">
                  ⚙️ Cấu hình Ngưỡng Vi Khí Hậu Chuẩn
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#735843] dark:text-[#BFA895] mb-1">
                      Nhiệt độ tối thiểu (°C)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={49}
                      value={editTempMin}
                      onChange={(e) => setEditTempMin(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#1E1610] text-slate-800 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#735843] dark:text-[#BFA895] mb-1">
                      Nhiệt độ tối đa (°C)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={1}
                      max={50}
                      value={editTempMax}
                      onChange={(e) => setEditTempMax(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#1E1610] text-slate-800 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#735843] dark:text-[#BFA895] mb-1">
                      Độ ẩm tối thiểu (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min={0}
                      max={99}
                      value={editHumMin}
                      onChange={(e) => setEditHumMin(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#1E1610] text-slate-800 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#735843] dark:text-[#BFA895] mb-1">
                      Độ ẩm tối đa (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min={1}
                      max={100}
                      value={editHumMax}
                      onChange={(e) => setEditHumMax(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#1E1610] text-slate-800 dark:text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#735843] dark:text-[#BFA895] mb-1">
                    Nồng độ CO₂ tối đa (ppm)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min={100}
                    max={5000}
                    value={editCo2Max}
                    onChange={(e) => setEditCo2Max(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-white dark:bg-[#1E1610] text-slate-800 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#523522] dark:text-[#DAC7B5] mb-1">
                  Mô tả buồng nuôi
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8B5] dark:border-[#4A3222] bg-white dark:bg-[#24160E] text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#C28E58]"
                />
              </div>

              <div className="pt-3 border-t border-[#D9C8B5]/50 dark:border-[#4A3222]/50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
