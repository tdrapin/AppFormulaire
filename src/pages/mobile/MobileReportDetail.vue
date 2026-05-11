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
        <div class="m-card m-card--muted">
          <p style="margin: 0 0 6px; font-size: 0.85rem; color: var(--m-text-muted)">Client</p>
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

    <div v-if="report" class="m-footer-actions">
      <button type="button" class="m-btn m-btn--primary" @click="exportDemo">Exporter le PDF</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMobileFormDemo } from '../../composables/useMobileFormDemo'

const route = useRoute()
const router = useRouter()
const { reports, formById } = useMobileFormDemo()

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

function exportDemo() {
  if (!report.value) return
  window.alert(`Export PDF (démo) — « ${report.value.formTitre} ».`)
}
</script>
