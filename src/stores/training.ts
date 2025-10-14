import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTrainingData } from '@/services/trainingService'
import type { TrainingResponseData, ChartDataPoint } from '@/types/training'

export type {
  TrainingRecord,
  MonthlyTrainingData,
  TrainingSummary,
  WeeklyTrainingData,
} from '@/types/training'

export const useTrainingStore = defineStore('training', () => {
  const trainingData = ref<TrainingResponseData | null>(null)

  const fetchTrainingData = async (person?: string, target?: string) => {
    try {
      trainingData.value = await getTrainingData(person, target)
    } catch (err) {
      throw err
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

  const weeklyData = computed(() => {
    if (!trainingData.value?.weeklyTrainingRecords) return []
    return trainingData.value.weeklyTrainingRecords.sort((a, b) => a.planWeek - b.planWeek)
  })

  return {
    trainingData,
    allRecords,
    monthlyData,
    weeklyData,
    chartData,
    fetchTrainingData,
  }
})
