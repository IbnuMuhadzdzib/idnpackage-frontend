import React, { useState, useRef, useEffect } from 'react';
import LiveDateTimeOperator from '../ui/LiveDateTimeOperator';
import ThemeToggle from '../ui/ThemeToggle';

import LogoLight from '../../assets/icon.png';
import LogoDark from '../../assets/icon_white.png';

/**
 * Properti untuk komponen NavbarOperatorNew
 */
interface NavbarOperatorNewProps {
  /** Nama operator yang sedang login */
  operatorName?: string;
  /** Peran operator yang sedang login (admin/operator/teacher dll) */
  operatorRole?: string;
  /** Fungsi callback yang dijalankan saat tombol logout diklik */
  onLogout?: () => void;
  /** Callback untuk membuka/menutup sidebar drawer di mobile */
  onToggleSidebar?: () => void;
}

/**
 * Komponen navigasi atas responsif untuk operator dan admin.
 */
const NavbarOperatorNew: React.FC<NavbarOperatorNewProps> = ({
  operatorName = 'Pengguna',
  operatorRole = 'operator',
  onLogout,
  onToggleSidebar,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'operator': return 'Satpam';
      case 'teacher': return 'Ustadz';
      default: return role;
    }
  };

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-white dark:bg-slate-900 font-jakarta border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300 h-20 md:h-[100px] sticky top-0 z-30">

      {/* Kiri: Toggle Logo Mobile (< md) & Live Date Time */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Tombol Logo Navigasi Mobile */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden flex items-center justify-center p-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 active:scale-95 transition-transform"
          title="Buka Menu Navigasi"
        >
          <img src={LogoLight} alt="Logo" className="w-7 h-7 dark:hidden" />
          <img src={LogoDark} alt="Logo" className="w-7 h-7 hidden dark:block" />
        </button>

        {/* Live Date Time (Responsif) */}
        <div className="flex items-center">
          <LiveDateTimeOperator />
        </div>
      </div>

      {/* Kanan: Theme Toggle + Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 sm:gap-3 bg-[#F2F4F7] dark:bg-slate-800 py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl transition-all cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-300 overflow-hidden ring-2 ring-[#143C9C]/20 dark:ring-blue-500/30 flex-shrink-0">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(operatorName)}&background=143C9C&color=fff&bold=true`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Nama & Role disembunyikan di layar sangat kecil agar navbar tidak padat */}
            <div className="text-xs min-w-0 text-left hidden sm:block">
              <p className="font-bold text-gray-800 dark:text-white leading-tight whitespace-nowrap truncate max-w-[120px]">{operatorName}</p>
              <p className="text-gray-500 dark:text-gray-400 leading-tight whitespace-nowrap">{getRoleLabel(operatorRole)}</p>
            </div>

            {/* Chevron Icon */}
            <svg
              className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#143C9C]/20 flex-shrink-0">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(operatorName)}&background=143C9C&color=fff&bold=true`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{operatorName}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${operatorRole === 'admin' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        operatorRole === 'teacher' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                      {getRoleLabel(operatorRole)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar dari Akun
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarOperatorNew;