import React, { useState, useEffect } from 'react';

interface Room {
  id: number;
  name: string;
}

interface SearchFilterBarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedRoom?: string;
  setSelectedRoom?: (room: string) => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ 
  activeFilter, 
  setActiveFilter,
  searchQuery = '',
  setSearchQuery = () => {},
  selectedRoom = 'Semua Kamar',
  setSelectedRoom = () => {}
}) => {
  const filterOptions = ['Semua', 'Sudah Diterima', 'Di Pos', 'Di Kantor'];
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:8080/rooms');
        const data = await response.json();
        if (Array.isArray(data)) {
          setRooms(data);
        } else if (data && Array.isArray(data.data)) {
          setRooms(data.data);
        }
      } catch (error) {
        console.error('Gagal mengambil data kamar:', error);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 font-jakarta mt-8">
      
      <div className="flex flex-col md:flex-row gap-3 w-full">
        {/* Input Search */}
        <div className="flex-1 flex items-center bg-[#F2F4F7] dark:bg-slate-800 rounded-xl px-4 py-3 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#143C9C] dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            id="search-paket"
            name="search-paket"
            value={searchQuery} // Ikat ke state
            onChange={(e) => setSearchQuery(e.target.value)} // Update state saat ngetik
            placeholder="Cari paket dengan nama antum disini" 
            className="bg-transparent border-none outline-none w-full ml-3 text-[#143C9C] dark:text-white placeholder:text-[#889cc3] dark:placeholder:text-gray-400 font-medium"
          />
        </div>

        {/* Custom Dropdown Kamar */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-2 bg-[#F2F4F7] dark:bg-slate-800 rounded-xl px-6 py-3 text-[#143C9C] dark:text-blue-400 font-bold min-w-[170px] hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors w-full md:w-auto"
          >
            <span className="truncate">{selectedRoom}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Invisible Overlay for clicking outside */}
          {isDropdownOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
          )}

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 w-full min-w-[170px] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden z-50">
              <div className="max-h-60 overflow-y-auto">
                <div 
                  onClick={() => { setSelectedRoom('Semua Kamar'); setIsDropdownOpen(false); }}
                  className={`px-5 py-3 cursor-pointer text-sm font-medium transition-colors
                    ${selectedRoom === 'Semua Kamar' 
                      ? 'bg-[#143C9C] text-white dark:bg-blue-600' 
                      : 'text-[#143C9C] dark:text-blue-400 hover:bg-[#F2F4F7] dark:hover:bg-slate-700'
                    }`}
                >
                  Semua Kamar
                </div>
                {rooms.map(room => (
                  <div 
                    key={room.id}
                    onClick={() => { setSelectedRoom(room.name); setIsDropdownOpen(false); }}
                    className={`px-5 py-3 cursor-pointer text-sm font-medium transition-colors
                      ${selectedRoom === room.name 
                        ? 'bg-[#143C9C] text-white dark:bg-blue-600' 
                        : 'text-[#143C9C] dark:text-blue-400 hover:bg-[#F2F4F7] dark:hover:bg-slate-700'
                      }`}
                  >
                    {room.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tombol Filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {filterOptions.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)} 
            className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm
              ${activeFilter === filter 
                ? 'bg-[#143C9C] text-white dark:bg-blue-600'          
                : 'bg-[#F2F4F7] text-[#143C9C] hover:bg-[#e4e8f1] dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700' 
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

    </div>
  );
};

export default SearchFilterBar;