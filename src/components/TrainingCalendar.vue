<template>
  <div class="chart-container">
    <h3 class="text-lg font-semibold mb-4">訓練日曆</h3>

    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="calendar-nav">
        <button class="calendar-nav-btn" @click="previousMonth">‹</button>
        <span class="calendar-title">{{ currentMonthYear }}</span>
        <button class="calendar-nav-btn" @click="nextMonth">›</button>
      </div>
      <button class="calendar-nav-btn" @click="goToToday">今日</button>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Day Headers -->
      <div v-for="day in dayHeaders" :key="day" class="day-header">
        {{ day }}
      </div>

      <!-- Calendar Days -->
      <div
        v-for="date in calendarDays"
        :key="date.dateString"
        :class="getDayCellClass(date)"
        class="day-cell"
        @click="selectDate(date)"
      >
        <div class="day-number">{{ date.day }}</div>
        <div v-if="date.trainings.length > 0" class="training-indicators">
          <div
            v-for="training in date.trainings"
            :key="training.id"
            :class="['training-dot', { 'main-training-dot': training.isMainTraining }]"
          ></div>
        </div>
        <div v-if="date.trainings.length > 0" class="training-summary">
          {{ date.trainings.length }}次 {{ getTotalDistance(date.trainings) }}km
        </div>
      </div>
    </div>

    <!-- Modal for Selected Date Details -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="selectedDateString"
      style="width: 600px; max-width: 90vw"
    >
      <div v-if="selectedDateTrainings.length > 0" class="training-list">
        <div
          v-for="training in selectedDateTrainings"
          :key="training.id"
          class="training-detail-card"
        >
          <div class="flex justify-between items-start">
            <div class="training-info">
              <h5 class="font-medium">{{ training.name }}</h5>
              <div class="text-sm text-gray-600" style="margin-top: 4px">
                距離: {{ training.distance }}km | 時間: {{ training.movingTime }} | 配速:
                {{ training.pace }}
              </div>
              <div
                v-if="training.description && training.description.trim()"
                class="training-description-modal"
              >
                {{ training.description }}
              </div>
            </div>
            <n-tag :type="training.isMainTraining ? 'success' : 'default'" size="small">
              {{ training.isMainTraining ? '主訓練' : '輕鬆跑' }}
            </n-tag>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-4">此日期沒有訓練記錄</div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NTag, NModal } from 'naive-ui'
import type { TrainingRecord } from '@/types/training'

interface Props {
  records: TrainingRecord[]
}

const props = defineProps<Props>()

interface CalendarDay {
  day: number
  date: Date
  dateString: string
  isCurrentMonth: boolean
  isToday: boolean
  trainings: TrainingRecord[]
}

const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(null)
const showModal = ref(false)

const dayHeaders = ['一', '二', '三', '四', '五', '六', '日']

// 當前月份年份顯示
const currentMonthYear = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${month}月`
})

// 選中日期的訓練記錄
const selectedDateTrainings = computed(() => {
  if (!selectedDate.value) return []
  const dateString = formatDateString(selectedDate.value)
  return props.records.filter((record) => {
    const recordDate = formatDateString(new Date(record.startDate))
    return recordDate === dateString
  })
})

// 選中日期的字符串
const selectedDateString = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('zh-TW')
})

// 生成日曆天數
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // 當月第一天
  const firstDay = new Date(year, month, 1)
  // 當月最後一天
  const lastDay = new Date(year, month + 1, 0)

  // 計算週一開始的日曆
  // 獲取當月第一天是週幾 (0=週日, 1=週一, ..., 6=週六)
  const firstDayOfWeek = firstDay.getDay()
  // 轉換為以週一為起始 (週一=0, 週二=1, ..., 週日=6)
  const mondayBasedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  // 日曆開始日期（包含上月末尾）
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - mondayBasedFirstDay)

  // 計算當月最後一天是週幾
  const lastDayOfWeek = lastDay.getDay()
  const mondayBasedLastDay = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1

  // 日曆結束日期（包含下月開頭）
  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - mondayBasedLastDay))

  const days: CalendarDay[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const dateString = formatDateString(current)
    const trainings = props.records.filter((record) => {
      const recordDate = formatDateString(new Date(record.startDate))
      return recordDate === dateString
    })

    days.push({
      day: current.getDate(),
      date: new Date(current),
      dateString,
      isCurrentMonth: current.getMonth() === month,
      isToday: isToday(current),
      trainings,
    })

    current.setDate(current.getDate() + 1)
  }

  return days
})

const formatDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return formatDateString(date) === formatDateString(today)
}

const getDayCellClass = (date: CalendarDay): string => {
  const classes = []

  if (!date.isCurrentMonth) classes.push('other-month')
  if (date.isToday) classes.push('today')
  if (date.trainings.length > 0) classes.push('has-training')

  return classes.join(' ')
}

const getTotalDistance = (trainings: TrainingRecord[]): string => {
  const total = trainings.reduce((sum, training) => sum + training.distance, 0)
  return total.toFixed(1)
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
  selectedDate.value = new Date()
}

const selectDate = (date: CalendarDay) => {
  selectedDate.value = date.date
  showModal.value = true
}

onMounted(() => {
  // 默認選擇今天
  selectedDate.value = new Date()
})
</script>

<style scoped>
.selected-date-details {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

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
  margin-right: 12px;
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

.training-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 2px;
}
</style>
