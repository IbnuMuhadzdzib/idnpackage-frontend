import React, { useState, useEffect } from 'react';

const LiveDateTimeOperator= () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Jam
  const formatTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(currentTime);

  // Format Hari & Tanggal
  const formatDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentTime);

  return (
    <div className="flex items-center gap-3 bg-[#F2F4F7] px-3 py-1.5 rounded-xl shadow-sm font-jakarta">
      {/* Box Jam Biru */}
      <div className="bg-[#143C9C] text-white px-3 py-1 rounded-full font-bold text-sm">
        {formatTime}
      </div>

      {/* Teks Tanggal */}
      <div className="text-xs text-gray-800 leading-tight pr-2">
        <p className="font-semibold">Sekarang hari {formatDate.split(',')[0]},</p>
        <p className="text-gray-500">{formatDate.split(',')[1]}</p>
      </div>
    </div>
  );
};

export default LiveDateTimeOperator;