<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="goBack">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">Résumé</h1>
        <p class="m-header__subtitle">Vérification avant enregistrement</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="banner" class="m-banner-error">{{ banner }}</div>

      <template v-else-if="form && Object.keys(answers).length">
        <div class="m-card" style="display: flex; gap: 16px; align-items: center">
          <div class="m-hero-doc" aria-hidden="true" />
          <div style="flex: 1; min-width: 0">
            <h2 class="m-list-card__title" style="margin-bottom: 4px">{{ form.schema_json?.titre || form.nom }}</h2>
            <p class="m-list-card__desc" style="margin-bottom: 0">
              {{ sectionCount }} section(s) · {{ questionCount }} question(s)
            </p>
          </div>
        </div>

        <section v-for="sec in sections" :key="sec.id" class="m-card">
          <div class="m-block-title">
            <span class="m-step-badge">{{ sectionLabel(sec) }}</span>
            <h2>{{ sec.titre }}</h2>
          </div>
          <div v-for="c in sec.champs || []" :key="c.id" style="margin-bottom: 12px">
            <div class="m-question__num">{{ c.label }}</div>
            <p style="margin: 4px 0 0; font-size: 0.95rem; word-break: break-word">
              {{ displayAnswer(c.id) }}
            </p>
          </div>
        </section>
      </template>
    </div>

    <div v-if="!banner && form && Object.keys(answers).length" class="m-footer-actions">
      <button type="button" class="m-btn m-btn--primary" :disabled="busy" @click="generate">
        {{ busy ? 'Enregistrement…' : 'Enregistrer le rapport' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SupabaseDataService from '../../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

const route = useRoute()
const router = useRouter()

const form = ref(null)
const answers = ref({})
const banner = ref('')
const busy = ref(false)

const formId = computed(() => route.params.formId as string)

const sections = computed(() => form.value?.schema_json?.sections || [])

const questionCount = computed(() =>
  sections.value.reduce((n, s) => n + (s.champs || []).length, 0)
)

const sectionCount = computed(() => sections.value.length)

function sectionLabel(sec) {
  const i = sections.value.findIndex(s => s.id === sec.id)
  return i + 1
}

function displayAnswer(id: string) {
  const v = answers.value[id]
  if (v === undefined || v === null || String(v).trim() === '') return '—'
  return String(v)
}

function goBack() {
  router.push({ name: 'MobileReportFill', params: { formId: formId.value } })
}

async function generate() {
  if (busy.value) return
  busy.value = true
  try {
    if (!isSupabaseConfigured()) {
      banner.value = 'Supabase n\'est pas configuré.'
      return
    }
    await SupabaseDataService.createInstance(formId.value, answers.value)
    await router.push({ name: 'MobileHistory', query: { ok: '1' } })
  } catch (e) {
    banner.value = e?.message || 'Erreur lors de l\'enregistrement.'
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  // Récupérer les réponses depuis le query param
  const raw = route.query.answers as string
  if (!raw) {
    banner.value = 'Aucune saisie en cours. Ouvrez un formulaire depuis la liste.'
    return
  }
  try {
    answers.value = JSON.parse(decodeURIComponent(raw))
  } catch {
    banner.value = 'Erreur de lecture des réponses.'
    return
  }

  if (!isSupabaseConfigured()) {
    banner.value = 'Supabase n\'est pas configuré.'
    return
  }
  try {
    const f = await SupabaseDataService.getFormById(formId.value)
    if (!f) {
      banner.value = 'Formulaire introuvable.'
      return
    }
    form.value = f
  } catch (e) {
    banner.value = 'Erreur lors du chargement du formulaire.'
  }
})
</script>
