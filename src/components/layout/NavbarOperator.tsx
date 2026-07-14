
import LiveDateTimeOperator from '../ui/LiveDateTimeOperator';
import ThemeToggle from '../ui/ThemeToggle';

import LogoLight from '../../assets/icon.png'
import LogoDark from '../../assets/icon_white.png'

const NavbarOperator = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900 font-jakarta border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
      
      {/* Kiri: Logo & Search */}
      <div className="flex items-center gap-6">
        {/* Logo Placeholder */}
        <div className="w-14 h-14 bg-[#F3F3F3] dark:bg-slate-800 text-[#143C9C] dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-2xl border border-grey-100 dark:border-slate-700">
          <img src={LogoLight} alt="" className='size-10 dark:hidden' />
          <img src={LogoDark} alt="" className='size-10 hidden dark:block' />
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-blue-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-64 pl-11 pr-4 py-4 bg-[#F2F4F7] dark:bg-slate-800 border-transparent rounded-lg text-sm placeholder-blue-400 dark:placeholder-gray-400  focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-0 outline-none transition-colors"
            placeholder="Search"
          />
        </div>

        <LiveDateTimeOperator />

      </div>

      {/* Kanan: Settings, Profile, Logout */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Placeholder */}
        <ThemeToggle />

        {/* Profile */}
        <div className="flex items-center gap-3 bg-[#F2F4F7] dark:bg-slate-800 py-1.5 px-3 rounded-xl transition-colors">
          <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Satpam" alt="Profile" className="w-full h-full object-cover"/>
          </div>
          <div className="text-xs">
            <p className="font-bold text-gray-800 dark:text-white">&lt;Satpam&gt;</p>
            <p className="text-gray-500 dark:text-gray-400">08969******</p>
          </div>
        </div>

        {/* Logout */}
        <button className="w-10 h-10 bg-[#FF5A5F] hover:bg-red-600 flex items-center justify-center rounded-xl text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>

    </nav>
  );
};

export default NavbarOperator;