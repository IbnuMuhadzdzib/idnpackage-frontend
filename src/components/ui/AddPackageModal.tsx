import React, { useState, useEffect, useRef } from 'react';

// --- Type Definitions ---
interface Student {
  id: number;
  name: string;
  nis?: string;
}

interface Room {
  id: number;
  name: string;
  students?: Student[];
}

interface PackageItem {
  id: number;
  studentId?: Student;
  roomId?: Room;
  location: string;
  notes: string | null;
  photoUrl: string | null;
  createdAt: string;
}

interface AddPackageModalProps {
  isOpen: boolean;
  packageToEdit?: PackageItem | null; // Tambahan prop untuk mode edit
  onClose: () => void;
  onSuccess?: () => void;
}

const LOCATION_OPTIONS = [
  { value: 'security_post', label: 'Pos Satpam' },
  { value: 'dormitory_office', label: 'Kantor Asrama' },
];

const AddPackageModal: React.FC<AddPackageModalProps> = ({ isOpen, packageToEdit, onClose, onSuccess }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form fields
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('security_post');
  const [notes, setNotes] = useState<string>('');

  // Local preview
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ------------------------------------------------------------------
  // Fetch rooms when modal opens
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    const fetchRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://idnpackage-backend-production.up.railway.app/rooms', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const list: Room[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setRooms(list);
      } catch {
        setRooms([]);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [isOpen]);

  // ------------------------------------------------------------------
  // Handle Form Modes (Add vs Edit Data Initializer)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      if (packageToEdit) {
        // Mode Edit: Isi form dengan data yang sudah ada
        setSelectedRoomId(packageToEdit.roomId ? String(packageToEdit.roomId.id) : '');
        setSelectedStudentId(packageToEdit.studentId ? String(packageToEdit.studentId.id) : '');
        setSelectedLocation(packageToEdit.location || 'security_post');
        setNotes(packageToEdit.notes || '');
        setPhotoPreview(packageToEdit.photoUrl || null);
      } else {
        // Mode Tambah: Reset form jadi kosong bersih
        setSelectedStudentId('');
        setSelectedRoomId('');
        setSelectedLocation('security_post');
        setNotes('');
        setPhotoPreview(null);
      }
      setSubmitSuccess(false);
      setSubmitError(null);
    }
  }, [isOpen, packageToEdit]);

  // ------------------------------------------------------------------
  // Photo handling
  // ------------------------------------------------------------------
  const handleDropZoneClick = () => fileInputRef.current?.click();

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFileChange(file);
  };

  // ------------------------------------------------------------------
  // Submit handler (POST or PUT dynamic)
  // ------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      let currentUserId = 1;
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          const extractedId = userObj.userId || userObj.id;
          if (extractedId) currentUserId = Number(extractedId);
        } catch (e) { }
      }

      const payload = {
        studentId: Number(selectedStudentId),
        roomId: Number(selectedRoomId),
        location: selectedLocation,
        notes: notes || "",
        photoUrl: photoPreview || "",
        createdBy: currentUserId,
      };

      const token = localStorage.getItem('token');

      // Tentukan URL & Method dinamis berdasarkan status mode form
      const url = packageToEdit
        ? `https://idnpackage-backend-production.up.railway.app/packages/${packageToEdit.id}`
        : 'https://idnpackage-backend-production.up.railway.app/packages';
      const method = packageToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = Array.isArray(errData?.message)
          ? errData.message.join(', ')
          : errData?.message || `Gagal memproses data paket (${res.status})`;
        throw new Error(errMsg);
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derive students dari rooms yang cocok
  const selectedRoom = rooms.find(r => r.id === Number(selectedRoomId));
  const filteredStudents: Student[] = selectedRoom?.students ?? [];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[92vh] overflow-y-auto"
        style={{ animation: 'modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
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
            {packageToEdit ? 'Form Edit Data Paket' : 'Form Tambah Data Paket'}
          </h2>
        </div>

        {/* ---- Form Body ---- */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Photo Drop Zone */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-800 h-36 flex flex-col items-center justify-center cursor-pointer hover:border-[#143C9C] dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-slate-700/50 transition-all duration-200 overflow-hidden group"
            onClick={handleDropZoneClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-200 dark:bg-slate-700 mb-2 group-hover:bg-blue-100 dark:group-hover:bg-slate-600 transition-colors">
                  <svg className="w-7 h-7 text-gray-400 dark:text-gray-500 group-hover:text-[#143C9C] dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500 group-hover:text-[#143C9C] dark:group-hover:text-blue-400 transition-colors">
                  Unggah foto Paketnya disini, ya...
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInputFileChange}
            />
          </div>

          {/* Nama Penerima */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Nama Penerima <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                disabled={isLoadingRooms || !selectedRoomId}
                className="w-full px-3 py-2.5 pr-9 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 appearance-none transition-all cursor-pointer disabled:opacity-60"
              >
                {!selectedRoomId ? (
                  <option value="">Pilih Kamar/Saung terlebih dahulu</option>
                ) : isLoadingRooms ? (
                  <option value="">Memuat data santri...</option>
                ) : filteredStudents.length === 0 ? (
                  <option value="">Tidak ada data santri di kamar ini</option>
                ) : (
                  <>
                    <option value="" disabled>Pilih Nama Penerima</option>
                    {filteredStudents.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown />
            </div>
          </div>

          {/* Kamar & Lokasi */}
          <div className="grid grid-cols-2 gap-3">
            {/* Kamar */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Kamar/Saung <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedRoomId}
                  onChange={(e) => {
                    setSelectedRoomId(e.target.value);
                    setSelectedStudentId(''); // Langsung reset nama santri di sini saat pindah kamar
                  }}
                  disabled={isLoadingRooms}
                  className="w-full px-3 py-2.5 pr-9 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 appearance-none transition-all cursor-pointer disabled:opacity-60"
                >
                  <option value="" disabled>Pilih Kamar/Saung</option>
                  {isLoadingRooms ? (
                    <option value="">Memuat...</option>
                  ) : rooms.length === 0 ? (
                    <option value="">Tidak ada kamar</option>
                  ) : (
                    rooms.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))
                  )}
                </select>
                <ChevronDown />
              </div>
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2.5 pr-9 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 appearance-none transition-all cursor-pointer"
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
                <ChevronDown />
              </div>
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Catatan <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tulis catatan disini...."
              rows={3}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 resize-none transition-all"
            />
          </div>

          {/* Error Alert */}
          {submitError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{submitError}</span>
            </div>
          )}

          {/* Success Alert */}
          {submitSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {packageToEdit ? 'Data paket berhasil diperbarui!' : 'Paket berhasil ditambahkan!'}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || submitSuccess || isLoadingRooms}
            className="w-full py-3 bg-[#143C9C] hover:bg-blue-800 disabled:bg-blue-400/80 dark:disabled:bg-blue-800/50 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {packageToEdit ? 'Memperbarui...' : 'Menambahkan...'}
              </>
            ) : submitSuccess ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Berhasil!
              </>
            ) : (
              packageToEdit ? 'Simpan Perubahan' : 'Tambah Paket'
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(14px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ---- Helper: chevron icon ----
const ChevronDown = () => (
  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

export default AddPackageModal;