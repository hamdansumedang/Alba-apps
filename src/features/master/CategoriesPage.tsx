import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Category } from '../../types'

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', type: 'income' as 'income' | 'expense', code: '' })
  const [saving, setSaving] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const resetForm = () => {
    setForm({ name: '', type: 'income', code: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, type: cat.type, code: cat.code ?? '' })
    setEditingId(cat.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus kategori ini?')) return
    await supabase.from('categories').delete().eq('id', id)
    fetchCategories()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (editingId) {
      await supabase.from('categories').update({
        name: form.name,
        type: form.type,
        code: form.code || null,
      }).eq('id', editingId)
    } else {
      await supabase.from('categories').insert({
        name: form.name,
        type: form.type,
        code: form.code || null,
      })
    }

    setSaving(false)
    resetForm()
    fetchCategories()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Kategori Transaksi</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + Tambah
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nama Kategori"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
            <input
              type="text"
              placeholder="Kode (opsional)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
              Batal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Memuat...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada kategori.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">Nama</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Tipe</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Kode</th>
                <th className="text-right py-3 px-2 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">{cat.name}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      cat.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500">{cat.code ?? '-'}</td>
                  <td className="py-3 px-2 text-right">
                    <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-700 mr-3">Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-700">Hapus</button>
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
