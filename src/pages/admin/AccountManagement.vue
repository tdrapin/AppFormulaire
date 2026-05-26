<template>
  <div class="m-page">
    <header class="m-header">
      <div class="m-header__titles" style="padding-left: 4px">
        <h1 class="m-header__title">Gestion des comptes</h1>
        <p class="m-header__subtitle">{{ users.length }} utilisateur(s) · Admin</p>
      </div>
    </header>

    <div class="m-body">
      <!-- Messages -->
      <div v-if="pageError" class="m-banner-error">{{ pageError }}</div>
      <div v-if="successMsg" class="m-banner-success">{{ successMsg }}</div>

      <!-- Barre de recherche -->
      <div class="m-search-bar">
        <i class="fa-solid fa-search m-search-bar__icon" aria-hidden="true" />
        <input v-model="searchQuery" class="m-input m-search-bar__input" type="text" placeholder="Rechercher un utilisateur…" />
        <button v-if="searchQuery" type="button" class="m-search-bar__clear" aria-label="Effacer" @click="searchQuery = ''">
          <i class="fa-solid fa-times" aria-hidden="true" />
        </button>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="m-empty">
        <div class="m-spinner" aria-label="Chargement…" />
        <span>Chargement des utilisateurs…</span>
      </div>

      <!-- Liste des utilisateurs -->
      <div v-for="u in filteredUsers" :key="u.id" class="m-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
          <div style="flex: 1; min-width: 0">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px">
              <div class="m-account-avatar">{{ userInitial(u) }}</div>
              <div>
                <strong>{{ u.full_name || '—' }}</strong>
                <p style="margin: 0; font-size: 0.85rem; color: var(--m-text-muted)">{{ u.email }}</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px">
              <span class="m-account-role-badge" :class="roleBadgeClass(u.role)">{{ roleLabel(u.role) }}</span>
              <span style="font-size: 0.75rem; color: var(--m-text-muted)">
                Créé le {{ formatDate(u.created_at) }}
              </span>
            </div>
          </div>
          <div style="display: flex; gap: 6px; flex-shrink: 0">
            <button type="button" class="m-icon-btn m-icon-btn--edit" aria-label="Modifier" title="Modifier" @click="openEdit(u)">
              <i class="fa-solid fa-pen" />
            </button>
            <button type="button" class="m-icon-btn" aria-label="Supprimer" title="Supprimer" @click="confirmDelete(u)">
              <i class="fa-solid fa-trash" />
            </button>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-if="!loading && !filteredUsers.length" class="m-empty">
        <div class="m-empty__icon"><i class="fa-solid fa-users" /></div>
        <strong>Aucun utilisateur</strong>
        <span v-if="searchQuery">Aucun résultat pour "{{ searchQuery }}".</span>
        <span v-else>Créez votre premier utilisateur.</span>
      </div>

      <!-- Bouton création -->
      <button type="button" class="m-btn m-btn--primary" style="width: 100%; margin-top: 8px" @click="openCreate">
        <i class="fa-solid fa-user-plus" /> Créer un utilisateur
      </button>
    </div>

    <!-- Modal Création / Modification -->
    <div v-if="showModal" class="tpl-modal-overlay" @click.self="showModal = false">
      <div class="tpl-modal">
        <h3 style="margin-top: 0">{{ isEditing ? 'Modifier l\'utilisateur' : 'Créer un utilisateur' }}</h3>

        <label class="m-label">Nom complet</label>
        <input v-model="form.full_name" class="m-input" type="text" placeholder="Jean Dupont" style="margin-bottom: 10px" />

        <label class="m-label">Email *</label>
        <input v-model="form.email" class="m-input" type="email" placeholder="exemple@email.com" style="margin-bottom: 10px" :disabled="isEditing" />

        <label v-if="!isEditing" class="m-label">Mot de passe *</label>
        <input v-if="!isEditing" v-model="form.password" class="m-input" type="password" placeholder="Minimum 6 caractères" minlength="6" style="margin-bottom: 10px" />

        <label class="m-label">Rôle</label>
        <select v-model="form.role" class="m-select" style="margin-bottom: 16px">
          <option value="terrain">Terrain — Saisie terrain</option>
          <option value="concepteur">Concepteur — Création de formulaires</option>
          <option value="admin">Administrateur — Gestion complète</option>
        </select>

        <div style="display: flex; gap: 10px">
          <button type="button" class="m-btn m-btn--ghost" style="flex: 1" @click="showModal = false">Annuler</button>
          <button type="button" class="m-btn m-btn--primary" style="flex: 1" :disabled="saving" @click="saveUser">
            {{ saving ? 'Enregistrement…' : (isEditing ? 'Modifier' : 'Créer') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmation suppression -->
    <div v-if="deleteTarget" class="tpl-modal-overlay" @click.self="deleteTarget = null">
      <div class="tpl-modal">
        <h3 style="margin-top: 0">Confirmer la suppression</h3>
        <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ deleteTarget.email }}</strong> ?</p>
        <p style="font-size: 0.85rem; color: var(--m-text-muted)">Cette action est irréversible.</p>
        <div style="display: flex; gap: 10px; margin-top: 16px">
          <button type="button" class="m-btn m-btn--ghost" style="flex: 1" @click="deleteTarget = null">Annuler</button>
          <button type="button" class="m-btn" style="flex: 1; background: var(--m-danger); color: #fff" :disabled="saving" @click="handleDelete">
            {{ saving ? 'Suppression…' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ProfileService from '../../lib/services/ProfileService'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

const users = ref([])
const loading = ref(true)
const saving = ref(false)
const pageError = ref('')
const successMsg = ref('')
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const deleteTarget = ref(null)

const form = ref({
  id: '',
  email: '',
  password: '',
  full_name: '',
  role: 'terrain'
})

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(u =>
    (u.email || '').toLowerCase().includes(q) ||
    (u.full_name || '').toLowerCase().includes(q)
  )
})

function userInitial(u) {
  const name = u.full_name || u.email || '?'
  return name.charAt(0).toUpperCase()
}

function roleLabel(role) {
  const labels = { terrain: 'Terrain', concepteur: 'Concepteur', admin: 'Admin' }
  return labels[role] || role
}

function roleBadgeClass(role) {
  const classes = {
    terrain: 'm-account-role-badge--terrain',
    concepteur: 'm-account-role-badge--concepteur',
    admin: 'm-account-role-badge--admin'
  }
  return classes[role] || ''
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { dateStyle: 'medium' })
  } catch { return iso }
}

async function loadUsers() {
  loading.value = true
  pageError.value = ''
  try {
    if (!isSupabaseConfigured()) {
      pageError.value = 'Supabase non configuré.'
      return
    }
    users.value = await ProfileService.getAllUsers()
  } catch (e) {
    pageError.value = e?.message || 'Erreur de chargement.'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  isEditing.value = false
  form.value = { id: '', email: '', password: '', full_name: '', role: 'terrain' }
  showModal.value = true
}

function openEdit(user) {
  isEditing.value = true
  form.value = {
    id: user.id,
    email: user.email || '',
    password: '',
    full_name: user.full_name || '',
    role: user.role || 'terrain'
  }
  showModal.value = true
}

async function saveUser() {
  if (saving.value) return
  pageError.value = ''
  successMsg.value = ''

  if (!form.value.email.trim()) {
    pageError.value = 'L\'email est requis.'
    return
  }
  if (!isEditing.value && !form.value.password) {
    pageError.value = 'Le mot de passe est requis.'
    return
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await ProfileService.updateUser(form.value.id, {
        full_name: form.value.full_name.trim(),
        email: form.value.email.trim()
      })
      if (form.value.role) {
        await ProfileService.updateUserRole(form.value.id, form.value.role)
      }
      successMsg.value = '✅ Utilisateur modifié avec succès.'
    } else {
      await ProfileService.createUser(
        form.value.email.trim(),
        form.value.password,
        form.value.full_name.trim(),
        form.value.role
      )
      successMsg.value = '✅ Utilisateur créé avec succès.'
    }
    showModal.value = false
    await loadUsers()
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (e) {
    pageError.value = e?.message || 'Erreur lors de l\'enregistrement.'
  } finally {
    saving.value = false
  }
}

function confirmDelete(user) {
  deleteTarget.value = user
}

async function handleDelete() {
  if (saving.value || !deleteTarget.value) return
  saving.value = true
  pageError.value = ''
  successMsg.value = ''
  try {
    await ProfileService.deleteUser(deleteTarget.value.id)
    successMsg.value = `✅ Utilisateur ${deleteTarget.value.email} supprimé.`
    deleteTarget.value = null
    await loadUsers()
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (e) {
    pageError.value = e?.message || 'Erreur lors de la suppression.'
  } finally {
    saving.value = false
  }
}

onMounted(loadUsers)
</script>

<style scoped>
/* ─── Modal ──────────────────────────────────────────────── */
.tpl-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  animation: m-fade-in 0.15s ease;
}

.tpl-modal {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
  width: 100%;
  max-width: 400px;
  padding: 24px;
  animation: m-fade-in 0.2s ease;
}

.tpl-modal h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 16px;
}

.m-account-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--m-accent-soft);
  color: var(--m-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.m-account-role-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}

.m-account-role-badge--terrain {
  background: #d1fae5;
  color: #065f46;
}

.m-account-role-badge--concepteur {
  background: #dbeafe;
  color: #1e40af;
}

.m-account-role-badge--admin {
  background: #ede9fe;
  color: #5b21b6;
}

.m-icon-btn--edit {
  background: #f0f9ff;
  color: #0369a1;
}

.m-icon-btn--edit:hover {
  background: #e0f2fe;
}
</style>
