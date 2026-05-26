<template>
  <div class="m-page">
    <header class="m-header">
      <div class="m-header__titles">
        <h1 class="m-header__title">Instances</h1>
        <p class="m-header__subtitle">{{ instances.length }} instance(s) enregistrée(s)</p>
      </div>
    </header>

    <div class="m-body">
      <!-- Messages -->
      <div v-if="pageError" class="m-banner-error">{{ pageError }}</div>

      <!-- Filtre par formulaire -->
      <div class="m-search-bar">
        <i class="fa-solid fa-filter m-search-bar__icon" aria-hidden="true" />
        <select v-model="selectedFormId" class="m-input m-search-bar__input" style="border: none !important; background: transparent !important; padding: 12px 0 !important">
          <option value="">Tous les formulaires</option>
          <option v-for="f in forms" :key="f.id" :value="f.id">{{ f.title || f.name || 'Sans titre' }}</option>
        </select>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="m-empty">
        <div class="m-spinner" aria-label="Chargement…" />
        <span>Chargement des instances…</span>
      </div>

      <!-- Liste des instances -->
      <div v-for="inst in filteredInstances" :key="inst.id" class="m-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
          <div style="flex: 1; min-width: 0">
            <strong>{{ inst.name || 'Instance #' + inst.id.slice(0, 8) }}</strong>
            <p style="margin: 2px 0 0; font-size: 0.85rem; color: var(--m-text-muted)">
              {{ inst.form_title || 'Formulaire inconnu' }}
            </p>
            <p style="margin: 4px 0 0; font-size: 0.75rem; color: var(--m-text-muted)">
              Créée le {{ formatDate(inst.created_at) }}
              <span v-if="inst.created_by"> par {{ inst.created_by }}</span>
            </p>
          </div>
          <div style="display: flex; gap: 6px; flex-shrink: 0">
            <button type="button" class="m-btn-sm m-btn-sm--primary" @click="viewInstance(inst)">
              <i class="fa-solid fa-eye" /> Voir
            </button>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-if="!loading && !filteredInstances.length" class="m-empty">
        <div class="m-empty__icon"><i class="fa-solid fa-database" /></div>
        <strong>Aucune instance</strong>
        <span v-if="selectedFormId">Aucune instance pour ce formulaire.</span>
        <span v-else>Aucune instance enregistrée pour le moment.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'

const router = useRouter()

const instances = ref([])
const forms = ref([])
const loading = ref(true)
const pageError = ref('')
const selectedFormId = ref('')

const filteredInstances = computed(() => {
  if (!selectedFormId.value) return instances.value
  return instances.value.filter(i => i.form_id === selectedFormId.value)
})

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
  } catch { return iso }
}

function viewInstance(inst) {
  // Rediriger vers le détail de l'instance (page existante)
  router.push({ name: 'MobileReportDetail', params: { reportId: inst.id } })
}

async function loadData() {
  loading.value = true
  pageError.value = ''
  try {
    if (!isSupabaseConfigured()) {
      pageError.value = 'Supabase non configuré.'
      return
    }

    // Charger les formulaires
    const { data: formsData, error: formsError } = await supabase
      .from('formulaires')
      .select('id, title, name')
      .order('created_at', { ascending: false })

    if (!formsError) {
      forms.value = formsData || []
    }

    // Charger les instances
    const { data: instancesData, error: instancesError } = await supabase
      .from('instances')
      .select('*')
      .order('created_at', { ascending: false })

    if (instancesError) {
      pageError.value = instancesError.message
      return
    }

    // Enrichir avec le titre du formulaire
    const formMap = {}
    for (const f of forms.value) {
      formMap[f.id] = f.title || f.name || 'Sans titre'
    }

    instances.value = (instancesData || []).map(inst => ({
      ...inst,
      form_title: formMap[inst.form_id] || 'Formulaire inconnu'
    }))
  } catch (e) {
    pageError.value = e?.message || 'Erreur de chargement.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
