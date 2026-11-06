'use client';

import React, { useState, useRef, useEffect } from "react";
import { BOT_KNOWLEDGE, SUGGESTED_QUESTIONS, FAQItem } from "../../data/botKnowledge";

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
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
      text: 'Xin chào! Tôi là Trợ Lý Nông Nghiệp Thông Minh MushroomBot 🍄. Tôi có thể giải đáp về quy trình thuê khay, thông số vi khí hậu, chính sách bảo hiểm sản lượng và kỹ thuật nuôi cấy.',
      time: 'Vừa xong',
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput("");
    setIsTyping(true);

    // Simulate smart keyword matching
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let matched = BOT_KNOWLEDGE.find((faq) =>
        faq.keywords.some((k) => lower.includes(k.toLowerCase()))
      );

      let reply = matched
        ? matched.answer
        : 'Cảm ơn câu hỏi của bạn. Đội ngũ chuyên gia nông nghiệp công nghệ cao của MushroomCloud sẽ phản hồi chuyên sâu qua hotline 1900-MUSHROOM hoặc kênh chat vận hành viên.';

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full sm:w-[420px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-transform duration-300"
      >
        {/* Header */}
        <div className="bg-[#0D5C3A] text-white p-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-[#D4AF37] flex items-center justify-center text-xl shadow-inner">
              🍄
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#D4AF37] flex items-center gap-2">
                MushroomBot AI
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h3>
              <p className="text-xs text-emerald-100">Cố vấn kỹ thuật nông nghiệp 24/7</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-emerald-900/40 hover:bg-emerald-900 text-white flex items-center justify-center transition"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Suggested Quick Questions */}
        <div className="p-3 bg-emerald-50 dark:bg-slate-800/60 border-b border-emerald-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-[#0D5C3A] dark:text-emerald-400 mb-2">
            Câu hỏi gợi ý nhanh:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-xs bg-white dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-slate-600 transition shadow-xs text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-[#0D5C3A] text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {m.time}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs italic p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
              <span>MushroomBot đang soạn phản hồi...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
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
              placeholder="Hỏi về nấm, vi khí hậu, hợp đồng..."
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D5C3A]"
            />
            <button
              type="submit"
              className="bg-[#0D5C3A] hover:bg-[#0a462c] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition shrink-0"
            >
              Gửi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
