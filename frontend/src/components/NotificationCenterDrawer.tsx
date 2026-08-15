import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import api from '../api';

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDossier?: () => void;
}

const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  onOpenDossier
}) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/expert/alerts');
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-900 border-l border-stone-800 text-stone-100 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <BellIcon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Trung Tâm Cảnh Báo Sớm Khẩn Cấp</h3>
                <p className="text-xs text-stone-400">Giám sát vi khí hậu, hạn mặn & rủi ro dịch bệnh 24/7</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* List of Alerts */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-stone-400 tracking-wider">
                Thông Báo Đang Hoạt Động ({alerts.length})
              </span>
              <button
                type="button"
                onClick={fetchAlerts}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            </div>

            {alerts.map((alt) => {
              const isWarning = alt.level === 'WARNING';
              const isSuccess = alt.level === 'SUCCESS';

              return (
                <div
                  key={alt.id}
                  className={`p-4 rounded-2xl border space-y-3 transition-all ${
                    isWarning
                      ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/20'
                      : isSuccess
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                      : 'bg-stone-950/80 border-stone-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isWarning ? (
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 shrink-0" />
                      ) : isSuccess ? (
                        <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <InformationCircleIcon className="w-5 h-5 text-sky-400 shrink-0" />
                      )}
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-stone-900 border border-stone-700 text-stone-300">
                        {alt.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium">{alt.timestamp}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white">{alt.title}</h4>
                    <p className="text-xs text-stone-300 mt-1 leading-relaxed">{alt.message}</p>
                  </div>

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        if (alt.actionType === 'VIETGAP_DOSSIER' && onOpenDossier) {
                          onClose();
                          onOpenDossier();
                        }
                      }}
                      className="text-xs font-black text-amber-300 hover:text-amber-200 flex items-center gap-1"
                    >
                      <span>{alt.actionLabel}</span>
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Tự động bảo vệ</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stone-800 bg-stone-950/80 text-center text-xs text-stone-400">
            Hệ sinh thái IoT & AI Nông nghiệp Tự Động Hóa 4.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenterDrawer;
