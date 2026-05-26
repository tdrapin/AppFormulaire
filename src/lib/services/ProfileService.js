/**
 * ProfileService — Gestion des utilisateurs via Edge Function Supabase
 *
 * Cette version appelle une Edge Function Supabase qui utilise la clé
 * service_role côté serveur pour les opérations Admin Auth.
 *
 * ⚠️ Configuration requise dans Supabase :
 *   1. Déployer la fonction 'admin-users' (supabase/functions/admin-users/index.ts)
 *   2. Définir la variable d'environnement VITE_SUPABASE_FUNCTIONS_URL
 *      dans le fichier .env (ex: https://xxx.supabase.co/functions/v1)
 *   3. L'Edge Function vérifie que l'utilisateur appelant a le rôle "admin"
 *      dans user_metadata avant d'exécuter les opérations.
 */
import { supabase, assertSupabaseConfigured } from '../supabaseClient'

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || ''

async function callFunction(method, path, body = null) {
  assertSupabaseConfigured()

  if (!FUNCTIONS_URL) {
    throw new Error(
      'VITE_SUPABASE_FUNCTIONS_URL non défini. ' +
      'Ajoutez VITE_SUPABASE_FUNCTIONS_URL dans .env ' +
      '(ex: https://xxx.supabase.co/functions/v1)'
    )
  }

  // Récupérer le token JWT de l'utilisateur connecté
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  if (!token) {
    throw new Error('Vous devez être connecté pour gérer les comptes.')
  }

  const url = `${FUNCTIONS_URL}/admin-users${path || ''}`
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(url, options)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error || `Erreur ${res.status}`)
  }

  return data
}

/**
 * Récupère tous les utilisateurs via l'Edge Function.
 */
async function getAllUsers() {
  const data = await callFunction('GET', '')
  return data.users || []
}

/**
 * Crée un nouvel utilisateur.
 */
async function createUser(email, password, fullName, role) {
  const data = await callFunction('POST', '', {
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
  const data = await callFunction('PUT', `?id=${userId}`, {
    role: newRole
  })
  return data.user
}

/**
 * Met à jour les informations d'un utilisateur (nom, email).
 */
async function updateUser(userId, updates) {
  const data = await callFunction('PUT', `?id=${userId}`, {
    email: updates.email,
    full_name: updates.full_name
  })
  return data.user
}

/**
 * Supprime un utilisateur.
 */
async function deleteUser(userId) {
  await callFunction('DELETE', `?id=${userId}`)
  return true
}

export default {
  getAllUsers,
  createUser,
  updateUserRole,
  updateUser,
  deleteUser
}
