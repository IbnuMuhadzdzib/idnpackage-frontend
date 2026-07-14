import React, { useState, useEffect, useCallback } from 'react';

import PosIcon from '../../assets/shield_icon.png';
import PosIconDark from '../../assets/shield_icon_dark.png';
import OfficeIcon from '../../assets/building_icon.png';
import OfficeIconDark from '../../assets/building_icon_dark.png';

// --- TYPES ---
interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

type FilterTab = 'semua' | 'operator' | 'teacher';

// --- MINI STATS CARD ---
interface StatsCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
}
const StatsCard: React.FC<StatsCardProps> = ({ title, count, icon }) => (
  <div className="p-5 rounded-2xl border bg-[#143C9C] border-[#143C9C] flex flex-col justify-between h-full shadow-sm select-none">
    <div className="flex justify-between items-center w-full">
      <h3 className="font-semibold text-sm text-white">{title}</h3>
      <div className="p-1.5 rounded-lg bg-white/20">{icon}</div>
    </div>
    <div className="text-7xl font-bold mt-4 text-white">{count}</div>
  </div>
);

// --- ROLE BADGE ---
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const map: Record<string, { label: string; color: string }> = {
    operator: { label: 'Satpam',  color: 'bg-[#65B7FF] text-gray-900' },
    teacher:  { label: 'Ustadz',  color: 'bg-[#FCE154] text-gray-900' },
    admin:    { label: 'Admin',   color: 'bg-[#63DF8A] text-gray-900' },
  };
  const badge = map[role] ?? { label: role, color: 'bg-gray-200 text-gray-700' };
  return (
    <span className={`px-4 py-1 rounded-full text-[11px] font-semibold ${badge.color}`}>
      {badge.label}
    </span>
  );
};

// --- MAIN COMPONENT ---
const UserDataAdmin: React.FC = () => {
  const [users, setUsers]       = useState<UserItem[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [filter, setFilter]     = useState<FilterTab>('semua');

  // --- FETCH USERS ---
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res   = await fetch('https://idnpackage-backend-production.up.railway.app/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const list: UserItem[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : [];
      setUsers(list);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- COUNTS ---
  const totalOperator = users.filter(u => u.role === 'operator').length;
  const totalTeacher  = users.filter(u => u.role === 'teacher').length;

  // --- FILTERED DATA ---
  const filteredUsers = filter === 'semua'
    ? users
    : users.filter(u => u.role === filter);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'semua',    label: 'Semua'  },
    { key: 'operator', label: 'Satpam' },
    { key: 'teacher',  label: 'Ustadz' },
  ];

  return (
    <div className="space-y-6">

      {/* --- Stats Cards --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatsCard
          title="Total Satpam"
          count={totalOperator}
          icon={
            <>
              <img src={PosIcon}     alt="" className="w-5 h-5 object-contain dark:hidden" />
              <img src={PosIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" />
            </>
          }
        />
        <StatsCard
          title="Total Ustadz"
          count={totalTeacher}
          icon={
            <>
              <img src={OfficeIcon}     alt="" className="w-5 h-5 object-contain dark:hidden" />
              <img src={OfficeIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" />
            </>
          }
        />
      </section>

      {/* --- Data Pengguna Table --- */}
      <section className="bg-[#F6F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">

        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 gap-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Data Pengguna</h2>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  filter === tab.key
                    ? 'bg-[#143C9C] text-white'
                    : 'text-[#143C9C] dark:text-blue-400 border border-[#143C9C] dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs">Nama</th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs">Role</th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs">Email</th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-14">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <svg className="w-7 h-7 animate-spin text-[#143C9C]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm">Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-14">
                    <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                      <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm font-medium">Belum ada data pengguna</p>
                      <p className="text-xs">dengan filter yang dipilih</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-100/60 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                  >
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200 text-sm font-medium">
                      {user.name}
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* Dummy Cek */}
                        <button
                          title="Cek detail"
                          className="bg-[#143C9C] hover:bg-blue-800 text-white px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Cek
                        </button>
                        {/* Dummy Edit */}
                        <button
                          title="Edit"
                          className="bg-[#143C9C] hover:bg-blue-800 text-white px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default UserDataAdmin;
