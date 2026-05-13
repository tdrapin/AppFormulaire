<template>
  <div class="m-page">
    <header class="m-header">
      <div class="m-header__titles" style="padding-left: 4px">
        <h1 class="m-header__title">Formulaires</h1>
        <p class="m-header__subtitle">Sélectionnez un formulaire terrain</p>
      </div>
    </header>

    <div class="m-body">
      <!-- État vide amélioré -->
      <div v-if="!forms.length" class="m-empty">
        <div class="m-empty__icon"><i class="fa-solid fa-file-pen" /></div>
        <strong>Aucun formulaire disponible</strong>
        <span>Créez votre premier formulaire pour démarrer les saisies terrain.</span>
        <router-link :to="{ name: 'MobileFormNew' }" class="m-btn m-btn--primary" style="display: inline-block; width: auto; padding: 12px 24px; text-decoration: none;">
          Créer un formulaire
        </router-link>
      </div>

      <!-- Liste des formulaires -->
      <div v-for="f in forms" :key="f.id" class="m-card">
        <router-link
          :to="{ name: 'MobileReportFill', params: { formId: f.id } }"
          style="display: block; color: inherit; text-decoration: none"
        >
          <h2 class="m-list-card__title">{{ f.nom }}</h2>
          <p class="m-list-card__desc">{{ f.description || 'Sans description' }}</p>
          <span
            class="m-status"
            :class="f.statut === 'complet' ? 'm-status--ok' : 'm-status--warn'"
          >
            {{ f.statut === 'complet' ? 'Complet' : 'Incomplet' }}
          </span>
        </router-link>
        <router-link
          :to="{ name: 'MobileFormEdit', params: { formId: f.id } }"
          style="display: inline-block; margin-top: 12px; font-size: 0.85rem; font-weight: 600; color: var(--m-accent)"
        >
          Modifier le formulaire
        </router-link>
      </div>
    </div>

    <div v-if="forms.length" class="m-footer-actions">
      <router-link :to="{ name: 'MobileFormNew' }" class="m-btn m-btn--primary" style="text-align: center; text-decoration: none;">
        Créer un nouveau formulaire
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMobileFormDemo } from '../../composables/useMobileFormDemo'

const { forms } = useMobileFormDemo()
</script>
