<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
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
      <div class="charts-grid">
        <div class="chart-container h-80">
          <h3 class="text-lg font-semibold mb-4">每月跑量統計</h3>
          <MonthlyStatsChart :monthly-data="monthlyData" />
        </div>
        <div class="chart-container h-80">
          <h3 class="text-lg font-semibold mb-4">訓練類型分布</h3>
          <TrainingTypeChart :records="allRecords" />
        </div>
      </div>

      <!-- Mobile: Table, Desktop: Calendar -->
      <div class="responsive-content">
        <!-- 手機顯示表格 -->
        <div class="mobile-only">
          <TrainingTable :records="allRecords" />
        </div>
        <!-- 桌機顯示日曆 -->
        <div class="desktop-only">
          <TrainingCalendar :records="allRecords" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTrainingStore } from '@/stores/training'
import SummaryCard from '@/components/SummaryCard.vue'
import MonthlyStatsChart from '@/components/MonthlyStatsChart.vue'
import TrainingTypeChart from '@/components/TrainingTypeChart.vue'
import TrainingTable from '@/components/TrainingTable.vue'
import TrainingCalendar from '@/components/TrainingCalendar.vue'

const store = useTrainingStore()

const trainingData = computed(() => store.trainingData)
const allRecords = computed(() => store.allRecords)
const monthlyData = computed(() => store.monthlyData)
const totalRecords = computed(() => allRecords.value.length)

onMounted(() => {
  store.fetchTrainingData()
})
</script>
