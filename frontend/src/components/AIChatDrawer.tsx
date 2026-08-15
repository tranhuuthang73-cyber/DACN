import React, { useState } from 'react';
import {
  SparklesIcon,
  XMarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plotName?: string;
}

const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose, plotName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Xin chào! Tôi là Trợ lý AI Smart Farm. ${plotName ? `Tôi đang theo dõi thửa đất ${plotName}.` : ''} Bạn cần tư vấn về thời tiết, sâu bệnh hay thói quen tưới bón hôm nay?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    '🌤️ Dự báo thời tiết & mưa hôm nay',
    '💧 Khuyên tưới bón theo thói quen',
    '🐛 Cảnh báo rủi ro sâu bệnh',
    '📊 Tối ưu năng suất mùa vụ'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { message: query });
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Xin lỗi, không thể kết nối tới máy chủ AI lúc này. Vui lòng thử lại sau!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Cửa sổ Trợ lý AI Chatbot"
      className="fixed bottom-4 right-4 z-50 w-full max-w-md bg-stone-900/95 text-white backdrop-blur-2xl rounded-3xl shadow-2xl border border-emerald-700/50 flex flex-col h-[520px] overflow-hidden animate-float-none font-sans"
    >
      {/* Drawer Header */}
      <header className="p-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border-b border-emerald-800/40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <SparklesIcon className="w-6 h-6 text-emerald-950 font-bold" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-1.5">
              Trợ lý AI Smart Farm
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-[11px] text-emerald-300 font-medium">Hỏi đáp kỹ thuật & vi khí hậu 24/7</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ chat"
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/80 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <XMarkIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </header>

      {/* Quick Prompts Chips */}
      <div className="p-3 bg-stone-950/80 border-b border-stone-800 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 bg-emerald-950/90 hover:bg-emerald-800 border border-emerald-700/50 text-emerald-200 text-xs font-bold rounded-xl whitespace-nowrap transition-all min-h-[36px] flex items-center shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-medium text-xs sm:text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-none shadow-md'
                  : 'bg-stone-800/90 text-stone-100 border border-stone-700/80 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-stone-500 font-bold mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold p-2">
            <SparklesIcon className="w-4 h-4 animate-spin" />
            <span>AI đang suy nghĩ câu trả lời...</span>
          </div>
        )}
      </div>

      {/* Footer Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-stone-950 border-t border-stone-800 flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Nhập câu hỏi nông nghiệp..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shadow-md"
        >
          <PaperAirplaneIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </form>
    </aside>
  );
};

export default AIChatDrawer;
