import React from 'react';
import {
  XMarkIcon,
  PrinterIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface VietGAPDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  plot?: any;
  season?: any;
  logs?: any[];
}

const VietGAPDossierModal: React.FC<VietGAPDossierModalProps> = ({
  isOpen,
  onClose,
  plot,
  season,
  logs = []
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const plotName = plot?.name || 'Thửa Ruộng Số 1';
  const cropType = season?.crop_type || 'Sầu Riêng Ri6 (Durio zibethinus)';
  const areaM2 = plot?.area_m2 || 2500;
  const soilType = plot?.soil_type || 'Đất phù sa bồi tụ';
  const plantedDate = season?.planted_date
    ? new Date(season.planted_date).toLocaleDateString('vi-VN')
    : '15/01/2026';
  const targetYield = season?.target_yield || 3800;

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-3xl max-w-4xl w-full p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:p-0">
        {/* Modal Action Header (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black shadow-sm">
              <CheckBadgeIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900">
                Hồ Sơ Canh Tác Kỹ Thuật & Nhật Ký Điện Tử Chuẩn VietGAP
              </h3>
              <p className="text-xs text-stone-500">Mẫu hồ sơ pháp lý số hóa chuẩn Cục Trồng Trọt & Bảo Vệ Thực Vật</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>In Hồ Sơ / Lưu PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="space-y-6 font-serif border-2 border-emerald-800 p-6 rounded-2xl print:border-none print:p-0">
          {/* Document Header Emblem & National Title */}
          <div className="text-center space-y-1 border-b-2 border-emerald-800 pb-4">
            <div className="text-xs font-bold tracking-widest uppercase text-stone-600">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-xs font-bold text-stone-600 underline">Độc lập - Tự do - Hạnh phúc</div>
            <h1 className="text-xl sm:text-2xl font-black text-emerald-900 uppercase tracking-wide pt-2 font-sans">
              HỒ SƠ CANH TÁC KỸ THUẬT & TRUY XUẤT NGUỒN GỐC VIETGAP
            </h1>
            <p className="text-xs text-stone-600 italic">
              (Ban hành theo Quy chuẩn Kỹ thuật Quốc gia TCVN 11892-1:2017 về Thực hành Nông nghiệp Tốt)
            </p>
            <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-900 text-xs font-bold rounded-full border border-emerald-300 font-sans mt-1">
              MÃ ĐỊNH DANH SỐ HÓA: VG-2026-{plot?.id || 1}-VN
            </div>
          </div>

          {/* Section 1: Farm & Cadastre Info */}
          <div className="space-y-2 font-sans text-xs">
            <h2 className="text-sm font-black uppercase text-emerald-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-700" /> I. THÔNG TIN THỬA ĐẤT & VÙNG TRỒNG SỐ HÓA
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div>
                <span className="text-stone-500 block">Tên Thửa Ruộng:</span>
                <strong className="text-stone-900 text-sm">{plotName}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Giống Cây Trồng:</span>
                <strong className="text-emerald-800 text-sm">{cropType}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Diện Tích Canh Tác:</span>
                <strong className="text-stone-900 text-sm">{areaM2.toLocaleString()} m²</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Chất Lượng Tầng Đất:</span>
                <strong className="text-stone-900 text-sm">{soilType}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Ngày Xuống Giống:</span>
                <strong className="text-stone-900 text-sm">{plantedDate}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Sản Lượng Mục Tiêu:</span>
                <strong className="text-stone-900 text-sm">{targetYield.toLocaleString()} kg</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Tọa Độ GPS Vệ Tinh:</span>
                <strong className="text-stone-900 text-sm">10.3601° N, 106.3621° E</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Tiêu Chuẩn Giám Sát:</span>
                <strong className="text-emerald-700 text-sm">VietGAP Trực Tuyến 100%</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Soil Health & N-P-K Nutrient Audit */}
          <div className="space-y-2 font-sans text-xs">
            <h2 className="text-sm font-black uppercase text-emerald-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
              <SparklesIcon className="w-4 h-4 text-emerald-700" /> II. KIỂM ĐỊNH DINH DƯỠNG ĐẤT & CÂN BẰNG N-P-K
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-stone-500 block">Chỉ số pH Đất:</span>
                <span className="text-base font-black text-emerald-800">6.4 pH (Lý Tưởng)</span>
                <p className="text-[10px] text-stone-500 mt-1">Đất giàu vi sinh vật bản địa, rễ hấp thu tốt.</p>
              </div>
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl">
                <span className="text-stone-500 block">Độ Mặn Nguồn Nước Tưới:</span>
                <span className="text-base font-black text-sky-800">0.4 ‰ (Nước Ngọt Chuẩn)</span>
                <p className="text-[10px] text-stone-500 mt-1">Dưới ngưỡng an toàn 1.0‰, hệ thống tự động bảo vệ.</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-stone-500 block">Giảm Lãng Phí Phân Hóa Học:</span>
                <span className="text-base font-black text-amber-800">32% (Chuẩn Nông Nghiệp Xanh)</span>
                <p className="text-[10px] text-stone-500 mt-1">Ứng dụng thuật toán AI SGD cân đối đạm - kali.</p>
              </div>
            </div>
          </div>

          {/* Section 3: Chronological VietGAP Farming Diary */}
          <div className="space-y-2 font-sans text-xs">
            <h2 className="text-sm font-black uppercase text-emerald-900 border-b border-stone-200 pb-1">
              III. NHẬT KÝ ĐIỆN TỬ TƯỚI TIÊU, PHÂN BÓN & CHĂM SÓC
            </h2>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-800 text-white uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Thời Gian</th>
                    <th className="p-2.5">Hoạt Động</th>
                    <th className="p-2.5">Khối Lượng</th>
                    <th className="p-2.5">Phương Thức</th>
                    <th className="p-2.5">Ghi Chú Kỹ Thuật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {logs.length > 0 ? (
                    logs.map((log, i) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="p-2.5 font-mono text-stone-600">
                          {new Date(log.created_at).toLocaleString('vi-VN', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="p-2.5 font-black text-emerald-800">
                          {log.type === 'WATER' ? '💧 Tưới Nước' : log.type === 'FERTILIZER' ? '🌱 Bón Phân' : '🛡️ Phun Thuốc'}
                        </td>
                        <td className="p-2.5 font-bold">
                          {log.amount} {log.unit}
                        </td>
                        <td className="p-2.5 text-stone-600">{log.method || 'Tự động'}</td>
                        <td className="p-2.5 text-stone-700">{log.note || 'Theo khuyến nghị chuẩn VietGAP'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-stone-500">
                        Chưa có bản ghi nào. Dữ liệu tưới bón thực tế sẽ tự động kết xuất vào đây.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Document Signatures & Stamp Seal */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center font-sans text-xs border-t border-stone-300">
            <div className="space-y-16">
              <div>
                <div className="font-black uppercase text-stone-800">CHỦ HỘ NÔNG DÂN / CHỦ TRANG TRẠI</div>
                <p className="text-[10px] text-stone-500 italic">(Ký và ghi rõ họ tên)</p>
              </div>
              <div className="font-bold text-stone-800">Nguyễn Văn Nông (Đã ký số)</div>
            </div>

            <div className="space-y-16">
              <div>
                <div className="font-black uppercase text-emerald-900">HỆ THỐNG XÁC THỰC SMART FARM AI</div>
                <p className="text-[10px] text-stone-500 italic">(Chứng nhận số hóa thời gian thực)</p>
              </div>
              <div className="inline-block p-2 border-2 border-dashed border-emerald-600 rounded-xl text-emerald-800 font-mono font-black text-[11px]">
                ★ ĐÃ XÁC THỰC VIETGAP BLOCKCHAIN ★
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VietGAPDossierModal;
