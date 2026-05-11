<template>
  <div class="not-found-container af-page">
    <div class="error-content">
      <div class="error-code" aria-hidden="true">404</div>
      <h1>Page non trouvée</h1>
      <p class="error-message">La page demandée n’existe pas ou a été déplacée.</p>

      <router-link to="/" class="nf-btn nf-btn--primary">
        <i class="fas fa-house" aria-hidden="true" />
        Retour à l’accueil
      </router-link>

      <div class="nf-divider">
        <h2>Accès rapides</h2>
        <ul class="nf-links">
          <li>
            <router-link :to="{ name: 'MobileFormList' }"><i class="fa-solid fa-file-lines" /> Formulaires</router-link>
          </li>
          <li>
            <router-link :to="{ name: 'Hub' }"><i class="fa-solid fa-layer-group" /> Outils</router-link>
          </li>
          <li>
            <router-link :to="{ name: 'Runner' }"><i class="fa-solid fa-keyboard" /> Remplisseur web</router-link>
          </li>
          <li>
            <router-link :to="{ name: 'Admin' }"><i class="fa-solid fa-file-pdf" /> Gestion PDF</router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 — navigation sans barre classique
</script>
