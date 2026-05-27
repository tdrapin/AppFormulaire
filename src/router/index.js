import { createRouter, createWebHistory } from 'vue-router'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

/**
 * Récupère le rôle depuis user_metadata (pas de requête DB)
 */
function getRoleFromSession(session) {
  return session?.user?.user_metadata?.role || null
}

/**
 * Vérifie si l'utilisateur est connecté.
 */
async function requireAuth(to, from, next) {
  if (!isSupabaseConfigured()) {
    next()
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } catch {
    next({ name: 'Login' })
  }
}

/**
 * Vérifie que l'utilisateur a le bon rôle.
 * @param {string[]} roles - Rôles autorisés
 */
function requireRole(roles) {
  return async (to, from, next) => {
    if (!isSupabaseConfigured()) {
      next()
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
      }

      const role = getRoleFromSession(session)

      if (!role) {
        next({ name: 'MobileFormList' })
        return
      }

      if (!roles.includes(role)) {
        if (role === 'terrain') {
          next({ name: 'MobileFormList' })
        } else {
          next({ name: 'DesignerFormList' })
        }
        return
      }

      next()
    } catch {
      next({ name: 'Login' })
    }
  }
}

const routes = [
  // ─── Authentification ────────────────────────────────────────
  {
    path: '/auth',
    component: () => import('../layouts/MobileAppLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        meta: { hideBottomNav: true },
        component: () => import('../pages/auth/Login.vue')
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        meta: { hideBottomNav: true },
        component: () => import('../pages/auth/ForgotPassword.vue')
      }
    ]
  },

  // ─── Redirection racine vers Login (ou interface selon rôle) ─
  {
    path: '/',
    name: 'Root',
    async beforeEnter(to, from, next) {
      if (!isSupabaseConfigured()) {
        next({ name: 'MobileFormList' })
        return
      }
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          next({ name: 'Login' })
          return
        }
        const role = getRoleFromSession(session)
        
        if (role === 'terrain') {
          next({ name: 'MobileFormList' })
        } else if (role === 'concepteur' || role === 'admin') {
          next({ name: 'DesignerFormList' })
        } else {
          next({ name: 'MobileFormList' })
        }
      } catch (e) {
        console.warn('Erreur beforeEnter racine:', e.message)
        next({ name: 'Login' })
      }
    }
  },

  // ─── Parcours Terrain (saisie + historique + export) ───────
  {
    path: '/mobile',
    component: () => import('../layouts/MobileAppLayout.vue'),
    beforeEnter: requireAuth,
    children: [
      { path: '', name: 'MobileHome', redirect: { name: 'MobileFormList' } },
      {
        path: 'forms',
        name: 'MobileFormList',
        component: () => import('../pages/mobile/MobileFormList.vue')
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
      },
      {
        path: 'history/batch',
        name: 'MobileBatchDetail',
        meta: { hideBottomNav: true },
        component: () => import('../pages/mobile/MobileBatchDetail.vue')
      },
      // ─── Outils Terrain ──────────────────────────────────────
      {
        path: 'tools',
        name: 'MobileTools',
        component: () => import('../pages/tools/ToolsHome.vue')
      },
      {
        path: 'tools/settings',
        name: 'MobileToolsSettings',
        component: () => import('../pages/tools/ToolsSettings.vue')
      }
    ]
  },

  // ─── Parcours Concepteur (création + gabarits + instances) ──
  {
    path: '/designer',
    component: () => import('../layouts/MobileAppLayout.vue'),
    beforeEnter: requireRole(['concepteur', 'admin']),
    children: [
      { path: '', name: 'DesignerHome', redirect: { name: 'DesignerFormList' } },
      {
        path: 'forms',
        name: 'DesignerFormList',
        component: () => import('../pages/designer/DesignerFormList.vue')
      },
      {
        path: 'forms/new',
        name: 'DesignerFormNew',
        meta: { hideBottomNav: true },
        component: () => import('../pages/designer/DesignerFormBuilder.vue')
      },
      {
        path: 'forms/:formId/edit',
        name: 'DesignerFormEdit',
        meta: { hideBottomNav: true },
        component: () => import('../pages/designer/DesignerFormBuilder.vue')
      },
      {
        path: 'forms/:formId/templates',
        name: 'DesignerTemplates',
        meta: { hideBottomNav: true },
        component: () => import('../pages/designer/DesignerTemplates.vue')
      },
      // ─── Outils Concepteur ───────────────────────────────────
      {
        path: 'tools',
        name: 'DesignerTools',
        component: () => import('../pages/tools/ToolsHome.vue')
      },
      {
        path: 'tools/settings',
        name: 'DesignerToolsSettings',
        component: () => import('../pages/tools/ToolsSettings.vue')
      },
      // ─── Gestion des comptes (admin uniquement) ──────────────
      {
        path: 'admin/accounts',
        name: 'AdminAccounts',
        beforeEnter: requireRole(['admin']),
        component: () => import('../pages/admin/AccountManagement.vue')
      }
    ]
  },

  // ─── 404 ───────────────────────────────────────────────────
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

// ─── Guard global : protéger les routes privées ───────────────
// Vérifie à chaque navigation que l'utilisateur est connecté
// avant d'accéder aux routes protégées (/mobile/*, /designer/*).
router.beforeEach(async (to, from, next) => {
  // Routes publiques : auth/* et 404
  if (to.path.startsWith('/auth') || to.name === 'NotFound') {
    next()
    return
  }

  // Si Supabase n'est pas configuré, laisser passer
  if (!isSupabaseConfigured()) {
    next()
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // Pas de session → rediriger vers login (sauf si déjà sur /)
      if (to.path === '/') {
        next({ name: 'Login' })
      } else {
        next({ name: 'Login', query: { redirect: to.fullPath } })
      }
      return
    }

    // Session valide → laisser passer (les beforeEnter des routes
    // enfants feront les vérifications de rôle si nécessaire)
    next()
  } catch {
    next({ name: 'Login' })
  }
})

export default router
