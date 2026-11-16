"use client";

import { useState } from "react";
import { decodeIotHexApi, getSampleIotHexApi, ingestIotHexApi } from "@/services/api";

interface Props {
  currentRoomId: number;
  onIngestSuccess?: (data: any) => void;
}

export default function IotHexInspector({ currentRoomId, onIngestSuccess }: Props) {
  const [hexInput, setHexInput] = useState("01030600F50375026CBDB3");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleGenerateSample = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getSampleIotHexApi(24.8, 89.2, 640);
      if (res.success && res.data.rawHex) {
        setHexInput(res.data.rawHex);
        setToast("Đã tạo frame mẫu Modbus RTU (24.8°C, 89.2%, 640 ppm)");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi tạo mẫu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecode = async () => {
    if (!hexInput.trim()) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await decodeIotHexApi(hexInput);
      if (res.success) {
        setResult(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi giải mã gói tin");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIngest = async () => {
    if (!hexInput.trim()) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await ingestIotHexApi(hexInput, currentRoomId);
      if (res.success) {
        setResult(res.data);
        setToast(`Đã lưu bản tin #${res.data.dataId} vào SQL Server & phát WebSocket!`);
        setTimeout(() => setToast(null), 3500);
        onIngestSuccess?.(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi nạp CSDL");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#E0D3C1] dark:border-[#38261A] bg-white dark:bg-[#20140D] p-5 shadow-sm transition-colors">
      <header className="mb-4 flex items-center justify-between pb-3 border-b border-[#F0E6D8] dark:border-[#2D1D13]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] dark:bg-[#2B1B12] border border-[#DECFC0] dark:border-[#4A3222] flex items-center justify-center text-[#C28E58]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-sm text-[#24170E] dark:text-[#FFF5EA]">
              Phân Tích Gói Tin Nhị Phân IoT (Binary Hex Decoder)
            </h2>
            <p className="text-[11px] text-[#735843] dark:text-[#BFA895]">
              Giải mã Modbus RTU / LoRaWAN & kiểm tra tính toàn vẹn CRC16
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerateSample}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FAF5EE] dark:bg-[#25170F] text-[#8A5C38] dark:text-[#E2BA78] border border-[#DECFC0] dark:border-[#4A3222] hover:bg-[#F2E8DC] transition-colors"
        >
          Sinh Frame Mẫu
        </button>
      </header>

      {toast && (
        <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#523522] dark:text-[#D4AF7A] mb-1">
            Chuỗi Payload Hex (Raw Bytes từ cảm biến RS485/LoRaWAN):
          </label>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            placeholder="Ví dụ: 01030600F50375026CBDB3"
            className="w-full px-3 py-2 rounded-xl border border-[#DECFC0] dark:border-[#4A3222] bg-[#FAF5EE] dark:bg-[#1A1009] text-[#24170E] dark:text-[#FFF5EA] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#C28E58]"
          />
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleDecode}
            className="flex-1 py-2 rounded-xl bg-[#C28E58] hover:bg-[#B37F49] text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <span>{isLoading ? "Đang xử lý..." : "Giải Mã Frame"}</span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleIngest}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#6B442C] to-[#523522] hover:from-[#5C3822] hover:to-[#452B1B] text-[#FFF5EA] font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 border border-[#C28E58]"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Nạp Vào CSDL SQL Server</span>
          </button>
        </div>

        {result && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-[#FAF5EE] dark:bg-[#170E08] border border-[#DECFC0] dark:border-[#38261A] text-xs space-y-2 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DCCE] dark:border-[#2D1D13]">
              <span className="font-bold text-[#6B513E] dark:text-[#C5B09E]">Giao thức nhận diện:</span>
              <span className="font-mono font-bold text-[#C28E58]">{result.protocol}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
              <div className="p-2 rounded-lg bg-white dark:bg-[#20140D] border border-[#E0D3C1] dark:border-[#332015]">
                <span className="text-[10px] text-[#8C6D53] dark:text-[#A8907E] block font-sans">Nhiệt độ</span>
                <strong className="text-sm text-[#24170E] dark:text-[#FFF5EA]">{result.temperature}°C</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#20140D] border border-[#E0D3C1] dark:border-[#332015]">
                <span className="text-[10px] text-[#8C6D53] dark:text-[#A8907E] block font-sans">Độ ẩm</span>
                <strong className="text-sm text-[#24170E] dark:text-[#FFF5EA]">{result.humidity}%</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-[#20140D] border border-[#E0D3C1] dark:border-[#332015]">
                <span className="text-[10px] text-[#8C6D53] dark:text-[#A8907E] block font-sans">CO₂ Level</span>
                <strong className="text-sm text-[#24170E] dark:text-[#FFF5EA]">{result.co2} ppm</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[#8C6D53] dark:text-[#A8907E]">Tính toàn vẹn CRC16:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                result.isCrcValid
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
              }`}>
                {result.isCrcValid ? "HỢP LỆ (CHECKSUM OK)" : "LỖI SAI CRC16"}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
