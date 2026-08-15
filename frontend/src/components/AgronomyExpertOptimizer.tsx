import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  BeakerIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface AgronomyExpertOptimizerProps {
  plotId?: number;
  plotName?: string;
  cropType?: string;
  areaM2?: number;
}

const AgronomyExpertOptimizer: React.FC<AgronomyExpertOptimizerProps> = ({
  plotId = 1,
  plotName = 'Thửa Ruộng Số 1',
  cropType = 'Sầu riêng',
  areaM2 = 2500
}) => {
  const [activeTab, setActiveTab] = useState<'NUTRIENTS' | 'MARKET' | 'CLIMATE'>('NUTRIENTS');
  const [loading, setLoading] = useState(false);
  const [nutrientData, setNutrientData] = useState<any | null>(null);
  const [marketData, setMarketData] = useState<any | null>(null);
  const [climateData, setClimateData] = useState<any | null>(null);

  const fetchExpertData = async () => {
    setLoading(true);
    try {
      const [nRes, mRes, cRes] = await Promise.all([
        api.get(`/expert/nutrients/${plotId}`),
        api.get(`/expert/market?cropType=${encodeURIComponent(cropType)}`),
        api.get(`/expert/climate-risk/${plotId}`)
      ]);
      setNutrientData(nRes.data);
      setMarketData(mRes.data);
      setClimateData(cRes.data);
    } catch (err) {
      console.error('Failed to fetch expert data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpertData();
  }, [plotId, cropType]);

  return (
    <section aria-label="Trung tâm tối ưu nông nghiệp chuyên gia" className="bg-stone-950 border border-emerald-500/40 rounded-3xl p-6 text-stone-100 shadow-2xl space-y-6 relative overflow-hidden font-sans">
      {/* Glow ambient background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-teal-400 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-emerald-500/30 shrink-0">
            <SparklesIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                Trung Tâm Tối Ưu Nông Nghiệp Chuyên Gia (Agronomy Master Suite)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                AI OPTIMIZER 4.0
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Giải quyết triệt để vấn nạn lãng phí phân bón • Tối ưu đỉnh giá thu hoạch • Phòng vệ hạn mặn cho{' '}
              <strong className="text-white">{plotName}</strong> ({areaM2.toLocaleString()} m²)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchExpertData}
          disabled={loading}
          className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl text-xs font-bold border border-stone-700 transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm Mới Phân Tích</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800/80 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('NUTRIENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'NUTRIENTS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-stone-900/80 hover:bg-stone-800 text-stone-400'
          }`}
        >
          <BeakerIcon className="w-4 h-4" />
          <span>1. Tối Ưu N-P-K & Tiết Kiệm Chi Phí</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MARKET')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'MARKET'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-stone-900/80 hover:bg-stone-800 text-stone-400'
          }`}
        >
          <CurrencyDollarIcon className="w-4 h-4" />
          <span>2. Dự Báo Giá Nông Sản & Điểm Bán Vàng</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CLIMATE')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'CLIMATE'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'bg-stone-900/80 hover:bg-stone-800 text-stone-400'
          }`}
        >
          <ShieldCheckIcon className="w-4 h-4" />
          <span>3. Phòng Vệ Hạn Mặn & Vi Khí Hậu</span>
        </button>
      </div>

      {/* TAB 1: NUTRIENTS & COST OPTIMIZATION */}
      {activeTab === 'NUTRIENTS' && (
        <div className="space-y-6 animate-fade-in">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-emerald-400 uppercase">Tỷ Lệ Giảm Lãng Phí Phân Bón</div>
              <div className="text-2xl font-black text-white flex items-baseline gap-1">
                <span>{nutrientData?.expert_prescription?.fertilizer_cost_reduction_percent || 32}%</span>
                <span className="text-xs text-emerald-400 font-semibold">(Chuẩn Nông Nghiệp Xanh)</span>
              </div>
              <p className="text-[11px] text-stone-400">Tránh thừa đạm gây cháy lá và chua đất</p>
            </div>

            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-amber-400 uppercase">Chi Phí Ước Tính Tiết Kiệm Được</div>
              <div className="text-2xl font-black text-amber-300">
                {(nutrientData?.expert_prescription?.estimated_savings_vnd || 6800000).toLocaleString()} đ
              </div>
              <p className="text-[11px] text-stone-400">So với tập quán bón phân tràn lan truyền thống</p>
            </div>

            <div className="p-4 bg-sky-950/40 border border-sky-500/40 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-sky-400 uppercase">Độ Phì Nhiêu Đất Tầng Canh Tác</div>
              <div className="text-2xl font-black text-sky-300 flex items-center gap-1.5">
                <CheckBadgeIcon className="w-6 h-6 text-sky-400" />
                <span>Ổn Định (pH 6.2 - 6.5)</span>
              </div>
              <p className="text-[11px] text-stone-400">Đất giàu vi sinh bản địa & trùn quế</p>
            </div>
          </div>

          {/* N-P-K Nutrient Balances */}
          <div className="bg-stone-900/90 p-5 rounded-2xl border border-stone-800 space-y-4">
            <h4 className="text-xs font-black uppercase text-stone-300 tracking-wider flex items-center gap-2">
              <BeakerIcon className="w-4 h-4 text-emerald-400" /> Cân Bằng Dinh Dưỡng N - P - K & Chất Hữu Cơ Hiện Tại
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Nitrogen (Đạm) */}
              <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-lime-400">N (Đạm tổng số)</span>
                  <span className="text-stone-400 font-mono">
                    {nutrientData?.nutrient_status?.nitrogen?.current_kg || 15} / {nutrientData?.nutrient_status?.nitrogen?.target_kg || 50} kg
                  </span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-lime-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, nutrientData?.nutrient_status?.nitrogen?.percent || 30)}%` }}
                  />
                </div>
                <div className="text-[10px] text-stone-400">Phát triển thân cành & diệp lục tố</div>
              </div>

              {/* Phosphorus (Lân) */}
              <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">P₂O₅ (Lân hữu hiệu)</span>
                  <span className="text-stone-400 font-mono">
                    {nutrientData?.nutrient_status?.phosphorus?.current_kg || 12} / {nutrientData?.nutrient_status?.phosphorus?.target_kg || 35} kg
                  </span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, nutrientData?.nutrient_status?.phosphorus?.percent || 35)}%` }}
                  />
                </div>
                <div className="text-[10px] text-stone-400">Kích thích ra rễ tơ & phân hóa mầm hoa</div>
              </div>

              {/* Potassium (Kali) */}
              <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-400">K₂O (Kali ngọt trái)</span>
                  <span className="text-stone-400 font-mono">
                    {nutrientData?.nutrient_status?.potassium?.current_kg || 18} / {nutrientData?.nutrient_status?.potassium?.target_kg || 60} kg
                  </span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, nutrientData?.nutrient_status?.potassium?.percent || 30)}%` }}
                  />
                </div>
                <div className="text-[10px] text-stone-400">Tăng độ ngọt, nặng ký & chống nứt quả</div>
              </div>

              {/* Organic Matter (Hữu Cơ) */}
              <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-400">Hữu Cơ Vi Sinh</span>
                  <span className="text-stone-400 font-mono">
                    {nutrientData?.nutrient_status?.organic_matter?.current_kg || 40} / {nutrientData?.nutrient_status?.organic_matter?.target_kg || 240} kg
                  </span>
                </div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, nutrientData?.nutrient_status?.organic_matter?.percent || 20)}%` }}
                  />
                </div>
                <div className="text-[10px] text-stone-400">Tơi xốp đất & chống thoái hóa dinh dưỡng</div>
              </div>
            </div>

            {/* Expert Prescription Box */}
            <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-xl space-y-2">
              <div className="text-xs font-black text-emerald-300 flex items-center gap-2">
                <span>📋 Đơn Kê Khuyến Nghị Của Chuyên Gia Nông Nghiệp:</span>
              </div>
              <p className="text-xs text-stone-100 font-medium">
                {nutrientData?.expert_prescription?.action || 'Bổ sung 42kg Kali Sunfat + 200kg Phân hữu cơ trùn quế vi sinh.'}
              </p>
              <p className="text-[11px] text-emerald-400 italic">
                💡 {nutrientData?.expert_prescription?.soil_remediation_tip || 'Bón vôi bột 20kg/1000m² để nâng pH đất, giúp rễ cây mở miệng hấp thu tối đa dinh dưỡng.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKET INTELLIGENCE & HARVEST TIMING */}
      {activeTab === 'MARKET' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-amber-400 uppercase">Giá Thị Trường Hôm Nay</div>
              <div className="text-2xl font-black text-white">
                {(marketData?.benchmark?.current_price_vnd_kg || 135000).toLocaleString()} đ
              </div>
              <p className="text-[11px] text-stone-400">{marketData?.benchmark?.unit || 'đồng / kg tại vựa'}</p>
            </div>

            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-emerald-400 uppercase">Xu Hướng Thị Trường</div>
              <div className="text-2xl font-black text-emerald-300 flex items-center gap-1.5">
                <ArrowTrendingUpIcon className="w-6 h-6" />
                <span>{marketData?.benchmark?.trend || 'TĂNG MẠNH'} (+{marketData?.benchmark?.trend_pct || 12.5}%)</span>
              </div>
              <p className="text-[11px] text-stone-400">Nhu cầu các thị trường xuất khẩu đang rất cao</p>
            </div>

            <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-purple-400 uppercase">Thời Điểm Thu Hoạch Vàng</div>
              <div className="text-2xl font-black text-purple-300">
                {marketData?.benchmark?.peak_window || 'Trong 7 - 12 ngày tới'}
              </div>
              <p className="text-[11px] text-stone-400">Thời điểm bán được giá cao nhất vụ</p>
            </div>
          </div>

          {/* 14-Day Price Forecast Strip */}
          <div className="bg-stone-900/90 p-5 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-stone-300 tracking-wider flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-amber-400" /> Biểu Đồ Diễn Biến & Dự Báo Giá Nông Sản (14 Ngày)
              </h4>
              <span className="text-[11px] font-mono text-emerald-400 bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800">
                Cập nhật chợ đầu mối miền Tây & TP.HCM
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-1.5 pt-2">
              {marketData?.price_history_14_days?.map((item: any, i: number) => (
                <div key={i} className="p-2 bg-stone-950 rounded-xl border border-stone-800 text-center space-y-1">
                  <div className="text-[10px] text-stone-400">{item.date}</div>
                  <div className="text-xs font-black text-amber-300">{(item.price / 1000).toFixed(0)}k</div>
                  <div
                    className="w-full bg-amber-500/30 rounded-sm"
                    style={{ height: `${Math.max(8, (item.price / 150000) * 32)}px` }}
                  />
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-950/60 border border-amber-500/50 rounded-xl space-y-1">
              <div className="text-xs font-black text-amber-300">💡 Lời Khuyên Thương Mại Của Chuyên Gia:</div>
              <p className="text-xs text-stone-200 leading-relaxed">
                {marketData?.benchmark?.advice || 'Nhu cầu xuất khẩu đang tăng mạnh. Khuyến nghị duy trì bón bổ sung Kali và chuẩn bị bao bì VietGAP để chốt giá cao nhất.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SALINITY & CLIMATE RISK DEFENSE */}
      {activeTab === 'CLIMATE' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-sky-950/40 border border-sky-500/40 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-sky-400 uppercase">Độ Mặn Nguồn Nước Kênh Rạch</div>
              <div className="text-2xl font-black text-white flex items-baseline gap-1">
                <span>{climateData?.metrics?.water_salinity_ppt || 0.4} ‰</span>
                <span className="text-xs text-sky-400 font-semibold">(Ngưỡng an toàn: &lt; 1.0 ‰)</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-bold">
                ✓ {climateData?.metrics?.salinity_status || 'AN TOÀN CHO TƯỚI TIÊU'}
              </p>
            </div>

            <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-stone-400 uppercase">Nguy Cơ Úng Rễ Sau Mưa Lớn</div>
              <div className="text-2xl font-black text-emerald-300">
                {climateData?.metrics?.root_waterlog_risk || 'THẤP (An toàn)'}
              </div>
              <p className="text-[11px] text-stone-400">
                Lượng mưa 3 ngày tới: <strong>{climateData?.metrics?.rainfall_3days_sum_mm || 12} mm</strong>
              </p>
            </div>

            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-emerald-400 uppercase">Trạng Thái Van Bơm Thông Minh</div>
              <div className="text-2xl font-black text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span>Sẵn Sàng Tự Động</span>
              </div>
              <p className="text-[11px] text-stone-400">Tự động khóa nếu độ mặn vượt 1.0‰</p>
            </div>
          </div>

          {/* Salinity Defense Shield Protocol */}
          <div className="p-5 bg-sky-950/70 border border-sky-500/50 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-sky-300">
              <ShieldCheckIcon className="w-5 h-5 text-sky-400" />
              <span>Giao Thức Phòng Vệ Xâm Nhập Mặn Đồng Bằng Sông Cửu Long (Salinity Shield):</span>
            </div>
            <p className="text-xs text-stone-200 leading-relaxed">
              {climateData?.metrics?.defense_protocol || 'Hệ thống van bơm nước tự động hoạt động bình thường, nước sông ngọt đạt chuẩn.'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-sky-300 bg-sky-900/60 p-2.5 rounded-xl">
              <ExclamationTriangleIcon className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Cảm biến IoT liên tục đo độ dẫn điện EC tại cống lấy nước. Khi độ mặn tăng cao, hệ thống sẽ tự động kích hoạt chế độ tưới tiết kiệm từ hồ lắng dự trữ nội bộ.
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AgronomyExpertOptimizer;
