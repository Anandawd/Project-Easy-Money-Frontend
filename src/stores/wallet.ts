import { walletService } from '@/services'
import type { Wallet } from '@/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWalletStore = defineStore('wallet', () => {
  // State
  const wallets = ref<Wallet[]>([])
  const isLoading = ref<boolean>(false)
  const errorMessage = ref<string>('')

  // Actions
  const loadWallets = async (): Promise<void> => {
    isLoading.value = true
    try {
      wallets.value = await walletService.getAll()
    } catch (error) {
      console.error('Error loading wallets:', error)
      errorMessage.value = 'Gagal memuat data dompet'
    } finally {
      isLoading.value = false
    }
  }

  return {
    wallets,
    isLoading,
    errorMessage,
    loadWallets,
  }
})
