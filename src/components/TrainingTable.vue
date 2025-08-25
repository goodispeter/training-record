<template>
  <div class="training-table-container">
    <h3 class="text-lg font-semibold mb-4">訓練記錄</h3>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'
import { NDataTable, NSelect } from 'naive-ui'
import type { DataTableColumns, SelectOption } from 'naive-ui'
import type { TrainingRecord } from '@/types/training'
import { getRunTypeName, PARENT_RUN_TYPE_NAMES } from '@/types/run-types'

interface Props {
  records: TrainingRecord[]
}

const props = defineProps<Props>()

// Filter states
const selectedMonth = ref<string>('')
const selectedMainType = ref<string>('')
const selectedTrainingType = ref<string>('')
const selectedIntensityType = ref<string>('')

// Description expansion state
const expandedDescriptions = ref<Set<number>>(new Set())

// Toggle description expansion
const toggleDescription = (id: number) => {
  const newSet = new Set(expandedDescriptions.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  expandedDescriptions.value = newSet
}

// Get row class name for styling
const getRowClassName = (row: TrainingRecord) => {
  const hasDescription = row.description && row.description.trim() !== ''

  if (hasDescription && row.isMainTraining) {
    return 'main-training-row clickable-row'
  } else if (hasDescription) {
    return 'clickable-row'
  }
  return ''
}

// Handle row click
const handleRowClick = (row: TrainingRecord) => {
  const hasDescription = row.description && row.description.trim() !== ''
  if (hasDescription) {
    toggleDescription(row.id)
  }
}

// Get row props for click handling
const getRowProps = (row: TrainingRecord) => {
  const hasDescription = row.description && row.description.trim() !== ''
  if (hasDescription) {
    return {
      onClick: () => handleRowClick(row),
    }
  }
  return {}
}

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

  // 添加父類別
  Object.entries(PARENT_RUN_TYPE_NAMES).forEach(([code, name]) => {
    options.push({ label: name, value: code })
  })

  // 添加獨立類型（沒有父類別的）
  options.push({ label: '長距離', value: 'LR' })
  options.push({ label: '賽事', value: 'RACE' })
  options.push({ label: '越野跑', value: 'TRAIL' })
  options.push({ label: '其他', value: 'OTHER' })

  return options
})

// Intensity type options (強度訓練子類型)
const intensityTypeOptions = computed<SelectOption[]>(() => {
  const options: SelectOption[] = [{ label: '全部強度類型', value: '' }]

  // 添加強度訓練的子類型
  const intensityTypes = [
    { code: 'PROG', name: '漸速跑' },
    { code: 'Slope', name: '坡度訓練' },
    { code: 'FARTLEK', name: '法特雷克' },
    { code: 'I-S', name: '短間歇' },
    { code: 'I-L', name: '長間歇' },
    { code: 'PYRAMID', name: '金字塔' },
    { code: 'T', name: '節奏跑' },
  ]

  intensityTypes.forEach((type) => {
    options.push({ label: type.name, value: type.code })
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

      if (selectedTrainingType.value === 'OTHER') {
        // 如果選擇的是"其他"，則顯示沒有類型的記錄
        if (record.runType || record.parentRunType) return false
      } else {
        // 檢查是否匹配選擇的訓練類型或其父類別
        const hasMatch =
          record.runType === selectedTrainingType.value ||
          record.parentRunType === selectedTrainingType.value
        if (!hasMatch) return false
      }
    }

    // Intensity type filter (強度類型過濾) - 只有選擇強度訓練時才應用
    if (
      selectedIntensityType.value &&
      selectedIntensityType.value !== '' &&
      selectedTrainingType.value === 'INT'
    ) {
      const hasIntensityMatch = record.runType === selectedIntensityType.value
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
      const trainingTypeDisplay = getRunTypeName(row.runType)
      const hasDescription = row.description && row.description.trim() !== ''
      const isExpanded = expandedDescriptions.value.has(row.id)

      return h(
        'div',
        {
          class: 'training-cell',
        },
        [
          // 訓練名稱
          h('div', { class: 'training-name' }, row.name),
          // 訓練資訊
          h('div', { class: 'training-meta' }, [
            `${row.distance}km | ${row.movingTime} | ${row.pace}`,
            h('span', { class: 'training-type-tag' }, trainingTypeDisplay),
          ]),
          // 描述內容 (條件顯示)
          hasDescription &&
            isExpanded &&
            h(
              'div',
              {
                class: 'training-description',
              },
              row.description,
            ),
        ],
      )
    },
    ellipsis: false,
  },
  {
    title: '主副',
    key: 'isMainTraining',
    render: (row) => {
      return h(
        'span',
        {
          class: row.isMainTraining ? 'main-tag' : 'casual-tag',
        },
        row.isMainTraining ? '主' : '副',
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

.main-tag {
  color: #059669;
  font-weight: 500;
  font-size: 12px;
}

.casual-tag {
  color: #6b7280;
  font-weight: 500;
  font-size: 12px;
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

.main-training-row {
  background-color: #dcfce7 !important;
}

.main-training-row:hover {
  background-color: #bbf7d0 !important;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:not(.main-training-row):hover {
  background-color: #f9fafb !important;
}

:deep(.n-data-table tbody .main-training-row) {
  background-color: #dcfce7 !important;
}

:deep(.n-data-table tbody .main-training-row:hover) {
  background-color: #bbf7d0 !important;
}

:deep(.n-data-table tbody .main-training-row td) {
  background-color: #dcfce7 !important;
}

:deep(.n-data-table tbody .main-training-row:hover td) {
  background-color: #bbf7d0 !important;
}
</style>
