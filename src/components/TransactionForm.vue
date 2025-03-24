<template>
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
              v-model.number="newTransaction.amount"
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
              :disabled="!newTransaction.type"
            >
              <option value="0" disabled selected>Pilih Kategori</option>
              <option
                v-for="category in filteredCategories"
                :key="category.id"
                :value="category.id"
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
              <option value="0" disabled selected>Pilih Metode Pembayaran</option>
              <optgroup v-for="type in ['Cash', 'Debit', 'E-wallet']" :key="type" :label="type">
                <option
                  v-for="wallet in walletOptions.filter((w) => w.type === type)"
                  :key="wallet.id"
                  :value="wallet.id"
                >
                  {{ wallet.name }}
                </option>
              </optgroup>
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
</template>

<script setup lang="ts">
import { transactionApi } from '@/services'
import type { NewTransactionPayload } from '@/types'
import { computed, defineEmits, ref } from 'vue'

const emit = defineEmits(['transaction-added', 'error', 'success'])

const isLoading = ref(false)

// Hard-coded user ID for demo purposes (should be from auth system)
const USER_ID = 1

const newTransaction = ref<NewTransactionPayload>({
  user_id: USER_ID,
  name: '',
  amount: 0,
  type: '',
  category_id: 0,
  date: new Date().toISOString().slice(0, 10),
  wallet_id: 0,
  note: '',
})

// Category options
const categoryOptions = ref([
  { id: 1, name: 'Kebutuhan', type: 'Pengeluaran' },
  { id: 2, name: 'Hiburan', type: 'Pengeluaran' },
  { id: 3, name: 'Sosial', type: 'Pengeluaran' },
  { id: 4, name: 'Hobi', type: 'Pengeluaran' },
  { id: 5, name: 'Gaji', type: 'Pemasukan' },
  { id: 6, name: 'Tunjangan', type: 'Pemasukan' },
  { id: 7, name: 'Bonus', type: 'Pemasukan' },
  { id: 8, name: 'Bisnis', type: 'Pemasukan' },
])

// Wallet options
const walletOptions = ref([
  { id: 1, name: 'Tunai', type: 'Cash' },
  { id: 2, name: 'BRI', type: 'Debit' },
  { id: 3, name: 'BNI', type: 'Debit' },
  { id: 4, name: 'Mandiri', type: 'Debit' },
  { id: 5, name: 'BCA', type: 'Debit' },
  { id: 6, name: 'ShopeePay', type: 'E-wallet' },
  { id: 7, name: 'Gopay', type: 'E-wallet' },
  { id: 8, name: 'DANA', type: 'E-wallet' },
])

const addTransaction = async () => {
  isLoading.value = true
  try {
    const response = await transactionApi.create(newTransaction.value)
    emit('transaction-added', response)
    emit('success', 'Transaksi berhasil ditambahkan')
    resetForm()
  } catch (error: any) {
    console.error('Error adding transaction:', error)
    emit('error', error.response?.data?.message || 'Gagal menambahkan transaksi')
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  newTransaction.value = {
    user_id: USER_ID,
    name: '',
    amount: 0,
    type: '',
    category_id: 0,
    date: new Date().toISOString().slice(0, 10),
    wallet_id: 0,
    note: '',
  }
}

// Filtered categories based on selected transaction type
const filteredCategories = computed(() => {
  if (!newTransaction.value.type) return []
  return categoryOptions.value.filter((cat) => cat.type === newTransaction.value.type)
})
</script>
