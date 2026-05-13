<template>
  <div class="af-page runner-container">
    <section class="section-header">
      <h1>Remplisseur de formulaires</h1>
      <p class="lead">Charge un JSON, affiche les champs et sauvegarde l'instance</p>
    </section>

    <div v-if="globalError" class="alert alert-danger">{{ globalError }}</div>
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="!isSupabaseReady" class="alert alert-warning">
      Configurez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> pour activer le mode connecté.
    </div>

    <div class="card mb-4">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">Sélection du formulaire</h5>
      </div>
      <div class="card-body row g-3">
        <div class="col-md-12">
          <label class="form-label">Formulaire</label>
          <select v-model="selectedFormId" class="form-select">
            <option value="">Choisir un formulaire...</option>
            <option v-for="form in forms" :key="form.id" :value="form.id">
              {{ form.nom }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="selectedForm" class="card">
      <div class="card-header bg-light">
        <h5 class="mb-0">{{ selectedForm.schema_json?.titre || selectedForm.nom }}</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitInstance">
          <div
            v-for="section in selectedForm.schema_json?.sections || []"
            :key="section.id"
            class="border rounded p-3 mb-3"
          >
            <h6 class="mb-3">{{ section.titre }}</h6>

            <div v-for="champ in section.champs || []" :key="champ.id" class="mb-3">
              <label class="form-label">{{ champ.label }}</label>

              <textarea
                v-if="champ.type === 'textarea'"
                v-model="formData[champ.id]"
                class="form-control"
                rows="3"
                :required="Boolean(champ.required)"
              />

              <input
                v-else
                v-model="formData[champ.id]"
                :type="mapInputType(champ.type)"
                class="form-control"
                :required="Boolean(champ.required)"
              />
              <small v-if="champ.required" class="text-muted">Champ obligatoire</small>
            </div>
          </div>

          <button :disabled="isSubmitting || !isSupabaseReady" class="btn btn-primary" type="submit">
            {{ isSubmitting ? 'Enregistrement...' : "Enregistrer l'instance" }}
          </button>
        </form>

        <div class="mt-4 d-flex flex-wrap gap-2 align-items-center">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            :disabled="isPdfExporting || !hasAnyAnswer"
            @click="exportDraftPdf"
          >
            {{ isPdfExporting ? 'PDF…' : 'Exporter la saisie en PDF' }}
          </button>
          <span class="text-muted small">Aperçu local de la saisie courante (sans enregistrer).</span>
        </div>
      </div>
    </div>

    <div ref="runnerPdfRoot" class="runner-pdf-root" aria-hidden="true">
      <template v-if="selectedForm">
        <h1>{{ selectedForm.schema_json?.titre || selectedForm.nom }}</h1>
        <p v-if="selectedForm.schema_json?.sousTitre" class="sub">{{ selectedForm.schema_json.sousTitre }}</p>
        <section v-for="section in selectedForm.schema_json?.sections || []" :key="section.id" class="pdf-sec">
          <h2>{{ section.titre }}</h2>
          <div v-for="champ in section.champs || []" :key="champ.id" class="pdf-row">
            <strong>{{ champ.label }}</strong>
            <span>{{ displayFieldValue(champ.id) }}</span>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import SupabaseDataService from '../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { buildPdfFilename, exportHtmlElementToPdf } from '../composables/usePdfExport'

const TEMP_USER_ID =
  import.meta.env.VITE_TEMP_USER_ID || '11111111-1111-1111-1111-111111111111'

const forms = ref([])
const selectedFormId = ref('')
const formData = ref({})
const globalError = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const isPdfExporting = ref(false)
const runnerPdfRoot = ref(null)

const isSupabaseReady = isSupabaseConfigured()

const hasAnyAnswer = computed(() =>
  Object.values(formData.value || {}).some(v => String(v ?? '').trim() !== '')
)

const selectedForm = computed(() =>
  forms.value.find(form => form.id === selectedFormId.value)
)

function mapInputType(type) {
  if (type === 'number') return 'number'
  if (type === 'date') return 'date'
  return 'text'
}

function displayFieldValue(champId) {
  const v = formData.value[champId]
  if (v === undefined || v === null || String(v).trim() === '') return '—'
  return String(v)
}

async function exportDraftPdf() {
  if (!runnerPdfRoot.value || !selectedForm.value) return
  try {
    isPdfExporting.value = true
    globalError.value = ''
    await nextTick()
    await exportHtmlElementToPdf(
      runnerPdfRoot.value,
      buildPdfFilename(selectedForm.value?.nom || selectedForm.value?.schema_json?.titre || 'saisie')
    )
  } catch (error) {
    globalError.value = error.message || "Erreur pendant l'export PDF."
  } finally {
    isPdfExporting.value = false
  }
}

function resetFormData() {
  const data = {}
  const fields = selectedForm.value?.schema_json?.sections || []
  fields.forEach(section => {
    ;(section.champs || []).forEach(champ => {
      data[champ.id] = ''
    })
  })
  formData.value = data
}

async function loadForms() {
  if (!isSupabaseReady) return
  try {
    globalError.value = ''
    forms.value = await SupabaseDataService.getForms()
  } catch (error) {
    globalError.value = error.message || 'Erreur lors du chargement des formulaires.'
  }
}

async function submitInstance() {
  if (!selectedFormId.value) {
    globalError.value = 'Sélectionnez un formulaire.'
    return
  }

  const allFields = (selectedForm.value?.schema_json?.sections || []).flatMap(
    section => section.champs || []
  )
  const missingRequiredField = allFields.find(
    champ => Boolean(champ.required) && !String(formData.value[champ.id] || '').trim()
  )
  if (missingRequiredField) {
    globalError.value = `Le champ "${missingRequiredField.label}" est obligatoire.`
    return
  }

  try {
    isSubmitting.value = true
    globalError.value = ''
    successMessage.value = ''

    await SupabaseDataService.createInstance(
      selectedFormId.value,
      formData.value,
      TEMP_USER_ID
    )

    successMessage.value = 'Instance enregistrée avec succès.'
    resetFormData()
  } catch (error) {
    globalError.value = error.message || "Impossible d'enregistrer l'instance."
  } finally {
    isSubmitting.value = false
  }
}

watch(selectedFormId, () => {
  successMessage.value = ''
  resetFormData()
})

onMounted(loadForms)
</script>

<style scoped>
.runner-pdf-root {
  position: fixed;
  left: -12000px;
  top: 0;
  width: 210mm;
  padding: 12mm;
  background: #fff;
  color: #222;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
}
.runner-pdf-root h1 {
  font-size: 18pt;
  margin: 0 0 8px;
}
.runner-pdf-root .sub {
  margin: 0 0 16px;
  color: #555;
}
.runner-pdf-root .pdf-sec {
  margin-bottom: 14px;
}
.runner-pdf-root h2 {
  font-size: 12pt;
  margin: 0 0 8px;
  color: #333;
}
.runner-pdf-root .pdf-row {
  margin-bottom: 6px;
  display: grid;
  grid-template-columns: 38% 62%;
  gap: 8px;
}
</style>
