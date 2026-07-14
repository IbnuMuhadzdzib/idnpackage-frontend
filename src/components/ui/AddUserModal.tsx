import { useState } from "react";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
    isOpen,
    onClose,
}) => {
    // 1. State untuk form data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "Pos Satpam", // default value
        room: "Saung 1", // default value
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    // 2. Handle Perubahan Input
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 3. Handle Submit Post (Endpoint Blank)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // PENTING: Ubah URL ini dengan endpoint asli lu nanti
            const response = await fetch("https://api.contoh.com/v1/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("User berhasil ditambahkan!");
                onClose(); // Tutup modal setelah sukses
            }
        } catch (error) {
            console.error("Error posting data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Backdrop / Overlay Hitam Transparan
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            {/* Container Modal (rounded-3xl & shadow sesuai gambar) */}
            <div className="w-full max-w-3xl rounded-[2rem] bg-[#f4f4f4] p-8 shadow-xl">
                {/* Header Modal */}
                <div className="mb-6 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                    >
                        {/* Icon Back Simpel (<) */}
                        <span className="text-xl font-bold text-gray-700">&lt;</span>
                    </button>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Form Tambah Data User
                    </h2>
                </div>

                {/* Form Input */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Input Nama Pengguna */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-400">
                            Nama Pengguna <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama pengguna"
                            required
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Input Email */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-400">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Masukkan email aktif"
                            required
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Row untuk Role & Kamar (Grid 2 Kolom) */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Dropdown Role */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-400">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="Pos Satpam">Pos Satpam</option>
                                <option value="Admin">Admin</option>
                                <option value="Musyrif">Musyrif</option>
                            </select>
                        </div>

                        {/* Dropdown Kamar/Saung */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-400">
                                Kamar/Saung <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="room"
                                value={formData.room}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="Saung 1">Saung 1</option>
                                <option value="Saung 2">Saung 2</option>
                                <option value="Saung 3">Saung 3</option>
                            </select>
                        </div>
                    </div>

                    {/* Section Button di Kanan Bawah */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-[#1d4ed8] px-8 py-3.5 font-semibold text-white transition-all hover:bg-blue-800 disabled:bg-gray-400"
                        >
                            {loading ? "Menyimpan..." : "Tambah Paket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* 

Cara Pemanggilan-nya:

1. Import : 
    import { AddUserModal } from '../ui/AddUserModal';

2. Buat State :
    // State untuk kontrol buka/tutup modal
    const [isModalOpen, setIsModalOpen] = useState(false);

3. Tambah Button :
    <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
    >
        + Tambah User Baru
    </button>

4. Tambah Tampilan Pop up nya di bawah :
    <AddUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
    />


*/