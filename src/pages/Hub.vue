<template>
  <div class="af-page hub-page">
    <header class="hub-page__head">
      <h1>Outils & bureau</h1>
      <p class="lead">Accès rapide aux modules hors terrain</p>
    </header>

    <div class="af-tile-grid">
      <router-link class="af-tile" :to="{ name: 'Admin' }">
        <span class="af-tile__icon af-tile__icon--orange"><i class="fa-solid fa-file-pdf" /></span>
        <h2 class="af-tile__title">Gestion & PDF</h2>
        <p class="af-tile__desc">Mustache, gabarits et export PDF des instances Supabase.</p>
      </router-link>

      <router-link class="af-tile" :to="{ name: 'Runner' }">
        <span class="af-tile__icon af-tile__icon--purple"><i class="fa-solid fa-keyboard" /></span>
        <h2 class="af-tile__title">Remplisseur web</h2>
        <p class="af-tile__desc">Saisie bureau connectée à la base (écran large).</p>
      </router-link>

      <router-link class="af-tile" :to="{ name: 'Builder' }">
        <span class="af-tile__icon af-tile__icon--green"><i class="fa-solid fa-screwdriver-wrench" /></span>
        <h2 class="af-tile__title">Créateur (bureau)</h2>
        <p class="af-tile__desc">Module classique — préférez le concepteur mobile pour le terrain.</p>
      </router-link>

      <router-link class="af-tile" :to="{ name: 'TestLab' }">
        <span class="af-tile__icon af-tile__icon--slate"><i class="fa-solid fa-flask" /></span>
        <h2 class="af-tile__title">Test Lab</h2>
        <p class="af-tile__desc">Diagnostics et jeux de données de test.</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Hub central — navigation par tuiles
</script>

<style scoped>
.hub-page__head {
  margin-bottom: 8px;
}
</style>
