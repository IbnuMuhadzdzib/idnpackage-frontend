import React, { useState, useEffect } from 'react';

interface RoomItem {
    id: number;
    name: string;
    floor: number;
}

interface AddRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    roomToEdit?: RoomItem | null;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({ isOpen, onClose, onSuccess, roomToEdit }) => {
    const isEditMode = !!roomToEdit;

    const [formData, setFormData] = useState({
        name: '',
        floor: '1',
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (roomToEdit) {
                setFormData({
                    name: roomToEdit.name,
                    floor: roomToEdit.floor.toString(),
                });
            } else {
                setFormData({ name: '', floor: '1' });
            }
            setSubmitSuccess(false);
            setSubmitError(null);
        }
    }, [isOpen, roomToEdit]);

    if (!isOpen) return null;

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const url = isEditMode
                ? `${import.meta.env.VITE_API_URL}/rooms/${roomToEdit?.id}`
                : `${import.meta.env.VITE_API_URL}/rooms`;
            const method = isEditMode ? 'PATCH' : 'POST';

            const payload = {
                name: formData.name,
                floor: Number(formData.floor),
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                let errMessage = 'Gagal menyimpan data kamar';
                if (errData?.message) {
                    errMessage = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
                }
                throw new Error(errMessage);
            }

            setSubmitSuccess(true);
            setTimeout(() => {
                onClose();
                onSuccess?.();
            }, 1000);
        } catch (error: any) {
            setSubmitError(error.message || 'Terjadi kesalahan');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-700 animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isEditMode ? 'Edit Data Kamar' : 'Form Tambah Kamar'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5">
                        {submitSuccess && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm font-medium">Berhasil {isEditMode ? 'mengedit' : 'menambahkan'} kamar!</p>
                            </div>
                        )}

                        {submitError && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm font-medium">{submitError}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                Nama Kamar <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Contoh: Saung 6, Kamar Khadijah"
                                value={formData.name}
                                onChange={handleTextChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#143C9C] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                Lantai <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="floor"
                                required
                                min="1"
                                placeholder="1"
                                value={formData.floor}
                                onChange={handleTextChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#143C9C] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Footer / Button */}
                    <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 mt-auto">
                        <button
                            type="submit"
                            disabled={isSubmitting || submitSuccess}
                            className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${isSubmitting || submitSuccess
                                    ? 'bg-[#143C9C]/70 cursor-not-allowed'
                                    : 'bg-[#143C9C] hover:bg-blue-800 hover:shadow-lg active:scale-[0.98]'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                isEditMode ? 'Simpan Perubahan' : 'Tambah Kamar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
