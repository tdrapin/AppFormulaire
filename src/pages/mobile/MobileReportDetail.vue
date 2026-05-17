<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="router.push({ name: 'MobileHistory' })">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">Détail du rapport</h1>
        <p class="m-header__subtitle">{{ instance?.donnees_json?._nom || instance?.nom || '—' }}</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="loadError" class="m-banner-error">{{ loadError }}</div>
      <div v-else-if="!instance" class="m-banner-error">Rapport introuvable.</div>

      <template v-else-if="form">
        <div class="m-card m-card--muted">
          <p style="margin: 0 0 6px; font-size: 0.85rem; color: var(--m-text-muted)">Nom</p>
          <p style="margin: 0; font-weight: 600">{{ instance.donnees_json?._nom || instance.nom }}</p>
          <p style="margin: 10px 0 0; font-size: 0.85rem; color: var(--m-text-muted)">Date</p>
          <p style="margin: 0">{{ formatDate(instance.created_at) }}</p>
        </div>

        <!-- Sélection du gabarit -->
        <div class="m-card">
          <label class="m-label" for="template-select">Gabarit d'export</label>
          <select id="template-select" v-model="selectedTemplateId" class="m-select">
            <option value="">Gabarit par défaut</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.nom }}</option>
          </select>
        </div>

        <section v-for="sec in labelSections" :key="sec.id" class="m-card">
          <div class="m-block-title">
            <span class="m-step-badge">{{ sec.index }}</span>
            <h2>{{ sec.titre }}</h2>
          </div>
          <div v-for="row in sec.rows" :key="row.id" style="margin-bottom: 12px">
            <div class="m-question__num">{{ row.label }}</div>
            <p style="margin: 4px 0 0">{{ row.value }}</p>
          </div>
        </section>
      </template>
    </div>

    <div v-if="instance" class="m-footer-actions m-footer-actions--split">
      <button type="button" class="m-btn m-btn--ghost" :disabled="isPdfExporting" @click="exportReportPdf">
        {{ isPdfExporting ? 'PDF…' : 'Exporter en PDF' }}
      </button>
    </div>

    <div v-if="instance" ref="pdfRoot" class="m-pdf-offscreen" aria-hidden="true">
      <h1>{{ instance.donnees_json?._nom || instance.nom }}</h1>
      <p class="meta">Date : {{ formatDate(instance.created_at) }}</p>
      <section v-for="sec in labelSections" :key="sec.id" class="pdf-sec">
        <h2>{{ sec.titre }}</h2>
        <div v-for="row in sec.rows" :key="row.id" class="pdf-row">
          <strong>{{ row.label }}</strong>
          <span>{{ row.value }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SupabaseDataService from '../../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { buildPdfFilename, exportHtmlElementToPdf } from '../../composables/usePdfExport'
import { buildMobileReportPdfHtml } from '../../lib/renderMobileReportPdfHtml'

const route = useRoute()
const router = useRouter()

const instance = ref(null)
const form = ref(null)
const templates = ref([])
const selectedTemplateId = ref('')
const loadError = ref('')
const pdfRoot = ref(null)
const isPdfExporting = ref(false)

const reportId = computed(() => route.params.reportId as string)

const selectedTemplate = computed(() =>
  templates.value.find(t => t.id === selectedTemplateId.value) || null
)

const labelSections = computed(() => {
  const inst = instance.value
  const f = form.value
  if (!inst || !f) return []
  const sections = f.schema_json?.sections || []
  const donnees = inst.donnees_json || {}
  return sections.map((sec, idx) => ({
    id: sec.id,
    titre: sec.titre,
    index: idx + 1,
    rows: (sec.champs || []).map(c => ({
      id: c.id,
      label: c.label,
      value: formatVal(donnees[c.id])
    }))
  }))
})

function formatVal(v: unknown) {
  if (v === undefined || v === null || String(v).trim() === '') return '—'
  return String(v)
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })
  } catch {
    return iso
  }
}

async function exportReportPdf() {
  if (!instance.value) return
  try {
    isPdfExporting.value = true
    await nextTick()
    const html = buildMobileReportPdfHtml(instance.value, form.value, selectedTemplate.value)
    const wrap = document.createElement('div')
    wrap.innerHTML = html
    document.body.appendChild(wrap)
    await exportHtmlElementToPdf(
      wrap,
      buildPdfFilename(instance.value.donnees_json?._nom || instance.value.nom || 'rapport', 'rapport')
    )
    document.body.removeChild(wrap)
  } catch (e) {
    window.alert(e?.message || "Impossible d'exporter le PDF.")
  } finally {
    isPdfExporting.value = false
  }
}

onMounted(async () => {
  if (!isSupabaseConfigured()) {
    loadError.value = 'Supabase n\'est pas configuré.'
    return
  }
  try {
    const client = (await import('../../lib/supabaseClient')).supabase
    const { data: inst, error } = await client
      .from('instances')
      .select('*')
      .eq('id', reportId.value)
      .single()

    if (error || !inst) {
      loadError.value = 'Rapport introuvable.'
      return
    }
    instance.value = inst

    const f = await SupabaseDataService.getFormById(inst.formulaire_id)
    if (f) {
      form.value = f
      // Charger les gabarits associés à ce formulaire
      try {
        templates.value = await SupabaseDataService.getFormTemplates(f.id)
      } catch { /* pas de gabarits */ }
    }
  } catch (e) {
    loadError.value = 'Erreur lors du chargement du rapport.'
  }
})
</script>

<style scoped>
.m-footer-actions--split {
  justify-content: stretch;
}
.m-pdf-offscreen {
  position: fixed;
  left: -12000px;
  top: 0;
  width: 210mm;
  padding: 12mm;
  background: #fff;
  color: #111;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 11pt;
}
.m-pdf-offscreen h1 {
  font-size: 18pt;
  margin: 0 0 10px;
}
.m-pdf-offscreen .meta {
  margin: 4px 0;
  color: #444;
}
.m-pdf-offscreen .pdf-sec {
  margin-top: 14px;
}
.m-pdf-offscreen h2 {
  font-size: 12pt;
  margin: 0 0 8px;
}
.m-pdf-offscreen .pdf-row {
  display: grid;
  grid-template-columns: 40% 60%;
  gap: 8px;
  margin-bottom: 6px;
}
</style>
