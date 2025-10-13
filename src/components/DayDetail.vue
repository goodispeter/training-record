<template>
  <n-modal
    :show="show"
    preset="card"
    :title="title"
    style="width: 600px; max-width: 90vw"
    @update:show="$emit('update:show', $event)"
  >
    <div class="modal-content" :class="{ 'with-navigation': showNavigation }">
      <!-- 導航區域 -->
      <template v-if="showNavigation">
        <!-- 左側點擊區域 -->
        <div
          v-if="hasPrevious"
          class="nav-area nav-area-left"
          @click="$emit('previous')"
          title="上一次訓練"
        >
          <div class="nav-arrow">‹</div>
        </div>

        <!-- 右側點擊區域 -->
        <div
          v-if="hasNext"
          class="nav-area nav-area-right"
          @click="$emit('next')"
          title="下一次訓練"
        >
          <div class="nav-arrow">›</div>
        </div>
      </template>

      <!-- 訓練記錄內容 -->
      <div class="training-list">
        <div v-for="training in trainings" :key="training.id" class="training-detail-card">
          <div class="flex justify-between items-start">
            <div class="training-info">
              <div class="flex justify-between items-center">
                <h5 class="font-medium">{{ training.name }}</h5>
                <n-tag v-if="training.isMainTraining" type="success" size="small"> 主訓練 </n-tag>
              </div>
              <div class="text-sm text-gray-600" style="margin-top: 4px">
                <template
                  v-if="training.sportType !== 'WeightTraining' && training.sportType !== 'Yoga'"
                >
                  📏{{ formatDistance(training.distance) }}km ⏱️{{
                    formatTime(training.movingTime)
                  }}
                  ⚡{{ training.pace }}
                  <template v-if="training.averageHeartRate && training.maxHeartRate">
                    ❤️{{ training.averageHeartRate }} 🔥{{ training.maxHeartRate }}
                  </template>
                </template>
                <template v-else> ⏱️{{ formatTime(training.movingTime) }} </template>
              </div>
              <div
                v-if="training.description && training.description.trim()"
                class="training-description-modal"
              >
                {{ training.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { NModal, NTag } from 'naive-ui'
import type { TrainingRecord } from '@/types/training'
import { formatTime, formatDistance } from '@/utils/formatUtil'

interface Props {
  show: boolean
  title: string
  trainings: TrainingRecord[]
  showNavigation?: boolean
  hasPrevious?: boolean
  hasNext?: boolean
}

defineProps<Props>()

defineEmits<{
  'update:show': [value: boolean]
  previous: []
  next: []
}>()
</script>

<style scoped>
.modal-content {
  position: relative;
}

.modal-content.with-navigation {
  min-height: auto; /* 讓高度根據內容自動調整 */
}

.nav-area {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 80px; /* 固定高度而不是撐滿整個容器 */
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
}

.nav-area:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.08);
}

.nav-area-left {
  left: -20px;
}

.nav-area-right {
  right: -20px;
}

.nav-arrow {
  font-size: 24px;
  font-weight: bold;
  color: #666;
  user-select: none;
}

.training-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.training-detail-card {
  background-color: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.training-info {
  flex: 1;
}

.training-description-modal {
  margin-top: 8px;
  padding: 8px;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.4;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
