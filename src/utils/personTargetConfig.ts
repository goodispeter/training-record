// 人員和目標的設定檔
export interface PersonConfig {
  displayName: string
  emoji: string
  targets: string[] // 直接存放目標陣列（如 2025taipei, 2025sydney）
  raceLinks?: Record<string, string> // target -> link
  raceTime?: Record<string, string> // target -> time
}

export interface TargetConfig {
  displayName: string
  raceDate: string
  link?: string
}

// 人員設定
export const PERSON_CONFIG: Record<string, PersonConfig> = {
  pan: {
    displayName: 'Pan',
    emoji: '👨',
    targets: ['2025taipei', '2025sydney'],
    raceLinks: {
      '2025sydney': 'https://www.instagram.com/p/DOTegmfE5CU/?igsh=MWd6bzlsbDV3ZXBrag==',
    },
    raceTime: {
      '2025sydney': '3:19:47',
    },
  },
  sung: {
    displayName: 'Sung',
    emoji: '👩',
    targets: ['2025taipei'],
    raceLinks: {},
  },
}

// 目標設定
export const TARGET_CONFIG: Record<string, TargetConfig> = {
  '2025taipei': {
    displayName: '2025 臺北馬拉松',
    raceDate: '2025-12-21T06:30:00',
  },
  '2025sydney': {
    displayName: '2025 雪梨馬拉松',
    raceDate: '2025-08-31T04:30:00',
  },
}

// 輔助函數：取得人員的可用目標
export const getAvailableTargets = (person: string): string[] => {
  return PERSON_CONFIG[person]?.targets || []
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

// 輔助函數：檢查人員是否有某個目標
export const hasTarget = (person: string, target: string): boolean => {
  return getAvailableTargets(person).includes(target)
}

// 輔助函數：取得個人的賽事連結
export const getPersonRaceLink = (person: string, target: string): string | undefined => {
  return PERSON_CONFIG[person]?.raceLinks?.[target]
}

// 輔助函數：取得賽事日期
export const getRaceDate = (target: string): string | undefined => {
  return TARGET_CONFIG[target]?.raceDate
}

// 輔助函數：取得個人完賽時間
export const getPersonRaceTime = (person: string, target: string): string | undefined => {
  return PERSON_CONFIG[person]?.raceTime?.[target]
}
