<template>
  <nav class="navbar">
    <div class="navbar-container">
      <PersonTargetSwitcher
        v-if="person && year && target"
        :person="person"
        :year="year"
        :target="target"
      />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PersonTargetSwitcher from './PersonTargetSwitcher.vue'

const route = useRoute()

// 從路由參數取得 person、year 和 target
const person = computed(() => route.params.person as string)
const year = computed(() => route.params.year as string)
const target = computed(() => route.params.target as string)
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  flex-shrink: 0;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.navbar-controls {
  flex-shrink: 0;
}
</style>
