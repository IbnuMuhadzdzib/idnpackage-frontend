import { useEffect, useState } from 'react';

import Navbar from '../components/layout/NavbarGeneral'
import StatsCard from '../components/ui/StatsCard';
import LiveDateTime from '../components/ui/LiveDateTime'
import SearchFilterBar from '../components/ui/SearchFilterBar';
import PackageTable from '../components/ui/PackageTable';

import PackageIcon from '../assets/package_icon.png'
import RecievedIcon from '../assets/hand_icon.png'
import OfficeIcon from '../assets/building_icon.png'
import PosIcon from '../assets/shield_icon.png'
import PackageIconDark from '../assets/package_icon_dark.png'
import RecievedIconDark from '../assets/hand_icon_dark.png'
import OfficeIconDark from '../assets/building_icon_dark.png'
import PosIconDark from '../assets/shield_icon_dark.png'

function General() {

    useEffect(() => {
        document.title = "General - IDN Paketku";
    }, []);

    const [activeFilter, setActiveFilter] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('Semua Kamar');

    // --- Stats: Fetch semua paket dan hitung per-kategori ---
    const [stats, setStats] = useState({
        total: 0,
        taken: 0,
        dormitory_office: 0,
        security_post: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:8080/packages');
                const responseData = await response.json();
                const packages = Array.isArray(responseData)
                    ? responseData
                    : Array.isArray(responseData?.data)
                    ? responseData.data
                    : [];

                setStats({
                    total: packages.length,
                    taken: packages.filter((p: any) => p.location === 'taken').length,
                    dormitory_office: packages.filter((p: any) => p.location === 'dormitory_office').length,
                    security_post: packages.filter((p: any) => p.location === 'security_post').length,
                });
            } catch (error) {
                console.error('Gagal fetch stats paket:', error);
            }
        };
        fetchStats();
        // Refresh stats setiap 30 detik
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

const statsData = [
    {
      id: 'total',
      title: 'Total Paket',
      count: stats.total,
      icon: (
        <>
          <img src={PackageIcon} alt="Total Paket" className="w-5 h-5 object-contain dark:hidden" />
          <img src={PackageIconDark} alt="Total Paket" className="w-5 h-5 object-contain hidden dark:block" />
        </>
      ),
      isActive: true,
    },
    {
      id: 'diterima',
      title: 'Paket Diterima',
      count: stats.taken,
      icon: (
        <>
          <img src={RecievedIcon} alt="Paket Diterima" className="w-5 h-5 object-contain dark:hidden" />
          <img src={RecievedIconDark} alt="Paket Diterima" className="w-5 h-5 object-contain hidden dark:block" />
        </>
      ),
      isActive: false,
    },
    {
      id: 'kantor',
      title: 'Paket di Kantor',
      count: stats.dormitory_office,
      icon: (
        <>
          <img src={OfficeIcon} alt="Paket di Kantor" className="w-5 h-5 object-contain dark:hidden" />
          <img src={OfficeIconDark} alt="Paket di Kantor" className="w-5 h-5 object-contain hidden dark:block" />
        </>
      ),
      isActive: false,
    },
    {
      id: 'pos',
      title: 'Paket di Pos',
      count: stats.security_post,
      icon: (
        <>
          <img src={PosIcon} alt="Paket di Pos" className="w-5 h-5 object-contain dark:hidden" />
          <img src={PosIconDark} alt="Paket di Pos" className="w-5 h-5 object-contain hidden dark:block" />
        </>
      ),
      isActive: false,
    },
  ];

    return (
        <div className="dark:bg-slate-900 min-h-screen transition-colors duration-300">
            <header>
                <Navbar />
            </header>

            <main className='px-10 font-jakarta space-y-12 mt-20 pb-12'>
                <section>
                   <div>
                        <h1 className='text-center text-[#143C9C] dark:text-blue-400 font-bold text-4xl'>
                            Selamat datang di Halaman <br /> Pencarian Paket Santri!
                        </h1>
                   </div>
                   <div>
                        <LiveDateTime />
                   </div>
                </section>

                <section>
                    <SearchFilterBar 
                        activeFilter={activeFilter} 
                        setActiveFilter={setActiveFilter} 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedRoom={selectedRoom}
                        setSelectedRoom={setSelectedRoom}
                    />
                </section>

                <section className='border border-[#B7B7B7] dark:border-slate-700 rounded-lg p-4 space-y-4'>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
                        {/* 2. Looping data array menjadi komponen StatCard */}
                        {statsData.map((stat) => (
                        <StatsCard
                            key={stat.id}         // React butuh 'key' unik saat melakukan map
                            title={stat.title}
                            count={stat.count}
                            icon={stat.icon}
                            isActive={stat.isActive}
                        />
                        ))}

                    </div>

                    <PackageTable activeFilter={activeFilter} setActiveFilter={setActiveFilter} searchQuery={searchQuery} selectedRoom={selectedRoom} />
                </section>
            </main>
        </div>
    )
}

export default General