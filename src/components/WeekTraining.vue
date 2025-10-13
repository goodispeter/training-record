<template>
  <div class="week-training-container">
    <div v-if="weeklyData.length === 0" class="no-data-message">
      <div class="text-center text-gray-500 py-8">
        <div class="text-4xl mb-4">📊</div>
        <p>暫無週訓練資料</p>
      </div>
    </div>

    <div v-else class="week-cards-grid">
      <div v-for="weekData in weeklyData" :key="weekData.planWeek" class="week-card">
        <!-- 週次標題 -->
        <div class="week-header">
          <h3 class="week-title">第 {{ weekData.planWeek }} 週</h3>
          <p class="week-date-range">
            {{ formatDateRange(weekData.weekStartDate, weekData.weekEndDate) }}
          </p>
        </div>

        <!-- 週統計數據 -->
        <div class="week-stats">
          <div class="stat-item">
            <span class="stat-icon">📏</span>
            <span class="stat-value">{{ formatDistance(weekData.weekDistance) }}</span>
            <span class="stat-unit">km</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⏱️</span>
            <span class="stat-value">{{ formatTime(weekData.weekMovingTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🎯</span>
            <span class="stat-value">{{ weekData.weekMainTrainingCount }}</span>
            <span class="stat-unit">次</span>
          </div>
        </div>

        <!-- 每日訓練展示 -->
        <div class="daily-training-grid">
          <div class="day-headers">
            <div v-for="day in dayHeaders" :key="day" class="day-header">{{ day }}</div>
          </div>
          <div class="week-days-grid">
            <div
              v-for="dayData in getWeekDays(weekData)"
              :key="dayData.date"
              class="day-cell"
              :class="{ 'has-training': getValidTrainings(dayData.trainings).length > 0 }"
            >
              <div class="day-date">{{ dayData.dayOfMonth }}</div>
              <div v-if="getValidTrainings(dayData.trainings).length > 0" class="training-items">
                <div
                  v-for="training in getValidTrainings(dayData.trainings)"
                  :key="training.id"
                  class="training-item"
                  :class="getTrainingTypeClass(training)"
                  @click="openTrainingDetailModal([training])"
                >
                  {{ getSimpleTrainingName(training) }}
                </div>
              </div>
              <div v-else class="no-training">休息</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Training Details -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="modalTitle"
      style="width: 600px; max-width: 90vw"
    >
      <div class="training-list">
        <div v-for="training in selectedTrainings" :key="training.id" class="training-detail-card">
          <div class="flex justify-between items-start">
            <div class="training-info">
              <div class="flex justify-between items-center">
                <h5 class="font-medium">{{ training.name }}</h5>
                <n-tag v-if="training.isMainTraining" type="success" size="small"> 主訓練 </n-tag>
              </div>
              <div
                v-if="training.sportType !== 'WeightTraining' && training.sportType !== 'Yoga'"
                class="text-sm text-gray-600"
                style="margin-top: 4px"
              >
                📏{{ formatDistance(training.distance) }}km ⏱️{{
                  formatTime(training.movingTime)
                }}
                ⚡{{ training.pace }}
                <template v-if="training.averageHeartRate && training.maxHeartRate">
                  ❤️{{ training.averageHeartRate }} 🔥{{ training.maxHeartRate }}
                </template>
              </div>
              <div v-else class="text-sm text-gray-600" style="margin-top: 4px">
                ⏱️{{ formatTime(training.movingTime) }}
              </div>
              <div
                v-if="training.description && training.description.trim()"
                class="training-description-modal"
              >
                {{ training.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NModal, NTag } from 'naive-ui'
import { useTrainingStore } from '@/stores/training'
import type { TrainingRecord, WeeklyTrainingData } from '@/types/training'
import { formatTime, formatDistance } from '@/utils/formatUtil'

const store = useTrainingStore()
const weeklyData = computed(() => store.weeklyData)

// Modal 相關狀態
const showModal = ref(false)
const modalTitle = ref('')
const selectedTrainings = ref<TrainingRecord[]>([])

// 週日期標題
const dayHeaders = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

// 格式化日期範圍
const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const startMonth = start.getMonth() + 1
  const startDay = start.getDate()
  const endMonth = end.getMonth() + 1
  const endDay = end.getDate()

  if (startMonth === endMonth) {
    return `${startMonth}/${startDay} - ${endDay}`
  }
  return `${startMonth}/${startDay} - ${endMonth}/${endDay}`
}

// 格式化訓練日期
const formatTrainingDate = (dateString: string): string => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[date.getDay()]

  return `${month}/${day} (${weekday})`
}

// 生成一週的每日資料
const getWeekDays = (weekData: WeeklyTrainingData) => {
  // 使用本地時間避免時區問題
  const startDateStr = weekData.weekStartDate.split('T')[0] // 只取日期部分
  const [year, month, day] = startDateStr.split('-').map(Number)
  const startDate = new Date(year, month - 1, day) // 本地時間

  const days = []

  // 生成7天的資料 (週一到週日)
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)

    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`

    const dayTrainings = weekData.trainingRecords.filter((record) => {
      const recordDateStr = record.startDate.split('T')[0]
      return recordDateStr === dateString
    })

    days.push({
      date: dateString,
      dayOfMonth: currentDate.getDate(),
      trainings: dayTrainings,
    })
  }

  return days
}

// 獲取簡化的訓練名稱
const getSimpleTrainingName = (training: TrainingRecord): string | null => {
  // 根據 sportType 先判斷特殊類型
  if (training.sportType === 'WeightTraining') {
    return 'WT' // Strength Training
  }
  if (training.sportType === 'Yoga') {
    return 'YG' // Yoga
  }

  // 根據 runType 判斷跑步類型
  switch (training.runType) {
    case 'LR':
      return 'LR' // Long Run
    case 'T':
      return 'TP' // Tempo
    case 'E':
      return 'ER' // Easy Run
    case 'REC':
      return 'ER' // Recovery (歸類到 Easy Run)
    case 'TRAIL':
      return 'TR' // Trail
    case 'RACE':
      return 'RA' // Race
    default:
      // 根據 parentRunType 判斷強度訓練
      if (training.parentRunType === 'INT') {
        return 'IN' // Intensity
      }
      // 其他未分類的訓練不顯示
      return null
  }
}

// 獲取訓練類型的 CSS 類別（用於顏色）
const getTrainingTypeClass = (training: TrainingRecord): string => {
  // 特殊運動類型
  if (training.sportType === 'WeightTraining') {
    return 'weight-training' // 橘色
  }
  if (training.sportType === 'Yoga') {
    return 'yoga-training' // 粉色
  }

  // 跑步類型
  if (training.parentRunType === 'INT') {
    return 'intensity-training' // 紅底
  }
  if (training.runType === 'E' || training.runType === 'REC') {
    return 'easy-training' // 綠色 (Easy Run & Recovery)
  }
  if (training.runType === 'LR') {
    return 'longrun-training' // 藍色
  }
  if (training.runType === 'RACE') {
    return 'race-training' // 紫色
  }
  return 'default-training' // 預設顏色
}

// 過濾出有效的訓練（排除其他類型）
const getValidTrainings = (trainings: TrainingRecord[]): TrainingRecord[] => {
  return trainings.filter((training) => getSimpleTrainingName(training) !== null)
}

// 打開訓練詳情彈窗
const openTrainingDetailModal = (trainings: TrainingRecord[]) => {
  selectedTrainings.value = trainings
  // 使用第一筆訓練記錄的日期作為標題
  if (trainings.length > 0) {
    modalTitle.value = formatTrainingDate(trainings[0].startDate)
  } else {
    modalTitle.value = '訓練記錄'
  }
  showModal.value = true
}
</script>

<style scoped>
.week-training-container {
  padding: 1rem;
}

.no-data-message {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.week-cards-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
}

.week-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s;
}

.week-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.week-header {
  margin-bottom: 1rem;
  text-align: center;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 0.75rem;
}

.week-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.week-date-range {
  font-size: 0.875rem;
  color: #6b7280;
}

.week-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.stat-icon {
  font-size: 1.25rem;
}

.stat-value {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.stat-unit {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 每日訓練網格 */
.daily-training-grid {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.day-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
  padding: 0.5rem;
  background: #f3f4f6;
  border-radius: 0.375rem;
}

.week-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.day-cell {
  min-height: 80px;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.day-cell.has-training {
  background: #f0f9ff;
  border-color: #3b82f6;
}

.day-date {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
  margin-bottom: 0.25rem;
}

.training-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.training-item {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  color: white;
  border-radius: 0.25rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

/* 預設訓練樣式 */
.training-item.default-training {
  background: #3b82f6;
}

.training-item.default-training:hover {
  background: #2563eb;
}

/* 強度訓練 - 紅底 */
.training-item.intensity-training {
  background: #dc2626;
}

.training-item.intensity-training:hover {
  background: #b91c1c;
}

/* 輕鬆跑/恢復跑 - 綠底 */
.training-item.easy-training {
  background: #16a34a;
}

.training-item.easy-training:hover {
  background: #15803d;
}

/* 長跑 - 藍底 */
.training-item.longrun-training {
  background: #3b82f6;
}

.training-item.longrun-training:hover {
  background: #2563eb;
}

/* 重量訓練 - 橘色 */
.training-item.weight-training {
  background: #f59e0b;
}

.training-item.weight-training:hover {
  background: #d48906;
}

/* 瑜珈 - 粉色 */
.training-item.yoga-training {
  background: #ec4899;
}

.training-item.yoga-training:hover {
  background: #db2777;
}

/* 賽事 - 紫色 */
.training-item.race-training {
  background: #8b5cf6;
}

.training-item.race-training:hover {
  background: #7c3aed;
}

.no-training {
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Modal 相關樣式 */
.training-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.training-detail-card {
  background-color: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.training-info {
  flex: 1;
}

.training-description-modal {
  margin-top: 8px;
  padding: 8px;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.4;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .week-cards-grid {
    grid-template-columns: 1fr;
  }

  .week-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .week-card {
    padding: 1rem;
  }

  .day-cell {
    min-height: 60px;
  }

  .training-item {
    font-size: 0.7rem;
    padding: 0.2rem 0.3rem;
  }
}
</style>
