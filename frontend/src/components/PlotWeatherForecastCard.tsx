import React from 'react';
import {
  CloudIcon,
  SunIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface DailyItem {
  date: string;
  day_name: string;
  max_temp: number;
  min_temp: number;
  rainfall_mm: number;
  rain_probability_pct: number;
  weather_code: number;
  summary: string;
  is_rainy: boolean;
}

interface HourlyItem {
  hour: string;
  temp: number;
  rain_probability_pct: number;
  rainfall_mm: number;
}

interface PlotWeatherForecastCardProps {
  weather?: {
    temp: number;
    humidity: number;
    rainfall_mm: number;
    wind_speed_kmh: number;
    forecast: string;
    location: string;
    farming_advice?: {
      can_fertilize: boolean;
      can_spray_pest: boolean;
      irrigation_advice: string;
      notice: string;
    };
    daily_forecast?: DailyItem[];
    hourly_forecast?: HourlyItem[];
  };
  plotName?: string;
}

const PlotWeatherForecastCard: React.FC<PlotWeatherForecastCardProps> = ({
  weather,
  plotName
}) => {
  if (!weather || !weather.daily_forecast || weather.daily_forecast.length === 0) {
    return null;
  }

  const advice = weather.farming_advice || {
    can_fertilize: true,
    can_spray_pest: true,
    irrigation_advice: 'Duy trì tưới tiêu định kỳ vào buổi chiều mát.',
    notice: '☀️ Thời tiết vi khí hậu ổn định, thuận lợi cho chăm sóc cây trồng.'
  };

  return (
    <section aria-label="Dự báo thời tiết và mưa 7 ngày" className="bg-stone-900 border border-emerald-600/40 rounded-3xl p-6 text-stone-100 shadow-xl space-y-6 relative overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-stone-950 font-black shadow-md shrink-0">
            <CloudIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-wide">
                Dự Báo Mưa & Khí Tượng 7 Ngày (Plot Radar)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/40">
                AI METEO FORECAST
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Dành riêng cho thửa: <strong className="text-emerald-400">{plotName || 'Thửa đất số 1'}</strong> • Tọa độ vi khí hậu cục bộ
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-stone-400 font-medium">
          Dữ liệu mô hình thời tiết chuẩn ECMWF & GFS
        </div>
      </div>

      {/* Agronomic Advisory Callout Box */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        advice.can_fertilize
          ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-100'
          : 'bg-amber-950/60 border-amber-600/50 text-amber-100'
      }`}>
        <div className="flex items-center gap-3">
          {advice.can_fertilize ? (
            <ShieldCheckIcon className="w-8 h-8 text-emerald-400 shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="w-8 h-8 text-amber-400 shrink-0" />
          )}
          <div>
            <div className="text-xs font-black uppercase tracking-wider">
              Khuyến Nghị Canh Tác Vi Khí Hậu
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {advice.notice}
            </div>
            <div className="text-xs text-stone-300 mt-1">
              💧 <strong>Tưới tiêu:</strong> {advice.irrigation_advice}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${
            advice.can_fertilize
              ? 'bg-emerald-800 text-white border-emerald-500'
              : 'bg-rose-900/80 text-rose-200 border-rose-600'
          }`}>
            {advice.can_fertilize ? '✅ Bón phân: TỐT' : '⛔ Tránh bón phân'}
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-stone-800 text-stone-300 border border-stone-700">
            {advice.can_spray_pest ? '✅ Phun BVTV: Thuận lợi' : '⛔ Không phun thuốc'}
          </span>
        </div>
      </div>

      {/* 7-Day Forecast Slider Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-stone-300">
          <span className="flex items-center gap-1.5">
            <CalendarDaysIcon className="w-4 h-4 text-emerald-400" /> Xu hướng thời tiết 7 ngày tới
          </span>
          <span className="text-stone-400 text-[11px]">Đơn vị: °C & mm mưa</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {weather.daily_forecast.map((day, idx) => {
            const isToday = idx === 0;
            const isRain = day.is_rainy || day.rainfall_mm > 1;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                  isToday
                    ? 'bg-gradient-to-b from-emerald-900/90 to-teal-950 text-white border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg'
                    : isRain
                    ? 'bg-sky-950/40 border-sky-700/50 hover:bg-sky-900/40 text-stone-200'
                    : 'bg-stone-800/80 border-stone-700 hover:bg-stone-750 text-stone-200'
                }`}
              >
                <div>
                  <div className={`text-xs font-black ${isToday ? 'text-amber-300' : 'text-stone-300'}`}>
                    {day.day_name}
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                    {new Date(day.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>

                {/* Weather Icon & Summary */}
                <div className="my-2 flex flex-col items-center justify-center">
                  {isRain ? (
                    <CloudIcon className="w-7 h-7 text-sky-400 animate-bounce" />
                  ) : (
                    <SunIcon className="w-7 h-7 text-amber-400" />
                  )}
                  <span className="text-[11px] font-bold text-stone-300 mt-1 line-clamp-1">
                    {day.summary}
                  </span>
                </div>

                {/* Temperature Range */}
                <div className="text-xs font-black text-white">
                  {day.max_temp}° <span className="text-stone-400 font-medium text-[11px]">/ {day.min_temp}°</span>
                </div>

                {/* Rain Probability & Amount Badge */}
                <div className="mt-2 pt-2 border-t border-stone-700/60">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-stone-400">Mưa:</span>
                    <span className={`px-1.5 py-0.2 rounded font-black ${
                      day.rain_probability_pct > 50
                        ? 'bg-sky-500 text-stone-950'
                        : day.rain_probability_pct > 20
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'text-stone-400'
                    }`}>
                      {day.rain_probability_pct}%
                    </span>
                  </div>
                  {day.rainfall_mm > 0 && (
                    <div className="text-[10px] font-mono text-sky-300 font-black mt-0.5">
                      {day.rainfall_mm} mm
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next 12 Hours Rain Probability Strip */}
      {weather.hourly_forecast && weather.hourly_forecast.length > 0 && (
        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
          <div className="text-xs font-bold text-stone-400 mb-2 flex items-center justify-between">
            <span>Xác suất mưa & nhiệt độ trong 12 giờ tới</span>
            <span className="text-[10px] text-sky-400 font-mono">Dự báo theo giờ</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {weather.hourly_forecast.map((h, i) => (
              <div
                key={i}
                className="flex-1 min-w-[54px] bg-stone-900/90 border border-stone-800 p-2 rounded-xl text-center flex flex-col justify-between shrink-0"
              >
                <span className="text-[10px] text-stone-400 font-mono">{h.hour}</span>
                <div className="my-1">
                  <span className="text-xs font-black text-white">{h.temp}°</span>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden my-1">
                  <div
                    className="bg-sky-400 h-full transition-all"
                    style={{ width: `${h.rain_probability_pct}%` }}
                  />
                </div>
                <span className={`text-[9px] font-black ${h.rain_probability_pct > 50 ? 'text-sky-400' : 'text-stone-400'}`}>
                  {h.rain_probability_pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PlotWeatherForecastCard;
