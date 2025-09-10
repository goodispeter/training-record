import axios from 'axios'
import type { AxiosResponse } from 'axios'

/**
 * 通用 API 工具類
 * 提供基礎的 HTTP 請求方法
 */
class ApiUtil {
  private baseURL: string

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  /**
   * GET 請求
   * @param url 請求 URL
   * @param classType 回應資料的類別類型 (可選)
   * @returns Promise<T>
   */
  async doGet<T = any>(url: string, classType?: new () => T): Promise<T> {
    try {
      const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url
      const response: AxiosResponse<T> = await axios.get(fullUrl)

      // 如果提供了 classType，可以在這裡進行類型轉換或驗證
      if (classType) {
        // 這裡可以加入類型驗證邏輯
        return response.data
      }

      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * 未來可以擴展其他 HTTP 方法
   */

  // async doPost<T = any>(url: string, data: any, classType?: new () => T): Promise<T> {
  //   // 未來實作
  // }

  // async doPut<T = any>(url: string, data: any, classType?: new () => T): Promise<T> {
  //   // 未來實作
  // }

  // async doDelete<T = any>(url: string, classType?: new () => T): Promise<T> {
  //   // 未來實作
  // }
}

// 建立單例實例
export const apiUtil = new ApiUtil()

// 也可以建立帶有 baseURL 的實例
export const createApiUtil = (baseURL: string) => new ApiUtil(baseURL)
