<script setup lang="ts">
import { categoryService, transactionService, walletService } from '@/services'
import { computed, onMounted, ref } from 'vue'
import type { Category, NewTransaction, Transaction, Wallet } from '../types'

// State
const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const wallets = ref<Wallet[]>([])
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

// Load data
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

const loadCategories = async (): Promise<void> => {
  try {
    categories.value = await categoryService.getAll()
  } catch (error) {
    console.error('Error loading categories:', error)
    errorMessage.value = 'Gagal memuat data kategori'
  }
}

const loadWallets = async (): Promise<void> => {
  try {
    wallets.value = await walletService.getAll()
  } catch (error) {
    console.error('Error loading wallets:', error)
    errorMessage.value = 'Gagal memuat data dompet'
  }
}

// Add transaction
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

// Edit transaction
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

    console.log('updatedDate: ', updatedDate)

    if (!updatedDate) return

    const updatedType = prompt('Masukkan jenis baru:', currentTransaction.type)
    if (!updatedType) return

    const updatedCategoryId = prompt(
      'Masukkan ID kategori baru:',
      String(currentTransaction.category_id),
    )
    if (!updatedCategoryId) return

    const updatedWalletId = prompt('Masukkan ID dompet baru:', String(currentTransaction.wallet_id))
    if (!updatedWalletId) return

    const updatedNote = prompt('Masukkan catatan baru:', currentTransaction.note || '')

    const formattedDate = new Date(updatedDate).toISOString()
    console.log('formattedDate: ', formattedDate)

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

// Delete transaction
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

// Calculated properties
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

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID')
}

onMounted(() => {
  loadTransactions()
  loadCategories()
  loadWallets()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <header class="py-5 mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-800">Easy Money</h1>
    </header>

    <main class="flex flex-col gap-8">
      <!-- Notifications -->
      <div
        v-if="errorMessage"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      >
        {{ errorMessage }}
        <button @click="errorMessage = ''" class="absolute top-0 right-0 px-4 py-3">×</button>
      </div>
      <div
        v-if="successMessage"
        class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
      >
        {{ successMessage }}
        <button @click="successMessage = ''" class="absolute top-0 right-0 px-4 py-3">×</button>
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="text-center py-4">
        <p class="text-gray-600">Memuat data...</p>
      </div>

      <!-- Overview -->
      <section class="border border-gray-300 rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Ringkasan Keuangan</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- saldo akhir -->
          <div class="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <h3 class="text-base text-gray-700 mb-2">Saldo Akhir</h3>
            <p
              class="text-2xl font-semibold"
              :class="balance >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              Rp {{ balance.toLocaleString('id-ID') }}
            </p>
          </div>

          <!-- total pemasukan -->
          <div class="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <h3 class="text-base text-gray-700 mb-2">Total Pemasukan</h3>
            <p class="text-2xl font-semibold text-green-600">
              Rp {{ totalIncome.toLocaleString('id-ID') }}
            </p>
          </div>

          <!-- total pengeluaran -->
          <div class="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <h3 class="text-base text-gray-700 mb-2">Total Pengeluaran</h3>
            <p class="text-2xl font-semibold text-red-600">
              Rp {{ totalExpenses.toLocaleString('id-ID') }}
            </p>
          </div>
        </div>
      </section>

      <!-- Add Form -->
      <section class="border border-gray-300 rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Tambah Transaksi</h2>
        <form class="flex flex-col gap-6" @submit.prevent="addTransaction">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex flex-col gap-1">
                <label for="date" class="font-medium text-gray-700">Tanggal</label>
                <input
                  type="date"
                  id="date"
                  v-model="newTransaction.date"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div class="flex flex-col gap-1">
                <label for="amount" class="font-medium text-gray-700">Jumlah</label>
                <input
                  type="number"
                  id="amount"
                  placeholder="Masukkan jumlah"
                  v-model="newTransaction.amount"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div class="flex flex-col gap-1">
                <label for="type" class="font-medium text-gray-700">Jenis Transaksi</label>
                <select
                  id="type"
                  v-model="newTransaction.type"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="" disabled selected>Pilih Jenis Transaksi</option>
                  <option value="Pengeluaran">Pengeluaran</option>
                  <option value="Pemasukan">Pemasukan</option>
                </select>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex flex-col gap-1">
                <label for="name" class="font-medium text-gray-700">Nama</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Masukkan Nama Transaksi"
                  v-model="newTransaction.name"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div class="flex flex-col gap-1">
                <label for="category" class="font-medium text-gray-700">Kategori</label>
                <select
                  id="category"
                  v-model="newTransaction.category_id"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="" disabled selected>Pilih Kategori</option>
                  <option
                    v-for="category in categories"
                    :key="category.category_id"
                    :value="category.category_id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label for="wallet" class="font-medium text-gray-700">Metode Pembayaran</label>
                <select
                  id="wallet"
                  v-model="newTransaction.wallet_id"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="" disabled selected>Pilih Metode Pembayaran</option>
                  <option
                    v-for="wallet in wallets"
                    :key="wallet.wallet_id"
                    :value="wallet.wallet_id"
                  >
                    {{ wallet.name }} - Rp {{ wallet.balance.toLocaleString('id-ID') }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label for="note" class="font-medium text-gray-700">Catatan</label>
            <input
              type="text"
              id="note"
              placeholder="Masukkan Catatan (opsional)"
              v-model="newTransaction.note"
              class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            class="py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Menambahkan...' : 'Tambah Transaksi' }}
          </button>
        </form>
      </section>

      <!-- Table Transaction -->
      <section class="border border-gray-300 rounded-lg p-6 shadow-sm overflow-x-auto">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Daftar Transaksi</h2>
        <table class="min-w-full bg-white">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-3 px-4 text-left">No</th>
              <th class="py-3 px-4 text-left">Nama</th>
              <th class="py-3 px-4 text-left">Jumlah</th>
              <th class="py-3 px-4 text-left">Tanggal</th>
              <th class="py-3 px-4 text-left">Jenis</th>
              <th class="py-3 px-4 text-left">Kategori</th>
              <th class="py-3 px-4 text-left">Metode</th>
              <th class="py-3 px-4 text-left">Catatan</th>
              <th class="py-3 px-4 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="transactions.length === 0">
              <td colspan="9" class="py-4 px-4 text-center text-gray-500">Belum ada transaksi</td>
            </tr>
            <tr
              v-for="(transaction, index) in transactions"
              :key="transaction.transaction_id"
              class="border-b hover:bg-gray-50"
            >
              <td class="py-3 px-4">{{ index + 1 }}</td>
              <td class="py-3 px-4">{{ transaction.name }}</td>
              <td
                class="py-3 px-4"
                :class="transaction.type === 'Pemasukan' ? 'text-green-600' : 'text-red-600'"
              >
                Rp {{ parseFloat(String(transaction.amount)).toLocaleString('id-ID') }}
              </td>
              <td class="py-3 px-4">{{ formatDate(transaction.date) }}</td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="
                    transaction.type === 'Pemasukan'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                >
                  {{ transaction.type }}
                </span>
              </td>
              <td class="py-3 px-4">{{ transaction.category?.name || 'N/A' }}</td>
              <td class="py-3 px-4">{{ transaction.wallet?.name || 'N/A' }}</td>
              <td class="py-3 px-4">{{ transaction.note || '-' }}</td>
              <td class="py-3 px-4 flex gap-2">
                <button
                  @click="editTransaction(transaction.transaction_id, index)"
                  class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  @click="deleteTransaction(transaction.transaction_id, index)"
                  class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>

<style scoped>
input,
select {
  height: 2.5rem;
  border-radius: 0.375rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
}
</style>
