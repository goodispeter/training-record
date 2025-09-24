// 訓練記錄相關型別定義
export interface TrainingRecord {
  id: number
  name: string
  planWeek: number
  startDate: string
  sportType: string
  runType: string
  parentRunType: string
  distance: number
  movingTime: string
  elevationGain: number
  pace: string
  averageHeartRate: number | null
  maxHeartRate: number | null
  isMainTraining: boolean
  description: string
}

export interface MonthlyTrainingData {
  year: number
  month: number
  monthDistance: number
  monthMovingTime: string
  monthMainTrainingCount: number
  monthElevationGain: number
  trainingRecords: TrainingRecord[]
}

export interface TrainingResponseData {
  target: string
  totalDistance: number
  totalMovingTime: string
  mainTrainingCount: number
  totalElevationGain: number
  monthlyData: MonthlyTrainingData[]
}

// API 回應格式
export interface TrainingApiResponse {
  code: string
  message: string
  success: boolean
  data: TrainingResponseData
}

// Store 中使用的總結介面
export interface TrainingSummary {
  totalDistance: number
  totalMovingTime: string
  mainTrainingCount: number
  totalElevationGain: number
}

// 圖表資料格式
export interface ChartDataPoint {
  date: string
  distance: number
}
