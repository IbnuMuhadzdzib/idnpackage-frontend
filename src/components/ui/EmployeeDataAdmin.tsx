import React, { useState, useEffect, useCallback } from 'react';
import ConfirmModal from './ConfirmModal';
import { AddEmployeeModal } from './AddEmployeeModal';
import OfficeIcon from '../../assets/building_icon.png';
import OfficeIconDark from '../../assets/building_icon_dark.png';
import { API_URL } from '../../api/config';

interface Employee {
  id: number;
  name: string;
  division: string;
  position?: string;
}

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

const EmployeeDataAdmin: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const list: Employee[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : [];
      setEmployees(list);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDeleteEmployee = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Staff/Guru',
      message: `Apakah Anda yakin ingin menghapus staff/guru "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus',
      onConfirm: async () => {
        closeConfirm();
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/employees/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            fetchEmployees();
          }
        } catch (error) {
          console.error('Gagal menghapus staff/guru:', error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const totalEmployees = employees.length;

  // Group by division for stats
  const divisionMap = employees.reduce<Record<string, number>>((acc, e) => {
    acc[e.division] = (acc[e.division] || 0) + 1;
    return acc;
  }, {});
  const divisions = Object.keys(divisionMap);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Staff & Guru"
          count={totalEmployees}
          icon={
            <>
              <img src={OfficeIcon} alt="" className="w-5 h-5 object-contain dark:hidden" />
              <img src={OfficeIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" />
            </>
          }
        />
        {divisions.slice(0, 3).map(div => (
          <div key={div} className="p-5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col justify-between shadow-sm">
            <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400">{div}</h3>
            <div className="text-5xl font-bold mt-4 text-gray-800 dark:text-white">{divisionMap[div]}</div>
          </div>
        ))}
      </section>

      {/* Data Staff/Guru Table */}
      <section className="bg-[#F6F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 gap-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Data Staff & Guru ({totalEmployees})</h2>

          {/* Add Manual Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#143C9C] hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Manual
          </button>
        </div>

        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="sticky top-0 bg-gray-50 dark:bg-slate-800 shadow-sm z-10">
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs uppercase tracking-wider">Divisi</th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs uppercase tracking-wider">Jabatan</th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs uppercase tracking-wider">Aksi</th>
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
                      <span className="text-sm">Memuat data staff...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-14">
                    <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                      <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm font-medium">Belum ada data staff & guru</p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-2 text-xs text-[#143C9C] dark:text-blue-400 hover:underline font-semibold"
                      >
                        + Tambah staff pertama
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map(employee => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-100/60 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                  >
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200 text-sm font-medium">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
                        {employee.division}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {employee.position || <span className="italic text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        title="Hapus"
                        onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                        className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 px-3 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchEmployees();
        }}
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

export default EmployeeDataAdmin;
