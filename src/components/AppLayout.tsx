import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SyncStatusIndicator } from '../features/system/SyncStatusIndicator'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'Transaksi' },
  { to: '/ledger', label: 'Buku Besar' },
  { to: '/kantin/pos', label: 'Kasir Kantin' },
  { to: '/kantin/inventory', label: 'Inventori Kantin' },
  { to: '/kantin/partners', label: 'Partner Kantin' },
  { to: '/kantin/reports', label: 'Laporan Kantin' },
  { to: '/koperasi/members', label: 'Anggota Koperasi' },
  { to: '/koperasi/capital', label: 'Modal Koperasi' },
  { to: '/audit-trail', label: 'Audit Trail' },
  { to: '/master/categories', label: 'Kategori' },
  { to: '/master/payment-methods', label: 'Metode Bayar' },
]

export function AppLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">ALBA-APPS</h1>
            <p className="text-xs text-gray-500">
              {profile?.unit?.name ?? 'Semua Unit'} • {profile?.role === 'admin' ? 'Kepala Keuangan' : 'Staff'}
            </p>
          </div>
          <div className="flex items-center gap-3">            <SyncStatusIndicator />            <span className="text-sm text-gray-600 hidden sm:inline">{profile?.name}</span>
            <button onClick={handleSignOut} className="text-sm text-red-600 hover:text-red-700">Keluar</button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                  isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
