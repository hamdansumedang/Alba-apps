import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { KoperasiCapital } from '../../types/koperasi'
import { useAuth } from '../../contexts/AuthContext'
import { Wallet, Plus, ShieldCheck } from 'lucide-react'

export const KoperasiCapitalPage: React.FC = () => {
  const { profile } = useAuth()
  const [capitals, setCapitals] = useState<KoperasiCapital[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    type: 'initial' as 'initial' | 'additional' | 'withdrawal',
    amount: 0,
    description: '',
  })

  useEffect(() => {
    fetchCapitals()
  }, [])

  const fetchCapitals = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('koperasi_capitals')
        .select('*, user:users(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCapitals(data || [])
    } catch (err: any) {
      console.error('Error fetching capitals:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    try {
      const unitId = profile.unit_id || (await supabase.from('units').select('id').eq('code', 'KOPERASI').single()).data?.id
      if (!unitId) {
        alert('Unit Koperasi ID tidak ditemukan.')
        return
      }

      const { error } = await supabase.from('koperasi_capitals').insert({
        unit_id: unitId,
        user_id: profile.id,
        type: formData.type,
        amount: Number(formData.amount),
        description: formData.description || null,
      })

      if (error) throw error
      setIsModalOpen(false)
      setFormData({ type: 'initial', amount: 0, description: '' })
      fetchCapitals()
    } catch (err: any) {
      alert('Gagal menyimpan modal: ' + err.message)
    }
  }

  const totalCapital = capitals.reduce((sum, c) => {
    if (c.type === 'initial' || c.type === 'additional') return sum + c.amount
    return sum - c.amount
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-indigo-600" />
            Modal & Keuangan Koperasi
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola modal awal, penambahan modal, dan penarikan modal.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-5 h-5" />
          Catat Modal
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-gray-400">Total Modal Netto Koperasi</p>
          <h3 className="text-2xl font-bold font-mono text-gray-900 mt-0.5">
            Rp {totalCapital.toLocaleString('id-ID')}
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-900">
          Riwayat Pergerakan Modal
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Pencatat</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Memuat data modal...</td>
                </tr>
              ) : capitals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Belum ada pencatatan modal.</td>
                </tr>
              ) : (
                capitals.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">
                      {new Date(c.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{c.user?.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.type === 'initial' ? 'bg-blue-50 text-blue-600' : c.type === 'additional' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {c.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{c.description || '-'}</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${c.type === 'withdrawal' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {c.type === 'withdrawal' ? '-' : '+'} Rp {c.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Capital */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Catat Pergerakan Modal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Tipe Modal</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="initial">Modal Awal</option>
                  <option value="additional">Penambahan Modal (+)</option>
                  <option value="withdrawal">Penarikan Modal (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="10000"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Keterangan pergerakan modal..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
                >
                  Simpan Modal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
