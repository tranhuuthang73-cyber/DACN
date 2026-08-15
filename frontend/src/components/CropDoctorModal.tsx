import React, { useState } from 'react';
import {
  SparklesIcon,
  XMarkIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  BeakerIcon,
  BookmarkSquareIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface CropDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  plotName?: string;
  seasonId?: number;
  onLogCreated?: () => void;
}

const PRESET_SAMPLES = [
  {
    title: 'Lá lúa cháy đốm (Đạo ôn)',
    crop: 'Lúa nước',
    symptom: 'Vết bệnh hình thoi nhọn, tâm xám trắng, mép nâu, lá khô héo nhanh',
    imgPlaceholder: '🌾'
  },
  {
    title: 'Lá sầu riêng cháy mép (Thán thư)',
    crop: 'Sầu riêng',
    symptom: 'Vết bệnh lan từ chóp và mép lá dạng vòng tròn đồng tâm, lá giòn rụng',
    imgPlaceholder: '🍈'
  },
  {
    title: 'Côn trùng bám bẹ & vàng lá (Rầy nâu)',
    crop: 'Cây lương thực',
    symptom: 'Rầy chích hút ở gốc thân, tiết mật đen nấm bồ hóng, cây héo vàng',
    imgPlaceholder: '🦗'
  },
  {
    title: 'Rau cà chua đốm vàng (Sương mai)',
    crop: 'Rau màu / Cà chua',
    symptom: 'Mặt trên có vệt vàng đa giác, mặt dưới mốc xám, nghi thiếu Magiê',
    imgPlaceholder: '🍅'
  }
];

const CropDoctorModal: React.FC<CropDoctorModalProps> = ({
  isOpen,
  onClose,
  plotName,
  seasonId,
  onLogCreated
}) => {
  const [selectedCrop, setSelectedCrop] = useState('Lúa nước (Oryza sativa)');
  const [symptomText, setSymptomText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [loggingSuccess, setLoggingSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectSample = (sample: typeof PRESET_SAMPLES[0]) => {
    setSelectedCrop(sample.crop);
    setSymptomText(sample.symptom);
    setSelectedImage(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23132e1b"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="50">${sample.imgPlaceholder}</text><text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" fill="%23a7f3d0" font-family="sans-serif" font-size="14" font-weight="bold">${sample.title}</text></svg>`);
    setDiagnosisResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setDiagnosisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunDiagnosis = async () => {
    setAnalyzing(true);
    setDiagnosisResult(null);
    setLoggingSuccess(false);

    try {
      const { data } = await api.post('/ai/diagnose-crop', {
        crop_type: selectedCrop,
        symptom: symptomText,
        image_base64: selectedImage
      });

      // Artificial mini-delay to show the sophisticated scanning laser animation
      setTimeout(() => {
        setDiagnosisResult(data.data);
        setAnalyzing(false);
      }, 900);
    } catch (err) {
      console.error(err);
      alert('Lỗi trong quá trình quét chẩn đoán AI');
      setAnalyzing(false);
    }
  };

  const handleAutoLog = async () => {
    if (!diagnosisResult || !seasonId) {
      alert('Vui lòng chọn hoặc tạo vụ mùa để ghi nhật ký!');
      return;
    }

    try {
      await api.post('/logs', {
        season_id: seasonId,
        type: 'OTHER',
        amount: 1,
        unit: 'lần phun BVTV',
        method: diagnosisResult.treatment_chemical.medicine_name,
        note: `[AI Crop Doctor] Điều trị ${diagnosisResult.disease_name}. Liều lượng: ${diagnosisResult.treatment_chemical.dosage}. Cách ly: ${diagnosisResult.treatment_chemical.isolation_days} ngày.`,
        cost_vnd: 85000
      });
      setLoggingSuccess(true);
      if (onLogCreated) onLogCreated();
    } catch (err) {
      alert('Lỗi ghi nhật ký bảo vệ thực vật');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
      <div className="bg-stone-900 border border-emerald-600/40 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden text-stone-100 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="p-6 bg-gradient-to-r from-emerald-950 via-stone-900 to-teal-950 border-b border-emerald-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-emerald-950 font-black shadow-lg shadow-emerald-500/20">
              <SparklesIcon className="w-7 h-7 font-black" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Bác Sĩ Cây Trồng AI (Crop Doctor Vision)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  AI MultiModal v3.0
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Chẩn đoán bệnh học, nhận diện rầy nấm & kê toa VietGAP cho thửa đất {plotName ? `[${plotName}]` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ chẩn đoán"
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <XMarkIcon className="w-6 h-6" aria-hidden="true" />
          </button>
        </header>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Preset Samples */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              🧪 Mẫu thử nghiệm sâu bệnh nhanh hoặc Tải ảnh thực tế
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 bg-stone-800/80 hover:bg-emerald-950/80 border border-stone-700 hover:border-emerald-500 rounded-2xl text-left transition-all group flex flex-col justify-between"
                >
                  <div className="text-2xl mb-1">{sample.imgPlaceholder}</div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 line-clamp-1">
                    {sample.title}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">{sample.crop}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form & Image Upload Area */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Image Preview & Upload (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <div className="relative border-2 border-dashed border-emerald-600/50 hover:border-emerald-400 bg-stone-950/80 rounded-2xl h-56 flex flex-col items-center justify-center overflow-hidden transition-all group">
                {selectedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Ảnh mẫu cây trồng"
                      className="w-full h-full object-cover"
                    />
                    {analyzing && (
                      <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex flex-col items-center justify-center">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-0 animate-bounce" />
                        <ArrowPathIcon className="w-10 h-10 text-emerald-400 animate-spin" />
                        <span className="text-xs font-bold text-emerald-200 mt-2">
                          AI đang phân tích từng tế bào lá...
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <PhotoIcon className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="text-xs font-bold text-stone-200">Kéo thả hoặc Tải ảnh lá cây</p>
                    <p className="text-[11px] text-stone-400 mt-1">Hỗ trợ JPG, PNG, WebP từ điện thoại/camera</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {selectedImage && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setDiagnosisResult(null);
                  }}
                  className="text-xs text-stone-400 hover:text-rose-400 underline font-medium flex items-center gap-1"
                >
                  <XMarkIcon className="w-4 h-4" /> Xóa ảnh đã chọn
                </button>
              )}
            </div>

            {/* Inputs & Query (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">Loại cây trồng</label>
                <input
                  type="text"
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  placeholder="Ví dụ: Lúa OM18, Sầu riêng Ri6, Cà chua bi..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">Mô tả triệu chứng nhận thấy</label>
                <textarea
                  rows={3}
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  placeholder="Ví dụ: Lá có đốm thoi nâu cháy ở chóp, có phấn trắng ở mặt dưới, xuất hiện sau đợt mưa..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleRunDiagnosis}
                disabled={analyzing}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[48px]"
              >
                {analyzing ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Đang chẩn đoán dịch bệnh...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    <span>Chạy Chẩn Đoán Bệnh Bằng AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Diagnostic Result Card */}
          {diagnosisResult && (
            <div className="bg-stone-950 border border-emerald-600/50 rounded-3xl p-6 space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-emerald-400">
                      {diagnosisResult.disease_name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Mức độ: {diagnosisResult.severity}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 italic mt-0.5">
                    Tên khoa học: {diagnosisResult.scientific_name} • Cây: {diagnosisResult.crop_type}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-stone-400 font-bold">Độ tin cậy AI</div>
                  <div className="text-xl font-black text-emerald-400">
                    {(diagnosisResult.confidence_score * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Symptoms & Causes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-900/90 p-4 rounded-2xl border border-stone-800">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                    <ExclamationTriangleIcon className="w-4 h-4" /> Dấu hiệu nhận biết
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-300">
                    {diagnosisResult.symptoms.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-stone-900/90 p-4 rounded-2xl border border-stone-800">
                  <h4 className="text-xs font-bold text-teal-300 flex items-center gap-1.5 mb-2">
                    <ShieldCheckIcon className="w-4 h-4" /> Biện pháp phòng ngừa canh tác
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-300">
                    {diagnosisResult.preventive_measures.map((p: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-teal-400 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Treatment Prescriptions (Chemical & Organic) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Organic / Bio Solution */}
                <div className="bg-gradient-to-br from-emerald-950/60 to-stone-900 p-4 rounded-2xl border border-emerald-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      🌱 Phác đồ Sinh Học (Khuyên dùng VietGAP)
                    </h4>
                    <span className="badge-emerald text-[10px]">An toàn 100%</span>
                  </div>
                  <p className="text-xs font-black text-white mb-1">
                    {diagnosisResult.treatment_organic.solution}
                  </p>
                  <p className="text-xs text-emerald-200/80 mb-1">
                    Liều lượng: <strong>{diagnosisResult.treatment_organic.dosage}</strong>
                  </p>
                  <p className="text-[11px] text-stone-400 italic">
                    {diagnosisResult.treatment_organic.instructions}
                  </p>
                </div>

                {/* Targeted Chemical Solution */}
                <div className="bg-gradient-to-br from-amber-950/40 to-stone-900 p-4 rounded-2xl border border-amber-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <BeakerIcon className="w-4 h-4" /> Phác đồ Hoá Học Đặc Trị
                    </h4>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold">
                      Cách ly: {diagnosisResult.treatment_chemical.isolation_days} ngày
                    </span>
                  </div>
                  <p className="text-xs font-black text-white mb-1">
                    Thuốc: {diagnosisResult.treatment_chemical.medicine_name}
                  </p>
                  <p className="text-xs text-amber-200/80 mb-1">
                    Hoạt chất: {diagnosisResult.treatment_chemical.active_ingredient}
                  </p>
                  <p className="text-xs text-stone-300">
                    Liều lượng: <strong>{diagnosisResult.treatment_chemical.dosage}</strong>
                  </p>
                </div>
              </div>

              {/* Action: Log to Farm Log */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-stone-400">
                  {loggingSuccess ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" /> Đã lưu vào Sổ Nhật Ký Bảo Vệ Thực Vật mùa vụ!
                    </span>
                  ) : (
                    <span>Lưu đơn thuốc này vào nhật ký canh tác để phục vụ truy xuất nguồn gốc VietGAP.</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAutoLog}
                  disabled={loggingSuccess}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:text-emerald-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all shrink-0 min-h-[44px]"
                >
                  <BookmarkSquareIcon className="w-4 h-4" />
                  <span>{loggingSuccess ? 'Đã ghi nhật ký' : 'Ghi vào Nhật Ký BVTV'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropDoctorModal;
