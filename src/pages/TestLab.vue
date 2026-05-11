<template>
  <div class="af-page test-lab-container">
    <section class="section-header">
      <h1>Test Lab</h1>
      <p class="lead">Page dédiée au diagnostic et à la génération de données de test</p>
    </section>

    <div v-if="globalError" class="alert alert-danger">
      {{ globalError }}
    </div>

    <div v-if="!isSupabaseReady" class="alert alert-warning">
      Configurez les variables Supabase dans votre `.env`.
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <button class="btn btn-primary w-100" :disabled="isRunning || !isSupabaseReady" @click="runSnapshot">
          {{ isRunning ? 'Chargement...' : 'Diagnostic rapide' }}
        </button>
      </div>
      <div class="col-md-4">
        <button class="btn btn-success w-100" :disabled="isRunning || !isSupabaseReady" @click="createFixture">
          {{ isRunning ? 'Traitement...' : 'Créer un jeu de test complet' }}
        </button>
      </div>
      <div class="col-md-4">
        <button class="btn btn-outline-secondary w-100" :disabled="isRunning || !isSupabaseReady" @click="clearLogs">
          Vider les logs
        </button>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-header bg-dark text-white">Visualisation état courant</div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="metric-box">
              <h6>Formulaires</h6>
              <p>{{ snapshot.formsCount }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-box">
              <h6>Avec gabarit</h6>
              <p>{{ snapshot.formsWithTemplateCount }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-box">
              <h6>Gabarits</h6>
              <p>{{ snapshot.templatesCount }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-box">
              <h6>Instances</h6>
              <p>{{ snapshot.instancesCount }}</p>
            </div>
          </div>
        </div>

        <div class="mt-3">
          <h6>Formulaires détectés</h6>
          <ul class="mb-0">
            <li v-for="form in snapshot.forms" :key="form.id">
              {{ form.nom }} - {{ form.hasTemplate ? 'complet' : 'incomplet' }}
            </li>
            <li v-if="snapshot.forms.length === 0" class="text-muted">Aucun formulaire</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-header bg-primary text-white">Créer et visualiser des formulaires</div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Nom du formulaire</label>
            <input
              v-model="manualFormName"
              type="text"
              class="form-control"
              placeholder="Ex: Fiche intervention test"
              :disabled="isRunning"
            />
          </div>
          <div class="col-md-8">
            <label class="form-label">Schema JSON du formulaire</label>
            <textarea
              v-model="manualFormSchemaText"
              class="form-control schema-input"
              :disabled="isRunning"
            />
          </div>
          <div class="col-12 d-flex justify-content-end">
            <button
              class="btn btn-primary"
              :disabled="isRunning || !isSupabaseReady"
              @click="createManualForm"
            >
              {{ isRunning ? 'Création...' : 'Créer ce formulaire' }}
            </button>
          </div>
        </div>

        <hr class="my-4">

        <h6>Formulaires en base</h6>
        <div v-if="snapshot.forms.length === 0" class="text-muted">
          Aucun formulaire trouvé.
        </div>
        <div v-else class="forms-list">
          <div v-for="form in snapshot.forms" :key="form.id" class="form-item">
            <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <div>
                <strong>{{ form.nom }}</strong>
                <span class="text-muted ms-2">{{ form.id }}</span>
              </div>
              <span :class="['badge', form.hasTemplate ? 'text-bg-success' : 'text-bg-warning']">
                {{ form.hasTemplate ? 'complet' : 'incomplet' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header bg-light">
        Logs des actions
      </div>
      <div class="card-body log-box">
        <div v-for="log in logs" :key="log.id" class="log-row">
          <span class="log-time">{{ log.time }}</span>
          <span :class="['badge', log.ok ? 'text-bg-success' : 'text-bg-danger']">
            {{ log.ok ? 'OK' : 'ERREUR' }}
          </span>
          <span class="log-action">{{ log.action }}</span>
          <code>{{ log.detail }}</code>
        </div>
        <p v-if="logs.length === 0" class="text-muted mb-0">Aucune action exécutée.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SupabaseDataService from '../lib/services/SupabaseDataService'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

type SnapshotForm = {
  id: string
  nom: string
  hasTemplate: boolean
}

type SnapshotState = {
  formsCount: number
  formsWithTemplateCount: number
  templatesCount: number
  instancesCount: number
  forms: SnapshotForm[]
}

type TestLog = {
  id: string
  time: string
  action: string
  ok: boolean
  detail: string
}

const isSupabaseReady = isSupabaseConfigured()
const isRunning = ref(false)
const globalError = ref('')

const snapshot = ref<SnapshotState>({
  formsCount: 0,
  formsWithTemplateCount: 0,
  templatesCount: 0,
  instancesCount: 0,
  forms: []
})

const logs = ref<TestLog[]>([])
const manualFormName = ref('FORM TEST manuel')
const manualFormSchemaText = ref(
  JSON.stringify(
    {
      titre: 'Formulaire manuel',
      layout: {
        header: { title: 'ENTREPRISE TEST', subtitle: 'Saisie manuelle' }
      },
      sections: [
        {
          id: 'identite',
          titre: 'Identite',
          champs: [
            { id: 'nom', type: 'text', label: 'Nom', required: true },
            { id: 'date', type: 'date', label: 'Date' }
          ]
        }
      ]
    },
    null,
    2
  )
)

function formatError(error: unknown) {
  if (!error) return 'Erreur inconnue'
  if (error instanceof Error) return error.message
  if (typeof error === 'object') {
    const maybeMessage = (error as { message?: string }).message
    const maybeDetails = (error as { details?: string }).details
    const maybeHint = (error as { hint?: string }).hint
    const chunks = [maybeMessage, maybeDetails, maybeHint].filter(Boolean)
    if (chunks.length) return chunks.join(' | ')
  }
  return 'Erreur inconnue'
}

function nowTime() {
  return new Date().toLocaleTimeString()
}

function pushLog(action: string, ok: boolean, detail: string) {
  logs.value.unshift({
    id: `${Date.now()}-${Math.random()}`,
    time: nowTime(),
    action,
    ok,
    detail
  })
}

function clearLogs() {
  logs.value = []
}

async function runSnapshot() {
  if (!isSupabaseReady) return
  globalError.value = ''
  isRunning.value = true
  try {
    const [forms, formIdsWithTemplate] = await Promise.all([
      SupabaseDataService.getForms(),
      SupabaseDataService.getFormIdsWithTemplate()
    ])
    const linkedSet = new Set(formIdsWithTemplate)
    const formsState: SnapshotForm[] = forms.map((form: { id: string; nom: string }) => ({
      id: form.id,
      nom: form.nom,
      hasTemplate: linkedSet.has(form.id)
    }))

    const [templatesRes, instancesRes] = await Promise.all([
      supabase.from('gabarits').select('id', { count: 'exact', head: true }),
      supabase.from('instances').select('id', { count: 'exact', head: true })
    ])

    if (templatesRes.error) throw templatesRes.error
    if (instancesRes.error) throw instancesRes.error

    snapshot.value = {
      formsCount: formsState.length,
      formsWithTemplateCount: formsState.filter(f => f.hasTemplate).length,
      templatesCount: templatesRes.count || 0,
      instancesCount: instancesRes.count || 0,
      forms: formsState
    }

    pushLog('Diagnostic rapide', true, 'Snapshot mis à jour')
  } catch (error: unknown) {
    const message = formatError(error)
    globalError.value = message
    pushLog('Diagnostic rapide', false, message)
  } finally {
    isRunning.value = false
  }
}

async function createFixture() {
  if (!isSupabaseReady) return
  globalError.value = ''
  isRunning.value = true

  try {
    const suffix = new Date().toISOString().replace(/[:.]/g, '-')
    const formName = `TEST Rapport ${suffix}`

    const schemaJson = {
      titre: "Rapport d'intervention",
      layout: {
        header: { title: 'ENTREPRISE TEST', subtitle: 'Maintenance préventive' },
        footer: { text: 'Document de test' }
      },
      sections: [
        {
          id: 'info',
          titre: 'Informations de base',
          champs: [
            { id: 'client', type: 'text', label: 'Client', required: true },
            { id: 'date', type: 'date', label: 'Date de visite', required: true }
          ]
        },
        {
          id: 'tech',
          titre: 'Données techniques',
          champs: [
            { id: 'pression', type: 'number', label: 'Pression (bar)' },
            { id: 'notes', type: 'textarea', label: 'Observations' }
          ]
        }
      ]
    }

    const templateHtml = `
      <div>
        <h1>{{layout.header.title}}</h1>
        <h3>{{layout.header.subtitle}}</h3>
        {{#instances}}
          <hr>
          <p><strong>Client:</strong> {{client}}</p>
          <p><strong>Date:</strong> {{date}}</p>
          <p><strong>Pression:</strong> {{pression}}</p>
          <p><strong>Notes:</strong> {{notes}}</p>
        {{/instances}}
      </div>
    `

    const templateCss = `
      body { font-family: Arial, sans-serif; color: #333; }
      h1 { margin-bottom: 0; }
      h3 { margin-top: 4px; color: #666; }
    `

    const form = await SupabaseDataService.createForm(formName, schemaJson)
    pushLog('Création formulaire', true, form.id)

    const template = await SupabaseDataService.createTemplate(
      `TEST Gabarit ${suffix}`,
      templateHtml,
      templateCss
    )
    pushLog('Création gabarit', true, template.id)

    await SupabaseDataService.linkFormTemplate(form.id, template.id)
    pushLog('Liaison formulaire_gabarits', true, `${form.id} -> ${template.id}`)

    const tempUserId = (import.meta.env.VITE_TEMP_USER_ID || '').trim()
    if (tempUserId) {
      await SupabaseDataService.createInstance(
        form.id,
        {
          client: 'Client Démo',
          date: new Date().toISOString().slice(0, 10),
          pression: 7.2,
          notes: 'Instance générée depuis Test Lab'
        },
        tempUserId
      )
      pushLog('Création instance', true, form.id)
    } else {
      pushLog(
        'Création instance',
        true,
        'Ignorée: VITE_TEMP_USER_ID non défini (vous pourrez activer cette étape plus tard).'
      )
    }

    await runSnapshot()
  } catch (error: unknown) {
    const message = formatError(error)
    globalError.value = message
    pushLog('Création jeu de test', false, message)
  } finally {
    isRunning.value = false
  }
}

async function createManualForm() {
  if (!isSupabaseReady) return
  globalError.value = ''

  const formName = manualFormName.value.trim()
  if (!formName) {
    const message = 'Le nom du formulaire est obligatoire.'
    globalError.value = message
    pushLog('Création formulaire manuel', false, message)
    return
  }

  let schemaJson: Record<string, unknown>
  try {
    schemaJson = JSON.parse(manualFormSchemaText.value) as Record<string, unknown>
  } catch {
    const message = 'Le schema JSON est invalide.'
    globalError.value = message
    pushLog('Création formulaire manuel', false, message)
    return
  }

  isRunning.value = true
  try {
    const createdForm = await SupabaseDataService.createForm(formName, schemaJson)
    pushLog('Création formulaire manuel', true, `${createdForm.nom} (${createdForm.id})`)
    manualFormName.value = ''
    await runSnapshot()
  } catch (error: unknown) {
    const message = formatError(error)
    globalError.value = message
    pushLog('Création formulaire manuel', false, message)
  } finally {
    isRunning.value = false
  }
}

onMounted(runSnapshot)
</script>
