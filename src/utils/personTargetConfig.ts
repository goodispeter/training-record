// 人員和目標的設定檔
export interface PersonConfig {
  displayName: string
  emoji: string
  years: string[]
  targets: Record<string, string[]> // year -> targets[]
}

export interface TargetConfig {
  displayName: string
  link?: string
}

// 人員設定
export const PERSON_CONFIG: Record<string, PersonConfig> = {
  pan: {
    displayName: 'Pan',
    emoji: '👨',
    years: ['2025'],
    targets: {
      '2025': ['taipei', 'sydney'],
    },
  },
  sung: {
    displayName: 'Sung',
    emoji: '👩',
    years: ['2025'],
    targets: {
      '2025': ['taipei'],
    },
  },
}

// 目標設定
export const TARGET_CONFIG: Record<string, TargetConfig> = {
  taipei: {
    displayName: '2025 臺北馬拉松',
  },
  sydney: {
    displayName: '2025 雪梨馬拉松',
    link: 'https://www.instagram.com/p/DOTegmfE5CU/?igsh=MWd6bzlsbDV3ZXBrag==',
  },
}

// 輔助函數：取得人員在指定年份的可用目標
export const getAvailableTargets = (person: string, year: string): string[] => {
  return PERSON_CONFIG[person]?.targets[year] || []
}

// 輔助函數：取得人員的可用年份
export const getAvailableYears = (person: string): string[] => {
  return PERSON_CONFIG[person]?.years || []
}

// 輔助函數：取得目標顯示名稱
export const getTargetDisplayName = (target: string): string => {
  const config = TARGET_CONFIG[target]
  return config ? ` ${config.displayName}` : target
}

// 輔助函數：取得人員顯示名稱
export const getPersonDisplayName = (person: string): string => {
  return PERSON_CONFIG[person]?.displayName || person
}

// 輔助函數：檢查人員在指定年份是否有某個目標
export const hasTarget = (person: string, year: string, target: string): boolean => {
  return getAvailableTargets(person, year).includes(target)
}
