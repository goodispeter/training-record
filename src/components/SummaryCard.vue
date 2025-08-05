<template>
  <div class="summary-card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-600 mb-2">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900">
          {{ formattedValue }}
          <span class="text-sm text-gray-500 font-medium">{{ unit }}</span>
        </p>
      </div>
      <div style="font-size: 2rem">{{ icon }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number | undefined
  unit: string
  icon: string
}

const props = defineProps<Props>()

const formattedValue = computed(() => {
  if (props.value === undefined || props.value === null) return '--'

  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }

  return props.value
})
</script>
