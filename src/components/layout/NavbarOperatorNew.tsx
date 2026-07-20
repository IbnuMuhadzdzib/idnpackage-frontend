import React, { useState, useRef, useEffect } from 'react';
import LiveDateTimeOperator from '../ui/LiveDateTimeOperator';
import ThemeToggle from '../ui/ThemeToggle';

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
}

/**
 * Komponen navigasi atas untuk halaman operator dan admin.
 * Menampilkan waktu saat ini, profil pengguna dengan dropdown untuk logout.
 *
 * @param {NavbarOperatorNewProps} props - Properti komponen
 * @returns {JSX.Element} Komponen NavbarOperatorNew
 */
const NavbarOperatorNew: React.FC<NavbarOperatorNewProps> = ({
  operatorName = 'Pengguna',
  operatorRole = 'operator',
  onLogout,
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

  /**
   * Mengembalikan label peran pengguna dalam bahasa Indonesia yang lebih bersahabat.
   * 
   * @param {string} role - Kode peran (misal: 'admin', 'operator')
   * @returns {string} Label peran (misal: 'Admin', 'Satpam')
   */
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'operator': return 'Satpam';
      case 'teacher': return 'Ustadz';
      default: return role;
    }
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900 font-jakarta border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300 h-[100px]">
      {/* Kiri: Live Date Time */}
      <div className="flex items-center">
        <LiveDateTimeOperator />
      </div>

      {/* Kanan: Theme Toggle + Profile */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Profile with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 bg-[#F2F4F7] dark:bg-slate-800 py-2 px-4 rounded-xl transition-all cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden ring-2 ring-[#143C9C]/20 dark:ring-blue-500/30 flex-shrink-0">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(operatorName)}&background=143C9C&color=fff&bold=true`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs min-w-0 text-left">
              <p className="font-bold text-gray-800 dark:text-white leading-tight whitespace-nowrap">{operatorName}</p>
              <p className="text-gray-500 dark:text-gray-400 leading-tight whitespace-nowrap">{getRoleLabel(operatorRole)}</p>
            </div>
            {/* Chevron */}
            <svg
              className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-fadeIn">
              {/* User info header */}
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
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      operatorRole === 'admin' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      operatorRole === 'teacher' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {getRoleLabel(operatorRole)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout button */}
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
