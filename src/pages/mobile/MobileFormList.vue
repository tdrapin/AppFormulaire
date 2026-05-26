<template>
  <div class="m-page">
    <header class="m-header">
      <div class="m-header__titles" style="padding-left: 4px">
        <h1 class="m-header__title">Mes formulaires</h1>
        <p class="m-header__subtitle">Sélectionnez un formulaire à remplir</p>
      </div>
    </header>

    <div class="m-body">
      <!-- Barre de recherche -->
      <div class="m-search-bar">
        <i class="fa-solid fa-search m-search-bar__icon" aria-hidden="true" />
        <input
          v-model="searchQuery"
          class="m-input m-search-bar__input"
          type="text"
          placeholder="Rechercher un formulaire…"
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
        <span>Chargement des formulaires…</span>
      </div>

      <!-- Erreur -->
      <div v-else-if="loadError" class="m-banner-error">{{ loadError }}</div>

      <!-- État vide -->
      <div v-else-if="!forms.length" class="m-empty">
        <div class="m-empty__icon"><i class="fa-solid fa-file-pen" /></div>
        <strong>Aucun formulaire disponible</strong>
        <span v-if="isTerrain">Aucun formulaire n'a encore été créé. Veuillez contacter votre administrateur ou revenir plus tard.</span>
        <span v-else>Créez votre premier formulaire pour démarrer les saisies terrain.</span>
        <router-link
          v-if="!isTerrain"
          :to="{ name: 'DesignerFormNew' }"
          class="m-btn m-btn--primary"
          style="display: inline-block; width: auto; padding: 12px 24px; text-decoration: none;"
        >
          Créer un formulaire
        </router-link>
      </div>

      <!-- Aucun résultat de recherche -->
      <div v-else-if="!filteredForms.length" class="m-empty">
        <div class="m-empty__icon"><i class="fa-solid fa-search" /></div>
        <strong>Aucun résultat</strong>
        <span>Aucun formulaire ne correspond à "{{ searchQuery }}".</span>
      </div>

      <!-- Liste des formulaires -->
      <div v-for="f in filteredForms" :key="f.id" class="m-card m-card--form">
        <router-link
          :to="{ name: 'MobileReportFill', params: { formId: f.id } }"
          class="m-card--form__link"
        >
          <div class="m-card--form__top">
            <div class="m-card--form__icon">
              <i class="fa-solid fa-file-alt" aria-hidden="true" />
            </div>
            <div class="m-card--form__info">
              <h2 class="m-list-card__title">{{ f.nom }}</h2>
              <p class="m-list-card__desc">{{ f.description || 'Sans description' }}</p>
            </div>
            <i class="fa-solid fa-chevron-right m-card--form__arrow" aria-hidden="true" />
          </div>
          <div class="m-card--form__bottom">
            <span class="m-card--form__count">
              {{ instanceCountByForm[f.id] || 0 }} rempli(s)
            </span>
          </div>
        </router-link>
        <router-link
          v-if="!isTerrain"
          :to="{ name: 'DesignerFormEdit', params: { formId: f.id } }"
          class="m-card--form__edit"
        >
          <i class="fa-solid fa-pen" aria-hidden="true" /> Modifier
        </router-link>
      </div>
    </div>

    <div v-if="forms.length && !isTerrain" class="m-footer-actions">
      <router-link
        :to="{ name: 'DesignerFormNew' }"
        class="m-btn m-btn--primary"
        style="text-align: center; text-decoration: none;"
      >
        Créer un nouveau formulaire
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SupabaseDataService from '../../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { useAuth } from '../../composables/useAuth'

const { isTerrain } = useAuth()

const forms = ref([])
const instances = ref([])
const searchQuery = ref('')
const loading = ref(true)
const loadError = ref('')

// Compte le nombre d'instances par formulaire
const instanceCountByForm = computed(() => {
  const counts = {}
  for (const inst of instances.value) {
    counts[inst.formulaire_id] = (counts[inst.formulaire_id] || 0) + 1
  }
  return counts
})

// Filtrer les formulaires par recherche
const filteredForms = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return forms.value
  return forms.value.filter(f => f.nom.toLowerCase().includes(q))
})

async function loadForms() {
  loading.value = true
  loadError.value = ''
  try {
    if (!isSupabaseConfigured()) {
      loadError.value = 'Supabase n\'est pas configuré. Vérifiez vos variables d\'environnement.'
      forms.value = []
      instances.value = []
      return
    }
    forms.value = await SupabaseDataService.getForms()
    // Charger toutes les instances pour compter
    const allInstances = []
    for (const f of forms.value) {
      try {
        const insts = await SupabaseDataService.getInstancesByFormId(f.id)
        allInstances.push(...insts)
      } catch { /* ignore */ }
    }
    instances.value = allInstances
  } catch (e) {
    loadError.value = e?.message || 'Erreur lors du chargement des formulaires.'
    forms.value = []
    instances.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadForms)
</script>
