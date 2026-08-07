import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { KantinSale } from '../../types/kantin'
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react'

export const KantinReportPage: React.FC = () => {
  const [sales, setSales] = useState<KantinSale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('kantin_sales')
        .select('*, items:kantin_sale_items(*, inventory_item:inventory_items(name, cost_price))')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSales(data || [])
    } catch (err: any) {
      console.error('Error fetching report:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const totalSalesAmount = sales.reduce((sum, s) => sum + s.total_amount, 0)
  const totalProfitAmount = sales.reduce((sum, s) => sum + s.total_profit, 0)
  const totalTransactions = sales.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-indigo-600" />
          Laporan & Analitik Kantin
        </h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan penjualan harian, total pendapatan, dan margin laba kantin.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400">Total Pendapatan</p>
            <h3 className="text-xl font-bold font-mono text-gray-900 mt-0.5">
              Rp {totalSalesAmount.toLocaleString('id-ID')}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400">Total Laba / Profit</p>
            <h3 className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
              Rp {totalProfitAmount.toLocaleString('id-ID')}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400">Total Transaksi</p>
            <h3 className="text-xl font-bold font-mono text-gray-900 mt-0.5">
              {totalTransactions} Transaksi
            </h3>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-900">
          Riwayat Penjualan Lengkap
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Detail Item</th>
                <th className="py-3 px-4 text-right">Total Pendapatan</th>
                <th className="py-3 px-4 text-right">Laba Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">Memuat laporan...</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">Belum ada data laporan.</td>
                </tr>
              ) : (
                sales.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">
                      {new Date(s.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {s.items?.map((item: any) => (
                          <div key={item.id} className="text-xs text-gray-600 flex items-center justify-between gap-4">
                            <span>{item.inventory_item?.name || 'Barang'} x {item.quantity}</span>
                            <span className="font-mono">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                      Rp {s.total_amount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-emerald-600">
                      +Rp {s.total_profit.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
