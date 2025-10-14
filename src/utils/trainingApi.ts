import type { TrainingResponseData, MonthlyTrainingData } from '@/types/training'

/**
 * Sydney.json 的資料結構
 */
interface SydneyApiData {
  target: string
  totalDistance: number
  totalMovingTime: string
  mainTrainingCount: number
  totalElevationGain: number
  trainingRecords: MonthlyTrainingData[] // 在 sydney.json 中這個欄位包含月份資料
}

interface SydneyApiResponse {
  code: string
  message: string
  success: boolean
  data: SydneyApiData
}

/**
 * API 工具類，用於處理訓練資料的 API 請求
 */
class TrainingApiService {
  /**
   * 取得正確的 API 基礎路徑
   */
  private getBasePath(): string {
    // 在開發環境中，使用相對路徑
    if (import.meta.env.DEV) {
      return '.'
    }
    // 在生產環境中，使用 Vite 的 base 路徑
    return import.meta.env.BASE_URL.replace(/\/$/, '')
  }

  /**
   * 測試 API 路徑是否可用
   */
  async testApiPath(): Promise<{ success: boolean; url: string; error?: string }> {
    try {
      const basePath = this.getBasePath()
      const apiUrl = `${basePath}/mock/pan/sydney.json`

      const response = await fetch(apiUrl)

      return {
        success: response.ok,
        url: apiUrl,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      }
    } catch (error) {
      const basePath = this.getBasePath()
      const apiUrl = `${basePath}/mock/pan/sydney.json`

      return {
        success: false,
        url: apiUrl,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * 從 sydney.json 取得訓練資料
   * @returns Promise<TrainingResponseData>
   */
  async fetchTrainingData(): Promise<TrainingResponseData> {
    try {
      // 動態建構正確的路徑
      const basePath = this.getBasePath()
      const apiUrl = `${basePath}/mock/pan/sydney.json`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for URL: ${apiUrl}`)
      }

      const result: SydneyApiResponse = await response.json()

      // 轉換資料結構以符合我們的型別
      const transformedData: TrainingResponseData = {
        target: result.data.target,
        totalDistance: result.data.totalDistance,
        totalMovingTime: result.data.totalMovingTime,
        mainTrainingCount: result.data.mainTrainingCount,
        totalElevationGain: result.data.totalElevationGain,
        monthlyData: result.data.trainingRecords, // sydney.json 中的 trainingRecords 實際上是 monthlyData
      }

      return transformedData
    } catch (error) {
      throw error
    }
  }
}

export const trainingApiService = new TrainingApiService()

// 也可以直接導出方法，使用更簡潔
export async function getTrainingData(): Promise<TrainingResponseData> {
  return trainingApiService.fetchTrainingData()
}
