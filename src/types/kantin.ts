export interface InventoryItem {
  id: string
  unit_id: string
  name: string
  sku: string | null
  stock: number
  cost_price: number
  selling_price: number
  created_at: string
  updated_at: string
  unit?: {
    id: string
    name: string
    code: string
  }
}

export interface Partner {
  id: string
  name: string
  phone: string | null
  profit_share_pct: number
  balance: number
  created_at: string
}

export interface KantinSale {
  id: string
  unit_id: string
  user_id: string
  partner_id: string | null
  total_amount: number
  total_profit: number
  payment_method_id: string | null
  notes: string | null
  created_at: string
  user?: {
    name: string
    email: string
  }
  partner?: Partner
  payment_method?: {
    name: string
  }
  items?: KantinSaleItem[]
}

export interface KantinSaleItem {
  id: string
  sale_id: string
  inventory_item_id: string
  quantity: number
  unit_price: number
  subtotal: number
  profit: number
  created_at: string
  inventory_item?: InventoryItem
}
