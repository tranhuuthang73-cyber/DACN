import React, { useState, useEffect } from 'react';
import {
  ArrowPathIcon,
  PlayIcon,
  CheckIcon,
  SparklesIcon,
  SunIcon,
  CloudIcon,
  GlobeAmericasIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface IoTGaugeCardProps {
  plotId?: number;
  plotName?: string;
  seasonId?: number;
  onWaterActionLogged?: () => void;
}

const REGIONS = [
  { name: 'Tiền Giang (Mỹ Tho / Chợ Gạo)', lat: 10.352, lon: 106.358 },
  { name: 'Bến Tre (Châu Thành / Chợ Lách)', lat: 10.243, lon: 106.375 },
  { name: 'Đồng Tháp (Cao Lãnh / Sa Đéc)', lat: 10.457, lon: 105.634 },
  { name: 'Cần Thơ (Phong Điền / Thới Lai)', lat: 10.045, lon: 105.746 },
  { name: 'Lâm Đồng (Đà Lạt / Đức Trọng)', lat: 11.940, lon: 108.458 },
  { name: 'Đắk Lắk (Buôn Ma Thuột / Krông Pắk)', lat: 12.667, lon: 108.038 },
  { name: 'TP. Hồ Chí Minh (Củ Chi / Hóc Môn)', lat: 10.823, lon: 106.629 },
  { name: 'Hà Nội (Gia Lâm / Đông Anh)', lat: 21.028, lon: 105.834 }
];

const IoTGaugeCard: React.FC<IoTGaugeCardProps> = ({
  plotId,
  plotName,
  seasonId,
  onWaterActionLogged
}) => {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoStream, setAutoStream] = useState(true);
  const [watering, setWatering] = useState(false);
  const [waterSuccessMsg, setWaterSuccessMsg] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);

  const fetchTelemetry = async () => {
    if (!plotId) return;
    try {
      const { data } = await api.get(`/iot/telemetry/${plotId}`);
      setTelemetry(data.telemetry);
    } catch (err) {
      console.error('Lỗi tải dữ liệu cảm biến IoT:', err);
    }
  };

  useEffect(() => {
    if (plotId) {
      setLoading(true);
      fetchTelemetry().finally(() => setLoading(false));
    }
  }, [plotId, selectedRegion]);

  // Real-time live polling stream simulation
  useEffect(() => {
    if (!autoStream || !plotId) return;
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 4000);
    return () => clearInterval(interval);
  }, [autoStream, plotId]);

  const handleTriggerIrrigation = async () => {
    if (!plotId) return;
    setWatering(true);
    setWaterSuccessMsg(null);

    try {
      const { data } = await api.post('/iot/irrigate', {
        plot_id: plotId,
        season_id: seasonId,
        duration_minutes: 15,
        amount_liters: 300
      });

      setWaterSuccessMsg(data.message);
      fetchTelemetry();
      if (onWaterActionLogged) onWaterActionLogged();

      setTimeout(() => {
        setWatering(false);
      }, 5000);
    } catch (err) {
      alert('Lỗi kích hoạt van tưới tự động');
      setWatering(false);
    }
  };

  if (!telemetry && loading) {
    return (
      <div className="bg-stone-900 border border-emerald-800/40 rounded-3xl p-6 text-center text-emerald-400 font-bold animate-pulse">
        Đang kết nối trạm thời tiết Open-Meteo & cảm biến IoT vi khí hậu...
      </div>
    );
  }

  const moisture = telemetry?.soil_moisture || 42;
  const isDry = moisture < 35;
  const isWet = moisture > 75;
  const weather = telemetry?.weather;

  return (
    <section aria-label="Giám sát cảm biến vi khí hậu & IoT" className="bg-stone-900 border border-emerald-600/40 rounded-3xl p-6 text-stone-100 shadow-xl space-y-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-emerald-950 font-black shadow-md shrink-0">
            <span className="text-xl">📡</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white tracking-wide">
                Trạm Cảm Biến IoT & Khí Tượng Real-Time
              </h3>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                VỆ TINH TRỰC TIẾP (Open-Meteo)
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Thửa đất: <strong className="text-emerald-400">{plotName || 'Thửa số 1'}</strong> • Cập nhật:{' '}
              {telemetry?.timestamp ? new Date(telemetry.timestamp).toLocaleTimeString('vi-VN') : 'Vừa xong'}
            </p>
          </div>
        </div>

        {/* Action Toolbar & Region Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-700 px-3 py-1.5 rounded-xl">
            <GlobeAmericasIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedRegion.name}
              onChange={(e) => {
                const found = REGIONS.find((r) => r.name === e.target.value);
                if (found) setSelectedRegion(found);
              }}
              className="bg-transparent text-xs font-bold text-stone-200 focus:outline-none cursor-pointer"
            >
              {REGIONS.map((r, idx) => (
                <option key={idx} value={r.name} className="bg-stone-900 text-white">
                  📍 {r.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setAutoStream(!autoStream)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 min-h-[36px] ${
              autoStream
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${autoStream ? 'animate-spin' : ''}`} />
            <span>{autoStream ? 'Tự động nhảy số' : 'Tạm dừng'}</span>
          </button>
        </div>
      </div>

      {/* Live Real-Time Weather Banner (Direct from Open-Meteo Radar) */}
      {weather && (
        <div className="bg-gradient-to-r from-sky-950/80 via-emerald-950/60 to-stone-900 p-4 rounded-2xl border border-sky-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
              {weather.rainfall_mm > 0 ? (
                <CloudIcon className="w-6 h-6 text-sky-300 animate-bounce" />
              ) : (
                <SunIcon className="w-6 h-6 text-amber-400 animate-pulse-slow" />
              )}
            </div>
            <div>
              <div className="text-xs font-black text-sky-300 uppercase tracking-wider flex items-center gap-2">
                <span>Khí tượng vi khí hậu thời gian thực</span>
                <span className="text-[10px] px-2 py-0.2 bg-sky-400/20 text-sky-200 rounded">
                  GPS: {selectedRegion.lat}°N, {selectedRegion.lon}°E
                </span>
              </div>
              <div className="text-sm sm:text-base font-black text-white mt-0.5">
                {weather.forecast}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-stone-300 shrink-0">
            <div className="bg-stone-950/80 px-2.5 py-1.5 rounded-lg border border-stone-800">
              Gió: <strong className="text-emerald-400">{weather.wind_speed_kmh || 8} km/h</strong>
            </div>
            <div className="bg-stone-950/80 px-2.5 py-1.5 rounded-lg border border-stone-800">
              Mưa: <strong className="text-sky-400">{weather.rainfall_mm || 0} mm</strong>
            </div>
          </div>
        </div>
      )}

      {/* Main Gauges Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Soil Moisture (Primary Gauge) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isDry
            ? 'bg-rose-950/40 border-rose-600/50 ring-2 ring-rose-500/20'
            : isWet
            ? 'bg-sky-950/40 border-sky-600/50'
            : 'bg-stone-800/80 border-emerald-600/30'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-stone-300">Độ Ẩm Đất</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
              isDry ? 'bg-rose-500 text-white' : 'bg-emerald-900 text-emerald-300'
            }`}>
              {telemetry?.soil_moisture_status || 'LÝ TƯỞNG'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{moisture}</span>
            <span className="text-sm font-bold text-emerald-400">%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                isDry ? 'bg-rose-500' : isWet ? 'bg-sky-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, moisture)}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-stone-400 mt-1 font-semibold">
            <span>Khô (&lt;35%)</span>
            <span>Tối ưu (50-70%)</span>
            <span>Ướt (&gt;75%)</span>
          </div>
        </div>

        {/* Soil pH Level */}
        <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-stone-300">Độ pH Của Đất</span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-900/60 text-emerald-300 rounded">
              {telemetry?.is_safe_ph ? 'PHÙ HỢP' : 'CẦN BÓN VÔI'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {telemetry?.soil_ph || 6.4}
            </span>
            <span className="text-xs font-bold text-stone-400">pH</span>
          </div>
          <div className="text-[11px] text-stone-300 font-medium">
            Đất phù sa nhẹ, cân bằng vi sinh tốt
          </div>
        </div>

        {/* Temp & Air Humidity (Live from Open-Meteo) */}
        <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-2xl">
          <div className="text-xs font-bold text-stone-300 mb-1">Nhiệt Độ / Độ Ẩm Thực Tế</div>
          <div className="flex items-baseline gap-3 my-2">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-amber-400">
                {telemetry?.temp_c || 32}°
              </span>
              <span className="text-xs font-bold text-stone-400">C</span>
            </div>
            <div className="text-stone-500">/</div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-sky-400">
                {telemetry?.humidity_pct || 65}
              </span>
              <span className="text-xs font-bold text-stone-400">%</span>
            </div>
          </div>
          <div className="text-[11px] text-stone-300 font-medium">
            Dữ liệu vệ tinh khí tượng thời gian thực
          </div>
        </div>

        {/* N-P-K Nutrients */}
        <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-2xl">
          <div className="text-xs font-bold text-stone-300 mb-1">Dinh Dưỡng Đất (N-P-K)</div>
          <div className="grid grid-cols-3 gap-1 my-2 text-center">
            <div className="bg-stone-900/90 p-1.5 rounded-lg border border-stone-700">
              <div className="text-[10px] text-stone-400 font-bold">N (Đạm)</div>
              <div className="text-xs font-black text-emerald-400">{telemetry?.nitrogen_ppm || 145}</div>
            </div>
            <div className="bg-stone-900/90 p-1.5 rounded-lg border border-stone-700">
              <div className="text-[10px] text-stone-400 font-bold">P (Lân)</div>
              <div className="text-xs font-black text-amber-400">{telemetry?.phosphorus_ppm || 40}</div>
            </div>
            <div className="bg-stone-900/90 p-1.5 rounded-lg border border-stone-700">
              <div className="text-[10px] text-stone-400 font-bold">K (Kali)</div>
              <div className="text-xs font-black text-teal-400">{telemetry?.potassium_ppm || 190}</div>
            </div>
          </div>
          <div className="text-[10px] text-stone-400 text-center font-medium">Đơn vị: mg/kg đất</div>
        </div>
      </div>

      {/* Smart Sprinkler Trigger & Alert Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 p-4 sm:p-5 rounded-2xl border border-emerald-600/40 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <SparklesIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-black text-white flex items-center gap-2">
              Tự Động Hóa Tưới Thông Minh (Smart Sprinkler Automation)
              {telemetry?.pump_active && (
                <span className="px-2 py-0.5 bg-sky-500 text-stone-950 font-black text-[10px] rounded-full animate-bounce">
                  💦 ĐANG BẬT VAN TƯỚI
                </span>
              )}
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Hệ thống tự động kích hoạt béc phun và ghi vào sổ nhật ký canh tác khi độ ẩm đất &lt; 35%.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTriggerIrrigation}
          disabled={watering || telemetry?.pump_active}
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 disabled:opacity-60 text-stone-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-sky-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
        >
          {watering || telemetry?.pump_active ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span>Đang phun tưới 15 phút...</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4 fill-current" />
              <span>Bật Tưới Ngay (300 Lít)</span>
            </>
          )}
        </button>
      </div>

      {waterSuccessMsg && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-fade-in">
          <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{waterSuccessMsg}</span>
        </div>
      )}
    </section>
  );
};

export default IoTGaugeCard;
