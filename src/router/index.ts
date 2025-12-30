import { createRouter, createWebHistory } from 'vue-router'
import TrainingDashboard from '@/views/TrainingDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/pan/2026tokyo',
    },
    {
      path: '/:person/:target',
      name: 'dashboard',
      component: TrainingDashboard,
      props: true,
    },
    // 處理所有未匹配的路由，重導到預設頁面
    {
      path: '/:pathMatch(.*)*',
      redirect: '/pan/2026tokyo',
    },
  ],
})

export default router
