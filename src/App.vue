<template>
  <n-config-provider>
    <n-global-style />
    <div class="app-layout">
      <NavBar />
      <main class="main-content">
        <router-view />
      </main>
      <Footer />
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NGlobalStyle } from 'naive-ui'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.main-content {
  padding-top: 70px; /* 給 NavBar 留出空間，避免內容被遮住 */
  padding-bottom: 80px; /* 給 Footer 留出空間，避免內容被遮住 */
}
</style>
