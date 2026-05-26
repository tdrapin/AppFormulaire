<template>
  <div class="m-page m-page--auth">
    <div class="m-auth">
      <!-- Logo / Titre -->
      <div class="m-auth__header">
        <div class="m-auth__logo" aria-hidden="true">
          <i class="fa-solid fa-user-plus" />
        </div>
        <h1 class="m-auth__title">Créer un compte</h1>
        <p class="m-auth__subtitle">Inscrivez-vous pour utiliser AppFormulaire</p>
      </div>

      <!-- Message d'erreur -->
      <div v-if="authError" class="m-banner-error">{{ authError }}</div>

      <!-- Message de succès -->
      <div v-if="successMessage" class="m-banner-success">{{ successMessage }}</div>

      <!-- Formulaire d'inscription -->
      <form class="m-auth__form" @submit.prevent="handleRegister">
        <div class="m-card">
          <label class="m-label" for="reg-name">Nom complet</label>
          <input
            id="reg-name"
            v-model="fullName"
            class="m-input"
            type="text"
            autocomplete="name"
            placeholder="Jean Dupont"
          />

          <label class="m-label" for="reg-email" style="margin-top: 14px">Email</label>
          <input
            id="reg-email"
            v-model="email"
            class="m-input"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="exemple@email.com"
            required
          />

          <label class="m-label" for="reg-password" style="margin-top: 14px">Mot de passe</label>
          <div class="m-password-field">
            <input
              id="reg-password"
              v-model="password"
              class="m-input"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Au moins 6 caractères"
              required
              minlength="6"
            />
            <button
              type="button"
              class="m-password-toggle"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
            </button>
          </div>
          <p class="m-hint" style="margin-top: 6px">Minimum 6 caractères</p>

          <label class="m-label" for="reg-confirm" style="margin-top: 14px">Confirmer le mot de passe</label>
          <input
            id="reg-confirm"
            v-model="confirmPassword"
            class="m-input"
            :class="{ 'm-input--error': passwordMismatch }"
            type="password"
            autocomplete="new-password"
            placeholder="Répétez le mot de passe"
            required
          />
          <p v-if="passwordMismatch" class="m-error-msg">Les mots de passe ne correspondent pas.</p>
        </div>

        <button type="submit" class="m-btn m-btn--primary" :disabled="busy">
          {{ busy ? 'Inscription…' : 'Créer mon compte' }}
        </button>
      </form>

      <p class="m-auth__footer">
        Déjà un compte ?
        <router-link :to="{ name: 'Login' }" class="m-auth__link">Se connecter</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { register, authError } = useAuth()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const busy = ref(false)
const successMessage = ref('')

const passwordMismatch = computed(() => {
  if (!confirmPassword.value) return false
  return password.value !== confirmPassword.value
})

async function handleRegister() {
  if (busy.value || passwordMismatch.value) return

  busy.value = true
  successMessage.value = ''
  try {
    const result = await register(email.value.trim(), password.value, fullName.value.trim())
    if (result.success) {
      // Rediriger vers le bon parcours selon le rôle
      successMessage.value = 'Compte créé avec succès ! Redirection…'
      setTimeout(() => {
        if (result.role === 'terrain') {
          router.push({ name: 'MobileFormList' })
        } else {
          router.push({ name: 'DesignerFormList' })
        }
      }, 1500)
    }
  } finally {
    busy.value = false
  }
}
</script>
