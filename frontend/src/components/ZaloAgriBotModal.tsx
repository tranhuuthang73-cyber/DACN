import React, { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface ZaloAgriBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  plotId?: number;
  seasonId?: number;
  plotName?: string;
  cropType?: string;
}

interface ZaloChatMessage {
  id: string;
  sender: 'OA' | 'USER';
  text: string;
  time: string;
  quickActions?: string[];
}

const ZaloAgriBotModal: React.FC<ZaloAgriBotModalProps> = ({
  isOpen,
  onClose,
  plotId = 1,
  seasonId = 1,
  plotName = 'Thửa Cam A1',
  cropType = 'Cam sành'
}) => {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'ZNS_CARD' | 'QR_CONFIG'>('CHAT');
  const [messages, setMessages] = useState<ZaloChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // ZNS Daily Card State
  const [znsData, setZnsData] = useState<any>(null);
  const [znsLoading, setZnsLoading] = useState(false);
  const [sendZnsStatus, setSendZnsStatus] = useState<string | null>(null);

  // Zalo Config State
  const [oaId, setOaId] = useState('38294719284729184');
  const [appId, setAppId] = useState('4820193847291');
  const [phoneNumber, setPhoneNumber] = useState('0912345678');
  const [autoZns, setAutoZns] = useState(true);
  const [znsTime, setZnsTime] = useState('06:30');
  const [salinityPush, setSalinityPush] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      loadDailyZNS();
      if (messages.length === 0) {
        setMessages([
          {
            id: '1',
            sender: 'OA',
            text: `👋 **Dạ em chào anh Thắng!** Em là **Trợ lý Zalo OA Nông Nghiệp Thông Minh**.\n\nEm giúp anh theo dõi cảm biến đất, tự động kích hoạt máy bơm tưới nước từ xa và cập nhật giá nông sản mỗi ngày qua Zalo. Anh chọn nhanh các tính năng bên dưới hoặc gõ tin nhắn bất kỳ nhé! 🍊🌿`,
            time: '06:30',
            quickActions: ['💧 Bơm tưới 40L', '📊 Cảm biến đất', '🍈 Giá sầu riêng', '☀️ Dự báo thời tiết']
          }
        ]);
      }
    }
  }, [isOpen, plotId]);

  const loadDailyZNS = async () => {
    setZnsLoading(true);
    try {
      const res = await api.get(`/zalo-bot/daily-zns/${plotId}`);
      setZnsData(res.data.zns_card || null);
    } catch (err) {
      console.error('Failed to load Zalo ZNS card', err);
    } finally {
      setZnsLoading(false);
    }
  };

  const handleSendMessage = async (msgText: string) => {
    const text = msgText.trim();
    if (!text) return;

    const userMsg: ZaloChatMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      text: text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await api.post('/zalo-bot/chat', {
        message: text,
        plotId,
        seasonId
      });

      setTimeout(() => {
        setIsTyping(false);
        const oaMsg: ZaloChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'OA',
          text: res.data.reply || 'Dạ em đã nhận tin nhắn!',
          time: res.data.sent_time || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          quickActions: res.data.quick_actions || []
        };
        setMessages((prev) => [...prev, oaMsg]);
      }, 400);
    } catch (err) {
      setIsTyping(false);
      console.error('Failed to send Zalo chat message', err);
    }
  };

  const handleSendTestZNS = async () => {
    setSendZnsStatus('SENDING');
    try {
      await api.post('/zalo-bot/send-zns', {
        phone: phoneNumber,
        message: `🌾 [ZALO OA] Bản tin canh tác ${plotName} (${cropType}) đã được gửi đến số điện thoại ${phoneNumber}.`,
        templateId: 'ZNS_AGRI_DAILY_01'
      });
      setSendZnsStatus('SUCCESS');
      setTimeout(() => setSendZnsStatus(null), 4000);
    } catch (err) {
      setSendZnsStatus('ERROR');
      setTimeout(() => setSendZnsStatus(null), 4000);
    }
  };

  const playSimulatedVoice = () => {
    setIsPlayingAudio(true);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Chào anh Thắng! Bản tin Zalo sáng nay: Vườn ${plotName} trồng ${cropType}, vi khí hậu ba mươi hai độ năm, độ ẩm sáu mươi lăm phần trăm. Chỉ số quang hợp lý tưởng, hệ thống đã tưới bốn mươi lăm lít nước!`
      );
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in font-sans">
      <div className="bg-stone-900 border border-blue-500/40 text-stone-100 rounded-3xl max-w-2xl w-full h-[88vh] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Zalo Top Brand Header */}
        <div className="p-3.5 sm:p-4 border-b border-stone-800 bg-[#0068FF] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md">
                <span className="font-black text-[#0068FF] text-xl tracking-tighter">Zalo</span>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 border-2 border-[#0068FF] rounded-full flex items-center justify-center text-[9px] text-stone-950 font-bold" title="Tài khoản Doanh Nghiệp Xác Thực">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-black text-white">Smart Farm Zalo Official Account</h3>
              </div>
              <p className="text-[11px] text-blue-100 flex items-center gap-1">
                <span>📍 {plotName} • {cropType}</span>
                <span>• 🟢 Đang hoạt động</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-stone-950 p-1.5 border-b border-stone-800 text-xs font-black">
          <button
            type="button"
            onClick={() => setActiveTab('CHAT')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'CHAT' ? 'bg-[#0068FF] text-white shadow-md' : 'text-stone-400 hover:text-white'
            }`}
          >
            <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
            <span>Chat Zalo OA</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ZNS_CARD')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ZNS_CARD' ? 'bg-[#0068FF] text-white shadow-md' : 'text-stone-400 hover:text-white'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Thẻ Tin Zalo ZNS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('QR_CONFIG')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'QR_CONFIG' ? 'bg-[#0068FF] text-white shadow-md' : 'text-stone-400 hover:text-white'
            }`}
          >
            <QrCodeIcon className="w-4 h-4" />
            <span>Quét Mã & Cấu Hình</span>
          </button>
        </div>

        {/* TAB 1: ZALO OA CHAT SIMULATOR */}
        {activeTab === 'CHAT' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#0d141e]">
            {/* Audio Voice Briefing Banner */}
            <div className="bg-[#0068FF]/15 border-b border-[#0068FF]/30 px-4 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-300">
                <SpeakerWaveIcon className="w-4 h-4 animate-pulse" />
                <span className="text-[11px] font-bold">Giọng nói trợ lý canh tác buổi sáng</span>
              </div>
              <button
                type="button"
                onClick={playSimulatedVoice}
                className="px-3 py-1 bg-[#0068FF] hover:bg-blue-600 text-white rounded-lg font-black text-[10px] flex items-center gap-1 shadow transition-all active:scale-95"
              >
                {isPlayingAudio ? '🔊 Đang đọc bản tin...' : '▶ Nghe Zalo Audio'}
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1.5 shadow-md ${
                      msg.sender === 'USER'
                        ? 'bg-[#0068FF] text-white rounded-br-none'
                        : 'bg-stone-900 border border-stone-800 text-stone-100 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    <div className="text-[9px] text-right text-stone-400">{msg.time}</div>
                  </div>

                  {/* Dynamic Action Buttons sent by Zalo OA */}
                  {msg.sender === 'OA' && msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                      {msg.quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(action)}
                          className="px-2.5 py-1 bg-stone-800/90 hover:bg-[#0068FF] hover:text-white text-blue-300 rounded-xl text-[10px] font-bold border border-stone-700 transition-all shadow-sm active:scale-95"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-stone-900 border border-stone-800 p-3 rounded-2xl rounded-bl-none text-xs text-stone-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#0068FF] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#0068FF] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#0068FF] rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] ml-1 text-blue-300">Zalo OA đang soạn câu trả lời...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Zalo Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 border-t border-stone-800 bg-stone-950 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhắn tin cho Zalo OA (VD: Bơm 50L nước, Giá sầu riêng, Cảm biến)..."
                className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#0068FF]"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#0068FF] hover:bg-blue-600 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: ZALO ZNS NOTIFICATION TEMPLATE CARD */}
        {activeTab === 'ZNS_CARD' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-950/60">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <DevicePhoneMobileIcon className="w-5 h-5 text-[#0068FF]" />
                  <span>Mẫu Thẻ Thông Báo Zalo ZNS (Zalo Notification Service)</span>
                </h4>
                <p className="text-xs text-stone-400">
                  Thông báo chính thức được gửi trực tiếp vào ứng dụng Zalo cá nhân của nông dân lúc 06:30 sáng
                </p>
              </div>
              <button
                type="button"
                onClick={loadDailyZNS}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-bold"
              >
                <ArrowPathIcon className={`w-4 h-4 ${znsLoading ? 'animate-spin' : ''}`} />
                <span>Cập nhật</span>
              </button>
            </div>

            {/* Authentic Zalo ZNS Message Card */}
            {znsData ? (
              <div className="max-w-md mx-auto bg-stone-900 border-2 border-blue-500/40 rounded-3xl overflow-hidden shadow-2xl">
                {/* ZNS Header */}
                <div className="bg-gradient-to-r from-[#0068FF] to-blue-700 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">ZALO ZNS VIETGAP</span>
                    <span className="text-[10px] text-blue-200">{znsData.date_string}</span>
                  </div>
                  <h5 className="font-black text-sm mt-2">{znsData.title}</h5>
                  <p className="text-xs text-blue-100 mt-0.5">Thửa: {znsData.plot_name} • {znsData.crop_type}</p>
                </div>

                {/* ZNS Body Key-Value Table */}
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">🌡️ Vi khí hậu vệ tinh:</span>
                    <span className="font-bold text-white text-right">{znsData.weather}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">🌫️ Áp suất lá VPD:</span>
                    <span className="font-bold text-emerald-400 text-right">{znsData.vpd_status}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">💧 Thủy lợi tự động:</span>
                    <span className="font-bold text-sky-400 text-right">{znsData.irrigation_plan}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">🌊 Độ mặn sông Tiền:</span>
                    <span className="font-bold text-teal-300 text-right">{znsData.river_salinity}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-800 pb-2">
                    <span className="text-stone-400">🍈 Điểm tin giá cả:</span>
                    <span className="font-bold text-amber-300 text-right">{znsData.market_highlight}</span>
                  </div>

                  <div className="pt-2 p-3 bg-stone-950 rounded-2xl border border-stone-800">
                    <strong className="text-amber-400 block mb-1">💡 Lời khuyên chuyên gia hôm nay:</strong>
                    <p className="text-stone-300 text-[11px] leading-relaxed">{znsData.advice}</p>
                  </div>
                </div>

                {/* ZNS Action Button */}
                <div className="p-3 bg-stone-950 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => handleSendMessage('Đã xem bản tin Zalo')}
                    className="w-full py-2.5 bg-[#0068FF] hover:bg-blue-600 text-white rounded-xl font-black text-xs shadow-md transition-all active:scale-95"
                  >
                    Xác Nhận Đã Nhận Bản Tin Qua Zalo
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400 text-center py-8">Đang tải thẻ Zalo ZNS...</p>
            )}

            {/* Test Dispatch Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-bold">Số điện thoại nhận:</span>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white w-32 text-center font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestZNS}
                className="px-5 py-2.5 bg-gradient-to-r from-[#0068FF] to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95"
              >
                <DevicePhoneMobileIcon className="w-4 h-4" />
                <span>Gửi Thử Thẻ ZNS Đến Zalo Cá Nhân</span>
              </button>
            </div>

            {sendZnsStatus === 'SENDING' && (
              <p className="text-xs text-blue-400 text-center animate-pulse font-bold">Đang phát tín hiệu Zalo ZNS API...</p>
            )}
            {sendZnsStatus === 'SUCCESS' && (
              <p className="text-xs text-emerald-400 text-center font-bold">✓ Đã chuyển phát thẻ Zalo ZNS đến {phoneNumber} thành công!</p>
            )}
          </div>
        )}

        {/* TAB 3: QR CODE & ZALO OA CONFIGURATION */}
        {activeTab === 'QR_CONFIG' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs bg-stone-950/60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* QR Code Card */}
              <div className="bg-stone-900 border border-blue-500/40 p-5 rounded-3xl flex flex-col items-center text-center space-y-3 shadow-xl">
                <span className="text-xs font-black text-white uppercase tracking-wider">QUÉT MÃ QR THEO DÕI ZALO OA</span>
                <div className="w-44 h-44 bg-white rounded-2xl p-2.5 flex items-center justify-center shadow-lg border-4 border-[#0068FF]">
                  {/* Visual SVG QR Code */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="0" y="0" width="30" height="30" fill="#0068FF" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="9" y="9" width="12" height="12" fill="#0068FF" />

                    <rect x="70" y="0" width="30" height="30" fill="#0068FF" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="79" y="9" width="12" height="12" fill="#0068FF" />

                    <rect x="0" y="70" width="30" height="30" fill="#0068FF" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="9" y="79" width="12" height="12" fill="#0068FF" />

                    {/* Pattern noise */}
                    <rect x="35" y="10" width="8" height="8" fill="#0068FF" />
                    <rect x="48" y="10" width="8" height="8" fill="#0068FF" />
                    <rect x="35" y="25" width="8" height="8" fill="#0068FF" />
                    <rect x="48" y="35" width="15" height="8" fill="#0068FF" />
                    <rect x="10" y="45" width="8" height="8" fill="#0068FF" />
                    <rect x="25" y="45" width="8" height="15" fill="#0068FF" />
                    <rect x="40" y="50" width="20" height="10" fill="#0068FF" />
                    <rect x="70" y="45" width="10" height="20" fill="#0068FF" />
                    <rect x="40" y="70" width="10" height="15" fill="#0068FF" />
                    <rect x="60" y="75" width="25" height="10" fill="#0068FF" />
                    <circle cx="50" cy="50" r="6" fill="#0068FF" />
                  </svg>
                </div>
                <p className="text-[11px] text-stone-300">
                  Mở ứng dụng <strong>Zalo</strong> trên điện thoại $\rightarrow$ Chọn biểu tượng <strong>Quét mã QR</strong> để kết nối trực tiếp với Vườn của bạn.
                </p>
              </div>

              {/* Zalo OA Secret Keys Form */}
              <div className="space-y-3.5">
                <div>
                  <label className="text-stone-400 block mb-1 font-bold">Zalo OA ID (Official Account):</label>
                  <input
                    type="text"
                    value={oaId}
                    onChange={(e) => setOaId(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#0068FF]"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1 font-bold">Zalo App ID (Open API):</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#0068FF]"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1 font-bold">Giờ gửi bản tin sáng tự động:</label>
                  <input
                    type="time"
                    value={znsTime}
                    onChange={(e) => setZnsTime(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#0068FF]"
                  />
                </div>
              </div>
            </div>

            {/* Automation Switches */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-900 border border-stone-800">
                <div className="flex items-center gap-2.5">
                  <ClockIcon className="w-5 h-5 text-amber-400" />
                  <div>
                    <strong className="text-white block">Tự động gửi thẻ Zalo ZNS mỗi {znsTime} sáng</strong>
                    <span className="text-[10px] text-stone-400">Bao gồm thời tiết vệ tinh, VPD khí khổng và lịch tưới</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoZns}
                  onChange={(e) => setAutoZns(e.target.checked)}
                  className="w-5 h-5 accent-[#0068FF] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-900 border border-stone-800">
                <div className="flex items-center gap-2.5">
                  <CheckBadgeIcon className="w-5 h-5 text-rose-400" />
                  <div>
                    <strong className="text-white block">Khẩn cấp: Bắn tin Zalo khi Độ mặn sông &gt; 1.0‰</strong>
                    <span className="text-[10px] text-stone-400">Cảnh báo đóng cống ngăn mặn ngay tức thì</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={salinityPush}
                  onChange={(e) => setSalinityPush(e.target.checked)}
                  className="w-5 h-5 accent-[#0068FF] rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSendTestZNS}
                className="px-6 py-2.5 bg-[#0068FF] hover:bg-blue-600 text-white rounded-xl font-black shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <CheckBadgeIcon className="w-4 h-4" />
                <span>Lưu Cấu Hình & Kích Hoạt Zalo OA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZaloAgriBotModal;
