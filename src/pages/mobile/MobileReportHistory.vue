<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="onBack">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">{{ selectedForm ? selectedForm.nom : 'Historique' }}</h1>
        <p class="m-header__subtitle">
          {{ selectedForm ? 'Formulaires complétés' : 'Formulaires complétés' }}
        </p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="route.query.ok" class="m-banner-info">Formulaire complété enregistré avec succès.</div>
      <div v-if="loadError" class="m-banner-error">{{ loadError }}</div>

      <!-- Barre de recherche -->
      <div class="m-search-bar">
        <i class="fa-solid fa-search m-search-bar__icon" aria-hidden="true" />
        <input
          v-model="searchQuery"
          class="m-input m-search-bar__input"
          type="text"
          :placeholder="selectedForm ? 'Rechercher un formulaire complété…' : 'Rechercher un formulaire…'"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="m-search-bar__clear"
          aria-label="Effacer la recherche"
          @click="searchQuery = ''"
        >
          <i class="fa-solid fa-times" aria-hidden="true" />
        </button>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="m-empty">
        <div class="m-spinner" aria-label="Chargement…" />
        <span>Chargement de l'historique…</span>
      </div>

      <!-- Vue dossiers : liste des formulaires -->
      <template v-else-if="!selectedForm">
        <div v-if="!filteredForms.length && !searchQuery" class="m-empty">
          <div class="m-empty__icon"><i class="fa-solid fa-folder-open" /></div>
          <strong>Aucun formulaire complété</strong>
          <span>Les formulaires que vous remplirez depuis la saisie terrain apparaîtront ici.</span>
          <router-link
            :to="{ name: 'MobileFormList' }"
            class="m-btn m-btn--ghost"
            style="display: inline-block; width: auto; padding: 12px 24px; text-decoration: none;"
          >
            Voir les formulaires
          </router-link>
        </div>

        <div v-else-if="!filteredForms.length" class="m-empty">
          <div class="m-empty__icon"><i class="fa-solid fa-search" /></div>
          <strong>Aucun résultat</strong>
          <span>Aucun formulaire ne correspond à "{{ searchQuery }}".</span>
        </div>

        <article
          v-for="f in filteredForms"
          :key="f.id"
          class="m-card m-card--folder"
          @click="selectForm(f)"
        >
          <div class="m-folder">
          <div class="m-folder__icon">
              <i class="fa-solid fa-file-alt" aria-hidden="true" />
            </div>
            <div class="m-folder__info">
              <h2 class="m-list-card__title">{{ f.nom }}</h2>
              <p class="m-list-card__desc">
                {{ instanceCountByForm[f.id] || 0 }} formulaire complété
              </p>
            </div>
            <i class="fa-solid fa-chevron-right m-folder__arrow" aria-hidden="true" />
          </div>
        </article>
      </template>

      <!-- Vue formulaires complétés : liste des instances d'un formulaire -->
      <template v-else>
        <div class="m-card m-card--muted" style="margin-bottom: 12px">
          <div style="display: flex; align-items: center; gap: 12px">
            <div class="m-folder__icon" style="font-size: 1.4rem">
              <i class="fa-solid fa-file-alt" aria-hidden="true" />
            </div>
            <div>
              <strong>{{ selectedForm.nom }}</strong>
              <p style="margin: 2px 0 0; font-size: 0.85rem; color: var(--m-text-muted)">
                {{ filteredInstances.length }} formulaire complété
              </p>
            </div>
          </div>
        </div>

        <div v-if="!filteredInstances.length && !searchQuery" class="m-empty">
          <div class="m-empty__icon"><i class="fa-solid fa-file" /></div>
          <strong>Aucun formulaire complété</strong>
          <span>Ce formulaire n'a pas encore été rempli.</span>
        </div>

        <div v-else-if="!filteredInstances.length" class="m-empty">
          <div class="m-empty__icon"><i class="fa-solid fa-search" /></div>
          <strong>Aucun résultat</strong>
          <span>Aucun formulaire complété ne correspond à "{{ searchQuery }}".</span>
        </div>

        <div v-if="selectedInstances.length" class="m-card m-card--muted" style="margin-bottom: 12px">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px">
            <span>{{ selectedInstances.length }} sélectionné(s)</span>
            <router-link
              class="m-btn-sm m-btn-sm--primary"
              :to="{ name: 'MobileBatchDetail', query: { ids: selectedIdsStr } }"
              style="text-decoration: none;"
            >
              Voir
            </router-link>
          </div>
        </div>

        <article v-for="inst in filteredInstances" :key="inst.id" class="m-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
            <div style="min-width: 0">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(inst.id)"
                  @change="toggleSelect(inst.id)"
                  style="width: 18px; height: 18px; accent-color: var(--m-primary)"
                />
                <h2 class="m-list-card__title" style="margin: 0">{{ inst.nom }}</h2>
              </div>
              <p class="m-list-card__desc" style="margin-bottom: 6px">{{ inst.client || '—' }}</p>
              <time class="m-field__num" style="color: var(--m-text-muted); font-weight: 500">
                {{ formatDate(inst.created_at) }}
              </time>
            </div>
          </div>
          <div class="m-row-actions">
            <router-link
              class="m-btn-sm m-btn-sm--primary"
              :to="{ name: 'MobileReportDetail', params: { reportId: inst.id } }"
            >
              Voir
            </router-link>
            <button
              v-if="canDelete(inst)"
              type="button"
              class="m-btn-sm m-btn-sm--danger"
              @click="confirmDeleteInstance(inst)"
            >
              <i class="fa-solid fa-trash" /> Supprimer
            </button>
          </div>
        </article>
      </template>
    </div>

    <!-- Modal confirmation suppression -->
    <div v-if="deleteTarget" class="m-modal-overlay" @click.self="deleteTarget = null">
      <div
        class="m-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-instance-title"
        aria-describedby="delete-instance-desc"
      >
        <h3 id="delete-instance-title">Confirmer la suppression</h3>
        <p id="delete-instance-desc">Êtes-vous sûr de vouloir supprimer <strong>{{ deleteTarget.nom }}</strong> ?</p>
        <p style="font-size: 0.85rem; color: var(--m-text-muted)">Cette action est irréversible.</p>
        <div style="display: flex; gap: 10px; margin-top: 16px">
          <button type="button" class="m-btn m-btn--ghost" style="flex: 1" @click="deleteTarget = null">Annuler</button>
          <button type="button" class="m-btn" style="flex: 1; background: var(--m-danger); color: #fff" @click="handleDeleteInstance">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SupabaseDataService from '../../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { useAuth } from '../../composables/useAuth'

type FormRow = {
  id: string
  nom: string
}

type InstanceRow = {
  id: string
  formulaire_id: string
  nom: string
  user_id: string | null
  created_at: string
  client?: string | null
}

const route = useRoute()
const router = useRouter()
const { user, isTerrain } = useAuth()

type AuthUserLike = {
  id: string
}

const currentUserId = computed(() => (user.value as AuthUserLike | null)?.id ?? null)

const forms = ref<FormRow[]>([])
const instances = ref<InstanceRow[]>([])
const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')
const selectedFormId = ref('')
const deleteTarget = ref<InstanceRow | null>(null)

const selectedForm = computed(() =>
  selectedFormId.value ? forms.value.find(f => f.id === selectedFormId.value) : null
)

// Sélection multiple pour visualisation groupée
const selectedIds = ref(new Set())

const selectedInstances = computed(() =>
  instances.value.filter(r => selectedIds.value.has(r.id))
)

const selectedIdsStr = computed(() =>
  Array.from(selectedIds.value).join(',')
)

function toggleSelect(id: string) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedIds.value = s
}

// Compte le nombre d'instances par formulaire
const instanceCountByForm = computed(() => {
  const counts: Record<string, number> = {}
  for (const inst of instances.value) {
    counts[inst.formulaire_id] = (counts[inst.formulaire_id] || 0) + 1
  }
  return counts
})

// Formulaires qui ont des instances, filtrés par recherche
const filteredForms = computed(() => {
  const formIdsWithInstances = new Set(instances.value.map(r => r.formulaire_id))
  let list = forms.value.filter(f => formIdsWithInstances.has(f.id))

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(f => f.nom.toLowerCase().includes(q))
  }

  list.sort((a, b) => (instanceCountByForm.value[b.id] || 0) - (instanceCountByForm.value[a.id] || 0))
  return list
})

// Instances du formulaire sélectionné, filtrées par recherche
const filteredInstances = computed(() => {
  let list = instances.value.filter(r => r.formulaire_id === selectedFormId.value)

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      r =>
        (r.nom || '').toLowerCase().includes(q)
    )
  }

  return list
})

function selectForm(f: FormRow) {
  selectedFormId.value = f.id
  searchQuery.value = ''
}

function onBack() {
  if (selectedFormId.value) {
    selectedFormId.value = ''
    searchQuery.value = ''
  } else {
    router.push({ name: 'MobileFormList' })
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  } catch {
    return iso
  }
}

async function loadData() {
  loading.value = true
  loadError.value = ''
  try {
    if (!isSupabaseConfigured()) {
      loadError.value = 'Supabase n\'est pas configuré.'
      forms.value = []
      instances.value = []
      return
    }
    forms.value = await SupabaseDataService.getForms()
    // Charger toutes les instances
    const allInstances = []
    for (const f of forms.value) {
      try {
        const insts = await SupabaseDataService.getInstancesByFormId(f.id)
        allInstances.push(...insts)
      } catch { /* ignore */ }
    }
    instances.value = allInstances
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Erreur lors du chargement.'
    forms.value = []
    instances.value = []
  } finally {
    loading.value = false
  }
}

// ─── Suppression d'instance ──────────────────────────────────

/**
 * Vérifie si l'utilisateur peut supprimer cette instance.
 * Terrain : uniquement ses propres instances.
 * Concepteur/Admin : toutes les instances.
 */
function canDelete(inst: InstanceRow) {
  if (!currentUserId.value) return false
  // Si l'utilisateur est terrain, il ne peut supprimer que ses propres instances
  if (isTerrain.value) {
    return inst.user_id === currentUserId.value
  }
  // Concepteur et admin peuvent supprimer toutes les instances
  return true
}

function confirmDeleteInstance(inst: InstanceRow) {
  deleteTarget.value = inst
}

async function handleDeleteInstance() {
  if (!deleteTarget.value) return
  try {
    const instanceId = deleteTarget.value.id
    await SupabaseDataService.deleteInstance(instanceId)
    // Retirer l'instance de la liste
    instances.value = instances.value.filter(i => i.id !== instanceId)
    deleteTarget.value = null
    loadError.value = ''
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Erreur lors de la suppression.'
  }
}

onMounted(loadData)
</script>
