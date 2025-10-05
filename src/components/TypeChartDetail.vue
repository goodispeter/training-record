<template>
  <n-modal v-model:show="isVisible" preset="card" style="width: 500px; max-width: 90vw">
    <template #header>
      <div class="flex justify-between items-center w-full">
        <span>詳細資訊</span>
        <n-radio-group v-model:value="displayMode" size="small">
          <n-radio-button value="value">實際數字</n-radio-button>
          <n-radio-button value="percent">百分比</n-radio-button>
        </n-radio-group>
      </div>
    </template>
    <div style="overflow-x: auto; width: 100%; min-width: 0">
      <n-data-table
        :columns="columns"
        :data="tableDataWithTotal"
        :bordered="false"
        :single-line="false"
        :single-column="false"
        size="small"
        :scroll-x="380"
        style="min-width: 380px"
      />
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, ref, h, watch } from 'vue'
import { NModal, NRadioGroup, NRadioButton, NDataTable } from 'naive-ui'

interface TableData {
  name: string
  count: number
  value: number
  time: number
  countPercent: string
  distancePercent: string
  timePercent: string
  isTotal?: boolean
}

interface Props {
  show: boolean
  data: TableData[]
  totalCount: number
  totalDistance: number
  totalTimeMinutes: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

// 顯示狀態
const isVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
})

// 顯示模式
const displayMode = ref<'value' | 'percent'>('value')

// 排除的類型追蹤
const excludedTypes = ref<Set<string>>(new Set())

// 監聽彈窗開啟狀態，重新開啟時重置排除的類型
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      excludedTypes.value.clear()
    }
  },
)

// 表格欄位配置
const columns = [
  {
    title: '類型',
    key: 'name',
    align: 'center' as const,
    width: 80,
    render: (row: any) => {
      if (row.isTotal) {
        return h('span', { style: { fontWeight: 'bold', color: '#1890ff' } }, '總和')
      }
      const isExcluded = excludedTypes.value.has(row.name)
      return h(
        'span',
        {
          style: {
            cursor: 'pointer',
            color: isExcluded ? '#ccc' : 'inherit',
            textDecoration: isExcluded ? 'line-through' : 'none',
          },
          onClick: () => {
            if (isExcluded) {
              excludedTypes.value.delete(row.name)
            } else {
              excludedTypes.value.add(row.name)
            }
          },
        },
        row.name,
      )
    },
  },
  {
    title: '次數',
    key: 'count',
    align: 'center' as const,
    width: 100,
    render: (row: any) => {
      if (row.isTotal) {
        return h(
          'span',
          { style: { fontWeight: 'bold', color: '#1890ff' } },
          displayMode.value === 'value' ? `${row.count}次` : '100',
        )
      }
      const isExcluded = excludedTypes.value.has(row.name)
      const text = displayMode.value === 'value' ? `${row.count}` : `${row.countPercent}`
      return h(
        'span',
        {
          style: {
            color: isExcluded ? '#ccc' : 'inherit',
            textDecoration: isExcluded ? 'line-through' : 'none',
          },
        },
        text,
      )
    },
  },
  {
    title: '距離',
    key: 'value',
    align: 'center' as const,
    width: 100,
    render: (row: any) => {
      if (row.isTotal) {
        return h(
          'span',
          { style: { fontWeight: 'bold', color: '#1890ff' } },
          displayMode.value === 'value' ? `${row.value}km` : '100',
        )
      }
      if (row.name === '重量訓練' || row.name === '瑜珈') {
        const isExcluded = excludedTypes.value.has(row.name)
        return h(
          'span',
          {
            style: {
              color: isExcluded ? '#ccc' : 'inherit',
              textDecoration: isExcluded ? 'line-through' : 'none',
            },
          },
          '-',
        )
      }
      const isExcluded = excludedTypes.value.has(row.name)
      const text = displayMode.value === 'value' ? `${row.value}` : `${row.distancePercent}`
      return h(
        'span',
        {
          style: {
            color: isExcluded ? '#ccc' : 'inherit',
            textDecoration: isExcluded ? 'line-through' : 'none',
          },
        },
        text,
      )
    },
  },
  {
    title: '時間',
    key: 'time',
    align: 'center' as const,
    width: 100,
    render: (row: any) => {
      const timeText = `${Math.floor(row.time / 60)}h${Math.round(row.time % 60)}m`
      if (row.isTotal) {
        return h(
          'span',
          { style: { fontWeight: 'bold', color: '#1890ff' } },
          displayMode.value === 'value' ? timeText : '100',
        )
      }
      const isExcluded = excludedTypes.value.has(row.name)
      const text = displayMode.value === 'value' ? timeText : `${row.timePercent}`
      return h(
        'span',
        {
          style: {
            color: isExcluded ? '#ccc' : 'inherit',
            textDecoration: isExcluded ? 'line-through' : 'none',
          },
        },
        text,
      )
    },
  },
]

// 包含總和統計的表格數據
const tableDataWithTotal = computed(() => {
  const allData = props.data

  // 過濾掉被排除的類型進行總和計算
  const activeData = allData.filter((item) => !excludedTypes.value.has(item.name))

  // 重新計算總和
  const totalCount = activeData.reduce((sum, item) => sum + item.count, 0)
  // 總距離計算時排除重量訓練和瑜珈（它們的value是次數不是距離）
  const totalDistance = activeData
    .filter((item) => item.name !== '重量訓練' && item.name !== '瑜珈')
    .reduce((sum, item) => sum + item.value, 0)
  const totalTimeMinutes = activeData.reduce((sum, item) => sum + item.time, 0)

  // 計算用於距離百分比的總和（排除重量訓練和被排除的類型）
  const totalDistanceForPercent = activeData
    .filter((item) => item.name !== '重量訓練' && item.name !== '瑜珈')
    .reduce((sum, item) => sum + item.value, 0)

  // 所有數據（帶各自的百分比）
  const dataWithPercent = allData.map((item) => {
    const isExcluded = excludedTypes.value.has(item.name)

    let countPercent: string
    let distancePercent: string
    let timePercent: string

    if (isExcluded) {
      // 被排除的項目百分比設為 0
      countPercent = '0.0'
      distancePercent = '0.0'
      timePercent = '0.0'
    } else {
      // 正常計算百分比
      countPercent = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0'
      distancePercent =
        totalDistanceForPercent > 0
          ? ((item.value / totalDistanceForPercent) * 100).toFixed(1)
          : '0'
      timePercent = totalTimeMinutes > 0 ? ((item.time / totalTimeMinutes) * 100).toFixed(1) : '0'
    }

    return {
      ...item,
      countPercent,
      distancePercent,
      timePercent,
    }
  })

  // 添加總和行
  const totalRow = {
    name: '總和',
    count: totalCount,
    value: Number(totalDistance.toFixed(1)),
    time: Number(totalTimeMinutes.toFixed(1)),
    countPercent: '100.0',
    distancePercent: '100.0',
    timePercent: '100.0',
    isTotal: true, // 標記這是總和行，用於樣式區分
  }

  return [...dataWithPercent, totalRow]
})
</script>
