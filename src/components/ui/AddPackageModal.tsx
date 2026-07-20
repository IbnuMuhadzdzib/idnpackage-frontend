import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CustomDropdown } from './CustomDropdown';

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

// -----------------------------------------------------------------------
// Image compression helper
// -----------------------------------------------------------------------
const compressImage = (dataUrl: string, maxPx = 1024, quality = 0.78): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
        else { width = Math.round((width * maxPx) / height); height = maxPx; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL('image/jpeg', quality)); }
      else resolve(dataUrl);
    };
    img.src = dataUrl;
  });

// -----------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------
const AddPackageModal: React.FC<AddPackageModalProps> = ({ isOpen, packageToEdit, onClose, onSuccess }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form fields
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedRoomId,    setSelectedRoomId]    = useState<string>('');
  const [selectedLocation,  setSelectedLocation]  = useState<string>('security_post');
  const [notes,    setNotes]    = useState<string>('');
  
  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Camera state
  const [showCamera, setShowCamera]     = useState(false);
  const [cameraError, setCameraError]   = useState<string | null>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
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
        // Mode Edit
        setSelectedRoomId(packageToEdit.roomId ? String(packageToEdit.roomId.id) : '');
        setSelectedStudentId(packageToEdit.studentId ? String(packageToEdit.studentId.id) : '');
        setSelectedLocation(packageToEdit.location || 'security_post');
        setNotes(packageToEdit.notes || '');
        setPhotoPreview(packageToEdit.photoUrl || null);
      } else {
        // Mode Tambah
        setSelectedStudentId('');
        setSelectedRoomId('');
        setSelectedLocation('security_post');
        setNotes('');
        setPhotoPreview(null);
      }
      setSubmitSuccess(false);
      setSubmitError(null);
      stopCamera();
      setShowCamera(false);
      setCameraError(null);
    }
  }, [isOpen, packageToEdit]);

  // ------------------------------------------------------------------
  // Camera helpers
  // ------------------------------------------------------------------
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setShowCamera(true);
      // Assign stream after render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 50);
    } catch (err) {
      setCameraError('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const raw = canvas.toDataURL('image/jpeg', 0.9);
    const compressed = await compressImage(raw);
    stopCamera();
    setShowCamera(false);
    setPhotoPreview(compressed);
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setPhotoPreview(null);
    startCamera();
  }, [startCamera]);

  const cancelCamera = useCallback(() => {
    stopCamera();
    setShowCamera(false);
  }, [stopCamera]);

  // ------------------------------------------------------------------
  // Gallery / file upload
  // ------------------------------------------------------------------
  const handleGalleryPick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      const compressed = await compressImage(raw);
      setPhotoPreview(compressed);
    };
    reader.readAsDataURL(file);
    // Reset so same file can be picked again
    e.target.value = '';
  };

  // ------------------------------------------------------------------
  // Submit
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
        roomId:    Number(selectedRoomId),
        location:  selectedLocation,
        notes:     notes || "",
        photoUrl:  photoPreview || "",
        createdBy: currentUserId,
      };

      const token = localStorage.getItem('token');

      // Tentukan URL & Method dinamis berdasarkan status mode form
      const url = packageToEdit
        ? `${import.meta.env.VITE_API_URL}/packages/${packageToEdit.id}`
        : `${import.meta.env.VITE_API_URL}/packages`;
      const method = packageToEdit ? 'PATCH' : 'POST';

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

  // Derive students dari rooms
  const selectedRoom = rooms.find(r => r.id === Number(selectedRoomId));
  const filteredStudents: Student[] = selectedRoom?.students ?? [];

  if (!isOpen) return null;

  return (
    <>
      {/* ===== CAMERA OVERLAY ===== */}
      {showCamera && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-5 pt-6 pb-4 bg-gradient-to-b from-black/70 to-transparent z-10">
            <button
              onClick={cancelCamera}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              Batal
            </button>
            <p className="text-white font-semibold text-base">Ambil Foto Paket</p>
            <div className="w-16" />
          </div>

          {/* Camera error */}
          {cameraError ? (
            <div className="flex flex-col items-center gap-4 px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white text-sm">{cameraError}</p>
              <button
                onClick={cancelCamera}
                className="px-6 py-2.5 bg-white text-gray-900 rounded-full font-semibold text-sm"
              >
                Tutup
              </button>
            </div>
          ) : (
            <>
              {/* Video stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Capture button */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center pb-12 pt-6 bg-gradient-to-t from-black/70 to-transparent">
                <button
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                >
                  <div className="w-14 h-14 bg-white rounded-full" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== FORM MODAL ===== */}
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
              {packageToEdit ? 'Edit Data Paket' : 'Form Tambah Data Paket'}
            </h2>
          </div>

          {/* ---- Form Body ---- */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

            {/* ---- Photo Section ---- */}
            {photoPreview ? (
              /* Preview foto yang sudah diambil */
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                {/* Overlay action buttons */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-full font-semibold text-sm shadow-md transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Foto Ulang
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="flex items-center gap-2 bg-red-500/90 hover:bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              /* Pilihan upload: Kamera atau Galeri */
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Foto Paket <span className="text-gray-400 font-normal">(opsional)</span></p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Tombol Kamera */}
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex flex-col items-center justify-center gap-2.5 h-28 bg-gradient-to-br from-[#143C9C] to-[#1a4fc4] hover:from-[#0f2d78] hover:to-[#143C9C] text-white rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 border-2 border-[#143C9C]/20"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Kamera</p>
                      <p className="text-[11px] text-white/70">Foto langsung</p>
                    </div>
                  </button>

                  {/* Tombol Galeri */}
                  <button
                    type="button"
                    onClick={handleGalleryPick}
                    className="flex flex-col items-center justify-center gap-2.5 h-28 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-2xl transition-all duration-200 border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-[#143C9C] dark:hover:border-blue-500 active:scale-95"
                  >
                    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-xl flex items-center justify-center group-hover:bg-blue-50">
                      <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Galeri</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Pilih dari file</p>
                    </div>
                  </button>
                </div>

                {cameraError && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">{cameraError}</p>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {/* Nama Penerima */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Nama Penerima <span className="text-red-500">*</span>
              </label>
              <CustomDropdown
                options={[
                  { value: '', label: !selectedRoomId ? 'Pilih Kamar/Saung terlebih dahulu' : isLoadingRooms ? 'Memuat data santri...' : filteredStudents.length === 0 ? 'Tidak ada data santri di kamar ini' : 'Pilih Nama Penerima' },
                  ...filteredStudents.map(s => ({ value: String(s.id), label: s.name }))
                ]}
                value={selectedStudentId}
                onChange={setSelectedStudentId}
                placeholder="Pilih Nama Penerima"
                disabled={isLoadingRooms || !selectedRoomId}
              />
            </div>

            {/* Kamar & Lokasi */}
            <div className="grid grid-cols-2 gap-3">
              {/* Kamar */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Kamar/Saung <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  options={rooms.map(r => ({ value: String(r.id), label: r.name }))}
                  value={selectedRoomId}
                  onChange={(val) => { setSelectedRoomId(val); setSelectedStudentId(''); }}
                  placeholder="Pilih Kamar/Saung"
                  disabled={isLoadingRooms}
                />
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  options={LOCATION_OPTIONS.map(loc => ({ value: loc.value, label: loc.label }))}
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  placeholder="Pilih Lokasi"
                />
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
                Paket berhasil ditambahkan!
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
                  {packageToEdit ? 'Menyimpan...' : 'Menambahkan...'}
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
            to   { opacity: 1; transform: scale(1)  translateY(0); }
          }
        `}</style>
      </div>
    </>
  );
};


export default AddPackageModal;

