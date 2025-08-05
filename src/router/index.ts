import { createRouter, createWebHistory } from 'vue-router'
import TrainingDashboard from '@/views/TrainingDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: TrainingDashboard,
    },
  ],
})

export default router
