export function DashboardPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  )
}