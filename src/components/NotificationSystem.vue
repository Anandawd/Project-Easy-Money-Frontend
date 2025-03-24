<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'

const props = defineProps<{
  errorMessage: string
  successMessage: string
}>()

const emit = defineEmits(['clear-error', 'clear-success'])
</script>

<template>
  <div>
    <div
      v-if="errorMessage"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
    >
      {{ errorMessage }}
      <button @click="$emit('clear-error')" class="absolute top-0 right-0 px-4 py-3">×</button>
    </div>
    <div
      v-if="successMessage"
      class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
    >
      {{ successMessage }}
      <button @click="$emit('clear-success')" class="absolute top-0 right-0 px-4 py-3">×</button>
    </div>
  </div>
</template>
