import React, { useState } from 'react';
import {
  MapPinIcon,
  GlobeAmericasIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';


interface FarmGISMapProps {
  plots: any[];
  selectedPlot: any;
  onPlotSelect: (plot: any) => void;
}

const FarmGISMap: React.FC<FarmGISMapProps> = ({
  plots,
  selectedPlot,
  onPlotSelect
}) => {
  const [mapMode, setMapMode] = useState<'SATELLITE' | 'TERRAIN' | 'HEATMAP'>('TERRAIN');

  const totalArea = plots.reduce((sum, p) => sum + (p.area_m2 || 0), 0);

  return (
    <section aria-label="Bản đồ số GIS Thửa đất nông trại" className="bg-stone-900 border border-emerald-600/40 rounded-3xl p-6 text-stone-100 shadow-xl space-y-5 relative overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-emerald-950 font-black shadow-md">
            <GlobeAmericasIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-wide">
                Bản Đồ Số GIS & Quy Hoạch Thửa Đất (Smart Farm GIS)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                WGS-84 / VN-2000
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Tổng diện tích quy hoạch: <strong className="text-emerald-400">{totalArea.toLocaleString()} m²</strong> ({plots.length} phân khu canh tác)
            </p>
          </div>
        </div>

        {/* View Layers Switcher */}
        <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-2xl border border-stone-800 shrink-0">
          <button
            type="button"
            onClick={() => setMapMode('TERRAIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mapMode === 'TERRAIN'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Đồ Họa Phân Khu
          </button>
          <button
            type="button"
            onClick={() => setMapMode('SATELLITE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mapMode === 'SATELLITE'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Ảnh Vệ Tinh (RGB)
          </button>
          <button
            type="button"
            onClick={() => setMapMode('HEATMAP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mapMode === 'HEATMAP'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Bản Đồ Độ Ẩm (Heatmap)
          </button>
        </div>
      </div>

      {/* GIS Visual Canvas Area */}
      <div className={`w-full min-h-[320px] rounded-2xl border border-stone-800 p-6 relative overflow-hidden transition-all duration-500 ${
        mapMode === 'SATELLITE'
          ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-800 via-emerald-950 to-stone-950'
          : mapMode === 'HEATMAP'
          ? 'bg-gradient-to-br from-teal-950 via-emerald-950 to-amber-950/40'
          : 'bg-stone-950/90'
      }`}>
        {/* Grid lines overlay for cadastral precision */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* GPS Coordinates Header */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>TỌA ĐỘ TRUNG TÂM: 10°21'07.2"N 106°21'28.8"E (Tiền Giang)</span>
          </div>
          <div>TỶ LỆ: 1:5000 • CHUẨN VIETGAP</div>
        </div>

        {/* Interactive Plots Parcel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {plots.map((plot, index) => {
            const isSelected = selectedPlot?.id === plot.id;
            const seed = (plot.id * 13) % 10;
            const moistureLevel = 40 + (seed * 4); // 40-76%
            const isDry = moistureLevel < 45;

            return (
              <div
                key={plot.id}
                onClick={() => onPlotSelect(plot)}
                className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 relative border flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-gradient-to-br from-emerald-900/90 to-teal-950 text-white border-emerald-400 ring-4 ring-emerald-500/20 shadow-2xl scale-[1.02]'
                    : 'bg-stone-900/80 hover:bg-stone-800 text-stone-200 border-stone-700/80 hover:border-emerald-500/50'
                }`}
              >
                {/* Parcel Boundary Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-emerald-400 text-emerald-950' : 'bg-stone-800 text-stone-300'
                  }`}>
                    LÔ #{String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="flex items-center gap-1">
                    {mapMode === 'HEATMAP' ? (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isDry ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        Độ ẩm: {moistureLevel}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-stone-400">
                        {plot.soil_type || 'Đất phù sa'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Plot Info */}
                <div className="space-y-1 my-1">
                  <div className="text-sm font-black text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                    <MapPinIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-300' : 'text-emerald-500'}`} />
                    <span>{plot.name}</span>
                  </div>
                  <div className="text-xs text-stone-400 font-medium">
                    Diện tích: <strong className="text-white">{plot.area_m2.toLocaleString()} m²</strong>
                  </div>
                </div>

                {/* Status Footer */}
                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheckIcon className="w-3.5 h-3.5" /> Chuẩn VietGAP
                  </span>
                  <span className={`font-black ${isSelected ? 'text-amber-300' : 'text-stone-400'}`}>
                    {isSelected ? '● Đang chọn' : 'Click để xem'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FarmGISMap;
