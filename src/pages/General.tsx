import { useEffect } from 'react';

import Navbar from '../components/layout/NavbarGeneral'
import StatsCard from '../components/ui/StatsCard';
import LiveDateTime from '../components/ui/LiveDateTime'
import SearchFilterBar from '../components/ui/SearchFilterBar';

import PackageIcon from '../assets/package_icon.png'
import RecievedIcon from '../assets/hand_icon.png'
import OfficeIcon from '../assets/building_icon.png'
import PosIcon from '../assets/shield_icon.png'
import PackageTable from '../components/ui/PackageTable';

function General() {

    useEffect(() => {
        document.title = "General - IDN Paketku";
    }, []);

    const statsData = [
    {
      id: 'total',
      title: 'Total Paket',
      count: 1,
      icon: <img src={PackageIcon} alt="Total Paket" className="w-5 h-5 object-contain" />,
      isActive: true, // Card ini akan berwarna biru
    },
    {
      id: 'diterima',
      title: 'Paket Diterima',
      count: 0,
      icon: <img src={RecievedIcon} alt="Paket Diterima" className="w-5 h-5 object-contain" />,
      isActive: false,
    },
    {
      id: 'kantor',
      title: 'Paket di Kantor',
      count: 0,
      icon: <img src={OfficeIcon} alt="Paket di Kantor" className="w-5 h-5 object-contain" />,
      isActive: false,
    },
    {
      id: 'pos',
      title: 'Paket di Pos',
      count: 0,
      icon: <img src={PosIcon} alt="Paket di Pos" className="w-5 h-5 object-contain" />,
      isActive: false,
    },
  ];

    return (
        <div>
            <header>
                <Navbar />
            </header>

            <main className='px-10 font-jakarta space-y-12 mt-20 pb-12'>
                <section>
                   <div>
                        <h1 className='text-center text-[#143C9C] font-bold text-4xl'>
                            Selamat datang di Halaman <br /> Pencarian Paket Santri!
                        </h1>
                   </div>
                   <div>
                        <LiveDateTime />
                   </div>
                </section>

                <section>
                    <SearchFilterBar />
                </section>

                <section className='border border-[#B7B7B7] rounded-lg p-4 space-y-4'>
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

                    <PackageTable />
                </section>
            </main>
        </div>
    )
}

export default General