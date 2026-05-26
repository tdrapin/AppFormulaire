<template>
  <div class="m-page">
    <header class="m-header">
      <div class="m-header__titles" style="padding-left: 4px">
        <h1 class="m-header__title">Concepteur</h1>
        <p class="m-header__subtitle">Gérez vos formulaires et gabarits</p>
      </div>
    </header>

    <div class="m-body">
      <div class="m-search-bar">
        <i class="fa-solid fa-search m-search-bar__icon" aria-hidden="true" />
        <input v-model="searchQuery" class="m-input m-search-bar__input" type="text" placeholder="Rechercher un formulaire…" />
        <button v-if="searchQuery" type="button" class="m-search-bar__clear" aria-label="Effacer" @click="searchQuery = ''">
          <i class="fa-solid fa-times" aria-hidden="true" />
        </button>
      </div>

      <div v-if="loading" class="m-empty">
        <div class="m-spinner" aria-label="Chargement…" />
        <span>Chargement…</span>
      </div>

      <div v-else-if="loadError" class="m-banner-error">
        <strong>Erreur :</strong> {{ loadError }}
      </div>

      <div v-else-if="!forms.length" class="m-empty">
        <div class="m-empty__icon"><i class="fa-solid fa-file-pen" /></div>
        <strong>Aucun formulaire</strong>
        <span>Créez votre premier formulaire.</span>
        <router-link :to="{ name: 'DesignerFormNew' }" class="m-btn m-btn--primary" style="display:inline-block;width:auto;padding:12px 24px;text-decoration:none;">
          Créer un formulaire
        </router-link>
      </div>

      <div v-else-if="!filteredForms.length" class="m-empty">
        <div class="m-empty__icon"><i class="fa-solid fa-search" /></div>
        <strong>Aucun résultat</strong>
        <span>Aucun formulaire ne correspond à "{{ searchQuery }}".</span>
      </div>

      <div v-for="f in filteredForms" :key="f.id" class="m-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
          <div style="min-width:0;flex:1">
            <h2 class="m-list-card__title">{{ f.nom }}</h2>
            <p class="m-list-card__desc">{{ f.schema_json?.sections?.length || 0 }} section(s)</p>
            <p v-if="f.schema_json?.templates?.length" class="m-list-card__desc" style="margin-top:2px">
              {{ f.schema_json.templates.length }} gabarit(s)
            </p>
          </div>
        </div>
        <div class="m-row-actions" style="margin-top:10px">
          <router-link class="m-btn-sm m-btn-sm--primary" :to="{ name: 'DesignerFormEdit', params: { formId: f.id } }">
            <i class="fa-solid fa-pen" /> Modifier
          </router-link>
          <router-link class="m-btn-sm" :to="{ name: 'DesignerTemplates', params: { formId: f.id } }">
            <i class="fa-solid fa-palette" /> Gabarits
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="forms.length" class="m-footer-actions">
      <router-link :to="{ name: 'DesignerFormNew' }" class="m-btn m-btn--primary" >
        Créer un nouveau formulaire
      </router-link>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SupabaseDataService from '../../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

console.log('[DesignerFormList] mounted - component loaded successfully')
const forms = ref([])
const searchQuery = ref('')
const loading = ref(true)
const loadError = ref('')

const filteredForms = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return forms.value
  return forms.value.filter(f => f.nom.toLowerCase().includes(q))
})

onMounted(async () => {
  loading.value = true
  loadError.value = ''
  try {
    if (!isSupabaseConfigured()) {
      loadError.value = 'Supabase non configuré. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env'
      return
    }
    console.log('[DesignerFormList] calling getForms...')
    forms.value = await SupabaseDataService.getForms()
    console.log('[DesignerFormList] got forms:', forms.value.length)
  } catch (e) {
    console.error('[DesignerFormList] error:', e)
    loadError.value = e?.message || 'Erreur de chargement.'
  } finally {
    loading.value = false
  }
})
</script>
