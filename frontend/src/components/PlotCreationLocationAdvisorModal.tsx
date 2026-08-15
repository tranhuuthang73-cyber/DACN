import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  MapPinIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  BeakerIcon,
  ShieldCheckIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface PlotCreationLocationAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlotCreated: (newPlot: any) => void;
}

// Popular Agricultural Regions Presets in Vietnam
const REGION_PRESETS = [
  { name: 'Cai Lậy (Tiền Giang)', desc: 'Thủ phủ Sầu Riêng Ri6 / Monthong', lat: 10.36, lng: 106.36 },
  { name: 'Chợ Lách (Bến Tre)', desc: 'Cây giống & Cây ăn trái ranh mặn', lat: 10.25, lng: 106.15 },
  { name: 'Kế Sách (Sóc Trăng)', desc: 'Cửa biển sông Hậu - Vùng nước lợ', lat: 9.65, lng: 105.95 },
  { name: 'Phong Điền (Cần Thơ)', desc: 'Đất phù sa ngọt trung tâm ĐBSCL', lat: 10.02, lng: 105.78 },
  { name: 'Buôn Ma Thuột (Đắk Lắk)', desc: 'Đất đỏ Bazan Tây Nguyên', lat: 12.68, lng: 108.05 },
  { name: 'Long Khánh (Đồng Nai)', desc: 'Chôm chôm, Sầu riêng Đông Nam Bộ', lat: 10.93, lng: 107.24 }
];

const PlotCreationLocationAdvisorModal: React.FC<PlotCreationLocationAdvisorModalProps> = ({
  isOpen,
  onClose,
  onPlotCreated
}) => {
  // Coordinates State
  const [lat, setLat] = useState<number>(10.36);
  const [lng, setLng] = useState<number>(106.36);
  const [selectedRegionName, setSelectedRegionName] = useState<string>('Cai Lậy (Tiền Giang)');

  // Analysis Data State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);

  // Form State
  const [plotName, setPlotName] = useState('Thửa Đất Mới - ' + new Date().toLocaleDateString('vi-VN'));
  const [areaM2, setAreaM2] = useState<number>(5000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-analyze when opened
  useEffect(() => {
    if (isOpen) {
      handleAnalyzeLocation(lat, lng);
    }
  }, [isOpen]);

  const handleAnalyzeLocation = async (latitude: number, longitude: number) => {
    setIsAnalyzing(true);
    try {
      const res = await api.get(`/location-advisor/analyze?lat=${latitude}&lng=${longitude}`);
      setAnalysisResult(res.data);
      if (res.data.crop_recommendations && res.data.crop_recommendations.length > 0) {
        setSelectedCrop(res.data.crop_recommendations[0]);
      }
    } catch (err) {
      console.error('Failed to analyze location', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: typeof REGION_PRESETS[0]) => {
    setLat(preset.lat);
    setLng(preset.lng);
    setSelectedRegionName(preset.name);
    handleAnalyzeLocation(preset.lat, preset.lng);
  };

  const handleGetLiveGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = Math.round(pos.coords.latitude * 10000) / 10000;
          const userLng = Math.round(pos.coords.longitude * 10000) / 10000;
          setLat(userLat);
          setLng(userLng);
          setSelectedRegionName('Vị trí GPS Hiện Tại Của Bạn');
          handleAnalyzeLocation(userLat, userLng);
        },
        (err) => {
          alert('Không thể lấy vị trí GPS tự động: ' + err.message + '. Vui lòng chọn trên danh sách hoặc nhập tọa độ.');
        }
      );
    } else {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
    }
  };

  const handleCreatePlotWithAdvisory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotName || !areaM2) return;

    setIsSubmitting(true);
    try {
      const soilType = analysisResult?.live_environmental_telemetry?.soil_type || 'Đất phù sa';
      const cropType = selectedCrop?.name || 'Sầu riêng Ri6';

      // 1. Create Plot with verified coordinates
      const plotRes = await api.post('/plots', {
        name: plotName,
        area_m2: Number(areaM2),
        soil_type: soilType,
        latitude: lat,
        longitude: lng
      });

      const newPlot = plotRes.data;

      // 2. Automatically create initial Season with selected crop
      try {
        await api.post('/seasons', {
          plot_id: newPlot.id,
          crop_type: cropType,
          planted_date: new Date().toISOString(),
          expected_harvest_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          target_yield: Math.round((Number(areaM2) / 1000) * 3.5 * 10) / 10 // e.g. ~3.5 tons per 1000m2
        });
      } catch (seasonErr) {
        console.warn('Initial season auto-creation failed:', seasonErr);
      }

      onPlotCreated(newPlot);
      onClose();
    } catch (err: any) {
      alert('Lỗi tạo thửa đất: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in font-sans">
      <div className="bg-stone-900 border border-emerald-500/50 text-stone-100 rounded-3xl max-w-4xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 bg-gradient-to-r from-emerald-950 via-stone-950 to-teal-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-emerald-500/30">
              <MapPinIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Khảo Sát Tọa Độ & Khuyến Nghị Cây Trồng Thời Gian Thực</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  LIVE REAL-TIME DATA
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Tự động đo đạc độ mặn sông, chỉ số pH đất và thời tiết vệ tinh để đề xuất giống cây bội thu
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

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STEP 1: CHỌN TỌA ĐỘ VỊ TRÍ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <span>1. Chọn Vị Trí Thửa Đất (Tọa Độ Địa Lý WGS-84)</span>
              </h4>
              <button
                type="button"
                onClick={handleGetLiveGPS}
                className="px-3 py-1.5 bg-emerald-700/50 hover:bg-emerald-600 text-emerald-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-500/40 transition-all active:scale-95 shadow"
              >
                <MapPinIcon className="w-4 h-4 text-emerald-400" />
                <span>📍 Lấy Tọa Độ GPS Của Tôi</span>
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REGION_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-2xl text-left border transition-all ${
                    selectedRegionName === preset.name
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500'
                      : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <strong className="text-xs block text-white">{preset.name}</strong>
                  <span className="text-[10px] text-stone-500 line-clamp-1">{preset.desc}</span>
                </button>
              ))}
            </div>

            {/* Manual Lat/Lng inputs */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-stone-950 rounded-2xl border border-stone-800">
              <div className="flex-1 min-w-[140px]">
                <label className="text-[11px] text-stone-400 block mb-1 font-bold">Vĩ độ (Latitude):</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 10.36)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-[11px] text-stone-400 block mb-1 font-bold">Kinh độ (Longitude):</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 106.36)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div className="pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAnalyzeLocation(lat, lng)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>Quét Dữ Liệu Vùng</span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2: THÔNG SỐ ĐO ĐẠC MÔI TRƯỜNG THỜI GIAN THỰC */}
          {analysisResult && (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4" />
                <span>2. Kết Quả Đo Đạc Thực Tế & Thủy Văn Cửa Sông</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Salinity Metric */}
                <div className={`p-3.5 rounded-2xl border ${
                  analysisResult.live_environmental_telemetry.salinity_permille < 0.5
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : analysisResult.live_environmental_telemetry.salinity_permille < 1.0
                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Độ Mặn Thực Tế</span>
                  <div className="text-2xl font-black mt-1">
                    {analysisResult.live_environmental_telemetry.salinity_permille} <span className="text-xs font-normal">‰ (g/L)</span>
                  </div>
                  <span className="text-[10px] mt-1 block font-bold leading-tight">
                    {analysisResult.live_environmental_telemetry.salinity_status}
                  </span>
                </div>

                {/* Soil pH Metric */}
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Độ pH Thổ Nhưỡng</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {analysisResult.live_environmental_telemetry.soil_ph} <span className="text-xs font-normal">pH</span>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Độ dẫn điện EC: {analysisResult.live_environmental_telemetry.soil_ec_dsm} dS/m
                  </span>
                </div>

                {/* Satellite Weather Metric */}
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Khí Hậu Vệ Tinh Live</span>
                  <div className="text-2xl font-black text-sky-400 mt-1">
                    {analysisResult.live_environmental_telemetry.temperature_c}°C
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Độ ẩm {analysisResult.live_environmental_telemetry.humidity_pct}% • Gió {analysisResult.live_environmental_telemetry.wind_speed_kmh}km/h
                  </span>
                </div>

                {/* Estuary Distance Metric */}
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Cửa Biển Gần Nhất</span>
                  <div className="text-lg font-black text-teal-300 mt-1 line-clamp-1">
                    {analysisResult.coordinates.closest_estuary}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Cách {analysisResult.coordinates.distance_to_estuary_km} km
                  </span>
                </div>
              </div>

              {/* Soil info summary banner */}
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BeakerIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Loại đất:</strong> {analysisResult.live_environmental_telemetry.soil_type} • <strong>Thoát nước:</strong> {analysisResult.live_environmental_telemetry.drainage_condition}</span>
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: KHUYẾN NGHỊ CÂY TRỒNG & KỸ THUẬT CANH TÁC */}
          {analysisResult && (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <CheckBadgeIcon className="w-4 h-4" />
                <span>3. Danh Sách Cây Trồng Phù Hợp (Xếp theo độ thích nghi & lợi nhuận)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysisResult.crop_recommendations.map((crop: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedCrop(crop)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedCrop?.name === crop.name
                        ? 'bg-emerald-950/80 border-emerald-500 shadow-xl ring-2 ring-emerald-500/60'
                        : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{crop.icon}</span>
                        <div>
                          <h5 className="font-black text-sm text-white">{crop.name}</h5>
                          <span className="text-[10px] text-stone-400">
                            Giá thị trường: <strong className="text-amber-400">{crop.base_market_price_vnd_kg.toLocaleString()} đ/kg</strong>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          crop.suitability_score >= 80
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : crop.suitability_score >= 50
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {crop.suitability_score}% Phù hợp
                        </span>
                      </div>
                    </div>

                    {/* Expand details for selected crop */}
                    {selectedCrop?.name === crop.name && (
                      <div className="mt-3 pt-3 border-t border-emerald-500/30 text-xs space-y-2 text-stone-300 animate-fade-in">
                        <div>
                          <strong className="text-emerald-300 block">🌿 Hướng dẫn canh tác VietGAP:</strong>
                          <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">{crop.vietgap_advice}</p>
                        </div>
                        <div>
                          <strong className="text-amber-300 block">🧪 Công thức bón lót & cải tạo đất:</strong>
                          <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">{crop.fertilizer_formula}</p>
                        </div>
                        <div>
                          <strong className="text-sky-300 block">💧 Chế độ tưới nước FAO-56:</strong>
                          <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">{crop.watering_rule}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: FORM LƯU THỬA ĐẤT */}
          <form onSubmit={handleCreatePlotWithAdvisory} className="p-5 rounded-3xl bg-stone-950 border border-emerald-500/40 space-y-4">
            <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>4. Thông Tin Khởi Tạo Thửa Đất Số 3D</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-stone-400 block mb-1 text-xs font-bold">Tên Thửa Đất:</label>
                <input
                  type="text"
                  required
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold"
                  placeholder="VD: Vườn Sầu Riêng B1"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1 text-xs font-bold">Diện Tích (m²):</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={areaM2}
                  onChange={(e) => setAreaM2(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1 text-xs font-bold">Cây Trồng Đã Chọn:</label>
                <input
                  type="text"
                  disabled
                  value={selectedCrop?.name || 'Sầu riêng'}
                  className="w-full bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs text-emerald-300 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-stone-400 hover:text-white text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <BanknotesIcon className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang Khởi Tạo...' : '✓ Xác Nhận & Khởi Tạo Thửa Đất'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlotCreationLocationAdvisorModal;
