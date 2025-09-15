<template>
  <n-layout-footer class="footer-container">
    <div class="footer-content">
      <n-button
        text
        tag="a"
        :href="panUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="ig-button"
      >
        <template #icon>
          <n-icon size="20">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                ry="5"
                stroke="currentColor"
                stroke-width="2"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
              <path
                d="M16.5 7.5h.01"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </n-icon>
        </template>
        @goodispeter
      </n-button>
      <n-divider vertical style="margin: 0 16px" />
      <n-button text @click="showDaysModal = true" style="color: #999; font-size: 13px">
        {{ days }}
      </n-button>
      <n-divider vertical style="margin: 0 16px" />
      <n-button
        text
        tag="a"
        :href="sungUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="ig-button"
      >
        <template #icon>
          <n-icon size="20">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                ry="5"
                stroke="currentColor"
                stroke-width="2"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
              <path
                d="M16.5 7.5h.01"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </n-icon>
        </template>
        @csi_run_sis
      </n-button>
    </div>

    <!-- 天數詳細彈窗 -->
    <n-modal
      v-model:show="showDaysModal"
      :mask-closable="true"
      :auto-focus="false"
      :close-on-esc="true"
      :z-index="2025"
      :trap-focus="false"
      :block-scroll="false"
      :animated="false"
      :mask-style="{ backgroundColor: 'rgba(0,0,0,0.08)' }"
    >
      <n-card
        style="width: 240px; box-shadow: none"
        :bordered="true"
        size="small"
        role="dialog"
        aria-modal="true"
      >
        <div style="text-align: center; padding: 12px 0">
          <n-text depth="3" style="font-size: 14px; display: block; margin-bottom: 8px">
            {{ formattedDuration }}
          </n-text>
          <n-text depth="3" style="font-size: 14px; display: block"> 總計 {{ days }} 天 </n-text>
        </div>
      </n-card>
    </n-modal>
  </n-layout-footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NLayoutFooter, NButton, NIcon, NDivider, NModal, NCard, NText } from 'naive-ui'

const panUrl = 'https://www.instagram.com/goodispeter?igsh=YzByaWIwMHlnN2hy&utm_source=qr'
const sungUrl = 'https://www.instagram.com/csi_run_sis?igsh=MXMxbXk0cnJhcWthcw=='

// 計算天數
const startDate = new Date('2025-01-03')
const today = new Date()
const days = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

// 彈窗狀態
const showDaysModal = ref(false)

// 計算年月日
const formattedDuration = computed(() => {
  const start = new Date('2025-01-03')
  const now = new Date()

  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  let daysDiff = now.getDate() - start.getDate()

  if (daysDiff < 0) {
    months--
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    daysDiff += lastMonth.getDate()
  }

  if (months < 0) {
    years--
    months += 12
  }

  if (years > 0) {
    return `${years} 年 ${months} 個月 ${daysDiff} 日`
  } else {
    return `${months} 個月 ${daysDiff} 日`
  }
})
</script>

<style scoped>
.footer-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  border-top: 1px solid #e9ecef;
  padding: 16px 0;
  background-color: #f8f9fa;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.ig-button {
  color: #6b7280;
  transition: color 0.2s ease;
}

.ig-button:hover {
  color: #e1306c; /* Instagram brand color */
}
</style>
