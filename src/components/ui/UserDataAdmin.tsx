import React, { useState, useEffect, useCallback } from 'react';
import { UserModal } from '../ui/AddUserModal';
import ConfirmModal from './ConfirmModal';

import PosIcon from '../../assets/shield_icon.png';
import PosIconDark from '../../assets/shield_icon_dark.png';
import OfficeIcon from '../../assets/building_icon.png';
import OfficeIconDark from '../../assets/building_icon_dark.png';

/**
 * Tipe data pengguna
 */
interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  roomId?: number | null;
  room?: { id: number; name: string } | null;
}

type FilterTab = 'semua' | 'admin' | 'operator' | 'teacher';

/**
 * Properti untuk komponen StatsCard
 */
interface StatsCardProps {
  /** Judul kartu statistik */
  title: string;
  /** Nilai statistik */
  count: number;
  /** Ikon yang ditampilkan */
  icon: React.ReactNode;
}
const StatsCard: React.FC<StatsCardProps> = ({ title, count, icon }) => (
  <div className="p-5 rounded-2xl border bg-[#143C9C] border-[#143C9C] flex flex-col justify-between h-full shadow-sm select-none">
    <div className="flex justify-between items-center w-full">
      <h3 className="font-semibold text-sm text-white">{title}</h3>
      <div className="p-1.5 rounded-lg bg-white/40">{icon}</div>
    </div>
    <div className="text-7xl font-bold mt-4 text-white">{count}</div>
  </div>
);

/**
 * Komponen untuk menampilkan badge role pengguna.
 *
 * @param {object} props - Properti komponen
 * @param {string} props.role - Peran pengguna (misal: 'operator', 'teacher', 'admin')
 * @returns {JSX.Element} Badge dengan warna yang sesuai peran
 */
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const map: Record<string, { label: string; color: string }> = {
    operator: { label: 'Operator', color: 'bg-[#65B7FF] text-gray-900' },
    teacher: { label: 'Teacher', color: 'bg-[#FCE154] text-gray-900' },
    admin: { label: 'Admin', color: 'bg-[#63DF8A] text-gray-900' },
  };
  const badge = map[role] ?? { label: role, color: 'bg-gray-200 text-gray-700' };
  return (
    <span className={`px-4 py-1 rounded-full text-[11px] font-semibold ${badge.color}`}>
      {badge.label}
    </span>
  );
};

/**
 * Komponen utama manajemen data pengguna untuk peran Admin.
 * Menampilkan statistik jumlah pengguna berdasarkan peran dan tabel daftar pengguna.
 * Mendukung filter berdasarkan peran, serta fitur edit dan hapus pengguna.
 *
 * @returns {JSX.Element} Komponen manajemen pengguna
 */
const UserDataAdmin: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('semua');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserItem | null>(null);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Konfirmasi',
  });
  const closeConfirm = () => setConfirmModal((prev) => ({ ...prev, isOpen: false }));

  // --- FETCH USERS ---
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
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


  const handleOpenEditModal = (user: UserItem) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  // --- HANDLER DELETE USER DENGAN POP UP KONFIRMASI ---
  const handleDeleteUser = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Pengguna',
      message: `Apakah Anda yakin ingin menghapus pengguna "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus',
      onConfirm: async () => {
        closeConfirm();
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            fetchUsers();
          }
        } catch (error) {
          console.error('Gagal menghapus pengguna:', error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const totalAdmin = users.filter(u => u.role === 'admin').length;
  const totalOperator = users.filter(u => u.role === 'operator').length;
  const totalTeacher = users.filter(u => u.role === 'teacher').length;

  const filteredUsers = filter === 'semua'
    ? users
    : users.filter(u => u.role === filter);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'admin', label: 'Admin' },
    { key: 'operator', label: 'Operator' },
    { key: 'teacher', label: 'Teacher' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatsCard
          title="Total Admin"
          count={totalAdmin}
          icon={
            <>
              <img src={OfficeIcon} alt="" className="w-5 h-5 object-contain dark:hidden" />
              <img src={OfficeIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" />
            </>
          }
        />
        <StatsCard
          title="Total Operator"
          count={totalOperator}
          icon={
            <>
              <img src={PosIcon} alt="" className="w-5 h-5 object-contain dark:hidden" />
              <img src={PosIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" />
            </>
          }
        />
        <StatsCard
          title="Total Teacher"
          count={totalTeacher}
          icon={
            <>
              <img src={OfficeIcon} alt="" className="w-5 h-5 object-contain dark:hidden" />
              <img src={OfficeIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" />
            </>
          }
        />
      </section>

      {/* Data Pengguna Table */}
      <section className="bg-[#F6F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 gap-3">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Data Pengguna</h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-auto md:overflow-hidden">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${filter === tab.key
                  ? 'bg-[#143C9C] text-white'
                  : 'text-[#143C9C] dark:text-blue-400 border border-[#143C9C] dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
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

                        <button
                          title="Edit"
                          onClick={() => handleOpenEditModal(user)}
                          className="bg-[#143C9C] hover:bg-blue-800 text-white px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </button>

                        {/* BUTTON CEK SUDAH BERUBAH MENJADI HAPUS */}
                        <button
                          title="Hapus"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Hapus
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

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
        onSuccess={fetchUsers}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
        confirmText={confirmModal.confirmText}
        type="danger"
      />
    </div>
  );
};

export default UserDataAdmin;
