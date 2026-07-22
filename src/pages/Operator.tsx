import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SidebarOperator from '../components/layout/SidebarOperator';
import NavbarOperatorNew from '../components/layout/NavbarOperatorNew';
import AddPackageModal from '../components/ui/AddPackageModal';
import PackageTableAdmin from '../components/ui/PackageTableAdmin';
import PackageAreaChart from '../components/ui/PackageAreaChart';
import UserDataAdmin from '../components/ui/UserDataAdmin';
import RoomDataAdmin from '../components/ui/RoomDataAdmin';

import { UserModal } from '../components/ui/AddUserModal';
import { BulkImportModal } from '../components/ui/BulkImportModal';

/**
 * Halaman Operator (Admin / Satpam).
 * Mengatur tata letak beranda, sidebar, dan tab aktif (dashboard, packages, users, rooms).
 */
function Operator() {
  useEffect(() => {
    document.title = 'Satpam Page - IDN Paketku';
  }, []);

  // --- Navigation & Role ---
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'admin' | 'operator'>('operator');
  const [userName, setUserName] = useState<string>('Satpam');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'packages' | 'users' | 'rooms'>('dashboard');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') setUserRole('admin');
        if (user.name) setUserName(user.name);
      } catch (e) { }
    }
  }, []);

  /**
   * Menghapus sesi pengguna dari penyimpanan lokal dan mengarahkan ke halaman login.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth', { replace: true });
  };

  // --- Modal State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [userRefreshKey, setUserRefreshKey] = useState(0);

  /**
   * Memicu pembaruan (refresh) data pengguna di komponen `UserDataAdmin`.
   */
  const fetchUser = () => {
    setUserRefreshKey(prev => prev + 1);
  };

  // State untuk kontrol buka/tutup modal user
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 dark:text-white min-h-screen transition-colors duration-300 font-jakarta overflow-x-hidden">

      {/* Sidebar */}
      <SidebarOperator
        role={userRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main area shifts right by sidebar width on desktop */}
      <div className="ml-0 md:ml-[88px] flex flex-col min-h-screen">

        {/* Navbar */}
        <header>
          <NavbarOperatorNew
            operatorName={userName}
            operatorRole={userRole}
            onLogout={handleLogout}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 space-y-6">

          {/* Greeting + Action Buttons (Responsif Layout) */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-gray-900 dark:text-white font-bold text-xl sm:text-2xl">
                Assalamu'alaikum, {userName}!
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
                Antum yang sedang bertugas dalam menerima paket.
              </p>
            </div>

            {/* Tambah Paket & Import Siswa buttons */}
            {activeTab !== 'users' && activeTab !== 'rooms' && (
              <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2.5 sm:gap-3">
                {userRole === 'admin' && (
                  <button
                    onClick={() => setIsBulkImportOpen(true)}
                    className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import Data Siswa
                  </button>
                )}

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  id="btn-tambah-paket"
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#143C9C] hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah {userRole === 'admin' && activeTab === 'dashboard' ? 'Data' : 'Paket'}
                </button>
              </div>
            )}

            {/* Tambah User button — shown on users tab for admin */}
            {userRole === 'admin' && activeTab === 'users' && (
              <button
                id="btn-tambah-user"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#143C9C] hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Tambah User
              </button>
            )}
          </section>

          {/* --- ADMIN DASHBOARD TAB --- */}
          {userRole === 'admin' && activeTab === 'dashboard' && (
            <PackageAreaChart onCekData={() => setActiveTab('packages')} />
          )}

          {/* --- ADMIN USERS TAB --- */}
          {userRole === 'admin' && activeTab === 'users' && (
            <UserDataAdmin key={userRefreshKey} />
          )}

          {/* --- ADMIN ROOMS TAB --- */}
          {userRole === 'admin' && activeTab === 'rooms' && (
            <RoomDataAdmin />
          )}

          {/* --- PACKAGES TAB (For Admin and Operator) --- */}
          {((userRole === 'admin' && activeTab === 'packages') || userRole === 'operator') && (
            <PackageTableAdmin />
          )}
        </main>
      </div>

      {/* --- Add Package Modal --- */}
      <AddPackageModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => window.dispatchEvent(new Event('packageUpdated'))}
      />

      {/* --- Add User Modal --- */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUser}
      />

      {/* --- Bulk Import Modal --- */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />

      <style>{`
        @keyframes dpIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default Operator;