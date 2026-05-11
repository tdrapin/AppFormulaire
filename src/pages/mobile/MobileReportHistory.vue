<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="router.push({ name: 'MobileFormList' })">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">Historique</h1>
        <p class="m-header__subtitle">Rapports remplis et PDF</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="route.query.ok" class="m-banner-info">Document enregistré. Le PDF sera disponible dans votre espace (démo).</div>

      <div v-if="!reports.length" class="m-empty">
        <strong>Aucun rapport</strong>
        <span>Les rapports générés apparaîtront ici.</span>
      </div>

      <article v-for="r in reports" :key="r.id" class="m-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
          <div style="min-width: 0">
            <h2 class="m-list-card__title">{{ r.formTitre }}</h2>
            <p class="m-list-card__desc" style="margin-bottom: 6px">{{ r.client }}</p>
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
          <button type="button" class="m-btn-sm" @click="exportDemo(r)">Exporter</button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useMobileFormDemo } from '../../composables/useMobileFormDemo'

const route = useRoute()
const router = useRouter()
const { reports } = useMobileFormDemo()

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

function exportDemo(r) {
  window.alert(`Export PDF (démo) — rapport « ${r.formTitre} » pour ${r.client}.`)
}
</script>
