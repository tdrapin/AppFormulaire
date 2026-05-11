import { createRouter, createWebHistory } from 'vue-router'

const routes = [
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
  },
  {
    path: '/test-lab',
    name: 'TestLab',
    component: () => import('../pages/TestLab.vue')
  },
  {
    path: '/mobile',
    component: () => import('../layouts/MobileAppLayout.vue'),
    children: [
      { path: '', name: 'MobileHome', redirect: { name: 'MobileFormList' } },
      {
        path: 'forms',
        name: 'MobileFormList',
        component: () => import('../pages/mobile/MobileFormList.vue')
      },
      {
        path: 'forms/new',
        name: 'MobileFormNew',
        component: () => import('../pages/mobile/MobileFormBuilder.vue')
      },
      {
        path: 'forms/:formId/edit',
        name: 'MobileFormEdit',
        component: () => import('../pages/mobile/MobileFormBuilder.vue')
      },
      {
        path: 'report/:formId',
        name: 'MobileReportFill',
        component: () => import('../pages/mobile/MobileReportFill.vue')
      },
      {
        path: 'report/:formId/summary',
        name: 'MobileReportSummary',
        component: () => import('../pages/mobile/MobileReportSummary.vue')
      },
      {
        path: 'history/:reportId',
        name: 'MobileReportDetail',
        component: () => import('../pages/mobile/MobileReportDetail.vue')
      },
      {
        path: 'history',
        name: 'MobileHistory',
        component: () => import('../pages/mobile/MobileReportHistory.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
