<template>
  <div class="af-page builder-page">
    <header class="builder-page__head">
      <h1>Créateur (bureau)</h1>
      <p class="lead">Module classique à compléter — pour concevoir sur mobile, utilisez l’onglet Formulaires puis « Créer ».</p>
    </header>

    <div class="af-tile-grid">
      <router-link class="af-tile" :to="{ name: 'MobileFormNew' }">
        <span class="af-tile__icon af-tile__icon--orange"><i class="fa-solid fa-mobile-screen" /></span>
        <h2 class="af-tile__title">Concepteur mobile</h2>
        <p class="af-tile__desc">Création guidée : questions, types, champs obligatoires.</p>
      </router-link>

      <router-link class="af-tile" :to="{ name: 'MobileFormList' }">
        <span class="af-tile__icon af-tile__icon--purple"><i class="fa-solid fa-list" /></span>
        <h2 class="af-tile__title">Liste des gabarits</h2>
        <p class="af-tile__desc">Retour aux formulaires terrain.</p>
      </router-link>
    </div>

    <p class="builder-page__note">Le builder JSON avancé sera branché ici ultérieurement.</p>
  </div>
</template>

<script setup lang="ts">
// Point d’entrée bureau — renvoie vers le flux mobile
</script>

<style scoped>
.builder-page__head {
  margin-bottom: 16px;
}

.builder-page__note {
  margin-top: 24px;
  font-size: 0.85rem;
  color: var(--af-muted, #6b6b6b);
  text-align: center;
}
</style>
