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
          ? 'bg-[#1a4198] text-white border-[#1a4198]' // Style aktif (Biru)
          : 'bg-white text-[#1a4198] border-gray-200'  // Style pasif (Putih)
        }
      `}
    >
      <div className="flex justify-between items-center w-full">
        <h3 className={`font-semibold text-lg ${isActive ? 'text-white' : 'text-[#1a4198]'}`}>
          {title}
        </h3>
        {/* Render Icon */}
        <div className={`p-1 rounded-md ${isActive ? 'bg-[#ffffff]' : 'bg-[#f0f4f8]'}`}>
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
