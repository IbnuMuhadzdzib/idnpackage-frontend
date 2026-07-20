import React from 'react';
// Import interface PackageItem dari file utama (sesuaikan jalurnya jika beda folder)
import { PackageItem } from './PackageTableAdmin';

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

                    {/* Kamar & Posisi */}
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

export default DetailPackageModal;