import React, { useState, useEffect, useRef } from "react";

interface Room {
    id: number;
    name: string;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    roomId?: number | null;
    room?: { id: number; name: string } | null;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    userToEdit?: UserItem | null;
}

// ---- Custom Dropdown Component ----
interface DropdownOption { label: string; value: string; }
interface CustomDropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, placeholder = "Pilih..." }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = options.find(o => o.value === value);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 transition-all cursor-pointer hover:border-[#143C9C]/40"
            >
                <span className={selected ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-500"}>
                    {selected ? selected.label : placeholder}
                </span>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute top-full mt-1.5 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-[60]">
                    <div className="max-h-52 overflow-y-auto py-1">
                        {options.map(opt => (
                            <div
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors flex items-center justify-between
                                    ${value === opt.value
                                        ? "bg-[#143C9C] text-white"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-[#f0f4ff] dark:hover:bg-slate-700"
                                    }`}
                            >
                                {opt.label}
                                {value === opt.value && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ---- Main Modal ----
export const UserModal: React.FC<UserModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    userToEdit,
}) => {
    const isEditMode = !!userToEdit;

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "operator",
        password: "",
        roomId: "",
    });
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Fetch daftar kamar
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (Array.isArray(data)) setRooms(data);
                else if (Array.isArray(data?.data)) setRooms(data.data);
            } catch { /* ignore */ }
        };
        fetchRooms();
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setFormData({
                    name: userToEdit.name,
                    email: userToEdit.email,
                    role: userToEdit.role,
                    password: "",
                    roomId: userToEdit.room?.id?.toString() ?? userToEdit.roomId?.toString() ?? "",
                });
            } else {
                setFormData({ name: "", email: "", role: "operator", password: "", roomId: "" });
            }
            setSubmitSuccess(false);
            setSubmitError(null);
        }
    }, [isOpen, userToEdit]);

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
            const token = localStorage.getItem("token");
            const url = isEditMode
                ? `${import.meta.env.VITE_API_URL}/users/${userToEdit?.id}`
                : `${import.meta.env.VITE_API_URL}/users`;
            const method = isEditMode ? "PATCH" : "POST";

            const payload: any = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                roomId: formData.roomId ? Number(formData.roomId) : null,
            };
            if (formData.password) payload.password = formData.password;

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData?.message || `Gagal memproses data (${response.status})`;
                throw new Error(Array.isArray(errMsg) ? errMsg.join(", ") : errMsg);
            }

            setSubmitSuccess(true);
            setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
        } catch (error: unknown) {
            setSubmitError(error instanceof Error ? error.message : "Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const roleOptions: DropdownOption[] = [
        { label: "Operator", value: "operator" },
        { label: "Teacher", value: "teacher" },
        { label: "Admin", value: "admin" },
    ];

    const roomOptions: DropdownOption[] = [
        { label: "— Tidak Ada / Semua Kamar —", value: "" },
        ...rooms.map(r => ({ label: r.name, value: String(r.id) })),
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
                    {/* Nama */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Nama Pengguna <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text" name="name" value={formData.name}
                            onChange={handleTextChange} placeholder="Masukkan nama pengguna" required
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 transition-all"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email" name="email" value={formData.email}
                            onChange={handleTextChange} placeholder="Masukkan email aktif" required
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Password {isEditMode
                                ? <span className="text-gray-400 font-normal">(opsional)</span>
                                : <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="password" name="password" value={formData.password}
                            onChange={handleTextChange}
                            placeholder={isEditMode ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"}
                            required={!isEditMode}
                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 transition-all"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <CustomDropdown
                            options={roleOptions}
                            value={formData.role}
                            onChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
                            placeholder="Pilih role..."
                        />
                    </div>

                    {/* Kamar/Saung */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Kamar/Saung yang Diawasi{" "}
                            <span className="text-gray-400 font-normal">(opsional, untuk Teacher)</span>
                        </label>
                        <CustomDropdown
                            options={roomOptions}
                            value={formData.roomId}
                            onChange={(val) => setFormData(prev => ({ ...prev, roomId: val }))}
                            placeholder="— Tidak Ada / Semua Kamar —"
                        />
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
                            Jika diisi, halaman General akan otomatis menampilkan data kamar ini saat teacher login.
                        </p>
                    </div>

                    {/* Error */}
                    {submitError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{submitError}</span>
                        </div>
                    )}

                    {/* Success */}
                    {submitSuccess && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {isEditMode ? "Perubahan berhasil disimpan!" : "User berhasil ditambahkan!"}
                        </div>
                    )}

                    {/* Submit */}
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
                        ) : submitSuccess ? "Berhasil!" : isEditMode ? "Simpan Perubahan" : "Tambah User Baru"}
                    </button>
                </form>
            </div>

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.92) translateY(14px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};
