/**
 * useAuth — Gestion de l'authentification Supabase + rôles
 * 
 * Fournit l'état utilisateur, les fonctions login/register/logout,
 * la persistance de session via Supabase Auth, et le rôle utilisateur
 * (terrain / concepteur / admin) stocké dans user.user_metadata.role.
 * 
 * Plus besoin de table profiles — le rôle est dans les métadonnées
 * de l'utilisateur Supabase Auth.
 */
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

// État global partagé entre tous les composants
const user = ref(null)
const session = ref(null)
const loading = ref(true)
const authError = ref('')
const userRole = ref(null) // 'terrain' | 'concepteur' | 'admin' | null

export function useAuth() {
  /**
   * Lit le rôle depuis user.user_metadata (pas de requête DB)
   */
  function readRoleFromUser() {
    if (!user.value) {
      userRole.value = null
      return null
    }
    const role = user.value.user_metadata?.role || null
    userRole.value = role
    return role
  }

  /**
   * Initialiser l'écouteur de session Supabase
   * Appelé une seule fois au montage de l'application
   */
  async function initAuth() {
    if (!isSupabaseConfigured()) {
      loading.value = false
      return
    }

    try {
      // Récupérer la session existante
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session.value = currentSession
      user.value = currentSession?.user ?? null
      if (user.value) {
        readRoleFromUser()
      }
    } catch (e) {
      console.warn('Erreur lors de la récupération de la session:', e.message)
    } finally {
      loading.value = false
    }

    // Écouter les changements d'authentification (login/logout/token refresh)
    supabase.auth.onAuthStateChange((event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
      if (user.value) {
        readRoleFromUser()
      } else {
        userRole.value = null
      }
    })
  }

  /**
   * Connexion avec email et mot de passe
   * Retourne { success: boolean, role: string|null }
   */
  async function login(email, password) {
    authError.value = ''
    if (!isSupabaseConfigured()) {
      authError.value = 'Supabase n\'est pas configuré.'
      return { success: false, role: null }
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        authError.value = error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : error.message
        return { success: false, role: null }
      }
      session.value = data.session
      user.value = data.user
      const role = readRoleFromUser()
      return { success: true, role }
    } catch (e) {
      authError.value = 'Erreur de connexion. Veuillez réessayer.'
      return { success: false, role: null }
    }
  }

  /**
   * Inscription avec email et mot de passe
   * Retourne { success: boolean, role: string|null }
   */
  async function register(email, password, fullName) {
    authError.value = ''
    if (!isSupabaseConfigured()) {
      authError.value = 'Supabase n\'est pas configuré.'
      return { success: false, role: null }
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
            role: 'terrain' // rôle par défaut pour les nouveaux inscrits
          }
        }
      })
      if (error) {
        authError.value = error.message
        return { success: false, role: null }
      }
      // Si l'inscription réussit, on connecte directement l'utilisateur
      let role = null
      if (data?.user) {
        user.value = data.user
        session.value = data.session
        role = readRoleFromUser()
        return { success: true, role }
      }
      return { success: true, role: null }
    } catch (e) {
      authError.value = 'Erreur lors de l\'inscription. Veuillez réessayer.'
      return { success: false, role: null }
    }
  }

  /**
   * Déconnexion
   */
  async function logout() {
    authError.value = ''
    if (!isSupabaseConfigured()) return
    try {
      await supabase.auth.signOut()
      user.value = null
      session.value = null
      userRole.value = null
    } catch (e) {
      console.warn('Erreur lors de la déconnexion:', e.message)
    }
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async function resetPassword(email) {
    authError.value = ''
    if (!isSupabaseConfigured()) {
      authError.value = 'Supabase n\'est pas configuré.'
      return false
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/login`
      })
      if (error) {
        authError.value = error.message
        return false
      }
      return true
    } catch (e) {
      authError.value = 'Erreur lors de l\'envoi de l\'email.'
      return false
    }
  }

  const isAuthenticated = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || '')
  const userFullName = computed(() => user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || '')

  // Computed pour les rôles
  const isTerrain = computed(() => userRole.value === 'terrain')
  const isConcepteur = computed(() => userRole.value === 'concepteur' || userRole.value === 'admin')
  const isAdmin = computed(() => userRole.value === 'admin')

  // Classe de thème CSS selon le rôle
  const themeClass = computed(() => {
    if (isAdmin.value) return 'theme-admin'
    if (isConcepteur.value) return 'theme-concepteur'
    return '' // terrain = thème par défaut (vert)
  })

  return {
    user,
    session,
    loading,
    authError,
    isAuthenticated,
    userEmail,
    userFullName,
    userRole,
    isTerrain,
    isConcepteur,
    isAdmin,
    themeClass,
    initAuth,
    login,
    register,
    logout,
    resetPassword
  }
}
