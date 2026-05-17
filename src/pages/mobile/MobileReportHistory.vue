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

        <article v-for="inst in filteredInstances" :key="inst.id" class="m-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
            <div style="min-width: 0">
              <h2 class="m-list-card__title">{{ inst.donnees_json?._nom || inst.nom || 'Rapport' }}</h2>
              <p class="m-list-card__desc" style="margin-bottom: 6px">{{ inst.client || '—' }}</p>
              <time class="m-question__num" style="color: var(--m-text-muted); font-weight: 500">
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
              type="button"
              class="m-btn-sm"
              :disabled="exportingId === inst.id"
              @click="exportInstancePdf(inst)"
            >
              {{ exportingId === inst.id ? 'PDF…' : 'Exporter' }}
            </button>
          </div>
        </article>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SupabaseDataService from '../../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { buildPdfFilename, exportHtmlElementToPdf } from '../../composables/usePdfExport'
import { buildMobileReportPdfHtml } from '../../lib/renderMobileReportPdfHtml'

const route = useRoute()
const router = useRouter()

const forms = ref([])
const instances = ref([])
const loading = ref(true)
const loadError = ref('')
const exportingId = ref('')
const searchQuery = ref('')
const selectedFormId = ref('')

const selectedForm = computed(() =>
  selectedFormId.value ? forms.value.find(f => f.id === selectedFormId.value) : null
)

// Compte le nombre d'instances par formulaire
const instanceCountByForm = computed(() => {
  const counts = {}
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

function selectForm(f) {
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

async function exportInstancePdf(inst) {
  const form = forms.value.find(f => f.id === inst.formulaire_id)
  const wrap = document.createElement('div')
  wrap.style.cssText =
    'position:fixed;left:-12000px;top:0;width:210mm;padding:12mm;background:#fff;'
  wrap.innerHTML = buildMobileReportPdfHtml(inst, form, null)
  document.body.appendChild(wrap)
  exportingId.value = inst.id
  try {
    await exportHtmlElementToPdf(
      wrap,
      buildPdfFilename(inst.donnees_json?._nom || inst.nom || 'rapport', 'rapport')
    )
  } catch (e) {
    window.alert(e?.message || "Impossible d'exporter le PDF.")
  } finally {
    document.body.removeChild(wrap)
    exportingId.value = ''
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
    loadError.value = e?.message || 'Erreur lors du chargement.'
    forms.value = []
    instances.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
