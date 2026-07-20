
import LogoLight from '../../assets/icon.png'
import LogoDark from '../../assets/icon_white.png'

import ThemeToggle from '../ui/ThemeToggle'; // Sesuaikan path file kamu
import { useNavigate } from 'react-router-dom';

/**
 * Komponen navigasi atas (Navbar) untuk halaman umum (General).
 * Menampilkan logo, tombol pengubah tema (ThemeToggle), dan tombol logout.
 * 
 * @returns {JSX.Element} Komponen NavbarGeneral
 */
const Navbar = () => {
  const navigate = useNavigate();

  /**
   * Menghapus token dan data pengguna dari localStorage,
   * lalu mengarahkan pengguna ke halaman login.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth', { replace: true });
  };

  return (
    <div className="navbar bg-base-100 dark:bg-slate-900 px-6 py-4 flex justify-between items-center rounded-2xl">
        <div className='bg-[#F3F3F3] dark:bg-slate-800 border border-grey-100 dark:border-slate-700 px-4 py-2 rounded-lg'>
            <div className='text-[#143C9C] dark:text-blue-400 font-bold text-3xl'>
                <h1 className='flex justify-center items-center gap-2 h-fit'>
                    <span>
                      <img src={LogoDark} alt="Logo IDN Paketku" className="size-10 hidden dark:block" />
                      <img src={LogoLight} alt="Logo IDN Paketku" className="size-10 dark:hidden" />
                    </span>
                    IDN Paketku
                </h1>
            </div>
        </div>

      {/* Bagian Kanan: Sesuai Layout di image_61795d.png */}
      <div className="flex items-center gap-3">
        
        {/* MASUKKAN COMPONENT THEME TOGGLE DI SINI */}
        <ThemeToggle />

        {/* Tombol Logout */}
        <button 
          onClick={handleLogout}
          className="btn bg-red-600 hover:bg-red-700 text-white border-none rounded-xl px-6 py-6 min-h-0 h-10 normal-case"
        >
          Logout
        </button>
        
      </div>
    </div>
  );
};

export default Navbar;
