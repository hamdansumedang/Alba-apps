import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Transaction, Unit } from '../../types'

export function LedgerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    let query = supabase
      .from('transactions')
      .select('*, category:categories(*), payment_method:payment_methods(*), unit:units(*), user:users(name)')
      .order('transaction_date', { ascending: true })

    if (selectedUnit) {
      query = query.eq('unit_id', selectedUnit)
    }
    if (startDate) {
      query = query.gte('transaction_date', startDate)
    }
    if (endDate) {
      query = query.lte('transaction_date', endDate)
    }

    const [tRes, uRes] = await Promise.all([
      query,
      supabase.from('units').select('*'),
    ])

    setTransactions(tRes.data ?? [])
    setUnits(uRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [selectedUnit, startDate, endDate])

  const totalDebit = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Buku Besar Digital</h2>
          <p className="text-xs text-gray-500">Rekapitulasi dan running balance otomatis</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-100">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Semua Unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Dari Tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Sampai Tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setSelectedUnit(''); setStartDate(''); setEndDate('') }}
            className="w-full py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Total Pemasukan (Debit)</p>
          <p className="text-xl font-bold text-green-600 mt-1">Rp {totalDebit.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Total Pengeluaran (Kredit)</p>
          <p className="text-xl font-bold text-red-600 mt-1">Rp {totalCredit.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Saldo Akhir</p>
          <p className="text-xl font-bold text-blue-600 mt-1">Rp {(totalDebit - totalCredit).toLocaleString('id-ID')}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Memuat buku besar...</p>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 text-sm">
          Tidak ada transaksi pada periode/filter ini.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <th className="text-left py-3 px-4 font-medium">Tanggal</th>
                <th className="text-left py-3 px-4 font-medium">Unit</th>
                <th className="text-left py-3 px-4 font-medium">Kategori</th>
                <th className="text-left py-3 px-4 font-medium">Keterangan</th>
                <th className="text-right py-3 px-4 font-medium">Debit</th>
                <th className="text-right py-3 px-4 font-medium">Kredit</th>
                <th className="text-right py-3 px-4 font-medium">Saldo Berjalan</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600">{tx.transaction_date}</td>
                  <td className="py-3 px-4 font-medium">{tx.unit?.name ?? '-'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">{tx.category?.name ?? '-'}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{tx.description ?? '-'}</td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {tx.type === 'debit' ? `Rp ${Number(tx.amount).toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-red-600">
                    {tx.type === 'credit' ? `Rp ${Number(tx.amount).toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    Rp {Number(tx.running_balance ?? 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
