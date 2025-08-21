// 訓練類型定義
export interface RunType {
  code: string
  name: string
  chineseName: string
  parent?: RunType
}

// 強度訓練
export const Intensity: RunType = { code: 'INT', name: 'Intensity', chineseName: '強度訓練' }

// 強度訓練子類型
export const ProgressionRun: RunType = {
  code: 'PROG',
  name: 'Progression Run',
  chineseName: '漸速跑',
  parent: Intensity,
}
export const SlopeTrain: RunType = {
  code: 'Slope',
  name: 'Slope Train',
  chineseName: '坡度訓練',
  parent: Intensity,
}
export const Fartlek: RunType = {
  code: 'FARTLEK',
  name: 'Fartlek',
  chineseName: '法特雷克',
  parent: Intensity,
}
export const IntervalShort: RunType = {
  code: 'I-S',
  name: 'Interval Short',
  chineseName: '短間歇',
  parent: Intensity,
}
export const IntervalLong: RunType = {
  code: 'I-L',
  name: 'Interval Long',
  chineseName: '長間歇',
  parent: Intensity,
}
export const Pyramid: RunType = {
  code: 'PYRAMID',
  name: 'Pyramid Intervals',
  chineseName: '金字塔',
  parent: Intensity,
}
export const Tempo: RunType = { code: 'T', name: 'Tempo', chineseName: '節奏跑', parent: Intensity }

// 慢跑
export const SlowWork: RunType = { code: 'SW', name: 'Slow', chineseName: '慢跑' }

// 慢跑子類型
export const EasyRun: RunType = {
  code: 'E',
  name: 'Easy Run',
  chineseName: '輕鬆跑',
  parent: SlowWork,
}
export const RecoveryRun: RunType = {
  code: 'REC',
  name: 'Recovery Run',
  chineseName: '恢復跑',
  parent: SlowWork,
}

// 其他訓練類型
export const LongRun: RunType = { code: 'LR', name: 'Long Run', chineseName: '長距離' }
export const Race: RunType = { code: 'RACE', name: 'Race', chineseName: '賽事' }
export const Trail: RunType = { code: 'TRAIL', name: 'Trail', chineseName: '越野跑' }

// 強度訓練子類型陣列
export const INTENSITY_SUB_TYPES: RunType[] = [
  ProgressionRun,
  SlopeTrain,
  Fartlek,
  IntervalShort,
  IntervalLong,
  Pyramid,
  Tempo,
]

// 所有訓練類型陣列
export const ALL_RUN_TYPES: RunType[] = [
  Intensity,
  ProgressionRun,
  SlopeTrain,
  Fartlek,
  IntervalShort,
  IntervalLong,
  Pyramid,
  Tempo,
  SlowWork,
  EasyRun,
  RecoveryRun,
  LongRun,
  Race,
  Trail,
]

// 主要分類（父類別）
export const MAIN_CATEGORIES: RunType[] = [Intensity, SlowWork, LongRun, Race, Trail]

// 根據訓練名稱匹配訓練類型
export function matchTrainingType(trainingName: string): RunType[] {
  const matches: RunType[] = []
  const lowerName = trainingName.toLowerCase()

  // 優先檢查特定關鍵字匹配，避免部分字符誤匹配
  const priorityMatches: { keyword: string; type: RunType }[] = [
    { keyword: 'tempo', type: Tempo },
    { keyword: 'easy run', type: EasyRun },
    { keyword: 'long run', type: LongRun },
    { keyword: 'recovery', type: RecoveryRun },
    { keyword: '越野跑', type: Trail },
    { keyword: '恢復', type: RecoveryRun },
    { keyword: '賽事', type: Race },
    { keyword: '漸速跑', type: ProgressionRun },
    { keyword: '坡度訓練', type: SlopeTrain },
    { keyword: '法特雷克', type: Fartlek },
    { keyword: '短間歇', type: IntervalShort },
    { keyword: '長間歇', type: IntervalLong },
    { keyword: '金字塔', type: Pyramid },
  ]

  // 先檢查優先關鍵字
  for (const { keyword, type } of priorityMatches) {
    if (lowerName.includes(keyword.toLowerCase())) {
      matches.push(type)
    }
  }

  // 如果已經找到優先匹配，直接返回
  if (matches.length > 0) {
    return matches
  }

  // 否則進行常規匹配
  for (const runType of ALL_RUN_TYPES) {
    // 檢查英文名稱和代碼
    if (
      lowerName.includes(runType.name.toLowerCase()) ||
      lowerName.includes(runType.code.toLowerCase())
    ) {
      matches.push(runType)
    }
  }

  return matches
}

// 獲取訓練類型的顯示文字
export function getTrainingTypeDisplay(trainingName: string): string {
  const matches = matchTrainingType(trainingName)
  if (matches.length === 0) return '其他'

  // 優先顯示最具體的類型（有父類別的）
  const specificType = matches.find((type) => type.parent) || matches[0]
  return specificType.chineseName
}
