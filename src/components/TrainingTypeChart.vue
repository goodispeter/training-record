<template>
  <div class="w-full">
    <!-- 切換按鈕 -->
    <div
      v-if="intensitySubTypeData && intensitySubTypeData.length > 0"
      class="flex justify-center mb-6"
    >
      <n-tabs v-model:value="activeChart" type="segment" size="large" class="w-fit">
        <n-tab-pane name="main" tab="訓練類型分布" />
        <n-tab-pane name="intensity" tab="強度訓練分布" />
      </n-tabs>
    </div>

    <!-- 圓餅圖容器 -->
    <div class="relative overflow-visible">
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
        />
        <div v-else class="flex items-center justify-center h-80 text-gray-500">
          暫無強度訓練資料
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { NTabs, NTabPane } from 'naive-ui'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import type { TrainingRecord } from '@/types/training'
import {
  MAIN_CATEGORIES,
  INTENSITY_SUB_TYPES,
  Intensity,
  matchTrainingType,
  type RunType,
} from '@/types/run-types'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

interface Props {
  records: TrainingRecord[]
}

const props = defineProps<Props>()

// 當前顯示的圖表
const activeChart = ref<'main' | 'intensity'>('main')

const mainChartRef = ref()
const intensityChartRef = ref()

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

// 分類訓練記錄的函數
const categorizeTrainingRecord = (record: TrainingRecord) => {
  const matches = matchTrainingType(record.name)

  // 如果沒有匹配到，返回null
  if (matches.length === 0) return { mainCategory: null, subCategory: null }

  // 找到最具體的類型（有父類別的）
  const specificType = matches.find((type) => type.parent) || matches[0]

  // 確定主分類
  let mainCategory: RunType | null = null
  if (specificType.parent) {
    mainCategory = specificType.parent
  } else {
    mainCategory = MAIN_CATEGORIES.find((cat) => cat.code === specificType.code) || null
  }

  return {
    mainCategory,
    subCategory: specificType.parent ? specificType : null,
  }
}

// 主要分類數據
const mainCategoryData = computed(() => {
  if (!props.records || props.records.length === 0) return []

  const categoryStats = new Map<string, { distance: number; count: number; runType: RunType }>()

  // 初始化所有主分類
  MAIN_CATEGORIES.forEach((category) => {
    categoryStats.set(category.code, { distance: 0, count: 0, runType: category })
  })

  // 其他分類（未匹配的）
  categoryStats.set('OTHER', {
    distance: 0,
    count: 0,
    runType: { code: 'OTHER', name: 'Other', chineseName: '其他' },
  })

  props.records.forEach((record) => {
    const { mainCategory } = categorizeTrainingRecord(record)

    if (mainCategory) {
      const stats = categoryStats.get(mainCategory.code)
      if (stats) {
        stats.distance += record.distance
        stats.count += 1
      }
    } else {
      // 未匹配的歸類為其他
      const stats = categoryStats.get('OTHER')
      if (stats) {
        stats.distance += record.distance
        stats.count += 1
      }
    }
  })

  // 過濾掉沒有數據的分類
  return Array.from(categoryStats.values())
    .filter((stats) => stats.count > 0)
    .map((stats) => ({
      name: stats.runType.chineseName,
      value: Number(stats.distance.toFixed(1)),
      count: stats.count,
    }))
})

// 強度訓練子分類數據
const intensitySubTypeData = computed(() => {
  if (!props.records || props.records.length === 0) return []

  const subTypeStats = new Map<string, { distance: number; count: number; runType: RunType }>()

  // 初始化所有強度訓練子分類
  INTENSITY_SUB_TYPES.forEach((subType) => {
    subTypeStats.set(subType.code, { distance: 0, count: 0, runType: subType })
  })

  props.records.forEach((record) => {
    const { mainCategory, subCategory } = categorizeTrainingRecord(record)

    // 只統計強度訓練的子分類
    if (mainCategory && mainCategory.code === Intensity.code && subCategory) {
      const stats = subTypeStats.get(subCategory.code)
      if (stats) {
        stats.distance += record.distance
        stats.count += 1
      }
    }
  })

  // 過濾掉沒有數據的子分類
  return Array.from(subTypeStats.values())
    .filter((stats) => stats.count > 0)
    .map((stats) => ({
      name: stats.runType.chineseName,
      value: Number(stats.distance.toFixed(1)),
      count: stats.count,
    }))
})

// 主要分類圖表選項
const mainCategoryOption = computed(() => {
  if (!mainCategoryData.value || mainCategoryData.value.length === 0) return {}

  return {
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        const data = params.data
        return `${data.name}: ${data.value}km<br/>次數: ${data.count}次<br/>佔比: ${params.percent}%`
      },
      appendToBody: true,
      confine: false,
    },
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
        center: ['50%', '40%'],
        data: mainCategoryData.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
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
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']
            return colors[params.dataIndex % colors.length]
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
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        const data = params.data
        return `${data.name}: ${data.value}km<br/>次數: ${data.count}次<br/>佔比: ${params.percent}%`
      },
      appendToBody: true,
      confine: false,
    },
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
        center: ['50%', '40%'],
        data: intensitySubTypeData.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
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
