<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

const expenses = ref([])
const newExpense = ref({
  date: '',
  name: '',
  amount: 0,
  type: '',
  category: '',
  wallet: '',
  note: '',
})
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const BASE_URL = 'http://localhost:5000/api/v1'

// Get all transactions
const loadExpenses = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await axios.get(`${BASE_URL}/transactions`)

    expenses.value = response.data.transactions
  } catch (error) {
    console.error('Error loading expenses:', error)
    errorMessage.value = 'Gagal memuat data transaksi'
  } finally {
    isLoading.value = false
  }
}

const addExpense = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post(`${BASE_URL}/transactions`, newExpense.value)
    expenses.value.push(response.data.data)
    successMessage.value = 'Transaksi berhasil ditambahkan'
    newExpense.value = {
      date: '',
      name: '',
      amount: 0,
      type: '',
      category: '',
      wallet: '',
      note: '',
    }
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error adding expense:', error)
    errorMessage.value = error.response?.data?.message || 'Gagal menambahkan transaksi'
  } finally {
    isLoading.value = false
  }
}

// Edit transaction
const editExpense = async (id, index) => {
  try {
    // Get current values for the expense
    const currentExpense = expenses.value[index]

    // Collect updated values using prompts (in a real app, you'd use a modal form)
    const updatedName = prompt('Masukkan nama pengeluaran baru:', currentExpense.name)
    const updatedAmount = prompt('Masukkan jumlah baru:', currentExpense.amount)
    const updatedDate = prompt(
      'Masukkan tanggal baru (YYYY-MM-DD):',
      currentExpense.date.slice(0, 10),
    )
    const updatedType = prompt('Masukkan jenis baru:', currentExpense.type)
    const updatedCategory = prompt('Masukkan kategori baru:', currentExpense.category)
    const updatedWallet = prompt('Masukkan dompet baru:', currentExpense.wallet)
    const updatedNote = prompt('Masukkan catatan baru:', currentExpense.note)

    if (updatedName && updatedAmount && updatedDate) {
      const updatedExpense = {
        name: updatedName,
        amount: parseFloat(updatedAmount),
        date: updatedDate,
        type: updatedType,
        category: updatedCategory,
        wallet: updatedWallet,
        note: updatedNote || '',
      }

      // Send PUT request to update in backend
      const response = await axios.put(`${BASE_URL}/transactions/${id}`, updatedExpense)

      // Update local state with the response data
      expenses.value[index] = response.data.data
      successMessage.value = 'Transaksi berhasil diperbarui'

      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Error updating expense:', error)
    errorMessage.value = error.response?.data?.message || 'Gagal memperbarui transaksi'
  }
}

// Delete transaction
const deleteExpense = async (id, index) => {
  if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
    return
  }

  try {
    // Send DELETE request to backend
    await axios.delete(`${BASE_URL}/transactions/${id}`)

    // Remove from local state
    expenses.value.splice(index, 1)
    successMessage.value = 'Transaksi berhasil dihapus'

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error deleting expense:', error)
    errorMessage.value = error.response?.data?.message || 'Gagal menghapus transaksi'
  }
}

// Calculated properties
const totalIncome = computed(() => {
  return expenses.value
    .filter((expense) => expense.type === 'Pemasukan')
    .reduce((total, expense) => total + parseFloat(expense.amount), 0)
})

const totalExpenses = computed(() => {
  return expenses.value
    .filter((expense) => expense.type === 'Pengeluaran')
    .reduce((total, expense) => total + parseFloat(expense.amount), 0)
})

const balance = computed(() => {
  return totalIncome.value - totalExpenses.value
})

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID')
}

onMounted(() => {
  loadExpenses()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <header class="py-5 mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-800">Finance Tracker</h1>
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
        <form class="flex flex-col gap-6" @submit.prevent="addExpense">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex flex-col gap-1">
                <label for="date" class="font-medium text-gray-700">Tanggal</label>
                <input
                  type="date"
                  id="date"
                  v-model="newExpense.date"
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
                  v-model="newExpense.amount"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div class="flex flex-col gap-1">
                <label for="type" class="font-medium text-gray-700">Jenis Transaksi</label>
                <select
                  id="type"
                  v-model="newExpense.type"
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
                  v-model="newExpense.name"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div class="flex flex-col gap-1">
                <label for="category" class="font-medium text-gray-700">Kategori</label>
                <select
                  id="category"
                  v-model="newExpense.category"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="" disabled selected>Pilih Kategori</option>
                  <optgroup label="Pengeluaran">
                    <option value="Kebutuhan">Kebutuhan</option>
                    <option value="Hiburan">Hiburan</option>
                    <option value="Sosial">Sosial</option>
                    <option value="Hobi">Hobi</option>
                  </optgroup>
                  <optgroup label="Pemasukan">
                    <option value="Gaji">Gaji</option>
                    <option value="Tunjangan">Tunjangan</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Bisnis">Bisnis</option>
                  </optgroup>
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label for="wallet" class="font-medium text-gray-700">Metode Pembayaran</label>
                <select
                  id="wallet"
                  v-model="newExpense.wallet"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="" disabled selected>Pilih Metode Pembayaran</option>
                  <optgroup label="Cash">
                    <option value="Tunai">Tunai</option>
                  </optgroup>
                  <optgroup label="Debit">
                    <option value="BRI">BRI</option>
                    <option value="BNI">BNI</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BCA">BCA</option>
                  </optgroup>
                  <optgroup label="E-wallet">
                    <option value="ShopeePay">ShopeePay</option>
                    <option value="Gopay">Gopay</option>
                    <option value="DANA">DANA</option>
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
              v-model="newExpense.note"
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
            <tr v-if="expenses.length === 0">
              <td colspan="9" class="py-4 px-4 text-center text-gray-500">Belum ada transaksi</td>
            </tr>
            <tr
              v-for="(expense, index) in expenses"
              :key="expense.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="py-3 px-4">{{ index + 1 }}</td>
              <td class="py-3 px-4">{{ expense.name }}</td>
              <td
                class="py-3 px-4"
                :class="expense.type === 'Pemasukan' ? 'text-green-600' : 'text-red-600'"
              >
                Rp {{ parseFloat(expense.amount).toLocaleString('id-ID') }}
              </td>
              <td class="py-3 px-4">{{ formatDate(expense.date) }}</td>
              <td class="py-3 px-4">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="
                    expense.type === 'Pemasukan'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                >
                  {{ expense.type }}
                </span>
              </td>
              <td class="py-3 px-4">{{ expense.category }}</td>
              <td class="py-3 px-4">{{ expense.wallet }}</td>
              <td class="py-3 px-4">{{ expense.note }}</td>
              <td class="py-3 px-4 flex gap-2">
                <button
                  @click="editExpense(expense.id, index)"
                  class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  @click="deleteExpense(expense.id, index)"
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
