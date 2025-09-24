const formatTime = (timeString: string): string => {
  // 處理 HH:MM:SS 格式
  if (timeString.startsWith('00:')) {
    return timeString.substring(3) // 移除前面的 "00:"
  }
  return timeString
}

const formatDistance = (distance: number): string => {
  return distance.toFixed(1)
}
export { formatTime, formatDistance }
