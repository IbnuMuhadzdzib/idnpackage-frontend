import { useState, useEffect } from 'react';

const LiveDateTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Jalankan timer untuk memperbarui jam setiap detik (1000ms)
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Bersihkan timer saat komponen tidak lagi digunakan (unmount)
    return () => clearInterval(timer);
  }, []);

  // Format Jam (Contoh hasil: 13:00)
  const formatTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(currentTime).replace(/\./g, ':');

  // Format Hari & Tanggal (Contoh hasil: Kamis, 18 Juni 2026)
  const formatDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentTime);

  return (
    <div className="flex flex-col items-center gap-2 justify-center mt-4 font-jakarta transition-colors">
      {/* Box Jam (Biru Gelap) */}
      <div className="text-[#143C9C] dark:text-white px-5 py-2 rounded-2xl font-bold text-8xl">
        {formatTime}
      </div>

      {/* Box Tanggal (Abu-abu Terang) */}
      <div className="bg-[#143C9C] dark:bg-slate-800 text-[#F2F4F7] dark:text-blue-400 px-5 py-2 rounded-2xl font-semibold text-base shadow-sm">
        Sekarang hari <span className="capitalize">{formatDate}</span>
      </div>
    </div>
  );
};

export default LiveDateTime;