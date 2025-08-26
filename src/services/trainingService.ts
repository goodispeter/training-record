import { apiUtil } from '@/utils/apiUtil'
import type { TrainingResponseData } from '@/types/training'

/**
 * Sydney.json 的 API 回應格式（與我們的型別稍有不同）
 */
interface SydneyApiData {
  target: string
  totalDistance: number
  totalMovingTime: string
  mainTrainingCount: number
  totalElevationGain: number
  monthlyTrainingRecords: import('@/types/training').MonthlyTrainingData[] // 在 sydney.json 中這個欄位包含月份資料
}

interface SydneyApiResponse {
  code: string
  message: string
  success: boolean
  data: SydneyApiData
}

/**
 * 訓練資料服務類
 * 負責處理所有與訓練資料相關的 API 操作
 */
class TrainingService {
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
   * 從 sydney.json 取得訓練資料
   * @returns Promise<TrainingResponseData>
   */
  async getTrainingData(): Promise<TrainingResponseData> {
    try {
      const basePath = this.getBasePath()
      const apiUrl = `${basePath}/mock/pan/sydney.json`

      const result = await apiUtil.doGet<SydneyApiResponse>(apiUrl)

      const transformedData: TrainingResponseData = {
        target: result.data.target,
        totalDistance: result.data.totalDistance,
        totalMovingTime: result.data.totalMovingTime,
        mainTrainingCount: result.data.mainTrainingCount,
        totalElevationGain: result.data.totalElevationGain,
        monthlyData: result.data.monthlyTrainingRecords, // sydney.json 中的 trainingRecords 實際上是 monthlyData
      }

      return transformedData
    } catch (error) {
      console.error('Failed to fetch training data:', error)
      throw error
    }
  }

  async testApiPath(): Promise<{ success: boolean; url: string; error?: string }> {
    try {
      const basePath = this.getBasePath()
      const apiUrl = `${basePath}/mock/pan/sydney.json`

      await apiUtil.doGet(apiUrl)

      return {
        success: true,
        url: apiUrl,
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
}

export const trainingService = new TrainingService()

export async function getTrainingData(): Promise<TrainingResponseData> {
  return trainingService.getTrainingData()
}
