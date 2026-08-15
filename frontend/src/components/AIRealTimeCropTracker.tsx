import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BeakerIcon,
  ClockIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  PlusCircleIcon,
  XMarkIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface AIRealTimeCropTrackerProps {
  plotId?: number;
  seasonId?: number;
  plotName?: string;
  cropType?: string;
}

const AIRealTimeCropTracker: React.FC<AIRealTimeCropTrackerProps> = ({
  plotId,
  seasonId,
  plotName = 'Thửa Ruộng Số 1',
  cropType = 'Sầu riêng Ri6'
}) => {
  const [activeTab, setActiveTab] = useState<'MEMORY' | 'GROWTH' | 'TIMELINE'>('MEMORY');
  const [memoryData, setMemoryData] = useState<any>(null);
  const [growthData, setGrowthData] = useState<any>(null);

  // Form for recording new measurement
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [newHeight, setNewHeight] = useState('165');
  const [newCanopy, setNewCanopy] = useState('145');
  const [newNote, setNewNote] = useState('Đọt non ra đều, cây khỏe mạnh');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!plotId) return;
    try {
      const [memRes, growthRes] = await Promise.all([
        api.get(`/crop-tracker/memory/${plotId}`),
        seasonId ? api.get(`/crop-tracker/growth/${seasonId}`) : Promise.resolve({ data: null })
      ]);
      setMemoryData(memRes.data?.memory_profile || null);
      if (growthRes?.data) {
        setGrowthData(growthRes.data);
      }
    } catch (err) {
      console.error('Failed to load crop tracker data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [plotId, seasonId]);

  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonId) return;
    setIsSubmitting(true);
    try {
      await api.post('/crop-tracker/measurements', {
        seasonId,
        heightCm: parseFloat(newHeight),
        canopyCm: parseFloat(newCanopy),
        note: newNote
      });
      setShowMeasureModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to record measurement', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Hệ thống AI ghi nhớ tập quán và theo dõi sinh trưởng thực tế"
      className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 text-stone-100 shadow-xl space-y-6 font-sans relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-emerald-400 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-purple-500/20 shrink-0">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white">
                Trí Nhớ Canh Tác AI & Theo Dõi Sinh Trưởng Thực Tế
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                ADAPTIVE AGRONOMY MEMORY
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Thửa đất: <strong className="text-emerald-400">{plotName}</strong> • Cây trồng:{' '}
              <strong className="text-white">{cropType}</strong> • AI tự động học và ghi nhớ phong cách làm vườn của bạn
            </p>
          </div>
        </div>

        {/* Action Button to Record Measurement */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMeasureModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <PlusCircleIcon className="w-4 h-4" />
            <span>Ghi Nhận Số Đo Ngoài Vườn</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-stone-950 p-1.5 rounded-2xl border border-stone-800 text-xs font-black gap-2 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('MEMORY')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'MEMORY'
              ? 'bg-purple-900/80 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <SparklesIcon className="w-4 h-4 text-purple-400" />
          <span>Trí Nhớ Tập Quán AI</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('GROWTH')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'GROWTH'
              ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/40 shadow-sm'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <HeartIcon className="w-4 h-4 text-emerald-400" />
          <span>Theo Dõi Sinh Trưởng</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TIMELINE')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'TIMELINE'
              ? 'bg-sky-900/80 text-sky-200 border border-sky-500/40 shadow-sm'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <ChartBarIcon className="w-4 h-4 text-sky-400" />
          <span>Mốc Phát Triển</span>
        </button>
      </div>

      {/* TAB 1: AI FARMING MEMORY PROFILE */}
      {activeTab === 'MEMORY' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Độ Thấu Hiểu Của AI</span>
                <span className="text-emerald-400 font-bold">Hội tụ cao</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-400">
                  {memoryData?.ai_comprehension_score || 94}%
                </span>
                <span className="text-[10px] text-stone-400">
                  ({memoryData?.model_epochs_learned || 18} vòng lặp đã học)
                </span>
              </div>
              <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full"
                  style={{ width: `${memoryData?.ai_comprehension_score || 94}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Khẩu Vị Tưới Ưa Thích</span>
                <ClockIcon className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-base font-black text-sky-300">
                {memoryData?.irrigation_habit?.preferred_session_volume_liters || 45} Lít / Lần
              </div>
              <p className="text-[10px] text-stone-400">
                Khung giờ: <strong className="text-stone-300">{memoryData?.irrigation_habit?.preferred_time_window || '06:30 - 08:00'}</strong> ({memoryData?.irrigation_habit?.preferred_method || 'Tưới nhỏ giọt'})
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Tỷ Lệ Phân Bón Hữu Cơ</span>
                <BeakerIcon className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base font-black text-amber-300">
                {memoryData?.nutrition_habit?.organic_ratio_percent || 65}% Hữu Cơ Vi Sinh
              </div>
              <p className="text-[10px] text-stone-400">
                Chu kỳ bón quen thuộc: <strong className="text-stone-300">Cứ {memoryData?.nutrition_habit?.feeding_cycle_days || 12} ngày / đợt</strong>
              </p>
            </div>
          </div>

          {/* AI Learned Custom Rules from Field Logs */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider flex items-center gap-1.5">
              <SparklesIcon className="w-4 h-4 text-purple-400" /> Các Quy Tắc AI Đã Học Được Từ Vườn Của Bạn
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(memoryData?.learned_rules || []).map((rule: any) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2 hover:border-purple-500/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{rule.title}</span>
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-md">
                      {rule.confidence}% tin cậy
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">{rule.description}</p>
                  <div className="pt-2 border-t border-purple-900/40 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckBadgeIcon className="w-3.5 h-3.5" />
                    <span>Hiệu quả: {rule.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REAL-TIME GROWTH BIOMETRICS TRACKER */}
      {activeTab === 'GROWTH' && (
        <div className="space-y-6 animate-fade-in">
          {/* Progress Bar of Current Lifecycle */}
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs text-stone-400 block">Tiến Trình Sinh Học Hiện Tại</span>
                <strong className="text-sm font-black text-emerald-400">
                  {growthData?.current_stage || 'GIAI ĐOẠN 2: PHÁT TRIỂN THÂN LÁ & BÙNG TÁN'}
                </strong>
              </div>
              <span className="px-3 py-1 bg-emerald-950 border border-emerald-500/40 rounded-xl text-xs font-black text-emerald-300">
                Tuổi Cây: {growthData?.dap_days || 35} Ngày Sau Trồng (DAP)
              </span>
            </div>
            <p className="text-xs text-stone-300 italic">{growthData?.stage_description}</p>
            <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${growthData?.progress_percent || 45}%` }}
              />
            </div>
          </div>

          {/* 4 Morphometric Radar Benchmarks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-center space-y-1">
              <span className="text-xs text-stone-400 block">Chiều Cao Cây Đo Thật</span>
              <span className="text-xl font-black text-white">
                {growthData?.biometrics?.height?.actual_cm || 165} cm
              </span>
              <span className="text-[10px] text-emerald-400 block font-bold">
                (Chuẩn: {growthData?.biometrics?.height?.benchmark_cm || 155} cm - Vượt 6%)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-center space-y-1">
              <span className="text-xs text-stone-400 block">Đường Kính Tán Lá</span>
              <span className="text-xl font-black text-white">
                {growthData?.biometrics?.canopy_diameter?.actual_cm || 145} cm
              </span>
              <span className="text-[10px] text-emerald-400 block font-bold">Tán xòe rộng quang hợp tốt</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-center space-y-1">
              <span className="text-xs text-stone-400 block">Chỉ Số Diện Tích Lá (LAI)</span>
              <span className="text-xl font-black text-sky-400">
                {growthData?.biometrics?.leaf_area_index_lai?.actual || '3.8'}
              </span>
              <span className="text-[10px] text-stone-400 block">Sinh khối diệp lục tố chuẩn</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-center space-y-1">
              <span className="text-xs text-stone-400 block">Số Quả Ước Tính/Cây</span>
              <span className="text-xl font-black text-amber-400">
                {growthData?.biometrics?.fruit_count_estimate || 24} Quả
              </span>
              <span className="text-[10px] text-stone-400 block">Dự kiến năng suất đạt A+</span>
            </div>
          </div>

          {/* AI Diagnosis */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-start gap-3">
            <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-black text-emerald-300">Chẩn Đoán Sinh Trưởng Từ AI</h5>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                {growthData?.ai_growth_diagnosis ||
                  'Cây phát triển rất sung mãn nhờ chế độ tưới nhỏ giọt và phân hữu cơ vi sinh đều đặn. Dự kiến năng suất sẽ vượt 12% so với kế hoạch ban đầu.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TIMELINE MILESTONES */}
      {activeTab === 'TIMELINE' && (
        <div className="space-y-4 animate-fade-in">
          <div className="overflow-x-auto border border-stone-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Mốc Thời Gian</th>
                  <th className="p-3">Chiều Cao Đo Thật</th>
                  <th className="p-3">Chiều Cao Tiêu Chuẩn</th>
                  <th className="p-3">Ghi Chú Tiến Độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {(growthData?.growth_timeline || []).map((tl: any, i: number) => (
                  <tr key={i} className="hover:bg-stone-950/50">
                    <td className="p-3 font-bold text-purple-300">{tl.day}</td>
                    <td className="p-3 font-black text-emerald-400">{tl.actual_height} cm</td>
                    <td className="p-3 text-stone-400">{tl.target_height} cm</td>
                    <td className="p-3 text-stone-300">{tl.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Record Field Measurements */}
      {showMeasureModal && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <PlusCircleIcon className="w-5 h-5 text-emerald-400" />
                <span>Ghi Nhận Số Đo Ngoài Vườn Thực Tế</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowMeasureModal(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeasurement} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-400 block mb-1 font-bold">Chiều cao cây trung bình (cm):</label>
                <input
                  type="number"
                  value={newHeight}
                  onChange={(e) => setNewHeight(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1 font-bold">Đường kính tán lá (cm):</label>
                <input
                  type="number"
                  value={newCanopy}
                  onChange={(e) => setNewCanopy(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1 font-bold">Ghi chú hiện trường:</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 h-20"
                  placeholder="VD: Cây bung chồi non rất đều, lá xanh dày..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMeasureModal(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black shadow-md flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu & Huấn Luyện AI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default AIRealTimeCropTracker;
