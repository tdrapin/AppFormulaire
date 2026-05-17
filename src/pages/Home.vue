<template>
  <div class="home-modern">
    <section class="home-modern__hero" aria-hidden="true">
      <div class="home-modern__hero-inner">
        <div class="home-modern__logo">
          <i class="fa-solid fa-file-pen" aria-hidden="true" />
        </div>
        <h1 class="home-modern__title">AppFormulaire</h1>
        <p class="home-modern__hero-desc">Créez, remplissez et exportez vos formulaires terrain en quelques clics.</p>
      </div>
    </section>

    <div class="home-modern__sheet">
      <p class="home-modern__intro">Que souhaitez-vous faire ?</p>

      <div class="home-modern__grid">
        <router-link class="home-modern__tile" :to="{ name: 'MobileFormList' }">
          <span class="home-modern__tile-icon home-modern__tile-icon--orange">
            <i class="fa-solid fa-list-check" />
          </span>
          <div class="home-modern__tile-text">
            <h2>Mes formulaires</h2>
            <p>Choisir un formulaire et lancer une saisie terrain.</p>
          </div>
          <i class="fa-solid fa-chevron-right home-modern__tile-arrow" />
        </router-link>

        <router-link class="home-modern__tile" :to="{ name: 'MobileFormNew' }">
          <span class="home-modern__tile-icon home-modern__tile-icon--purple">
            <i class="fa-solid fa-plus" />
          </span>
          <div class="home-modern__tile-text">
            <h2>Nouveau formulaire</h2>
            <p>Créez un formulaire avec vos champs personnalisés.</p>
          </div>
          <i class="fa-solid fa-chevron-right home-modern__tile-arrow" />
        </router-link>

        <router-link class="home-modern__tile" :to="{ name: 'MobileHistory' }">
          <span class="home-modern__tile-icon home-modern__tile-icon--green">
            <i class="fa-solid fa-clock-rotate-left" />
          </span>
          <div class="home-modern__tile-text">
            <h2>Historique</h2>
            <p>Retrouvez vos formulaires complétés et exportez-les en PDF.</p>
          </div>
          <i class="fa-solid fa-chevron-right home-modern__tile-arrow" />
        </router-link>

        <router-link class="home-modern__tile" :to="{ name: 'Hub' }">
          <span class="home-modern__tile-icon home-modern__tile-icon--slate">
            <i class="fa-solid fa-gear" />
          </span>
          <div class="home-modern__tile-text">
            <h2>Outils & PDF</h2>
            <p>Administration, remplisseur web, tests et diagnostics.</p>
          </div>
          <i class="fa-solid fa-chevron-right home-modern__tile-arrow" />
        </router-link>
      </div>
      <br>
      <br>
      <br>
    </div>
  </div>
</template>

<script setup lang="ts">
// Accueil — page fluide centrée
</script>
