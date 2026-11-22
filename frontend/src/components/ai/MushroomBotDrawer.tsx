'use client';

import React, { useState, useRef, useEffect } from "react";
import { SUGGESTED_QUESTIONS } from "../../data/botKnowledge";

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  modelUsed?: string;
  sources?: string[];
}

interface MushroomBotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Cửa sổ Trợ lý AI MushroomBot - Thiết kế Floating Card hiện đại chuẩn SaaS
 * Kích thước vừa vặn (390px x 520px), không che phủ toàn màn hình,
 * hiệu ứng kính mờ Glassmorphism và chuyển động bung nở êm ái.
 */
export default function MushroomBotDrawer({ isOpen, onClose }: MushroomBotDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ Lý Nông Nghiệp Thông Minh MushroomBot 🍄 vận hành trên nền tảng Llama-3.1-8B.\nTôi sẵn sàng giải đáp về thông số vi khí hậu buồng vô trùng, tiêu chuẩn VietGAP, hợp đồng thuê khay FaaS và bảo hiểm sản lượng.',
      time: 'Vừa xong',
      modelUsed: 'Llama-3.1-8B FaaS AI',
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(SUGGESTED_QUESTIONS.slice(0, 5));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Cuộn mượt xuống tin nhắn mới nhất
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Đóng khi click chuột ra ngoài (Click Outside) hoặc bấm phím Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Không đóng nếu bấm vào chính khung chat hoặc nút FAB kích hoạt
      if (cardRef.current && !cardRef.current.contains(target)) {
        const fab = document.getElementById("mushroom-bot-fab");
        if (fab && fab.contains(target)) return;
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Xóa lịch sử trò chuyện để làm mới
  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Đã làm mới cuộc hội thoại! Bạn có thể đặt câu hỏi mới về nấm dược liệu hoặc hệ thống FaaS.',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Llama-3.1-8B FaaS AI',
      },
    ]);
  };

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput("");
    setIsTyping(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

      const res = await fetch(`${apiUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const data = json?.data;
        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data?.reply || 'Hệ thống đã ghi nhận câu hỏi và đang cập nhật cơ sở tri thức vi khí hậu.',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data?.model || 'Llama-3.1-8B FaaS AI',
          sources: data?.sources,
        };
        setMessages((prev) => [...prev, botReply]);

        if (Array.isArray(data?.suggestedQuestions) && data.suggestedQuestions.length > 0) {
          setSuggestions(data.suggestedQuestions);
        }
      } else {
        throw new Error('API server error');
      }
    } catch {
      // Fallback cục bộ an toàn nếu server AI bận
      const fallbackReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Nhiệt độ tối ưu cho Đông Trùng Hạ Thảo là 18-22°C, nấm Bào Ngư là 24-28°C và Linh Chi là 26-30°C. Dữ liệu cảm biến được bảo vệ khóa dòng Serializable trên T-SQL, có bảo hiểm sản lượng 100%.',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Llama-3.1-8B (Zero-Crash Fallback)',
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label="Cửa sổ trò chuyện Trợ lý AI MushroomBot"
      className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[390px] h-[520px] max-h-[78vh] flex flex-col rounded-3xl bg-[#FDFBF8]/95 dark:bg-[#150E0A]/95 backdrop-blur-xl border border-[#DECFC0] dark:border-[#474039] shadow-2xl shadow-[#24170E]/30 dark:shadow-black/70 overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95"
    >
      {/* 1. Header Tinh Tế & Đẳng Cấp */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#24170E] via-[#332014] to-[#1F130B] text-white flex items-center justify-between border-b border-[#C28E58]/30 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Avatar nấm 3D với hiệu ứng phát sáng */}
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6B442C] via-[#9E653F] to-[#C28E58] border border-[#E2BA78]/50 flex items-center justify-center text-base shadow-xs shrink-0">
            🍄
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-[#24170E]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs text-[#FAF5EE] tracking-wide">MushroomBot AI</h3>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Llama-3.1
              </span>
            </div>
            <p className="text-[10px] text-[#D8C4B0] flex items-center gap-1 mt-0.5">
              <span>Cố vấn vi khí hậu & FaaS 24/7</span>
            </p>
          </div>
        </div>

        {/* Cụm nút thao tác (Làm mới & Đóng) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-[#D8C4B0] hover:text-white flex items-center justify-center transition border border-white/10 text-xs"
            title="Làm mới cuộc trò chuyện"
            aria-label="Làm mới cuộc trò chuyện"
          >
            ↺
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-[#D8C4B0] hover:text-white flex items-center justify-center transition border border-white/10 text-xs font-bold"
            title="Thu nhỏ cửa sổ (Esc)"
            aria-label="Đóng cửa sổ"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 2. Thanh Gợi Ý Câu Hỏi Cuộn Ngang (Horizontal Scroll Chips - Tiết kiệm không gian) */}
      <div className="px-3 py-1.5 bg-[#F6EFE6] dark:bg-[#1A110B] border-b border-[#EADECF] dark:border-[#474039] shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-bold text-[#8C6D53] dark:text-[#C28E58] shrink-0 flex items-center gap-0.5 pr-0.5">
            ✨ Gợi ý:
          </span>
          {suggestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap bg-white dark:bg-[#322D28] hover:bg-[#FAF5EE] dark:hover:bg-[#2F1D13] text-[#4A3222] dark:text-[#E8DCCE] px-2.5 py-1 rounded-full border border-[#DECFC0] dark:border-[#474039] hover:border-[#C28E58] transition shadow-2xs shrink-0 font-medium active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Khung Tin Nhắn (Message Stream) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-[#2B1B11] to-[#3B2517] text-white rounded-br-xs border border-[#C28E58]/35 font-medium'
                  : 'bg-white dark:bg-[#27231F] text-[#24170E] dark:text-[#F7EFE6] rounded-bl-xs border border-[#EAE1D3] dark:border-[#474039]'
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
              {m.modelUsed && (
                <div className="mt-2 pt-1.5 border-t border-[#F2E8DC] dark:border-[#474039] flex items-center justify-between text-[9px] text-[#8C6D53] dark:text-[#B9ADA1]">
                  <span>⚡ {m.modelUsed}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ VietGAP</span>
                </div>
              )}
            </div>
            <span className="text-[9px] font-mono text-[#8C6D53] dark:text-[#B9ADA1] mt-1 px-1">
              {m.time}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-[#735843] dark:text-[#DAC7B5] text-xs p-2.5 bg-white dark:bg-[#27231F] rounded-2xl rounded-bl-xs border border-[#EAE1D3] dark:border-[#474039] w-fit shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58] animate-bounce"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58] animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C28E58] animate-bounce [animation-delay:0.4s]"></span>
            <span className="text-[10px] font-medium font-mono text-[#8C6D53] dark:text-[#C28E58]">Llama-3.1 đang suy luận...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Khung Nhập Liệu Thông Minh (Smart Input Bar) */}
      <div className="p-2.5 bg-white/95 dark:bg-[#160E09]/95 backdrop-blur-md border-t border-[#DECFC0] dark:border-[#474039] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-1.5 bg-[#FAF5EE] dark:bg-[#27231F] rounded-full border border-[#DECFC0] dark:border-[#3D281C] p-1 pl-3.5 focus-within:border-[#C28E58] focus-within:ring-2 focus-within:ring-[#C28E58]/20 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi về nấm, vi khí hậu, hợp đồng FaaS..."
            className="flex-1 text-xs bg-transparent text-[#24170E] dark:text-[#FFF5EA] placeholder:text-[#9A816E] dark:placeholder:text-[#786150] outline-none"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="w-7 h-7 rounded-full bg-gradient-to-r from-[#C28E58] to-[#8C5A32] hover:brightness-110 text-white flex items-center justify-center transition shadow-xs disabled:opacity-40 shrink-0 cursor-pointer active:scale-95"
            title="Gửi câu hỏi"
            aria-label="Gửi tin nhắn"
          >
            <svg className="w-3.5 h-3.5 translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
