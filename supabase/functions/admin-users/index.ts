/**
 * Edge Function Supabase — Gestion des utilisateurs (Admin)
 *
 * Cette fonction utilise la clé service_role (disponible via Supabase
 * en interne) pour effectuer des opérations d'administration sur Auth.
 *
 * Endpoints :
 *   GET    /admin-users          → liste tous les utilisateurs
 *   POST   /admin-users          → crée un utilisateur
 *   PUT    /admin-users?id=xxx   → modifie un utilisateur
 *   DELETE /admin-users?id=xxx   → supprime un utilisateur
 *
 * Sécurité : seuls les utilisateurs authentifiés avec le rôle "admin"
 * dans user_metadata peuvent appeler cette fonction.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  try {
    // ── Authentification : vérifier le token JWT ──────────────
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token manquant' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Créer un client Supabase avec le token de l'utilisateur
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Vérifier le token et le rôle
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Token invalide' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const role = user.user_metadata?.role || ''
    if (role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Accès refusé : rôle admin requis' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ── Routage selon la méthode HTTP ─────────────────────────
    const method = req.method
    const url = new URL(req.url)
    const userId = url.searchParams.get('id')

    if (method === 'GET') {
      // Liste tous les utilisateurs
      const { data, error } = await supabase.auth.admin.listUsers()
      if (error) throw error

      const users = (data?.users || []).map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || '',
        role: u.user_metadata?.role || 'terrain',
        created_at: u.created_at
      }))

      return new Response(JSON.stringify({ users }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (method === 'POST') {
      // Créer un utilisateur
      const body = await req.json()
      const { email, password, full_name, role: userRole } = body

      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email et mot de passe requis' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: full_name || '',
          role: userRole || 'terrain'
        }
      })

      if (error) throw error
      if (!data?.user) throw new Error('Échec de la création')

      return new Response(JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || '',
          role: data.user.user_metadata?.role || 'terrain'
        }
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (method === 'PUT') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Paramètre id requis' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const body = await req.json()
      const payload: any = {}

      if (body.email !== undefined) payload.email = body.email
      if (body.full_name !== undefined || body.role !== undefined) {
        payload.user_metadata = {}
        if (body.full_name !== undefined) payload.user_metadata.full_name = body.full_name
        if (body.role !== undefined) payload.user_metadata.role = body.role
      }

      const { data, error } = await supabase.auth.admin.updateUserById(userId, payload)
      if (error) throw error

      return new Response(JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || '',
          role: data.user.user_metadata?.role || 'terrain'
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (method === 'DELETE') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Paramètre id requis' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Méthode non supportée' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Erreur interne' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
