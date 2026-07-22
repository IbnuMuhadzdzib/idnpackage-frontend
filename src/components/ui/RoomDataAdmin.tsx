import React, { useState, useEffect, useCallback } from 'react';
import { AddRoomModal } from './AddRoomModal';
import ConfirmModal from './ConfirmModal';

import OfficeIcon from '../../assets/building_icon.png';
import OfficeIconDark from '../../assets/building_icon_dark.png';

interface RoomItem {
    id: number;
    name: string;
    floor: number;
}

/**
 * Properti untuk komponen StatsCard
 */
interface StatsCardProps {
    /** Judul statistik */
    title: string;
    /** Nilai/Jumlah statistik */
    count: number;
    /** Ikon statistik */
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
 * Komponen tabel manajemen data kamar untuk peran Admin.
 * Memungkinkan untuk menambah, mengedit, dan menghapus data kamar.
 * 
 * @returns {JSX.Element} Komponen tabel kamar
 */
const RoomDataAdmin: React.FC = () => {
    const [rooms, setRooms] = useState<RoomItem[]>([]);
    const [isLoading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomToEdit, setRoomToEdit] = useState<RoomItem | null>(null);

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
        onConfirm: () => { },
        confirmText: 'Konfirmasi',
    });
    const closeConfirm = () => setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    // --- FETCH ROOMS ---
    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            const list: RoomItem[] = Array.isArray(json)
                ? json
                : Array.isArray(json?.data)
                    ? json.data
                    : [];
            setRooms(list);
        } catch {
            setRooms([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);


    const handleOpenEditModal = (room: RoomItem) => {
        setRoomToEdit(room);
        setIsModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setRoomToEdit(null);
        setIsModalOpen(true);
    }

    // --- HANDLER DELETE ROOM DENGAN POP UP KONFIRMASI ---
    const handleDeleteRoom = (id: number, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Hapus Kamar',
            message: `Apakah Anda yakin ingin menghapus kamar "${name}"? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Hapus',
            onConfirm: async () => {
                closeConfirm();
                try {
                    setLoading(true);
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms/${id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        fetchRooms();
                    }
                } catch (error) {
                    console.error('Gagal menghapus kamar:', error);
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const totalRooms = rooms.length;

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex justify-between items-center gap-2 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <div>
                    <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Manajemen Kamar</h2>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Kelola data kamar/saung di pesantren</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#143C9C] hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl font-semibold text-xs md:text-sm whitespace-nowrap transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Kamar
                </button>
            </div>

            {/* Stats Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatsCard
                    title="Total Kamar"
                    count={totalRooms}
                    icon={
                        <>
                            <img src={OfficeIcon} alt="" className="w-5 h-5 object-contain dark:hidden" />
                            <img src={OfficeIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" />
                        </>
                    }
                />
            </section>

            {/* Data Table */}
            <section className="bg-[#F6F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs">Nama Kamar</th>
                                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs">Lantai</th>
                                <th className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300 text-xs text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-14">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <svg className="w-7 h-7 animate-spin text-[#143C9C]" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            <span className="text-sm">Memuat data kamar...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : rooms.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-14">
                                        <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                                            <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <p className="text-sm font-medium">Belum ada data kamar</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rooms.map(room => (
                                    <tr
                                        key={room.id}
                                        className="hover:bg-gray-100/60 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                                    >
                                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200 text-sm font-medium">
                                            {room.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm font-semibold">
                                            Lantai {room.floor}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    title="Edit"
                                                    onClick={() => handleOpenEditModal(room)}
                                                    className="bg-[#143C9C] hover:bg-blue-800 text-white px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                    Edit
                                                </button>

                                                <button
                                                    title="Hapus"
                                                    onClick={() => handleDeleteRoom(room.id, room.name)}
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

            <AddRoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                roomToEdit={roomToEdit}
                onSuccess={fetchRooms}
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

export default RoomDataAdmin;
