import React from 'react';

import LogoLight from '../../assets/icon.png';
import LogoDark from '../../assets/icon_white.png';

/**
 * Properti untuk komponen SidebarOperator
 */
interface SidebarOperatorProps {
  /** Peran pengguna (menentukan tab yang ditampilkan) */
  role?: 'admin' | 'operator';
  /** Tab yang saat ini sedang aktif */
  activeTab?: 'dashboard' | 'packages' | 'users' | 'rooms' | 'students' | 'employees';
  /** Fungsi callback untuk menangani perubahan tab */
  onTabChange?: (tab: 'dashboard' | 'packages' | 'users' | 'rooms' | 'students' | 'employees') => void;
  /** Fungsi callback untuk logout */
  onLogout?: () => void;
  /** Status drawer di mobile */
  isOpenMobile?: boolean;
  /** Callback untuk menutup drawer di mobile */
  onCloseMobile?: () => void;
}

// Tipe helper untuk semua tab yang valid
type TabKey = 'dashboard' | 'packages' | 'users' | 'rooms' | 'students' | 'employees';

interface NavItem {
  key: TabKey;
  title: string;
  icon: JSX.Element;
}

// Icon SVG helpers
const IconPackage = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconRoom = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconEmployee = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconUserManage = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// Nav items untuk operator (satpam) - hanya fitur terbatas
const OPERATOR_NAV: NavItem[] = [
  { key: 'packages', title: 'Manajemen Paket', icon: <IconPackage /> },
  { key: 'students', title: 'Data Santri', icon: <IconUsers /> },
  { key: 'employees', title: 'Data Staff & Guru', icon: <IconEmployee /> },
];

// Nav items untuk admin - akses penuh
const ADMIN_NAV: NavItem[] = [
  { key: 'packages', title: 'Manajemen Paket', icon: <IconPackage /> },
  { key: 'students', title: 'Data Santri', icon: <IconUsers /> },
  { key: 'employees', title: 'Data Staff & Guru', icon: <IconEmployee /> },
  { key: 'rooms', title: 'Data Kamar', icon: <IconRoom /> },
  { key: 'users', title: 'Manajemen Pengguna', icon: <IconUserManage /> },
];

/**
 * Komponen Sidebar Responsive untuk halaman operator/admin.
 */
const SidebarOperator: React.FC<SidebarOperatorProps> = ({
  role = 'operator',
  activeTab = 'dashboard',
  onTabChange,
  onLogout,
  isOpenMobile = false,
  onCloseMobile
}) => {

  const handleTabSelect = (tab: TabKey) => {
    onTabChange?.(tab);
    onCloseMobile?.();
  };

  const navItems = role === 'admin' ? ADMIN_NAV : OPERATOR_NAV;

  return (
    <>
      {/* 1. BACKDROP OVERLAY (Hanya di mobile saat menu terbuka) */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* 2. SIDEBAR CONTAINER */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[88px] bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col items-center py-6 z-50 shadow-xl md:shadow-sm transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Dashboard Button */}
        <button
          title="Dashboard"
          onClick={() => handleTabSelect('dashboard')}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold border transition-all duration-200 mb-6 ${
            activeTab === 'dashboard'
              ? 'bg-blue-50 dark:bg-slate-800 text-[#143C9C] dark:text-blue-400 border-blue-100 dark:border-slate-700 shadow-sm'
              : 'bg-transparent text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <img src={LogoLight} alt="Logo" className="size-9 dark:hidden" />
          <img src={LogoDark} alt="Logo" className="size-9 hidden dark:block" />
        </button>

        {/* Main Nav Items */}
        <div className="flex flex-col gap-3 w-full px-4">
          {navItems.map((item) => (
            <button
              key={item.key}
              title={item.title}
              onClick={() => handleTabSelect(item.key)}
              className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 ${
                activeTab === item.key
                  ? 'bg-[#143C9C] text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-[#143C9C] dark:hover:text-blue-400'
              }`}
            >
              {item.icon}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

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
      </aside>
    </>
  );
};

export default SidebarOperator;