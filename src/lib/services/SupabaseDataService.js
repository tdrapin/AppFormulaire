import { assertSupabaseConfigured, supabase } from '../supabaseClient'

function ensureClient() {
  assertSupabaseConfigured()
  return supabase
}

/**
 * Récupère l'ID de l'utilisateur connecté (ou null si anonyme).
 */
function getCurrentUserId() {
  return supabase?.auth?.getSession()?.then(({ data }) => data?.session?.user?.id ?? null) ?? null
}

/**
 * Génère un nom unique horodaté pour une instance.
 * Format : "Rapport_2025-05-13_11h30m45"
 */
function generateInstanceName() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${pad(now.getHours())}h${pad(now.getMinutes())}m${pad(now.getSeconds())}`
  return `Rapport_${date}_${time}`
}

// ─── Formulaires ───────────────────────────────────────────────

async function getForms() {
  const client = ensureClient()
  const { data, error } = await client
    .from('formulaires')
    .select('id, nom, schema_json, gabarit_actif_id, user_id, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function getFormById(formId) {
  const client = ensureClient()
  const { data, error } = await client
    .from('formulaires')
    .select('id, nom, schema_json, gabarit_actif_id, user_id, created_at')
    .eq('id', formId)
    .single()

  if (error) throw error
  return data
}

async function createForm(nom, schemaJson) {
  const client = ensureClient()
  const session = await supabase.auth.getSession()
  const userId = session?.data?.session?.user?.id ?? null

  const { data, error } = await client
    .from('formulaires')
    .insert({
      nom,
      schema_json: schemaJson,
      user_id: userId
    })
    .select('id, nom, schema_json, gabarit_actif_id, user_id, created_at')
    .single()

  if (error) throw error
  return data
}

/**
 * Met à jour un formulaire (sans versionnement).
 */
async function updateForm(formId, { nom, schema_json }) {
  const client = ensureClient()
  const payload = {}
  if (nom !== undefined) payload.nom = nom
  if (schema_json !== undefined) payload.schema_json = schema_json

  const { data, error } = await client
    .from('formulaires')
    .update(payload)
    .eq('id', formId)
    .select('id, nom, schema_json, gabarit_actif_id, user_id, created_at')
    .single()

  if (error) throw error
  return data
}

// ─── Instances ─────────────────────────────────────────────────

async function createInstance(formId, donneesJson) {
  const client = ensureClient()
  const session = await supabase.auth.getSession()
  const userId = session?.data?.session?.user?.id ?? null

  const payload = {
    formulaire_id: formId,
    donnees_json: donneesJson,
    nom: generateInstanceName(),
    user_id: userId
  }

  const { data, error } = await client
    .from('instances')
    .insert(payload)
    .select('id, formulaire_id, donnees_json, nom, user_id, created_at')
    .single()

  if (error) throw error
  return data
}

async function getInstancesByFormId(formId) {
  const client = ensureClient()
  const { data, error } = await client
    .from('instances')
    .select('id, formulaire_id, donnees_json, nom, user_id, created_at')
    .eq('formulaire_id', formId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function getInstanceById(instanceId) {
  const client = ensureClient()
  const { data, error } = await client
    .from('instances')
    .select('id, formulaire_id, donnees_json, nom, user_id, created_at')
    .eq('id', instanceId)
    .single()

  if (error) throw error
  return data
}

/**
 * Supprime une instance par son ID.
 * La RLS côté Supabase vérifie que user_id = auth.uid().
 */
async function deleteInstance(instanceId) {
  const client = ensureClient()
  const { error } = await client
    .from('instances')
    .delete()
    .eq('id', instanceId)

  if (error) throw error
  return true
}

// ─── Gabarits (intégrés dans schema_json.templates) ────────────

/**
 * Récupère les gabarits depuis le schema_json d'un formulaire.
 */
function getTemplatesFromForm(form) {
  return form?.schema_json?.templates || []
}

export default {
  getForms,
  getFormById,
  createForm,
  updateForm,
  createInstance,
  getInstancesByFormId,
  getInstanceById,
  deleteInstance,
  getTemplatesFromForm
}
