import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  SparklesIcon,
  CheckBadgeIcon,
  CalculatorIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface HarvestSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  plot: any;
  season: any;
  logs: any[];
  onHarvestCompleted: () => void;
}

const DEFAULT_MARKET_PRICES: Record<string, number> = {
  'sầu riêng': 135000,
  'durian': 135000,
  'cam': 28000,
  'bưởi': 38000,
  'lúa': 9500,
  'rice': 9500,
  'dừa': 18000,
  'xoài': 45000,
  'cà phê': 105000,
  'thanh long': 32000
};

const HarvestSettlementModal: React.FC<HarvestSettlementModalProps> = ({
  isOpen,
  onClose,
  plot,
  season,
  logs,
  onHarvestCompleted
}) => {
  // Crop & Market Default Price
  const cropType = (season?.crop_type || 'Sầu riêng Ri6').toLowerCase();
  let defaultPrice = 50000;
  for (const [key, price] of Object.entries(DEFAULT_MARKET_PRICES)) {
    if (cropType.includes(key)) {
      defaultPrice = price;
      break;
    }
  }

  // Calculated Input Cost from all farming logs
  const logCost = logs.reduce((sum, l) => sum + (l.cost_vnd || 0), 0);
  const baselineSeedCost = Math.round((plot?.area_m2 || 1000) * 15); // e.g. 15,000đ/m2 for seed & soil prep
  const totalBaseCost = logCost > 0 ? logCost + baselineSeedCost : baselineSeedCost * 2.5;

  // Form State
  const [actualYieldKg, setActualYieldKg] = useState<number>(season?.target_yield ? season.target_yield * 1000 : 3500);
  const [unitPriceVnd, setUnitPriceVnd] = useState<number>(defaultPrice);
  const [extraHarvestCost, setExtraHarvestCost] = useState<number>(3000000); // 3M VND for harvesting labor & packaging
  const [qualityGrade, setQualityGrade] = useState<'A' | 'B' | 'C'>('A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial Calculations
  const totalInputCost = totalBaseCost + Number(extraHarvestCost || 0);
  const grossRevenue = Number(actualYieldKg || 0) * Number(unitPriceVnd || 0);
  const netProfit = grossRevenue - totalInputCost;
  const roiPercent = totalInputCost > 0 ? Math.round((netProfit / totalInputCost) * 100) : 0;
  const profitPerKg = actualYieldKg > 0 ? Math.round(netProfit / actualYieldKg) : 0;

  useEffect(() => {
    if (isOpen && season) {
      if (season.target_yield) {
        setActualYieldKg(season.target_yield * 1000);
      }
    }
  }, [isOpen, season]);

  const handleCompleteHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!season?.id) return;

    setIsSubmitting(true);
    try {
      await api.put(`/seasons/${season.id}`, {
        actual_yield: Number(actualYieldKg) / 1000, // in tons
        actual_harvest_date: new Date().toISOString(),
        quality: qualityGrade,
        status: 'HARVESTED',
        unit_price_vnd: Number(unitPriceVnd),
        revenue_vnd: Number(grossRevenue)
      });

      onHarvestCompleted();
      onClose();
    } catch (err: any) {
      alert('Lỗi cập nhật thu hoạch: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in font-sans">
      <div className="bg-stone-900 border border-emerald-500/50 text-stone-100 rounded-3xl max-w-2xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <div className="p-4 border-b border-stone-800 bg-gradient-to-r from-emerald-950 via-stone-950 to-teal-950 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-500 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-amber-500/30">
              <ScaleIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Quyết Toán Thu Hoạch & Tính Lãi Ròng Vụ Mùa</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  VIETGAP SETTLEMENT
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Thửa: <strong className="text-white">{plot?.name}</strong> • Cây: <strong className="text-emerald-400">{season?.crop_type}</strong> ({plot?.area_m2?.toLocaleString()} m²)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleCompleteHarvest} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* NET PROFIT GLOWING HERO CARD */}
          <div className={`p-5 rounded-3xl border-2 transition-all shadow-2xl relative overflow-hidden ${
            netProfit >= 0
              ? 'bg-gradient-to-br from-emerald-950/80 via-stone-900 to-teal-950/80 border-emerald-500/60'
              : 'bg-gradient-to-br from-rose-950/80 via-stone-900 to-amber-950/80 border-rose-500/60'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest font-black text-stone-400 block">
                  {netProfit >= 0 ? '💰 LỢI NHUẬN THUẦN (LÃI RÒNG THỰC NHẬN)' : '⚠️ KẾT QUẢ TÀI CHÍNH (LỖ VỐN)'}
                </span>
                <div className={`text-3xl sm:text-4xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()} <span className="text-base font-bold text-stone-400">VNĐ</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 text-center min-w-[100px]">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Tỷ Suất ROI</span>
                  <span className={`text-lg font-black ${roiPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {roiPercent}%
                  </span>
                </div>
                <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 text-center min-w-[100px]">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Lãi / 1 kg</span>
                  <span className={`text-lg font-black ${profitPerKg >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {profitPerKg.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Equation Breakdown Strip */}
            <div className="mt-4 pt-3 border-t border-stone-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-stone-950/60">
                <span className="text-[10px] text-stone-400 block">Tổng Doanh Thu:</span>
                <strong className="text-sky-400 text-xs sm:text-sm">{grossRevenue.toLocaleString()} đ</strong>
              </div>
              <div className="p-2 rounded-xl bg-stone-950/60">
                <span className="text-[10px] text-stone-400 block">Trừ Chi Phí Gốc:</span>
                <strong className="text-rose-400 text-xs sm:text-sm">- {totalInputCost.toLocaleString()} đ</strong>
              </div>
              <div className="p-2 rounded-xl bg-stone-950/60">
                <span className="text-[10px] text-stone-400 block">Bằng Tiền Lãi:</span>
                <strong className={`text-xs sm:text-sm ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  = {netProfit.toLocaleString()} đ
                </strong>
              </div>
            </div>
          </div>

          {/* INPUT FORM FIELDS */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
              <CalculatorIcon className="w-4 h-4" />
              <span>Nhập Số Liệu Thu Hoạch Thực Tế Tại Vườn</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Actual Yield */}
              <div>
                <label className="text-stone-300 block mb-1 text-xs font-bold flex items-center justify-between">
                  <span>Sản Lượng Cân Thực Tế (kg):</span>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">{(actualYieldKg / 1000).toFixed(2)} Tấn</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={actualYieldKg}
                  onChange={(e) => setActualYieldKg(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="3500"
                />
              </div>

              {/* Unit Price */}
              <div>
                <label className="text-stone-300 block mb-1 text-xs font-bold flex items-center justify-between">
                  <span>Đơn Giá Bán Thực Tế (VNĐ / kg):</span>
                  <span className="text-amber-400 text-[11px] font-bold">Giá vựa thu mua</span>
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  step={500}
                  value={unitPriceVnd}
                  onChange={(e) => setUnitPriceVnd(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="135000"
                />
              </div>

              {/* Quality Grade */}
              <div>
                <label className="text-stone-300 block mb-1 text-xs font-bold">
                  Phân Loại Chất Lượng Nông Sản:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setQualityGrade('A')}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                      qualityGrade === 'A'
                        ? 'bg-emerald-900/80 border-emerald-500 text-white shadow ring-1 ring-emerald-500'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    ⭐ Loại 1 (Xuất Khẩu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQualityGrade('B')}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                      qualityGrade === 'B'
                        ? 'bg-blue-900/80 border-blue-500 text-white shadow ring-1 ring-blue-500'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    📦 Loại 2 (Nội Địa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQualityGrade('C')}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                      qualityGrade === 'C'
                        ? 'bg-amber-900/80 border-amber-500 text-white shadow ring-1 ring-amber-500'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    🥫 Loại 3 (Chế Biến)
                  </button>
                </div>
              </div>

              {/* Extra Harvest Cost */}
              <div>
                <label className="text-stone-300 block mb-1 text-xs font-bold">
                  Chi Phí Thu Hái & Bao Bì Phát Sinh (VNĐ):
                </label>
                <input
                  type="number"
                  min={0}
                  step={500000}
                  value={extraHarvestCost}
                  onChange={(e) => setExtraHarvestCost(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="3000000"
                />
              </div>
            </div>
          </div>

          {/* AI CONTINUOUS LEARNING PROMISE */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-emerald-950/40 to-stone-950 border border-teal-500/30 text-xs flex items-start gap-3">
            <SparklesIcon className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-teal-300 block mb-0.5">Tự Động Huấn Luyện Lại Mô Hình AI (Online Machine Learning):</strong>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Khi bạn bấm xác nhận, thuật toán học máy trực tuyến (SGD Regression) sẽ ghi nhận sản lượng <strong>{(actualYieldKg / 1000).toFixed(2)} tấn</strong> này cùng toàn bộ lịch sử tưới bón để cập nhật trọng số AI, giúp dự đoán và khuyến nghị cho các vụ mùa sau ngày càng chuẩn xác hơn!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs sm:text-sm font-black shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckBadgeIcon className="w-5 h-5 text-amber-300" />
              <span>{isSubmitting ? 'Đang Quyết Toán...' : '✓ Hoàn Tất Thu Hoạch & Chốt Sổ Lãi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HarvestSettlementModal;
