<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="goBack">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">Outils</h1>
        <p class="m-header__subtitle">{{ roleLabel }}</p>
      </div>
    </header>

    <div class="m-body">
      <!-- Profil -->
      <div class="m-card">
        <div style="display: flex; align-items: center; gap: 14px">
          <div class="m-tools-avatar">
            {{ userInitial }}
          </div>
          <div style="flex: 1; min-width: 0">
            <strong style="font-size: 1.05rem">{{ userFullName }}</strong>
            <p style="margin: 2px 0 0; font-size: 0.85rem; color: var(--m-text-muted)">{{ userEmail }}</p>
            <span class="m-tools-role-badge" :class="roleBadgeClass">{{ roleLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Menu Outils -->
      <div class="m-card" style="padding: 0; overflow: hidden">
        <router-link
          v-for="item in menuItems"
          :key="item.name"
          :to="item.to"
          class="m-tools-item"
          :class="{ 'm-tools-item--danger': item.danger }"
        >
          <i :class="['m-tools-item__icon', item.icon]" aria-hidden="true" />
          <div class="m-tools-item__info">
            <strong>{{ item.label }}</strong>
            <p v-if="item.desc" class="m-tools-item__desc">{{ item.desc }}</p>
          </div>
          <i class="fa-solid fa-chevron-right m-tools-item__arrow" aria-hidden="true" />
        </router-link>
      </div>

      <!-- Déconnexion -->
      <button type="button" class="m-btn m-btn--ghost" style="width: 100%; margin-top: 8px" @click="handleLogout">
        <i class="fa-solid fa-right-from-bracket" aria-hidden="true" /> Déconnexion
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { userFullName, userEmail, userRole, isAdmin, logout } = useAuth()

const roleLabel = computed(() => {
  if (userRole.value === 'admin') return 'Administrateur'
  if (userRole.value === 'concepteur') return 'Concepteur'
  if (userRole.value === 'terrain') return 'Utilisateur terrain'
  return '—'
})

const roleBadgeClass = computed(() => {
  if (userRole.value === 'admin') return 'm-tools-role-badge--admin'
  if (userRole.value === 'concepteur') return 'm-tools-role-badge--concepteur'
  return 'm-tools-role-badge--terrain'
})

const userInitial = computed(() => {
  const name = userFullName.value
  return name ? name.charAt(0).toUpperCase() : '?'
})

const menuItems = computed(() => {
  const items = [
    {
      name: 'settings',
      label: 'Paramètres',
      desc: 'Préférences d\'export, format de date, thème',
      icon: 'fa-solid fa-sliders',
      to: isAdmin.value || userRole.value === 'concepteur'
        ? { name: 'DesignerToolsSettings' }
        : { name: 'MobileToolsSettings' }
    },
    {
      name: 'about',
      label: 'À propos',
      desc: 'Version et informations de l\'application',
      icon: 'fa-solid fa-circle-info',
      to: '#',
      danger: false
    }
  ]

  // Ajouter "Gestion des comptes" uniquement pour admin
  if (isAdmin.value) {
    items.unshift({
      name: 'accounts',
      label: 'Gestion des comptes',
      desc: 'Créer, modifier, supprimer des utilisateurs',
      icon: 'fa-solid fa-users-gear',
      to: { name: 'AdminAccounts' }
    })
  }

  return items
})

function goBack() {
  if (isAdmin.value || userRole.value === 'concepteur') {
    router.push({ name: 'DesignerFormList' })
  } else {
    router.push({ name: 'MobileFormList' })
  }
}

async function handleLogout() {
  await logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.m-tools-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--m-accent-soft);
  color: var(--m-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.m-tools-role-badge {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}

.m-tools-role-badge--terrain {
  background: #dbeafe;
  color: #1d4ed8;
}

.m-tools-role-badge--concepteur {
  background: #fef3c7;
  color: #92400e;
}

.m-tools-role-badge--admin {
  background: #fce7f3;
  color: #9d174d;
}

.m-tools-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--m-border);
  text-decoration: none;
  color: inherit;
  transition: background 0.12s;
}

.m-tools-item:last-child {
  border-bottom: none;
}

.m-tools-item:active {
  background: #fafafa;
}

.m-tools-item--danger {
  color: var(--m-danger);
}

.m-tools-item__icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 10px;
  font-size: 1rem;
  flex-shrink: 0;
  color: var(--m-text-muted);
}

.m-tools-item--danger .m-tools-item__icon {
  background: #fef2f2;
  color: var(--m-danger);
}

.m-tools-item__info {
  flex: 1;
  min-width: 0;
}

.m-tools-item__info strong {
  font-size: 0.95rem;
}

.m-tools-item__desc {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--m-text-muted);
}

.m-tools-item__arrow {
  color: var(--m-text-muted);
  font-size: 0.8rem;
  opacity: 0.4;
}
</style>
