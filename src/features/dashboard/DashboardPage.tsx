import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { TrendingUp, TrendingDown, Wallet, Filter, Calendar as CalendarIcon, FileSpreadsheet, FileText } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from 'recharts'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [unitData, setUnitData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      const { data } = await supabase
        .from('transactions')
        .select('*, unit:units(name)')
        .gte('transaction_date', dateRange.start)
        .lte('transaction_date', dateRange.end)

      const income = data?.filter((t) => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0) || 0
      const expense = data?.filter((t) => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0) || 0

      setStats({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
        transactionCount: data?.length || 0,
      })

      const dailyMap: Record<string, { date: string; income: number; expense: number }> = {}
      data?.forEach((t) => {
        const date = t.transaction_date
        if (!dailyMap[date]) dailyMap[date] = { date, income: 0, expense: 0 }
        if (t.type === 'debit') dailyMap[date].income += Number(t.amount)
        else dailyMap[date].expense += Number(t.amount)
      })
      setChartData(Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)))

      const unitMap: Record<string, number> = {}
      data?.forEach((t) => {
        const unitName = t.unit?.name || 'Tidak Diketahui'
        unitMap[unitName] = (unitMap[unitName] || 0) + Number(t.amount)
      })
      setUnitData(Object.entries(unitMap).map(([name, value]) => ({ name, value })))

      setLoading(false)
    }
    fetchDashboardData()
  }, [dateRange])

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(chartData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan')
    XLSX.writeFile(workbook, `Laporan_ALBA_${dateRange.start}_to_${dateRange.end}.xlsx`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Laporan Eksekutif ALBA-APPS', 14, 15)
    doc.text(`Periode: ${dateRange.start} s/d ${dateRange.end}`, 14, 25)

    autoTable(doc, {
      startY: 35,
      head: [['Kategori', 'Total']],
      body: [
        ['Total Pendapatan', `Rp ${stats.totalIncome.toLocaleString('id-ID')}`],
        ['Total Pengeluaran', `Rp ${stats.totalExpense.toLocaleString('id-ID')}`],
        ['Saldo Akhir', `Rp ${stats.balance.toLocaleString('id-ID')}`],
        ['Jumlah Transaksi', stats.transactionCount.toString()],
      ],
    })

    doc.save(`Laporan_ALBA_${dateRange.start}.pdf`)
  }

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444']
  const totalVolume = stats.totalIncome + stats.totalExpense

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Eksekutif</h1>
          <p className="text-gray-500 text-sm mt-1">Ringkasan performa keuangan seluruh unit secara real-time.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <CalendarIcon className="w-4 h-4 text-gray-400 ml-2" />
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="text-sm border-none focus:ring-0 text-gray-600" />
          <span className="text-gray-300">s/d</span>
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="text-sm border-none focus:ring-0 text-gray-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Income</span>
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase mt-4">Total Pendapatan</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1 font-mono">{loading ? '...' : `Rp ${stats.totalIncome.toLocaleString('id-ID')}`}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingDown className="w-5 h-5" /></div>
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Expense</span>
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase mt-4">Total Pengeluaran</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1 font-mono">{loading ? '...' : `Rp ${stats.totalExpense.toLocaleString('id-ID')}`}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet className="w-5 h-5" /></div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Balance</span>
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase mt-4">Saldo Akhir</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1 font-mono">{loading ? '...' : `Rp ${stats.balance.toLocaleString('id-ID')}`}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Filter className="w-5 h-5" /></div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Volume</span>
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase mt-4">Total Transaksi</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1 font-mono">{loading ? '...' : `${stats.transactionCount} Tx`}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Tren Pendapatan vs Pengeluaran</h3>
            <div className="flex gap-2">
              <button onClick={exportToExcel} className="p-2 text-gray-400 hover:text-emerald-600 transition" title="Export Excel"><FileSpreadsheet className="w-5 h-5" /></button>
              <button onClick={exportToPDF} className="p-2 text-gray-400 hover:text-red-600 transition" title="Export PDF"><FileText className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${Number(val) / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, '']} />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                <Bar dataKey="income" name="Pendapatan" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">Distribusi Transaksi per Unit</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={unitData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {unitData.map((entry, index) => <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val: any) => `Rp ${Number(val).toLocaleString('id-ID')}`} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {unitData.map((u, i) => (
              <div key={u.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-gray-600">{u.name}</span>
                </div>
                <span className="font-mono font-semibold text-gray-900">{totalVolume > 0 ? ((u.value / totalVolume) * 100).toFixed(1) : '0.0'}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
