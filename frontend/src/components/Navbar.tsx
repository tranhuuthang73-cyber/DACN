import React from 'react';
import {
  Square2StackIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface NavbarProps {
  user: any;
  activeTab: 'dashboard' | 'seasons' | 'financials' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'seasons' | 'financials' | 'admin') => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, activeTab, setActiveTab, onLogout }) => {
  return (
    <>
      {/* TOP DESKTOP & MOBILE HEADER */}
      <header className="sticky top-0 z-40 bg-emerald-900 text-white border-b border-emerald-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Brand Logo & Title */}
            <div
              className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group"
              onClick={() => setActiveTab('dashboard')}
              role="button"
              tabIndex={0}
              aria-label="Trang chủ Smart Farm AI"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
                <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white font-bold" aria-hidden="true" />
              </div>
              <div>
                <span className="font-black text-base sm:text-xl leading-none tracking-tight block text-white">
                  Smart Farm AI
                </span>
                <span className="text-[9px] sm:text-[11px] text-emerald-200 font-semibold tracking-wider uppercase block mt-0.5">
                  Nông nghiệp Thích ứng
                </span>
              </div>
            </div>

            {/* Desktop Navigation Pills (Hidden on Mobile) */}
            <nav aria-label="Điều hướng chính" className="hidden md:flex items-center space-x-1 sm:space-x-2 bg-emerald-950/40 p-1.5 rounded-2xl border border-emerald-800/60">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                aria-current={activeTab === 'dashboard' ? 'page' : undefined}
                className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 min-h-[40px] ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
                }`}
              >
                <Square2StackIcon className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Dashboard & AI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('seasons')}
                aria-current={activeTab === 'seasons' ? 'page' : undefined}
                className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 min-h-[40px] ${
                  activeTab === 'seasons'
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
                }`}
              >
                <CalendarDaysIcon className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Mùa vụ & Thu hoạch</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('financials')}
                aria-current={activeTab === 'financials' ? 'page' : undefined}
                className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 min-h-[40px] ${
                  activeTab === 'financials'
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800/80 hover:text-white'
                }`}
              >
                <BanknotesIcon className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Tài chính & Lợi nhuận</span>
              </button>

              {user?.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  aria-current={activeTab === 'admin' ? 'page' : undefined}
                  className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 min-h-[40px] ${
                    activeTab === 'admin'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-amber-200 hover:bg-amber-900/50 hover:text-white'
                  }`}
                >
                  <ShieldCheckIcon className="w-4 h-4 text-amber-200" aria-hidden="true" />
                  <span>Quản trị Admin</span>
                </button>
              )}
            </nav>

            {/* User Badge & Logout */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <address className="not-italic text-right">
                <div className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                  {user?.name || 'Nông Dân'}
                </div>
                <div className="text-[9px] sm:text-[11px] font-bold text-amber-300">
                  {user?.role === 'ADMIN' ? '👑 Admin' : '👨‍🌾 Vườn Nhà'}
                </div>
              </address>

              <button
                type="button"
                onClick={onLogout}
                aria-label="Đăng xuất khỏi hệ thống"
                className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-emerald-800 hover:bg-rose-700 text-emerald-100 hover:text-white transition-all duration-200 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center shadow-sm"
                title="Đăng xuất"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thanh Điều Hướng Tiện Lợi Dành Cho Điện Thoại) */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-xl border-t border-emerald-900/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-bottom"
      >
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-black scale-105 bg-emerald-950/80 border border-emerald-500/40'
              : 'text-stone-400 font-medium hover:text-stone-200'
          }`}
        >
          <Square2StackIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seasons')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'seasons'
              ? 'text-emerald-400 font-black scale-105 bg-emerald-950/80 border border-emerald-500/40'
              : 'text-stone-400 font-medium hover:text-stone-200'
          }`}
        >
          <CalendarDaysIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Mùa Vụ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('financials')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'financials'
              ? 'text-emerald-400 font-black scale-105 bg-emerald-950/80 border border-emerald-500/40'
              : 'text-stone-400 font-medium hover:text-stone-200'
          }`}
        >
          <BanknotesIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Tài Chính</span>
        </button>

        {user?.role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'admin'
                ? 'text-amber-400 font-black scale-105 bg-amber-950/80 border border-amber-500/40'
                : 'text-stone-400 font-medium hover:text-stone-200'
            }`}
          >
            <ShieldCheckIcon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Admin</span>
          </button>
        )}
      </nav>
    </>
  );
};

export default Navbar;
