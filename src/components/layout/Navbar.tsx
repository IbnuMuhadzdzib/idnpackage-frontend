import React from 'react';
import Logo from '../../assets/icon.png'

import ThemeToggle from '../ui/ThemeToggle'; // Sesuaikan path file kamu

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 px-6 py-4 flex justify-between items-center rounded-2xl">
        <div className='bg-[#F3F3F3] px-4 py-2 rounded-lg'>
            <div className='text-[#143C9C] font-bold text-3xl'>
                <h1 className='flex justify-center items-center gap-2 h-fit'>
                    <span>
                    <img src={Logo} alt="" className='size-10' />
                    </span>
                    IDN Paketku
                </h1>
            </div>
        </div>

      {/* Bagian Kanan: Sesuai Layout di image_61795d.png */}
      <div className="flex items-center gap-3">
        
        {/* MASUKKAN COMPONENT THEME TOGGLE DI SINI */}
        <ThemeToggle />

        {/* Tombol Login */}
        <button className="btn bg-[#10439F] hover:bg-[#0b337a] text-white border-none rounded-xl px-6 min-h-0 h-10 normal-case">
          Login
        </button>
        
      </div>
    </div>
  );
};

export default Navbar;