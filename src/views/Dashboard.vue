<script setup lang="ts">
import { useCategoryStore, useTransactionsStore, useWalletStore } from '@/stores'
import { onMounted } from 'vue'

const transactionStore = useTransactionsStore()
const categoryStore = useCategoryStore()
const walletStore = useWalletStore()

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID')
}

onMounted(() => {
  transactionStore.loadTransactions()
  categoryStore.loadCategories()
  walletStore.loadWallets()
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
        v-if="transactionStore.errorMessage"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      >
        {{ transactionStore.errorMessage }}
        <button
          @click="transactionStore.errorMessage = ''"
          class="absolute top-0 right-0 px-4 py-3"
        >
          ×
        </button>
      </div>
      <div
        v-if="transactionStore.successMessage"
        class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
      >
        {{ transactionStore.successMessage }}
        <button
          @click="transactionStore.successMessage = ''"
          class="absolute top-0 right-0 px-4 py-3"
        >
          ×
        </button>
      </div>

      <!-- Loading indicator -->
      <div v-if="transactionStore.isLoading" class="text-center py-4">
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
              :class="transactionStore.balance >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              Rp {{ transactionStore.balance.toLocaleString('id-ID') }}
            </p>
          </div>

          <!-- total pemasukan -->
          <div class="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <h3 class="text-base text-gray-700 mb-2">Total Pemasukan</h3>
            <p class="text-2xl font-semibold text-green-600">
              Rp {{ transactionStore.totalIncome.toLocaleString('id-ID') }}
            </p>
          </div>

          <!-- total pengeluaran -->
          <div class="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <h3 class="text-base text-gray-700 mb-2">Total Pengeluaran</h3>
            <p class="text-2xl font-semibold text-red-600">
              Rp {{ transactionStore.totalExpenses.toLocaleString('id-ID') }}
            </p>
          </div>
        </div>
      </section>

      <!-- New Transaction Form -->
      <section class="border border-gray-300 rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Tambah Transaksi</h2>
        <form class="flex flex-col gap-6" @submit.prevent="transactionStore.addTransaction()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex flex-col gap-1">
                <label for="date" class="font-medium text-gray-700">Tanggal</label>
                <input
                  type="date"
                  id="date"
                  v-model="transactionStore.newTransaction.date"
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
                  v-model="transactionStore.newTransaction.amount"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div class="flex flex-col gap-1">
                <label for="type" class="font-medium text-gray-700">Jenis Transaksi</label>
                <select
                  id="type"
                  v-model="transactionStore.newTransaction.type"
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
                  v-model="transactionStore.newTransaction.name"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div class="flex flex-col gap-1">
                <label for="category" class="font-medium text-gray-700">Kategori</label>
                <select
                  id="category"
                  v-model="transactionStore.newTransaction.category_id"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="" disabled selected>Pilih Kategori</option>
                  <option
                    v-for="category in categoryStore.categories"
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
                  v-model="transactionStore.newTransaction.wallet_id"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="" disabled selected>Pilih Metode Pembayaran</option>
                  <option
                    v-for="wallet in walletStore.wallets"
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
              v-model="transactionStore.newTransaction.note"
              class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            class="py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer"
            :disabled="transactionStore.isLoading"
          >
            {{ transactionStore.isLoading ? 'Menambahkan...' : 'Tambah Transaksi' }}
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
            <tr v-if="!transactionStore.transactions.length">
              <td colspan="9" class="py-4 px-4 text-center text-gray-500">Belum ada transaksi</td>
            </tr>
            <tr
              v-for="(transaction, index) in transactionStore.transactions"
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
                  @click="transactionStore.editTransaction(transaction.transaction_id, index)"
                  class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  @click="transactionStore.deleteTransaction(transaction.transaction_id, index)"
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
