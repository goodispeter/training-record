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
    // 在開發環境中，使用正確的基礎路徑
    if (import.meta.env.DEV) {
      return '/training-record'
    }

    // 在生產環境中，確保使用正確的基礎路徑
    // GitHub Pages 會將檔案放在 /training-record/ 下
    return '/training-record'
  }

  /**
   * 從指定的 JSON 檔案取得訓練資料
   * @param person - 人員名稱 (例如: pan, sung)
   * @param target - 目標資料來源 (例如: sydney, taipei, tpe)
   * @returns Promise<TrainingResponseData>
   */
  async getTrainingData(
    person: string = 'pan',
    target: string = 'taipei',
  ): Promise<TrainingResponseData> {
    try {
      const basePath = this.getBasePath()
      const apiUrl = `${basePath}/mock/${person}/${target}.json`

      // 直接用 fetch 替代 apiUtil
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result) {
        throw new Error('API returned null or undefined result')
      }

      if (!result.data) {
        throw new Error('API result does not contain data property')
      }

      const transformedData: TrainingResponseData = {
        target: result.data.target,
        totalDistance: result.data.totalDistance,
        totalMovingTime: result.data.totalMovingTime,
        mainTrainingCount: result.data.mainTrainingCount,
        totalElevationGain: result.data.totalElevationGain,
        monthlyData: result.data.monthlyTrainingRecords,
      }
      return transformedData
    } catch (error) {
      throw error
    }
  }

  async testApiPath(
    person: string = 'pan',
    target: string = 'taipei',
  ): Promise<{ success: boolean; url: string; error?: string }> {
    try {
      const basePath = this.getBasePath()
      const apiUrl = `${basePath}/mock/${person}/${target}.json`

      await apiUtil.doGet(apiUrl)

      return {
        success: true,
        url: apiUrl,
      }
    } catch (error) {
      const basePath = this.getBasePath()
      const apiUrl = `${basePath}/mock/${person}/${target}.json`

      return {
        success: false,
        url: apiUrl,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

export const trainingService = new TrainingService()

export async function getTrainingData(
  person?: string,
  target?: string,
): Promise<TrainingResponseData> {
  return trainingService.getTrainingData(person, target)
}
