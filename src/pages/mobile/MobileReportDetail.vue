<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="router.push({ name: 'MobileHistory' })">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">Détail du rapport</h1>
        <p class="m-header__subtitle">{{ report?.formTitre || '—' }}</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="!report" class="m-banner-error">Rapport introuvable.</div>

      <template v-else>
        <div v-if="report.supabase_sync_error" class="m-banner-error" style="margin-bottom: 12px">
          Synchronisation Supabase : {{ report.supabase_sync_error }}
        </div>
        <div class="m-card m-card--muted">
          <p style="margin: 0 0 6px; font-size: 0.85rem; color: var(--m-text-muted)">Destinataire</p>
          <p style="margin: 0; font-weight: 600">{{ report.client }}</p>
          <p style="margin: 10px 0 0; font-size: 0.85rem; color: var(--m-text-muted)">Date</p>
          <p style="margin: 0">{{ formatDate(report.dateISO) }}</p>
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

    <div v-if="report" class="m-footer-actions m-footer-actions--split">
      <button type="button" class="m-btn m-btn--ghost" :disabled="isPdfExporting" @click="exportReportPdf">
        {{ isPdfExporting ? 'PDF…' : 'Exporter en PDF' }}
      </button>
    </div>

    <div v-if="report" ref="pdfRoot" class="m-pdf-offscreen" aria-hidden="true">
      <h1>{{ report.formTitre }}</h1>
      <p class="meta">Client : {{ report.client }}</p>
      <p class="meta">Date : {{ formatDate(report.dateISO) }}</p>
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
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMobileFormDemo } from '../../composables/useMobileFormDemo'
import { buildPdfFilename, exportHtmlElementToPdf } from '../../composables/usePdfExport'

const route = useRoute()
const router = useRouter()
const { reports, formById } = useMobileFormDemo()

const pdfRoot = ref(null)
const isPdfExporting = ref(false)
const pdfError = ref('')

const reportId = computed(() => route.params.reportId as string)
const report = computed(() => reports.value.find(r => r.id === reportId.value))

const labelSections = computed(() => {
  const rep = report.value
  if (!rep) return []
  const f = formById(rep.formId)
  const sections = f?.schema_json?.sections || []
  return sections.map((sec, idx) => ({
    id: sec.id,
    titre: sec.titre,
    index: idx + 1,
    rows: (sec.champs || []).map(c => ({
      id: c.id,
      label: c.label,
      value: formatVal(rep.answers?.[c.id])
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
  if (!report.value || !pdfRoot.value) return
  pdfError.value = ''
  try {
    isPdfExporting.value = true
    await nextTick()
    await exportHtmlElementToPdf(
      pdfRoot.value,
      buildPdfFilename(report.value.formTitre || 'rapport', 'rapport')
    )
  } catch (e) {
    pdfError.value = e?.message || "Impossible d'exporter le PDF."
    window.alert(pdfError.value)
  } finally {
    isPdfExporting.value = false
  }
}
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
