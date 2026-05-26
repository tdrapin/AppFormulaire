<template>
  <div class="mobile-app">
    <router-view v-slot="{ Component }">
      <transition name="m-page" mode="out-in">
        <component :is="Component" :key="$route.fullPath" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
// Enveloppe mobile : tokens et typo dans mobile-ui.css
</script>

<style src="../styles/mobile-ui.css"></style>
