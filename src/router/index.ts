import { createRouter, createWebHistory } from 'vue-router'
import TrainingDashboard from '@/views/TrainingDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/pan/taipei',
    },
    {
      path: '/:person/:target',
      name: 'dashboard',
      component: TrainingDashboard,
      props: true,
    },
  ],
})

export default router
