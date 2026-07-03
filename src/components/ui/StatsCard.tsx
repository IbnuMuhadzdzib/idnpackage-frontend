import React from "react";

interface StatsCardProps {
    title: string;
    count: number | string;
    icon: React.ReactNode;
    isActive?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, count, icon, isActive = false }) => {
    return(
        <div 
      className={`p-6 rounded-xl border flex flex-col justify-between h-fit transition-all shadow-sm
        ${isActive 
          ? 'bg-[#1a4198] text-white border-[#1a4198] dark:bg-blue-600 dark:border-blue-600' // Style aktif (Biru)
          : 'bg-white text-[#1a4198] border-gray-200 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700'  // Style pasif (Putih)
        }
      `}
    >
      <div className="flex justify-between items-center w-full">
        <h3 className={`font-semibold text-lg ${isActive ? 'text-white' : 'text-[#1a4198] dark:text-blue-400'}`}>
          {title}
        </h3>
        {/* Render Icon */}
        <div className={`p-1 rounded-md ${isActive ? 'bg-[#ffffff] dark:bg-slate-200' : 'bg-[#f0f4f8] dark:bg-slate-700'}`}>
          {icon}
        </div>
      </div>
      
      <div className="text-9xl font-bold mt-8">
        {count}
      </div>
    </div>
    )
}

export default StatsCard
