import React, { useState, useEffect } from 'react';
import {
  MapPinIcon,
  PlusIcon,
  SparklesIcon,
  InformationCircleIcon,
  CheckIcon,
  XMarkIcon,
  PencilSquareIcon,
  BeakerIcon,
  QrCodeIcon,
  MicrophoneIcon,
  BellIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import api from '../api';
import CropDoctorModal from '../components/CropDoctorModal';
import IoTGaugeCard from '../components/IoTGaugeCard';
import FarmGISMap from '../components/FarmGISMap';
import TraceabilityModal from '../components/TraceabilityModal';
import PlotWeatherForecastCard from '../components/PlotWeatherForecastCard';
import Plot3DDigitalTwin from '../components/Plot3DDigitalTwin';
import VoiceAICopilotModal from '../components/VoiceAICopilotModal';
import AgronomyExpertOptimizer from '../components/AgronomyExpertOptimizer';
import NotificationCenterDrawer from '../components/NotificationCenterDrawer';
import VietGAPDossierModal from '../components/VietGAPDossierModal';
import AIRealTimeCropTracker from '../components/AIRealTimeCropTracker';
import CropPhysiologyVPDStudio from '../components/CropPhysiologyVPDStudio';
import ZaloAgriBotModal from '../components/ZaloAgriBotModal';
import PlotCreationLocationAdvisorModal from '../components/PlotCreationLocationAdvisorModal';
import HarvestSettlementModal from '../components/HarvestSettlementModal';
import { BanknotesIcon } from '@heroicons/react/24/outline';

interface DashboardProps {
  plots: any[];
  selectedPlot: any;
  onPlotSelect: (plot: any) => void;
  onRefreshPlots: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ plots, selectedPlot, onPlotSelect, onRefreshPlots }) => {
  const [activeSeason, setActiveSeason] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [plotTelemetry, setPlotTelemetry] = useState<any>(null);

  // Modals state
  const [isCropDoctorOpen, setIsCropDoctorOpen] = useState(false);
  const [isTraceabilityOpen, setIsTraceabilityOpen] = useState(false);
  const [isVoiceCopilotOpen, setIsVoiceCopilotOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isTelegramBotOpen, setIsTelegramBotOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);

  // Forms state
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logType, setLogType] = useState('WATER');
  const [logAmount, setLogAmount] = useState('');
  const [logMethod, setLogMethod] = useState('');
  const [logNote, setLogNote] = useState('');

  const fetchTelemetry = async (plotId: number) => {
    try {
      const { data } = await api.get(`/iot/telemetry/${plotId}`);
      setPlotTelemetry(data.telemetry);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectPlot = async (plot: any) => {
    onPlotSelect(plot);
    fetchTelemetry(plot.id);
    try {
      const { data: seasonData } = await api.get(`/seasons/plot/${plot.id}`);
      if (seasonData.length > 0) {
        setActiveSeason(seasonData[0]);
        fetchLogsAndRecs(seasonData[0].id);
      } else {
        setActiveSeason(null);
        setRecommendations([]);
        setLogs([]);
      }
    } catch (e) {
      setActiveSeason(null);
    }
  };

  const fetchLogsAndRecs = async (seasonId: number) => {
    try {
      const [{ data: logsData }, { data: recData }] = await Promise.all([
        api.get(`/logs/season/${seasonId}`),
        api.get(`/ai/recommendations/${seasonId}`)
      ]);
      setLogs(logsData);
      setRecommendations(recData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedPlot) {
      handleSelectPlot(selectedPlot);
    }
  }, [selectedPlot?.id]);

  const handleCreateSeasonQuick = async () => {
    if (!selectedPlot) return;
    try {
      await api.post('/seasons', {
        plot_id: selectedPlot.id,
        crop_type: 'Cây trồng mới',
        planted_date: new Date().toISOString(),
        target_yield: 4000
      });
      handleSelectPlot(selectedPlot);
    } catch (err) {
      alert('Lỗi tạo mùa vụ');
    }
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeason) return;
    try {
      await api.post('/logs', {
        season_id: activeSeason.id,
        type: logType,
        amount: parseFloat(logAmount) || 0,
        unit: logType === 'WATER' ? 'Lít' : logType === 'FERTILIZER' ? 'kg' : 'lần',
        method: logMethod || null,
        note: logNote || null
      });
      setShowLogForm(false);
      setLogAmount('');
      setLogMethod('');
      setLogNote('');
      fetchLogsAndRecs(activeSeason.id);
      if (selectedPlot) fetchTelemetry(selectedPlot.id);
    } catch (err) {
      alert('Lỗi ghi nhật ký');
    }
  };

  const handleFeedback = async (recId: number, action: string, actualValue?: number) => {
    try {
      await api.post(`/ai/feedback/${recId}`, { action, actual_value: actualValue });
      alert(`Đã phản hồi [${action}]! Mô hình AI SGD đã ghi nhận để học tăng cường.`);
      fetchLogsAndRecs(activeSeason.id);
    } catch (err) {
      alert('Lỗi gửi phản hồi');
    }
  };

  const chartData = logs
    .map((l) => ({
      date: new Date(l.logged_at).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' }),
      amount: l.amount
    }))
    .reverse();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-stone-50 text-stone-800 flex flex-col md:flex-row font-sans">
      {/* Friendly Light Sidebar */}
      <aside aria-label="Danh sách thửa đất" className="w-full md:w-80 bg-white p-6 flex flex-col shrink-0 border-r border-emerald-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs uppercase text-emerald-800 font-black tracking-widest">Thửa đất của tôi</h2>
          <span className="badge-emerald">{plots.length} thửa</span>
        </div>

        <nav aria-label="Thửa đất" className="flex-1 space-y-2.5 overflow-y-auto pr-1">
          {plots.map((plot) => (
            <button
              key={plot.id}
              type="button"
              onClick={() => handleSelectPlot(plot)}
              aria-current={selectedPlot?.id === plot.id ? 'true' : 'false'}
              className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all duration-200 min-h-[48px] ${
                selectedPlot?.id === plot.id
                  ? 'bg-emerald-700 text-white shadow-md font-extrabold'
                  : 'hover:bg-emerald-50 text-stone-700 font-semibold border border-transparent hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <MapPinIcon className={`w-5 h-5 shrink-0 ${selectedPlot?.id === plot.id ? 'text-amber-300' : 'text-emerald-600'}`} aria-hidden="true" />
                <span className="truncate">{plot.name}</span>
              </div>
              <span className={`text-xs font-bold opacity-90 shrink-0 px-2.5 py-1 rounded-lg ${selectedPlot?.id === plot.id ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-700'}`}>
                {plot.area_m2} m²
              </span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowPlotForm(true)}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-emerald-300 text-emerald-800 rounded-2xl hover:bg-emerald-50 font-extrabold transition-all duration-200 min-h-[48px] text-xs sm:text-sm"
          >
            <PlusIcon className="w-5 h-5" aria-hidden="true" />
            <span>Thêm thửa đất mới</span>
          </button>
        </nav>
      </aside>

      {/* Main Workspace */}
      <section aria-labelledby="dashboard-heading" className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto">
        {selectedPlot ? (
          <>
            {/* Header Banner & Super Action Toolbar */}
            <header className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 id="dashboard-heading" className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
                    {selectedPlot.name}
                  </h1>
                  <span className="badge-emerald">{selectedPlot.soil_type || 'Đất phù sa'}</span>
                  <span className="badge-amber">🧠 AI SGD v3 (Tự Thích Nghi)</span>
                  <span className="badge-purple">🛰️ 3D Digital Twin Active</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-500 font-medium mt-2">
                  Diện tích: <strong className="text-stone-900">{selectedPlot.area_m2} m²</strong> • Vụ mùa hiện tại:{' '}
                  <strong className="text-emerald-800 font-extrabold">{activeSeason ? activeSeason.crop_type : 'Chưa khởi tạo'}</strong>
                </p>
              </div>

              {/* Quick Super Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Emergency Alert Bell */}
                <button
                  type="button"
                  onClick={() => setIsNotificationDrawerOpen(true)}
                  className="px-3.5 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 font-black rounded-2xl border border-amber-400/60 shadow-sm text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 min-h-[48px]"
                  title="Trung tâm cảnh báo sớm hạn mặn & dịch hại"
                >
                  <div className="relative">
                    <BellIcon className="w-5 h-5 text-amber-600 animate-bounce" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                  </div>
                  <span>Cảnh Báo Sớm</span>
                </button>

                {/* Voice Copilot */}
                <button
                  type="button"
                  onClick={() => setIsVoiceCopilotOpen(true)}
                  className="px-3.5 py-3 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white font-black rounded-2xl shadow-md text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 min-h-[48px]"
                >
                  <MicrophoneIcon className="w-5 h-5 text-emerald-200 animate-pulse" />
                  <span>Trợ Lý Giọng Nói</span>
                </button>

                {/* Crop Doctor */}
                <button
                  type="button"
                  onClick={() => setIsCropDoctorOpen(true)}
                  className="px-3.5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black rounded-2xl shadow-md text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 min-h-[48px]"
                >
                  <SparklesIcon className="w-5 h-5 text-amber-300" />
                  <span>Bác Sĩ Cây Trồng</span>
                </button>

                {/* Official Printable VietGAP Dossier */}
                <button
                  type="button"
                  onClick={() => setIsDossierOpen(true)}
                  className="px-3.5 py-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-black rounded-2xl shadow-md text-xs sm:text-sm flex items-center gap-2 border border-emerald-500/50 transition-all active:scale-95 min-h-[48px]"
                >
                  <DocumentTextIcon className="w-5 h-5 text-emerald-400" />
                  <span>Hồ Sơ VietGAP PDF</span>
                </button>

                {/* Zalo OA Official Bot Assistant */}
                <button
                  type="button"
                  onClick={() => setIsTelegramBotOpen(true)}
                  className="px-3.5 py-3 bg-gradient-to-r from-[#0068FF] to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-black rounded-2xl shadow-md text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 min-h-[48px] border border-blue-400/40"
                  title="Mở Trợ lý Zalo OA điều khiển vườn và nhận bản tin Zalo ZNS sáng tự động"
                >
                  <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center p-0.5">
                    <span className="text-[#0068FF] font-black text-[10px] leading-none">Zalo</span>
                  </div>
                  <span>Trợ Lý Zalo OA</span>
                </button>

                {/* Harvest & Financial Settlement */}
                {activeSeason && (
                  <button
                    type="button"
                    onClick={() => setIsHarvestModalOpen(true)}
                    className="px-3.5 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-stone-950 font-black rounded-2xl shadow-lg text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 min-h-[48px] border border-amber-300/60 animate-pulse"
                    title="Quyết toán thu hoạch vụ mùa, tính doanh thu trừ đi chi phí gốc ra tiền lãi ròng"
                  >
                    <BanknotesIcon className="w-5 h-5 text-stone-950" />
                    <span>Thu Hoạch & Tính Lãi</span>
                  </button>
                )}

                {activeSeason && (
                  <button
                    type="button"
                    onClick={() => setIsTraceabilityOpen(true)}
                    className="px-3.5 py-3 bg-stone-900 hover:bg-stone-800 text-white font-black rounded-2xl shadow-md text-xs sm:text-sm flex items-center gap-2 border border-stone-700 transition-all active:scale-95 min-h-[48px]"
                  >
                    <QrCodeIcon className="w-5 h-5 text-amber-400" />
                    <span>Mã QR</span>
                  </button>
                )}
              </div>
            </header>

            {/* 3D Digital Twin Farm Plot & Crop Growth Simulation */}
            <Plot3DDigitalTwin
              plotName={selectedPlot.name}
              areaM2={selectedPlot.area_m2}
              cropType={activeSeason?.crop_type || 'Lúa nước (Oryza sativa)'}
              soilType={selectedPlot.soil_type || 'Đất phù sa'}
              moisturePercent={plotTelemetry?.soil_moisture || 52}
              soilPh={plotTelemetry?.soil_ph || 6.4}
              isWateringActive={plotTelemetry?.pump_active}
              weather={plotTelemetry?.weather}
              seasonPlantedDate={activeSeason?.planted_date}
              targetYield={activeSeason?.target_yield || 3500}
            />

            {/* Agronomy Master Suite: NPK Balancer, Market Prices & Climate Defense */}
            <AgronomyExpertOptimizer
              plotId={selectedPlot.id}
              plotName={selectedPlot.name}
              cropType={activeSeason?.crop_type || 'Sầu riêng'}
              areaM2={selectedPlot.area_m2}
            />

            {/* AI Crop Memory & Real-Time Growth Phenology Tracker */}
            <AIRealTimeCropTracker
              plotId={selectedPlot.id}
              seasonId={activeSeason?.id}
              plotName={selectedPlot.name}
              cropType={activeSeason?.crop_type || 'Sầu riêng Ri6'}
            />

            {/* Advanced Biophysics & Thermodynamics Studio: VPD + FAO-56 + Pareto NSGA-II */}
            <CropPhysiologyVPDStudio
              plotId={selectedPlot.id}
              plotName={selectedPlot.name}
              cropType={activeSeason?.crop_type || 'Sầu riêng Ri6'}
              areaM2={selectedPlot.area_m2}
            />

            {/* 7-Day Rain Radar & Agronomic Weather Advisory */}
            <PlotWeatherForecastCard
              weather={plotTelemetry?.weather}
              plotName={selectedPlot.name}
            />

            {/* Real-time IoT Telemetry & Smart Automation Card */}
            <IoTGaugeCard
              plotId={selectedPlot.id}
              plotName={selectedPlot.name}
              seasonId={activeSeason?.id}
              onWaterActionLogged={() => {
                if (activeSeason) fetchLogsAndRecs(activeSeason.id);
                fetchTelemetry(selectedPlot.id);
              }}
            />

            {/* Interactive Farm GIS Cadastral Map */}
            <FarmGISMap
              plots={plots}
              selectedPlot={selectedPlot}
              onPlotSelect={handleSelectPlot}
            />

            {activeSeason ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* AI Recommendations Column */}
                <section aria-labelledby="ai-recs-heading" className="lg:col-span-1 space-y-4">
                  <header className="flex items-center justify-between">
                    <h2 id="ai-recs-heading" className="text-lg font-black text-stone-900 flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                      Gợi ý thích ứng AI 🤖
                    </h2>
                  </header>

                  {recommendations.length === 0 ? (
                    <div className="glass-card p-6 rounded-3xl text-center text-stone-400 text-sm">
                      Chưa có gợi ý nào. Hãy nhập thêm dữ liệu canh tác để AI đưa ra tưới bón tối ưu.
                    </div>
                  ) : (
                    recommendations.map((rec) => {
                      const hasResponded = rec.feedbacks && rec.feedbacks.length > 0;
                      const feedbackAction = hasResponded ? rec.feedbacks[0].action : null;

                      return (
                        <article
                          key={rec.id}
                          aria-labelledby={`rec-title-${rec.id}`}
                          className="glass-card rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4 relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <h3 id={`rec-title-${rec.id}`} className="flex items-center gap-2 text-emerald-950 font-black text-base">
                              <BeakerIcon className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                              <span>Cần thêm {rec.type === 'WATER' ? 'Nước tưới' : 'Phân bón'}</span>
                            </h3>

                            <span className="badge-purple">
                              Tin cậy {(rec.confidence_score * 100).toFixed(0)}%
                            </span>
                          </div>

                          <div className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                            {rec.suggested_amount}{' '}
                            <span className="text-base font-bold text-stone-500">
                              {rec.type === 'WATER' ? 'Lít' : 'kg'}
                            </span>
                          </div>

                          {/* Explainable AI Callout */}
                          {rec.reason && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-950 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 leading-relaxed font-medium">
                              <InformationCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                              <span><strong>Lý do AI:</strong> {rec.reason}</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {hasResponded ? (
                            <div className="bg-emerald-50 text-emerald-900 font-extrabold text-xs p-3.5 rounded-2xl border border-emerald-200 text-center">
                              ✅ Đã phản hồi: <span className="uppercase text-emerald-800">{feedbackAction}</span>
                            </div>
                          ) : (
                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleFeedback(rec.id, 'ACCEPTED')}
                                aria-label="Chấp nhận gợi ý AI"
                                className="btn-gradient-primary flex-1 py-3 rounded-xl text-xs flex items-center justify-center gap-1 min-h-[44px]"
                              >
                                <CheckIcon className="w-4 h-4" aria-hidden="true" /> Có
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const val = prompt('Vui lòng nhập số lượng thực tế bạn đã áp dụng:');
                                  if (val && !isNaN(parseFloat(val))) {
                                    handleFeedback(rec.id, 'MODIFIED', parseFloat(val));
                                  }
                                }}
                                aria-label="Sửa số lượng thực tế gợi ý AI"
                                className="btn-gradient-amber flex-1 py-3 rounded-xl text-xs flex items-center justify-center gap-1 min-h-[44px]"
                              >
                                <PencilSquareIcon className="w-4 h-4" aria-hidden="true" /> Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFeedback(rec.id, 'REJECTED')}
                                aria-label="Từ chối gợi ý AI"
                                className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-all min-h-[44px]"
                              >
                                <XMarkIcon className="w-4 h-4" aria-hidden="true" /> Bỏ
                              </button>
                            </div>
                          )}
                        </article>
                      );
                    })
                  )}
                </section>

                {/* Farming Logs & Chart Column */}
                <section aria-labelledby="farming-logs-heading" className="lg:col-span-2 space-y-6">
                  <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
                    <header className="flex items-center justify-between">
                      <h2 id="farming-logs-heading" className="text-xl font-black text-stone-900">
                        Nhật ký Canh tác & Biểu đồ Thống kê
                      </h2>
                      <button
                        type="button"
                        onClick={() => setShowLogForm(!showLogForm)}
                        className="btn-gradient-primary px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 min-h-[44px]"
                      >
                        <PlusIcon className="w-4 h-4" aria-hidden="true" /> Thêm nhật ký
                      </button>
                    </header>

                    {showLogForm && (
                      <form onSubmit={handleCreateLog} className="bg-stone-100 p-4 sm:p-5 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label htmlFor="log-type-select" className="block text-xs font-bold text-stone-700 mb-1">
                            Loại hoạt động
                          </label>
                          <select
                            id="log-type-select"
                            value={logType}
                            onChange={(e) => setLogType(e.target.value)}
                            className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold"
                          >
                            <option value="WATER">Tưới nước</option>
                            <option value="FERTILIZER">Bón phân</option>
                            <option value="OTHER">Phun thuốc / Khác</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="log-amount-input" className="block text-xs font-bold text-stone-700 mb-1">
                            Số lượng
                          </label>
                          <input
                            id="log-amount-input"
                            type="number"
                            step="0.1"
                            required
                            placeholder="20"
                            value={logAmount}
                            onChange={(e) => setLogAmount(e.target.value)}
                            className="glass-input w-full px-3 py-2 rounded-xl text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label htmlFor="log-method-input" className="block text-xs font-bold text-stone-700 mb-1">
                            Phương pháp
                          </label>
                          <input
                            id="log-method-input"
                            type="text"
                            placeholder="Phun sương / Bón gốc..."
                            value={logMethod}
                            onChange={(e) => setLogMethod(e.target.value)}
                            className="glass-input w-full px-3 py-2 rounded-xl text-xs font-medium"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="submit"
                            className="btn-gradient-primary w-full py-2 rounded-xl text-xs min-h-[44px]"
                          >
                            Lưu Nhật ký
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Recharts Analytics Container */}
                    <figure className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#4b5563' }} />
                          <YAxis tick={{ fontSize: 12, fill: '#4b5563' }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="amount" stroke="#047857" strokeWidth={3.5} dot={{ r: 5, fill: '#047857' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </figure>

                    {/* Activity Feed */}
                    <ul className="divide-y divide-stone-100 max-h-48 overflow-y-auto font-sans">
                      {logs.map((log) => (
                        <li key={log.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-3 h-3 rounded-full ${log.type === 'WATER' ? 'bg-sky-500' : log.type === 'FERTILIZER' ? 'bg-amber-500' : 'bg-purple-500'}`} />
                            <strong className="font-extrabold text-stone-800">{log.type === 'WATER' ? 'Tưới nước' : log.type === 'FERTILIZER' ? 'Bón phân' : 'Khác'}</strong>
                            {log.method && <span className="text-xs text-stone-500 font-medium">({log.method})</span>}
                          </div>
                          <div className="font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            {log.amount} {log.unit}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-12 text-center border border-stone-200 space-y-4">
                <SparklesIcon className="w-14 h-14 text-emerald-600 mx-auto animate-pulse-slow" aria-hidden="true" />
                <h2 className="text-2xl font-black text-stone-900">Chưa có vụ mùa nào đang hoạt động</h2>
                <p className="text-sm text-stone-500 max-w-md mx-auto">
                  Khởi tạo mùa vụ mới để theo dõi gieo trồng, ghi nhật ký và nhận gợi ý tưới bón AI thích ứng
                </p>
                <button
                  type="button"
                  onClick={handleCreateSeasonQuick}
                  className="btn-gradient-primary px-6 py-3.5 rounded-2xl min-h-[48px] text-sm"
                >
                  Bắt đầu Mùa vụ Mới Ngay
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-stone-400 font-bold text-lg">Vui lòng chọn hoặc thêm thửa đất ở thanh bên trái</div>
        )}

        {/* Real-Time GIS Location & Agronomy Advisor Modal */}
        <PlotCreationLocationAdvisorModal
          isOpen={showPlotForm}
          onClose={() => setShowPlotForm(false)}
          onPlotCreated={(newPlot) => {
            onRefreshPlots();
            onPlotSelect(newPlot);
          }}
        />

        {/* AI Crop Doctor Modal */}
        <CropDoctorModal
          isOpen={isCropDoctorOpen}
          onClose={() => setIsCropDoctorOpen(false)}
          plotName={selectedPlot?.name}
          seasonId={activeSeason?.id}
          onLogCreated={() => {
            if (activeSeason) fetchLogsAndRecs(activeSeason.id);
            if (selectedPlot) fetchTelemetry(selectedPlot.id);
          }}
        />

        {/* VietGAP QR Traceability Modal */}
        <TraceabilityModal
          isOpen={isTraceabilityOpen}
          onClose={() => setIsTraceabilityOpen(false)}
          seasonId={activeSeason?.id}
        />

        {/* Voice AI Copilot Modal */}
        <VoiceAICopilotModal
          isOpen={isVoiceCopilotOpen}
          onClose={() => setIsVoiceCopilotOpen(false)}
          plotName={selectedPlot?.name}
          seasonId={activeSeason?.id}
          onLogCreated={() => {
            if (activeSeason) fetchLogsAndRecs(activeSeason.id);
            if (selectedPlot) fetchTelemetry(selectedPlot.id);
          }}
        />

        {/* Emergency Alert Notification Center Drawer */}
        <NotificationCenterDrawer
          isOpen={isNotificationDrawerOpen}
          onClose={() => setIsNotificationDrawerOpen(false)}
          onOpenDossier={() => setIsDossierOpen(true)}
        />

        {/* Official Printable VietGAP Technical Dossier Modal */}
        <VietGAPDossierModal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          plot={selectedPlot}
          season={activeSeason}
          logs={logs}
        />

        {/* Zalo Official Account Assistant Modal */}
        <ZaloAgriBotModal
          isOpen={isTelegramBotOpen}
          onClose={() => setIsTelegramBotOpen(false)}
          plotId={selectedPlot?.id}
          seasonId={activeSeason?.id}
          plotName={selectedPlot?.name}
          cropType={activeSeason?.crop_type}
        />

        {/* Harvest & Financial Settlement Modal */}
        <HarvestSettlementModal
          isOpen={isHarvestModalOpen}
          onClose={() => setIsHarvestModalOpen(false)}
          plot={selectedPlot}
          season={activeSeason}
          logs={logs}
          onHarvestCompleted={() => {
            if (selectedPlot) {
              handleSelectPlot(selectedPlot);
              onRefreshPlots();
            }
          }}
        />
      </section>
    </div>
  );
};

export default Dashboard;
