<template>
  <div class="af-page admin-container">
    <section class="section-header">
      <h1>Espace de gestion</h1>
      <p class="lead">Export PDF des instances</p>
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
        <div class="col-md-6">
          <label class="form-label">Formulaire</label>
          <select v-model="selectedFormId" class="form-select">
            <option value="">Choisir…</option>
            <option v-for="form in forms" :key="form.id" :value="form.id">
              {{ form.nom }}
            </option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Gabarit</label>
          <select v-model="selectedTemplateId" class="form-select">
            <option value="">— Gabarit par défaut —</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">
              {{ t.name }}
            </option>
          </select>
          <div v-if="!templates.length && selectedFormId" class="form-text text-warning">
            Aucun gabarit personnalisé — le gabarit par défaut sera utilisé.
          </div>
        </div>
        <div class="col-md-12">
          <label class="form-label">Instance à exporter</label>
          <select v-model="selectedInstanceId" class="form-select">
            <option value="">Choisir une instance…</option>
            <option v-for="inst in instances" :key="inst.id" :value="inst.id">
              {{ inst.nom }} ({{ formatDateShort(inst.created_at) }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Aperçu du rendu</h5>
        <div>
          <button
            class="btn btn-outline-secondary btn-sm me-2"
            :disabled="!selectedInstanceId"
            @click="refreshPreview"
          >
            Actualiser
          </button>
          <button
            class="btn btn-primary btn-sm"
            :disabled="!renderedHtml || isExporting"
            @click="exportPdf"
          >
            {{ isExporting ? 'Export en cours…' : 'Exporter en PDF' }}
          </button>
        </div>
      </div>
      <div class="card-body">
        <div v-if="!renderedHtml" class="text-muted">
          Sélectionnez un formulaire, un gabarit et une instance pour générer l'aperçu.
        </div>
        <div v-else-if="previewEmpty" class="alert alert-warning mb-3">
          ⚠️ Le rendu semble vide. Vérifiez que le formulaire contient des champs et des données.
        </div>
        <div v-else class="render-preview border rounded p-3" v-html="renderedHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import SupabaseDataService from '../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { exportHtmlStringToPdf, buildPdfFilename } from '../lib/pdfExportService'
import { buildPreviewHtml } from '../lib/renderMobileReportPdfHtml'

const forms = ref([])
const templates = ref([])
const instances = ref([])

const selectedFormId = ref('')
const selectedTemplateId = ref('')
const selectedInstanceId = ref('')
const renderedHtml = ref('')
const previewEmpty = ref(false)
const globalError = ref('')
const isExporting = ref(false)

const isSupabaseReady = isSupabaseConfigured()

const selectedForm = computed(() =>
  forms.value.find(f => f.id === selectedFormId.value)
)

const selectedTemplate = computed(() =>
  templates.value.find(t => t.id === selectedTemplateId.value) || null
)

const selectedInstance = computed(() =>
  instances.value.find(i => i.id === selectedInstanceId.value) || null
)

function formatDateShort(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso || ''
  }
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

async function loadFormData() {
  if (!selectedFormId.value || !isSupabaseReady) return
  try {
    globalError.value = ''
    renderedHtml.value = ''
    selectedTemplateId.value = ''
    selectedInstanceId.value = ''

    // Charger le formulaire (contient schema_json avec templates)
    const f = await SupabaseDataService.getFormById(selectedFormId.value)
    if (!f) {
      globalError.value = 'Formulaire introuvable.'
      return
    }

    // Stocker le formulaire pour le rendu
    selectedFormRef.value = f

    // Récupérer les gabarits depuis schema_json.templates
    templates.value = SupabaseDataService.getTemplatesFromForm(f)

    // Récupérer les instances
    instances.value = await SupabaseDataService.getInstancesByFormId(selectedFormId.value)
  } catch (error) {
    globalError.value = error.message || 'Erreur lors du chargement des données.'
  }
}

// Référence interne pour le formulaire sélectionné (objet complet)
const selectedFormRef = ref(null)

function refreshPreview() {
  if (!selectedInstance.value || !selectedFormRef.value) {
    renderedHtml.value = ''
    previewEmpty.value = false
    return
  }
  const { html, isEmpty } = buildPreviewHtml(
    selectedInstance.value,
    selectedFormRef.value,
    selectedTemplate.value
  )
  renderedHtml.value = html
  previewEmpty.value = isEmpty
}

async function exportPdf() {
  if (!renderedHtml.value) return
  try {
    isExporting.value = true
    await nextTick()

    const filename = buildPdfFilename(
      selectedInstance.value?.nom || selectedFormRef.value?.nom || 'export',
      'export'
    )
    await exportHtmlStringToPdf(renderedHtml.value, filename)
  } catch (error) {
    globalError.value = error.message || "Erreur pendant l'export PDF."
  } finally {
    isExporting.value = false
  }
}

watch(selectedFormId, async () => {
  templates.value = []
  instances.value = []
  renderedHtml.value = ''
  previewEmpty.value = false
  selectedFormRef.value = null
  if (selectedFormId.value) {
    await loadFormData()
  }
})

watch(selectedTemplateId, () => {
  nextTick(refreshPreview)
})

watch(selectedInstanceId, () => {
  nextTick(refreshPreview)
})

onMounted(loadForms)
</script>
