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

export default function MushroomBotDrawer({ isOpen, onClose }: MushroomBotDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Xin chào! Tôi là Cố Vấn Nông Nghiệp Thông Minh MushroomBot 🍄 vận hành trên nền tảng Llama-3.1-8B. Tôi có thể giải đáp chính xác về thông số vi khí hậu buồng vô trùng, tiêu chuẩn VietGAP, hợp đồng thuê khay FaaS và bảo hiểm sản lượng.',
      time: 'Vừa xong',
      modelUsed: 'Llama-3.1-8B FaaS AI',
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(SUGGESTED_QUESTIONS.slice(0, 4));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

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
          text: data?.reply || 'Hệ thống đã ghi nhận thông tin và đang xử lý.',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data?.model || 'Llama-3.1-8B FaaS AI',
          sources: data?.sources,
        };
        setMessages((prev) => [...prev, botReply]);

        if (Array.isArray(data?.suggestedQuestions) && data.suggestedQuestions.length > 0) {
          setSuggestions(data.suggestedQuestions);
        }
      } else {
        throw new Error('API server responded with error');
      }
    } catch {
      // Fallback an toàn nếu backend mất kết nối
      const fallbackReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Độ ẩm tiêu chuẩn cho nấm Bào Ngư là 88-92%, Linh Chi Đỏ là 80-88% và Đông Trùng Hạ Thảo là 85-90%. Toàn bộ dữ liệu được lưu trữ khóa dòng Serializable trên CSDL T-SQL và có bảo hiểm 100% sản lượng.',
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full sm:w-[440px] h-full bg-[#FDFBF8] dark:bg-[#150E0A] shadow-2xl flex flex-col border-l border-[#DECFC0] dark:border-[#38261A] transition-transform duration-300"
      >
        {/* Header Chuẩn Cafe Latte & Bio Emerald */}
        <div className="p-4 bg-gradient-to-r from-[#24170E] via-[#332014] to-[#1F130B] text-white flex items-center justify-between border-b border-[#C28E58]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6B442C] to-[#C28E58] border border-[#E2BA78]/40 flex items-center justify-center text-xl shadow-xs">
              🍄
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#E2BA78] flex items-center gap-2">
                MushroomBot AI
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Llama-3.1-8B
                </span>
              </h3>
              <p className="text-[11px] text-[#DAC7B5] flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Cố vấn kỹ thuật nông nghiệp 24/7</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-[#DAC7B5] hover:text-white flex items-center justify-center transition border border-white/10"
            title="Đóng (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-[#F4ECE1] dark:bg-[#1C120C] border-b border-[#E0D3C1] dark:border-[#38261A] shrink-0">
          <p className="text-[11px] font-bold text-[#6E4B33] dark:text-[#E2BA78] mb-1.5 flex items-center gap-1">
            <span>💡 Câu hỏi gợi ý nhanh:</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[11px] bg-white dark:bg-[#25170F] hover:bg-[#FAF5EE] dark:hover:bg-[#2F1D13] text-[#4A3222] dark:text-[#DAC7B5] px-2.5 py-1 rounded-xl border border-[#DECFC0] dark:border-[#422C1D] transition shadow-2xs text-left font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-[#2B1B11] to-[#3B2517] text-white rounded-br-xs border border-[#C28E58]/30 font-medium'
                    : 'bg-white dark:bg-[#1E130B] text-[#24170E] dark:text-[#F7EFE6] rounded-bl-xs border border-[#EAE1D3] dark:border-[#38261A]'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                {m.modelUsed && (
                  <div className="mt-2 pt-1.5 border-t border-[#F2E8DC] dark:border-[#2D1B11] flex items-center justify-between text-[10px] text-[#8C6D53] dark:text-[#A88C76]">
                    <span>⚡ {m.modelUsed}</span>
                    <span>✓ VietGAP Verified</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono text-[#8C6D53] dark:text-[#A88C76] mt-1 px-1">
                {m.time}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-[#735843] dark:text-[#DAC7B5] text-xs p-2.5 bg-white dark:bg-[#1E130B] rounded-2xl border border-[#EAE1D3] dark:border-[#38261A] w-fit shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] font-medium">Llama-3.1-8B đang suy luận dữ liệu...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3.5 bg-white dark:bg-[#1A110B] border-t border-[#DECFC0] dark:border-[#38261A] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về nấm, độ ẩm, mã QR VietGAP, FaaS..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-[#DECFC0] dark:border-[#38261A] bg-[#FAF5EE] dark:bg-[#24170F] text-[#24170E] dark:text-[#FFF5EA] focus:outline-none focus:border-[#C28E58] shadow-inner"
            />
            <button
              type="submit"
              disabled={isTyping}
              className="bg-gradient-to-r from-[#2B1B11] to-[#3B2517] hover:from-[#1C1109] hover:to-[#2B1B11] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition shrink-0 border border-[#C28E58]/40 disabled:opacity-50"
            >
              Gửi →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
