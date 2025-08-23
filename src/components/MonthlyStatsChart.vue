<template>
  <div class="w-full h-full">
    <v-chart
      v-if="chartData && chartData.length > 0"
      :option="chartOption"
      class="w-full h-64"
      width="100%"
      height="256px"
      ref="chartRef"
      :autoresize="true"
    />
    <div v-else class="flex items-center justify-center h-64 text-gray-500">暫無資料</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TitleComponent, LegendComponent, GridComponent } from 'echarts/components'
import type { MonthlyTrainingData } from '@/types/training'

use([CanvasRenderer, BarChart, TitleComponent, LegendComponent, GridComponent])

interface Props {
  monthlyData: MonthlyTrainingData[]
}

const props = defineProps<Props>()

const chartRef = ref()

// 處理視窗大小變化
const handleResize = () => {
  if (chartRef.value) {
    chartRef.value.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const chartData = computed(() => {
  if (!props.monthlyData || props.monthlyData.length === 0) return []

  return props.monthlyData
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
    .map((monthData) => ({
      month: `${monthData.month}月`,
      distance: Number(monthData.monthDistance.toFixed(1)),
      fullMonth: `${monthData.year}年${monthData.month}月`,
    }))
})

const chartOption = computed(() => {
  if (!chartData.value || chartData.value.length === 0) return {}

  const months = chartData.value.map((d) => d.month)
  const distances = chartData.value.map((d) => d.distance)

  return {
    silent: true,
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: {
        rotate: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '距離 (km)',
      axisLabel: {
        formatter: '{value} km',
      },
    },
    series: [
      {
        name: '月跑量',
        type: 'bar',
        data: distances,
        itemStyle: {
          color: '#3b82f6',
        },
        label: {
          show: true,
          position: 'top',
          formatter: function (params: any) {
            const data = chartData.value[params.dataIndex]
            return `${data.distance}km`
          },
          fontSize: 11,
          lineHeight: 14,
        },
      },
    ],
    grid: {
      top: 60,
      bottom: 60,
      left: 60,
      right: 20,
    },
  }
})
</script>
