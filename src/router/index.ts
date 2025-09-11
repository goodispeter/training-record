import { createRouter, createWebHistory } from 'vue-router'
import TrainingDashboard from '@/views/TrainingDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/pan/2025/taipei',
    },
    {
      path: '/:person/:year/:target',
      name: 'dashboard',
      component: TrainingDashboard,
      props: true,
    },
    // 處理舊的路由格式，重導到 2025 年
    {
      path: '/:person/:target',
      redirect: (to) => `/pan/2025/taipei`,
    },
    // 處理所有未匹配的路由，重導到預設頁面
    {
      path: '/:pathMatch(.*)*',
      redirect: '/pan/2025/taipei',
    },
  ],
})

export default router
