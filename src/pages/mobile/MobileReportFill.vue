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
      v-if="form && fillSession && sections.length"
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

      <template v-else-if="fillSession">
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
                v-model="fillSession.answers[champ.id]"
                class="m-textarea"
                :class="{ 'm-textarea--error': Boolean(fieldErrors[champ.id]) }"
                rows="4"
                :placeholder="`Saisie ${champ.label.toLowerCase()}`"
              />
              <input
                v-else
                v-model="fillSession.answers[champ.id]"
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
      <button type="button" class="m-btn m-btn--primary" @click="onNext">Suivant</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMobileFormDemo } from '../../composables/useMobileFormDemo'
import { validateField } from '../../lib/utils/validators'

const route = useRoute()
const router = useRouter()
const { formById, startFill, fillSession } = useMobileFormDemo()

const pageError = ref('')
const fieldErrors = reactive({})

const formId = computed(() => route.params.formId as string)
const form = computed(() => formById(formId.value))

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
  const a = fillSession.value?.answers || {}
  let n = 0
  for (const s of sections.value) {
    for (const c of s.champs || []) {
      if (c.required && String(a[c.id] || '').trim()) n++
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
  const a = fillSession.value?.answers || {}
  for (const c of currentChamps.value) {
    const msg = validateField(a[c.id], c)
    if (msg) {
      fieldErrors[c.id] = msg
      ok = false
    }
  }
  return ok
}

function onNext() {
  pageError.value = ''
  if (!form.value || !fillSession.value) return
  if (!validateCurrent()) return

  if (sectionIndex.value < sections.value.length - 1) {
    sectionIndex.value += 1
    return
  }
  router.push({ name: 'MobileReportSummary', params: { formId: formId.value } })
}

function onBack() {
  if (sectionIndex.value > 0) {
    sectionIndex.value -= 1
    return
  }
  router.push({ name: 'MobileFormList' })
}

onMounted(() => {
  const f = formById(formId.value)
  if (!f) {
    pageError.value = 'Impossible de charger ce formulaire. Revenez à la liste.'
    return
  }
  if (!fillSession.value || fillSession.value.formId !== formId.value) {
    startFill(formId.value)
  }
  sectionIndex.value = 0
})

watch(formId, () => {
  sectionIndex.value = 0
  Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
  if (formById(formId.value)) {
    startFill(formId.value)
  }
})
</script>
