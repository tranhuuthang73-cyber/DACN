import React, { useState, useEffect } from 'react';
import {
  QrCodeIcon,
  XMarkIcon,
  PrinterIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import api from '../api';


interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  seasonId?: number;
}

const TraceabilityModal: React.FC<TraceabilityModalProps> = ({
  isOpen,
  onClose,
  seasonId
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && seasonId) {
      setLoading(true);
      api.get(`/seasons/${seasonId}/traceability`)
        .then((res) => setData(res.data.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, seasonId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white text-stone-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh] border border-stone-200">
        {/* Header */}
        <header className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <QrCodeIcon className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Mã QR Truy Xuất Nguồn Gốc VietGAP
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950">
                  CHỨNG THỰC
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Minh bạch chuỗi giá trị nông sản & Sổ nhật ký canh tác số
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              aria-label="In sổ nhật ký"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 text-xs font-bold"
            >
              <PrinterIcon className="w-5 h-5" />
              <span className="hidden sm:inline">In Sổ</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="p-2.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {loading ? (
            <div className="py-12 text-center text-emerald-800 font-bold animate-pulse">
              Đang tạo dữ liệu chứng nhận VietGAP và mã QR...
            </div>
          ) : data ? (
            <>
              {/* Batch Banner & QR Code Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-700 text-white rounded-full text-xs font-black">
                    <ShieldCheckIcon className="w-4 h-4" /> Chứng nhận VietGAP Số: {data.vietgap_cert_number}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                    Mã Lô Nông Sản: <span className="text-emerald-700">{data.batch_code}</span>
                  </h3>
                  <p className="text-stone-600 font-medium">
                    Loại cây: <strong className="text-stone-900">{data.crop.type}</strong> • Phân loại:{' '}
                    <strong className="text-emerald-800">{data.quality_grade}</strong>
                  </p>
                  <div className="text-[11px] text-stone-500 font-mono">
                    Đường dẫn xác thực: {data.qr_payload_url}
                  </div>
                </div>

                {/* SVG Rendered QR Code */}
                <div className="bg-white p-4 rounded-2xl border-2 border-emerald-600 shadow-md shrink-0 text-center">
                  <div className="w-32 h-32 bg-stone-900 rounded-xl flex items-center justify-center text-white relative overflow-hidden">
                    {/* Visual QR Code Pattern Simulation */}
                    <div className="grid grid-cols-6 gap-1 p-2 w-full h-full">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-xs ${
                            (i % 2 === 0 || i % 7 === 0 || i < 4 || i > 31)
                              ? 'bg-white'
                              : 'bg-stone-900'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-stone-600 block mt-1.5 uppercase">
                    Quét để kiểm tra
                  </span>
                </div>
              </div>

              {/* Origin & Compliance Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-black text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-2">
                    <MapPinIcon className="w-4 h-4 text-emerald-700" /> Nguồn Gốc Nông Trại
                  </h4>
                  <div className="space-y-1 text-stone-700">
                    <p>Chủ hộ canh tác: <strong>{data.farm_origin.farmer_name}</strong></p>
                    <p>Liên hệ: <strong>{data.farm_origin.phone}</strong></p>
                    <p>Thửa đất: <strong>{data.farm_origin.plot_name}</strong> ({data.farm_origin.area_m2} m²)</p>
                    <p>Chất đất: <strong>{data.farm_origin.soil_type}</strong></p>
                    <p className="text-[11px] text-stone-500">{data.farm_origin.coordinates.address}</p>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                  <h4 className="font-black text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-2">
                    <CalendarDaysIcon className="w-4 h-4 text-emerald-700" /> Thời Vụ & Đánh Giá An Toàn
                  </h4>
                  <div className="space-y-1 text-stone-700">
                    <p>Ngày gieo trồng: <strong>{new Date(data.crop.planted_date).toLocaleDateString('vi-VN')}</strong></p>
                    <p>Dự kiến thu hoạch: <strong>{data.crop.expected_harvest_date ? new Date(data.crop.expected_harvest_date).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</strong></p>
                    <p>Sản lượng dự kiến: <strong>{data.crop.target_yield_kg || 0} kg</strong></p>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-700">Điểm Chuẩn VietGAP:</span>
                      <span className="px-2.5 py-0.5 bg-emerald-700 text-white font-black rounded-lg text-xs">
                        {data.statistics.vietgap_compliance_score} / 100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Timeline Farming Logs */}
              <div className="space-y-3">
                <h4 className="font-black text-stone-900 flex items-center justify-between">
                  <span>Nhật Ký Canh Tác Minh Bạch ({data.timeline_logs.length} sự kiện)</span>
                  <span className="text-[11px] text-emerald-800 font-bold">100% Nhật ký số được lưu trữ</span>
                </h4>

                <div className="border border-stone-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase">
                      <tr>
                        <th className="p-3">Thời Gian</th>
                        <th className="p-3">Hoạt Động</th>
                        <th className="p-3">Lượng Sử Dụng</th>
                        <th className="p-3">Phương Pháp & Ghi Chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 font-medium text-stone-800">
                      {data.timeline_logs.length > 0 ? (
                        data.timeline_logs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-stone-50">
                            <td className="p-3 whitespace-nowrap text-stone-600 font-mono text-[11px]">
                              {new Date(log.date).toLocaleDateString('vi-VN')} {new Date(log.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                log.type === 'WATER'
                                  ? 'bg-sky-100 text-sky-900'
                                  : log.type === 'FERTILIZER'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-purple-100 text-purple-900'
                              }`}>
                                {log.type === 'WATER' ? '💧 Tưới nước' : log.type === 'FERTILIZER' ? '🌾 Bón phân' : '🛡️ Phun BVTV'}
                              </span>
                            </td>
                            <td className="p-3 font-bold">
                              {log.amount} {log.unit}
                            </td>
                            <td className="p-3 text-stone-600">
                              <div>{log.method}</div>
                              {log.note && <div className="text-[11px] text-stone-500 italic">{log.note}</div>}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-stone-500">
                            Chưa có nhật ký ghi chép cho mùa vụ này.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-stone-500 font-medium">
              Không tìm thấy thông tin mùa vụ để truy xuất nguồn gốc.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraceabilityModal;
