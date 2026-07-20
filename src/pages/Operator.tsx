import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SidebarOperator from '../components/layout/SidebarOperator';
import NavbarOperatorNew from '../components/layout/NavbarOperatorNew';
import AddPackageModal from '../components/ui/AddPackageModal';
import PackageTableAdmin from '../components/ui/PackageTableAdmin';
import PackageAreaChart from '../components/ui/PackageAreaChart';
import UserDataAdmin from '../components/ui/UserDataAdmin';

import PackageIcon from '../assets/package_icon.png';
import RecievedIcon from '../assets/hand_icon.png';
import OfficeIcon from '../assets/building_icon.png';
import PosIcon from '../assets/shield_icon.png';
import PackageIconDark from '../assets/package_icon_dark.png';
import RecievedIconDark from '../assets/hand_icon_dark.png';
import OfficeIconDark from '../assets/building_icon_dark.png';
import PosIconDark from '../assets/shield_icon_dark.png';
import { UserModal } from '../components/ui/AddUserModal';

// --- TYPE DEFINITIONS ---
interface Student { id: number; name: string; }
interface Room { id: number; name: string; }
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

// --- STATS CARD ---
interface StatsCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  isActive?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, count, icon, isActive = false }) => (
  <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all shadow-sm hover:shadow-md select-none
    ${isActive
      ? 'bg-[#143C9C] text-white border-[#143C9C] dark:bg-blue-700 dark:border-blue-700'
      : 'bg-white text-[#143C9C] border-gray-200 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700'
    }`}
  >
    <div className="flex justify-between items-center w-full">
      <h3 className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-[#143C9C] dark:text-blue-400'}`}>
        {title}
      </h3>
      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-blue-50 dark:bg-slate-700'}`}>
        {icon}
      </div>
    </div>
    <div className={`text-7xl font-bold mt-5 ${isActive ? 'text-white' : 'text-[#143C9C] dark:text-blue-400'}`}>
      {count}
    </div>
  </div>
);

function Operator() {
  useEffect(() => {
    document.title = 'Satpam Page - IDN Paketku';
  }, []);

  // --- Navigation & Role ---
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'admin' | 'operator'>('operator');
  const [userName, setUserName] = useState<string>('Satpam');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'packages' | 'users'>('dashboard');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') setUserRole('admin');
        if (user.name) setUserName(user.name);
      } catch (e) { }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth', { replace: true });
  };

  // --- Modal State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Tambahkan baris di bawah ini untuk trigger refresh user:
  const [userRefreshKey, setUserRefreshKey] = useState(0);

  const fetchUser = () => {
    setUserRefreshKey(prev => prev + 1);
  };

  // --- Date picker ---
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // --- Data & stats ---
  const [tableData, setTableData] = useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, taken: 0, dormitory_office: 0, security_post: 0 });
  const [actionLoading, setActionLoading] = useState<{ id: number; type: string } | null>(null);

  // --- FETCH PACKAGES ---
  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('https://idnpackage-backend-production.up.railway.app/packages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      const packages: PackageItem[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setTableData(packages);
      setStats({
        total: packages.length,
        taken: packages.filter(p => p.location === 'taken').length,
        dormitory_office: packages.filter(p => p.location === 'dormitory_office').length,
        security_post: packages.filter(p => p.location === 'security_post').length,
      });
    } catch {
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    const iv = setInterval(fetchPackages, 30000);
    return () => clearInterval(iv);
  }, []);

  // --- ACTION HANDLERS ---
  const handlePindahkan = async (pkg: PackageItem) => {
    const newLocation = pkg.location === 'security_post' ? 'dormitory_office' : 'security_post';
    setActionLoading({ id: pkg.id, type: 'pindah' });
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://idnpackage-backend-production.up.railway.app/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ location: newLocation }),
      });
      await fetchPackages();
    } catch (e) {
      console.error('Gagal memindahkan paket:', e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDiambil = async (pkg: PackageItem) => {
    setActionLoading({ id: pkg.id, type: 'ambil' });
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://idnpackage-backend-production.up.railway.app/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ location: 'taken' }),
      });
      await fetchPackages();
    } catch (e) {
      console.error('Gagal mengambil paket:', e);
    } finally {
      setActionLoading(null);
    }
  };

  // --- HELPERS ---
  const getLocationBadge = (loc: string) => {
    switch (loc) {
      case 'security_post': return { label: 'Di Pos', color: 'bg-[#FCE154] text-gray-900' };
      case 'dormitory_office': return { label: 'Di Kantor', color: 'bg-[#63DF8A] text-gray-900' };
      case 'taken': return { label: 'Diterima', color: 'bg-[#65B7FF] text-gray-900' };
      default: return { label: loc || '—', color: 'bg-gray-200 text-gray-900' };
    }
  };

  const formatTime = (ds: string) =>
    new Date(ds).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  const formatDate = (d: Date) => {
    const m = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
  };

  // --- DATE PICKER ---
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handleDateSelect = (day: number) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    setIsDatePickerOpen(false);
  };

  // Filter by selected date
  const filteredData = tableData.filter(row => {
    if (!row.createdAt) return false;
    const d = new Date(row.createdAt);
    return d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear();
  });

  // --- STATS CARD DATA ---
  const statsCards: StatsCardProps[] = [
    {
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

  // State untuk kontrol buka/tutup modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 dark:text-white min-h-screen transition-colors duration-300 font-jakarta">

      {/* Sidebar */}
      <SidebarOperator role={userRole} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      {/* Main area shifts right by sidebar width */}
      <div className="ml-[88px] flex flex-col min-h-screen">

        {/* Navbar */}
        <header>
          <NavbarOperatorNew operatorName={userName} />
        </header>

        {/* Page Content */}
        <main className="flex-1 px-8 py-8 space-y-6">

          {/* Greeting + Tambah Paket */}
          <section className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 dark:text-white font-bold text-2xl">
                Assalamu'alaikum, {userRole === 'admin' ? 'Admin!' : `Pak ${userName}!`}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                Antum yang sedang bertugas dalam menerima paket.
              </p>
            </div>

            {/* Tambah Paket button — shown on dashboard/packages tabs */}
            {activeTab !== 'users' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                id="btn-tambah-paket"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#143C9C] hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Tambah {userRole === 'admin' && activeTab === 'dashboard' ? 'Data' : 'Paket'}
              </button>
            )}

            {/* Tambah User button — shown on users tab for admin */}
            {userRole === 'admin' && activeTab === 'users' && (
              <button
                id="btn-tambah-user"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#143C9C] hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Tambah User
              </button>
            )}
          </section>

          {/* --- ADMIN DASHBOARD TAB --- */}
          {userRole === 'admin' && activeTab === 'dashboard' && (
            <>
              {/* Stats Admin Dashboard */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatsCard title="Total Paket" count={stats.total} icon={<><img src={PackageIcon} className="w-5 h-5 dark:hidden" /><img src={PackageIconDark} className="w-5 h-5 hidden dark:block" /></>} isActive={true} />
                <StatsCard title="Paket Selesai/Diterima" count={stats.taken} icon={<><img src={RecievedIcon} className="w-5 h-5 dark:hidden" /><img src={RecievedIconDark} className="w-5 h-5 hidden dark:block" /></>} />
                <StatsCard title="Paket di Kantor" count={stats.dormitory_office} icon={<><img src={OfficeIcon} className="w-5 h-5 dark:hidden" /><img src={OfficeIconDark} className="w-5 h-5 hidden dark:block" /></>} />
              </section>

              {/* Area Chart */}
              <PackageAreaChart onCekData={() => setActiveTab('packages')} />
            </>
          )}

          {/* --- ADMIN USERS TAB --- */}
          {userRole === 'admin' && activeTab === 'users' && (
            <UserDataAdmin key={userRefreshKey} />
          )}

          {/* --- PACKAGES TAB FOR ADMIN --- */}
          {userRole === 'admin' && activeTab === 'packages' && (
            <PackageTableAdmin />
          )}

          {/* --- PACKAGES TAB FOR OPERATOR --- */}
          {userRole === 'operator' && (
            <>
              {/* Stats Cards */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((s, i) => (
                  <StatsCard key={i} title={s.title} count={s.count} icon={s.icon} isActive={s.isActive} />
                ))}
              </section>

              {/* Data Table */}
              <section>
                <div className="bg-[#F6F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">

                  {/* Table header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 gap-3">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Data Paket</h2>
                    <button
                      onClick={() => setIsDatePickerOpen(true)}
                      className="flex items-center gap-2 px-3.5 py-2 text-[#143C9C] dark:text-blue-300 border border-[#143C9C]/40 dark:border-blue-400/40 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 font-medium text-sm transition-all bg-white dark:bg-slate-900"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(selectedDate)}
                    </button>
                  </div>

                  {/* Table body */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          {['Nama (Penerima)', 'Kamar', 'Ekspedisi', 'Jam Masuk', 'Status', 'Action'].map(h => (
                            <th key={h} className="px-6 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan={6} className="text-center py-14">
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
                            <td colSpan={6} className="text-center py-16">
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
                          filteredData.map(row => {
                            const badge = getLocationBadge(row.location);
                            const isPindahLoading = actionLoading?.id === row.id && actionLoading?.type === 'pindah';
                            const isAmbilLoading = actionLoading?.id === row.id && actionLoading?.type === 'ambil';
                            const isTaken = row.location === 'taken';
                            return (
                              <tr key={row.id} className="hover:bg-gray-100/60 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                                <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium">
                                  {row.studentId?.name || 'Tidak diketahui'}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.roomId?.name || '-'}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{row.ekspedisi || 'JTE'}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatTime(row.createdAt)}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-3.5 py-1.5 rounded-full font-medium text-xs ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handlePindahkan(row)}
                                      disabled={!!actionLoading || isTaken}
                                      className="bg-[#65B7FF] hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 px-3.5 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1 hover:shadow-sm"
                                    >
                                      {isPindahLoading && (
                                        <svg className="w-3 h-3 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                      )}
                                      Pindahkan
                                    </button>
                                    <button
                                      onClick={() => handleDiambil(row)}
                                      disabled={!!actionLoading || isTaken}
                                      className="bg-[#63DF8A] hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 px-3.5 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1 hover:shadow-sm"
                                    >
                                      {isAmbilLoading && (
                                        <svg className="w-3 h-3 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                      )}
                                      Diambil
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
              </section>
            </>
          )}
        </main>
      </div>

      {/* --- Date Picker Modal --- */}
      {isDatePickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setIsDatePickerOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 w-80 transition-colors"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'dpIn 0.2s ease-out forwards' }}
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
              {['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'].map(d => (
                <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isFuture = cellDate > today;
                const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
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
                  >{day}</button>
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
        onSuccess={fetchPackages}
      />

      {/* --- Add User Modal --- */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUser} // <- Tambahin baris ini!
      />

      <style>{`
        @keyframes dpIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default Operator;