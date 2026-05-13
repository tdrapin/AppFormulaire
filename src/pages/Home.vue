<template>
  <div class="home-modern">
    <section class="home-modern__hero" aria-hidden="true">
      <div class="home-modern__hero-inner">
        <p class="home-modern__kicker">Formulaires dynamiques</p>
        <h1 class="home-modern__title">AppFormulaire</h1>
        <p class="home-modern__hero-desc">Création, saisie terrain et rapports PDF — tout depuis votre mobile.</p>
      </div>
    </section>

    <div class="home-modern__sheet">
      <p class="home-modern__intro">Que souhaitez-vous faire ?</p>

      <div class="af-tile-grid home-modern__grid">
        <router-link class="af-tile" :to="{ name: 'MobileFormList' }">
          <span class="af-tile__icon af-tile__icon--orange"><i class="fa-solid fa-list-check" /></span>
          <h2 class="af-tile__title">Mes formulaires</h2>
          <p class="af-tile__desc">Choisir un formulaire et lancer une saisie terrain.</p>
        </router-link>

        <router-link class="af-tile" :to="{ name: 'MobileFormNew' }">
          <span class="af-tile__icon af-tile__icon--purple"><i class="fa-solid fa-plus" /></span>
          <h2 class="af-tile__title">Nouveau formulaire</h2>
          <p class="af-tile__desc">Créez un formulaire avec vos champs personnalisés.</p>
        </router-link>

        <router-link class="af-tile" :to="{ name: 'MobileHistory' }">
          <span class="af-tile__icon af-tile__icon--green"><i class="fa-solid fa-folder-open" /></span>
          <h2 class="af-tile__title">Historique</h2>
          <p class="af-tile__desc">Rapports terminés ou brouillons, export PDF.</p>
        </router-link>

        <router-link class="af-tile" :to="{ name: 'Hub' }">
          <span class="af-tile__icon af-tile__icon--slate"><i class="fa-solid fa-gear" /></span>
          <h2 class="af-tile__title">Outils & PDF</h2>
          <p class="af-tile__desc">Administration, remplisseur web, tests.</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Accueil — grille type référence « trucker home »
</script>
