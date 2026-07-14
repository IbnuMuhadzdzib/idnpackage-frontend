import React from 'react';

import LogoLight from '../../assets/icon.png';
import LogoDark from '../../assets/icon_white.png';

interface SidebarOperatorProps {
  role?: 'admin' | 'operator';
  activeTab?: 'dashboard' | 'packages' | 'users';
  onTabChange?: (tab: 'dashboard' | 'packages' | 'users') => void;
  onLogout?: () => void;
}

const SidebarOperator: React.FC<SidebarOperatorProps> = ({ role = 'operator', activeTab = 'dashboard', onTabChange, onLogout }) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[88px] bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col items-center py-6 z-30 shadow-sm transition-colors duration-300">
      {/* Logo (Dashboard Tab) */}
      <button 
        onClick={() => onTabChange?.('dashboard')}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold border transition-all duration-200 mb-6 ${
          activeTab === 'dashboard' 
            ? 'bg-blue-50 dark:bg-slate-800 text-[#143C9C] dark:text-blue-400 border-blue-100 dark:border-slate-700 shadow-sm' 
            : 'bg-transparent text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <img src={LogoLight} alt="Logo" className="size-9 dark:hidden" />
        <img src={LogoDark} alt="Logo" className="size-9 hidden dark:block" />
      </button>

      {/* Admin Tabs */}
      {role === 'admin' && (
        <div className="flex flex-col gap-4 w-full px-4">
          {/* Packages Tab */}
          <button
            onClick={() => onTabChange?.('packages')}
            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 ${
              activeTab === 'packages'
                ? 'bg-[#143C9C] text-white shadow-md'
                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-[#143C9C] dark:hover:text-blue-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </button>
          
          {/* Users Tab */}
          <button
            onClick={() => onTabChange?.('users')}
            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-[#143C9C] text-white shadow-md'
                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-[#143C9C] dark:hover:text-blue-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Buttons */}
      <div className="flex flex-col items-center gap-4 pb-4">
        {/* Help Button */}
        <button
          title="Bantuan"
          className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 text-[#143C9C] dark:text-blue-400 hover:bg-[#143C9C] hover:text-white dark:hover:bg-blue-600 transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Logout Button */}
        <button
          title="Keluar"
          onClick={onLogout}
          className="w-12 h-12 rounded-2xl bg-[#FF5A5F] hover:bg-red-600 flex items-center justify-center text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default SidebarOperator;
