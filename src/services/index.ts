import axios from 'axios'
import type { Category, NewTransaction, Transaction, Wallet } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    const response = await apiClient.get('/transactions')
    return response.data.transactions
  },

  async getById(id: number): Promise<Transaction> {
    const response = await apiClient.get(`/transactions/${id}`)
    return response.data.transaction
  },

  async create(transaction: NewTransaction): Promise<Transaction> {
    const response = await apiClient.post('/transactions', transaction)
    return response.data.data
  },

  async update(id: number, transaction: Partial<NewTransaction>): Promise<Transaction> {
    const response = await apiClient.put(`/transactions/${id}`, transaction)
    return response.data.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/transactions/${id}`)
  },
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get('/categories')
    return response.data.categories
  },

  async getById(id: number): Promise<Category> {
    const response = await apiClient.get(`/categories/${id}`)
    return response.data.category
  },
}

export const walletService = {
  async getAll(): Promise<Wallet[]> {
    const response = await apiClient.get('/wallets')
    return response.data.wallets
  },

  async getById(id: number): Promise<Wallet> {
    const response = await apiClient.get(`/wallets/${id}`)
    return response.data.wallet
  },
}
