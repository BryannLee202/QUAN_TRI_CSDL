'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getMyTraysApi, MyTrayRecord, requestCustomerHarvestApi } from "@/services/api";

const GROWTH_STAGES = [
  { id: 1, title: "Cấy phôi", range: "Ngày 1–3" },
  { id: 2, title: "Ủ sợi tơ", range: "Ngày 4–10" },
  { id: 3, title: "Kết nụ mầm", range: "Ngày 11–16" },
  { id: 4, title: "Nuôi quả thể", range: "Ngày 17–25" },
  { id: 5, title: "Thu hoạch", range: "Cuối chu kỳ" },
];

export default function MyTraysPage() {
  const { user, isAuthenticated } = useAuth();
  const [trays, setTrays] = useState<MyTrayRecord[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [harvestSubmitting, setHarvestSubmitting] = useState<boolean>(false);
  const [harvestNotice, setHarvestNotice] = useState<string | null>(null);
  const [highlightHarvest, setHighlightHarvest] = useState<boolean>(false);
  const [highlightClimate, setHighlightClimate] = useState<boolean>(false);
  const harvestSectionRef = useRef<HTMLDivElement>(null);
  const climateSectionRef = useRef<HTMLDivElement>(null);

  const loadMyTrays = useCallback(async () => {
    if (!isAuthenticated) {
      setTrays([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await getMyTraysApi();
      const params =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const targetCode = params?.get("tray");
      const isHarvestAction = params?.get("action") === "harvest";
      const isClimateFocus = params?.get("focus") === "climate";

      if (list.length > 0) {
        setTrays(list);
        const matched = targetCode ? list.find((t) => t.trayCode === targetCode) : undefined;
        const harvestMatch = isHarvestAction
          ? list.find((t) => (t.speciesName || "").toLowerCase().includes("đông trùng") || (t.speciesName || "").toLowerCase().includes("hạ thảo")) || list[0]
          : undefined;

        setSelectedOrderId((prev) => {
          if (matched) return matched.orderId;
          if (harvestMatch) return harvestMatch.orderId;
          if (prev && list.some((t) => t.orderId === prev)) return prev;
          return list[0].orderId;
        });
      } else {
        // Nếu tài khoản hiện tại (ví dụ Admin vừa reset CSDL) chưa có khay thực tế nhưng bấm thông báo thu hoạch hoặc vi khí hậu:
        // Cung cấp khay Đông Trùng Hạ Thảo mẫu chuẩn bị cắt nấm để trải nghiệm ngay chức năng trọng điểm
        if (isHarvestAction || isClimateFocus || targetCode) {
          const sampleTray: MyTrayRecord = {
            orderId: 999,
            orderCode: "ORD-2026-CORDYCEPS",
            startDate: new Date(Date.now() - 56 * 86400000).toISOString(),
            endDate: new Date(Date.now() + 4 * 86400000).toISOString(),
            totalAmount: 1499000,
            paymentStatus: "PAID",
            deliveryAddress: user?.address || "Khu Công Nghệ Cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP.HCM",
            createdAt: new Date(Date.now() - 56 * 86400000).toISOString(),
            packageId: 3,
            packageName: "Gói Đông Trùng Hạ Thảo Sinh Khối",
            durationDays: 60,
            expectedYieldKg: 1.0,
            speciesId: 3,
            speciesName: "Đông Trùng Hạ Thảo (Cordyceps militaris)",
            optimalTempMin: 18,
            optimalTempMax: 22,
            optimalHumidityMin: 80,
            optimalHumidityMax: 88,
            optimalCO2Max: 900,
            trayId: 32,
            trayCode: targetCode || "TRAY-RM02-R01-004",
            rackNumber: 1,
            shelfLevel: 2,
            roomId: 2,
            roomCode: "RM02",
            roomName: "Buồng Đông Trùng Hạ Thảo",
            temperature: 20.5,
            humidity: 84.5,
            co2Level: 750,
            lightLux: 520,
            inoculationDate: new Date(Date.now() - 56 * 86400000).toISOString(),
            expectedHarvestDate: new Date(Date.now() + 4 * 86400000).toISOString(),
            harvestStatus: null,
          };
          setTrays([sampleTray]);
          setSelectedOrderId(sampleTray.orderId);
        } else {
          setTrays([]);
        }
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách khay nấm của bạn.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadMyTrays();
  }, [loadMyTrays]);

  // Tự động cuộn và làm nổi bật mục thu hoạch hoặc vi khí hậu khi người dùng click từ thông báo
  useEffect(() => {
    if (!loading && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "harvest") {
        setHighlightHarvest(true);
        const scrollTimer = setTimeout(() => {
          harvestSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 350);
        const fadeTimer = setTimeout(() => {
          setHighlightHarvest(false);
        }, 6000);
        return () => {
          clearTimeout(scrollTimer);
          clearTimeout(fadeTimer);
        };
      }
      if (params.get("focus") === "climate") {
        setHighlightClimate(true);
        const scrollTimer = setTimeout(() => {
          climateSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 350);
        const fadeTimer = setTimeout(() => {
          setHighlightClimate(false);
        }, 6000);
        return () => {
          clearTimeout(scrollTimer);
          clearTimeout(fadeTimer);
        };
      }
    }
  }, [loading, selectedOrderId]);

  // Tự động đồng bộ khi chuyển tab hoặc có đơn hàng mới từ tab/modal khác
  useEffect(() => {
    const onFocus = () => loadMyTrays();
    window.addEventListener("focus", onFocus);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("smartmushroom_sync");
      channel.onmessage = () => loadMyTrays();
    }
    return () => {
      window.removeEventListener("focus", onFocus);
      if (channel) channel.close();
    };
  }, [loadMyTrays]);

  const selectedTray = useMemo(() => {
    if (trays.length === 0) return null;
    return trays.find((t) => t.orderId === selectedOrderId) || trays[0];
  }, [trays, selectedOrderId]);

  const growthMetrics = useMemo(() => {
    if (!selectedTray) {
      return { elapsedDays: 1, totalDays: 30, progressPct: 5, stageIdx: 0 };
    }
    const totalDays = Math.max(1, Number(selectedTray.durationDays) || 30);
    const startRef = selectedTray.inoculationDate || selectedTray.startDate || selectedTray.createdAt;
    const startMs = startRef ? new Date(startRef).getTime() : Date.now();
    const diffDays = Math.max(1, Math.floor((Date.now() - startMs) / (1000 * 60 * 60 * 24)) + 1);
    const elapsedDays = Math.min(totalDays, diffDays);
    const progressPct = Math.min(100, Math.max(5, Math.round((elapsedDays / totalDays) * 100)));

    let stageIdx = 0;
    if (progressPct >= 88) stageIdx = 4;
    else if (progressPct >= 55) stageIdx = 3;
    else if (progressPct >= 35) stageIdx = 2;
    else if (progressPct >= 15) stageIdx = 1;

    return { elapsedDays, totalDays, progressPct, stageIdx };
  }, [selectedTray]);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "Đang cập nhật";
    try {
      return new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Đang cập nhật";
    }
  };

  const getTrayPreviewImage = (speciesName: string = "") => {
    const s = speciesName.toLowerCase();
    if (s.includes("linh chi")) return "/images/real-farm/real-reishi-macro.jpg";
    if (s.includes("đông trùng") || s.includes("hạ thảo")) return "/images/real-farm/real-cordyceps-macro.jpg";
    if (s.includes("hầu thủ")) return "/images/real-farm/real-lionsmane-macro.jpg";
    if (s.includes("hoàng kim") || (s.includes("bào ngư") && s.includes("vàng"))) return "/images/real-farm/real-golden-oyster-macro.jpg";
    if (s.includes("bào ngư")) return "/images/real-farm/real-oyster-macro.jpg";
    if (s.includes("mối đen")) return "/images/real-farm/real-black-termitomyces-macro.jpg";
    if (s.includes("hương") || s.includes("shiitake")) return "/images/real-farm/real-shiitake-macro.jpg";
    if (s.includes("vân chi") || s.includes("turkey")) return "/images/real-farm/real-turkeytail-macro.jpg";
    if (s.includes("cẩm thạch") || s.includes("shimeji")) return "/images/real-farm/real-white-shimeji-macro.jpg";
    return "/images/real-farm/real-cordyceps-macro.jpg";
  };

  const handleRequestHarvest = async () => {
    if (!selectedTray) return;
    setHarvestSubmitting(true);
    setHarvestNotice(null);
    try {
      if (selectedTray.orderId === 999) {
        // Mô phỏng thành công tức thì cho khay showcase khi trải nghiệm từ thông báo
        await new Promise((r) => setTimeout(r, 600));
        setTrays((prev) =>
          prev.map((t) => (t.orderId === 999 ? { ...t, harvestStatus: "PENDING" } : t))
        );
        setHarvestNotice("Đã gửi yêu cầu thu hoạch thành công! Kỹ thuật viên sẽ đóng gói và giao tận nhà.");
      } else {
        await requestCustomerHarvestApi({
          orderId: selectedTray.orderId,
          deliveryType: "HOME_DELIVERY",
          deliveryAddress: selectedTray.deliveryAddress,
          notes: `Khách hàng ${user?.fullName || ""} yêu cầu thu hoạch khay ${selectedTray.trayCode || ""}`,
        });
        setHarvestNotice("Đã gửi yêu cầu thu hoạch thành công! Kỹ thuật viên sẽ đóng gói và giao tận nhà.");
        await loadMyTrays();
      }
    } catch (err: any) {
      setHarvestNotice(err.message || "Không thể gửi yêu cầu thu hoạch lúc này.");
    } finally {
      setHarvestSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF8] dark:bg-[#140D08] text-[#24170E] dark:text-[#F7EFE6] transition-colors flex flex-col justify-between font-sans">
      <div>
        <Navbar />

        {/* Header */}
        <section className="bg-gradient-to-b from-[#F5EEE4] via-[#FBF7F0] to-[#FDFBF8] dark:from-[#20140D] dark:via-[#19100A] dark:to-[#140D08] border-b border-[#EAE1D3] dark:border-[#474039] py-10 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#24170E] dark:text-white tracking-tight">
                Khay Nấm Của Tôi
              </h1>
              <p className="text-sm sm:text-base text-[#6E4B33] dark:text-[#DAC7B5] mt-2 max-w-2xl leading-relaxed">
                Theo dõi trực tiếp tiến độ sinh trưởng, vị trí kệ phòng sạch và chỉ số vi khí hậu IoT cho riêng các khay nấm bạn đang sở hữu.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {(user?.role === "Operator" || user?.role === "Admin") ? (
                <Link
                  href="/operator"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <line x1="8" x2="16" y1="21" y2="21" />
                    <line x1="12" x2="12" y1="17" y2="21" />
                  </svg>
                  <span>Trung Tâm Điều Hành Farm</span>
                </Link>
              ) : (
                <Link
                  href="/#packages"
                  className="px-4 py-2.5 rounded-xl bg-[#24170E] hover:bg-[#382417] dark:bg-[#C28E58] dark:hover:bg-[#D4A16A] text-white dark:text-[#1E1B18] text-xs font-bold transition shadow-xs"
                >
                  + Thuê Thêm Khay Mới
                </Link>
              )}
              <Link
                href="/ho-so"
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#27231F] border border-[#DECFC0] dark:border-[#474039] hover:border-[#C28E58] text-xs font-bold text-[#4A3222] dark:text-[#E2BA78] transition"
              >
                {(user?.role === "Operator" || user?.role === "Admin") ? "Hồ Sơ Kỹ Thuật" : "Lịch Sử Giao Dịch"}
              </Link>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          {isAuthenticated && (user?.role === "Operator" || user?.role === "Admin") && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-xs font-bold">Tài khoản Kỹ thuật viên / Quản trị viên</h4>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    Trang này phục vụ khách hàng theo dõi khay cá nhân. Để giám sát toàn bộ ma trận khay của tất cả các buồng nuôi, hãy vào Trung Tâm Điều Hành.
                  </p>
                </div>
              </div>
              <Link
                href="/operator"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold whitespace-nowrap shrink-0 transition"
              >
                Vào Trung Tâm Điều Hành →
              </Link>
            </div>
          )}
          {!isAuthenticated ? (
            <div className="rounded-3xl bg-white dark:bg-[#27231F] border border-[#EAE1D3] dark:border-[#474039] p-10 text-center space-y-4 shadow-sm max-w-xl mx-auto">
              <h2 className="text-xl font-black text-[#24170E] dark:text-white">
                Đăng nhập để theo dõi khay nấm của bạn
              </h2>
              <p className="text-sm text-[#735843] dark:text-[#DAC7B5]">
                Hệ thống bảo mật riêng tư chỉ hiển thị các hợp đồng và khay nấm thuộc tài khoản của bạn.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#24170E] hover:bg-[#382417] dark:bg-[#C28E58] text-white dark:text-[#1E1B18] text-sm font-bold transition"
              >
                Đăng Nhập Ngay →
              </Link>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 rounded-3xl bg-[#F4ECE1] dark:bg-[#27231F] animate-pulse" />
              <div className="lg:col-span-2 h-96 rounded-3xl bg-[#F4ECE1] dark:bg-[#27231F] animate-pulse" />
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-6 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          ) : trays.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-[#27231F] border border-[#EAE1D3] dark:border-[#474039] p-12 text-center space-y-4 shadow-sm max-w-xl mx-auto">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] flex items-center justify-center text-2xl">
                🍄
              </div>
              <h2 className="text-xl font-black text-[#24170E] dark:text-white">
                Bạn chưa có khay nấm nào đang nuôi trồng
              </h2>
              <p className="text-sm text-[#735843] dark:text-[#DAC7B5]">
                Hãy chọn gói thuê khay Bào Ngư Xám, Linh Chi Đỏ hoặc Đông Trùng Hạ Thảo để bắt đầu theo dõi quá trình sinh trưởng tại đây.
              </p>
              <Link
                href="/#packages"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold transition shadow-sm"
              >
                Thuê Khay Nấm Đầu Tiên →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Danh sách khay bên trái */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#8A5C38] dark:text-[#E2BA78]">
                    Danh Sách Khay Sở Hữu ({trays.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {trays.map((t) => {
                    const isSelected = selectedTray?.orderId === t.orderId;
                    return (
                      <button
                        key={t.orderId}
                        type="button"
                        onClick={() => {
                          setSelectedOrderId(t.orderId);
                          setHarvestNotice(null);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white dark:bg-[#27231F] border-[#C28E58] ring-2 ring-[#C28E58]/20 shadow-md"
                            : "bg-[#FAF5EE]/70 dark:bg-[#1E1B18] border-[#EAE1D3] dark:border-[#474039] hover:border-[#C28E58]/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-black text-[#24170E] dark:text-[#E2BA78]">
                            {t.trayCode || `HĐ #${t.orderCode}`}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              t.harvestStatus
                                ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            {t.harvestStatus ? `Thu hoạch: ${t.harvestStatus}` : "Đang sinh trưởng"}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-[#24170E] dark:text-white mt-1.5">
                          {t.packageName}
                        </p>
                        <p className="text-xs text-[#735843] dark:text-[#BFA895] mt-0.5">
                          {t.speciesName} • {t.roomCode || "RM01"} • Kệ {t.rackNumber || 1} • Tầng {t.shelfLevel || 1}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chi tiết theo dõi khay đang chọn */}
              {selectedTray && (
                <div className="lg:col-span-8 space-y-5">
                  <div className="rounded-3xl bg-white dark:bg-[#27231F] border border-[#EAE1D3] dark:border-[#474039] p-6 shadow-sm space-y-6">
                    {/* Header khay */}
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F2E8DC] dark:border-[#474039] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-[#FAF5EE] dark:bg-[#322D28] border border-[#DECFC0] dark:border-[#474039] font-mono text-xs font-black text-[#6B442C] dark:text-[#E2BA78]">
                            {selectedTray.trayCode || "Đang cấp mã khay"}
                          </span>
                          <span className="text-xs font-mono text-[#8C6D53] dark:text-[#BFA895]">
                            Hợp đồng: {selectedTray.orderCode}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-[#24170E] dark:text-white mt-2">
                          {selectedTray.packageName}
                        </h2>
                        <p className="text-xs text-[#735843] dark:text-[#DAC7B5] mt-1">
                          Vị trí: <strong>{selectedTray.roomName || "Buồng Nuôi RM01"}</strong> • Kệ{" "}
                          {selectedTray.rackNumber || 1} • Tầng {selectedTray.shelfLevel || 1} • Bắt đầu:{" "}
                          {formatDate(selectedTray.startDate)} → Dự kiến thu hoạch:{" "}
                          {formatDate(selectedTray.expectedHarvestDate || selectedTray.endDate)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] uppercase font-bold text-[#8A5C38] dark:text-[#BFA895] block">
                          Sản lượng cam kết
                        </span>
                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                          ~{selectedTray.expectedYieldKg} kg
                        </span>
                      </div>
                    </div>

                    {/* Ảnh buồng nuôi & tiến độ */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-[#EAE1D3] dark:border-[#474039] aspect-[4/3] bg-[#1E1B18]">
                        <img
                          src={getTrayPreviewImage(selectedTray.speciesName)}
                          alt={selectedTray.speciesName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>{selectedTray.roomCode || "RM01"} • Camera Khay</span>
                        </div>
                      </div>

                      <div className="md:col-span-7 space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-[#4A3222] dark:text-[#FFF5EA]">
                            Tiến độ chu kỳ sinh trưởng ({growthMetrics.elapsedDays}/{growthMetrics.totalDays} ngày)
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-black">
                            {growthMetrics.progressPct}%
                          </span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-[#F2E8DC] dark:bg-[#322D28] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500"
                            style={{ width: `${growthMetrics.progressPct}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-5 gap-1.5 pt-1">
                          {GROWTH_STAGES.map((st, idx) => {
                            const active = idx === growthMetrics.stageIdx;
                            const done = idx < growthMetrics.stageIdx;
                            return (
                              <div
                                key={st.id}
                                className={`p-2 rounded-xl border text-center ${
                                  active
                                    ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-900 dark:text-emerald-300"
                                    : done
                                    ? "bg-[#FAF5EE] dark:bg-[#322D28] border-[#C28E58]/50 text-[#4A3222] dark:text-[#E2BA78]"
                                    : "bg-[#FAF5EE]/40 dark:bg-[#1E1B18] border-[#EAE1D3] dark:border-[#474039] text-[#8C6D53] opacity-65"
                                }`}
                              >
                                <p className="text-[10px] font-extrabold leading-tight">{st.title}</p>
                                <p className="text-[9px] mt-0.5 opacity-80">{st.range}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Chỉ số vi khí hậu thực tế của buồng nuôi */}
                    <div
                      ref={climateSectionRef}
                      className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-2 rounded-2xl transition-all duration-500 ${
                        highlightClimate
                          ? "ring-4 ring-emerald-500/50 shadow-xl shadow-emerald-500/10 scale-[1.01]"
                          : ""
                      }`}
                    >
                      <div className="p-3.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28] border border-[#EAE1D3] dark:border-[#474039]">
                        <span className="text-[11px] font-bold text-[#8A5C38] dark:text-[#BFA895]">
                          Nhiệt độ buồng
                        </span>
                        <p className="text-xl font-black text-[#24170E] dark:text-white mt-1">
                          {Number(selectedTray.temperature).toFixed(1)} °C
                        </p>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                          Chuẩn: {selectedTray.optimalTempMin}–{selectedTray.optimalTempMax} °C
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28] border border-[#EAE1D3] dark:border-[#474039]">
                        <span className="text-[11px] font-bold text-[#8A5C38] dark:text-[#BFA895]">
                          Độ ẩm không khí
                        </span>
                        <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                          {Number(selectedTray.humidity).toFixed(1)} %
                        </p>
                        <span className="text-[10px] text-[#735843] dark:text-[#DAC7B5] font-semibold">
                          Chuẩn: {selectedTray.optimalHumidityMin}–{selectedTray.optimalHumidityMax} %
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28] border border-[#EAE1D3] dark:border-[#474039]">
                        <span className="text-[11px] font-bold text-[#8A5C38] dark:text-[#BFA895]">
                          Nồng độ khí CO₂
                        </span>
                        <p className="text-xl font-black text-[#24170E] dark:text-white mt-1">
                          {Math.round(Number(selectedTray.co2Level))} ppm
                        </p>
                        <span className="text-[10px] text-[#735843] dark:text-[#DAC7B5] font-semibold">
                          Giới hạn: &lt; {selectedTray.optimalCO2Max} ppm
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#322D28] border border-[#EAE1D3] dark:border-[#474039]">
                        <span className="text-[11px] font-bold text-[#8A5C38] dark:text-[#BFA895]">
                          Ánh sáng phòng sạch
                        </span>
                        <p className="text-xl font-black text-[#C28E58] dark:text-[#E2BA78] mt-1">
                          {Math.round(Number(selectedTray.lightLux || 480))} Lux
                        </p>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                          Chuẩn VietGAP
                        </span>
                      </div>
                    </div>

                    {/* Hành động thu hoạch */}
                    <div
                      ref={harvestSectionRef}
                      className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border transition-all duration-500 ${
                        highlightHarvest
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-[1.01]"
                          : "border-[#F2E8DC] dark:border-[#474039]"
                      }`}
                    >
                      <div className="text-xs text-[#735843] dark:text-[#DAC7B5]">
                        <div className="flex items-center gap-1.5 font-bold text-[#24170E] dark:text-white mb-0.5">
                          {highlightHarvest && (
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
                          )}
                          <span>Giao Hàng &amp; Thu Hoạch Nấm</span>
                        </div>
                        Địa chỉ nhận nấm: <strong>{selectedTray.deliveryAddress}</strong>
                      </div>
                      <button
                        type="button"
                        disabled={harvestSubmitting || Boolean(selectedTray.harvestStatus)}
                        onClick={handleRequestHarvest}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
                          selectedTray.harvestStatus
                            ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 cursor-default"
                            : highlightHarvest
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer ring-4 ring-emerald-400/30 animate-pulse"
                            : "bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer"
                        }`}
                      >
                        {selectedTray.harvestStatus
                          ? `Đã gửi yêu cầu (${selectedTray.harvestStatus})`
                          : harvestSubmitting
                          ? "Đang gửi yêu cầu..."
                          : "Yêu Cầu Thu Hoạch Tận Nhà"}
                      </button>
                    </div>

                    {harvestNotice && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        {harvestNotice}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
