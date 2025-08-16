<template>
  <div class="w-full h-full">
    <v-chart
      v-if="chartData && chartData.length > 0"
      :option="chartOption"
      class="w-full h-64"
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
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import type { TrainingRecord } from '@/stores/training'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

interface Props {
  records: TrainingRecord[]
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
  if (!props.records || props.records.length === 0) return []

  const mainTrainingRecords = props.records.filter((r) => r.isMainTraining)
  const casualTrainingRecords = props.records.filter((r) => !r.isMainTraining)

  const mainTrainingDistance = mainTrainingRecords.reduce((sum, r) => sum + r.distance, 0)
  const casualTrainingDistance = casualTrainingRecords.reduce((sum, r) => sum + r.distance, 0)

  return [
    {
      name: '主訓練',
      value: Number(mainTrainingDistance.toFixed(1)),
      count: mainTrainingRecords.length,
    },
    {
      name: '副項',
      value: Number(casualTrainingDistance.toFixed(1)),
      count: casualTrainingRecords.length,
    },
  ]
})

const chartOption = computed(() => {
  if (!chartData.value || chartData.value.length === 0) return {}

  return {
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        const data = params.data
        return `${params.seriesName}<br/>${data.name}: ${data.value}km<br/>次數: ${data.count}次<br/>佔比: ${params.percent}%`
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '訓練類型',
        type: 'pie',
        radius: '50%',
        data: chartData.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        itemStyle: {
          color: (params: any) => {
            const colors = ['#3b82f6', '#10b981']
            return colors[params.dataIndex % colors.length]
          },
        },
      },
    ],
  }
})
</script>
