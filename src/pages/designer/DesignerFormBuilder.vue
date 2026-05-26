<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="goBack">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">{{ isEdit ? 'Modifier le formulaire' : 'Nouveau formulaire' }}</h1>
        <p class="m-header__subtitle">Concepteur</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="pageError" class="m-banner-error">{{ pageError }}</div>

      <div class="m-card">
        <label class="m-label" for="fb-title">Titre du formulaire</label>
        <input id="fb-title" v-model="titre" class="m-input" type="text" placeholder="Ex. Contrôle sécurité chantier" />
        <label class="m-label" for="fb-desc" style="margin-top: 14px">Description</label>
        <textarea id="fb-desc" v-model="description" class="m-textarea" rows="3" placeholder="Usage, public cible, consignes…" />
      </div>

      <div v-for="(q, idx) in questions" :key="q.id" class="m-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px">
          <div style="flex: 1; min-width: 0">
            <div class="m-field__num">Champ {{ idx + 1 }}</div>
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
          <button type="button" class="m-icon-btn" aria-label="Supprimer" @click="removeQuestion(idx)">
            <i class="fa-solid fa-trash" aria-hidden="true" />
          </button>
        </div>
      </div>

      <button type="button" class="m-btn m-btn--ghost" @click="addQuestion">Ajouter un champ</button>
    </div>

    <div class="m-footer-actions">
      <button type="button" class="m-btn m-btn--primary" :disabled="saving" @click="onSave">
        {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
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
const isEdit = computed(() => route.name === 'DesignerFormEdit')

function uid() {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function addQuestion() {
  questions.value.push({ id: uid(), label: '', type: 'text', required: false })
}

function removeQuestion(i: number) {
  questions.value.splice(i, 1)
}

function goBack() {
  router.push({ name: 'DesignerFormList' })
}

onMounted(async () => {
  const id = editFormId.value
  if (isEdit.value && id) {
    try {
      if (!isSupabaseConfigured()) { pageError.value = 'Supabase non configuré.'; return }
      const f = await SupabaseDataService.getFormById(id)
      if (!f) { pageError.value = 'Formulaire introuvable.'; return }
      titre.value = f.schema_json?.meta?.title || f.schema_json?.titre || f.nom
      description.value = f.schema_json?.description || ''
      const flat = []
      for (const sec of f.schema_json?.sections || []) {
        for (const c of sec.fields || sec.champs || []) {
          flat.push({ ...c })
        }
      }
      questions.value = flat.length ? flat : []
    } catch { pageError.value = 'Erreur de chargement.' }
  }
  if (!questions.value.length) addQuestion()
})

async function onSave() {
  if (saving.value) return
  pageError.value = ''
  if (!titre.value.trim()) { pageError.value = 'Indiquez un titre.'; return }
  if (questions.value.find(q => !String(q.label || '').trim())) { pageError.value = 'Chaque champ doit avoir un intitulé.'; return }
  if (!questions.value.length) { pageError.value = 'Ajoutez au moins un champ.'; return }
  if (!isSupabaseConfigured()) { pageError.value = 'Supabase non configuré.'; return }

  saving.value = true
  try {
    const sectionId = `sec_${uid()}`
    const schema = {
      meta: { title: titre.value.trim(), created_at: new Date().toISOString().split('T')[0] },
      description: description.value.trim(),
      sections: [{ id: sectionId, title: 'Contenu', fields: questions.value.map(q => ({ id: q.id, label: q.label.trim(), type: q.type, required: Boolean(q.required) })) }],
      templates: [] // les gabarits sont gérés dans DesignerTemplates
    }

    if (isEdit.value && editFormId.value) {
      // Conserver les gabarits existants
      const current = await SupabaseDataService.getFormById(editFormId.value)
      schema.templates = current?.schema_json?.templates || []
      await SupabaseDataService.updateForm(editFormId.value, { nom: titre.value.trim(), schema_json: schema })
    } else {
      await SupabaseDataService.createForm(titre.value.trim(), schema)
    }
    await router.push({ name: 'DesignerFormList' })
  } catch (e) {
    pageError.value = e?.message || 'Erreur lors de l\'enregistrement.'
  } finally {
    saving.value = false
  }
}
</script>
