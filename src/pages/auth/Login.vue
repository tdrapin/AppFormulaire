<template>
  <div class="login-page">
    <!-- Dégradé de fond multi-couleurs -->
    <div class="login-bg" aria-hidden="true">
      <div class="login-bg__orb login-bg__orb--terrain" />
      <div class="login-bg__orb login-bg__orb--concepteur" />
      <div class="login-bg__orb login-bg__orb--admin" />
    </div>

    <div class="login-container">
      <!-- Logo / Titre -->
      <div class="login-header">
        <div class="login-logo">
          <i class="fa-solid fa-file-pen" />
        </div>
        <h1 class="login-title">AppFormulaire</h1>
        <p class="login-subtitle">Connectez-vous pour accéder à vos formulaires</p>
      </div>

      <!-- Message d'erreur -->
      <div v-if="authError" class="login-error">{{ authError }}</div>

      <!-- Message de succès (après inscription) -->
      <div v-if="$route.query.registered" class="login-success">
        Compte créé avec succès. Vous pouvez maintenant vous connecter.
      </div>

      <!-- Formulaire de connexion -->
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="login-card">
          <label class="login-label" for="login-email">Email</label>
          <input
            id="login-email"
            v-model="email"
            class="login-input"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="exemple@email.com"
            required
            autofocus
          />

          <label class="login-label" for="login-password" style="margin-top: 16px">Mot de passe</label>
          <div class="login-password-field">
            <input
              id="login-password"
              v-model="password"
              class="login-input"
              :class="{ 'login-input--with-toggle': true }"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Votre mot de passe"
              required
            />
            <button
              type="button"
              class="login-password-toggle"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
            </button>
          </div>

          <div class="login-links">
            <router-link :to="{ name: 'ForgotPassword' }" class="login-link">
              Mot de passe oublié ?
            </router-link>
          </div>
        </div>

        <button type="submit" class="login-btn" :disabled="busy">
          <span v-if="busy" class="login-btn__spinner" />
          <span v-else>Se connecter</span>
        </button>
      </form>

      <!-- L'inscription est réservée à l'administrateur -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { login, authError } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const busy = ref(false)

async function handleLogin() {
  if (busy.value) return
  busy.value = true
  try {
    const result = await login(email.value.trim(), password.value)
    if (result.success) {
      const redirect = route.query.redirect as string
      if (redirect) {
        router.push(redirect)
      } else if (result.role === 'terrain') {
        router.push({ name: 'MobileFormList' })
      } else {
        router.push({ name: 'DesignerFormList' })
      }
    }
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
/* ─── Page entière ─── */
.login-page {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  overflow: hidden;
  background: #f8f9fc;
}

/* ─── Dégradé de fond multi-couleurs ─── */
.login-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.login-bg__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}

/* Terrain (vert) — en bas à gauche */
.login-bg__orb--terrain {
  width: 50vmax;
  height: 50vmax;
  bottom: -15vmax;
  left: -15vmax;
  background: radial-gradient(circle, #10b981 0%, #059669 60%, transparent 100%);
}

/* Concepteur (bleu) — en haut à droite */
.login-bg__orb--concepteur {
  width: 45vmax;
  height: 45vmax;
  top: -12vmax;
  right: -12vmax;
  background: radial-gradient(circle, #3b82f6 0%, #2563eb 60%, transparent 100%);
}

/* Admin (violet) — en bas à droite */
.login-bg__orb--admin {
  width: 40vmax;
  height: 40vmax;
  bottom: -8vmax;
  right: -8vmax;
  background: radial-gradient(circle, #8b5cf6 0%, #7c3aed 60%, transparent 100%);
}

/* ─── Conteneur central ─── */
.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ─── En-tête ─── */
.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #fff;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
}

.login-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0 0 6px;
  color: #1e293b;
  letter-spacing: -0.03em;
}

.login-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

/* ─── Messages ─── */
.login-error {
  width: 100%;
  padding: 12px 16px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 16px;
  text-align: center;
}

.login-success {
  width: 100%;
  padding: 12px 16px;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 16px;
  text-align: center;
}

/* ─── Carte formulaire ─── */
.login-form {
  width: 100%;
}

.login-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 24px 20px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
}

.login-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.login-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  background: #fff;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}

.login-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.login-input--with-toggle {
  padding-right: 44px;
}

.login-password-field {
  position: relative;
}

.login-password-toggle {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 8px 10px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.login-password-toggle:hover {
  color: #64748b;
}

.login-links {
  margin-top: 14px;
  text-align: right;
}

.login-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
}

.login-link:hover {
  text-decoration: underline;
}

/* ─── Bouton de connexion ─── */
.login-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  color: #fff;
  background: linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6);
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
}

.login-btn:active {
  transform: scale(0.98);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.login-btn__spinner {
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: login-spin 0.6s linear infinite;
}

@keyframes login-spin {
  to { transform: rotate(360deg); }
}

/* ─── Footer ─── */
.login-footer {
  margin-top: 20px;
  font-size: 0.85rem;
  color: #64748b;
  text-align: center;
}

/* ─── Responsive ─── */
@media (max-width: 400px) {
  .login-page {
    padding: 16px 12px;
  }
  .login-card {
    padding: 20px 16px;
  }
  .login-logo {
    width: 56px;
    height: 56px;
    font-size: 1.4rem;
  }
  .login-title {
    font-size: 1.4rem;
  }
}
</style>
