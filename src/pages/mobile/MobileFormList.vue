<template>
  <div class="m-page">
    <header class="m-header">
      <div class="m-header__titles" style="padding-left: 4px">
        <h1 class="m-header__title">Formulaires</h1>
        <p class="m-header__subtitle">Sélectionnez un gabarit terrain</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="!forms.length" class="m-empty">
        <strong>Aucun gabarit disponible</strong>
        <span>Créez un premier formulaire pour démarrer les interventions.</span>
      </div>

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
          Modifier le gabarit
        </router-link>
      </div>
    </div>

    <div class="m-footer-actions">
      <router-link :to="{ name: 'MobileFormNew' }" class="m-btn m-btn--primary" style="text-align: center">
        Créer un nouveau formulaire
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMobileFormDemo } from '../../composables/useMobileFormDemo'

const { forms } = useMobileFormDemo()
</script>
