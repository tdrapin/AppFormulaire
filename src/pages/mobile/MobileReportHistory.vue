<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="router.push({ name: 'MobileFormList' })">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">Historique</h1>
        <p class="m-header__subtitle">Rapports enregistrés</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="route.query.ok" class="m-banner-info">Document enregistré localement.</div>
      <div v-if="route.query.sync_err" class="m-banner-error">
        Le rapport est enregistré sur l’appareil, mais la synchronisation Supabase a échoué (droits réseau ou RLS).
      </div>

      <div v-if="!reports.length" class="m-empty">
        <div class="m-empty__icon"><i class="fa-solid fa-folder-open" /></div>
        <strong>Aucun rapport</strong>
        <span>Les rapports que vous générerez depuis la saisie terrain apparaîtront ici.</span>
        <router-link :to="{ name: 'MobileFormList' }" class="m-btn m-btn--ghost" style="display: inline-block; width: auto; padding: 12px 24px; text-decoration: none;">
          Voir les formulaires
        </router-link>
      </div>

      <article v-for="r in reports" :key="r.id" class="m-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
          <div style="min-width: 0">
            <h2 class="m-list-card__title">{{ r.formTitre }}</h2>
            <p class="m-list-card__desc" style="margin-bottom: 6px">{{ r.client }}</p>
            <p v-if="r.supabase_sync_error" class="m-list-card__desc" style="color: var(--m-danger); margin-top: 2px">
              Sync : {{ r.supabase_sync_error }}
            </p>
            <time class="m-question__num" style="color: var(--m-text-muted); font-weight: 500">{{
              formatDate(r.dateISO)
            }}</time>
          </div>
          <span
            class="m-status"
            :class="r.statut === 'terminé' ? 'm-status--done' : 'm-status--draft'"
            style="flex-shrink: 0"
          >
            {{ r.statut === 'terminé' ? 'Terminé' : 'Brouillon' }}
          </span>
        </div>
        <div class="m-row-actions">
          <router-link class="m-btn-sm m-btn-sm--primary" :to="{ name: 'MobileReportDetail', params: { reportId: r.id } }">
            Voir
          </router-link>
          <button
            type="button"
            class="m-btn-sm"
            :disabled="exportingId === r.id"
            @click="exportReportPdf(r)"
          >
            {{ exportingId === r.id ? 'PDF…' : 'Exporter' }}
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMobileFormDemo } from '../../composables/useMobileFormDemo'
import { buildPdfFilename, exportHtmlElementToPdf } from '../../composables/usePdfExport'
import { buildMobileReportPdfHtml } from '../../lib/renderMobileReportPdfHtml'

const route = useRoute()
const router = useRouter()
const { reports, formById } = useMobileFormDemo()
const exportingId = ref('')

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  } catch {
    return iso
  }
}

async function exportReportPdf(r) {
  const form = formById(r.formId)
  const wrap = document.createElement('div')
  wrap.style.cssText =
    'position:fixed;left:-12000px;top:0;width:210mm;padding:12mm;background:#fff;'
  wrap.innerHTML = buildMobileReportPdfHtml(r, form)
  document.body.appendChild(wrap)
  exportingId.value = r.id
  try {
    await exportHtmlElementToPdf(wrap, buildPdfFilename(r.formTitre || 'rapport', 'rapport'))
  } catch (e) {
    window.alert(e?.message || "Impossible d'exporter le PDF.")
  } finally {
    document.body.removeChild(wrap)
    exportingId.value = ''
  }
}
</script>
