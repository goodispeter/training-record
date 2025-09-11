// 人員和目標的設定檔
export interface PersonConfig {
  displayName: string
  emoji: string
  targets: string[]
}

export interface TargetConfig {
  displayName: string
  emoji: string
}

// 人員設定
export const PERSON_CONFIG: Record<string, PersonConfig> = {
  pan: {
    displayName: 'Pan',
    emoji: '👨',
    targets: ['taipei', 'sydney'],
  },
  sung: {
    displayName: 'Sung',
    emoji: '👩',
    targets: ['taipei'],
  },
}

// 目標設定
export const TARGET_CONFIG: Record<string, TargetConfig> = {
  taipei: {
    displayName: '2025 臺北馬拉松',
    emoji: '🐯',
  },
  sydney: {
    displayName: '2025 雪梨馬拉松',
    emoji: '🐨',
  },
}

// 輔助函數：取得人員的可用目標
export const getAvailableTargets = (person: string): string[] => {
  return PERSON_CONFIG[person]?.targets || []
}

// 輔助函數：取得目標顯示名稱
export const getTargetDisplayName = (target: string): string => {
  const config = TARGET_CONFIG[target]
  return config ? `${config.emoji} ${config.displayName}` : target
}

// 輔助函數：取得人員顯示名稱
export const getPersonDisplayName = (person: string): string => {
  return PERSON_CONFIG[person]?.displayName || person
}

// 輔助函數：檢查人員是否有某個目標
export const hasTarget = (person: string, target: string): boolean => {
  return getAvailableTargets(person).includes(target)
}
