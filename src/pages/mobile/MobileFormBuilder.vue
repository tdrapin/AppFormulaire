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

      <!-- Infos générales -->
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

      <!-- Champs du formulaire -->
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
          <button type="button" class="m-icon-btn" aria-label="Supprimer le champ" @click="removeQuestion(idx)">
            <i class="fa-solid fa-trash" aria-hidden="true" />
          </button>
        </div>
      </div>

      <button type="button" class="m-btn m-btn--ghost" @click="addQuestion">Ajouter un champ</button>

      <!-- Gabarits -->
      <div class="m-card" style="margin-top: 16px">
        <h3 style="margin: 0 0 12px">Gabarits d'export</h3>
        <p style="font-size: 0.85rem; color: var(--m-text-muted); margin-bottom: 12px">
          Les gabarits sont des templates Mustache pour l'export PDF.
        </p>

        <div v-for="(tpl, idx) in templates" :key="tpl._key" class="m-template-card">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px">
            <div style="flex: 1; min-width: 0">
              <label class="m-label">Nom du gabarit</label>
              <input v-model="tpl.name" class="m-input" type="text" placeholder="Ex. Interne, Client…" />
            </div>
            <button type="button" class="m-icon-btn" style="margin-top: 20px" aria-label="Supprimer le gabarit" @click="removeTemplate(idx)">
              <i class="fa-solid fa-trash" aria-hidden="true" />
            </button>
          </div>
          <label class="m-label" style="margin-top: 10px">HTML (Mustache)</label>
          <textarea v-model="tpl.html" class="m-textarea m-textarea--code" rows="6" placeholder="<h1>{{_nom}}</h1>" />
          <label class="m-label" style="margin-top: 10px">CSS (optionnel)</label>
          <textarea v-model="tpl.css" class="m-textarea m-textarea--code" rows="3" placeholder="body { font-family: sans-serif; }" />
        </div>

        <button type="button" class="m-btn m-btn--ghost" style="margin-top: 8px" @click="addTemplate">
          Ajouter un gabarit
        </button>
      </div>
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
const templates = ref([])
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

function addTemplate() {
  templates.value.push({
    _key: uid(),
    id: `tpl_${Date.now().toString(36)}`,
    name: '',
    html: '',
    css: ''
  })
}

function removeTemplate(i: number) {
  templates.value.splice(i, 1)
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
      titre.value = f.schema_json?.meta?.title || f.schema_json?.titre || f.nom
      description.value = f.schema_json?.description || ''
      const flat = []
      for (const sec of f.schema_json?.sections || []) {
        for (const c of sec.fields || sec.champs || []) {
          flat.push({ ...c })
        }
      }
      questions.value = flat.length ? flat : []

      // Charger les gabarits depuis schema_json.templates
      const storedTemplates = f.schema_json?.templates || []
      templates.value = storedTemplates.map(t => ({
        _key: uid(),
        id: t.id || uid(),
        name: t.name || '',
        html: t.html || '',
        css: t.css || ''
      }))
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
    pageError.value = 'Chaque champ doit avoir un intitulé.'
    return
  }
  if (!questions.value.length) {
    pageError.value = 'Ajoutez au moins un champ.'
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
      meta: {
        title: titre.value.trim(),
        version: isEdit.value ? undefined : 1,
        created_at: new Date().toISOString().split('T')[0]
      },
      description: description.value.trim(),
      sections: [
        {
          id: sectionId,
          title: 'Contenu',
          fields: questions.value.map(q => ({
            id: q.id,
            label: q.label.trim(),
            type: q.type,
            required: Boolean(q.required)
          }))
        }
      ],
      templates: templates.value
        .filter(t => t.name.trim() && t.html.trim())
        .map(t => ({
          id: t.id,
          name: t.name.trim(),
          html: t.html,
          css: t.css || ''
        }))
    }

    if (isEdit.value && editFormId.value) {
      await SupabaseDataService.updateForm(editFormId.value, {
        nom: titre.value.trim(),
        schema_json: schema
      })
    } else {
      await SupabaseDataService.createForm(titre.value.trim(), schema)
    }

    await router.push({ name: 'MobileFormList' })
  } catch (e) {
    pageError.value = e?.message || 'Erreur lors de l\'enregistrement.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.m-template-card {
  background: var(--bg-muted, #f8f8f8);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
}
.m-textarea--code {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}
</style>
