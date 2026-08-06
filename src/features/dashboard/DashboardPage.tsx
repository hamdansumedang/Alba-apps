import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">ALBA-APPS</h1>
            <p className="text-xs text-gray-500">
              {profile?.unit?.name ?? 'Semua Unit'} •{' '}
              {profile?.role === 'admin' ? 'Kepala Keuangan' : 'Staff'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{profile?.name}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* KPI Cards placeholder */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500">Total Pemasukan</p>
            <p className="text-2xl font-bold text-green-600 mt-1">Rp 0</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-600 mt-1">Rp 0</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500">Saldo</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">Rp 0</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Transaksi Terbaru
          </h2>
          <p className="text-gray-500 text-sm">
            Belum ada transaksi. Mulai input transaksi pertama Anda.
          </p>
        </div>
      </main>
    </div>
  )
}
