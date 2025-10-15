<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <!-- 賽事倒數計時器 -->
      <RaceCountdown v-if="raceDate" :race-date="raceDate" />

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
          <TrainingTypeChart
            :records="allRecords"
            :total-distance="trainingData?.totalDistance || 0"
            :total-moving-time="trainingData?.totalMovingTime || '0:0:0'"
            :total-records-count="allRecords.length"
            :key="`type-${chartKey}`"
          />
        </div>
      </div>
      <div v-if="trainingData && allRecords.length > 0" class="chart-container">
        <div style="margin-bottom: 16px; display: flex; justify-content: left">
          <n-button-group>
            <n-button
              :type="viewMode === 'week' ? 'primary' : 'default'"
              @click="viewMode = 'week'"
              size="medium"
            >
              📈 週統計
            </n-button>
            <n-button
              :type="viewMode === 'calendar' ? 'primary' : 'default'"
              @click="viewMode = 'calendar'"
              size="medium"
            >
              📅 日曆
            </n-button>
            <n-button
              :type="viewMode === 'table' ? 'primary' : 'default'"
              @click="viewMode = 'table'"
              size="medium"
            >
              📋 表格
            </n-button>
          </n-button-group>
        </div>
        <TrainingCalendar v-if="viewMode === 'calendar'" :records="allRecords" />
        <TrainingTable v-if="viewMode === 'table'" :records="allRecords" />
        <WeekTraining v-if="viewMode === 'week'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTrainingStore } from '@/stores/training'
import SummaryCard from '@/components/SummaryCard.vue'
import MonthlyStatsChart from '@/components/MonthlyStatsChart.vue'
import TrainingTypeChart from '@/components/TrainingTypeChart.vue'
import TrainingTable from '@/components/TrainingTable.vue'
import TrainingCalendar from '@/components/TrainingCalendar.vue'
import WeekTraining from '@/components/WeekTraining.vue'
import RaceCountdown from '@/components/RaceCountdown.vue'
import { TARGET_CONFIG } from '@/utils/personTargetConfig'

// 接收路由參數
interface Props {
  person: string
  target: string
}

const props = defineProps<Props>()
const store = useTrainingStore()
const router = useRouter()

const isMobile = ref(false)
const chartKey = ref(0)
const viewMode = ref<'calendar' | 'table' | 'week'>('week')

// 檢查是否為手機設備
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

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

// 使用 computed 確保響應性
const trainingData = computed(() => store.trainingData)
const allRecords = computed(() => store.allRecords)
const monthlyData = computed(() => store.monthlyData)
const target = computed(() => store.trainingData?.target)

// 取得目標比賽日期
const raceDate = computed(() => {
  const targetKey = props.target
  return TARGET_CONFIG[targetKey]?.raceDate || ''
})

// 載入資料的函數
const loadTrainingData = async () => {
  try {
    await store.fetchTrainingData(props.person, props.target)
  } catch (error) {
    // 如果不是預設路徑且載入失敗，重導到預設頁面
    if (!(props.person === 'pan' && props.target === '2025taipei')) {
      await router.push('/pan/2025taipei')
    }
  }
}

// 監聽路由參數變化
watch(
  () => [props.person, props.target],
  () => {
    loadTrainingData()
  },
  { immediate: false },
)

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', handleResize)
  loadTrainingData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
