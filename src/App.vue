<template>
  <n-config-provider>
    <n-global-style />
    <router-view />
    <Footer />
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, NLayout, NLayoutContent } from 'naive-ui'
import Footer from '@/components/Footer.vue'
</script>

<style scoped></style>
