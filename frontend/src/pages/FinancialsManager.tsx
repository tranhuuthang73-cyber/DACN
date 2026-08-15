import React, { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  BeakerIcon,
  SunIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import api from '../api';

const FinancialsManager: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/financials/summary');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center text-stone-300 font-bold">
        Đang tính toán Báo cáo Lợi nhuận & Chi phí...
      </div>
    );
  }

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  return (
    <section aria-labelledby="financials-heading" className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      {/* Header Banner */}
      <header className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-stone-200 shadow-xl relative overflow-hidden">
        <div>
          <h1 id="financials-heading" className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-3">
            <BanknotesIcon className="w-8 h-8 text-emerald-700" aria-hidden="true" />
            Tài Chính & Lợi Nhuận Nông Trại
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Tối ưu chi phí tưới bón, phân tích tỷ suất lợi nhuận ROI và hiệu quả kinh tế trên mỗi m²
          </p>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200/80 px-5 py-3 rounded-2xl">
          <ScaleIcon className="w-6 h-6 text-emerald-700" aria-hidden="true" />
          <div>
            <div className="text-[11px] text-emerald-900 font-bold uppercase tracking-wider">Chi phí trung bình / m²</div>
            <div className="text-base sm:text-lg font-black text-emerald-950">{formatVnd(data?.costPerM2)} / m²</div>
          </div>
        </div>
      </header>

      {/* KPI Cards Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue Card */}
        <article className="glass-card p-6 rounded-3xl border border-stone-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-stone-500 uppercase tracking-wider">
            <span>Tổng Doanh Thu</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ArrowTrendingUpIcon className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {formatVnd(data?.totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-700 font-extrabold">Từ sản lượng thu hoạch thực tế</div>
        </article>

        {/* Expenses Card */}
        <article className="glass-card p-6 rounded-3xl border border-stone-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-stone-500 uppercase tracking-wider">
            <span>Tổng Chi Phí Vật Tư</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
              <ArrowTrendingDownIcon className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {formatVnd(data?.totalExpense)}
          </div>
          <div className="text-[11px] text-rose-600 font-extrabold">Nước tưới + Phân bón + Khác</div>
        </article>

        {/* Net Profit Card */}
        <article className="glass-card p-6 rounded-3xl border border-stone-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-stone-500 uppercase tracking-wider">
            <span>Lợi Nhuận Ròng</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <BanknotesIcon className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            {formatVnd(data?.netProfit)}
          </div>
          <div className="text-[11px] text-stone-500 font-bold">Doanh thu - Tổng chi phí</div>
        </article>

        {/* ROI Card */}
        <article className="glass-card p-6 rounded-3xl border border-stone-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-stone-500 uppercase tracking-wider">
            <span>Tỷ Suất ROI</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <ScaleIcon className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-950 tracking-tight">
            +{data?.roi}%
          </div>
          <div className="text-[11px] text-purple-700 font-extrabold">Hiệu quả đầu tư kinh tế</div>
        </article>
      </div>

      {/* Expense Breakdown Details */}
      <section aria-labelledby="breakdown-heading" className="glass-card rounded-3xl p-6 sm:p-8 border border-stone-200 space-y-6">
        <h2 id="breakdown-heading" className="text-xl font-black text-stone-900">
          Phân bổ Chi phí Vật tư & Đầu vào Canh tác
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Water Expense Card */}
          <div className="p-5 bg-sky-50/80 rounded-2xl border border-sky-200 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-sky-900 uppercase">Chi phí Nước tưới</div>
              <div className="text-xl font-black text-sky-950">{formatVnd(data?.breakdown?.water)}</div>
              <div className="text-[11px] text-sky-700 font-medium">Đơn giá 10đ / Lít</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-200/80 flex items-center justify-center text-sky-700">
              <SunIcon className="w-6 h-6" aria-hidden="true" />
            </div>
          </div>

          {/* Fertilizer Expense Card */}
          <div className="p-5 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-amber-900 uppercase">Chi phí Phân bón</div>
              <div className="text-xl font-black text-amber-950">{formatVnd(data?.breakdown?.fertilizer)}</div>
              <div className="text-[11px] text-amber-700 font-medium">Đơn giá 25,000đ / kg</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-200/80 flex items-center justify-center text-amber-700">
              <BeakerIcon className="w-6 h-6" aria-hidden="true" />
            </div>
          </div>

          {/* Other Expense Card */}
          <div className="p-5 bg-purple-50/80 rounded-2xl border border-purple-200 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-purple-900 uppercase">Thuốc BVTV & Khác</div>
              <div className="text-xl font-black text-purple-950">{formatVnd(data?.breakdown?.other)}</div>
              <div className="text-[11px] text-purple-700 font-medium">Đơn giá 50,000đ / lần</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-200/80 flex items-center justify-center text-purple-700">
              <WrenchScrewdriverIcon className="w-6 h-6" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default FinancialsManager;
