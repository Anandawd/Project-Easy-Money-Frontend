<script setup lang="ts">
import type { Transaction } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  transactions: Transaction[]
}>()

const totalIncome = computed(() => {
  return props.transactions
    .filter((transaction) => transaction.type === 'Pemasukan')
    .reduce((total, transaction) => total + transaction.amount, 0)
})

const totalExpenses = computed(() => {
  return props.transactions
    .filter((transaction) => transaction.type === 'Pengeluaran')
    .reduce((total, transaction) => total + transaction.amount, 0)
})

const balance = computed(() => {
  return totalIncome.value - totalExpenses.value
})
</script>

<template>
  <section class="border border-gray-300 rounded-lg p-6 shadow-sm">
    <h2 class="text-xl font-bold mb-4 text-gray-800">Ringkasan Keuangan</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- saldo akhir -->
      <div class="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
        <h3 class="text-base text-gray-700 mb-2">Saldo Akhir</h3>
        <p class="text-2xl font-semibold" :class="balance >= 0 ? 'text-green-600' : 'text-red-600'">
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
</template>
