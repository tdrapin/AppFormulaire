<template>
  <div class="m-page m-page--auth">
    <div class="m-auth">
      <!-- Logo / Titre -->
      <div class="m-auth__header">
        <div class="m-auth__logo" aria-hidden="true">
          <i class="fa-solid fa-key" />
        </div>
        <h1 class="m-auth__title">Mot de passe oublié</h1>
        <p class="m-auth__subtitle">Recevez un lien pour réinitialiser votre mot de passe</p>
      </div>

      <!-- Message d'erreur -->
      <div v-if="authError" class="m-banner-error">{{ authError }}</div>

      <!-- Message de succès -->
      <div v-if="sent" class="m-banner-success">
        <strong>Email envoyé !</strong><br />
        Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.
      </div>

      <!-- Formulaire -->
      <form v-if="!sent" class="m-auth__form" @submit.prevent="handleReset">
        <div class="m-card">
          <label class="m-label" for="reset-email">Email</label>
          <input
            id="reset-email"
            v-model="email"
            class="m-input"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="exemple@email.com"
            required
            autofocus
          />
        </div>

        <button type="submit" class="m-btn m-btn--primary" :disabled="busy">
          {{ busy ? 'Envoi…' : 'Envoyer le lien' }}
        </button>
      </form>

      <p class="m-auth__footer">
        <router-link :to="{ name: 'Login' }" class="m-auth__link">
          <i class="fa-solid fa-arrow-left" /> Retour à la connexion
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../../composables/useAuth'

const { resetPassword, authError } = useAuth()

const email = ref('')
const busy = ref(false)
const sent = ref(false)

async function handleReset() {
  if (busy.value) return
  busy.value = true
  try {
    const ok = await resetPassword(email.value.trim())
    if (ok) {
      sent.value = true
    }
  } finally {
    busy.value = false
  }
}
</script>
