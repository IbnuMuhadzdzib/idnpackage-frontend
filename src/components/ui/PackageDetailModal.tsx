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
  notes: string | null;
  photoUrl: string | null;
  ekspedisi?: string;
  createdAt: string;
}

interface PackageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: PackageItem | null;
}

const PackageDetailModal: React.FC<PackageDetailModalProps> = ({ isOpen, onClose, packageData }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !packageData) return null;

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

  const badge = getLocationBadge(packageData.location);

  return (
    <>
      {/* ===== FULLSCREEN PHOTO VIEWER ===== */}
      {isFullscreen && packageData.photoUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
            onClick={() => setIsFullscreen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Hint text */}
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
                    {/* Fullscreen overlay button */}
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
