import React from 'react';
import LiveDateTimeOperator from '../ui/LiveDateTimeOperator';
import ThemeToggle from '../ui/ThemeToggle';

interface NavbarOperatorNewProps {
  operatorName?: string;
  operatorPhone?: string;
}

const NavbarOperatorNew: React.FC<NavbarOperatorNewProps> = ({
  operatorName = 'Satpam',
  operatorPhone = '08969******',
}) => {
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

        {/* Profile */}
        <div className="flex items-center gap-3 bg-[#F2F4F7] dark:bg-slate-800 py-2 px-4 rounded-xl transition-colors cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700">
          <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden ring-2 ring-[#143C9C]/20 dark:ring-blue-500/30 flex-shrink-0">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(operatorName)}&background=143C9C&color=fff&bold=true`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-xs min-w-0">
            <p className="font-bold text-gray-800 dark:text-white leading-tight whitespace-nowrap">&lt;{operatorName}&gt;</p>
            <p className="text-gray-500 dark:text-gray-400 leading-tight whitespace-nowrap">{operatorPhone}</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarOperatorNew;
