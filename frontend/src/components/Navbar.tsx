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
    <header className="sticky top-0 z-40 bg-emerald-900 text-white border-b border-emerald-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
            role="button"
            tabIndex={0}
            aria-label="Trang chủ Smart Farm AI"
          >
            <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <SparklesIcon className="w-6 h-6 text-white font-bold" aria-hidden="true" />
            </div>
            <div>
              <span className="font-black text-xl leading-none tracking-tight block text-white">
                Smart Farm
              </span>
              <span className="text-[11px] text-emerald-200 font-semibold tracking-wider uppercase block mt-1">
                Nông nghiệp Thích ứng AI
              </span>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav aria-label="Điều hướng chính" className="flex items-center space-x-1 sm:space-x-2 bg-emerald-950/40 p-1.5 rounded-2xl border border-emerald-800/60">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
              className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 min-h-[44px] ${
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
              className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 min-h-[44px] ${
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
              className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 min-h-[44px] ${
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
                className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 min-h-[44px] ${
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
          <div className="flex items-center space-x-3">
            <address className="not-italic hidden md:block text-right">
              <div className="text-sm font-extrabold text-white">{user?.name || 'Người dùng'}</div>
              <div className="text-[11px] font-bold text-amber-300">
                {user?.role === 'ADMIN' ? '👑 Quản trị viên' : '👨‍🌾 Nông dân'}
              </div>
            </address>

            <button
              type="button"
              onClick={onLogout}
              aria-label="Đăng xuất khỏi hệ thống"
              className="p-2.5 rounded-2xl bg-emerald-800 hover:bg-rose-700 text-emerald-100 hover:text-white transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center shadow-sm"
              title="Đăng xuất"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
