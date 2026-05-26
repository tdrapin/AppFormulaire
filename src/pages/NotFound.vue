<template>
  <div class="m-page m-page--auth">
    <div class="m-auth">
      <div class="m-auth__header">
        <div class="m-auth__logo" aria-hidden="true">
          <i class="fa-solid fa-triangle-exclamation" />
        </div>
        <h1 class="m-auth__title">Page non trouvée</h1>
        <p class="m-auth__subtitle">La page demandée n'existe pas ou a été déplacée.</p>
      </div>

      <div class="m-auth__form">
        <router-link :to="homeRoute" class="m-btn m-btn--primary" style="display: block; text-align: center; text-decoration: none;">
          <i class="fa-solid fa-arrow-left" aria-hidden="true" /> Retour à l'accueil
        </router-link>
      </div>

      <p class="m-auth__footer">
        <router-link :to="{ name: 'Login' }" class="m-auth__link">
          <i class="fa-solid fa-right-to-bracket" /> Connexion
        </router-link>
        &nbsp;·&nbsp;
        <router-link :to="{ name: 'MobileFormList' }" class="m-auth__link">
          <i class="fa-solid fa-file-lines" /> Formulaires terrain
        </router-link>
        &nbsp;·&nbsp;
        <router-link :to="{ name: 'DesignerFormList' }" class="m-auth__link">
          <i class="fa-solid fa-pen-ruler" /> Concepteur
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'

const { isAuthenticated, isTerrain, isConcepteur, isAdmin } = useAuth()

const homeRoute = computed(() => {
  if (!isAuthenticated.value) return { name: 'Login' }
  if (isTerrain.value) return { name: 'MobileFormList' }
  if (isConcepteur.value || isAdmin.value) return { name: 'DesignerFormList' }
  return { name: 'Login' }
})
</script>
