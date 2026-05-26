<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="router.push({ name: 'MobileHistory' })">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">Aperçu groupé</h1>
        <p class="m-header__subtitle">{{ instances.length }} formulaire(s) complété(s)</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="loadError" class="m-banner-error">{{ loadError }}</div>
      <div v-else-if="!instances.length" class="m-banner-error">Aucune instance à afficher.</div>

      <template v-else-if="form">
        <!-- Liste des instances -->
        <article v-for="inst in instances" :key="inst.id" class="m-card">
          <div class="m-batch-instance-header">
            <div>
              <h2 class="m-list-card__title" style="margin: 0">{{ inst.nom }}</h2>
              <time class="m-field__num" style="color: var(--m-text-muted); font-weight: 500">
                {{ formatDate(inst.created_at) }}
              </time>
            </div>
            <router-link
              class="m-btn-sm m-btn-sm--primary"
              :to="{ name: 'MobileReportDetail', params: { reportId: inst.id } }"
            >
              Voir seul
            </router-link>
          </div>

          <!-- Données de l'instance -->
          <div v-for="sec in getSections(inst)" :key="sec.id" style="margin-top: 12px">
            <div class="m-block-title" style="margin-bottom: 8px">
              <span class="m-step-badge">{{ sec.index }}</span>
              <h3 style="margin:0;font-size:0.9rem">{{ sec.titre }}</h3>
            </div>
            <div v-for="row in sec.rows" :key="row.id" style="margin-bottom: 6px; display:flex; gap:8px">
              <span style="font-weight:600;flex:0 0 40%;font-size:0.85rem;color:#555">{{ row.label }}</span>
              <span style="flex:1;font-size:0.85rem">{{ row.value }}</span>
            </div>
          </div>
        </article>
      </template>
    </div>

    <div v-if="instances.length" class="m-footer-actions">
      <button type="button" class="m-btn m-btn--primary" :disabled="isPdfExporting" @click="exportBatchPdf">
        {{ isPdfExporting ? 'Génération…' : 'Exporter en PDF' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SupabaseDataService from '../../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { buildMobileReportPdfHtml } from '../../lib/renderMobileReportPdfHtml'

const route = useRoute()
const router = useRouter()

const instances = ref([])
const form = ref(null)
const templates = ref([])
const selectedTemplateId = ref('')
const loadError = ref('')
const isPdfExporting = ref(false)

const selectedTemplate = computed(() =>
  templates.value.find(t => t.id === selectedTemplateId.value) || null
)

const getSelectedTemplateName = computed(() =>
  selectedTemplate.value?.name || 'Gabarit par défaut'
)

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function formatVal(v: unknown) {
  if (v === undefined || v === null || String(v).trim() === '') return '—'
  return String(v)
}

function getSections(inst) {
  if (!form.value) return []
  const sections = form.value.schema_json?.sections || []
  const donnees = inst.donnees_json || {}
  return sections.map((sec, idx) => ({
    id: sec.id,
    titre: sec.title || sec.titre,
    index: idx + 1,
    rows: (sec.fields || sec.champs || []).map(c => ({
      id: c.id,
      label: c.label,
      value: formatVal(donnees[c.id])
    }))
  }))
}

async function exportBatchPdf() {
  if (!instances.value.length || !form.value) {
    window.alert('Aucune donnée à exporter.')
    return
  }

  try {
    isPdfExporting.value = true
    await nextTick()

    // Générer un HTML contenant toutes les instances
    const parts = []
    for (const inst of instances.value) {
      parts.push(buildMobileReportPdfHtml(inst, form.value, selectedTemplate.value))
    }
    const bodyHtml = parts.join('<div style="page-break-after:always"></div>')

    if (!bodyHtml || bodyHtml.length < 50) {
      throw new Error('Le contenu généré est vide.')
    }

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${form.value.nom || 'Rapports'}</title>
</head>
<body>
  ${bodyHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  <\/script>
</body>
</html>`

    const win = window.open('', '_blank')
    if (!win) {
      window.alert('Veuillez autoriser les popups pour exporter le PDF.')
      return
    }
    win.document.write(fullHtml)
    win.document.close()
  } catch (e) {
    window.alert(e?.message || "Impossible d'exporter le PDF groupé.")
  } finally {
    isPdfExporting.value = false
  }
}

onMounted(async () => {
  if (!isSupabaseConfigured()) {
    loadError.value = 'Supabase n\'est pas configuré.'
    return
  }

  try {
    // Récupérer les IDs des instances depuis la query string
    const idsParam = route.query.ids as string
    if (!idsParam) {
      loadError.value = 'Aucune instance sélectionnée.'
      return
    }

    const ids = idsParam.split(',').filter(Boolean)
    if (!ids.length) {
      loadError.value = 'Aucune instance sélectionnée.'
      return
    }

    // Charger chaque instance
    const loadedInstances = []
    let formData = null
    for (const id of ids) {
      const inst = await SupabaseDataService.getInstanceById(id)
      if (inst) {
        loadedInstances.push(inst)
        if (!formData) {
          formData = await SupabaseDataService.getFormById(inst.formulaire_id)
        }
      }
    }

    instances.value = loadedInstances
    form.value = formData

    if (!formData) {
      loadError.value = 'Formulaire associé introuvable.'
      return
    }

    // Récupérer les gabarits
    templates.value = SupabaseDataService.getTemplatesFromForm(formData)

    // Pré-sélectionner le gabarit actif
    if (formData.gabarit_actif_id) {
      const actif = templates.value.find(t => t.id === formData.gabarit_actif_id)
      if (actif) selectedTemplateId.value = actif.id
    }
  } catch (e) {
    loadError.value = 'Erreur lors du chargement des instances.'
  }
})
</script>

<style scoped>
.m-hint {
  margin: 6px 0 0;
  font-size: 0.8rem;
  color: var(--m-text-muted);
}
.m-batch-instance-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 4px;
}
</style>
