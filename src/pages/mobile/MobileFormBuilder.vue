<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="goBack">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">{{ isEdit ? 'Modifier le formulaire' : 'Nouveau formulaire' }}</h1>
        <p class="m-header__subtitle">Mode création</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="pageError" class="m-banner-error">{{ pageError }}</div>

      <div class="m-card">
        <label class="m-label" for="fb-title">Titre du formulaire</label>
        <input id="fb-title" v-model="titre" class="m-input" type="text" placeholder="Ex. Contrôle sécurité chantier" />
        <label class="m-label" for="fb-desc" style="margin-top: 14px">Description</label>
        <textarea
          id="fb-desc"
          v-model="description"
          class="m-textarea"
          rows="3"
          placeholder="Usage, public cible, consignes…"
        />
      </div>

      <div v-for="(q, idx) in questions" :key="q.id" class="m-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
          <div style="flex: 1; min-width: 0">
            <div class="m-question__num">Question {{ idx + 1 }}</div>
            <label class="m-label" :for="`ql-${q.id}`">Intitulé</label>
            <input :id="`ql-${q.id}`" v-model="q.label" class="m-input" type="text" placeholder="Libellé affiché" />
            <label class="m-label" :for="`qt-${q.id}`" style="margin-top: 12px">Type de champ</label>
            <select :id="`qt-${q.id}`" v-model="q.type" class="m-select">
              <option value="text">Texte court</option>
              <option value="date">Date</option>
              <option value="number">Nombre</option>
              <option value="textarea">Zone de texte</option>
            </select>
            <div class="m-switch-row">
              <span style="font-size: 0.9rem; font-weight: 500">Champ obligatoire</span>
              <label class="m-switch">
                <input v-model="q.required" type="checkbox" />
                <span class="m-switch__ui" />
              </label>
            </div>
          </div>
          <button type="button" class="m-icon-btn" aria-label="Supprimer la question" @click="removeQuestion(idx)">
            <i class="fa-solid fa-trash" aria-hidden="true" />
          </button>
        </div>
      </div>

      <button type="button" class="m-btn m-btn--ghost" @click="addQuestion">Ajouter une question</button>
    </div>

    <div class="m-footer-actions">
      <button type="button" class="m-btn m-btn--primary" :disabled="saving" @click="onContinue">
        {{ saving ? 'Enregistrement…' : 'Continuer' }}
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

const titre = ref('')
const description = ref('')
const questions = ref([])
const pageError = ref('')
const saving = ref(false)

const editFormId = computed(() => (route.params.formId as string) || '')
const isEdit = computed(() => route.name === 'MobileFormEdit')

function uid() {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function addQuestion() {
  questions.value.push({
    id: uid(),
    label: '',
    type: 'text',
    required: false
  })
}

function removeQuestion(i: number) {
  questions.value.splice(i, 1)
}

function goBack() {
  router.push({ name: 'MobileFormList' })
}

onMounted(async () => {
  const id = editFormId.value
  if (isEdit.value && id) {
    try {
      if (!isSupabaseConfigured()) {
        pageError.value = 'Supabase n\'est pas configuré.'
        return
      }
      const f = await SupabaseDataService.getFormById(id)
      if (!f) {
        pageError.value = 'Formulaire introuvable.'
        return
      }
      titre.value = f.schema_json?.titre || f.nom
      description.value = f.schema_json?.description || ''
      const flat = []
      for (const sec of f.schema_json?.sections || []) {
        for (const c of sec.champs || []) {
          flat.push({ ...c })
        }
      }
      questions.value = flat.length ? flat : []
    } catch (e) {
      pageError.value = 'Erreur lors du chargement du formulaire.'
    }
  }
  if (!questions.value.length) addQuestion()
})

async function onContinue() {
  if (saving.value) return

  pageError.value = ''
  if (!titre.value.trim()) {
    pageError.value = 'Indiquez un titre pour le formulaire.'
    return
  }
  const missingLabel = questions.value.find(q => !String(q.label || '').trim())
  if (missingLabel) {
    pageError.value = 'Chaque question doit avoir un intitulé.'
    return
  }
  if (!questions.value.length) {
    pageError.value = 'Ajoutez au moins une question.'
    return
  }

  if (!isSupabaseConfigured()) {
    pageError.value = 'Supabase n\'est pas configuré. Vérifiez vos variables d\'environnement.'
    return
  }

  saving.value = true
  try {
    const sectionId = `sec_${uid()}`
    const schema = {
      titre: titre.value.trim(),
      sousTitre: '',
      description: description.value.trim(),
      sections: [
        {
          id: sectionId,
          titre: 'Contenu',
          champs: questions.value.map(q => ({
            id: q.id,
            label: q.label.trim(),
            type: q.type,
            required: Boolean(q.required)
          }))
        }
      ]
    }

    if (isEdit.value && editFormId.value) {
      await SupabaseDataService.updateForm(editFormId.value, {
        nom: schema.titre,
        schema_json: schema
      })
    } else {
      await SupabaseDataService.createForm(schema.titre, schema)
    }

    await router.push({ name: 'MobileFormList' })
  } catch (e) {
    pageError.value = e?.message || 'Erreur lors de l\'enregistrement.'
  } finally {
    saving.value = false
  }
}
</script>
