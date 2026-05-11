<template>
  <nav class="app-bottom-tabs" aria-label="Navigation principale">
    <div class="app-bottom-tabs__inner">
      <router-link
        v-for="tab in tabs"
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
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { name: 'Home', label: 'Accueil', to: { name: 'Home' }, icon: 'fa-solid fa-house', match: ['Home'] },
  {
    name: 'Forms',
    label: 'Formulaires',
    to: { name: 'MobileFormList' },
    icon: 'fa-solid fa-file-lines',
    match: ['MobileFormList']
  },
  {
    name: 'History',
    label: 'Historique',
    to: { name: 'MobileHistory' },
    icon: 'fa-solid fa-clock-rotate-left',
    match: ['MobileHistory']
  },
  {
    name: 'Hub',
    label: 'Outils',
    to: { name: 'Hub' },
    icon: 'fa-solid fa-layer-group',
    match: ['Hub', 'Builder', 'Runner', 'Admin', 'TestLab']
  }
]

function isActive(tab: { match: string[] }) {
  return tab.match.includes(String(route.name))
}
</script>
