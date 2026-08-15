import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  PlusIcon,
  TrophyIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface SeasonsManagerProps {
  plots: any[];
  selectedPlot: any;
  onPlotSelect: (plot: any) => void;
}

const SeasonsManager: React.FC<SeasonsManagerProps> = ({ plots, selectedPlot, onPlotSelect }) => {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState<any>(null);

  // Form states
  const [cropType, setCropType] = useState('');
  const [plantedDate, setPlantedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [targetYield, setTargetYield] = useState('');

  // Harvest form states
  const [actualYield, setActualYield] = useState('');
  const [quality, setQuality] = useState('A');

  const fetchSeasons = async (plotId: number) => {
    try {
      const { data } = await api.get(`/seasons/plot/${plotId}`);
      setSeasons(data);
    } catch (e) {
      setSeasons([]);
    }
  };

  useEffect(() => {
    if (selectedPlot) {
      fetchSeasons(selectedPlot.id);
    }
  }, [selectedPlot]);

  const handleCreateSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlot) return;

    try {
      await api.post('/seasons', {
        plot_id: selectedPlot.id,
        crop_type: cropType,
        planted_date: plantedDate,
        expected_harvest_date: expectedHarvestDate || null,
        target_yield: parseFloat(targetYield) || 0
      });
      setShowCreateModal(false);
      setCropType('');
      setTargetYield('');
      fetchSeasons(selectedPlot.id);
    } catch (err) {
      alert('Lỗi tạo mùa vụ mới');
    }
  };

  const handleHarvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showHarvestModal) return;

    try {
      await api.put(`/seasons/${showHarvestModal.id}`, {
        actual_yield: parseFloat(actualYield),
        quality,
        actual_harvest_date: new Date().toISOString(),
        status: 'HARVESTED'
      });

      alert('Đã cập nhật kết quả thu hoạch! AI đã tự động học từ chuỗi phản hồi mùa vụ này (ON_HARVEST).');
      setShowHarvestModal(null);
      setActualYield('');
      fetchSeasons(selectedPlot.id);
    } catch (err) {
      alert('Lỗi cập nhật thu hoạch');
    }
  };

  return (
    <section aria-labelledby="seasons-page-heading" className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      {/* Page Header Banner */}
      <header className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <h1 id="seasons-page-heading" className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-3">
            <CalendarDaysIcon className="w-8 h-8 text-emerald-700" aria-hidden="true" />
            Quản lý Mùa Vụ & Kết quả Thu hoạch
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Theo dõi chu kỳ gieo trồng, mục tiêu năng suất và thu hoạch chất lượng cao
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label htmlFor="plot-select-dropdown" className="sr-only">Chọn thửa đất</label>
          <select
            id="plot-select-dropdown"
            value={selectedPlot?.id || ''}
            onChange={(e) => {
              const p = plots.find((item) => item.id === Number(e.target.value));
              if (p) onPlotSelect(p);
            }}
            className="glass-input px-4 py-2.5 rounded-2xl text-stone-900 font-bold text-xs sm:text-sm min-h-[48px]"
          >
            {plots.map((p) => (
              <option key={p.id} value={p.id}>
                📍 {p.name} ({p.area_m2} m²)
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn-gradient-primary flex items-center gap-2 px-5 py-2.5 rounded-2xl min-h-[48px] text-xs sm:text-sm"
          >
            <PlusIcon className="w-5 h-5" aria-hidden="true" />
            <span>Mùa vụ mới</span>
          </button>
        </div>
      </header>

      {/* Seasons Grid */}
      <section aria-label="Danh sách mùa vụ" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seasons.map((season) => {
          const isHarvested = season.status === 'HARVESTED';
          const yieldPercent = season.target_yield && season.actual_yield
            ? Math.round((season.actual_yield / season.target_yield) * 100)
            : null;

          return (
            <article
              key={season.id}
              aria-labelledby={`season-title-${season.id}`}
              className={`glass-card rounded-3xl p-6 shadow-md border ${
                isHarvested ? 'border-emerald-300/80 bg-emerald-50/20' : 'border-amber-200/80 bg-amber-50/10'
              } flex flex-col justify-between`}
            >
              <div>
                <header className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                      isHarvested
                        ? 'badge-emerald'
                        : 'badge-amber'
                    }`}
                  >
                    {isHarvested ? '✅ Đã Thu Hoạch' : '🌱 Đang Canh Tác'}
                  </span>

                  {season.quality && (
                    <span className="flex items-center gap-1 text-xs font-extrabold bg-purple-100 text-purple-900 px-3 py-1 rounded-full border border-purple-200">
                      <TrophyIcon className="w-4 h-4 text-purple-700" aria-hidden="true" />
                      Loại {season.quality}
                    </span>
                  )}
                </header>

                <h2 id={`season-title-${season.id}`} className="text-xl font-black text-stone-900 mb-3">
                  {season.crop_type}
                </h2>

                <dl className="space-y-2.5 text-xs sm:text-sm text-stone-600 mb-4">
                  <div className="flex justify-between">
                    <dt>Ngày gieo trồng:</dt>
                    <dd className="font-bold text-stone-900">
                      {new Date(season.planted_date).toLocaleDateString('vi-VN')}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt>Mục tiêu năng suất:</dt>
                    <dd className="font-bold text-stone-900">{season.target_yield || 0} kg</dd>
                  </div>

                  {season.actual_yield && (
                    <div className="flex justify-between text-emerald-950 font-black bg-emerald-100/80 px-3.5 py-2.5 rounded-xl border border-emerald-300/70">
                      <dt>Năng suất thực tế:</dt>
                      <dd>{season.actual_yield} kg ({yieldPercent}%)</dd>
                    </div>
                  )}
                </dl>
              </div>

              {!isHarvested && (
                <button
                  type="button"
                  onClick={() => {
                    setShowHarvestModal(season);
                    setActualYield(season.target_yield?.toString() || '');
                  }}
                  className="btn-gradient-amber w-full mt-4 py-3 rounded-2xl flex items-center justify-center gap-2 min-h-[48px] text-xs sm:text-sm"
                >
                  <ArrowTrendingUpIcon className="w-5 h-5" aria-hidden="true" />
                  <span>Ghi nhận Thu hoạch</span>
                </button>
              )}
            </article>
          );
        })}
      </section>

      {/* Create Season Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-stone-200">
            <h2 className="text-xl font-black text-stone-900">Bắt đầu Mùa Vụ Mới</h2>

            <form onSubmit={handleCreateSeason} className="space-y-4" aria-label="Form tạo mùa vụ mới">
              <div>
                <label htmlFor="crop-type-input" className="block text-xs font-bold text-stone-700 mb-1">
                  Giống cây trồng
                </label>
                <input
                  id="crop-type-input"
                  type="text"
                  required
                  placeholder="Ví dụ: Cam Sành Tiền Giang, Lúa ST25..."
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label htmlFor="planted-date-input" className="block text-xs font-bold text-stone-700 mb-1">
                  Ngày gieo trồng
                </label>
                <input
                  id="planted-date-input"
                  type="date"
                  required
                  value={plantedDate}
                  onChange={(e) => setPlantedDate(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label htmlFor="expected-harvest-date-input" className="block text-xs font-bold text-stone-700 mb-1">
                  Dự kiến thu hoạch
                </label>
                <input
                  id="expected-harvest-date-input"
                  type="date"
                  value={expectedHarvestDate}
                  onChange={(e) => setExpectedHarvestDate(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label htmlFor="target-yield-input" className="block text-xs font-bold text-stone-700 mb-1">
                  Mục tiêu sản lượng (kg)
                </label>
                <input
                  id="target-yield-input"
                  type="number"
                  step="0.1"
                  required
                  placeholder="3500"
                  value={targetYield}
                  onChange={(e) => setTargetYield(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-bold text-xs min-h-[44px]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-gradient-primary px-5 py-2 rounded-xl text-xs min-h-[44px]"
                >
                  Khởi tạo Mùa vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Harvest Modal */}
      {showHarvestModal && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-stone-200">
            <h2 className="text-xl font-black text-stone-900">Kết thúc Mùa vụ & Nhập Thu hoạch</h2>
            <p className="text-xs text-stone-500 font-medium">
              Kết quả này sẽ được sử dụng để tự động huấn luyện lại mô hình AI cho thửa đất này (ON_HARVEST).
            </p>

            <form onSubmit={handleHarvestSubmit} className="space-y-4" aria-label="Form thu hoạch mùa vụ">
              <div>
                <label htmlFor="actual-yield-input" className="block text-xs font-bold text-stone-700 mb-1">
                  Sản lượng thực tế (kg)
                </label>
                <input
                  id="actual-yield-input"
                  type="number"
                  step="0.1"
                  required
                  value={actualYield}
                  onChange={(e) => setActualYield(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-black text-emerald-950"
                />
              </div>

              <div>
                <label htmlFor="quality-select" className="block text-xs font-bold text-stone-700 mb-1">
                  Phân loại chất lượng sản phẩm
                </label>
                <select
                  id="quality-select"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-bold text-stone-900"
                >
                  <option value="A">Loại A (Chất lượng cao / Xuất khẩu)</option>
                  <option value="B">Loại B (Tiêu chuẩn thị trường)</option>
                  <option value="C">Loại C (Trung bình)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHarvestModal(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-bold text-xs min-h-[44px]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-gradient-amber px-5 py-2 rounded-xl text-xs min-h-[44px]"
                >
                  Xác nhận Thu hoạch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default SeasonsManager;
