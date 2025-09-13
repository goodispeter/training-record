<template>
  <div class="w-full">
    <!-- 切換按鈕 -->
    <div
      v-if="intensitySubTypeData && intensitySubTypeData.length > 0"
      class="flex justify-center mb-0"
    >
      <n-tabs v-model:value="activeChart" type="segment" size="large" class="w-fit">
        <n-tab-pane name="main" tab="訓練類型分布" />
        <n-tab-pane name="intensity" tab="強度訓練分布" />
      </n-tabs>
    </div>

    <!-- 百分比計算方式切換 & 詳細資訊按鈕 -->
    <div class="flex justify-between items-center mb-4">
      <n-radio-group v-model:value="percentageMode" size="small">
        <n-radio-button value="count">次數</n-radio-button>
        <n-radio-button value="distance">距離</n-radio-button>
        <n-radio-button value="time">時間</n-radio-button>
      </n-radio-group>

      <n-button
        v-if="
          (activeChart === 'main' && mainCategoryData.length > 0) ||
          (activeChart === 'intensity' && intensitySubTypeData.length > 0)
        "
        @click="showDetailModal = true"
        type="primary"
        size="small"
      >
        詳細資訊
      </n-button>
    </div>

    <!-- 圓餅圖容器 -->
    <div class="relative overflow-visible" style="position: relative; z-index: 1">
      <!-- 主要訓練類型圓餅圖 -->
      <div v-show="activeChart === 'main'" class="w-full overflow-visible">
        <v-chart
          v-if="mainCategoryData && mainCategoryData.length > 0"
          :option="mainCategoryOption"
          class="w-full h-80 overflow-visible"
          width="100%"
          height="320px"
          ref="mainChartRef"
          :autoresize="true"
          style="position: relative; z-index: 2"
        />
        <div v-else class="flex items-center justify-center h-80 text-gray-500">暫無資料</div>
      </div>

      <!-- 強度訓練子類型圓餅圖 -->
      <div v-show="activeChart === 'intensity'" class="w-full overflow-visible">
        <v-chart
          v-if="intensitySubTypeData && intensitySubTypeData.length > 0"
          :option="intensitySubTypeOption"
          class="w-full h-80 overflow-visible"
          width="100%"
          height="320px"
          ref="intensityChartRef"
          :autoresize="true"
          style="position: relative; z-index: 2"
        />
        <div v-else class="flex items-center justify-center h-80 text-gray-500">
          暫無強度訓練資料
        </div>
      </div>
    </div>

    <!-- 詳細資訊彈窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" style="width: 500px; max-width: 90vw">
      <template #header>
        <div class="flex justify-between items-center w-full">
          <span>詳細資訊</span>
          <n-radio-group v-model:value="detailDisplayMode" size="small">
            <n-radio-button value="value">實際數字</n-radio-button>
            <n-radio-button value="percent">百分比</n-radio-button>
          </n-radio-group>
        </div>
      </template>
      <n-data-table
        :columns="columns"
        :data="tableDataWithTotal"
        :bordered="false"
        :single-line="false"
        :single-column="false"
        size="small"
      />
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, h } from 'vue'
import { NTabs, NTabPane, NModal, NRadioGroup, NRadioButton, NDataTable, NButton } from 'naive-ui'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import type { TrainingRecord } from '@/types/training'
import { getRunTypeName, getParentRunTypeName, PARENT_RUN_TYPE_NAMES } from '@/types/run-types'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

interface Props {
  records: TrainingRecord[]
  totalDistance: number
  totalMovingTime: string
  totalRecordsCount: number
}

const props = defineProps<Props>()

// 當前顯示的圖表
const activeChart = ref<'main' | 'intensity'>('main')

// 百分比計算模式
const percentageMode = ref<'count' | 'distance' | 'time'>('distance')

const mainChartRef = ref()
const intensityChartRef = ref()

// 詳細資訊彈窗
const showDetailModal = ref(false)

// 詳細資訊表格顯示模式：'value' 實際數字, 'percent' 百分比
const detailDisplayMode = ref<'value' | 'percent'>('value')

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
      return row.name
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
          detailDisplayMode.value === 'value' ? `${row.count}次` : '100',
        )
      }
      return detailDisplayMode.value === 'value' ? `${row.count}` : `${row.countPercent}`
    },
  },
  {
    title: '距離/km',
    key: 'value',
    align: 'center' as const,
    width: 100,
    render: (row: any) => {
      if (row.isTotal) {
        return h(
          'span',
          { style: { fontWeight: 'bold', color: '#1890ff' } },
          detailDisplayMode.value === 'value' ? `${row.value}km` : '100',
        )
      }
      if (row.name === '重量訓練') {
        return '-'
      }
      return detailDisplayMode.value === 'value' ? `${row.value}` : `${row.distancePercent}`
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
          detailDisplayMode.value === 'value' ? timeText : '100',
        )
      }
      return detailDisplayMode.value === 'value' ? timeText : `${row.timePercent}`
    },
  },
]

// 處理視窗大小變化
const handleResize = () => {
  if (activeChart.value === 'main' && mainChartRef.value) {
    mainChartRef.value.resize()
  } else if (activeChart.value === 'intensity' && intensityChartRef.value) {
    intensityChartRef.value.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 將時間字串轉換為分鐘數
const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0

  // 處理格式如 "1:30:25" 或 "30:25" 等
  const parts = timeStr.split(':').map(Number)

  if (parts.length === 3) {
    // 小時:分鐘:秒
    return parts[0] * 60 + parts[1] + parts[2] / 60
  } else if (parts.length === 2) {
    // 分鐘:秒
    return parts[0] + parts[1] / 60
  } else if (parts.length === 1) {
    // 只有分鐘
    return parts[0]
  }

  return 0
}

// 分類訓練記錄的函數
const categorizeTrainingRecord = (record: TrainingRecord) => {
  // 處理重量訓練
  if (record.sportType === 'WeightTraining') {
    return {
      mainCategory: { code: 'WeightTraining', name: '重量訓練' },
      subCategory: null,
    }
  }

  // 使用記錄中的 runType 和 parentRunType
  const runType = record.runType
  const parentRunType = record.parentRunType

  // 如果沒有類型資訊，返回null
  if (!runType && !parentRunType) return { mainCategory: null, subCategory: null }

  // 如果有父類別，使用父類別作為主分類，具體類型作為子分類
  if (parentRunType) {
    return {
      mainCategory: { code: parentRunType, name: getParentRunTypeName(parentRunType) },
      subCategory: { code: runType, name: getRunTypeName(runType) },
    }
  }

  // 沒有父類別的類型直接作為主分類
  return {
    mainCategory: { code: runType, name: getRunTypeName(runType) },
    subCategory: null,
  }
}

// 主要分類數據
const mainCategoryData = computed(() => {
  if (!props.records || props.records.length === 0) return []

  const categoryStats = new Map<
    string,
    { distance: number; count: number; time: number; name: string }
  >()

  // 初始化所有父類別
  Object.entries(PARENT_RUN_TYPE_NAMES).forEach(([code, name]) => {
    categoryStats.set(code, { distance: 0, count: 0, time: 0, name })
  })

  // 初始化獨立類型
  categoryStats.set('LR', { distance: 0, count: 0, time: 0, name: '長距離' })
  categoryStats.set('RACE', { distance: 0, count: 0, time: 0, name: '賽事' })
  categoryStats.set('TRAIL', { distance: 0, count: 0, time: 0, name: '越野跑' })
  categoryStats.set('WeightTraining', { distance: 0, count: 0, time: 0, name: '重量訓練' })

  // 其他分類（未匹配的）
  categoryStats.set('OTHER', { distance: 0, count: 0, time: 0, name: '其他' })

  props.records.forEach((record) => {
    const { mainCategory } = categorizeTrainingRecord(record)

    if (mainCategory) {
      const stats = categoryStats.get(mainCategory.code)
      if (stats) {
        // 重量訓練不累加距離，只計算次數
        if (mainCategory.code === 'WeightTraining') {
          stats.distance += 1 // 用次數代替距離
        } else {
          stats.distance += record.distance
        }
        stats.count += 1
        stats.time += parseTimeToMinutes(record.movingTime)
      }
    } else {
      // 未匹配的歸類為其他
      const stats = categoryStats.get('OTHER')
      if (stats) {
        stats.distance += record.distance
        stats.count += 1
        stats.time += parseTimeToMinutes(record.movingTime)
      }
    }
  })

  // 過濾掉沒有數據的分類
  return Array.from(categoryStats.entries())
    .filter(([_, stats]) => stats.count > 0)
    .map(([code, stats]) => ({
      name: stats.name,
      value: Number(stats.distance.toFixed(1)),
      count: stats.count,
      time: Number(stats.time.toFixed(1)),
    }))
})

// 強度訓練子分類數據
const intensitySubTypeData = computed(() => {
  if (!props.records || props.records.length === 0) return []

  const subTypeStats = new Map<
    string,
    { distance: number; count: number; time: number; name: string }
  >()

  // 初始化所有強度訓練子分類
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
    subTypeStats.set(type.code, { distance: 0, count: 0, time: 0, name: type.name })
  })

  props.records.forEach((record) => {
    const { mainCategory, subCategory } = categorizeTrainingRecord(record)

    // 只統計強度訓練的子分類
    if (mainCategory && mainCategory.code === 'INT' && subCategory) {
      const stats = subTypeStats.get(subCategory.code)
      if (stats) {
        stats.distance += record.distance
        stats.count += 1
        stats.time += parseTimeToMinutes(record.movingTime)
      }
    }
  })

  // 過濾掉沒有數據的子分類
  return Array.from(subTypeStats.entries())
    .filter(([_, stats]) => stats.count > 0)
    .map(([code, stats]) => ({
      name: stats.name,
      value: Number(stats.distance.toFixed(1)),
      count: stats.count,
      time: Number(stats.time.toFixed(1)),
    }))
})

// 主要分類圖表數據（根據百分比模式調整）
const mainCategoryChartData = computed(() => {
  let data = mainCategoryData.value

  // 根據百分比計算模式篩選數據
  if (percentageMode.value === 'distance') {
    // 距離模式：排除重量訓練
    data = data.filter((item) => item.name !== '重量訓練')
  }

  // 根據模式調整圓餅圖的 value（影響扇形大小）
  return data.map((item) => {
    let pieValue = 0
    if (percentageMode.value === 'count') {
      pieValue = item.count
    } else if (percentageMode.value === 'distance') {
      pieValue = item.value
    } else if (percentageMode.value === 'time') {
      pieValue = item.time
    }

    return {
      ...item,
      value: pieValue, // ECharts 圓餅圖使用 value 欄位決定扇形大小
    }
  })
})

// 強度訓練圖表數據（根據百分比模式調整）
const intensitySubTypeChartData = computed(() => {
  let data = intensitySubTypeData.value

  // 根據模式調整圓餅圖的 value（影響扇形大小）
  return data.map((item) => {
    let pieValue = 0
    if (percentageMode.value === 'count') {
      pieValue = item.count
    } else if (percentageMode.value === 'distance') {
      pieValue = item.value
    } else if (percentageMode.value === 'time') {
      pieValue = item.time
    }

    return {
      ...item,
      value: pieValue, // ECharts 圓餅圖使用 value 欄位決定扇形大小
    }
  })
})
// 包含總和統計的表格數據
const tableDataWithTotal = computed(() => {
  // 表格數據始終顯示所有類型，不進行篩選
  const allData = activeChart.value === 'main' ? mainCategoryData.value : intensitySubTypeData.value

  // 根據圖表類型使用不同的總和計算方式
  let totalCount: number
  let totalDistance: number
  let totalTimeMinutes: number

  if (activeChart.value === 'main') {
    // 訓練類型分布：使用 API 傳入的總和數據
    totalCount = props.totalRecordsCount
    totalDistance = props.totalDistance

    // 解析 API 時間字串
    const parseApiTime = (timeStr: string): number => {
      if (!timeStr) return 0
      const parts = timeStr.split(':').map(Number)
      if (parts.length === 3) {
        return parts[0] * 60 + parts[1] + parts[2] / 60 // 轉換為分鐘
      }
      return 0
    }
    totalTimeMinutes = parseApiTime(props.totalMovingTime)
  } else {
    // 強度訓練分布：從表格數據直接加總
    totalCount = allData.reduce((sum, item) => sum + item.count, 0)
    totalDistance = allData.reduce((sum, item) => sum + item.value, 0)
    totalTimeMinutes = allData.reduce((sum, item) => sum + item.time, 0)
  }

  // 計算用於距離百分比的總和（排除重量訓練）
  const totalDistanceForPercent = allData
    .filter((item) => item.name !== '重量訓練')
    .reduce((sum, item) => sum + item.value, 0)

  // 所有數據（帶各自的百分比）
  const dataWithPercent = allData.map((item) => {
    const countPercent = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0'
    const distancePercent =
      totalDistanceForPercent > 0 ? ((item.value / totalDistanceForPercent) * 100).toFixed(1) : '0'
    const timePercent =
      totalTimeMinutes > 0 ? ((item.time / totalTimeMinutes) * 100).toFixed(1) : '0'

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

// 主要分類圖表選項
const mainCategoryOption = computed(() => {
  if (!mainCategoryData.value || mainCategoryData.value.length === 0) return {}

  return {
    legend: {
      orient: 'vertical',
      left: 'left',
      itemGap: 10,
      textStyle: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: '訓練類型',
        type: 'pie',
        radius: '45%',
        center: ['60%', '30%'],
        data: mainCategoryChartData.value,
        silent: true,
        label: {
          show: true,
          position: 'inside',
          formatter: function (params: any) {
            // 只有當百分比大於5%時才顯示標籤，避免小片段顯示不清楚
            return params.percent > 5 ? `${params.percent.toFixed(0)}%` : ''
          },
          fontSize: 12,
          color: 'white',
          fontWeight: 'bold',
        },
        labelLine: {
          show: false,
        },
        itemStyle: {
          color: (params: any) => {
            // 為不同訓練類型設定特定顏色
            const colorMap: { [key: string]: string } = {
              強度訓練: '#ef4444', // 紅色 - 強度訓練
              長距離: '#3b82f6', // 藍色 - 長距離
              慢跑: '#10b981', // 綠色 - 慢跑
              重量訓練: '#f59e0b', // 橙色 - 重量訓練
              賽事: '#8b5cf6', // 紫色 - 賽事
              越野跑: '#06b6d4', // 青色 - 越野跑
              其他: '#6b7280', // 灰色 - 其他
            }

            const dataName = params.data.name
            return colorMap[dataName] || '#6b7280' // 預設灰色
          },
        },
      },
    ],
  }
})

// 強度訓練子分類圖表選項
const intensitySubTypeOption = computed(() => {
  if (!intensitySubTypeData.value || intensitySubTypeData.value.length === 0) return {}

  return {
    legend: {
      orient: 'vertical',
      left: 'left',
      itemGap: 8,
      textStyle: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: '強度訓練類型',
        type: 'pie',
        radius: '45%',
        center: ['60%', '30%'],
        data: intensitySubTypeChartData.value,
        silent: true,
        label: {
          show: true,
          position: 'inside',
          formatter: function (params: any) {
            // 只有當百分比大於5%時才顯示標籤，避免小片段顯示不清楚
            return params.percent > 5 ? `${params.percent.toFixed(0)}%` : ''
          },
          fontSize: 12,
          color: 'white',
          fontWeight: 'bold',
        },
        labelLine: {
          show: false,
        },
        itemStyle: {
          color: (params: any) => {
            const colors = [
              '#f97316',
              '#06b6d4',
              '#84cc16',
              '#f43f5e',
              '#8b5cf6',
              '#f59e0b',
              '#10b981',
            ]
            return colors[params.dataIndex % colors.length]
          },
        },
      },
    ],
  }
})
</script>
