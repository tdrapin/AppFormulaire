/**
 * ProfileService — Gestion des utilisateurs via l'API Supabase Auth Admin
 * 
 * ⚠️ ATTENTION : L'API Admin de Supabase (client.auth.admin.*) nécessite
 * une clé `service_role` et NON la clé anon. Elle ne doit être utilisée
 * que depuis un environnement sécurisé (backend, Edge Function, ou
 * configuration spéciale du client Supabase avec la clé service_role).
 * 
 * En environnement client (navigateur), ces appels échoueront avec
 * une erreur 401/403 si seule la clé anon est configurée.
 * 
 * Solution recommandée : déplacer ces fonctions vers une Edge Function
 * Supabase ou un backend sécurisé.
 * 
 * Le rôle est stocké dans user.user_metadata.role (plus de table profiles).
 */
import { assertSupabaseConfigured, supabase } from '../supabaseClient'

function ensureClient() {
  assertSupabaseConfigured()
  return supabase
}

/**
 * Récupère tous les utilisateurs via l'API Auth Admin.
 * Nécessite les droits admin (clé service_role).
 */
async function getAllUsers() {
  const client = ensureClient()
  const { data, error } = await client.auth.admin.listUsers()
  if (error) throw error
  // Filtrer les infos utiles + extraire le rôle depuis user_metadata
  return (data?.users || []).map(u => ({
    id: u.id,
    email: u.email,
    full_name: u.user_metadata?.full_name || '',
    role: u.user_metadata?.role || 'terrain',
    created_at: u.created_at
  }))
}

/**
 * Crée un nouvel utilisateur avec email, mot de passe, nom et rôle.
 */
async function createUser(email, password, fullName, role) {
  const client = ensureClient()
  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName || '',
      role: role || 'terrain'
    }
  })
  if (error) throw error
  if (!data?.user) throw new Error('Échec de la création de l\'utilisateur')
  return {
    id: data.user.id,
    email: data.user.email,
    full_name: data.user.user_metadata?.full_name || '',
    role: data.user.user_metadata?.role || 'terrain'
  }
}

/**
 * Met à jour le rôle d'un utilisateur via l'API Auth Admin.
 */
async function updateUserRole(userId, newRole) {
  const client = ensureClient()
  const { data, error } = await client.auth.admin.updateUserById(userId, {
    user_metadata: { role: newRole }
  })
  if (error) throw error
  return {
    id: data.user.id,
    email: data.user.email,
    full_name: data.user.user_metadata?.full_name || '',
    role: data.user.user_metadata?.role || 'terrain'
  }
}

/**
 * Met à jour les informations d'un utilisateur (nom, email).
 */
async function updateUser(userId, updates) {
  const client = ensureClient()
  const metadataUpdates = {}
  if (updates.full_name !== undefined) metadataUpdates.full_name = updates.full_name

  const payload = {}
  if (updates.email !== undefined) payload.email = updates.email
  if (Object.keys(metadataUpdates).length > 0) payload.user_metadata = metadataUpdates

  const { data, error } = await client.auth.admin.updateUserById(userId, payload)
  if (error) throw error
  return {
    id: data.user.id,
    email: data.user.email,
    full_name: data.user.user_metadata?.full_name || '',
    role: data.user.user_metadata?.role || 'terrain'
  }
}

/**
 * Supprime un utilisateur (auth.users + cascade).
 */
async function deleteUser(userId) {
  const client = ensureClient()
  const { error } = await client.auth.admin.deleteUser(userId)
  if (error) throw error
  return true
}

export default {
  getAllUsers,
  createUser,
  updateUserRole,
  updateUser,
  deleteUser
}
