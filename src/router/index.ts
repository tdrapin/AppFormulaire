import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue')
  },
  {
    path: '/builder',
    name: 'Builder',
    component: () => import('../pages/Builder.vue')
  },
  {
    path: '/runner',
    name: 'Runner',
    component: () => import('../pages/Runner.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../pages/Admin.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
