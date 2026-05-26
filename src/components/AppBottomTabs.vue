<template>
  <nav class="app-bottom-tabs" aria-label="Navigation principale">
    <div class="app-bottom-tabs__inner">
      <router-link
        v-for="tab in visibleTabs"
        :key="tab.name"
        :to="tab.to"
        class="app-tab"
        :class="{ 'app-tab--active': isActive(tab) }"
      >
        <span class="app-tab__indicator" aria-hidden="true" />
        <i :class="['app-tab__icon', tab.icon]" aria-hidden="true" />
        <span class="app-tab__label">{{ tab.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const { isTerrain, isConcepteur, isAdmin } = useAuth()

// Onglets pour le rôle Terrain
const terrainTabs = [
  {
    name: 'Forms',
    label: 'Formulaires',
    to: { name: 'MobileFormList' },
    icon: 'fa-solid fa-file-lines',
    match: ['MobileFormList', 'MobileReportFill', 'MobileReportSummary']
  },
  {
    name: 'History',
    label: 'Historique',
    to: { name: 'MobileHistory' },
    icon: 'fa-solid fa-clock-rotate-left',
    match: ['MobileHistory', 'MobileReportDetail', 'MobileBatchDetail']
  },
  {
    name: 'Tools',
    label: 'Outils',
    to: { name: 'MobileTools' },
    icon: 'fa-solid fa-gear',
    match: ['MobileTools', 'MobileToolsSettings']
  }
]

// Onglets pour le rôle Concepteur
// IMPORTANT : les match arrays ne doivent JAMAIS se chevaucher
// pour éviter que 2 onglets soient actifs en même temps.
const concepteurTabs = [
  {
    name: 'DesignerForms',
    label: 'Formulaires',
    to: { name: 'DesignerFormList' },
    icon: 'fa-solid fa-file-lines',
    match: ['DesignerFormList', 'DesignerFormNew', 'DesignerFormEdit']
  },
  {
    name: 'DesignerInstances',
    label: 'Instances',
    to: { name: 'DesignerInstances' },
    icon: 'fa-solid fa-database',
    match: ['DesignerInstances']
  },
  {
    name: 'Tools',
    label: 'Outils',
    to: { name: 'DesignerTools' },
    icon: 'fa-solid fa-gear',
    match: ['DesignerTools', 'DesignerToolsSettings']
  }
]

// Onglets pour le rôle Admin (concepteur + Comptes)
const adminTabs = [
  concepteurTabs[0], // Formulaires
  concepteurTabs[1], // Instances
  {
    name: 'AdminAccounts',
    label: 'Comptes',
    to: { name: 'AdminAccounts' },
    icon: 'fa-solid fa-users-gear',
    match: ['AdminAccounts']
  },
  concepteurTabs[2] // Outils
]

// Sélectionner les onglets selon le rôle
const visibleTabs = computed(() => {
  if (isAdmin.value) return adminTabs
  if (isConcepteur.value) return concepteurTabs
  // Fallback : terrain ou pas de rôle
  return terrainTabs
})

function isActive(tab: { match: string[] }) {
  return tab.match.includes(String(route.name))
}
</script>
