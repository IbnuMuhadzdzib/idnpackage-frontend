import React, { useState } from 'react';

const PackageTableOperator = () => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Data Dummy Sesuai Gambar
  const tableData = [
    { 
      id: 1, 
      name: 'Abidal Farzan Rosyidi', 
      room: 'Saung 6', 
      expedition: 'JTE', 
      time: '10:40 WIB',
      status: 'Di Pos',
      createdAt: new Date().toISOString()
    }
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper Custom Calendar (Logika sama seperti sebelumnya)
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handleDateSelect = (day) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    setIsDatePickerOpen(false);
  };

  const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    return `${d} ${m} ${y}`; // Format: 16 Juni 2026
  };

  const filteredData = tableData.filter((row) => {
    if (!row.createdAt) return false;
    const itemDate = new Date(row.createdAt);
    return (
      itemDate.getDate() === selectedDate.getDate() &&
      itemDate.getMonth() === selectedDate.getMonth() &&
      itemDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <div className="w-full font-sans relative">
      <div className="bg-[#F6F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-colors">
        
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Paket</h2>
          
          <div className="flex items-center gap-3">
            {/* Tombol Tambah Paket */}
            <button className="flex items-center gap-2 bg-[#143C9C] dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              Tambah Paket
            </button>

            {/* Tombol Date Picker */}
            <button 
              onClick={() => setIsDatePickerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-[#143C9C] dark:text-blue-300 bg-white dark:bg-slate-800 border border-[#143C9C] dark:border-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="font-semibold text-sm">{formatDate(selectedDate)}</span>
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Nama (Penerima)</th>
                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Kamar</th>
                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Ekspedisi</th>
                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Jam Masuk</th>
                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    Belum ada data paket untuk tanggal ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-white dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-5 text-gray-800 dark:text-gray-200 font-medium">{row.name}</td>
                  <td className="px-6 py-5 text-gray-800 dark:text-gray-200">{row.room}</td>
                  <td className="px-6 py-5 text-gray-800 dark:text-gray-200">{row.expedition}</td>
                  <td className="px-6 py-5 text-gray-800 dark:text-gray-200">{row.time}</td>
                  <td className="px-6 py-5">
                    <span className="px-4 py-1.5 rounded-full font-medium text-[13px] inline-block min-w-[90px] text-center bg-[#FCE154] text-gray-900">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 flex gap-2">
                    {/* Action Buttons Operator */}
                    <button className="bg-[#65B7FF] hover:bg-blue-400 text-gray-900 px-4 py-1.5 rounded-full font-medium text-[13px] transition-colors">
                      Pindahkan
                    </button>
                    <button className="bg-[#63DF8A] hover:bg-green-400 text-gray-900 px-4 py-1.5 rounded-full font-medium text-[13px] transition-colors">
                      Diambil
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Date Picker */}
      {isDatePickerOpen && (
        <div className="absolute right-0 top-20 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 w-80 border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              onClick={handleNextMonth} 
              disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-xs font-medium text-gray-400 py-1">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isFutureDate = cellDate > today;
              const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
              
              return (
                <button
                  key={day}
                  onClick={() => handleDateSelect(day)}
                  disabled={isFutureDate}
                  className={`text-sm w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-[#143C9C] dark:bg-blue-600 text-white font-bold' : ''}
                    ${!isSelected && !isFutureDate ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700' : ''}
                    ${isFutureDate ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50' : ''} 
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={() => setIsDatePickerOpen(false)} 
            className="w-full mt-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
};

export default PackageTableOperator;