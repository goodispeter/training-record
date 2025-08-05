import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockTrainingData, type TrainingResponseData } from '@/mock/record/training-data'

export type { TrainingRecord, MonthlyTrainingData } from '@/mock/record/training-data'

export interface TrainingSummary {
  totalDistance: number
  totalMovingTime: string
  mainTrainingCount: number
  totalElevationGain: number
}

export interface TrainingResponse {
  code: string
  message: string
  success: boolean
  data: TrainingResponseData
}

export const useTrainingStore = defineStore('training', () => {
  const trainingData = ref<TrainingResponseData | null>(null)

  const fetchTrainingData = async () => {
    trainingData.value = mockTrainingData
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
    if (!trainingData.value) return null

    const records = allRecords.value
    const dailyDistance = new Map<string, number>()

    records.forEach((record) => {
      const date = new Date(record.startDate).toISOString().split('T')[0]
      const currentDistance = dailyDistance.get(date) || 0
      dailyDistance.set(date, currentDistance + record.distance)
    })

    return Array.from(dailyDistance.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, distance]) => ({ date, distance }))
  })

  return {
    trainingData,
    allRecords,
    monthlyData,
    chartData,
    fetchTrainingData,
  }
})
