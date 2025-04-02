import { transactionService } from '@/services'
import type { NewTransaction, Transaction } from '@/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([])
  const isLoading = ref<boolean>(false)
  const errorMessage = ref<string>('')
  const successMessage = ref<string>('')

  // Form state
  const newTransaction = ref<Partial<NewTransaction>>({
    user_id: 1,
    name: '',
    amount: 0,
    type: '',
    category_id: 0,
    date: new Date().toISOString().slice(0, 10),
    wallet_id: 0,
    note: '',
  })

  // Actions
  const loadTransactions = async (): Promise<void> => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      transactions.value = await transactionService.getAll()
      console.log('loadTransaction: ', transactions.value)
    } catch (error) {
      console.error('Error loading transactions:', error)
      errorMessage.value = 'Gagal memuat data transaksi'
    } finally {
      isLoading.value = false
    }
  }

  const addTransaction = async (): Promise<void> => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      if (
        !newTransaction.value.name ||
        !newTransaction.value.amount ||
        !newTransaction.value.type ||
        !newTransaction.value.category_id ||
        !newTransaction.value.wallet_id ||
        !newTransaction.value.date
      ) {
        errorMessage.value = 'Semua field wajib diisi'
        isLoading.value = false
        return
      }

      // Convert form value to the backend expected format
      const transactionData: NewTransaction = {
        user_id: newTransaction.value.user_id || 1,
        name: newTransaction.value.name || '',
        amount: Number(newTransaction.value.amount),
        type: newTransaction.value.type || '',
        category_id: Number(newTransaction.value.category_id),
        date: new Date(newTransaction.value.date || '').toISOString(),
        wallet_id: Number(newTransaction.value.wallet_id),
        note: newTransaction.value.note,
      }

      const createdTransaction = await transactionService.create(transactionData)
      transactions.value.push(createdTransaction)

      // Reset form
      resetForm()

      successMessage.value = 'Transaksi berhasil ditambahkan'
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } catch (error: any) {
      console.error('Error adding transaction:', error)
      errorMessage.value = error.response?.data?.message || 'Gagal menambahkan transaksi'
    } finally {
      isLoading.value = false
    }
  }

  const editTransaction = async (id: number, index: number): Promise<void> => {
    try {
      // Get current values for the transaction
      const currentTransaction = transactions.value[index]

      // Collect updated values using prompts (in a real app, you'd use a modal form)
      const updatedName = prompt('Masukkan nama transaksi baru:', currentTransaction.name)
      if (!updatedName) return

      const updatedAmount = prompt('Masukkan jumlah baru:', String(currentTransaction.amount))
      if (!updatedAmount) return

      const updatedDate = prompt(
        'Masukkan tanggal baru (YYYY-MM-DD):',
        new Date(currentTransaction.date).toISOString().slice(0, 10),
      )
      if (!updatedDate) return

      const updatedType = prompt('Masukkan jenis baru:', currentTransaction.type)
      if (!updatedType) return

      const updatedCategoryId = prompt(
        'Masukkan ID kategori baru:',
        String(currentTransaction.category_id),
      )
      if (!updatedCategoryId) return

      const updatedWalletId = prompt(
        'Masukkan ID dompet baru:',
        String(currentTransaction.wallet_id),
      )
      if (!updatedWalletId) return

      const updatedNote = prompt('Masukkan catatan baru:', currentTransaction.note || '')

      const formattedDate = new Date(updatedDate).toISOString()

      const updatedTransaction: Partial<NewTransaction> = {
        name: updatedName,
        amount: parseFloat(updatedAmount),
        date: formattedDate,
        type: updatedType as 'Pemasukan' | 'Pengeluaran',
        category_id: parseInt(updatedCategoryId),
        wallet_id: parseInt(updatedWalletId),
        note: updatedNote || '',
        user_id: currentTransaction.user_id,
      }

      // Send PUT request to update in backend
      const response = await transactionService.update(id, updatedTransaction)

      // Update local state with the response data
      transactions.value[index] = response
      successMessage.value = 'Transaksi berhasil diperbarui'

      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } catch (error: any) {
      console.error('Error updating transaction:', error)
      errorMessage.value = error.response?.data?.message || 'Gagal memperbarui transaksi'
    }
  }

  const deleteTransaction = async (id: number, index: number): Promise<void> => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return
    }

    try {
      // Send DELETE request to backend
      await transactionService.delete(id)

      // Remove from local state
      transactions.value.splice(index, 1)
      successMessage.value = 'Transaksi berhasil dihapus'

      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } catch (error: any) {
      console.error('Error deleting transaction:', error)
      errorMessage.value = error.response?.data?.message || 'Gagal menghapus transaksi'
    }
  }

  const resetForm = (): void => {
    newTransaction.value = {
      user_id: 1,
      name: '',
      amount: 0,
      type: '',
      category_id: 0,
      date: new Date().toISOString().slice(0, 10),
      wallet_id: 0,
      note: '',
    }
  }

  const clearErrorMessage = (): void => {
    errorMessage.value = ''
  }

  const clearSuccessMessage = (): void => {
    successMessage.value = ''
  }

  // Computed properties
  const totalIncome = computed((): number => {
    return transactions.value
      .filter((transaction) => transaction.type === 'Pemasukan')
      .reduce((total, transaction) => total + parseFloat(String(transaction.amount)), 0)
  })

  const totalExpenses = computed((): number => {
    return transactions.value
      .filter((transaction) => transaction.type === 'Pengeluaran')
      .reduce((total, transaction) => total + parseFloat(String(transaction.amount)), 0)
  })

  const balance = computed((): number => {
    return totalIncome.value - totalExpenses.value
  })

  return {
    // State
    transactions,
    isLoading,
    errorMessage,
    successMessage,
    newTransaction,

    // Actions
    loadTransactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    resetForm,
    clearErrorMessage,
    clearSuccessMessage,

    // Computed
    totalIncome,
    totalExpenses,
    balance,
  }
})
