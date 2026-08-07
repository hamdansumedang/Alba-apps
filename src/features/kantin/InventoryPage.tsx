import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { InventoryItem } from '../../types/kantin'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit, Trash2, Search, Package, AlertTriangle } from 'lucide-react'

export const InventoryPage: React.FC = () => {
  const { profile } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    stock: 0,
    cost_price: 0,
    selling_price: 0,
  })

  useEffect(() => {
    fetchInventory()
  }, [profile])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      let query = supabase.from('inventory_items').select('*, unit:units(id, name, code)').order('name')
      
      // If staff belongs to Kantin unit, filter by unit_id
      if (profile?.unit_id && profile.role !== 'admin') {
        query = query.eq('unit_id', profile.unit_id)
      }

      const { data, error } = await query
      if (error) throw error
      setItems(data || [])
    } catch (err: any) {
      console.error('Error fetching inventory:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({ name: '', sku: '', stock: 0, cost_price: 0, selling_price: 0 })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      sku: item.sku || '',
      stock: item.stock,
      cost_price: item.cost_price,
      selling_price: item.selling_price,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const unitId = profile?.unit_id || items[0]?.unit_id
      if (!unitId) {
        alert('Unit ID tidak ditemukan. Pastikan user memiliki unit.')
        return
      }

      if (editingItem) {
        const { error } = await supabase
          .from('inventory_items')
          .update({
            name: formData.name,
            sku: formData.sku || null,
            stock: Number(formData.stock),
            cost_price: Number(formData.cost_price),
            selling_price: Number(formData.selling_price),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('inventory_items').insert({
          unit_id: unitId,
          name: formData.name,
          sku: formData.sku || null,
          stock: Number(formData.stock),
          cost_price: Number(formData.cost_price),
          selling_price: Number(formData.selling_price),
        })
        if (error) throw error
      }

      setIsModalOpen(false)
      fetchInventory()
    } catch (err: any) {
      alert('Gagal menyimpan barang: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus barang ini?')) return
    try {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id)
      if (error) throw error
      fetchInventory()
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message)
    }
  }

  const filteredItems = items.filter(
    i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.sku && i.sku.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-indigo-600" />
            Inventori Kantin
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola stok barang, harga modal, dan harga jual kantin.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-5 h-5" />
          Tambah Barang
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama barang atau SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-transparent focus:outline-none text-gray-700 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Nama Barang</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-center">Stok</th>
                <th className="py-3 px-4 text-right">Harga Modal</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-right">Margin / Unit</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">Memuat data inventori...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">Tidak ada barang ditemukan.</td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const margin = item.selling_price - item.cost_price
                  const marginPct = item.cost_price > 0 ? ((margin / item.cost_price) * 100).toFixed(1) : '0'
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-2">
                        {item.stock <= 5 && (
                          <span title="Stok menipis!" className="text-amber-500">
                            <AlertTriangle className="w-4 h-4" />
                          </span>
                        )}
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">{item.sku || '-'}</td>
                      <td className="py-3 px-4 text-center font-semibold">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600">
                        Rp {item.cost_price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-gray-900">
                        Rp {item.selling_price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600 font-medium">
                        +Rp {margin.toLocaleString('id-ID')} ({marginPct}%)
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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
              {editingItem ? 'Edit Barang Inventori' : 'Tambah Barang Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Contoh: Es Teh Manis"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">SKU / Kode (Opsional)</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Contoh: MN-001"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Harga Modal</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.cost_price}
                    onChange={e => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Harga Jual</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.selling_price}
                    onChange={e => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
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
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
