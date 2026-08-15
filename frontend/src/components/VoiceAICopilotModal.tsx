import React, { useState, useEffect, useRef } from 'react';
import {
  MicrophoneIcon,
  XMarkIcon,
  SparklesIcon,
  CheckCircleIcon,
  SpeakerWaveIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface VoiceAICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  plotName?: string;
  seasonId?: number;
  onLogCreated?: () => void;
}

const VoiceAICopilotModal: React.FC<VoiceAICopilotModalProps> = ({
  isOpen,
  onClose,
  plotName = 'Thửa Ruộng Số 1',
  seasonId,
  onLogCreated
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [parsedIntent, setParsedIntent] = useState<any | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Vui lòng cấp quyền Micro trên trình duyệt để sử dụng giọng nói.');
        } else {
          setSpeechError(`Lỗi nhận diện âm thanh: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechError('Trình duyệt của bạn chưa hỗ trợ Web Speech API. Bạn có thể gõ lệnh trực tiếp.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    setAiResponse(null);
    setParsedIntent(null);
    setSpeechError(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Recognition start error', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSendVoiceCommand = async (textToSend?: string) => {
    const text = textToSend || transcript;
    if (!text.trim()) return;

    setIsProcessing(true);
    setSpeechError(null);

    try {
      const res = await api.post('/expert/voice-command', {
        transcript: text,
        seasonId: seasonId
      });

      setAiResponse(res.data.ai_voice_response);
      setParsedIntent(res.data.interpreted_intent);

      // Play Text-to-Speech in Vietnamese
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(res.data.ai_voice_response);
        utterance.lang = 'vi-VN';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }

      if (onLogCreated) {
        onLogCreated();
      }
    } catch (err: any) {
      setSpeechError(err.response?.data?.error || 'Có lỗi xảy ra khi xử lý giọng nói.');
    } finally {
      setIsProcessing(false);
    }
  };

  const quickSamples = [
    'Vừa tưới 40 lít nước vào gốc',
    'Bón 25 kg phân hữu cơ vi sinh',
    'Phun thuốc sinh học trừ rầy nâu',
    'Hôm nay trời có mưa không?'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div className="bg-stone-900 border border-emerald-500/50 rounded-3xl max-w-lg w-full p-6 text-stone-100 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-emerald-500/30">
              <MicrophoneIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Trợ Lý Nông Nghiệp Giọng Nói AI
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  VOICE COPILOT
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Nói tự nhiên để AI ghi nhật ký & trả lời • Áp dụng cho: <strong>{plotName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Central Interactive Voice Orb */}
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-rose-500 text-white ring-8 ring-rose-500/30 animate-pulse scale-110 shadow-rose-500/50'
                : 'bg-gradient-to-tr from-emerald-500 to-teal-500 hover:scale-105 text-stone-950 shadow-emerald-500/40'
            }`}
          >
            <MicrophoneIcon className="w-10 h-10" />
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600"></span>
              </span>
            )}
          </button>

          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              {isListening ? '🎙️ Đang lắng nghe giọng nói của bạn...' : 'Bấm vào Micro để bắt đầu nói'}
            </span>
            <p className="text-[11px] text-stone-400">
              Ví dụ: "Tưới 50 lít nước cho vườn", "Bón 20kg phân Kali"...
            </p>
          </div>
        </div>

        {/* Live Audio Transcript Box */}
        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400 font-bold">
            <span>Nội dung nhận diện:</span>
            {transcript && (
              <button
                type="button"
                onClick={() => setTranscript('')}
                className="text-stone-500 hover:text-stone-300"
              >
                Xóa
              </button>
            )}
          </div>
          <textarea
            rows={2}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Giọng nói của bạn sẽ hiển thị ở đây hoặc bạn có thể gõ trực tiếp..."
            className="w-full bg-transparent border-0 text-stone-100 text-sm font-medium focus:ring-0 resize-none outline-none"
          />

          <div className="flex justify-end pt-2 border-t border-stone-800">
            <button
              type="button"
              disabled={!transcript.trim() || isProcessing}
              onClick={() => handleSendVoiceCommand()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
            >
              {isProcessing ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
              <span>{isProcessing ? 'Đang phân tích AI...' : 'Xác Nhận & Ghi Nhật Ký'}</span>
            </button>
          </div>
        </div>

        {/* AI Voice Feedback Banner */}
        {aiResponse && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-500/60 rounded-2xl space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-black">
              <SpeakerWaveIcon className="w-4 h-4" />
              <span>Phản Hồi Từ Trợ Lý AI:</span>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">"{aiResponse}"</p>

            {parsedIntent?.created_log && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1">
                <CheckCircleIcon className="w-4 h-4 shrink-0" />
                <span>Đã lưu thành công vào Cơ sở dữ liệu canh tác VietGAP!</span>
              </div>
            )}
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-bold">
            ⚠️ {speechError}
          </div>
        )}

        {/* Quick Sample Prompts */}
        <div className="space-y-2 pt-1 border-t border-stone-800">
          <span className="text-[11px] font-bold text-stone-400 uppercase">Mẫu câu lệnh thông dụng:</span>
          <div className="flex flex-wrap gap-2">
            {quickSamples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTranscript(sample);
                  handleSendVoiceCommand(sample);
                }}
                className="px-2.5 py-1 bg-stone-800/80 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium border border-stone-700 transition-all"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAICopilotModal;
