import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { InventoryItem, Partner, KantinSale } from '../../types/kantin'
import { PaymentMethod } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { ShoppingCart, Plus, Trash2, CheckCircle2, Receipt } from 'lucide-react'

interface CartItem {
  item: InventoryItem
  quantity: number
  unitPrice: number
}

export const KantinSalesPage: React.FC = () => {
  const { profile } = useAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('')
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [salesHistory, setSalesHistory] = useState<KantinSale[]>([])
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos')

  useEffect(() => {
    fetchData()
  }, [profile])

  const fetchData = async () => {
    try {
      setLoading(true)
      let invQuery = supabase.from('inventory_items').select('*').order('name')
      if (profile?.unit_id && profile.role !== 'admin') {
        invQuery = invQuery.eq('unit_id', profile.unit_id)
      }

      const [invRes, partRes, pmRes, histRes] = await Promise.all([
        invQuery,
        supabase.from('partners').select('*').order('name'),
        supabase.from('payment_methods').select('*').order('name'),
        supabase.from('kantin_sales').select('*, user:users(name), partner:partners(name), payment_method:payment_methods(name), items:kantin_sale_items(*, inventory_item:inventory_items(name))').order('created_at', { ascending: false }).limit(20)
      ])

      if (invRes.data) setInventory(invRes.data)
      if (partRes.data) setPartners(partRes.data)
      if (pmRes.data) {
        setPaymentMethods(pmRes.data)
        if (pmRes.data.length > 0) setSelectedPaymentMethodId(pmRes.data[0].id)
      }
      if (histRes.data) setSalesHistory(histRes.data)
    } catch (err: any) {
      console.error('Error fetching Kantin data:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item: InventoryItem) => {
    if (item.stock <= 0) {
      alert('Stok barang habis!')
      return
    }
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id)
      if (existing) {
        if (existing.quantity >= item.stock) {
          alert('Jumlah melebihi stok yang tersedia!')
          return prev
        }
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      } else {
        return [...prev, { item, quantity: 1, unitPrice: item.selling_price }]
      }
    })
  }

  const updateQuantity = (itemId: string, qty: number) => {
    const inv = inventory.find(i => i.id === itemId)
    if (inv && qty > inv.stock) {
      alert('Jumlah melebihi stok!')
      return
    }
    if (qty <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(prev => prev.map(c => c.item.id === itemId ? { ...c, quantity: qty } : c))
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId))
  }

  const totalAmount = cart.reduce((sum, c) => sum + c.unitPrice * c.quantity, 0)
  const totalProfit = cart.reduce((sum, c) => {
    const profitPerUnit = c.unitPrice - c.item.cost_price
    return sum + profitPerUnit * c.quantity
  }, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!')
      return
    }
    if (!profile) {
      alert('User session tidak ditemukan!')
      return
    }

    const unitId = profile.unit_id || inventory[0]?.unit_id
    if (!unitId) {
      alert('Unit ID tidak valid.')
      return
    }

    try {
      setLoading(true)
      // 1. Insert Kantin Sale
      const { data: saleData, error: saleError } = await supabase
        .from('kantin_sales')
        .insert({
          unit_id: unitId,
          user_id: profile.id,
          partner_id: selectedPartnerId || null,
          total_amount: totalAmount,
          total_profit: totalProfit,
          payment_method_id: selectedPaymentMethodId || null,
          notes: notes || null,
        })
        .select()
        .single()

      if (saleError) throw saleError

      // 2. Insert Sale Items (triggers stock decrement)
      const saleItemsPayload = cart.map(c => ({
        sale_id: saleData.id,
        inventory_item_id: c.item.id,
        quantity: c.quantity,
        unit_price: c.unitPrice,
        subtotal: c.unitPrice * c.quantity,
        profit: (c.unitPrice - c.item.cost_price) * c.quantity,
      }))

      const { error: itemsError } = await supabase.from('kantin_sale_items').insert(saleItemsPayload)
      if (itemsError) throw itemsError

      // 3. Also record into main transactions ledger for unified tracking
      await supabase.from('transactions').insert({
        transaction_date: new Date().toISOString().split('T')[0],
        user_id: profile.id,
        unit_id: unitId,
        category_id: null, // or default kantin income category
        payment_method_id: selectedPaymentMethodId || null,
        amount: totalAmount,
        type: 'debit',
        description: `Penjualan Kantin #${saleData.id.slice(0, 8)}${notes ? ' - ' + notes : ''}`,
      })
      // Note: category_id might be required in transactions table if not null. Let's make sure it's handled or optional. In schema.sql category_id references categories(id) NOT NULL. Let's fetch a default income category ID for Kantin.

      alert('Transaksi penjualan berhasil disimpan!')
      setCart([])
      setNotes('')
      setSelectedPartnerId('')
      fetchData()
      setActiveTab('history')
    } catch (err: any) {
      alert('Gagal melakukan checkout: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-indigo-600" />
            POS Penjualan Kantin
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kasir ritel kantin dengan pemotongan stok otomatis.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'pos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Kasir (POS)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Riwayat Penjualan
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-3">Pilih Produk</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {inventory.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    disabled={item.stock <= 0}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${item.stock <= 0 ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-indigo-500 hover:shadow-sm'}`}
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">Stok: {item.stock}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-600 text-sm">
                        Rp {item.selling_price.toLocaleString('id-ID')}
                      </span>
                      <span className="p-1 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cart & Checkout */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                  Keranjang Belanja
                </h2>

                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto space-y-3 pr-1">
                  {cart.length === 0 ? (
                    <p className="text-center text-gray-400 py-8 text-sm">Keranjang masih kosong</p>
                  ) : (
                    cart.map(c => (
                      <div key={c.item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{c.item.name}</h4>
                          <p className="text-xs text-gray-500 font-mono">
                            Rp {c.unitPrice.toLocaleString('id-ID')} x {c.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max={c.item.stock}
                            value={c.quantity}
                            onChange={e => updateQuantity(c.item.id, Number(e.target.value))}
                            className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-center text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => removeFromCart(c.item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Additional Options */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Partner Titip Jual (Opsional)</label>
                    <select
                      value={selectedPartnerId}
                      onChange={e => setSelectedPartnerId(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Bukan Barang Titipan --</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.profit_share_pct}% bagi hasil)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Metode Pembayaran</label>
                    <select
                      value={selectedPaymentMethodId}
                      onChange={e => setSelectedPaymentMethodId(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {paymentMethods.map(pm => (
                        <option key={pm.id} value={pm.id}>{pm.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Catatan</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Catatan transaksi..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Total & Checkout Button */}
              <div className="space-y-4 pt-6 border-t border-gray-100 mt-6">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Estimasi Profit</span>
                    <span className="font-mono text-emerald-600 font-medium">+Rp {totalProfit.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Pembayaran</span>
                    <span className="text-2xl font-bold font-mono text-indigo-600">
                      Rp {totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {loading ? 'Memproses...' : 'Selesaikan Pembayaran'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Kasir</th>
                  <th className="py-3 px-4">Partner</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {salesHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">Belum ada riwayat penjualan.</td>
                  </tr>
                ) : (
                  salesHistory.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                        {new Date(sale.created_at).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{sale.user?.name || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{sale.partner?.name || 'Milik Sendiri'}</td>
                      <td className="py-3 px-4 text-gray-600">{sale.payment_method?.name || '-'}</td>
                      <td className="py-3 px-4 text-gray-500 italic">{sale.notes || '-'}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                        Rp {sale.total_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600 font-medium">
                        +Rp {sale.total_profit.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
