// Supabase types for ALBA-APPS

export type UserRole = 'admin' | 'staff'
export type UnitCode = 'KANTOR' | 'KANTIN' | 'KOPERASI'
export type TransactionType = 'debit' | 'credit'
export type CategoryType = 'income' | 'expense'

export interface Unit {
  id: string
  name: string
  code: UnitCode
  created_at: string
}

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  unit_id: string | null
  created_at: string
  unit?: Unit
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  code: string | null
  created_at: string
}

export interface PaymentMethod {
  id: string
  name: string
  code: string | null
  created_at: string
}

export interface Transaction {
  id: string
  transaction_date: string
  user_id: string
  unit_id: string
  category_id: string
  payment_method_id: string | null
  amount: number
  type: TransactionType
  description: string | null
  photo_url: string | null
  running_balance: number | null
  created_at: string
  updated_at: string
  // Joined relations
  user?: Profile
  unit?: Unit
  category?: Category
  payment_method?: PaymentMethod
}
