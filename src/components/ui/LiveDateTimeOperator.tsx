import { useState, useEffect } from 'react';

/**
 * Komponen yang menampilkan jam dan tanggal secara real-time khusus untuk operator.
 * Memiliki ukuran yang responsif dan aman untuk layar tablet/mobile.
 *
 * @returns {JSX.Element} Komponen LiveDateTimeOperator
 */
const LiveDateTimeOperator = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Jam (10:05:26)
  const formatTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(currentTime);

  // Format Jam (10:05:26)
  const formatTimeHourMin = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(currentTime);

  // Format Hari & Tanggal (Rabu, 22 Juli 2026)
  const formatDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentTime);

  // Split nama hari dan tanggal dengan aman
  const [dayName, ...dateParts] = formatDate.split(',');
  const fullDate = dateParts.join(',').trim();

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-[#F2F4F7] dark:bg-slate-800 px-2.5 sm:px-3 py-2 rounded-xl shadow-sm font-jakarta transition-colors flex-shrink-0">
      {/* Box Jam Biru */}
      <div className="bg-[#143C9C] dark:bg-blue-600 text-white px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-full font-bold text-sm whitespace-nowrap hidden sm:block">
        {formatTime}
      </div>
      <div className="bg-[#143C9C] dark:bg-blue-600 text-white px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-full font-bold text-xs sm:text-sm whitespace-nowrap block sm:hidden">
        {formatTimeHourMin}
      </div>

      {/* Teks Tanggal */}
      <div className="text-[11px] sm:text-xs text-gray-800 dark:text-gray-300 leading-tight whitespace-nowrap pr-1">
        <p className="font-semibold dark:text-white">
          {/* Teks "Sekarang hari" hanya muncul di layar desktop (>= md) */}
          <span className="hidden md:inline">Sekarang hari </span>
          {dayName?.trim()},
        </p>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          {fullDate}
        </p>
      </div>
    </div>
  );
};

export default LiveDateTimeOperator;