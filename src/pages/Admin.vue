<template>
  <div class="admin-container">
    <section class="section-header">
      <h1>Espace de gestion</h1>
      <p class="lead">Rendu Mustache et export PDF des instances</p>
    </section>

    <div v-if="globalError" class="alert alert-danger">{{ globalError }}</div>
    <div v-if="!isSupabaseReady" class="alert alert-warning">
      Configurez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> pour activer le mode connecté.
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card stats-card text-center">
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">Formulaires</h6>
            <p class="stats-number">{{ forms.length }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card stats-card text-center">
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">Instances chargées</h6>
            <p class="stats-number">{{ instances.length }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card stats-card text-center">
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">Gabarits</h6>
            <p class="stats-number">{{ templates.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-header bg-danger text-white">
        <h5 class="mb-0">Préparation du document</h5>
      </div>
      <div class="card-body row g-3">
        <div class="col-md-12">
          <label class="form-label">Formulaire</label>
          <select v-model="selectedFormId" class="form-select">
            <option value="">Choisir...</option>
            <option
              v-for="form in forms"
              :key="form.id"
              :value="form.id"
              :disabled="!form.hasTemplate"
            >
              {{ form.nom }}{{ form.hasTemplate ? '' : ' (incomplet)' }}
            </option>
          </select>
        </div>
        <div class="col-md-12" v-if="incompleteForms.length">
          <span class="badge text-bg-warning me-2">Incomplet</span>
          <span class="text-muted">Sans gabarit : {{ incompleteForms.map(form => form.nom).join(', ') }}</span>
        </div>
        <div class="col-md-12" v-if="selectedFormId">
          <label class="form-label">Gabarit principal</label>
          <input
            class="form-control"
            :value="selectedTemplate?.nom || 'Aucun gabarit lié'"
            readonly
          />
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Aperçu rendu Mustache</h5>
        <button
          class="btn btn-primary btn-sm"
          :disabled="!renderedHtml || isExporting"
          @click="exportPdf"
        >
          {{ isExporting ? 'Export en cours...' : 'Exporter en PDF' }}
        </button>
      </div>
      <div class="card-body">
        <div v-if="!renderedHtml" class="text-muted">
          Sélectionnez un formulaire et un gabarit pour générer l'aperçu.
        </div>
        <div v-else class="render-preview border rounded p-3" v-html="renderedHtml"></div>
      </div>
    </div>

    <div ref="pdfContainer" class="pdf-container" v-html="renderedHtml"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Mustache from 'mustache'
import SupabaseDataService from '../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../lib/supabaseClient'

const forms = ref([])
const templates = ref([])
const instances = ref([])

const selectedFormId = ref('')
const selectedTemplateId = ref('')
const renderedHtml = ref('')
const globalError = ref('')
const isExporting = ref(false)
const pdfContainer = ref(null)

const isSupabaseReady = isSupabaseConfigured()

const selectedForm = computed(() =>
  forms.value.find(form => form.id === selectedFormId.value)
)

const selectedTemplate = computed(() =>
  templates.value.find(template => template.id === selectedTemplateId.value)
)

const incompleteForms = computed(() =>
  forms.value.filter(form => !form.hasTemplate)
)

function toRenderableInstances(rows) {
  return rows.map(row => ({
    ...row.donnees_json,
    created_at: row.created_at
  }))
}

async function loadForms() {
  if (!isSupabaseReady) return
  try {
    globalError.value = ''
    const [allForms, formIdsWithTemplate] = await Promise.all([
      SupabaseDataService.getForms(),
      SupabaseDataService.getFormIdsWithTemplate()
    ])

    const linkedIds = new Set(formIdsWithTemplate)
    forms.value = allForms.map(form => ({
      ...form,
      hasTemplate: linkedIds.has(form.id)
    }))
  } catch (error) {
    globalError.value = error.message || 'Erreur lors du chargement des formulaires.'
  }
}

async function loadFormData() {
  if (!selectedFormId.value || !isSupabaseReady) return

  try {
    globalError.value = ''
    renderedHtml.value = ''
    selectedTemplateId.value = ''

    const [formTemplates, formInstances] = await Promise.all([
      SupabaseDataService.getFormTemplates(selectedFormId.value),
      SupabaseDataService.getInstancesByFormId(selectedFormId.value)
    ])

    templates.value = formTemplates
    instances.value = formInstances
    selectedTemplateId.value = formTemplates[0]?.id || ''

    if (!selectedTemplateId.value) {
      globalError.value = "Aucun gabarit lié à ce formulaire. Ajoutez une ligne dans formulaire_gabarits."
    }
  } catch (error) {
    globalError.value = error.message || 'Erreur lors du chargement des données du formulaire.'
  }
}

function buildMustacheContext() {
  return {
    layout: selectedForm.value?.schema_json?.layout || {},
    instances: toRenderableInstances(instances.value)
  }
}

function renderTemplate() {
  if (!selectedTemplate.value || !selectedForm.value) {
    renderedHtml.value = ''
    return
  }

  const mustacheContext = buildMustacheContext()
  renderedHtml.value = Mustache.render(selectedTemplate.value.merged_html, mustacheContext)
}

async function exportPdf() {
  if (!pdfContainer.value || !renderedHtml.value) return

  try {
    isExporting.value = true
    const html2pdf = (await import('html2pdf.js')).default

    await html2pdf()
      .set({
        margin: 10,
        filename: `formulaire-${selectedForm.value?.nom || 'export'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(pdfContainer.value)
      .save()
  } catch (error) {
    globalError.value = error.message || "Erreur pendant l'export PDF."
  } finally {
    isExporting.value = false
  }
}

watch(selectedFormId, async () => {
  templates.value = []
  instances.value = []
  const form = forms.value.find(item => item.id === selectedFormId.value)
  if (selectedFormId.value && form && !form.hasTemplate) {
    globalError.value = 'Ce formulaire est incomplet : aucun gabarit principal lié.'
    renderedHtml.value = ''
    selectedTemplateId.value = ''
    return
  }
  await loadFormData()
})

watch(selectedTemplateId, renderTemplate)
watch(instances, renderTemplate)

onMounted(loadForms)
</script>
