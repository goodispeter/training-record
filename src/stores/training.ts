import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTrainingData } from '@/services/trainingService'
import type { TrainingResponseData, ChartDataPoint } from '@/types/training'

export type { TrainingRecord, MonthlyTrainingData, TrainingSummary } from '@/types/training'

export const useTrainingStore = defineStore('training', () => {
  const trainingData = ref<TrainingResponseData | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchTrainingData = async () => {
    isLoading.value = true
    error.value = null

    try {
      trainingData.value = await getTrainingData()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch training data'
      console.error('Error fetching training data:', err)
    } finally {
      isLoading.value = false
    }
  }

  const allRecords = computed(() => {
    if (!trainingData.value) return []

    return trainingData.value.monthlyData.flatMap((monthData) => monthData.trainingRecords)
  })

  const monthlyData = computed(() => {
    if (!trainingData.value) return []

    return trainingData.value.monthlyData
  })

  const chartData = computed(() => {
    if (!trainingData.value) return []

    const records = allRecords.value
    const dailyDistance = new Map<string, number>()

    records.forEach((record) => {
      const date = new Date(record.startDate).toISOString().split('T')[0]
      const currentDistance = dailyDistance.get(date) || 0
      dailyDistance.set(date, currentDistance + record.distance)
    })

    return Array.from(dailyDistance.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, distance]) => ({ date, distance })) as ChartDataPoint[]
  })

  return {
    trainingData,
    allRecords,
    monthlyData,
    chartData,
    isLoading,
    error,
    fetchTrainingData,
  }
})
