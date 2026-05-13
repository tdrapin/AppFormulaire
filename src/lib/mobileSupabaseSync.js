import { isSupabaseConfigured } from './supabaseClient'
import SupabaseDataService from './services/SupabaseDataService'
import { buildDefaultExportTemplate } from './buildDefaultExportTemplate'

const TEMP_USER_ID =
  import.meta.env.VITE_TEMP_USER_ID || '11111111-1111-1111-1111-111111111111'

function withLayout(schemaJson) {
  const base = schemaJson && typeof schemaJson === 'object' ? { ...schemaJson } : {}
  if (!base.layout || typeof base.layout !== 'object') {
    base.layout = {
      header: {
        title: base.titre || '',
        subtitle: base.sousTitre || ''
      },
      footer: { text: '' }
    }
  }
  return base
}

/**
 * Crée ou met à jour le formulaire Supabase + gabarit d'export lié pour un formulaire mobile local.
 * Attache `supabase_formulaire_id` sur l'objet formulaire.
 */
export async function ensureRemoteFormulaireForMobileForm(form, persistFn) {
  if (!isSupabaseConfigured() || !form) return

  const schemaForDb = withLayout(form.schema_json)
  const { html, css } = buildDefaultExportTemplate(schemaForDb)

  if (form.supabase_formulaire_id) {
    await SupabaseDataService.updateForm(form.supabase_formulaire_id, {
      nom: form.nom,
      schema_json: schemaForDb
    })
    const tpls = await SupabaseDataService.getFormTemplates(form.supabase_formulaire_id)
    const first = tpls[0]
    if (first?.id) {
      await SupabaseDataService.updateTemplate(first.id, {
        html_content: html,
        css_content: css
      })
    }
    if (typeof persistFn === 'function') persistFn()
    return
  }

  const created = await SupabaseDataService.createForm(form.nom || schemaForDb.titre || 'Formulaire', schemaForDb)
  const template = await SupabaseDataService.createTemplate(
    `${form.nom || 'Formulaire'} — export`,
    html,
    css
  )
  await SupabaseDataService.linkFormTemplate(created.id, template.id)
  form.supabase_formulaire_id = created.id
  if (typeof persistFn === 'function') persistFn()
}

export async function createSupabaseInstanceForMobileForm(form, answers) {
  if (!isSupabaseConfigured() || !form?.supabase_formulaire_id) return null
  return SupabaseDataService.createInstance(form.supabase_formulaire_id, answers, TEMP_USER_ID)
}
