import React, { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ClockIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface TelegramAgriBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  plotId?: number;
  seasonId?: number;
  plotName?: string;
  cropType?: string;
}

interface ChatMessage {
  id: string;
  sender: 'BOT' | 'USER';
  text: string;
  time: string;
}

const TelegramAgriBotModal: React.FC<TelegramAgriBotModalProps> = ({
  isOpen,
  onClose,
  plotId = 1,
  seasonId = 1,
  plotName = 'Thửa Cam A1',
  cropType = 'Cam sành'
}) => {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'CONFIG' | 'BRIEFING'>('CHAT');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Config State
  const [botToken, setBotToken] = useState('7483920194:AAHq_smart_farm_live_bot_token');
  const [chatId, setChatId] = useState('-100234567890');
  const [autoBriefing, setAutoBriefing] = useState(true);
  const [briefingTime, setBriefingTime] = useState('06:30');
  const [salinityPush, setSalinityPush] = useState(true);
  const [testSendStatus, setTestSendStatus] = useState<string | null>(null);

  // Daily Briefing State
  const [dailyBriefingText, setDailyBriefingText] = useState<string>('');
  const [briefingLoading, setBriefingLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load initial daily briefing and greetings
  useEffect(() => {
    if (isOpen) {
      loadBriefing();
      if (messages.length === 0) {
        setMessages([
          {
            id: '1',
            sender: 'BOT',
            text: `👋 Chào anh Thắng! Em là **Smart Farm AI Assistant** trên Telegram/Zalo.\n\nEm giúp anh theo dõi cảm biến, ra lệnh tưới nước từ xa và nhận báo cáo thời tiết 24/7. Anh có thể bấm các nút lệnh nhanh bên dưới để thử nhé! 🍊🌿`,
            time: '06:30'
          }
        ]);
      }
    }
  }, [isOpen, plotId]);

  const loadBriefing = async () => {
    setBriefingLoading(true);
    try {
      const res = await api.get(`/telegram-bot/daily-briefing/${plotId}`);
      setDailyBriefingText(res.data.briefing_text || '');
    } catch (err) {
      console.error('Failed to load daily briefing', err);
    } finally {
      setBriefingLoading(false);
    }
  };

  const handleSendCommand = async (cmdText: string) => {
    const userCmd = cmdText.trim();
    if (!userCmd) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      text: userCmd,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await api.post('/telegram-bot/command', {
        command: userCmd,
        plotId,
        seasonId
      });

      setTimeout(() => {
        setIsTyping(false);
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'BOT',
          text: res.data.bot_reply || 'Đã nhận lệnh!',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 500);
    } catch (err) {
      setIsTyping(false);
      console.error('Failed to execute bot command', err);
    }
  };

  const handleSendLiveTestMessage = async () => {
    setTestSendStatus('SENDING');
    try {
      await api.post('/telegram-bot/send-alert', {
        message: dailyBriefingText || `🌾 [SMART FARM BOT] Thông báo canh tác: ${plotName} (${cropType}) kết nối thành công!`,
        token: botToken,
        chatId: chatId
      });
      setTestSendStatus('SUCCESS');
      setTimeout(() => setTestSendStatus(null), 4000);
    } catch (err) {
      setTestSendStatus('ERROR');
      setTimeout(() => setTestSendStatus(null), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div className="bg-stone-900 border border-sky-500/40 text-stone-100 rounded-3xl max-w-2xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Smart Farm Telegram & Zalo Assistant</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs text-stone-400">
                Trợ lý Bot tự động hóa báo cáo canh tác & điều khiển tưới bón 24/7
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-stone-950 p-1 border-b border-stone-800 text-xs font-black">
          <button
            type="button"
            onClick={() => setActiveTab('CHAT')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'CHAT' ? 'bg-sky-600 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>Phòng Chat Mô Phỏng</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BRIEFING')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'BRIEFING' ? 'bg-sky-600 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Báo Cáo Sáng (06:30)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CONFIG')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'CONFIG' ? 'bg-sky-600 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Cog6ToothIcon className="w-4 h-4" />
            <span>Cấu Hình Bot Thật</span>
          </button>
        </div>

        {/* TAB 1: CHAT SIMULATOR */}
        {activeTab === 'CHAT' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-stone-950/50">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 shadow-md ${
                      msg.sender === 'USER'
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none'
                        : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">{msg.text}</div>
                    <div className="text-[9px] text-right text-stone-400">{msg.time}</div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-stone-900 border border-stone-800 p-3 rounded-2xl rounded-bl-none text-xs text-stone-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] ml-1">Bot đang nhập câu trả lời...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="p-2 border-t border-stone-800 bg-stone-900/80 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
              <span className="text-[10px] text-stone-500 uppercase shrink-0 px-1">Lệnh nhanh:</span>
              <button
                type="button"
                onClick={() => handleSendCommand('/status')}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-sky-300 rounded-lg shrink-0 border border-stone-700"
              >
                /status (Cảm biến)
              </button>
              <button
                type="button"
                onClick={() => handleSendCommand('/water 50')}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-emerald-300 rounded-lg shrink-0 border border-stone-700"
              >
                /water 50 (Tưới 50L)
              </button>
              <button
                type="button"
                onClick={() => handleSendCommand('/market')}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg shrink-0 border border-stone-700"
              >
                /market (Giá nông sản)
              </button>
              <button
                type="button"
                onClick={() => handleSendCommand('/vpd')}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-purple-300 rounded-lg shrink-0 border border-stone-700"
              >
                /vpd (Áp suất lá)
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendCommand(inputValue);
              }}
              className="p-3 border-t border-stone-800 bg-stone-950 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập lệnh điều khiển (VD: /water 40, /status, /market)..."
                className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-md transition-all active:scale-95"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: DAILY BRIEFING PREVIEW */}
        {activeTab === 'BRIEFING' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-amber-400" />
                  <span>Bản Tin Canh Tác Tự Động Buổi Sáng (06:30)</span>
                </h4>
                <p className="text-xs text-stone-400">
                  Nội dung tự động tổng hợp từ Vệ tinh, Động cơ VPD và Lịch tưới để gửi về Telegram/Zalo của bạn
                </p>
              </div>
              <button
                type="button"
                onClick={loadBriefing}
                className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-bold"
              >
                <ArrowPathIcon className={`w-4 h-4 ${briefingLoading ? 'animate-spin' : ''}`} />
                <span>Tạo lại bản tin</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 font-mono text-xs text-stone-200 whitespace-pre-line leading-relaxed">
              {dailyBriefingText || 'Đang tải bản tin sáng...'}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSendLiveTestMessage}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                <span>Gửi Bản Tin Này Đến Telegram Thật</span>
              </button>
            </div>

            {testSendStatus === 'SENDING' && (
              <p className="text-xs text-sky-400 text-center animate-pulse">Đang gửi tín hiệu Webhook...</p>
            )}
            {testSendStatus === 'SUCCESS' && (
              <p className="text-xs text-emerald-400 text-center font-bold">✓ Đã gửi tin nhắn tới Telegram thành công!</p>
            )}
          </div>
        )}

        {/* TAB 3: BOT CONFIGURATION */}
        {activeTab === 'CONFIG' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            <div className="border-b border-stone-800 pb-3">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Cog6ToothIcon className="w-5 h-5 text-sky-400" />
                <span>Cấu Hình Kết Nối Telegram Bot API Thật</span>
              </h4>
              <p className="text-xs text-stone-400">
                Nhập Bot Token từ @BotFather và Chat ID của bạn để kích hoạt thông báo thời gian thực ngoài đời thực
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-stone-400 block mb-1 font-bold">Telegram Bot Token:</label>
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-sky-500"
                  placeholder="VD: 7483920194:AAHq..."
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1 font-bold">Telegram Chat ID / Channel ID:</label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-sky-500 mb-3"
                  placeholder="VD: -100234567890"
                />
                <label className="text-stone-400 block mb-1 font-bold">Giờ gửi báo cáo tự động:</label>
                <input
                  type="time"
                  value={briefingTime}
                  onChange={(e) => setBriefingTime(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-sky-500 mb-3"
                />
              </div>

              {/* Automation Switches */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-950 border border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <ClockIcon className="w-5 h-5 text-amber-400" />
                    <div>
                      <strong className="text-white block">Tự động gửi bản tin lúc {briefingTime} sáng ({plotName} - {cropType})</strong>
                      <span className="text-[10px] text-stone-400">Dự báo thời tiết & lịch tưới tự động</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoBriefing}
                    onChange={(e) => setAutoBriefing(e.target.checked)}
                    className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-950 border border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <CheckBadgeIcon className="w-5 h-5 text-rose-400" />
                    <div>
                      <strong className="text-white block">Cảnh báo Hạn mặn & Dông lốc khẩn cấp</strong>
                      <span className="text-[10px] text-stone-400">Bắn tin nhắn ngay khi độ mặn vượt 1.0‰</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={salinityPush}
                    onChange={(e) => setSalinityPush(e.target.checked)}
                    className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSendLiveTestMessage}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black shadow-md flex items-center gap-1.5"
                >
                  <CheckBadgeIcon className="w-4 h-4" />
                  <span>Lưu & Gửi Tin Nhắn Thử Nghiệm</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelegramAgriBotModal;
