<template>
  <div class="app-shell" :class="[themeClass, { 'app-shell--with-tabs': showBottomNav }]">
    <!-- Orbs de fond (comme la page login) -->
    <div class="app-bg" aria-hidden="true">
      <div class="app-bg__orb app-bg__orb--terrain" />
      <div class="app-bg__orb app-bg__orb--concepteur" />
      <div class="app-bg__orb app-bg__orb--admin" />
    </div>

    <!-- Bannière d'erreur globale -->
    <div v-if="globalError" class="global-error-banner">
      <strong>Erreur :</strong> {{ globalError }}
      <button type="button" class="global-error-close" @click="globalError = ''">×</button>
    </div>

    <main class="app-main" :class="{ 'app-main--flush': isMobileShell }">
      <router-view :key="$route.fullPath" />
    </main>

    <AppBottomTabs v-if="showBottomNav" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onErrorCaptured } from 'vue'
import { useRoute } from 'vue-router'
import AppBottomTabs from './components/AppBottomTabs.vue'
import { useAuth } from './composables/useAuth'

const route = useRoute()
const { themeClass } = useAuth()

const globalError = ref('')

// Catcher les erreurs non gérées dans les composants enfants
onErrorCaptured((err) => {
  console.error('[App] Erreur capturée:', err)
  globalError.value = err?.message || 'Erreur inattendue.'
  return false // Empêcher la propagation
})

const showBottomNav = computed(() => !route.matched.some(r => r.meta?.hideBottomNav))

const isMobileShell = computed(() => route.path.startsWith('/mobile') || route.path.startsWith('/designer'))
</script>

<style scoped>
.app-main--flush {
  padding: 0;
  max-width: none;
}

.global-error-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: #dc2626;
  color: #fff;
  padding: 12px 16px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.global-error-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: auto;
  padding: 0 4px;
}
</style>
