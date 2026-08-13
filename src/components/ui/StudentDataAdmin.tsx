import React, { useState, useEffect, useCallback } from 'react';
import ConfirmModal from './ConfirmModal';
import { CustomDropdown } from './CustomDropdown';
import { AddStudentModal } from './AddStudentModal';
import { API_URL } from '../../api/config';

interface Room {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
  nis?: string;
  roomId?: Room;
}

const StudentDataAdmin: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
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

  const fetchRooms = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const list: Room[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : [];
      setRooms(list);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const list: Student[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : [];
      setStudents(list);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchStudents();
  }, [fetchRooms, fetchStudents]);

  const handleDeleteStudent = (id: number, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Santri',
      message: `Apakah Anda yakin ingin menghapus santri "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus',
      onConfirm: async () => {
        closeConfirm();
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/students/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            fetchStudents();
          }
        } catch (error) {
          console.error('Gagal menghapus santri:', error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Build dropdown options for room filter
  const roomFilterOptions = [
    { value: 'all', label: 'Semua Kamar' },
    ...rooms.map(r => ({ value: r.name, label: r.name })),
  ];

  const filteredStudents = selectedRoom === 'all'
    ? students
    : students.filter(s => s.roomId?.name === selectedRoom);

  return (
    <div className="space-y-6">
      {/* Data Santri Table */}
      <section className="bg-[#F6F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 gap-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Data Santri ({filteredStudents.length})
          </h2>

          <div className="flex items-center gap-2">
            {/* Custom Room Filter Dropdown */}
            <div className="w-44">
              <CustomDropdown
                options={roomFilterOptions}
                value={selectedRoom}
                onChange={setSelectedRoom}
                placeholder="Semua Kamar"
              />
            </div>

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
        </div>

        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="sticky top-0 bg-gray-50 dark:bg-slate-800 shadow-sm z-10">
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs uppercase tracking-wider">NIS</th>
                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs uppercase tracking-wider">Kamar</th>
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
                      <span className="text-sm">Memuat data santri...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-14">
                    <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                      <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm font-medium">Belum ada data santri</p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-2 text-xs text-[#143C9C] dark:text-blue-400 hover:underline font-semibold"
                      >
                        + Tambah santri pertama
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-100/60 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                  >
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200 text-sm font-medium">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm font-mono">
                      {student.nis || <span className="text-gray-400 italic font-sans">-</span>}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {student.roomId?.name ? (
                        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#143C9C] dark:text-blue-400 rounded-full text-xs font-semibold">
                          {student.roomId.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        title="Hapus"
                        onClick={() => handleDeleteStudent(student.id, student.name)}
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

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchStudents();
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

export default StudentDataAdmin;
