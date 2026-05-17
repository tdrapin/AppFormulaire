import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue')
  },
  {
    path: '/hub',
    name: 'Hub',
    component: () => import('../pages/Hub.vue')
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
        meta: { hideBottomNav: true },
        component: () => import('../pages/mobile/MobileFormBuilder.vue')
      },
      {
        path: 'forms/:formId/edit',
        name: 'MobileFormEdit',
        meta: { hideBottomNav: true },
        component: () => import('../pages/mobile/MobileFormBuilder.vue')
      },
      {
        path: 'report/:formId',
        name: 'MobileReportFill',
        meta: { hideBottomNav: true },
        component: () => import('../pages/mobile/MobileReportFill.vue')
      },
      {
        path: 'report/:formId/summary',
        name: 'MobileReportSummary',
        meta: { hideBottomNav: true },
        component: () => import('../pages/mobile/MobileReportSummary.vue')
      },
      {
        path: 'history/:reportId',
        name: 'MobileReportDetail',
        meta: { hideBottomNav: true },
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
    meta: { hideBottomNav: true },
    component: () => import('../pages/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
