import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { PaymentMethod } from '../../types'

export function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', code: '' })
  const [saving, setSaving] = useState(false)

  const fetchMethods = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false })
    setMethods(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchMethods() }, [])

  const resetForm = () => {
    setForm({ name: '', code: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (m: PaymentMethod) => {
    setForm({ name: m.name, code: m.code ?? '' })
    setEditingId(m.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus metode bayar ini?')) return
    await supabase.from('payment_methods').delete().eq('id', id)
    fetchMethods()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (editingId) {
      await supabase.from('payment_methods').update({
        name: form.name,
        code: form.code || null,
      }).eq('id', editingId)
    } else {
      await supabase.from('payment_methods').insert({
        name: form.name,
        code: form.code || null,
      })
    }

    setSaving(false)
    resetForm()
    fetchMethods()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Metode Pembayaran</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + Tambah
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nama Metode"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
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
      ) : methods.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada metode pembayaran.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">Nama</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Kode</th>
                <th className="text-right py-3 px-2 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">{m.name}</td>
                  <td className="py-3 px-2 text-gray-500">{m.code ?? '-'}</td>
                  <td className="py-3 px-2 text-right">
                    <button onClick={() => handleEdit(m)} className="text-blue-600 hover:text-blue-700 mr-3">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-700">Hapus</button>
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
