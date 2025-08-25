// 訓練類型代碼對應中文名稱映射
export const RUN_TYPE_NAMES: Record<string, string> = {
  // 具體訓練類型
  PROG: '漸速跑',
  Slope: '坡度訓練',
  FARTLEK: '法特雷克',
  'I-S': '短間歇',
  'I-L': '長間歇',
  PYRAMID: '金字塔',
  T: '節奏跑',
  E: '輕鬆跑',
  REC: '恢復跑',
  LR: '長距離',
  RACE: '賽事',
  TRAIL: '越野跑',
}

// 父類別代碼對應中文名稱映射
export const PARENT_RUN_TYPE_NAMES: Record<string, string> = {
  INT: '強度訓練',
  SW: '慢跑',
}

// 根據 runType 代碼獲取中文名稱
export function getRunTypeName(runType: string | null): string {
  if (!runType) return '其他'
  return RUN_TYPE_NAMES[runType] || '其他'
}

// 根據 parentRunType 代碼獲取中文名稱
export function getParentRunTypeName(parentRunType: string | null): string {
  if (!parentRunType) return ''
  return PARENT_RUN_TYPE_NAMES[parentRunType] || ''
}
