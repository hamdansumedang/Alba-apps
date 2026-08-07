import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { KoperasiMember, KoperasiMemberLedger } from '../../types/koperasi'
import { useAuth } from '../../contexts/AuthContext'
import { Users, Plus, Phone, MapPin, History } from 'lucide-react'

export const KoperasiMembersPage: React.FC = () => {
  const { profile } = useAuth()
  const [members, setMembers] = useState<KoperasiMember[]>([])
  const [ledgers, setLedgers] = useState<KoperasiMemberLedger[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<KoperasiMember | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    initial_balance: 0,
  })

  const [ledgerForm, setLedgerForm] = useState({
    type: 'deposit' as 'deposit' | 'withdrawal' | 'purchase_credit' | 'payment',
    amount: 0,
    description: '',
  })

  useEffect(() => {
    fetchMembers()
    fetchLedgers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('koperasi_members').select('*').order('name')
      if (error) throw error
      setMembers(data || [])
    } catch (err: any) {
      console.error('Error fetching members:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchLedgers = async () => {
    try {
      const { data, error } = await supabase
        .from('koperasi_member_ledger')
        .select('*, member:koperasi_members(name), user:users(name)')
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      setLedgers(data || [])
    } catch (err: any) {
      console.error('Error fetching member ledger:', err.message)
    }
  }

  const handleOpenAdd = () => {
    setFormData({ name: '', phone: '', address: '', initial_balance: 0 })
    setIsModalOpen(true)
  }

  const handleOpenLedger = (member: KoperasiMember) => {
    setSelectedMember(member)
    setLedgerForm({ type: 'deposit', amount: 0, description: '' })
    setIsLedgerModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('koperasi_members').insert({
        name: formData.name,
        phone: formData.phone || null,
        address: formData.address || null,
        balance: Number(formData.initial_balance),
      })
      if (error) throw error
      setIsModalOpen(false)
      fetchMembers()
    } catch (err: any) {
      alert('Gagal menambah anggota: ' + err.message)
    }
  }

  const handleLedgerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember || !profile) return

    try {
      const amount = Number(ledgerForm.amount)
      let balanceChange = 0

      if (ledgerForm.type === 'deposit' || ledgerForm.type === 'payment') {
        balanceChange = amount
      } else {
        balanceChange = -amount
      }

      const newBalance = selectedMember.balance + balanceChange

      // 1. Insert Ledger
      const { error: ledgerError } = await supabase.from('koperasi_member_ledger').insert({
        member_id: selectedMember.id,
        user_id: profile.id,
        type: ledgerForm.type,
        amount,
        description: ledgerForm.description || null,
      })
      if (ledgerError) throw ledgerError

      // 2. Update Member Balance
      const { error: memberError } = await supabase
        .from('koperasi_members')
        .update({ balance: newBalance })
        .eq('id', selectedMember.id)
      if (memberError) throw memberError

      setIsLedgerModalOpen(false)
      fetchMembers()
      fetchLedgers()
      alert('Transaksi anggota berhasil dicatat!')
    } catch (err: any) {
      alert('Gagal mencatat transaksi anggota: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Anggota Koperasi & Simpan Pinjam
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data anggota koperasi, simpanan, dan buku besar anggota.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-5 h-5" />
          Tambah Anggota
        </button>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-900">
          Daftar Anggota Koperasi
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Nama Anggota</th>
                <th className="py-3 px-4">No. Telepon</th>
                <th className="py-3 px-4">Alamat</th>
                <th className="py-3 px-4 text-right">Saldo / Simpanan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Memuat anggota...</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Belum ada anggota terdaftar.</td>
                </tr>
              ) : (
                members.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4 font-medium text-gray-900">{m.name}</td>
                    <td className="py-3 px-4 text-gray-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {m.phone || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {m.address || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                      Rp {m.balance.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenLedger(m)}
                        className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition"
                      >
                        Transaksi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Ledger Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-900 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          Riwayat Buku Besar Anggota
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Anggota</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {ledgers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Belum ada riwayat buku besar anggota.</td>
                </tr>
              ) : (
                ledgers.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">
                      {new Date(l.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{l.member?.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${l.type === 'deposit' || l.type === 'payment' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {l.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{l.description || '-'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                      Rp {l.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Member */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Tambah Anggota Koperasi</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Nama Anggota</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Nama lengkap..."
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
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Alamat</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Alamat domisili..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Simpanan Pokok / Awal</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.initial_balance}
                  onChange={e => setFormData({ ...formData, initial_balance: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
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
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Member Ledger Transaction */}
      {isLedgerModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Transaksi Anggota: {selectedMember.name}</h2>
            <p className="text-xs text-gray-500">Saldo saat ini: Rp {selectedMember.balance.toLocaleString('id-ID')}</p>
            
            <form onSubmit={handleLedgerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Tipe Transaksi</label>
                <select
                  value={ledgerForm.type}
                  onChange={e => setLedgerForm({ ...ledgerForm, type: e.target.value as any })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="deposit">Simpanan / Setoran (+)</option>
                  <option value="withdrawal">Penarikan Saldo (-)</option>
                  <option value="purchase_credit">Pembelian Kredit / Kasbon (-)</option>
                  <option value="payment">Pelunasan Kasbon / Piutang (+)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  min="100"
                  step="500"
                  value={ledgerForm.amount}
                  onChange={e => setLedgerForm({ ...ledgerForm, amount: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={ledgerForm.description}
                  onChange={e => setLedgerForm({ ...ledgerForm, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Keterangan transaksi..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsLedgerModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
