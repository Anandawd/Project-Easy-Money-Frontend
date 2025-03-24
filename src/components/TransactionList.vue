<script setup lang="ts">
import { transactionApi } from '@/services'
import type { Transaction } from '@/types'
import { defineEmits, ref } from 'vue'

const props = defineProps<{
  transactions: Transaction[]
}>()

const emit = defineEmits(['transaction-updated', 'transaction-deleted', 'error', 'success'])

const isLoading = ref(false)

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID')
}

const editTransaction = async (transaction: Transaction, index: number) => {
  try {
    // Get current values for the transaction
    const updatedName = prompt('Masukkan nama pengeluaran baru:', transaction.name)
    const updatedAmount = prompt('Masukkan jumlah baru:', transaction.amount.toString())
    const updatedDate = prompt('Masukkan tanggal baru (YYYY-MM-DD):', transaction.date.slice(0, 10))
    const updatedType = prompt('Masukkan jenis baru:', transaction.type)

    // Get category_id and wallet_id (in a real app, you would use dropdowns)
    const updatedCategoryId = Number(
      prompt('Masukkan ID kategori baru:', transaction.category_id.toString()),
    )
    const updatedWalletId = Number(
      prompt('Masukkan ID dompet baru:', transaction.wallet_id.toString()),
    )

    const updatedNote = prompt('Masukkan catatan baru:', transaction.note || '')

    if (updatedName && updatedAmount && updatedDate && updatedType) {
      const updatedTransaction = {
        user_id: transaction.user_id,
        name: updatedName,
        amount: parseFloat(updatedAmount),
        type: updatedType,
        category_id: updatedCategoryId,
        date: updatedDate,
        wallet_id: updatedWalletId,
        note: updatedNote || '',
      }

      // Send PUT request to update in backend
      const response = await transactionApi.update(transaction.transaction_id, updatedTransaction)

      // Emit event to update parent component
      emit('transaction-updated', response, index)
      emit('success', 'Transaksi berhasil diperbarui')
    }
  } catch (error: any) {
    console.error('Error updating transaction:', error)
    emit('error', error.response?.data?.message || 'Gagal memperbarui transaksi')
  }
}

const deleteTransaction = async (id: number, index: number) => {
  if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
    return
  }

  isLoading.value = true
  try {
    await transactionApi.delete(id)
    emit('transaction-deleted', index)
    emit('success', 'Transaksi berhasil dihapus')
  } catch (error: any) {
    console.error('Error deleting transaction:', error)
    emit('error', error.response?.data?.message || 'Gagal menghapus transaksi')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
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
            Rp {{ transaction.amount.toLocaleString('id-ID') }}
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
          <td class="py-3 px-4">{{ transaction.category?.name || '?' }}</td>
          <td class="py-3 px-4">{{ transaction.wallet?.name || '?' }}</td>
          <td class="py-3 px-4">{{ transaction.note }}</td>
          <td class="py-3 px-4 flex gap-2">
            <button
              @click="editTransaction(transaction, index)"
              class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              :disabled="isLoading"
            >
              Edit
            </button>
            <button
              @click="deleteTransaction(transaction.transaction_id, index)"
              class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              :disabled="isLoading"
            >
              Hapus
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
