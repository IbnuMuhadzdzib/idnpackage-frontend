import React, { useState } from 'react';

const PackageTable = () => {
  // State untuk custom Date Picker (Sekarang dinamis mengikuti hari ini)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Data Dummy disesuaikan dengan Response Payload Backend
  const tableData = [
    { 
      id: 1, 
      studentName: 'Masaid Fairus', 
      roomName: 'Saung 1', 
      location: 'security_post', 
      notes: 'Paketnya Fairus',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f2/CS2_Cover_Art.jpg',
      operator: 'Guru / Admin 1'
    },
    { 
      id: 2, 
      studentName: 'Andromeda', 
      roomName: 'Saung 9', 
      location: 'dormitory_office',
      notes: 'Tolong jangan dibanting',
      photoUrl: '',
      operator: 'Guru / Admin 1'
    },
    { 
      id: 3, 
      studentName: 'Ibnu', 
      roomName: 'Saung 8', 
      location: 'taken',
      notes: 'Diambil pas istirahat',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f2/CS2_Cover_Art.jpg',
      operator: 'Guru / Admin 2'
    },
  ];

  // Helper untuk transalasi Enum Location ke Label UI & Warna (Sesuai Referensi)
  const getLocationBadge = (location) => {
    switch (location) {
      case 'security_post': 
        return { label: 'Di Pos', color: 'bg-[#FCE154] text-gray-900' };
      case 'dormitory_office': 
        return { label: 'Di Kantor', color: 'bg-[#63DF8A] text-gray-900' };
      case 'taken': 
        return { label: 'Diterima', color: 'bg-[#65B7FF] text-gray-900' };
      default: 
        return { label: 'Unknown', color: 'bg-gray-200 text-gray-900' };
    }
  };

  // Helper Custom Calendar
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handleDateSelect = (day) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    setIsDatePickerOpen(false);
  };

  const today = new Date();
  today.setHours(0,0,0,0)

  // Format Date (DD/MM/YY)
  const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="w-full font-sans">
      {/* Container Card */}
      <div className="bg-[#F6F7F9] border border-gray-300 rounded-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
          <h2 className="text-xl font-bold text-gray-900 tracking-wide">Data Paket</h2>
          
          {/* Custom Date Picker Trigger */}
          <button 
            onClick={() => setIsDatePickerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-[#2D3A8C] border border-[#2D3A8C] rounded-xl hover:bg-blue-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold">{formatDate(selectedDate)}</span>
          </button>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="px-6 py-4 font-medium text-gray-700">Penerima</th>
                <th className="px-6 py-4 font-medium text-gray-700">Kamar</th>
                <th className="px-6 py-4 font-medium text-gray-700">Catatan</th>
                <th className="px-6 py-4 font-medium text-gray-700">Foto</th>
                <th className="px-6 py-4 font-medium text-gray-700">Lokasi / Status</th>
                <th className="px-6 py-4 font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => {
                const badge = getLocationBadge(row.location);
                return (
                  <tr key={row.id} className="hover:bg-gray-100/50 transition-colors border-b border-gray-200 last:border-0">
                    <td className="px-6 py-4 text-gray-800 font-medium">{row.studentName}</td>
                    <td className="px-6 py-4 text-gray-800">{row.roomName}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={row.notes}>
                      {row.notes || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {row.photoUrl ? (
                        <img src={row.photoUrl} alt="Paket" className="w-10 h-10 object-cover rounded-md border border-gray-300" />
                      ) : (
                        <span className="text-gray-400 italic">No photo</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1.5 rounded-full font-medium text-[13px] inline-block min-w-[90px] text-center ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="bg-[#65B7FF] hover:bg-blue-400 text-gray-900 px-5 py-1.5 rounded-full font-medium text-[13px] transition-colors">
                        Cek Paket
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Custom Modal Date Picker --- */}
      {isDatePickerOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setIsDatePickerOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl p-5 w-80 animate-fade-in-up" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h3 className="font-semibold text-gray-800">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button 
                onClick={handleNextMonth} 
                disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
                className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-xs font-medium text-gray-400 py-1">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
{/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                // Buat objek tanggal untuk sel ini
                const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                
                // Cek apakah sel ini adalah masa depan
                const isFutureDate = cellDate > today;
                
                const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
                
                return (
                  <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    disabled={isFutureDate} // Disable button secara native
                    className={`text-sm w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-[#2D3A8C] text-white font-bold' : ''}
                      ${!isSelected && !isFutureDate ? 'text-gray-700 hover:bg-gray-100' : ''}
                      ${isFutureDate ? 'text-gray-300 cursor-not-allowed opacity-50' : ''} 
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageTable;