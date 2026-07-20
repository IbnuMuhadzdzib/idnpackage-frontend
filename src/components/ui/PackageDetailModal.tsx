import React, { useState } from 'react';

interface Student {
  id: number;
  name: string;
  nis?: string;
}

interface Room {
  id: number;
  name: string;
}

export interface PackageItem {
  id: number;
  studentId?: Student;
  roomId?: Room;
  location: string;
  previousLocation?: string | null;
  notes: string | null;
  photoUrl: string | null;
  ekspedisi?: string;
  createdAt: string;
}

interface PackageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: PackageItem | null;
  onStatusChange?: (updatedPkg: PackageItem) => void;
}

const PackageDetailModal: React.FC<PackageDetailModalProps> = ({ isOpen, onClose, packageData, onStatusChange }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>(packageData?.location || '');
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Sync location state when packageData changes
  React.useEffect(() => {
    if (packageData) {
      setCurrentLocation(packageData.location);
      setToggleError(null);
    }
  }, [packageData]);

  if (!isOpen || !packageData) return null;

  // Detect role from localStorage
  const getUserRole = (): string => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) return JSON.parse(raw)?.role || '';
    } catch { /* ignore */ }
    return '';
  };
  const userRole = getUserRole();
  const canToggleTaken = userRole === 'teacher' || userRole === 'admin';

  const formatTime = (ds: string) => {
    return new Date(ds).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };
  
  const formatDate = (ds: string) => {
    const d = new Date(ds);
    const m = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getLocationBadge = (loc: string) => {
    switch (loc) {
      case 'security_post':    return { label: 'Di Pos',    color: 'bg-[#FCE154] text-gray-900' };
      case 'dormitory_office': return { label: 'Di Kantor', color: 'bg-[#63DF8A] text-gray-900' };
      case 'taken':            return { label: 'Diterima',  color: 'bg-[#65B7FF] text-gray-900' };
      default:                 return { label: loc || '—',  color: 'bg-gray-200 text-gray-900' };
    }
  };

  const badge = getLocationBadge(currentLocation);
  const isTaken = currentLocation === 'taken';

  const handleToggleTaken = async () => {
    setIsToggling(true);
    setToggleError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/packages/${packageData.id}/toggle-taken`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Gagal mengubah status paket');
      }
      const updated = await res.json();
      const newLocation = updated?.location || updated?.data?.location || (isTaken ? 'security_post' : 'taken');
      setCurrentLocation(newLocation);
      onStatusChange?.({ ...packageData, location: newLocation });
      // Tutup modal setelah berhasil
      setTimeout(() => onClose(), 600);
    } catch (e: any) {
      setToggleError(e.message || 'Terjadi kesalahan');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      {/* ===== FULLSCREEN PHOTO VIEWER ===== */}
      {isFullscreen && packageData.photoUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
            onClick={() => setIsFullscreen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-sm">
            Ketuk di mana saja untuk menutup
          </p>
          <img
            src={packageData.photoUrl}
            alt="Foto Paket Fullscreen"
            className="max-w-full max-h-full object-contain"
            style={{ animation: 'fsIn 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          />
          <style>{`
            @keyframes fsIn {
              from { opacity: 0; transform: scale(0.92); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* ===== DETAIL MODAL ===== */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}>
        <div 
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-[#143C9C] dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Detail Paket
            </h3>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="flex flex-col gap-6">
              
              {/* Image Preview */}
              <div className="w-full h-48 bg-gray-100 dark:bg-slate-700 rounded-2xl border border-gray-200 dark:border-slate-600 flex items-center justify-center overflow-hidden relative group">
                {packageData.photoUrl ? (
                  <>
                    <img src={packageData.photoUrl} alt="Foto Paket" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-200 cursor-zoom-in"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-lg">
                          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-800">Lihat Fullscreen</span>
                        </div>
                      </div>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                    <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-sm font-medium">Tidak ada foto</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3.5 py-1.5 rounded-full font-bold text-xs shadow-md ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Nama Penerima</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">
                    {packageData.studentId?.name || 'Tidak diketahui'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Kamar</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">
                    {packageData.roomId?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Waktu Diterima</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">
                    {formatDate(packageData.createdAt)}, {formatTime(packageData.createdAt)}
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-[#F2F4F7] dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Catatan
                </p>
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {packageData.notes || 'Tidak ada catatan untuk paket ini.'}
                </p>
              </div>

              {/* ===== TEACHER / ADMIN TOGGLE TAKEN ===== */}
              {canToggleTaken && (
                <div className="flex flex-col gap-2">
                  {toggleError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {toggleError}
                    </div>
                  )}
                  <button
                    onClick={handleToggleTaken}
                    disabled={isToggling}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      isTaken
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-500/50 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isToggling ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Memproses...
                      </>
                    ) : isTaken ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Batalkan — Paket Belum Diambil
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Tandai Sudah Diterima Santri
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex justify-between items-center">
            {packageData.photoUrl && (
              <button
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-2 px-4 py-2 text-[#143C9C] dark:text-blue-400 border border-[#143C9C]/30 dark:border-blue-400/30 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-all text-sm font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Lihat Foto
              </button>
            )}
            <button 
              onClick={onClose}
              className="ml-auto px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default PackageDetailModal;
