<template>
  <div class="race-countdown">
    <div class="countdown-wrapper" :style="{ background: backgroundGradient }">
      <!-- 主要內容 -->
      <div class="countdown-content">
        <!-- 狀態標籤 -->
        <div class="status-container">
          <div class="status-badge" :class="statusStyle.class">
            <span class="status-icon" v-html="statusStyle.icon"></span>
            <span class="status-text">{{ statusStyle.text }}</span>
          </div>
        </div>

        <!-- 統一固定高度的顯示區域 -->
        <div class="unified-display-area">
          <!-- 第一行：時間顯示區域 (所有狀態都佔用相同空間) -->
          <div class="time-row">
            <!-- 完賽狀態：顯示完賽時間 -->
            <div v-if="trainingPhase === 'finished'" class="finished-time-container">
              <div
                class="finished-time-display"
                :class="{ clickable: raceLink }"
                @click="handleFinishedClick"
              >
                <div v-if="raceTime">
                  <div class="race-time">{{ raceTime }}</div>
                </div>
                <div v-else class="race-time">0:00:00</div>
              </div>
            </div>

            <!-- 比賽日 -->
            <div v-else-if="trainingPhase === 'raceday'" class="race-day-container">
              <div class="race-day-message">這期間吃的苦，今天就要兌現</div>
            </div>

            <!-- 正常狀態：日:時:分:秒 佈局 -->
            <template v-else>
              <!-- 日 -->
              <div class="time-unit-container">
                <div class="time-unit">
                  <div class="time-number">{{ timeLeft.days }}</div>
                  <div class="time-label">日</div>
                </div>
              </div>

              <!-- 分隔符 -->
              <div class="separator-container">
                <div class="time-separator">:</div>
              </div>

              <!-- 時 -->
              <div class="time-unit-container">
                <div class="time-unit">
                  <div class="time-number">{{ String(timeLeft.hours).padStart(2, '0') }}</div>
                  <div class="time-label">時</div>
                </div>
              </div>

              <!-- 分隔符 -->
              <div class="separator-container">
                <div class="time-separator">:</div>
              </div>

              <!-- 分 -->
              <div class="time-unit-container">
                <div class="time-unit">
                  <div class="time-number">{{ String(timeLeft.minutes).padStart(2, '0') }}</div>
                  <div class="time-label">分</div>
                </div>
              </div>

              <!-- 分隔符 -->
              <div class="separator-container">
                <div class="time-separator">:</div>
              </div>

              <!-- 秒 -->
              <div class="time-unit-container">
                <div class="time-unit">
                  <div class="time-number">{{ String(timeLeft.seconds).padStart(2, '0') }}</div>
                  <div class="time-label">秒</div>
                </div>
              </div>
            </template>
          </div>

          <!-- 第二行：進度條或提示區域 -->
          <div class="progress-row">
            <div
              v-if="trainingPhase === 'finished'"
              class="finished-hint"
              :class="{ clickable: raceLink }"
              @click="handleFinishedClick"
            >
              {{ raceLink ? '點擊觀看完賽心得' : '完賽' }}
            </div>
            <div v-else-if="trainingPhase === 'raceday'" class="race-day-hint">
              不試試看，哪來勝算
              <img src="/pic/nike.png" alt="Nike" class="nike-icon" />
            </div>
            <div v-else-if="trainingPhase === 'prerace'" class="race-day-hint">
              不試試看，哪來勝算
              <img src="/pic/nike.png" alt="Nike" class="nike-icon" />
            </div>
            <div v-else class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPersonRaceLink, getPersonRaceTime } from '@/utils/personTargetConfig'

interface Props {
  raceDate: string
}

const props = defineProps<Props>()
const route = useRoute()
const currentTime = ref(new Date())
let timer: number | null = null

// 計算剩餘時間
const timeLeft = computed(() => {
  const now = currentTime.value
  const race = new Date(props.raceDate)
  const diff = race.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
})

// 判斷比賽狀態
const isRaceFinished = computed(() => {
  const now = currentTime.value
  const race = new Date(props.raceDate)
  return now > race
})

const isRaceDay = computed(() => {
  const now = currentTime.value
  const race = new Date(props.raceDate)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const raceDay = new Date(race.getFullYear(), race.getMonth(), race.getDate())
  return today.getTime() === raceDay.getTime()
})

// 訓練階段
const trainingPhase = computed(() => {
  // 優先檢查是否已完賽（時間已過）
  if (isRaceFinished.value) return 'finished'
  // 再檢查是否是比賽日當天
  if (isRaceDay.value) return 'raceday'

  const days = timeLeft.value.days
  if (days === 1) return 'prerace' // 賽前一日
  if (days <= 14) return 'taper'
  if (days <= 21) return 'final'
  return 'training'
})

// 取得當前路由的 person 和 target
const currentPerson = computed(() => route.params.person as string)
const currentTarget = computed(() => route.params.target as string)

// 取得賽事連結
const raceLink = computed(() => {
  if (!isRaceFinished.value) return null
  return getPersonRaceLink(currentPerson.value, currentTarget.value)
})

// 取得完賽時間
const raceTime = computed(() => {
  if (!isRaceFinished.value) return null
  return getPersonRaceTime(currentPerson.value, currentTarget.value)
})

// 處理完賽旗子點擊
const handleFinishedClick = () => {
  if (isRaceFinished.value && raceLink.value) {
    window.open(raceLink.value, '_blank')
  }
}

// 狀態樣式配置
const statusStyle = computed(() => {
  const styles = {
    training: {
      text: '穩定訓練中',
      icon: '💪',
      class: 'status-training',
    },
    final: {
      text: '最後衝刺',
      icon: '🔥',
      class: 'status-final',
    },
    taper: {
      text: '賽前乖乖減量！',
      icon: '🧘‍♂️',
      class: 'status-taper',
    },
    prerace: {
      text: '賽前一日',
      icon: '⚡',
      class: 'status-prerace',
    },
    raceday: {
      text: '比賽日！',
      icon: '🏃‍♂️',
      class: 'status-raceday',
    },
    finished: {
      text: '完賽時間',
      icon: '🏆',
      class: 'status-finished',
    },
  }
  return styles[trainingPhase.value]
})

// 背景顏色（根據階段變化）
const backgroundGradient = computed(() => {
  switch (trainingPhase.value) {
    case 'training':
      return 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' // 藍紫
    case 'final':
      return 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)' // 橘黃
    case 'taper':
      return 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)' // 綠
    case 'prerace':
      return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' // 紅（與比賽日相同）
    case 'raceday':
      return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' // 紅
    case 'finished':
      return 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)' // 金
    default:
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
})

// 進度百分比 (假設訓練期為3個月)
const progressPercentage = computed(() => {
  const totalDays = 90
  const remainingDays = timeLeft.value.days
  return Math.max(0, Math.min(100, ((totalDays - remainingDays) / totalDays) * 100))
})

const updateTime = () => {
  currentTime.value = new Date()
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer)
  }
})
</script>

<style scoped>
.race-countdown {
  width: 100%;
  margin-bottom: 1.5rem;
  max-width: 100%;
  overflow: hidden;
}

.countdown-wrapper {
  position: relative;
  border-radius: 16px;
  padding: 1.5rem;
  overflow: hidden;
  transition: background 1s ease-in-out; /* 背景顏色平滑切換 */
}

/* 主要內容 */
.countdown-content {
  position: relative;
  z-index: 1;
  color: white;
}

/* 狀態標籤 */
.status-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  min-width: 160px;
  text-align: center;
}

.status-training {
  background: rgba(59, 130, 246, 0.3);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.status-final {
  background: rgba(249, 115, 22, 0.3);
  box-shadow: 0 8px 25px rgba(249, 115, 22, 0.3);
}

.status-taper {
  background: rgba(34, 197, 94, 0.3);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
}

.status-prerace {
  background: rgba(239, 68, 68, 0.3);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
  animation: pulse-glow 2s infinite;
}

.status-raceday {
  background: rgba(239, 68, 68, 0.3);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
  animation: pulse-glow 2s infinite;
}

.status-finished {
  background: rgba(107, 114, 128, 0.3);
  box-shadow: 0 8px 25px rgba(107, 114, 128, 0.3);
}

@keyframes pulse-glow {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 35px rgba(239, 68, 68, 0.5);
  }
}

.status-icon {
  font-size: 1.2rem;
}

/* 統一顯示區域 */
.unified-display-area {
  display: flex;
  flex-direction: column;
  height: 140px; /* 嚴格固定高度 */
  justify-content: space-between;
}

.time-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px; /* 固定高度 */
  gap: 1.25rem;
}

.progress-row {
  height: 20px; /* 固定高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-unit-container {
  flex: 0 0 auto;
}

.finished-time-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.finished-time-display {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 80px;
  transition: transform 0.3s ease;
}

.finished-time-display.clickable {
  cursor: pointer;
}

.finished-time-display.clickable:hover {
  transform: translateY(-2px) scale(1.05);
}

.finished-time-display.clickable:active {
  transform: translateY(0) scale(0.98);
}

.race-time-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.race-time {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: white;
}

@keyframes finished-glow {
  0%,
  100% {
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  }
  50% {
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
  }
}

/* 保留旗子樣式作為後備 */
.time-unit.finished-flag {
  background: transparent;
  border: none;
  backdrop-filter: none;
}

.race-day-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.time-unit.race-day-unit {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  animation: race-day-pulse 2s infinite;
}

@keyframes race-day-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
  }
}

@keyframes race-day-glow {
  0%,
  100% {
    text-shadow:
      0 0 10px rgba(255, 215, 0, 0.3),
      0 0 20px rgba(255, 215, 0, 0.2),
      0 0 30px rgba(255, 215, 0, 0.1);
  }
  50% {
    text-shadow:
      0 0 20px rgba(255, 215, 0, 0.6),
      0 0 30px rgba(255, 215, 0, 0.4),
      0 0 40px rgba(255, 215, 0, 0.2);
  }
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.separator-container {
  flex: 0 0 auto;
  width: 1rem; /* 更窄的分隔符 */
  display: flex;
  justify-content: center;
}

.time-unit {
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 0.8rem 0.3rem;
  min-width: 55px;
  width: 55px; /* 更窄以適應四個單位 */
  height: 75px; /* 稍微降低高度 */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.time-unit.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-unit.clickable:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
}

/* 完賽旗子的hover效果 - 覆蓋默認樣式 */
.time-unit.finished-flag.clickable:hover {
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  transform: translateY(-2px) scale(1.1);
}

.time-unit.clickable:active {
  transform: translateY(0) scale(0.98);
}

/* 完賽旗子的active效果 */
.time-unit.finished-flag.clickable:active {
  transform: translateY(0) scale(1.05);
}

.time-unit:hover {
  transform: translateY(-5px);
}

.time-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.2rem;
  background: linear-gradient(45deg, #ffffff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 旗子emoji特殊樣式 */
.finished-flag .time-number {
  background: none;
  -webkit-background-clip: unset;
  -webkit-text-fill-color: unset;
  background-clip: unset;
  color: inherit; /* 使用原始emoji顏色 */
}

.time-label {
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.9;
  letter-spacing: 0.5px;
}

.time-separator {
  font-size: 2rem;
  font-weight: 300;
  opacity: 0.7;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 0.7;
  }
  51%,
  100% {
    opacity: 0.3;
  }
}

/* 完成狀態已整合到統一結構中 */

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.finished-text {
  font-size: 2rem;
  font-weight: 600;
  opacity: 0.9;
}

/* 進度條 */
.progress-container {
  width: 100%;
  height: 6px; /* 固定高度 */
  transition: opacity 0.3s ease;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  width: 100%;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffffff, #e0e7ff);
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* 完賽提示 */
.finished-hint {
  text-align: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  letter-spacing: 0.5px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.finished-hint.clickable {
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
}

.finished-hint.clickable:hover {
  color: white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.race-day-message {
  font-size: 1.6rem;
  font-weight: 900;
  text-align: center;
  font-family: 'Bebas Neue', 'Impact', sans-serif;
  letter-spacing: 2px;

  /* 💫 顏色漸層動畫 */
  background: linear-gradient(90deg, #fff, #ffe600, #ff8000, #fff);
  background-size: 200% 200%;
  background-clip: text; /* ✅ 標準屬性 */
  -webkit-background-clip: text; /* ✅ WebKit 兼容 */
  -webkit-text-fill-color: transparent;

  /* 🔥 動畫與閃爍效果 */
  animation:
    gradient-shift 2s linear infinite,
    flicker 3s infinite;

  /* ✨ 光暈陰影 */
  text-shadow:
    0 0 8px rgba(255, 200, 50, 0.4),
    0 0 15px rgba(255, 160, 0, 0.3);
}

/* 顏色流動 */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 閃爍特效 */
@keyframes flicker {
  0%,
  19%,
  21%,
  23%,
  25%,
  54%,
  56%,
  100% {
    opacity: 1;
    filter: brightness(1);
  }
  20%,
  24%,
  50% {
    opacity: 0.6;
    filter: brightness(1.4);
  }
}

/* 比賽日提示樣式 */
.race-day-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  height: 20px;
}

.nike-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1); /* 將圖標變成白色 */
  opacity: 0.9;
  transition: all 0.3s ease;
}
</style>
