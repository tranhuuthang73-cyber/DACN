import React, { useState, useEffect } from 'react';
import {
  BeakerIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface CropPhysiologyVPDStudioProps {
  plotId?: number;
  plotName?: string;
  cropType?: string;
  areaM2?: number;
}

const CropPhysiologyVPDStudio: React.FC<CropPhysiologyVPDStudioProps> = ({
  plotId,
  plotName = 'Thửa Ruộng Số 1',
  cropType = 'Sầu riêng Ri6',
  areaM2 = 2500
}) => {
  const [activeTab, setActiveTab] = useState<'VPD' | 'FAO56' | 'PARETO'>('VPD');
  const [vpdData, setVpdData] = useState<any>(null);
  const [faoData, setFaoData] = useState<any>(null);
  const [paretoData, setParetoData] = useState<any>(null);
  const [selectedParetoId, setSelectedParetoId] = useState<string>('SCENARIO_MAX_PROFIT');

  // Interactive Live Simulator Sliders
  const [simTemp, setSimTemp] = useState<number>(32);
  const [simHumidity, setSimHumidity] = useState<number>(65);

  const fetchData = async () => {
    if (!plotId) return;
    try {
      const [vpdRes, faoRes, paretoRes] = await Promise.all([
        api.get(`/crop-physics/vpd/${plotId}`),
        api.get(`/crop-physics/fao56/${plotId}`),
        api.get(`/crop-physics/pareto/${plotId}`)
      ]);
      setVpdData(vpdRes.data);
      setFaoData(faoRes.data);
      setParetoData(paretoRes.data);

      if (vpdRes.data?.physics_inputs) {
        setSimTemp(vpdRes.data.physics_inputs.air_temperature_c);
        setSimHumidity(vpdRes.data.physics_inputs.relative_humidity_pct);
      }
    } catch (err) {
      console.error('Failed to load crop physics data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [plotId]);

  // Live client-side simulation formula based on sliders
  const calculateSimulatedVPD = (T: number, RH: number) => {
    const esAir = 0.61078 * Math.exp((17.27 * T) / (T + 237.3));
    const ea = esAir * (RH / 100);
    const leafTempOffset = RH > 80 ? -0.5 : RH < 40 ? 1.2 : -1.8;
    const Tleaf = T + leafTempOffset;
    const esLeaf = 0.61078 * Math.exp((17.27 * Tleaf) / (Tleaf + 237.3));
    const leafVpd = Math.max(0, esLeaf - ea);
    return Math.round(leafVpd * 100) / 100;
  };

  const simVPD = calculateSimulatedVPD(simTemp, simHumidity);

  // Determine Stomata State from simVPD
  let vpdColor = 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40';
  let stomataLabel = 'Khí Khổng Mở 100% (Quang Hợp Cực Đại)';
  let vpdStateText = 'VÙNG VÀNG QUANG HỢP (0.8 - 1.2 kPa)';

  if (simVPD < 0.4) {
    vpdColor = 'text-sky-400 border-sky-500/50 bg-sky-950/40';
    stomataLabel = 'Thoát Hơi Nước Bị Nghẽn (Canxi không dẫn lên ngọn)';
    vpdStateText = 'QUÁ ẨM (< 0.4 kPa)';
  } else if (simVPD >= 0.4 && simVPD < 0.8) {
    vpdColor = 'text-teal-300 border-teal-500/50 bg-teal-950/40';
    stomataLabel = 'Khí Khổng Mở 75% (Quang Hợp Ổn Định)';
    vpdStateText = 'THOÁT HƠI NƯỚC CHẬM (0.4 - 0.8 kPa)';
  } else if (simVPD > 1.2 && simVPD <= 1.6) {
    vpdColor = 'text-amber-400 border-amber-500/50 bg-amber-950/40';
    stomataLabel = 'Khí Khổng Khép 50% (Đang Tự Vệ Chống Mất Nước)';
    vpdStateText = 'CĂNG THẲNG NƯỚC NHẸ (1.2 - 1.6 kPa)';
  } else if (simVPD > 1.6) {
    vpdColor = 'text-rose-400 border-rose-500/50 bg-rose-950/40';
    stomataLabel = 'Khí Khổng Đóng Chặt 100% (Ngừng Quang Hợp, Rụng Hoa)';
    vpdStateText = 'CẢNH BÁO: CĂNG THẲNG CẤP TÍNH (> 1.6 kPa)';
  }

  return (
    <section
      aria-label="Động cơ Sinh lý Cây trồng VPD & FAO-56"
      className="bg-stone-950 border border-indigo-500/40 rounded-3xl p-6 text-stone-100 shadow-2xl space-y-6 font-sans relative overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-teal-400 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-indigo-500/20 shrink-0">
            <BeakerIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white">
                Động Cơ Sinh Lý Thực Vật & Cân Bằng Nhiệt Động Học FAO-56
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                ADVANCED CROP BIOPHYSICS
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Thửa đất: <strong className="text-emerald-400">{plotName}</strong> • Cây trồng:{' '}
              <strong className="text-white">{cropType}</strong> • Quy mô: <strong>{areaM2.toLocaleString()} m²</strong>
            </p>
          </div>
        </div>

        {/* Live Stomata Status Pill */}
        <div className={`px-4 py-2 rounded-2xl border ${vpdColor} flex items-center gap-2 shrink-0 shadow-lg`}>
          <div className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
          <div>
            <span className="text-[10px] uppercase font-black block opacity-80">Trạng Thái Khí Khổng Lá</span>
            <strong className="text-xs font-black">{stomataLabel}</strong>
          </div>
        </div>
      </div>

      {/* Studio Tabs */}
      <div className="flex bg-stone-900/90 p-1.5 rounded-2xl border border-stone-800 text-xs font-black gap-2 max-w-lg">
        <button
          type="button"
          onClick={() => setActiveTab('VPD')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'VPD'
              ? 'bg-indigo-700 text-white shadow-md shadow-indigo-900/50'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <SparklesIcon className="w-4 h-4 text-indigo-300" />
          <span>Áp Suất Khí Khổng (VPD)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('FAO56')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'FAO56'
              ? 'bg-teal-700 text-white shadow-md shadow-teal-900/50'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <BoltIcon className="w-4 h-4 text-teal-300" />
          <span>Bốc Thoát Hơi Nước FAO-56</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PARETO')}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'PARETO'
              ? 'bg-purple-700 text-white shadow-md shadow-purple-900/50'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <ArrowTrendingUpIcon className="w-4 h-4 text-purple-300" />
          <span>Tối Ưu Pareto (NSGA-II)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REAL-TIME VPD & STOMATA APERTURE SIMULATOR                          */}
      {/* ========================================================================= */}
      {activeTab === 'VPD' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Dial & Scientific Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Animated VPD Gauge Visualizer */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-stone-900/90 border border-stone-800 flex flex-col items-center justify-center text-center space-y-4 relative">
              <div className="relative flex items-center justify-center">
                {/* Visual Leaf Pores Animation Ring */}
                <div
                  className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${
                    simVPD >= 0.8 && simVPD <= 1.2
                      ? 'border-emerald-500 bg-emerald-950/20 shadow-emerald-500/30'
                      : simVPD < 0.8
                      ? 'border-sky-500 bg-sky-950/20 shadow-sky-500/30'
                      : 'border-rose-500 bg-rose-950/20 shadow-rose-500/30'
                  }`}
                >
                  <span className="text-[11px] font-black uppercase text-stone-400">Áp Suất Thiếu Hụt (VPD)</span>
                  <span className="text-4xl font-black text-white tracking-tight mt-1">
                    {simVPD} <span className="text-sm font-bold text-stone-400">kPa</span>
                  </span>
                  <span className="text-[10px] font-black uppercase text-emerald-400 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40">
                    {vpdStateText}
                  </span>
                </div>
              </div>

              {/* Stomata Visual State Graphic */}
              <div className="w-full bg-stone-950 p-3 rounded-2xl border border-stone-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-stone-400">
                  <span>Độ Mở Khí Khổng (Stomata Aperture):</span>
                  <strong className="text-white">
                    {simVPD >= 0.8 && simVPD <= 1.2 ? '100% (Tối Đa)' : simVPD < 0.8 ? '70%' : '15% (Đóng)'}
                  </strong>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      simVPD >= 0.8 && simVPD <= 1.2 ? 'bg-emerald-400 w-full' : simVPD < 0.8 ? 'bg-sky-400 w-3/4' : 'bg-rose-500 w-1/6'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Simulation Sliders */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-5">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <h4 className="text-xs font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
                  <AdjustmentsHorizontalIcon className="w-4 h-4 text-indigo-400" /> Bàn Mô Phỏng Vi Khí Hậu Tương Tác
                </h4>
                <span className="text-[10px] text-stone-400">Kéo thanh trượt để thử nghiệm</span>
              </div>

              {/* Slider 1: Air Temp */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-bold">Nhiệt Độ Không Khí (T_air):</span>
                  <span className="text-sm font-black text-amber-400">{simTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="45"
                  step="0.5"
                  value={simTemp}
                  onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>20°C (Mát mẻ)</span>
                  <span>32°C (Chuẩn)</span>
                  <span>45°C (Nắng gắt)</span>
                </div>
              </div>

              {/* Slider 2: Relative Humidity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-bold">Độ Ẩm Tương Đối ($RH$):</span>
                  <span className="text-sm font-black text-sky-400">{simHumidity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  step="1"
                  value={simHumidity}
                  onChange={(e) => setSimHumidity(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>20% (Khô hạn)</span>
                  <span>65% (Lý tưởng)</span>
                  <span>95% (Mưa ẩm)</span>
                </div>
              </div>

              {/* Physiological Diagnosis Output */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800/80 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                  <span>Khuyến Cáo Tự Động Từ Động Cơ Vật Lý:</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  {vpdData?.vpd_results?.scientific_explanation ||
                    'Duy trì chỉ số VPD trong vùng 0.8 - 1.2 kPa giúp lỗ khí khổng mở tối đa, tăng 35% hiệu suất quang hợp tự nhiên.'}
                </p>
                <div className="pt-1.5 border-t border-stone-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-indigo-300 font-bold">Giao thức xử lý:</span>
                  <span className="text-stone-300">{vpdData?.vpd_results?.action_protocol || 'Tự động kích hoạt béc phun sương khi VPD > 1.4 kPa.'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FAO-56 PENMAN-MONTEITH EVAPOTRANSPIRATION ENGINE                   */}
      {/* ========================================================================= */}
      {activeTab === 'FAO56' && (
        <div className="space-y-6 animate-fade-in">
          {/* Energy Balance Thermodynamic Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 text-center space-y-1">
              <span className="text-[10px] text-stone-400 uppercase font-black block">Bức Xạ Ròng (Rn)</span>
              <span className="text-xl font-black text-amber-400">
                {faoData?.thermodynamic_factors?.net_solar_radiation_rn_mj || 21.4}
              </span>
              <span className="text-[10px] text-stone-500 block">MJ / m² / ngày</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 text-center space-y-1">
              <span className="text-[10px] text-stone-400 uppercase font-black block">Tốc Độ Gió Cao 2m (u2)</span>
              <span className="text-xl font-black text-sky-400">
                {faoData?.thermodynamic_factors?.wind_speed_2m_u2_ms || 3.3} m/s
              </span>
              <span className="text-[10px] text-stone-500 block">Thông lượng gió bề mặt</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 text-center space-y-1">
              <span className="text-[10px] text-stone-400 uppercase font-black block">Hệ Số Tán Kép (Kc)</span>
              <span className="text-xl font-black text-emerald-400">
                {faoData?.fao56_results?.dual_crop_coefficient_kc || 1.23}
              </span>
              <span className="text-[10px] text-stone-500 block">(Kcb = 1.05 + Ke = 0.18)</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 text-center space-y-1">
              <span className="text-[10px] text-stone-400 uppercase font-black block">Chuẩn Bốc Thoát (ET0)</span>
              <span className="text-xl font-black text-purple-400">
                {faoData?.fao56_results?.reference_evapotranspiration_et0_mm_day || 4.85}
              </span>
              <span className="text-[10px] text-stone-500 block">mm / ngày</span>
            </div>
          </div>

          {/* Water Demand & Water Saving Comparison */}
          <div className="p-6 rounded-3xl bg-teal-950/20 border border-teal-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs text-teal-300 font-black uppercase tracking-wider block">
                  Nhu Cầu Tưới Chính Xác Cho Thửa {plotName} ({areaM2.toLocaleString()} m²)
                </span>
                <div className="text-3xl font-black text-white mt-1">
                  {faoData?.fao56_results?.exact_daily_water_demand_liters?.toLocaleString() || '14,800'}{' '}
                  <span className="text-sm font-bold text-teal-300">Lít / Ngày</span>
                </div>
              </div>

              <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-2xl text-right">
                <span className="text-[10px] text-emerald-300 font-bold block">TIẾT KIỆM NƯỚC NGỌT</span>
                <strong className="text-xl font-black text-emerald-400">
                  +{faoData?.fao56_results?.water_savings_percent || 38}%
                </strong>
              </div>
            </div>

            {/* Comparison Visual Bars */}
            <div className="space-y-2 pt-2">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>Tưới đại trà không tính toán (Lãng phí thừa):</span>
                  <span>{faoData?.fao56_results?.traditional_watering_liters?.toLocaleString() || '24,000'} Lít</span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500/60 h-full w-full rounded-full" />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Tưới chính xác theo chuẩn FAO-56 Penman-Monteith:</span>
                  <span>{faoData?.fao56_results?.exact_daily_water_demand_liters?.toLocaleString() || '14,800'} Lít</span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${100 - (faoData?.fao56_results?.water_savings_percent || 38)}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-300 italic pt-2 border-t border-teal-900/40">
              💡 {faoData?.fao56_results?.scientific_advice}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MULTI-OBJECTIVE PARETO FRONTIER OPTIMIZATION (NSGA-II)              */}
      {/* ========================================================================= */}
      {activeTab === 'PARETO' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-stone-800 pb-2">
            <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider">
              3 Kịch Bản Tối Ưu Hóa Đa Mục Tiêu Pareto (Pareto-Optimal Frontier)
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              Giải quyết bài toán cân bằng giữa: Chi phí đầu vào $\leftrightarrow$ Năng suất lợi nhuận $\leftrightarrow$ Điểm VietGAP Xanh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(paretoData?.pareto_scenarios || []).map((sc: any) => {
              const isSelected = selectedParetoId === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedParetoId(sc.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-4 relative ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-400 shadow-xl shadow-purple-950/40 ring-2 ring-purple-400/40'
                      : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-stone-950 border border-stone-800 text-purple-300">
                      {sc.tag}
                    </span>
                    {isSelected && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckBadgeIcon className="w-4 h-4" /> Đang Áp Dụng
                      </span>
                    )}
                  </div>

                  <div>
                    <h5 className="text-sm font-black text-white">{sc.name}</h5>
                    <p className="text-xs text-stone-300 mt-1 leading-relaxed">{sc.description}</p>
                  </div>

                  {/* Quantitative Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-stone-950 p-3 rounded-2xl border border-stone-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Lợi Nhuận Kỳ Vọng:</span>
                      <strong className="text-emerald-400 text-sm">
                        {Math.round(sc.metrics.estimated_profit_vnd / 1000000)} Triệu
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">Điểm VietGAP:</span>
                      <strong className="text-purple-300 text-sm">{sc.metrics.vietgap_score} / 100</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">Chi Phí Đầu Vào:</span>
                      <strong className="text-stone-300">
                        {Math.round(sc.metrics.input_cost_vnd / 1000000)} Triệu
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">Giảm Phân Hóa Học:</span>
                      <strong className="text-teal-400">-{sc.metrics.chemical_reduction_pct}%</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedParetoId(sc.id);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                    }`}
                  >
                    {isSelected ? '✓ Đang Kích Hoạt Kịch Bản Này' : 'Áp Dụng Kịch Bản Này'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default CropPhysiologyVPDStudio;
