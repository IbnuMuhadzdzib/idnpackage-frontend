import React, { useState, useEffect, useCallback } from 'react';
import AddPackageModal from './AddPackageModal';

import PackageIcon from '../../assets/package_icon.png';
import RecievedIcon from '../../assets/hand_icon.png';
import OfficeIcon from '../../assets/building_icon.png';
import PosIcon from '../../assets/shield_icon.png';
import PackageIconDark from '../../assets/package_icon_dark.png';
import RecievedIconDark from '../../assets/hand_icon_dark.png';
import OfficeIconDark from '../../assets/building_icon_dark.png';
import PosIconDark from '../../assets/shield_icon_dark.png';

// --- TYPE DEFINITIONS ---
interface Student { id: number; name: string; nis?: string; }
interface Room    { id: number; name: string; }
interface PackageItem {
  id: number;
  studentId?: Student;
  roomId?: Room;
  location: 'security_post' | 'dormitory_office' | 'taken' | string;
  notes: string | null;
  photoUrl: string | null;
  ekspedisi?: string;
  createdAt: string;
}

// --- MINI STATS CARD ---
interface StatsCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  isActive?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, count, icon, isActive = false }) => (
  <div className={`p-5 rounded-xl border flex flex-col justify-between h-full transition-all shadow-sm hover:shadow-md cursor-default select-none
    ${isActive
      ? 'bg-[#143C9C] text-white border-[#143C9C] dark:bg-blue-700 dark:border-blue-700'
      : 'bg-white text-[#143C9C] border-gray-200 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700'
    }`}
  >
    <div className="flex justify-between items-start w-full">
      <h3 className={`font-semibold text-sm leading-tight ${isActive ? 'text-white' : 'text-[#143C9C] dark:text-blue-400'}`}>
        {title}
      </h3>
      <div className={`p-1.5 rounded-lg flex-shrink-0 ${isActive ? 'bg-white/20' : 'bg-blue-50 dark:bg-slate-700'}`}>
        {icon}
      </div>
    </div>
    <div className={`text-7xl font-bold mt-4 ${isActive ? 'text-white' : 'text-[#143C9C] dark:text-blue-400'}`}>
      {count}
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const PackageTableOperator: React.FC = () => {
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Table & stats data
  const [tableData, setTableData] = useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({ total: 0, taken: 0, dormitory_office: 0, security_post: 0 });

  // --- FETCH PACKAGES ---
  const fetchPackages = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://idnpackage-backend-production.up.railway.app/packages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const responseData = await response.json();
      const packages = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data) ? responseData.data : [];

      setTableData(packages);
      setStats({
        total: packages.length,
        taken: packages.filter((p: PackageItem) => p.location === 'taken').length,
        dormitory_office: packages.filter((p: PackageItem) => p.location === 'dormitory_office').length,
        security_post: packages.filter((p: PackageItem) => p.location === 'security_post').length,
      });
    } catch (error) {
      console.error('Gagal mengambil data paket:', error);
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
    const interval = setInterval(fetchPackages, 30000);
    return () => clearInterval(interval);
  }, [fetchPackages]);

  // --- HELPERS ---
  const getLocationBadge = (location: string) => {
    switch (location) {
      case 'security_post':     return { label: 'Di Pos',    color: 'bg-[#FCE154] text-gray-900' };
      case 'dormitory_office':  return { label: 'Di Kantor', color: 'bg-[#63DF8A] text-gray-900' };
      case 'taken':             return { label: 'Diterima',  color: 'bg-[#65B7FF] text-gray-900' };
      default:                  return { label: location || 'Unknown', color: 'bg-gray-200 text-gray-900' };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const formatDate = (date: Date) => {
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // --- DATE PICKER ---
  const daysInMonth    = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const today          = new Date(); today.setHours(0, 0, 0, 0);

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handleDateSelect = (day: number) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    setIsDatePickerOpen(false);
  };

  // Filter by selected date
  const filteredData = tableData.filter((row) => {
    if (!row.createdAt) return false;
    const d = new Date(row.createdAt);
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  });

  // --- STATS CARD DATA ---
  const statsData = [
    {
      id: 'total',
      title: 'Total Paket',
      count: stats.total,
      isActive: true,
      icon: (
        <>
          <img src={PackageIcon} alt="" className="w-5 h-5 object-contain dark:hidden" />
          <img src={PackageIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" />
        </>
      ),
    },
    {
      id: 'diterima',
      title: 'Paket Diterima',
      count: stats.taken,
      isActive: false,
      icon: (
        <>
          <img src={RecievedIcon} alt="" className="w-5 h-5 object-contain dark:hidden" />
          <img src={RecievedIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" />
        </>
      ),
    },
    {
      id: 'kantor',
      title: 'Paket di Kantor',
      count: stats.dormitory_office,
      isActive: false,
      icon: (
        <>
          <img src={OfficeIcon} alt="" className="w-5 h-5 object-contain dark:hidden" />
          <img src={OfficeIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" />
        </>
      ),
    },
    {
      id: 'pos',
      title: 'Paket di Pos',
      count: stats.security_post,
      isActive: false,
      icon: (
        <>
          <img src={PosIcon} alt="" className="w-5 h-5 object-contain dark:hidden" />
          <img src={PosIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" />
        </>
      ),
    },
  ];

  return (
    <div className="w-full font-sans space-y-6 relative">

      {/* --- Stats Cards Grid --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((s) => (
          <StatsCard key={s.id} title={s.title} count={s.count} icon={s.icon} isActive={s.isActive} />
        ))}
      </div>

      {/* --- Data Table Section --- */}
      <div className="bg-[#F6F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-colors shadow-sm">

        {/* Table Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">Data Paket</h2>

          <div className="flex items-center gap-2">
            <button className="px-5 py-1.5 text-sm font-medium text-[#143C9C] dark:text-blue-400 border border-[#143C9C] dark:border-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
              Pindahkan
            </button>
            <button className="px-5 py-1.5 text-sm font-medium text-[#143C9C] dark:text-blue-400 border border-[#143C9C] dark:border-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
              Diambil
            </button>
            <button className="px-6 py-1.5 text-sm font-medium text-white bg-[#143C9C] dark:bg-blue-600 rounded-full hover:bg-blue-800 dark:hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                <th className="px-6 py-4 w-12"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#143C9C] focus:ring-[#143C9C]" /></th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs">Nama (Penerima)</th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs">Kamar</th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs">Jam Masuk</th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs">Status</th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <svg className="w-7 h-7 animate-spin text-[#143C9C]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm">Memuat data paket...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14">
                    <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                      <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm font-medium">Belum ada data paket</p>
                      <p className="text-xs">untuk tanggal {formatDate(selectedDate)}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const badge = getLocationBadge(row.location);

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-100/60 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                    >
                      <td className="px-6 py-4 w-12"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#143C9C] focus:ring-[#143C9C]" /></td>
                      <td className="px-6 py-4 text-gray-800 dark:text-gray-200 text-sm">
                        {row.studentId?.name || 'Tidak diketahui'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                        {row.roomId?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                        {formatTime(row.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-1 rounded-full font-semibold text-[11px] inline-block ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            title="Cek detail"
                            className="bg-[#143C9C] hover:bg-blue-800 text-white px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            Cek
                          </button>
                          <button
                            title="Edit"
                            className="bg-[#143C9C] hover:bg-blue-800 text-white px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Date Picker Modal --- */}
      {isDatePickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setIsDatePickerOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 w-80 transition-colors"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modalIn 0.2s ease-out forwards' }}
          >
            <div className="flex justify-between items-center mb-4">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                {currentMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={handleNextMonth}
                disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Mg','Sn','Sl','Rb','Km','Jm','Sb'].map(day => (
                <div key={day} className="text-xs font-medium text-gray-400 py-1">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isFuture = cellDate > today;
                const isSelected =
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === currentMonth.getMonth() &&
                  selectedDate.getFullYear() === currentMonth.getFullYear();
                return (
                  <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    disabled={isFuture}
                    className={`text-sm w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-[#143C9C] dark:bg-blue-600 text-white font-bold' : ''}
                      ${!isSelected && !isFuture ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700' : ''}
                      ${isFuture ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- Add Package Modal --- */}
      <AddPackageModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => { fetchPackages(); }}
      />

      {/* Expose setIsAddModalOpen so parent can trigger it */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export { PackageTableOperator as default };
export type { PackageTableOperatorRef };

// --- Ref type for parent to open modal ---
interface PackageTableOperatorRef {
  openAddModal: () => void;
}
