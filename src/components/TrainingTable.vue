<template>
  <!-- Filter Controls -->
  <div class="filter-controls mb-4">
    <!-- 第一行：月份 -->
    <div class="filter-row">
      <div class="filter-item">
        <label>月份：</label>
        <n-select
          v-model:value="selectedMonth"
          :options="monthOptions"
          placeholder="選擇月份"
          size="small"
          style="width: 110px"
        />
      </div>
    </div>

    <!-- 第二行：主副和類型 -->
    <div class="filter-row">
      <div class="filter-item">
        <label>主副：</label>
        <n-select
          v-model:value="selectedMainType"
          :options="mainTypeOptions"
          placeholder="主副訓練"
          size="small"
          style="width: 110px"
        />
      </div>
      <!-- 只有在選擇"主"或"全部"時才顯示訓練類型 -->
      <div v-if="selectedMainType !== 'casual'" class="filter-item">
        <label>類型：</label>
        <n-select
          v-model:value="selectedTrainingType"
          :options="trainingTypeOptions"
          placeholder="訓練類型"
          size="small"
          style="width: 110px"
        />
      </div>
      <!-- 第三項：強度類型（只有選擇強度訓練時才顯示） -->
      <div v-if="selectedTrainingType === 'INT'" class="filter-item">
        <label>子類型：</label>
        <n-select
          v-model:value="selectedIntensityType"
          :options="intensityTypeOptions"
          placeholder="選擇強度類型"
          size="small"
          style="width: 130px"
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
      :row-class-name="getRowClassName"
      :row-props="getRowProps"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'
import { NDataTable, NSelect } from 'naive-ui'
import type { DataTableColumns, SelectOption } from 'naive-ui'
import type { TrainingRecord } from '@/types/training'
import { PARENT_RUN_TYPE_NAMES } from '@/types/run-types'

interface Props {
  records: TrainingRecord[]
}

const props = defineProps<Props>()

// Filter states
const selectedMonth = ref<string>('')
const selectedMainType = ref<string>('main')
const selectedTrainingType = ref<string>('')
const selectedIntensityType = ref<string>('')

// Helper function to check if record has description
const hasDescription = (row: TrainingRecord) => row.description && row.description.trim() !== ''

// Get row class name for styling
const getRowClassName = (row: TrainingRecord) => {
  return !row.isMainTraining ? 'casual-training-row' : ''
}

// Get row props (no longer needed for click handling)
const getRowProps = () => ({})

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

// Main type options
const mainTypeOptions = computed<SelectOption[]>(() => [
  { label: '全部', value: '' },
  { label: '主訓練', value: 'main' },
  { label: '其他', value: 'casual' },
])

// Training type options (訓練類型)
const trainingTypeOptions = computed<SelectOption[]>(() => {
  const parentOptions = Object.entries(PARENT_RUN_TYPE_NAMES).map(([code, name]) => ({
    label: name,
    value: code,
  }))

  const independentTypes = [
    { label: '長距離', value: 'LR' },
    { label: '賽事', value: 'RACE' },
    { label: '越野跑', value: 'TRAIL' },
    { label: '其他', value: 'OTHER' },
  ]

  return [{ label: '全部類型', value: '' }, ...parentOptions, ...independentTypes]
})

// Intensity type options (強度訓練子類型)
const intensityTypeOptions = computed<SelectOption[]>(() => {
  const intensityTypes = [
    { code: 'PROG', name: '漸速跑' },
    { code: 'Slope', name: '坡度訓練' },
    { code: 'FARTLEK', name: '法特雷克' },
    { code: 'I-S', name: '短間歇' },
    { code: 'I-L', name: '長間歇' },
    { code: 'PYRAMID', name: '金字塔' },
    { code: 'T', name: '節奏跑' },
  ].map((type) => ({ label: type.name, value: type.code }))

  return [{ label: '全部強度類型', value: '' }, ...intensityTypes]
})

// Filter helper functions
const matchesMonthFilter = (record: TrainingRecord) => {
  if (!selectedMonth.value) return true

  const date = new Date(record.startDate)
  const recordMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  return recordMonth === selectedMonth.value
}

const matchesMainTypeFilter = (record: TrainingRecord) => {
  if (!selectedMainType.value) return true

  return selectedMainType.value === 'main' ? record.isMainTraining : !record.isMainTraining
}

const matchesTrainingTypeFilter = (record: TrainingRecord) => {
  if (!selectedTrainingType.value) return true

  // 訓練類型過濾只適用於主訓練
  if (!record.isMainTraining && !selectedMainType.value) return false
  if (selectedMainType.value === 'casual') return true

  if (selectedTrainingType.value === 'OTHER') {
    return !record.runType && !record.parentRunType
  }

  return (
    record.runType === selectedTrainingType.value ||
    record.parentRunType === selectedTrainingType.value
  )
}

const matchesIntensityTypeFilter = (record: TrainingRecord) => {
  if (!selectedIntensityType.value || selectedTrainingType.value !== 'INT') return true
  return record.runType === selectedIntensityType.value
}

// Filtered records
const filteredRecords = computed(() => {
  if (!props.records) return []

  const filtered = props.records.filter(
    (record) =>
      matchesMonthFilter(record) &&
      matchesMainTypeFilter(record) &&
      matchesTrainingTypeFilter(record) &&
      matchesIntensityTypeFilter(record),
  )

  // 按日期倒敘排序（最新的在上面）
  return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
})

const rowKey = (row: TrainingRecord) => row.id

const columns: DataTableColumns<TrainingRecord> = [
  {
    title: '日期',
    key: 'startDate',
    render: (row) =>
      new Date(row.startDate).toLocaleDateString('zh-TW', {
        month: 'numeric',
        day: 'numeric',
      }),
    width: 60,
  },
  {
    title: '訓練',
    key: 'name',
    render: (row) => {
      const hasDesc = hasDescription(row)

      const children = [
        h('div', { class: 'training-name' }, row.name),
        h('div', { class: 'training-meta' }, `${row.distance}km | ${row.movingTime} | ${row.pace}`),
      ]

      if (hasDesc) {
        children.push(h('div', { class: 'training-description' }, row.description))
      }

      return h('div', { class: 'training-cell' }, children)
    },
    ellipsis: false,
  },
]
</script>

<style scoped>
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
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.training-cell {
  padding: 4px 0;
}

.training-name {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
  margin-bottom: 2px;
  word-break: break-word;
}

.training-description {
  margin-top: 8px;
  padding: 8px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.4;
  color: #374151;
  white-space: pre-wrap;
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

.casual-training-row {
  background-color: #f5f5f5 !important;
}

/* 主訓練 hover 效果 */
:deep(.n-data-table tbody tr:not(.casual-training-row):hover),
:deep(.n-data-table tbody tr:not(.casual-training-row):hover td) {
  background-color: #f0f9ff !important;
  transition: background-color 0.2s ease;
}

/* Ensure casual training row styling works with naive-ui table */
:deep(.n-data-table tbody .casual-training-row),
:deep(.n-data-table tbody .casual-training-row td) {
  background-color: #f5f5f5 !important;
}
</style>
