<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="goBack">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">Résumé</h1>
        <p class="m-header__subtitle">Vérification avant génération</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="banner" class="m-banner-error">{{ banner }}</div>

      <template v-else-if="form && fillSession">
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

    <div v-if="!banner && form && fillSession" class="m-footer-actions">
      <button type="button" class="m-btn m-btn--primary" :disabled="busy" @click="generate">
        {{ busy ? 'Génération…' : 'Générer le document' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMobileFormDemo } from '../../composables/useMobileFormDemo'

const route = useRoute()
const router = useRouter()
const { formById, fillSession, saveReportFromSession } = useMobileFormDemo()

const banner = ref('')
const busy = ref(false)

const formId = computed(() => route.params.formId as string)
const form = computed(() => formById(formId.value))

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
  const v = fillSession.value?.answers?.[id]
  if (v === undefined || v === null || String(v).trim() === '') return '—'
  return String(v)
}

function goBack() {
  router.push({ name: 'MobileReportFill', params: { formId: formId.value } })
}

function generate() {
  busy.value = true
  try {
    saveReportFromSession('terminé')
    router.push({ name: 'MobileHistory', query: { ok: '1' } })
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  if (!fillSession.value || fillSession.value.formId !== formId.value) {
    banner.value = 'Aucune saisie en cours. Ouvrez un formulaire depuis la liste.'
  }
})
</script>
