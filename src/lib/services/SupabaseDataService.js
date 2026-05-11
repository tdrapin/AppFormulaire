import { assertSupabaseConfigured, supabase } from '../supabaseClient'

function ensureClient() {
  assertSupabaseConfigured()
  return supabase
}

function parseTemplateHtml(gabarit) {
  const css = gabarit.css_content || ''
  const html = gabarit.html_content || ''
  return `
    <style>${css}</style>
    ${html}
  `
}

async function getForms() {
  const client = ensureClient()
  const { data, error } = await client
    .from('formulaires')
    .select('id, nom, schema_json, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

async function createForm(nom, schemaJson) {
  const client = ensureClient()
  const { data, error } = await client
    .from('formulaires')
    .insert({
      nom,
      schema_json: schemaJson
    })
    .select('id, nom, schema_json, created_at')
    .single()

  if (error) throw error
  return data
}

async function createTemplate(nom, htmlContent, cssContent = '') {
  const client = ensureClient()
  const { data, error } = await client
    .from('gabarits')
    .insert({
      nom,
      html_content: htmlContent,
      css_content: cssContent
    })
    .select('id, nom, html_content, css_content, created_at')
    .single()

  if (error) throw error
  return data
}

async function linkFormTemplate(formulaireId, gabaritId) {
  const client = ensureClient()
  const { data, error } = await client
    .from('formulaire_gabarits')
    .insert({
      formulaire_id: formulaireId,
      gabarit_id: gabaritId
    })
    .select('formulaire_id, gabarit_id')
    .single()

  if (error) throw error
  return data
}

async function getFormById(formId) {
  const client = ensureClient()
  const { data, error } = await client
    .from('formulaires')
    .select('id, nom, schema_json, created_at')
    .eq('id', formId)
    .single()

  if (error) throw error
  return data
}

async function getFormTemplates(formId) {
  const client = ensureClient()
  const { data, error } = await client
    .from('formulaire_gabarits')
    .select('gabarits(id, nom, html_content, css_content, created_at)')
    .eq('formulaire_id', formId)

  if (error) throw error

  return (data || [])
    .map(item => item.gabarits)
    .filter(Boolean)
    .map(gabarit => ({
      ...gabarit,
      merged_html: parseTemplateHtml(gabarit)
    }))
}

async function getFormIdsWithTemplate() {
  const client = ensureClient()
  const { data, error } = await client
    .from('formulaire_gabarits')
    .select('formulaire_id')

  if (error) throw error

  return Array.from(new Set((data || []).map(row => row.formulaire_id)))
}

async function createInstance(formId, donneesJson, userId) {
  const client = ensureClient()
  const payload = {
    formulaire_id: formId,
    donnees_json: donneesJson
  }

  if (userId) {
    payload.user_id = userId
  }

  const { data, error } = await client
    .from('instances')
    .insert(payload)
    .select('id, formulaire_id, donnees_json, user_id, created_at')
    .single()

  if (error) throw error
  return data
}

async function getInstancesByFormId(formId) {
  const client = ensureClient()
  const { data, error } = await client
    .from('instances')
    .select('id, formulaire_id, donnees_json, user_id, created_at')
    .eq('formulaire_id', formId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export default {
  getForms,
  createForm,
  getFormById,
  getFormTemplates,
  getFormIdsWithTemplate,
  createTemplate,
  linkFormTemplate,
  createInstance,
  getInstancesByFormId
}
