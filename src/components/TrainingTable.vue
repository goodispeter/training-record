<template>
  <div class="training-table-container">
    <h3 class="text-lg font-semibold mb-4">訓練記錄</h3>

    <!-- Filter Controls -->
    <div class="filter-controls mb-4">
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
        <div class="filter-item">
          <label class="filter-label">類型：</label>
          <n-select
            v-model:value="selectedType"
            :options="typeOptions"
            placeholder="選擇類型"
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
import { ref, computed, h } from 'vue'
import { NDataTable, NTag, NSelect } from 'naive-ui'
import type { DataTableColumns, SelectOption } from 'naive-ui'
import type { TrainingRecord } from '@/stores/training'

interface Props {
  records: TrainingRecord[]
}

const props = defineProps<Props>()

// Filter states
const selectedMonth = ref<string>('')
const selectedType = ref<string>('')

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

// Type options
const typeOptions = computed<SelectOption[]>(() => [
  { label: '全部', value: '' },
  { label: '主', value: 'main' },
  { label: '副', value: 'casual' },
])

// Filtered records
const filteredRecords = computed(() => {
  if (!props.records) return []

  return props.records.filter((record) => {
    // Month filter
    if (selectedMonth.value && selectedMonth.value !== '') {
      const date = new Date(record.startDate)
      const recordMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (recordMonth !== selectedMonth.value) return false
    }

    // Type filter
    if (selectedType.value && selectedType.value !== '') {
      const isMain = record.isMainTraining
      if (selectedType.value === 'main' && !isMain) return false
      if (selectedType.value === 'casual' && isMain) return false
    }

    return true
  })
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
    sorter: (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    defaultSortOrder: 'descend',
    width: 60,
  },
  {
    title: '訓練',
    key: 'name',
    render: (row) => {
      return h('div', { class: 'training-cell' }, [
        h('div', { class: 'training-name' }, row.name),
        h('div', { class: 'training-meta' }, `${row.distance}km | ${row.movingTime} | ${row.pace}`),
      ])
    },
    ellipsis: false,
  },
  {
    title: '類型',
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
}

.filter-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: nowrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.filter-select {
  width: 110px;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: row;
    gap: 8px;
  }

  .filter-item {
    flex: 1;
    min-width: 0;
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
