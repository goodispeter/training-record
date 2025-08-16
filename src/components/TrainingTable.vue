<template>
  <div class="training-table-container">
    <h3 class="text-lg font-semibold mb-4">訓練記錄</h3>

    <!-- Filter Controls -->
    <div class="filter-controls mb-4">
      <!-- 第一行：月份 -->
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">月份：</label>
          <n-select
            v-model:value="selectedMonth"
            :options="monthOptions"
            placeholder="選擇月份"
            size="small"
            class="filter-select"
          />
        </div>
      </div>

      <!-- 第二行：主副和類型 -->
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">主副：</label>
          <n-select
            v-model:value="selectedMainType"
            :options="mainTypeOptions"
            placeholder="主副訓練"
            size="small"
            class="filter-select"
          />
        </div>
        <!-- 只有在選擇"主"或"全部"時才顯示訓練類型 -->
        <div v-if="selectedMainType !== 'casual'" class="filter-item">
          <label class="filter-label">類型：</label>
          <n-select
            v-model:value="selectedTrainingType"
            :options="trainingTypeOptions"
            placeholder="訓練類型"
            size="small"
            class="filter-select"
          />
        </div>
        <!-- 第三項：強度類型（只有選擇強度訓練時才顯示） -->
        <div v-if="selectedTrainingType === 'INT'" class="filter-item">
          <label class="filter-label">子類型：</label>
          <n-select
            v-model:value="selectedIntensityType"
            :options="intensityTypeOptions"
            placeholder="選擇強度類型"
            size="small"
            class="filter-select"
          />
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <n-data-table
        :columns="columns"
        :data="filteredRecords"
        :row-key="rowKey"
        :bordered="false"
        :size="'small'"
        :single-line="false"
        class="training-table"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'
import { NDataTable, NTag, NSelect } from 'naive-ui'
import type { DataTableColumns, SelectOption } from 'naive-ui'
import type { TrainingRecord } from '@/stores/training'
import {
  MAIN_CATEGORIES,
  INTENSITY_SUB_TYPES,
  matchTrainingType,
  getTrainingTypeDisplay,
} from '@/types/run-types'

interface Props {
  records: TrainingRecord[]
}

const props = defineProps<Props>()

// Filter states
const selectedMonth = ref<string>('')
const selectedMainType = ref<string>('')
const selectedTrainingType = ref<string>('')
const selectedIntensityType = ref<string>('')

// 監聽主副選擇的變化，當選擇"副"時清空訓練類型
watch(selectedMainType, (newValue) => {
  if (newValue === 'casual') {
    selectedTrainingType.value = ''
    selectedIntensityType.value = ''
  }
})

// 監聽訓練類型的變化，當不是強度訓練時清空強度類型
watch(selectedTrainingType, (newValue) => {
  if (newValue !== 'INT') {
    selectedIntensityType.value = ''
  }
  // 當選擇了訓練類型時，自動將主副切換到"主"
  if (newValue && newValue !== '') {
    selectedMainType.value = 'main'
  }
})

// Month options
const monthOptions = computed<SelectOption[]>(() => {
  if (!props.records || props.records.length === 0) return [{ label: '全部月份', value: '' }]

  const months = new Set<string>()
  props.records.forEach((record) => {
    const date = new Date(record.startDate)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = `${date.getMonth() + 1}月`
    months.add(`${monthKey}|${monthLabel}`)
  })

  const sortedMonths = Array.from(months)
    .sort()
    .map((item) => {
      const [value, label] = item.split('|')
      return { label, value }
    })

  return [{ label: '全部月份', value: '' }, ...sortedMonths]
})

// Main type options (主副訓練)
const mainTypeOptions = computed<SelectOption[]>(() => [
  { label: '全部', value: '' },
  { label: '主', value: 'main' },
  { label: '副', value: 'casual' },
])

// Training type options (訓練類型)
const trainingTypeOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [{ label: '全部類型', value: '' }]

  // 添加主要分類
  MAIN_CATEGORIES.forEach((category) => {
    options.push({ label: category.chineseName, value: category.code })
  })

  // 添加其他類型
  options.push({ label: '其他', value: 'OTHER' })

  return options
})

// Intensity type options (強度訓練子類型)
const intensityTypeOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [{ label: '全部強度類型', value: '' }]

  INTENSITY_SUB_TYPES.forEach((type) => {
    options.push({ label: type.chineseName, value: type.code })
  })

  return options
})

// Filtered records
const filteredRecords = computed(() => {
  if (!props.records) return []

  const filtered = props.records.filter((record) => {
    // Month filter
    if (selectedMonth.value && selectedMonth.value !== '') {
      const date = new Date(record.startDate)
      const recordMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (recordMonth !== selectedMonth.value) return false
    }

    // Main type filter (主副訓練)
    if (selectedMainType.value && selectedMainType.value !== '') {
      const isMain = record.isMainTraining
      if (selectedMainType.value === 'main' && !isMain) return false
      if (selectedMainType.value === 'casual' && isMain) return false
    }

    // Training type filter (訓練類型) - 只有在非副訓練時才應用
    if (selectedTrainingType.value && selectedTrainingType.value !== '') {
      // 如果選擇了訓練類型，就只顯示主訓練（除非明確選擇了主副）
      if (selectedMainType.value === '') {
        // 如果沒有選擇主副，但選擇了訓練類型，就只顯示主訓練
        if (!record.isMainTraining) return false
      } else if (selectedMainType.value === 'casual') {
        // 如果選擇了副訓練，就不應用訓練類型過濾
        // 這個條件不應該出現，因為UI已經隱藏了類型選擇
        return true
      }

      const matchedTypes = matchTrainingType(record.name)

      if (selectedTrainingType.value === 'OTHER') {
        // 如果選擇的是"其他"，則顯示沒有匹配到任何類型的記錄
        if (matchedTypes.length > 0) return false
      } else {
        // 檢查是否匹配選擇的訓練類型或其父類別
        const hasMatch = matchedTypes.some(
          (type) =>
            type.code === selectedTrainingType.value ||
            type.parent?.code === selectedTrainingType.value,
        )
        if (!hasMatch) return false
      }
    }

    // Intensity type filter (強度類型過濾) - 只有選擇強度訓練時才應用
    if (
      selectedIntensityType.value &&
      selectedIntensityType.value !== '' &&
      selectedTrainingType.value === 'INT'
    ) {
      const matchedTypes = matchTrainingType(record.name)
      const hasIntensityMatch = matchedTypes.some(
        (type) => type.code === selectedIntensityType.value,
      )
      if (!hasIntensityMatch) return false
    }

    return true
  })

  // 強制按日期倒敘排序（最新的在上面）- 使用更明確的排序
  const sorted = filtered.sort((a, b) => {
    const dateA = new Date(a.startDate).getTime()
    const dateB = new Date(b.startDate).getTime()
    return dateB - dateA // 倒敘：最新的在前面
  })

  return sorted
})

const rowKey = (row: TrainingRecord) => row.id

const columns: DataTableColumns<TrainingRecord> = [
  {
    title: '日期',
    key: 'startDate',
    render: (row) => {
      const date = new Date(row.startDate)
      return date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })
    },
    width: 60,
  },
  {
    title: '訓練',
    key: 'name',
    render: (row) => {
      const trainingTypeDisplay = getTrainingTypeDisplay(row.name)
      return h('div', { class: 'training-cell' }, [
        h('div', { class: 'training-name' }, row.name),
        h('div', { class: 'training-meta' }, [
          `${row.distance}km | ${row.movingTime} | ${row.pace}`,
          h('span', { class: 'training-type-tag' }, trainingTypeDisplay),
        ]),
      ])
    },
    ellipsis: false,
  },
  {
    title: '主副',
    key: 'isMainTraining',
    render: (row) => {
      return h(
        NTag,
        {
          type: row.isMainTraining ? 'success' : 'default',
          size: 'small',
        },
        {
          default: () => (row.isMainTraining ? '主' : '副'),
        },
      )
    },
    width: 50,
  },
]
</script>

<style scoped>
.training-table-container {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.filter-controls {
  background: #f9fafb;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap; /* 允許換行 */
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  white-space: nowrap; /* 防止標籤換行 */
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  min-width: 40px;
}

.filter-select {
  width: 110px;
}

@media (max-width: 768px) {
  .filter-controls {
    gap: 8px;
  }

  .filter-row {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
    flex-wrap: nowrap; /* 手機版不換行 */
  }

  .filter-item {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
  }

  .filter-label {
    min-width: 50px; /* 增加手機版標籤寬度 */
  }

  .filter-select {
    width: 100%;
    min-width: 80px;
  }
}

.table-wrapper {
  width: 100%;
  overflow-x: hidden;
  overflow-y: visible;
}

.training-table {
  width: 100%;
  table-layout: fixed;
}

.training-cell {
  padding: 4px 0;
}

.training-name {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
  margin-bottom: 2px;
  white-space: normal;
  word-break: break-word;
}

.training-meta {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.training-type-tag {
  display: inline-block;
  background-color: #e0f2fe;
  color: #0369a1;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  margin-top: 2px;
  width: fit-content;
}

/* 移除所有內部滾動並固定表格佈局 */
:deep(.n-data-table) {
  overflow: hidden !important;
  table-layout: fixed !important;
}

:deep(.n-data-table-wrapper) {
  overflow-x: hidden !important;
  overflow-y: visible !important;
}

:deep(.n-data-table-base-table) {
  overflow: hidden !important;
  table-layout: fixed !important;
}

:deep(.n-data-table-base-table-body) {
  overflow: hidden !important;
}
</style>
