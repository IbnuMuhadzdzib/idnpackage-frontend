import React, { useState, useEffect } from "react";

// Definisikan tipe data item yang sama dengan di komponen utama
interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    room?: string; // Menampung field room opsional
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    userToEdit?: UserItem | null; // Jika ada datanya = MODE EDIT, jika null = MODE TAMBAH
}

export const UserModal: React.FC<UserModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    userToEdit,
}) => {
    const isEditMode = !!userToEdit;

    // 1. State Management Form
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "operator",
        room: "",
        password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // 2. Efek untuk memuat data jika masuk Mode Edit atau Reset Form saat ditutup
    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                // Mode Edit: Isi form dengan data user yang dipilih
                setFormData({
                    name: userToEdit.name,
                    email: userToEdit.email,
                    role: userToEdit.role,
                    room: userToEdit.room || "",
                    password: "", // Kosongkan password saat edit
                });
            } else {
                // Mode Tambah: Reset form ke default
                setFormData({
                    name: "",
                    email: "",
                    role: "operator",
                    room: "",
                    password: "",
                });
            }
            setSubmitSuccess(false);
            setSubmitError(null);
        }
    }, [isOpen, userToEdit]);

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 3. Handle Submit (Dinamis POST / PUT)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("token");

            // Tentukan URL & Method berdasarkan mode
            const url = isEditMode
                ? `http://localhost:8080/users/${userToEdit?.id}`
                : "http://localhost:8080/users";

            const method = isEditMode ? "PATCH" : "POST";

            const payload: any = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
            };

            // Tambahkan password ke payload jika diisi (wajib saat tambah, opsional saat edit)
            if (formData.password) {
                payload.password = formData.password;
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData?.message || `Gagal memproses data (${response.status})`;
                throw new Error(errMsg);
            }

            setSubmitSuccess(true);
            setTimeout(() => {
                onSuccess?.(); // Panggil fungsi refresh data di komponen utama
                onClose();
            }, 1200);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
            setSubmitError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[92vh] overflow-y-auto"
                style={{ animation: "modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
            >
                {/* ---- Header ---- */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="font-bold text-gray-800 dark:text-white text-base">
                        {isEditMode ? "Form Edit Data User" : "Form Tambah Data User"}
                    </h2>
                </div>

                {/* ---- Form Body ---- */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Nama Pengguna <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama pengguna"
                            required
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Masukkan email aktif"
                            required
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Password {isEditMode ? <span className="text-gray-400 font-normal">(opsional)</span> : <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={isEditMode ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"}
                            required={!isEditMode}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 pr-9 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 appearance-none transition-all cursor-pointer"
                            >
                                <option value="operator">Operator</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                            <ChevronDown />
                        </div>
                    </div>

                    {submitError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{submitError}</span>
                        </div>
                    )}

                    {submitSuccess && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {isEditMode ? "Perubahan berhasil disimpan!" : "User berhasil ditambahkan!"}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || submitSuccess}
                        className="w-full py-3 bg-[#143C9C] hover:bg-blue-800 disabled:bg-blue-400/80 dark:disabled:bg-blue-800/50 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Menyimpan...
                            </>
                        ) : submitSuccess ? (
                            "Berhasil!"
                        ) : isEditMode ? (
                            "Simpan Perubahan"
                        ) : (
                            "Tambah User Baru"
                        )}
                    </button>
                </form>
            </div>

            {/* Inject Style Animasi yang Sama */}
            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.92) translateY(14px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0); }
                }
            `}</style>
        </div>
    );
};

// ---- Helper Component: Custom Chevron Down Icon ----
const ChevronDown = () => (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
    </div>
);
