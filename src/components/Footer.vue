<template>
  <n-layout-footer class="footer-container">
    <div class="footer-content">
      <span class="footer-text">Created by</span>
      <n-button
        text
        tag="a"
        :href="instagramUrl"
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
    </div>
  </n-layout-footer>
</template>

<script setup lang="ts">
import { NLayoutFooter, NButton, NIcon } from 'naive-ui'

const instagramUrl = 'https://www.instagram.com/goodispeter?igsh=YzByaWIwMHlnN2hy&utm_source=qr'
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

.footer-text {
  color: #6b7280;
  margin-right: 10px;
}

.ig-button {
  color: #6b7280;
  transition: color 0.2s ease;
}

.ig-button:hover {
  color: #e1306c; /* Instagram brand color */
}
</style>
