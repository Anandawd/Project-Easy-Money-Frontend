import { categoryService } from '@/services'
import type { Category } from '@/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const isLoading = ref<boolean>(false)
  const errorMessage = ref<string>('')

  const loadCategories = async (): Promise<void> => {
    isLoading.value = true
    try {
      categories.value = await categoryService.getAll()
    } catch (error) {
      console.error('Error loading categories:', error)
      errorMessage.value = 'Gagal memuat data kategori'
    } finally {
      isLoading.value = false
    }
  }
  return {
    categories,
    isLoading,
    errorMessage,
    loadCategories,
  }
})
