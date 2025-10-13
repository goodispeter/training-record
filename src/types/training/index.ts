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
  weeklyTrainingRecords?: WeeklyTrainingData[]
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

// 週訓練資料介面
export interface WeeklyTrainingData {
  planWeek: number
  weekStartDate: string
  weekEndDate: string
  weekDistance: number
  weekMovingTime: string
  weekMainTrainingCount: number
  weekElevationGain: number
  trainingRecords: TrainingRecord[]
}

// 週訓練類型統計介面
export interface WeeklyTrainingTypeStats {
  longRun: number // 長跑 (LR)
  tempo: number // 節奏跑 (T)
  intensity: number // 強度訓練 (INT)
  recovery: number // 恢復跑 (REC)
  weightTraining: number // 重量訓練
  trail: number // 越野跑 (TRAIL)
  race: number // 賽事 (RACE)
  yoga: number // 瑜珈
  other: number // 其他
}
