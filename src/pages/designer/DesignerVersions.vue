<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="goBack">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">Informations</h1>
        <p class="m-header__subtitle">{{ form?.nom || '—' }}</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="pageError" class="m-banner-error">{{ pageError }}</div>
      <div v-if="loading" class="m-empty">
        <div class="m-spinner" aria-label="Chargement…" />
        <span>Chargement…</span>
      </div>

      <template v-else-if="form">
        <div class="m-card">
          <h3 style="margin: 0 0 8px">Informations</h3>
          <p style="font-size: 0.9rem; margin: 4px 0">
            <strong>Créé le :</strong> {{ form.created_at ? new Date(form.created_at).toLocaleDateString('fr-FR') : '—' }}
          </p>
          <p style="font-size: 0.9rem; margin: 4px 0">
            <strong>Gabarits :</strong> {{ form.schema_json?.templates?.length || 0 }}
          </p>
          <p style="font-size: 0.9rem; margin: 4px 0">
            <strong>Sections :</strong> {{ form.schema_json?.sections?.length || 0 }}
          </p>
        </div>

        <div class="m-card">
          <h3 style="margin: 0 0 8px">Questions</h3>
          <div v-for="(sec, si) in form.schema_json?.sections || []" :key="sec.id">
            <p style="font-weight: 600; margin: 8px 0 4px">Section {{ si + 1 }} : {{ sec.titre }}</p>
            <div v-for="(f, fi) in sec.fields || sec.champs || []" :key="f.id" style="padding: 4px 0 4px 12px; font-size: 0.9rem">
              <i class="fa-solid fa-circle" style="font-size: 0.4rem; vertical-align: middle; margin-right: 6px; color: var(--m-primary)" />
              {{ f.label }} <span style="color: var(--m-text-muted)">({{ f.type }}{{ f.required ? ', obligatoire' : '' }})</span>
            </div>
          </div>
        </div>
      </template>
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
const pageError = ref('')
const loading = ref(true)

const formId = computed(() => route.params.formId as string)

function goBack() {
  router.push({ name: 'DesignerFormList' })
}

onMounted(async () => {
  if (!isSupabaseConfigured()) { pageError.value = 'Supabase non configuré.'; loading.value = false; return }
  try {
    const f = await SupabaseDataService.getFormById(formId.value)
    if (!f) { pageError.value = 'Formulaire introuvable.'; return }
    form.value = f
  } catch { pageError.value = 'Erreur de chargement.' }
  finally { loading.value = false }
})
</script>
