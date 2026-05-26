<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="router.push({ name: 'MobileHistory' })">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">Détail du rapport</h1>
        <p class="m-header__subtitle">{{ instance?.nom || '—' }}</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="loadError" class="m-banner-error">{{ loadError }}</div>
      <div v-else-if="!instance" class="m-banner-error">Rapport introuvable.</div>

      <template v-else-if="form">
        <!-- Infos du rapport -->
        <div class="m-card m-card--muted">
          <p style="margin: 0 0 6px; font-size: 0.85rem; color: var(--m-text-muted)">Nom</p>
          <p style="margin: 0; font-weight: 600">{{ instance.nom }}</p>
          <p style="margin: 10px 0 0; font-size: 0.85rem; color: var(--m-text-muted)">Date</p>
          <p style="margin: 0">{{ formatDate(instance.created_at) }}</p>
          <p style="margin: 10px 0 0; font-size: 0.85rem; color: var(--m-text-muted)">Formulaire</p>
          <p style="margin: 0; font-weight: 500">{{ form.nom }}</p>
        </div>

        <!-- Données du rapport -->
        <section v-for="sec in labelSections" :key="sec.id" class="m-card">
          <div class="m-block-title">
            <span class="m-step-badge">{{ sec.index }}</span>
            <h2>{{ sec.titre }}</h2>
          </div>
          <div v-for="row in sec.rows" :key="row.id" style="margin-bottom: 12px">
            <div class="m-field__num">{{ row.label }}</div>
            <p style="margin: 4px 0 0">{{ row.value }}</p>
          </div>
        </section>
      </template>
    </div>

    <div v-if="instance" class="m-footer-actions m-footer-actions--split">
      <button type="button" class="m-btn m-btn--primary" :disabled="isPdfExporting" @click="exportReportPdf">
        {{ isPdfExporting ? 'Génération…' : 'Exporter en PDF' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SupabaseDataService from '../../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { buildMobileReportPdfHtml } from '../../lib/renderMobileReportPdfHtml'

const route = useRoute()
const router = useRouter()

const instance = ref(null)
const form = ref(null)
const templates = ref([])
const selectedTemplateId = ref('')
const loadError = ref('')
const isPdfExporting = ref(false)

const reportId = computed(() => route.params.reportId as string)

const selectedTemplate = computed(() =>
  templates.value.find(t => t.id === selectedTemplateId.value) || null
)

const getSelectedTemplateName = computed(() =>
  selectedTemplate.value?.name || 'Gabarit par défaut'
)

const labelSections = computed(() => {
  const inst = instance.value
  const f = form.value
  if (!inst || !f) return []
  const sections = f.schema_json?.sections || []
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
})

function formatVal(v: unknown) {
  if (v === undefined || v === null || String(v).trim() === '') return '—'
  return String(v)
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })
  } catch {
    return iso
  }
}

/**
 * Export PDF simple et fiable :
 * 1. Génère le HTML complet
 * 2. Ouvre une nouvelle fenêtre avec ce HTML
 * 3. Déclenche l'impression (l'utilisateur peut choisir "Enregistrer en PDF")
 */
async function exportReportPdf() {
  if (!instance.value || !form.value) {
    window.alert('Aucune donnée à exporter.')
    return
  }

  try {
    isPdfExporting.value = true
    await nextTick()

    // 1. Générer le HTML
    const html = buildMobileReportPdfHtml(instance.value, form.value, selectedTemplate.value)

    if (!html || html.length < 50) {
      throw new Error('Le contenu généré est vide.')
    }

    // 2. Créer une page HTML complète avec le style
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${instance.value.nom || 'Rapport'}</title>
</head>
<body>
  ${html}
  <script>
    // Déclencher l'impression automatiquement au chargement
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  <\/script>
</body>
</html>`

    // 3. Ouvrir dans un nouvel onglet
    const win = window.open('', '_blank')
    if (!win) {
      // Bloqueur de popup détecté
      window.alert('Veuillez autoriser les popups pour exporter le PDF.')
      return
    }
    win.document.write(fullHtml)
    win.document.close()
  } catch (e) {
    window.alert(e?.message || "Impossible d'exporter le PDF.")
  } finally {
    isPdfExporting.value = false
  }
}

watch(selectedTemplateId, () => {
  // Rien de particulier, le template est utilisé au moment de l'export
})

onMounted(async () => {
  if (!isSupabaseConfigured()) {
    loadError.value = 'Supabase n\'est pas configuré.'
    return
  }
  try {
    const inst = await SupabaseDataService.getInstanceById(reportId.value)
    if (!inst) {
      loadError.value = 'Rapport introuvable.'
      return
    }
    instance.value = inst

    const f = await SupabaseDataService.getFormById(inst.formulaire_id)
    if (!f) {
      loadError.value = 'Formulaire associé introuvable.'
      return
    }
    form.value = f

    // Récupérer les gabarits depuis schema_json.templates du formulaire
    templates.value = SupabaseDataService.getTemplatesFromForm(f)

    // Pré-sélectionner le gabarit actif du formulaire
    if (f.gabarit_actif_id) {
      const actif = templates.value.find(t => t.id === f.gabarit_actif_id)
      if (actif) selectedTemplateId.value = actif.id
    }
  } catch (e) {
    loadError.value = 'Erreur lors du chargement du rapport.'
  }
})
</script>

<style scoped>
.m-footer-actions--split {
  justify-content: stretch;
}
.m-hint {
  margin: 6px 0 0;
  font-size: 0.8rem;
  color: var(--m-text-muted);
}
</style>
