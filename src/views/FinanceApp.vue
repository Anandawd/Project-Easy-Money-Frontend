<script setup lang="ts">
import FinanceSummary from '@/components/FinanceSummary.vue'
import NotificationSystem from '@/components/NotificationSystem.vue'
import TransactionForm from '@/components/TransactionForm.vue'
import TransactionList from '@/components/TransactionList.vue'
import { transactionApi } from '@/services'
import type { Transaction } from '@/types'
import { onMounted, ref } from 'vue'

const transactions = ref<Transaction[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Load all transactions
const loadTransactions = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    transactions.value = await transactionApi.getAll()
  } catch (error: any) {
    console.error('Error loading transactions:', error)
    errorMessage.value = 'Gagal memuat data transaksi'
  } finally {
    isLoading.value = false
  }
}

// Handle transaction added
const handleTransactionAdded = (transaction: Transaction) => {
  transactions.value.push(transaction)
}

// Handle transaction updated
const handleTransactionUpdated = (transaction: Transaction, index: number) => {
  transactions.value[index] = transaction
}

// Handle transaction deleted
const handleTransactionDeleted = (index: number) => {
  transactions.value.splice(index, 1)
}

// Handle error
const handleError = (message: string) => {
  errorMessage.value = message
  // Auto-clear after 5 seconds
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

// Handle success
const handleSuccess = (message: string) => {
  successMessage.value = message
  // Auto-clear after 3 seconds
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Clear messages
const clearError = () => {
  errorMessage.value = ''
}

const clearSuccess = () => {
  successMessage.value = ''
}

// Fetch data on component mount
onMounted(() => {
  loadTransactions()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <header class="py-5 mb-8 text-center">
      <h1 class="text-3xl font-bold text-gray-800">Easy Money</h1>
      <p class="text-gray-600 mt-2">Kelola Keuangan Anda dengan Mudah</p>
    </header>

    <main class="flex flex-col gap-8">
      <!-- Notifications -->
      <NotificationSystem
        :errorMessage="errorMessage"
        :successMessage="successMessage"
        @clear-error="clearError"
        @clear-success="clearSuccess"
      />

      <!-- Loading indicator -->
      <div v-if="isLoading" class="text-center py-4">
        <p class="text-gray-600">Memuat data...</p>
      </div>

      <!-- Finance Summary -->
      <FinanceSummary :transactions="transactions" />

      <!-- Transaction Form -->
      <TransactionForm
        @transaction-added="handleTransactionAdded"
        @error="handleError"
        @success="handleSuccess"
      />

      <!-- Transaction List -->
      <TransactionList
        :transactions="transactions"
        @transaction-updated="handleTransactionUpdated"
        @transaction-deleted="handleTransactionDeleted"
        @error="handleError"
        @success="handleSuccess"
      />
    </main>

    <footer class="mt-12 py-4 text-center text-gray-600 text-sm">
      <p>&copy; {{ new Date().getFullYear() }} Easy Money - Aplikasi Manajemen Keuangan</p>
    </footer>
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
