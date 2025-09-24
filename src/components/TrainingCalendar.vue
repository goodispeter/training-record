<template>
  <!-- Calendar Header -->
  <div class="calendar-header">
    <div class="calendar-nav">
      <button class="calendar-nav-btn" :disabled="!canGoToPreviousMonth" @click="previousMonth">
        ‹
      </button>
      <span class="calendar-title">{{ currentMonthYear }}</span>
      <button class="calendar-nav-btn" :disabled="!canGoToNextMonth" @click="nextMonth">›</button>
    </div>
    <div class="flex justify-end">
      <div class="calendar-filter">
        <label class="filter-label">類型：</label>
        <n-select
          v-model:value="selectedTrainingType"
          :options="trainingTypeOptions"
          size="small"
          style="width: 140px"
        />
      </div>
    </div>
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
        {{ getTrainingSummary(date.trainings) }}
      </div>
    </div>
  </div>

  <!-- Modal for Selected Date Details -->
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="modalTitle"
    style="width: 600px; max-width: 90vw"
  >
    <div class="modal-container">
      <!-- 左側點擊區域 -->
      <div
        v-if="hasPreviousRecord"
        class="nav-area nav-area-left"
        @click="goToPreviousRecord"
        title="上一次訓練"
      >
        <div class="nav-arrow">‹</div>
      </div>

      <!-- 右側點擊區域 -->
      <div
        v-if="hasNextRecord"
        class="nav-area nav-area-right"
        @click="goToNextRecord"
        title="下一次訓練"
      >
        <div class="nav-arrow">›</div>
      </div>
      <!-- 訓練記錄內容 -->
      <div class="training-list">
        <div
          v-for="training in selectedDateTrainings"
          :key="training.id"
          class="training-detail-card"
        >
          <div class="flex justify-between items-start">
            <div class="training-info">
              <div class="flex justify-between items-center">
                <h5 class="font-medium">{{ training.name }}</h5>
                <n-tag v-if="training.isMainTraining" type="success" size="small"> 主訓練 </n-tag>
              </div>
              <div
                v-if="training.sportType !== 'WeightTraining'"
                class="text-sm text-gray-600"
                style="margin-top: 4px"
              >
                📏 {{ training.distance }} ⏱️ {{ training.movingTime }} ⚡ {{ training.pace }}
                <template v-if="training.averageHeartRate && training.maxHeartRate">
                  ❤️ {{ training.averageHeartRate }} 🔥 {{ training.maxHeartRate }}
                </template>
              </div>
              <div v-else class="text-sm text-gray-600" style="margin-top: 4px">
                ⏱️: {{ training.movingTime }}
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
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { NTag, NModal, NSelect } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import type { TrainingRecord } from '@/types/training'

interface Props {
  records: TrainingRecord[]
}

const props = defineProps<Props>()

// 篩選狀態
const selectedTrainingType = ref<string>('')

// 訓練類型選項
const trainingTypeOptions: SelectOption[] = [
  { label: '不選擇類型', value: '' },
  { label: '強度訓練', value: 'INT' },
  { label: '慢跑', value: 'SW' },
  { label: '長距離', value: 'LR' },
  { label: '賽事', value: 'RACE' },
  { label: '越野跑', value: 'TRAIL' },
  { label: '重量訓練', value: 'WeightTraining' },
  { label: '瑜珈', value: 'Yoga' },
  { label: '其它', value: 'OTHER' },
]

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

// 計算資料的日期範圍
const dataDateRange = computed(() => {
  if (!props.records || props.records.length === 0) {
    return { min: null, max: null }
  }

  const dates = props.records.map((record) => new Date(record.startDate))
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

  return {
    min: new Date(minDate.getFullYear(), minDate.getMonth(), 1), // 月份第一天
    max: new Date(maxDate.getFullYear(), maxDate.getMonth(), 1), // 月份第一天
  }
})

// 檢查是否可以導航到上一個月
const canGoToPreviousMonth = computed(() => {
  if (!dataDateRange.value.min) return false
  const currentMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  return currentMonth > dataDateRange.value.min
})

// 檢查是否可以導航到下一個月
const canGoToNextMonth = computed(() => {
  if (!dataDateRange.value.max) return false
  const currentMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  return currentMonth < dataDateRange.value.max
})

const dayHeaders = ['一', '二', '三', '四', '五', '六', '日']

// 檢查日期是否在資料範圍內並導航到合適的月份
const navigateToValidMonth = () => {
  const today = new Date()
  const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  if (dataDateRange.value.min && dataDateRange.value.max) {
    if (todayMonth >= dataDateRange.value.min && todayMonth <= dataDateRange.value.max) {
      // 今天在資料範圍內
      currentDate.value = today
      selectedDate.value = today
    } else {
      // 導航到有資料的最新月份
      currentDate.value = new Date(dataDateRange.value.max)
      selectedDate.value = new Date(dataDateRange.value.max)
    }
  } else {
    // 如果沒有資料，使用今天
    currentDate.value = today
    selectedDate.value = today
  }
}

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

// 生成日曆天數
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // 當月第一天和最後一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 計算週一開始的日曆範圍
  const firstDayOfWeek = firstDay.getDay()
  const mondayBasedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - mondayBasedFirstDay)

  const lastDayOfWeek = lastDay.getDay()
  const mondayBasedLastDay = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1

  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - mondayBasedLastDay))

  // 預先建立日期對應的訓練記錄映射
  const trainingsByDate = new Map<string, TrainingRecord[]>()
  props.records.forEach((record) => {
    const dateString = formatDateString(new Date(record.startDate))
    if (!trainingsByDate.has(dateString)) {
      trainingsByDate.set(dateString, [])
    }
    trainingsByDate.get(dateString)!.push(record)
  })

  // 生成日曆天數
  const days: CalendarDay[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const dateString = formatDateString(current)
    const trainings = trainingsByDate.get(dateString) || []

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

// 檢查訓練記錄是否符合篩選條件
const matchesFilter = (training: TrainingRecord): boolean => {
  if (!selectedTrainingType.value) return true

  switch (selectedTrainingType.value) {
    case 'INT':
      return training.parentRunType === 'INT'
    case 'SW':
      return training.parentRunType === 'SW'
    case 'LR':
      return training.runType === 'LR'
    case 'RACE':
      return training.runType === 'RACE'
    case 'TRAIL':
      return training.runType === 'TRAIL'
    case 'WeightTraining':
      return training.sportType === 'WeightTraining'
    case 'Yoga':
      return training.sportType === 'Yoga'
    case 'OTHER':
      return !training.isMainTraining // 篩選副訓練（非主訓練）
    default:
      return false
  }
}

// 檢查日期是否有符合篩選條件的訓練
const dateHasMatchingTraining = (trainings: TrainingRecord[]): boolean => {
  if (!selectedTrainingType.value) return trainings.length > 0
  return trainings.some(matchesFilter)
}

const getDayCellClass = (date: CalendarDay): string => {
  const classes = []

  if (!date.isCurrentMonth) classes.push('other-month')
  if (date.isToday) classes.push('today')
  if (date.trainings.length > 0) classes.push('has-training')

  // 根據篩選條件添加高亮樣式
  if (selectedTrainingType.value && dateHasMatchingTraining(date.trainings)) {
    classes.push('filtered-match')
  }

  return classes.join(' ')
}

const getTrainingSummary = (trainings: TrainingRecord[]): string => {
  const runningTrainings = trainings.filter((t) => t.sportType !== 'WeightTraining')

  let summary = `${trainings.length}次`

  if (runningTrainings.length > 0) {
    const totalDistance = runningTrainings.reduce((sum, training) => sum + training.distance, 0)
    summary += ` ${totalDistance.toFixed(1)}km`
  }

  return summary
}

const previousMonth = () => {
  if (canGoToPreviousMonth.value) {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1,
      1,
    )
  }
}

const nextMonth = () => {
  if (canGoToNextMonth.value) {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + 1,
      1,
    )
  }
}

const selectDate = (date: CalendarDay) => {
  if (date.trainings.length > 0) {
    selectedDate.value = date.date
    showModal.value = true
  }
}

// 導航相關的計算屬性和方法
// 所有有訓練記錄的日期，按時間排序
const recordDates = computed(() => {
  const dates = [...new Set(props.records.map((r) => r.startDate.split('T')[0]))]
  return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
})

// 當前選中日期的格式化字符串
const currentSelectedDateString = computed(() => {
  if (!selectedDate.value) return ''
  return formatDateString(selectedDate.value)
})

// 當前日期在記錄列表中的索引
const currentRecordIndex = computed(() =>
  recordDates.value.findIndex((date) => date === currentSelectedDateString.value),
)

// 總記錄日期數
const totalRecordDates = computed(() => recordDates.value.length)

// 是否有上一個記錄
const hasPreviousRecord = computed(() => currentRecordIndex.value > 0)

// 是否有下一個記錄
const hasNextRecord = computed(
  () => currentRecordIndex.value >= 0 && currentRecordIndex.value < recordDates.value.length - 1,
)

// 彈窗標題
const modalTitle = computed(() => {
  if (!selectedDate.value) return ''
  const date = selectedDate.value
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// 跳到上一個記錄
const goToPreviousRecord = () => {
  if (hasPreviousRecord.value) {
    const prevDate = recordDates.value[currentRecordIndex.value - 1]
    selectedDate.value = new Date(prevDate)
  }
}

// 跳到下一個記錄
const goToNextRecord = () => {
  if (hasNextRecord.value) {
    const nextDate = recordDates.value[currentRecordIndex.value + 1]
    selectedDate.value = new Date(nextDate)
  }
}

// 監聽 records 變化，當切換人員/目標時重新導航到合適的月份
watch(
  () => props.records,
  () => {
    navigateToValidMonth()
  },
  { immediate: true },
)

onMounted(() => {
  navigateToValidMonth()
})
</script>

<style scoped>
.modal-container {
  position: relative;
  min-height: 200px;
}

.nav-area {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
  background: rgba(0, 0, 0, 0.03);
}

.nav-area:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.08);
}

.nav-area-left {
  left: -20px;
  border-radius: 0 8px 8px 0;
}

.nav-area-right {
  right: -20px;
  border-radius: 8px 0 0 8px;
}

.nav-arrow {
  font-size: 24px;
  font-weight: bold;
  color: #666;
  user-select: none;
}

.record-counter {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  z-index: 20;
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

/* 篩選器樣式 */
.calendar-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #4b5563;
  white-space: nowrap;
}

/* 篩選匹配的日期樣式 */
.day-cell.filtered-match {
  background: #fc9090 !important;
}

.day-cell.filtered-match.today {
  background: #fc9090 !important;
}

.day-cell.filtered-match .training-summary {
  color: #ffffff;
}
</style>
