export interface Transaction {
  transaction_id: number
  user_id: number
  name: string
  type: 'Pemasukan' | 'Pengeluaran'
  amount: number
  category_id: number
  date: string
  wallet_id: number
  note?: string
  created_at?: string
  updated_at?: string
  category?: Category
  wallet?: Wallet
}

export interface NewTransaction {
  user_id: number
  name: string
  type: string
  amount: number
  category_id: number
  date: string
  wallet_id: number
  note?: string
}

export interface Category {
  category_id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface Wallet {
  wallet_id: number
  user_id: number
  name: string
  balance: number
  created_at?: string
  updated_at?: string
}

export interface Budget {
  budget_id: number
  user_id: number
  category_id: number
  amount: number
  month: number
  year: number
  created_at?: string
  updated_at?: string
}

export interface User {
  user_id: number
  name: string
  email: string
  created_at?: string
  updated_at?: string
}

export interface Saving {
  saving_id: number
  user_id: number
  goal: string
  amount: number
  current_amount: number
  created_at?: string
  updated_at?: string
}

export interface ApiResponse<T> {
  message?: string
  data?: T
  error?: string
}
