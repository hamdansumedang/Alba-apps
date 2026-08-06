import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Transaction, Category, PaymentMethod, Unit } from '../../types'

export function TransactionsPage() {
  const { profile } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    unit_id: profile?.unit_id ?? '',
    category_id: '',
    payment_method_id: '',
    amount: '',
    type: 'debit' as 'debit' | 'credit',
    description: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const [tRes, cRes, pRes, uRes] = await Promise.all([
      supabase.from('transactions').select('*, category:categories(*), payment_method:payment_methods(*), unit:units(*), user:users(name)').order('transaction_date', { ascending: false }),
      supabase.from('categories').select('*'),
      supabase.from('payment_methods').select('*'),
      supabase.from('units').select('*'),
    ])

    setTransactions(tRes.data ?? [])
    setCategories(cRes.data ?? [])
    setPaymentMethods(pRes.data ?? [])
    setUnits(uRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)

    let photo_url: string | null = null

    if (photo) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, photo)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName)
        photo_url = urlData.publicUrl
      }
    }

    const numAmount = parseFloat(form.amount)
    // Simple running balance calculation
    const lastTx = transactions[0]
    const currentBalance = lastTx?.running_balance ?? 0
    const running_balance = form.type === 'debit' ? currentBalance + numAmount : currentBalance - numAmount

    const { error } = await supabase.from('transactions').insert({
      transaction_date: form.transaction_date,
      user_id: profile.id,
      unit_id: form.unit_id || profile.unit_id || units[0]?.id,
      category_id: form.category_id,
      payment_method_id: form.payment_method_id || null,
      amount: numAmount,
      type: form.type,
      description: form.description || null,
      photo_url,
      running_balance,
      approved: numAmount <= 5000000 || profile.role === 'admin',
    })

    if (error) {
      alert('Gagal menyimpan transaksi: ' + error.message)
    } else {
      setShowForm(false)
      setForm({
        transaction_date: new Date().toISOString().split('T')[0],
        unit_id: profile?.unit_id ?? '',
        category_id: '',
        payment_method_id: '',
        amount: '',
        type: 'debit',
        description: '',
      })
      setPhoto(null)
      fetchData()
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Daftar Transaksi & Buku Besar</h2>
          <p className="text-xs text-gray-500">Pencatatan real-time multi-unit</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Tutup Form' : '+ Transaksi Baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-4 border border-gray-100">
          <h3 className="text-md font-semibold text-gray-800">Form Transaksi Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={form.transaction_date}
                onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={form.unit_id}
                onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Pilih Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tipe</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'debit' | 'credit' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="debit">Debit (Pemasukan)</option>
                <option value="credit">Kredit (Pengeluaran)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Metode Pembayaran</label>
              <select
                value={form.payment_method_id}
                onChange={(e) => setForm({ ...form, payment_method_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Pilih Metode</option>
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Keterangan</label>
            <textarea
              rows={2}
              placeholder="Catatan transaksi..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Foto Bukti / Nota</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Memuat data...</p>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 text-sm">
          Belum ada transaksi tercatat.
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
                <th className="text-right py-3 px-4 font-medium">Jumlah</th>
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
                  <td className={`py-3 px-4 text-right font-medium ${tx.type === 'debit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'debit' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
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
