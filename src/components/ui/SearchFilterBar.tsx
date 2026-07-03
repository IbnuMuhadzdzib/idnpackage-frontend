import React, { useState } from 'react';

const SearchFilterBar = () => {
  const filterOptions = ['Semua', 'Sudah Diterima', 'Di Pos', 'Di Kantor'];
  
  // State untuk tombol filter
  const [activeFilter, setActiveFilter] = useState('Semua');
  
  // TAMBAHAN: State khusus untuk menangkap ketikan di Search Bar
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full flex flex-col gap-4 font-jakarta mt-8">
      
      <div className="flex flex-col md:flex-row gap-3 w-full">
        {/* Input Search */}
        <div className="flex-1 flex items-center bg-[#F2F4F7] rounded-xl px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#143C9C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            id="search-paket"
            name="search-paket"
            value={searchQuery} // Ikat ke state
            onChange={(e) => setSearchQuery(e.target.value)} // Update state saat ngetik
            placeholder="Cari paket dengan nama antum disini" 
            className="bg-transparent border-none outline-none w-full ml-3 text-[#143C9C] placeholder:text-[#889cc3] font-medium"
          />
        </div>

        {/* Dropdown Kamar */}
        <button className="flex items-center justify-between gap-2 bg-[#F2F4F7] rounded-xl px-6 py-3 text-[#143C9C] font-bold min-w-[120px] hover:bg-gray-200 transition-colors">
          Kamar 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Tombol Filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {filterOptions.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)} 
            className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm
              ${activeFilter === filter 
                ? 'bg-[#143C9C] text-white'          
                : 'bg-[#F2F4F7] text-[#143C9C] hover:bg-[#e4e8f1]' 
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