<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="goBack">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">Paramètres</h1>
        <p class="m-header__subtitle">Préférences de l'application</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="successMsg" class="m-banner-success">{{ successMsg }}</div>

      <div class="m-card">
        <h3 style="margin: 0 0 12px">Export PDF</h3>

        <label class="m-label">Format de date</label>
        <select v-model="dateFormat" class="m-select" style="margin-bottom: 12px">
          <option value="fr">JJ/MM/AAAA</option>
          <option value="iso">AAAA-MM-JJ</option>
          <option value="us">MM/JJ/AAAA</option>
        </select>

        <label class="m-label">Orientation par défaut</label>
        <select v-model="orientation" class="m-select" style="margin-bottom: 12px">
          <option value="portrait">Portrait</option>
          <option value="landscape">Paysage</option>
        </select>

        <label class="m-label">Marges (mm)</label>
        <input v-model.number="marginMm" class="m-input" type="number" min="5" max="30" style="margin-bottom: 12px" />
      </div>

      <div class="m-card">
        <h3 style="margin: 0 0 12px">Application</h3>

        <div class="m-switch-row">
          <span style="font-size: 0.9rem; font-weight: 500">Thème sombre</span>
          <label class="m-switch">
            <input v-model="darkMode" type="checkbox" />
            <span class="m-switch__ui" />
          </label>
        </div>

        <p style="font-size: 0.8rem; color: var(--m-text-muted); margin-top: 8px">
          Version 1.0.0 — AppFormulaire
        </p>
      </div>

      <button type="button" class="m-btn m-btn--primary" style="width: 100%" @click="saveSettings">
        Enregistrer les préférences
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { isAdmin, userRole } = useAuth()

const successMsg = ref('')

// Charger les préférences depuis localStorage
const dateFormat = ref(localStorage.getItem('af_dateFormat') || 'fr')
const orientation = ref(localStorage.getItem('af_orientation') || 'portrait')
const marginMm = ref(Number(localStorage.getItem('af_marginMm')) || 12)
const darkMode = ref(localStorage.getItem('af_darkMode') === 'true')

function saveSettings() {
  localStorage.setItem('af_dateFormat', dateFormat.value)
  localStorage.setItem('af_orientation', orientation.value)
  localStorage.setItem('af_marginMm', String(marginMm.value))
  localStorage.setItem('af_darkMode', String(darkMode.value))
  successMsg.value = '✅ Préférences enregistrées.'
  setTimeout(() => { successMsg.value = '' }, 3000)
}

function goBack() {
  if (isAdmin.value || userRole.value === 'concepteur') {
    router.push({ name: 'DesignerTools' })
  } else {
    router.push({ name: 'MobileTools' })
  }
}
</script>
