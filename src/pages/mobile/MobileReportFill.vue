<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="onBack">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">{{ form?.schema_json?.titre || 'Saisie du rapport' }}</h1>
        <p class="m-header__subtitle">{{ form?.schema_json?.sousTitre || form?.nom || '—' }}</p>
      </div>
    </header>

    <div
      v-if="form && sections.length"
      class="m-progress-strip"
      role="progressbar"
      :aria-valuenow="sectionIndex + 1"
      :aria-valuemax="sections.length"
      aria-label="Progression du formulaire"
    >
      <div class="m-progress-strip__fill" :style="{ width: progressWidth + '%' }" />
    </div>

    <div class="m-body">
      <div v-if="pageError" class="m-banner-error">{{ pageError }}</div>
      <div v-else-if="!form" class="m-banner-error">Aucun formulaire ne correspond à cette saisie.</div>

      <template v-else>
        <div class="m-card m-card--muted">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px">
            <span style="font-size: 0.85rem; color: var(--m-text-muted)">
              Section {{ sectionIndex + 1 }} / {{ sections.length }}
            </span>
            <span class="m-step-badge">{{ filledRequired }}/{{ totalRequired }}</span>
          </div>
        </div>

        <transition name="m-section" mode="out-in">
          <section class="m-form-shell" :key="sectionIndex">
            <div class="m-block-title">
              <span class="m-step-badge">{{ sectionIndex + 1 }}</span>
              <h2>{{ currentSection?.titre }}</h2>
            </div>

            <div v-for="(champ, idx) in currentChamps" :key="champ.id" class="m-question">
              <div class="m-question__num">Q{{ globalIndexStart + idx + 1 }}</div>
              <div class="m-question__label">
                {{ champ.label }}
                <span v-if="champ.required" style="color: var(--m-danger)">*</span>
              </div>

              <textarea
                v-if="champ.type === 'textarea'"
                v-model="answers[champ.id]"
                class="m-textarea"
                :class="{ 'm-textarea--error': Boolean(fieldErrors[champ.id]) }"
                rows="4"
                :placeholder="`Saisie ${champ.label.toLowerCase()}`"
              />
              <input
                v-else
                v-model="answers[champ.id]"
                :type="inputType(champ.type)"
                class="m-input"
                :class="{ 'm-input--error': Boolean(fieldErrors[champ.id]) }"
                :placeholder="placeholderFor(champ.type)"
              />
              <p v-if="fieldErrors[champ.id]" class="m-error-msg">{{ fieldErrors[champ.id] }}</p>
            </div>
          </section>
        </transition>
      </template>
    </div>

    <div class="m-footer-actions">
      <button type="button" class="m-btn m-btn--primary" :disabled="navigating" @click="onNext">
        {{ navigating ? 'Chargement…' : 'Suivant' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SupabaseDataService from '../../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { validateField } from '../../lib/utils/validators'

const route = useRoute()
const router = useRouter()

const form = ref(null)
const answers = reactive({})
const pageError = ref('')
const fieldErrors = reactive({})
const navigating = ref(false)

const formId = computed(() => route.params.formId as string)

const sections = computed(() => form.value?.schema_json?.sections || [])
const sectionIndex = ref(0)

const currentSection = computed(() => sections.value[sectionIndex.value])
const currentChamps = computed(() => currentSection.value?.champs || [])

const progressWidth = computed(() => {
  const n = sections.value.length
  if (!n) return 0
  return Math.round(((sectionIndex.value + 1) / n) * 100)
})

const globalIndexStart = computed(() => {
  let n = 0
  for (let i = 0; i < sectionIndex.value; i++) {
    n += (sections.value[i]?.champs || []).length
  }
  return n
})

const totalRequired = computed(() => {
  let n = 0
  for (const s of sections.value) {
    for (const c of s.champs || []) {
      if (c.required) n++
    }
  }
  return n || 0
})

const filledRequired = computed(() => {
  let n = 0
  for (const s of sections.value) {
    for (const c of s.champs || []) {
      if (c.required && String(answers[c.id] || '').trim()) n++
    }
  }
  return n
})

function inputType(t: string) {
  if (t === 'number') return 'number'
  if (t === 'date') return 'date'
  return 'text'
}

function placeholderFor(t: string) {
  if (t === 'date') return 'JJ/MM/AAAA'
  if (t === 'number') return '0'
  return 'Votre réponse'
}

function validateCurrent(): boolean {
  Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
  let ok = true
  for (const c of currentChamps.value) {
    const msg = validateField(answers[c.id], c)
    if (msg) {
      fieldErrors[c.id] = msg
      ok = false
    }
  }
  return ok
}

function onNext() {
  pageError.value = ''
  if (!form.value) return
  if (!validateCurrent()) return

  if (sectionIndex.value < sections.value.length - 1) {
    sectionIndex.value += 1
    return
  }
  // Stocker les réponses dans le query param pour le résumé
  const encoded = encodeURIComponent(JSON.stringify(answers))
  router.push({ name: 'MobileReportSummary', params: { formId: formId.value }, query: { answers: encoded } })
}

function onBack() {
  if (sectionIndex.value > 0) {
    sectionIndex.value -= 1
    return
  }
  router.push({ name: 'MobileFormList' })
}

onMounted(async () => {
  if (!isSupabaseConfigured()) {
    pageError.value = 'Supabase n\'est pas configuré.'
    return
  }
  try {
    const f = await SupabaseDataService.getFormById(formId.value)
    if (!f) {
      pageError.value = 'Impossible de charger ce formulaire. Revenez à la liste.'
      return
    }
    form.value = f
    // Initialiser les réponses vides
    for (const sec of f.schema_json?.sections || []) {
      for (const c of sec.champs || []) {
        answers[c.id] = ''
      }
    }
  } catch (e) {
    pageError.value = 'Erreur lors du chargement du formulaire.'
  }
})
</script>
