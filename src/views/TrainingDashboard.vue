<template>
  <div class="dashboard-container">
    <!-- Loading 狀態 -->
    <div v-if="store.isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">載入訓練資料中...</p>
      </div>
    </div>

    <!-- Error 狀態 -->
    <div v-else-if="store.error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">載入失敗</h2>
        <p class="text-gray-600 mb-4">{{ store.error }}</p>
        <button
          @click="store.fetchTrainingData()"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          重新載入
        </button>
      </div>
    </div>

    <!-- 正常顯示內容 -->
    <div v-else class="dashboard-content">
      <!-- Header -->
      <div class="dashboard-header">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">雪梨馬訓練日誌</h1>
        <p class="text-gray-600">共 {{ totalRecords }} 筆訓練記錄</p>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards-grid">
        <SummaryCard title="總距離" :value="trainingData?.totalDistance" unit="km" icon="🏃" />
        <SummaryCard title="總時間" :value="trainingData?.totalMovingTime" unit="" icon="⏱️" />
        <SummaryCard
          title="主訓練次數"
          :value="trainingData?.mainTrainingCount"
          unit="次"
          icon="🎯"
        />
        <SummaryCard title="總爬升" :value="trainingData?.totalElevationGain" unit="m" icon="⛰️" />
      </div>

      <!-- Charts -->
      <div v-if="trainingData && monthlyData.length > 0" class="charts-grid" :key="chartKey">
        <div class="chart-container h-80">
          <h3 class="text-lg font-semibold mb-4">每月跑量統計</h3>
          <MonthlyStatsChart :monthly-data="monthlyData" :key="`monthly-${chartKey}`" />
        </div>
        <div class="chart-container h-80">
          <TrainingTypeChart :records="allRecords" :key="`type-${chartKey}`" />
        </div>
      </div>

      <!-- Mobile: Table, Desktop: Calendar -->
      <div v-if="trainingData && allRecords.length > 0" class="responsive-content">
        <!-- 手機顯示表格 -->
        <div v-if="isMobile">
          <TrainingTable :records="allRecords" />
        </div>
        <!-- 桌機顯示日曆 -->
        <div v-else>
          <TrainingCalendar :records="allRecords" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, nextTick } from 'vue'
import { useTrainingStore } from '@/stores/training'
import SummaryCard from '@/components/SummaryCard.vue'
import MonthlyStatsChart from '@/components/MonthlyStatsChart.vue'
import TrainingTypeChart from '@/components/TrainingTypeChart.vue'
import TrainingTable from '@/components/TrainingTable.vue'
import TrainingCalendar from '@/components/TrainingCalendar.vue'

const store = useTrainingStore()

// 響應式狀態
const isMobile = ref(false)
const chartKey = ref(0) // 用於強制重新渲染圖表

// 檢查是否為手機設備
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 強制圖表重新渲染
const forceChartsResize = async () => {
  chartKey.value++
  await nextTick()
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'))
  }, 100)
}

// 處理視窗大小變化
const handleResize = () => {
  const wasMobile = isMobile.value
  checkIsMobile()

  if (wasMobile !== isMobile.value) {
    forceChartsResize()
  }
}

const trainingData = computed(() => store.trainingData)
const allRecords = computed(() => store.allRecords)
const monthlyData = computed(() => store.monthlyData)
const totalRecords = computed(() => allRecords.value.length)

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', handleResize)
  store.fetchTrainingData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
