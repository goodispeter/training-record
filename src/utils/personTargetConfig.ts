// 人員和目標的設定檔
export interface PersonConfig {
  displayName: string
  emoji: string
  nickName?: string | null
  targets: string[] // 直接存放目標陣列（如 2025taipei, 2025sydney）
  raceLinks?: Record<string, string> // target -> link
  raceTime?: Record<string, string> // target -> time
  pics?: Record<string, string[]> // target -> 背景圖片陣列（用於幻燈片）
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
    targets: ['2026tokyo', '2025taipei', '2025sydney'],
    raceLinks: {
      '2025sydney': 'https://www.instagram.com/p/DOTegmfE5CU/?igsh=MWd6bzlsbDV3ZXBrag==',
      '2025taipei': 'https://www.instagram.com/p/DTDFKPuk4YM/?igsh=ZXo5OGw4YmFmdzVw',
      '2026tokyo': 'https://www.instagram.com/p/DVn-PXAE0uC/?igsh=d3M4cTZ5b3Bia2lu',
    },
    raceTime: {
      '2025taipei': '3:34:12',
      '2025sydney': '3:19:47',
      '2026tokyo': '3:10:06',
    },
    pics: {
      '2026tokyo': [
        '/training-record/pic/pan3.jpg',
        '/training-record/pic/pan4.jpg',
        '/training-record/pic/together1.jpg',
        '/training-record/pic/together2.jpg',
      ],
      '2025taipei': ['/training-record/pic/pan2.jpg'],
      '2025sydney': ['/training-record/pic/pan1.jpg'],
    },
  },
  sung: {
    displayName: 'Sung',
    emoji: '👩',
    targets: ['2026wanginshi', '2025taipei'],
    raceLinks: {
      '2025taipei': 'https://www.instagram.com/p/DSwlD30Ei5c/?igsh=MTRmd2lzdXRoNXQ2Zg==',
    },
    raceTime: {
      '2025taipei': '3:34:15',
    },
    pics: {
      '2026wanginshi': [
        '/training-record/pic/sung7.jpg',
        '/training-record/pic/together1.jpg',
        '/training-record/pic/together2.jpg',
      ],
      '2025taipei': [
        '/training-record/pic/sung1.jpg',
        '/training-record/pic/sung2.jpg',
        '/training-record/pic/sung3.jpg',
        '/training-record/pic/sung4.jpg',
        '/training-record/pic/sung5.jpg',
        '/training-record/pic/sung6.jpg',
      ],
    },
  },
}

// 目標設定
export const TARGET_CONFIG: Record<string, TargetConfig> = {
  '2025taipei': {
    displayName: '2025 臺北',
    raceDate: '2025-12-21T06:30:00',
  },
  '2025sydney': {
    displayName: '2025 雪梨',
    raceDate: '2025-08-31T04:30:00',
  },
  '2026tokyo': {
    displayName: '2026 東京',
    raceDate: '2026-03-01T08:10:00',
  },
  '2026wanginshi': {
    displayName: '2026 萬金石',
    raceDate: '2026-03-15T06:00:00',
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

// 輔助函數：取得個人暱稱
export const getPersonNickName = (person: string): string | undefined => {
  return PERSON_CONFIG[person]?.nickName || undefined
}

// 輔助函數：取得個人背景圖片
export const getPersonPics = (person: string, target: string): string[] | undefined => {
  return PERSON_CONFIG[person]?.pics?.[target]
}
