import { ref, computed } from 'vue'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import {
  ensureRemoteFormulaireForMobileForm,
  createSupabaseInstanceForMobileForm
} from '../lib/mobileSupabaseSync'

const STORAGE_KEY = 'appformulaire_mobile_demo_v1'

function uid() {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

function defaultForms() {
  return [
    {
      id: 'form_demo_maintenance',
      nom: 'Maintenance armoire électrique',
      description: 'Contrôle terrain post-intervention, photos et mesures.',
      statut: 'complet',
      schema_json: {
        titre: 'Rapport de maintenance',
        sousTitre: 'Intervention basse tension',
        sections: [
          {
            id: 'sec1',
            titre: 'Identification du site',
            champs: [
              { id: 'c1', label: 'Référence client', type: 'text', required: true },
              { id: 'c2', label: 'Date d’intervention', type: 'date', required: true },
              { id: 'c3', label: 'Technicien présent', type: 'text', required: false }
            ]
          },
          {
            id: 'sec2',
            titre: 'Contrôles',
            champs: [
              { id: 'c4', label: 'Température ambiante (°C)', type: 'number', required: true },
              {
                id: 'c5',
                label: 'Observations et anomalies',
                type: 'textarea',
                required: false
              }
            ]
          }
        ]
      }
    },
    {
      id: 'form_demo_livraison',
      nom: 'Bon de livraison express',
      description: 'Saisie rapide pour signature et PDF.',
      statut: 'incomplet',
      schema_json: {
        titre: 'Bon de livraison',
        sousTitre: 'Flux logistique',
        sections: [
          {
            id: 's1',
            titre: 'Réception',
            champs: [
              { id: 'l1', label: 'Nom du destinataire', type: 'text', required: true },
              { id: 'l2', label: 'Nombre de colis', type: 'number', required: true },
              { id: 'l3', label: 'Commentaire livreur', type: 'textarea', required: false }
            ]
          }
        ]
      }
    }
  ]
}

const forms = ref([])
const fillSession = ref(null)
const reports = ref([])

function load() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      forms.value = data.forms?.length ? data.forms : defaultForms()
      reports.value = data.reports || []
    } else {
      forms.value = defaultForms()
      reports.value = [
        {
          id: 'rep_seed',
          formId: 'form_demo_maintenance',
          formTitre: 'Rapport de maintenance',
          client: 'ACME Industries',
          dateISO: new Date(Date.now() - 86400000 * 2).toISOString(),
          statut: 'terminé',
          answers: {}
        },
        {
          id: 'rep_seed2',
          formId: 'form_demo_livraison',
          formTitre: 'Bon de livraison',
          client: 'Brouillon interne',
          dateISO: new Date().toISOString(),
          statut: 'brouillon',
          answers: {}
        }
      ]
    }
  } catch {
    forms.value = defaultForms()
    reports.value = []
  }
}

function persist() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ forms: forms.value, reports: reports.value })
    )
  } catch {
    /* ignore */
  }
}

export function useMobileFormDemo() {
  if (!forms.value.length) load()

  const formById = id => forms.value.find(f => f.id === id)

  function addForm(schema) {
    const f = {
      id: uid(),
      nom: schema.titre || 'Nouveau formulaire',
      description: schema.description || '',
      statut: 'complet',
      schema_json: {
        titre: schema.titre || 'Sans titre',
        sousTitre: schema.sousTitre || '',
        sections:
          schema.sections?.length > 0
            ? schema.sections
            : [
                {
                  id: uid(),
                  titre: 'Section 1',
                  champs: []
                }
              ]
      }
    }
    forms.value = [...forms.value, f]
    persist()
    return f.id
  }

  function updateForm(formId, partial) {
    const i = forms.value.findIndex(f => f.id === formId)
    if (i === -1) return
    const cur = forms.value[i]
    const nextSchema = partial.schema_json
      ? { ...cur.schema_json, ...partial.schema_json }
      : cur.schema_json
    forms.value.splice(i, 1, {
      ...cur,
      ...partial,
      nom: partial.nom ?? nextSchema?.titre ?? cur.nom,
      description: partial.description ?? cur.description,
      schema_json: nextSchema
    })
    persist()
  }

  function startFill(formId) {
    const f = formById(formId)
    if (!f) return null
    const answers = {}
    for (const sec of f.schema_json.sections || []) {
      for (const c of sec.champs || []) {
        answers[c.id] = ''
      }
    }
    fillSession.value = { formId, answers, sectionIndex: 0 }
    return fillSession.value
  }

  function resolveClientLabel(answers, form) {
    for (const sec of form.schema_json?.sections || []) {
      for (const c of sec.champs || []) {
        if (/client|destinataire|référence/i.test(c.label)) {
          const v = String(answers[c.id] || '').trim()
          if (v) return v.slice(0, 80)
        }
      }
    }
    const first = Object.values(answers).find(v => String(v || '').trim())
    return first ? String(first).slice(0, 80) : '—'
  }

  async function saveReportFromSession(statut = 'terminé') {
    if (!fillSession.value) return null
    const f = formById(fillSession.value.formId)
    if (!f) return null
    const client = resolveClientLabel(fillSession.value.answers, f)
    const rep = {
      id: uid(),
      formId: f.id,
      formTitre: f.schema_json.titre || f.nom,
      client: String(client).slice(0, 80) || '—',
      dateISO: new Date().toISOString(),
      statut,
      answers: { ...fillSession.value.answers }
    }

    if (isSupabaseConfigured()) {
      try {
        await ensureRemoteFormulaireForMobileForm(f, persist)
        await createSupabaseInstanceForMobileForm(f, rep.answers)
        rep.supabase_synced = true
      } catch (e) {
        rep.supabase_sync_error = e?.message || String(e)
      }
    }

    reports.value = [rep, ...reports.value]
    fillSession.value = null
    persist()
    return { id: rep.id, supabase_sync_error: rep.supabase_sync_error }
  }

  const questionCount = computed(() => {
    if (!fillSession.value) return 0
    const f = formById(fillSession.value.formId)
    if (!f) return 0
    return (f.schema_json.sections || []).reduce(
      (n, s) => n + (s.champs || []).length,
      0
    )
  })

  return {
    forms,
    reports,
    fillSession,
    questionCount,
    formById,
    addForm,
    updateForm,
    startFill,
    saveReportFromSession,
    persist,
    load
  }
}
