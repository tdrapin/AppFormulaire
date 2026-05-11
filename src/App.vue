<template>
  <div class="app-shell" :class="{ 'app-shell--with-tabs': showBottomNav }">
    <main class="app-main" :class="{ 'app-main--flush': isMobileShell }">
      <router-view />
    </main>
    <AppBottomTabs v-if="showBottomNav" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppBottomTabs from './components/AppBottomTabs.vue'

const route = useRoute()

const showBottomNav = computed(() => !route.matched.some(r => r.meta?.hideBottomNav))

const isMobileShell = computed(() => route.path.startsWith('/mobile'))
</script>

<style scoped>
.app-main--flush {
  padding: 0;
  max-width: none;
}
</style>
