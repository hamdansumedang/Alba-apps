export interface KoperasiPurchase {
  id: string
  unit_id: string
  user_id: string
  supplier_name: string
  total_amount: number
  payment_method_id: string | null
  notes: string | null
  created_at: string
  user?: { name: string }
  payment_method?: { name: string }
}

export interface KoperasiCapital {
  id: string
  unit_id: string
  user_id: string
  type: 'initial' | 'additional' | 'withdrawal'
  amount: number
  description: string | null
  created_at: string
  user?: { name: string }
}

export interface KoperasiMember {
  id: string
  name: string
  phone: string | null
  address: string | null
  balance: number
  created_at: string
}

export interface KoperasiMemberLedger {
  id: string
  member_id: string
  user_id: string
  type: 'deposit' | 'withdrawal' | 'purchase_credit' | 'payment'
  amount: number
  description: string | null
  created_at: string
  member?: { name: string }
  user?: { name: string }
}
