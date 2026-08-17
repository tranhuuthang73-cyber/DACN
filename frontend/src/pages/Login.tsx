import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SparklesIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  SunIcon,
  CpuChipIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import api from '../api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (isRegister) {
        const { data } = await api.post('/auth/register', { name, email, password, role: 'FARMER' });
        localStorage.setItem('token', data.token);
      } else {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
      }
      navigate('/');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'farmer' | 'admin') => {
    setIsRegister(false);
    setErrorMsg('');
    if (role === 'farmer') {
      setEmail('farmer@farm.com');
      setPassword('password123');
    } else {
      setEmail('admin@farm.com');
      setPassword('admin123');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-stone-50 to-teal-50 text-stone-800 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Background Ambient Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-200/40 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Split Container */}
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-xl border border-emerald-100 rounded-3xl sm:rounded-[36px] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* Left Column: Visual Showcase (lg:col-span-7) */}
        <section
          aria-label="Thông tin ứng dụng Smart Farm"
          className="lg:col-span-7 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-8 sm:p-12 flex flex-col justify-between text-white border-b lg:border-b-0 lg:border-r border-emerald-800/40 relative overflow-hidden"
        >
          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
              <SparklesIcon className="w-7 h-7 text-white font-bold" aria-hidden="true" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white block">
                Smart Farm <span className="text-emerald-300 font-light">AI</span>
              </span>
              <span className="text-xs text-emerald-200 font-medium block">Nông nghiệp thông minh thích ứng</span>
            </div>
          </div>

          {/* Main Hero Tagline & Features Showcase */}
          <div className="relative z-10 space-y-6 my-auto py-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-100 text-xs font-bold">
              <CpuChipIcon className="w-4 h-4 text-amber-300" aria-hidden="true" />
              <span>Công nghệ AI Gradient Descent Tự Học</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Tối ưu tưới bón <br />
              <span className="text-amber-300">
                theo thời tiết vi khí hậu
              </span>
            </h1>

            <p className="text-emerald-100 text-sm sm:text-base font-normal leading-relaxed max-w-md">
              Hệ thống tự động học từ phản hồi nông dân và kết quả thu hoạch từng mùa vụ để đưa ra khuyến nghị nước tưới & phân bón giải thích được (Explainable AI).
            </p>

            {/* Floating Live Feature Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-950/40 backdrop-blur-md p-4 rounded-2xl border border-emerald-700/50">
                <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold mb-1">
                  <SunIcon className="w-4 h-4" aria-hidden="true" />
                  <span>Dự báo thời tiết</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-white">33°C Nắng nóng</div>
                <div className="text-[11px] text-emerald-200">Cảnh báo thiếu ẩm đất nhẹ</div>
              </div>

              <div className="bg-emerald-950/40 backdrop-blur-md p-4 rounded-2xl border border-emerald-700/50">
                <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold mb-1">
                  <CheckCircleIcon className="w-4 h-4" aria-hidden="true" />
                  <span>Năng suất thực tế</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-white">+18.5% Sản lượng</div>
                <div className="text-[11px] text-emerald-200">Tự động huấn luyện lại vụ mùa</div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Credits */}
          <footer className="relative z-10 pt-6 border-t border-emerald-800/50 flex items-center justify-between text-xs text-emerald-200">
            <span>© 2026 Smart Farm SRS v1.0</span>
            <span className="font-semibold text-amber-300">Đại học Cần Thơ</span>
          </footer>
        </section>

        {/* Right Column: Form Login & Register Card (lg:col-span-5) */}
        <section
          aria-labelledby="form-heading"
          className="lg:col-span-5 bg-white text-stone-900 p-8 sm:p-10 flex flex-col justify-between relative"
        >
          <div>
            {/* Header Tabs: Login vs Register */}
            <div className="flex items-center justify-between mb-6">
              <h2 id="form-heading" className="text-2xl font-black text-stone-900 tracking-tight">
                {isRegister ? 'Tạo Tài Khoản' : 'Đăng Nhập'}
              </h2>

              <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setErrorMsg(''); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${!isRegister ? 'bg-emerald-700 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                    }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setErrorMsg(''); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${isRegister ? 'bg-emerald-700 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                    }`}
                >
                  Đăng ký
                </button>
              </div>
            </div>

            {/* Quick Credentials Filler Box */}
            {!isRegister && (
              <aside aria-label="Tài khoản thử nghiệm nhanh" className="mb-6 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-2">
                  <span>🚀 Điền nhanh tài khoản thử nghiệm:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('farmer')}
                    className="px-3 py-2 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm min-h-[40px]"
                  >
                    <UserGroupIcon className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    <span>👨‍🌾 Nông dân</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin')}
                    className="px-3 py-2 bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm min-h-[40px]"
                  >
                    <ShieldCheckIcon className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    <span>👑 Quản trị viên</span>
                  </button>
                </div>
              </aside>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div role="alert" className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center space-x-2">
                <span className="shrink-0 text-base">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" aria-label={isRegister ? 'Form Đăng ký' : 'Form Đăng nhập'}>
              {isRegister && (
                <div>
                  <label htmlFor="full-name-input" className="block text-xs font-bold text-stone-700 mb-1">
                    Họ và tên nông dân
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <UserIcon className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                    </div>
                    <input
                      id="full-name-input"
                      name="fullName"
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email-input" className="block text-xs font-bold text-stone-700 mb-1">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <EnvelopeIcon className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  </div>
                  <input
                    id="email-input"
                    name="email"
                    type="email"
                    required
                    placeholder="farmer@farm.com"
                    className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password-input" className="block text-xs font-bold text-stone-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <LockClosedIcon className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  </div>
                  <input
                    id="password-input"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gradient-primary w-full py-3.5 px-4 rounded-2xl min-h-[48px] text-sm flex items-center justify-center space-x-2 mt-2"
              >
                <span>{loading ? 'Đang xử lý...' : isRegister ? 'Đăng ký Tài khoản Mới' : 'Đăng nhập Vào Hệ Thống'}</span>
                <ArrowRightIcon className="w-4 h-4 text-emerald-200" aria-hidden="true" />
              </button>
            </form>
          </div>

          <footer className="mt-8 text-center text-xs text-stone-500 border-t border-stone-100 pt-4">
            <span>{isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}</span>
            <button
              type="button"
              className="ml-2 text-amber-700 font-bold hover:underline inline-flex items-center min-h-[44px]"
              onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }}
            >
              {isRegister ? 'Quay lại Đăng nhập' : 'Đăng ký ngay bây giờ'}
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default Login;
