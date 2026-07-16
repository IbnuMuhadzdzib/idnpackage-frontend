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

// --- COMPONENT: DETAIL PACKAGE MODAL (Sesuai Desain Gambar) ---
interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PackageItem | null;
}

const DetailPackageModal: React.FC<DetailModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const getLocationLabel = (loc: string) => {
    switch (loc) {
      case 'security_post': return 'Pos Satpam';
      case 'dormitory_office': return 'Kantor Asrama';
      case 'taken': return 'Diterima';
      default: return loc || '-';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fadeIn">
      <div className="bg-[#F5F5F5] dark:bg-slate-900 w-full max-w-md p-6 rounded-[2.5rem] shadow-2xl relative max-h-[90vh] overflow-y-auto font-sans">

        {/* Header / Back Action */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-semibold text-lg mb-5 hover:opacity-70 transition-all focus:outline-none"
        >
          <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Detail Paket
        </button>

        {/* Package Image Box */}
        <div className="relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center group mb-5">
          {data.photoUrl ? (
            <img
              src={data.photoUrl}
              alt="Foto Paket"
              className="w-full h-full object-cover"
            />
          ) : (
            // Transparansi Catur Placeholder layaknya desain kalau ga ada gambar
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center">
              <span className="text-xs text-gray-400 font-medium tracking-wide">Tidak Ada Foto</span>
            </div>
          )}

          {/* Blue Fullscreen Icon Bottom Right */}
          <div className="absolute bottom-3 right-3 bg-[#143C9C] p-2 rounded-xl text-white shadow-md cursor-pointer hover:bg-blue-800 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4h4M4 16v4h4m12-4v4h-4m4-12V4h-4" />
            </svg>
          </div>
        </div>

        {/* Info Fields */}
        <div className="space-y-4">
          {/* Nama Penerima */}
          <div>
            <label className="block text-gray-400 dark:text-gray-500 text-xs font-semibold mb-1.5 tracking-wide">Nama Penerima</label>
            <input
              type="text"
              readOnly
              value={data.studentId?.name || 'Tidak diketahui'}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 font-medium focus:outline-none shadow-sm cursor-default"
            />
          </div>

          {/* Kamar & Posisi (Grid 2 Kolom) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 dark:text-gray-500 text-xs font-semibold mb-1.5 tracking-wide">Kamar/Saung</label>
              <input
                type="text"
                readOnly
                value={data.roomId?.name || '-'}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 font-medium focus:outline-none shadow-sm cursor-default"
              />
            </div>
            <div>
              <label className="block text-gray-400 dark:text-gray-500 text-xs font-semibold mb-1.5 tracking-wide">Posisi</label>
              <input
                type="text"
                readOnly
                value={getLocationLabel(data.location)}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 font-medium focus:outline-none shadow-sm cursor-default"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-gray-400 dark:text-gray-500 text-xs font-semibold mb-1.5 tracking-wide">Catatan</label>
            <textarea
              readOnly
              rows={3}
              value={data.notes || 'Tidak ada catatan khusus.'}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 font-medium focus:outline-none shadow-sm cursor-default resize-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
};


// --- MAIN COMPONENT ---
const PackageTableAdmin: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState<PackageItem | null>(null);

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPackageDetail, setSelectedPackageDetail] = useState<PackageItem | null>(null);

  // Checkbox Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Filter States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const [tableData, setTableData] = useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, taken: 0, dormitory_office: 0, security_post: 0 });

  useEffect(() => {
    setSelectedIds([]);
  }, [selectedDate, locationFilter]);

  const fetchPackages = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://idnpackage-backend-production.up.railway.app/packages', {
        headers: { 'Authorization': `Bearer ${token}` }
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

  // --- DELETE HANDLER (BULK ONLY) ---
  const handleDeletePackages = async (idsToDelete: number[]) => {
    if (idsToDelete.length === 0) return;

    const confirmMsg = `Apakah Anda yakin ingin menghapus ${idsToDelete.length} data paket terpilih?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      await Promise.all(
        idsToDelete.map((id) =>
          fetch(`https://idnpackage-backend-production.up.railway.app/packages/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          })
        )
      );

      setSelectedIds([]);
      fetchPackages();
    } catch (error) {
      console.error('Gagal menghapus data paket:', error);
      alert('Terjadi kesalahan saat menghapus paket.');
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationBadge = (location: string) => {
    switch (location) {
      case 'security_post': return { label: 'Di Pos', color: 'bg-[#FCE154] text-gray-900' };
      case 'dormitory_office': return { label: 'Di Kantor', color: 'bg-[#63DF8A] text-gray-900' };
      case 'taken': return { label: 'Diterima', color: 'bg-[#65B7FF] text-gray-900' };
      default: return { label: location || 'Unknown', color: 'bg-gray-200 text-gray-900' };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const formatDate = (date: Date) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const filteredData = tableData.filter((row) => {
    if (!row.createdAt) return false;
    const d = new Date(row.createdAt);

    const matchesDate = (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );

    if (!matchesDate) return false;
    if (locationFilter !== 'all' && row.location !== locationFilter) return false;

    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenEdit = (pkg: PackageItem) => {
    setPackageToEdit(pkg);
    setIsAddModalOpen(true);
  };

  // Trigger Ngebuka Detail Popup
  const handleOpenDetail = (pkg: PackageItem) => {
    setSelectedPackageDetail(pkg);
    setIsDetailModalOpen(true);
  };

  const toggleLocationFilter = (target: string) => {
    setLocationFilter((prev) => (prev === target ? 'all' : target));
  };

  const isAnySelected = selectedIds.length > 0;

  const statsData = [
    { id: 'total', title: 'Total Paket', count: stats.total, isActive: true, icon: <><img src={PackageIcon} alt="" className="w-5 h-5 object-contain dark:hidden" /><img src={PackageIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" /></> },
    { id: 'diterima', title: 'Paket Diterima', count: stats.taken, isActive: false, icon: <><img src={RecievedIcon} alt="" className="w-5 h-5 object-contain dark:hidden" /><img src={RecievedIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" /></> },
    { id: 'kantor', title: 'Paket di Kantor', count: stats.dormitory_office, isActive: false, icon: <><img src={OfficeIcon} alt="" className="w-5 h-5 object-contain dark:hidden" /><img src={OfficeIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" /></> },
    { id: 'pos', title: 'Paket di Pos', count: stats.security_post, isActive: false, icon: <><img src={PosIcon} alt="" className="w-5 h-5 object-contain dark:hidden" /><img src={PosIconDark} alt="" className="w-5 h-5 object-contain hidden dark:block" /></> },
  ];

  return (
    <div className="w-full font-sans space-y-6 relative">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((s) => (
          <StatsCard key={s.id} title={s.title} count={s.count} icon={s.icon} isActive={s.isActive} />
        ))}
      </div>

      <div className="bg-[#F6F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-colors shadow-sm">
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">Data Paket</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleLocationFilter('dormitory_office')}
              className={`px-5 py-1.5 text-sm font-medium border rounded-full transition-all duration-200
                ${locationFilter === 'dormitory_office'
                  ? 'bg-[#143C9C] text-white border-[#143C9C] dark:bg-blue-600 dark:border-blue-600'
                  : 'text-[#143C9C] dark:text-blue-400 border-[#143C9C] dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700'
                }`}
            >
              Pindahkan
            </button>

            <button
              onClick={() => toggleLocationFilter('taken')}
              className={`px-5 py-1.5 text-sm font-medium border rounded-full transition-all duration-200
                ${locationFilter === 'taken'
                  ? 'bg-[#143C9C] text-white border-[#143C9C] dark:bg-blue-600 dark:border-blue-600'
                  : 'text-[#143C9C] dark:text-blue-400 border-[#143C9C] dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700'
                }`}
            >
              Diambil
            </button>

            <button
              disabled={!isAnySelected}
              onClick={() => handleDeletePackages(selectedIds)}
              className={`px-5 py-1.5 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-full hover:bg-red-700 transition-all flex items-center gap-2 ${!isAnySelected ? 'opacity-40 cursor-not-allowed' : 'opacity-100 shadow-sm'}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus {isAnySelected && `(${selectedIds.length})`}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#143C9C] focus:ring-[#143C9C]"
                  />
                </th>
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
                      <p className="text-xs">
                        {locationFilter !== 'all'
                          ? `untuk kategori status ini pada ${formatDate(selectedDate)}`
                          : `untuk tanggal ${formatDate(selectedDate)}`
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const badge = getLocationBadge(row.location);
                  const isChecked = selectedIds.includes(row.id);

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-100/60 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                    >
                      <td className="px-6 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(row.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#143C9C] focus:ring-[#143C9C]"
                        />
                      </td>
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
                          {/* Tombol Cek Terintegrasi ke Pop-up Detail Desain Lu */}
                          <button
                            title="Cek detail"
                            onClick={() => handleOpenDetail(row)}
                            className="bg-[#143C9C] hover:bg-blue-800 text-white px-4 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            Cek
                          </button>

                          <button
                            title="Edit"
                            onClick={() => handleOpenEdit(row)}
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

      {/* Modal Input/Edit Data Paket */}
      <AddPackageModal
        isOpen={isAddModalOpen}
        packageToEdit={packageToEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setPackageToEdit(null);
        }}
        onSuccess={() => {
          setSelectedIds([]);
          fetchPackages();
        }}
      />

      {/* Modal Detail Paket (Pop-up Baru Sesuai Desain Gambar) */}
      <DetailPackageModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPackageDetail(null);
        }}
        data={selectedPackageDetail}
      />
    </div>
  );
};

export { PackageTableAdmin as default };