/**
 * ProfileService — Gestion des utilisateurs via Edge Function Supabase
 *
 * Utilise supabase.functions.invoke() qui gère automatiquement :
 * - l'ajout du header Authorization (Bearer JWT)
 * - l'ajout du header apikey
 * - les headers CORS
 *
 * ⚠️ Configuration requise dans Supabase :
 *   1. Déployer la fonction 'admin-users' (supabase/functions/admin-users/index.ts)
 *      > supabase functions deploy admin-users
 *   2. L'Edge Function vérifie que l'utilisateur appelant a le rôle "admin"
 *      dans user_metadata avant d'exécuter les opérations.
 */
import { supabase, assertSupabaseConfigured } from '../supabaseClient'

async function callFunction(method, body = null) {
  assertSupabaseConfigured()

  const { error, data } = await supabase.functions.invoke('admin-users', {
    method,
    body
  })

  if (error) {
    throw new Error(error.message || `Erreur ${error.status || 'inconnue'}`)
  }

  return data
}

/**
 * Récupère tous les utilisateurs via l'Edge Function.
 */
async function getAllUsers() {
  const data = await callFunction('GET')
  return data.users || []
}

/**
 * Crée un nouvel utilisateur.
 */
async function createUser(email, password, fullName, role) {
  const data = await callFunction('POST', {
    email,
    password,
    full_name: fullName || '',
    role: role || 'terrain'
  })
  return data.user
}

/**
 * Met à jour le rôle d'un utilisateur.
 */
async function updateUserRole(userId, newRole) {
  const data = await callFunction('PUT', {
    id: userId,
    role: newRole
  })
  return data.user
}

/**
 * Met à jour les informations d'un utilisateur (nom, email).
 */
async function updateUser(userId, updates) {
  const data = await callFunction('PUT', {
    id: userId,
    email: updates.email,
    full_name: updates.full_name
  })
  return data.user
}

/**
 * Supprime un utilisateur.
 */
async function deleteUser(userId) {
  await callFunction('DELETE', { id: userId })
  return true
}

export default {
  getAllUsers,
  createUser,
  updateUserRole,
  updateUser,
  deleteUser
}
