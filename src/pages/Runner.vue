<template>
  <div class="runner-container">
    <section class="section-header">
      <h1>Remplisseur de formulaires</h1>
      <p class="lead">Charge un JSON, affiche les champs et sauvegarde l'instance</p>
    </section>

    <div v-if="globalError" class="alert alert-danger">{{ globalError }}</div>
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="!isSupabaseReady" class="alert alert-warning">
      Configurez <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> pour activer le mode connecté.
    </div>

    <div class="card mb-4">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">Sélection du formulaire</h5>
      </div>
      <div class="card-body row g-3">
        <div class="col-md-12">
          <label class="form-label">Formulaire</label>
          <select v-model="selectedFormId" class="form-select">
            <option value="">Choisir un formulaire...</option>
            <option v-for="form in forms" :key="form.id" :value="form.id">
              {{ form.nom }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="selectedForm" class="card">
      <div class="card-header bg-light">
        <h5 class="mb-0">{{ selectedForm.schema_json?.titre || selectedForm.nom }}</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitInstance">
          <div
            v-for="section in selectedForm.schema_json?.sections || []"
            :key="section.id"
            class="border rounded p-3 mb-3"
          >
            <h6 class="mb-3">{{ section.titre }}</h6>

            <div v-for="champ in section.champs || []" :key="champ.id" class="mb-3">
              <label class="form-label">{{ champ.label }}</label>

              <textarea
                v-if="champ.type === 'textarea'"
                v-model="formData[champ.id]"
                class="form-control"
                rows="3"
                :required="Boolean(champ.required)"
              />

              <input
                v-else
                v-model="formData[champ.id]"
                :type="mapInputType(champ.type)"
                class="form-control"
                :required="Boolean(champ.required)"
              />
              <small v-if="champ.required" class="text-muted">Champ obligatoire</small>
            </div>
          </div>

          <button :disabled="isSubmitting || !isSupabaseReady" class="btn btn-primary" type="submit">
            {{ isSubmitting ? 'Enregistrement...' : "Enregistrer l'instance" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import SupabaseDataService from '../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../lib/supabaseClient'

const TEMP_USER_ID =
  import.meta.env.VITE_TEMP_USER_ID || '11111111-1111-1111-1111-111111111111'

const forms = ref([])
const selectedFormId = ref('')
const formData = ref({})
const globalError = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

const isSupabaseReady = isSupabaseConfigured()

const selectedForm = computed(() =>
  forms.value.find(form => form.id === selectedFormId.value)
)

function mapInputType(type) {
  if (type === 'number') return 'number'
  if (type === 'date') return 'date'
  return 'text'
}

function resetFormData() {
  const data = {}
  const fields = selectedForm.value?.schema_json?.sections || []
  fields.forEach(section => {
    ;(section.champs || []).forEach(champ => {
      data[champ.id] = ''
    })
  })
  formData.value = data
}

async function loadForms() {
  if (!isSupabaseReady) return
  try {
    globalError.value = ''
    forms.value = await SupabaseDataService.getForms()
  } catch (error) {
    globalError.value = error.message || 'Erreur lors du chargement des formulaires.'
  }
}

async function submitInstance() {
  if (!selectedFormId.value) {
    globalError.value = 'Sélectionnez un formulaire.'
    return
  }

  const allFields = (selectedForm.value?.schema_json?.sections || []).flatMap(
    section => section.champs || []
  )
  const missingRequiredField = allFields.find(
    champ => Boolean(champ.required) && !String(formData.value[champ.id] || '').trim()
  )
  if (missingRequiredField) {
    globalError.value = `Le champ "${missingRequiredField.label}" est obligatoire.`
    return
  }

  try {
    isSubmitting.value = true
    globalError.value = ''
    successMessage.value = ''

    await SupabaseDataService.createInstance(
      selectedFormId.value,
      formData.value,
      TEMP_USER_ID
    )

    successMessage.value = 'Instance enregistrée avec succès.'
    resetFormData()
  } catch (error) {
    globalError.value = error.message || "Impossible d'enregistrer l'instance."
  } finally {
    isSubmitting.value = false
  }
}

watch(selectedFormId, () => {
  successMessage.value = ''
  resetFormData()
})

onMounted(loadForms)
</script>
