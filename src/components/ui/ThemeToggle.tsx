import { useEffect, useState } from 'react';

/**
 * Komponen Toggle Tema (Light/Dark Mode).
 * Tampilan menyesuaikan ukuran layar:
 * - Mobile/Tablet (< md): Single button Matahari (Active = Light, Unactive = Dark)
 * - Desktop (>= md): Dual button Matahari & Bulan
 */
const ThemeToggle = () => {
  // Ambil tema awal dari localStorage, jika belum ada default ke 'light'
  const [theme, setTheme] = useState<string>(
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    // Set atribut data-theme di tag <html> agar DaisyUI berubah warna
    root.setAttribute('data-theme', theme);
    // Tambahkan class 'dark' agar Tailwind dark: prefix juga bekerja
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Simpan pilihan ke localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fungsi toggle bolak-balik antara light dan dark
  const handleToggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      {/* 1. SINGLE SUN BUTTON TOGGLE (Khusus Layar di Bawah Tablet: < md) */}
      <div className="md:hidden flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner transition-colors">
        <button
          type="button"
          onClick={handleToggle}
          title={theme === 'light' ? 'Mode Terang (Aktif)' : 'Mode Gelap (Klik untuk aktifkan mode terang)'}
          className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${theme === 'light'
              ? 'bg-[#10439F] text-white shadow-md' // Active (Light Mode)
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300' // Unactive (Dark Mode)
            }`}
        >
          {/* SVG Sun Icon Only */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>

      {/* 2. DUAL BUTTON TOGGLE (Khusus Layar Desktop/Tablet: >= md) */}
      <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner transition-colors">
        {/* Tombol Light Mode (Sun) */}
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`p-1.5 rounded-xl transition-all duration-200 ${theme === 'light'
              ? 'bg-[#10439F] text-white shadow-md'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>

        {/* Tombol Dark Mode (Moon) */}
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`p-1.5 rounded-xl transition-all duration-200 ${theme === 'dark'
              ? 'bg-[#10439F] text-white shadow-md'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default ThemeToggle;