import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalDebit: 0,
    totalCredit: 0,
    balance: 0,
    txCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from('transactions').select('amount, type')
      if (data) {
        let debit = 0
        let credit = 0
        data.forEach((t) => {
          if (t.type === 'debit') debit += Number(t.amount)
          else credit += Number(t.amount)
        })
        setStats({
          totalDebit: debit,
          totalCredit: credit,
          balance: debit - credit,
          txCount: data.length,
        })
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Dashboard Keuangan Pesantren</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Pemasukan</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {loading ? '...' : `Rp ${stats.totalDebit.toLocaleString('id-ID')}`}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {loading ? '...' : `Rp ${stats.totalCredit.toLocaleString('id-ID')}`}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Saldo Kas Bersih</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {loading ? '...' : `Rp ${stats.balance.toLocaleString('id-ID')}`}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Transaksi</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {loading ? '...' : stats.txCount}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Ringkasan Sistem</h3>
        <p className="text-sm text-gray-600">
          ALBA-APPS berjalan dalam mode multi-unit (Kantor, Kantin, Koperasi) dengan buku besar real-time dan kalkulasi running balance otomatis.
        </p>
      </div>
    </div>
  )
}
