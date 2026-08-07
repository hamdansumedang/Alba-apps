import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Partner } from '../../types/kantin'
import { Plus, Edit, Trash2, Users, Phone } from 'lucide-react'

export const PartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profit_share_pct: 50,
  })

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('partners').select('*').order('name')
      if (error) throw error
      setPartners(data || [])
    } catch (err: any) {
      console.error('Error fetching partners:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingPartner(null)
    setFormData({ name: '', phone: '', profit_share_pct: 50 })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (partner: Partner) => {
    setEditingPartner(partner)
    setFormData({
      name: partner.name,
      phone: partner.phone || '',
      profit_share_pct: partner.profit_share_pct,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPartner) {
        const { error } = await supabase
          .from('partners')
          .update({
            name: formData.name,
            phone: formData.phone || null,
            profit_share_pct: Number(formData.profit_share_pct),
          })
          .eq('id', editingPartner.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('partners').insert({
          name: formData.name,
          phone: formData.phone || null,
          profit_share_pct: Number(formData.profit_share_pct),
          balance: 0,
        })
        if (error) throw error
      }

      setIsModalOpen(false)
      fetchPartners()
    } catch (err: any) {
      alert('Gagal menyimpan partner: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus partner ini?')) return
    try {
      const { error } = await supabase.from('partners').delete().eq('id', id)
      if (error) throw error
      fetchPartners()
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Partner Kantin (Titip Jual)
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola mitra penitipan barang, persentase bagi hasil, dan saldo.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-5 h-5" />
          Tambah Partner
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Nama Partner</th>
                <th className="py-3 px-4">No. Telepon</th>
                <th className="py-3 px-4 text-center">Bagi Hasil (Partner)</th>
                <th className="py-3 px-4 text-right">Saldo / Piutang</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Memuat data partner...</td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Belum ada partner terdaftar.</td>
                </tr>
              ) : (
                partners.map(partner => (
                  <tr key={partner.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4 font-medium text-gray-900">{partner.name}</td>
                    <td className="py-3 px-4 text-gray-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {partner.phone || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full text-xs">
                        {partner.profit_share_pct}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-gray-900">
                      Rp {partner.balance.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(partner)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingPartner ? 'Edit Partner' : 'Tambah Partner Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Nama Partner</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Contoh: Bu Siti (Aneka Gorengan)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">No. Telepon</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="08123456789"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                  Bagi Hasil Partner (%)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.profit_share_pct}
                  onChange={e => setFormData({ ...formData, profit_share_pct: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">Persentase keuntungan yang diberikan kepada partner.</p>
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
                  Simpan Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
