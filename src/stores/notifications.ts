import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const errorMessage = ref('')
  const successMessage = ref('')

  function setError(messsage: string) {
    errorMessage.value = messsage
    successMessage.value = ''

    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  }

  function setSuccess(message: string) {
    successMessage.value = message
    errorMessage.value = ''

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }

  function clearNotifications() {
    errorMessage.value = ''
    successMessage.value = ''
  }

  return {
    errorMessage,
    successMessage,
    setError,
    setSuccess,
    clearNotifications,
  }
})
