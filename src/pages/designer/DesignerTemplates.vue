<template>
  <div class="m-page">
    <header class="m-header">
      <button type="button" class="m-header__back" aria-label="Retour" @click="goBack">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="m-header__titles">
        <h1 class="m-header__title">Gabarits</h1>
        <p class="m-header__subtitle">{{ form?.nom || '—' }}</p>
      </div>
    </header>

    <div class="m-body">
      <div v-if="pageError" class="m-banner-error">{{ pageError }}</div>
      <div v-if="successMsg" class="m-banner-info">{{ successMsg }}</div>

      <div v-for="(tpl, tIdx) in templates" :key="tpl._key" class="m-card">
        <!-- En-tête du gabarit -->
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <div style="flex:1;min-width:0">
            <label class="m-label">Nom du gabarit</label>
            <input v-model="tpl.name" class="m-input" type="text" placeholder="Ex. Interne, Client…" />
          </div>
          <div style="display:flex;gap:6px;margin-top:20px">
            <!-- Bouton Activer / Désactiver -->
            <button
              type="button"
              class="m-icon-btn"
              :title="gabaritActifId === tpl.id ? 'Gabarit actif' : 'Activer ce gabarit'"
              @click="toggleActif(tpl)"
            >
              <i class="fa-solid fa-toggle-on" v-if="gabaritActifId === tpl.id" style="color:#16a34a;font-size:1.2rem" />
              <i class="fa-solid fa-toggle-off" v-else style="color:#9ca3af;font-size:1.2rem" />
            </button>
            <button type="button" class="m-icon-btn" aria-label="Supprimer" @click="removeTemplate(tIdx)">
              <i class="fa-solid fa-trash" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- Badge "Actif" -->
        <div v-if="gabaritActifId === tpl.id" class="m-badge-actif">
          <i class="fa-solid fa-check-circle" /> Gabarit actif — utilisé par défaut pour l'export
        </div>

        <!-- Canvas de prévisualisation -->
        <div class="tpl-canvas" :style="canvasStyleOf(tpl)">
          <!-- En-tête -->
          <div v-if="tpl.layout?.settings?.showHeader !== false" class="tpl-canvas__header" :style="headerStyleOf(tpl)">
            <div>
              <div v-if="tpl.layout?.settings?.headerTitle" class="tpl-canvas__header-title">{{ tpl.layout.settings.headerTitle }}</div>
              <div v-if="tpl.layout?.settings?.headerSubtitle" class="tpl-canvas__header-subtitle">{{ tpl.layout.settings.headerSubtitle }}</div>
            </div>
            <div v-if="tpl.layout?.settings?.showDate" class="tpl-canvas__header-date">{{ todayStr }}</div>
          </div>

          <!-- Lignes du layout -->
          <div v-for="(row, rIdx) in tpl.layout?.rows || []" :key="row._key" class="tpl-row">
            <div class="tpl-row__toolbar">
              <span class="tpl-row__toolbar-label">Ligne {{ rIdx + 1 }}</span>
              <button type="button" class="tpl-row__btn" title="Ajouter une colonne à gauche" @click="addColumnToRow(tpl, rIdx, 0)">
                <i class="fa-solid fa-plus" /> col
              </button>
              <button type="button" class="tpl-row__btn" title="Ajouter une colonne à droite" @click="addColumnToRow(tpl, rIdx)">
                <i class="fa-solid fa-plus" /> col
              </button>
              <button type="button" class="tpl-row__btn tpl-row__btn--up" title="Monter" @click="moveRow(tpl, rIdx, -1)">
                <i class="fa-solid fa-chevron-up" />
              </button>
              <button type="button" class="tpl-row__btn tpl-row__btn--down" title="Descendre" @click="moveRow(tpl, rIdx, 1)">
                <i class="fa-solid fa-chevron-down" />
              </button>
              <button type="button" class="tpl-row__btn tpl-row__btn--del" title="Supprimer la ligne" @click="removeRow(tpl, rIdx)">
                <i class="fa-solid fa-trash" />
              </button>
            </div>

            <div class="tpl-row__cols" :style="{ gap: (tpl.layout?.settings?.colGap || 12) + 'px' }">
              <div
                v-for="(col, cIdx) in row.cols"
                :key="col._key"
                class="tpl-col"
                :style="{ flex: col.flex || 1 }"
              >
                <div class="tpl-col__header">
                  <span class="tpl-col__label">Col {{ cIdx + 1 }}</span>
                  <button type="button" class="tpl-col__btn" title="Configurer" @click="openColConfig(tpl, rIdx, cIdx)">
                    <i class="fa-solid fa-gear" />
                  </button>
                  <button type="button" class="tpl-col__btn tpl-col__btn--del" title="Retirer la colonne" @click="removeColumn(tpl, rIdx, cIdx)">
                    <i class="fa-solid fa-xmark" />
                  </button>
                </div>

                <div v-if="col.fieldId" class="tpl-col__field">
                  <div class="tpl-col__field-label">{{ getFieldLabel(col.fieldId) }}</div>
                  <div class="tpl-col__field-placeholder">{{ fieldPlaceholder(col.fieldId) }}</div>
                </div>
                <div v-else class="tpl-col__empty">
                  <select v-model="col.fieldId" class="tpl-col__select">
                    <option value="">— Choisir un champ —</option>
                    <option v-for="f in availableFields(tpl)" :key="f.id" :value="f.id">{{ f.label }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button type="button" class="tpl-canvas__add-row" @click="addRow(tpl)">
            <i class="fa-solid fa-plus" /> Ajouter une ligne
          </button>
        </div>

        <div class="tpl-toolbar">
          <button type="button" class="m-btn-sm" @click="openGlobalSettings(tpl)">
            <i class="fa-solid fa-palette" /> Style global
          </button>
          <button type="button" class="m-btn-sm" @click="autoLayout(tpl)">
            <i class="fa-solid fa-wand-magic-sparkles" /> Auto-layout
          </button>
          <button type="button" class="m-btn-sm" @click="duplicateTemplate(tIdx)">
            <i class="fa-solid fa-copy" /> Dupliquer
          </button>
          <button type="button" class="m-btn-sm m-btn-sm--primary" @click="previewTemplate(tpl)">
            <i class="fa-solid fa-eye" /> Aperçu
          </button>
        </div>
      </div>

      <button type="button" class="m-btn m-btn--ghost" @click="addTemplate">Ajouter un gabarit</button>
    </div>

    <div class="m-footer-actions" style="display:flex;gap:10px;flex-direction:column">
      <button type="button" class="m-btn m-btn--primary" :disabled="saving" @click="onSave">
        {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
      </button>
    </div>

    <!-- Modal aperçu rendu -->
    <div v-if="previewHtml" class="tpl-modal-overlay" @click.self="previewHtml = ''">
      <div class="tpl-modal tpl-modal--wide">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3 style="margin:0">Aperçu du rendu</h3>
          <button type="button" class="m-icon-btn" aria-label="Fermer" @click="previewHtml = ''">
            <i class="fa-solid fa-xmark" />
          </button>
        </div>
        <div class="tpl-preview" v-html="previewHtml"></div>
        <p v-if="previewEmpty" style="color:#999;font-style:italic;margin-top:8px">
          ⚠️ Le rendu semble vide. Ajoutez des champs au gabarit.
        </p>
        <button type="button" class="m-btn m-btn--primary" style="width:100%;margin-top:12px" @click="previewHtml = ''">
          Fermer
        </button>
      </div>
    </div>

    <!-- Modal configuration colonne -->
    <div v-if="colConfig" class="tpl-modal-overlay" @click.self="colConfig = null">
      <div class="tpl-modal">
        <h3>Configuration colonne</h3>
        <p style="margin:0 0 12px;font-size:0.9rem;color:var(--m-text-muted)">
          {{ getFieldLabel(colConfig.fieldId) || 'Aucun champ' }}
        </p>

        <label class="m-label">Poids (flex)</label>
        <select v-model.number="colConfig.flex" class="m-select" style="margin-bottom:10px">
          <option :value="1">1 — égal</option>
          <option :value="2">2 — double</option>
          <option :value="3">3 — triple</option>
        </select>

        <label class="m-label">Alignement du label</label>
        <select v-model="colConfig.labelAlign" class="m-select" style="margin-bottom:10px">
          <option value="left">Gauche</option>
          <option value="center">Centre</option>
          <option value="right">Droite</option>
        </select>

        <label class="m-label">Afficher le label</label>
        <div class="m-switch-row">
          <label class="m-switch">
            <input v-model="colConfig.showLabel" type="checkbox" />
            <span class="m-switch__ui" />
          </label>
        </div>

        <button type="button" class="m-btn m-btn--primary" style="width:100%" @click="colConfig = null">Fermer</button>
      </div>
    </div>

    <!-- Modal style global -->
    <div v-if="globalModal" class="tpl-modal-overlay" @click.self="globalModal = null">
      <div class="tpl-modal">
        <h3>Style global</h3>

        <label class="m-label">Police</label>
        <select v-model="globalModal.font" class="m-select" style="margin-bottom:10px">
          <option value="system-ui">Système</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
        </select>

        <label class="m-label">Taille des labels</label>
        <select v-model="globalModal.labelSize" class="m-select" style="margin-bottom:10px">
          <option value="10pt">10 pt</option>
          <option value="11pt">11 pt</option>
          <option value="12pt">12 pt</option>
          <option value="14pt">14 pt</option>
        </select>

        <label class="m-label">Couleur principale</label>
        <input v-model="globalModal.primaryColor" class="m-input" type="color" style="margin-bottom:10px;height:40px;padding:4px" />

        <label class="m-label">Titre d'en-tête</label>
        <input v-model="globalModal.headerTitle" class="m-input" type="text" placeholder="Ex. Job Application" style="margin-bottom:10px" />

        <label class="m-label">Sous-titre d'en-tête</label>
        <input v-model="globalModal.headerSubtitle" class="m-input" type="text" placeholder="Ex. Please fill out the form below" style="margin-bottom:10px" />

        <label class="m-label">Afficher la date</label>
        <div class="m-switch-row">
          <label class="m-switch">
            <input v-model="globalModal.showDate" type="checkbox" />
            <span class="m-switch__ui" />
          </label>
        </div>

        <label class="m-label">Espacement entre colonnes (px)</label>
        <input v-model.number="globalModal.colGap" class="m-input" type="number" min="0" max="40" style="margin-bottom:10px" />

        <label class="m-label">Espacement entre lignes (px)</label>
        <input v-model.number="globalModal.rowGap" class="m-input" type="number" min="0" max="40" style="margin-bottom:10px" />

        <label class="m-label">Orientation PDF</label>
        <select v-model="globalModal.orientation" class="m-select" style="margin-bottom:10px">
          <option value="portrait">Portrait</option>
          <option value="landscape">Paysage</option>
        </select>

        <label class="m-label">Marges PDF (mm)</label>
        <input v-model.number="globalModal.marginMm" class="m-input" type="number" min="5" max="30" style="margin-bottom:10px" />

        <button type="button" class="m-btn m-btn--primary" style="width:100%" @click="globalModal = null">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SupabaseDataService from '../../lib/services/SupabaseDataService'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { buildMobileReportPdfHtml } from '../../lib/renderMobileReportPdfHtml'

const route = useRoute()
const router = useRouter()

const form = ref(null)
const templates = ref([])
const gabaritActifId = ref('')
const pageError = ref('')
const successMsg = ref('')
const saving = ref(false)
const colConfig = ref(null)
const globalModal = ref(null)
const previewHtml = ref('')
const previewEmpty = ref(false)

const formId = computed(() => route.params.formId as string)
const todayStr = new Date().toLocaleDateString('fr-FR')

// ─── Champs du formulaire ──────────────────────────────────────

const allFields = computed(() => {
  const fields = []
  for (const sec of form.value?.schema_json?.sections || []) {
    for (const f of sec.fields || sec.champs || []) {
      fields.push(f)
    }
  }
  return fields
})

function getFieldLabel(fieldId) {
  const f = allFields.value.find(x => x.id === fieldId)
  return f?.label || fieldId
}

function fieldPlaceholder(fieldId) {
  const f = allFields.value.find(x => x.id === fieldId)
  if (!f) return '—'
  if (f.type === 'date') return 'JJ/MM/AAAA'
  if (f.type === 'number') return '0'
  if (f.type === 'textarea') return 'Zone de texte…'
  return 'Texte…'
}

function availableFields(tpl) {
  const usedIds = new Set()
  for (const row of tpl.layout?.rows || []) {
    for (const col of row.cols || []) {
      if (col.fieldId) usedIds.add(col.fieldId)
    }
  }
  return allFields.value.filter(f => !usedIds.has(f.id))
}

// ─── Style du canvas ───────────────────────────────────────────

function canvasStyleOf(tpl) {
  const s = tpl.layout?.settings
  return {
    fontFamily: s?.font || 'system-ui',
    fontSize: s?.labelSize || '11pt',
    '--primary': s?.primaryColor || '#2563eb',
    '--row-gap': (s?.rowGap || 16) + 'px'
  }
}

function headerStyleOf(tpl) {
  const c = tpl.layout?.settings?.primaryColor || '#2563eb'
  return { borderBottom: `2px solid ${c}`, color: c, marginBottom: '16px' }
}

// ─── Gestion des gabarits ─────────────────────────────────────

function uid() {
  return `_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function defaultSettings() {
  return {
    font: 'system-ui',
    labelSize: '11pt',
    primaryColor: '#2563eb',
    headerTitle: '',
    headerSubtitle: '',
    showDate: true,
    showHeader: true,
    colGap: 12,
    rowGap: 16,
    orientation: 'portrait',
    marginMm: 12
  }
}

function addTemplate() {
  templates.value.push({
    _key: uid(),
    id: `tpl_${Date.now().toString(36)}`,
    name: '',
    layout: { rows: [], settings: defaultSettings() }
  })
}

function removeTemplate(i) {
  const tpl = templates.value[i]
  if (gabaritActifId.value === tpl.id) gabaritActifId.value = ''
  templates.value.splice(i, 1)
}

function duplicateTemplate(i) {
  const src = templates.value[i]
  const copy = JSON.parse(JSON.stringify(src))
  copy._key = uid()
  copy.id = `tpl_${Date.now().toString(36)}`
  copy.name = src.name + ' (copie)'
  templates.value.splice(i + 1, 0, copy)
}

// ─── Gabarit actif ────────────────────────────────────────────

async function toggleActif(tpl) {
  if (gabaritActifId.value === tpl.id) {
    // Désactiver
    gabaritActifId.value = ''
    successMsg.value = 'Gabarit désactivé — le gabarit par défaut sera utilisé.'
  } else {
    // Activer
    gabaritActifId.value = tpl.id
    successMsg.value = `✅ Gabarit « ${tpl.name} » activé.`
  }
  setTimeout(() => { successMsg.value = '' }, 3000)
}

// ─── Gestion des lignes ───────────────────────────────────────

function addRow(tpl) {
  if (!tpl.layout) tpl.layout = { rows: [], settings: defaultSettings() }
  tpl.layout.rows.push({
    _key: uid(),
    cols: [{ _key: uid(), fieldId: '', flex: 1, showLabel: true, labelAlign: 'left' }]
  })
}

function removeRow(tpl, rIdx) {
  tpl.layout.rows.splice(rIdx, 1)
}

function moveRow(tpl, rIdx, dir) {
  const newIdx = rIdx + dir
  if (newIdx < 0 || newIdx >= tpl.layout.rows.length) return
  const row = tpl.layout.rows.splice(rIdx, 1)[0]
  tpl.layout.rows.splice(newIdx, 0, row)
}

// ─── Gestion des colonnes ─────────────────────────────────────

function addColumnToRow(tpl, rIdx, at = null) {
  const row = tpl.layout.rows[rIdx]
  const col = { _key: uid(), fieldId: '', flex: 1, showLabel: true, labelAlign: 'left' }
  if (at !== null) {
    row.cols.splice(at, 0, col)
  } else {
    row.cols.push(col)
  }
}

function removeColumn(tpl, rIdx, cIdx) {
  tpl.layout.rows[rIdx].cols.splice(cIdx, 1)
}

function openColConfig(tpl, rIdx, cIdx) {
  const col = tpl.layout.rows[rIdx].cols[cIdx]
  colConfig.value = { ...col, _tplKey: tpl._key, _rIdx: rIdx, _cIdx: cIdx }
}

// ─── Auto-layout ──────────────────────────────────────────────

function autoLayout(tpl) {
  if (!tpl.layout) tpl.layout = { rows: [], settings: defaultSettings() }
  tpl.layout.rows = []
  for (const f of allFields.value) {
    tpl.layout.rows.push({
      _key: uid(),
      cols: [{ _key: uid(), fieldId: f.id, flex: 1, showLabel: true, labelAlign: 'left' }]
    })
  }
}

// ─── Aperçu du rendu ──────────────────────────────────────────

function previewTemplate(tpl) {
  if (!form.value) {
    previewHtml.value = '<p style="color:#999;">Formulaire non chargé.</p>'
    previewEmpty.value = true
    return
  }

  const fakeInstance = {
    nom: 'Aperçu — données de test',
    created_at: new Date().toISOString(),
    donnees_json: {}
  }

  for (const sec of form.value.schema_json?.sections || []) {
    for (const f of sec.fields || sec.champs || []) {
      if (f.type === 'date') fakeInstance.donnees_json[f.id] = '15/05/2026'
      else if (f.type === 'number') fakeInstance.donnees_json[f.id] = '42'
      else if (f.type === 'textarea') fakeInstance.donnees_json[f.id] = 'Texte de test sur plusieurs lignes…'
      else fakeInstance.donnees_json[f.id] = 'Valeur de test'
    }
  }

  const gabaritObj = { layout: tpl.layout }
  const html = buildMobileReportPdfHtml(fakeInstance, form.value, gabaritObj)
  previewHtml.value = html
  previewEmpty.value = !html || html.includes('Aucune donnée') || html.includes('Instance vide')
}

// ─── Navigation ───────────────────────────────────────────────

function goBack() {
  router.push({ name: 'DesignerFormList' })
}

function openGlobalSettings(tpl) {
  if (!tpl.layout) tpl.layout = { rows: [], settings: defaultSettings() }
  globalModal.value = tpl.layout.settings
}

// ─── Cycle de vie ─────────────────────────────────────────────

onMounted(async () => {
  if (!isSupabaseConfigured()) { pageError.value = 'Supabase non configuré.'; return }
  try {
    const f = await SupabaseDataService.getFormById(formId.value)
    if (!f) { pageError.value = 'Formulaire introuvable.'; return }
    form.value = f

    // Récupérer le gabarit actif depuis la colonne gabarit_actif_id
    gabaritActifId.value = f.gabarit_actif_id || ''

    // Récupérer les gabarits depuis schema_json.templates
    const stored = f.schema_json?.templates || []
    templates.value = stored.map(t => ({
      _key: uid(),
      id: t.id || uid(),
      name: t.name || '',
      layout: t.layout || { rows: [], settings: defaultSettings() }
    }))
    if (!templates.value.length) addTemplate()
  } catch {
    pageError.value = 'Erreur de chargement.'
  }
})

async function onSave() {
  if (saving.value) return
  saving.value = true
  successMsg.value = ''
  pageError.value = ''
  try {
    const schema = { ...form.value.schema_json }
    schema.templates = templates.value
      .filter(t => t.name.trim())
      .map(t => ({
        id: t.id,
        name: t.name.trim(),
        layout: {
          rows: (t.layout?.rows || []).map(r => ({
            cols: (r.cols || []).map(c => ({
              fieldId: c.fieldId,
              flex: c.flex || 1,
              showLabel: c.showLabel !== false,
              labelAlign: c.labelAlign || 'left'
            }))
          })),
          settings: t.layout?.settings || defaultSettings()
        }
      }))

    // Enregistrer les gabarits dans schema_json ET le gabarit actif
    await SupabaseDataService.updateForm(formId.value, {
      schema_json: schema,
      gabarit_actif_id: gabaritActifId.value || null
    })
    successMsg.value = '✅ Gabarits enregistrés.'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (e) {
    pageError.value = e?.message || 'Erreur lors de l\'enregistrement.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* ─── Badge actif ────────────────────────────────────────── */
.m-badge-actif {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 4px 10px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* ─── Canvas ─────────────────────────────────────────────── */
.tpl-canvas {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
  min-height: 200px;
  background: #fff;
}
.tpl-canvas__header {
  padding-bottom: 10px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.tpl-canvas__header-title {
  font-size: 16pt;
  font-weight: 700;
}
.tpl-canvas__header-subtitle {
  font-size: 10pt;
  opacity: 0.7;
  margin-top: 2px;
}
.tpl-canvas__header-date {
  font-size: 9pt;
  opacity: 0.6;
}
.tpl-canvas__add-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  border: 1px dashed #bbb;
  border-radius: 8px;
  background: #fafafa;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
}
.tpl-canvas__add-row:hover {
  background: #f0f4ff;
  border-color: var(--m-primary, #2563eb);
  color: var(--m-primary, #2563eb);
}

/* ─── Lignes ─────────────────────────────────────────────── */
.tpl-row {
  margin-bottom: var(--row-gap, 16px);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  background: #fafbfc;
  transition: border-color 0.15s;
}
.tpl-row:hover {
  border-color: #c4b5fd;
}
.tpl-row__toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}
.tpl-row__toolbar-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  margin-right: auto;
}
.tpl-row__btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.7rem;
  color: #666;
  cursor: pointer;
  transition: all 0.12s;
}
.tpl-row__btn:hover { background: #eef2ff; border-color: #818cf8; color: #4f46e5; }
.tpl-row__btn--up:hover { background: #ecfdf5; border-color: #6ee7b7; color: #059669; }
.tpl-row__btn--down:hover { background: #ecfdf5; border-color: #6ee7b7; color: #059669; }
.tpl-row__btn--del:hover { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }

/* ─── Colonnes ───────────────────────────────────────────── */
.tpl-row__cols {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow: hidden;
  max-width: 100%;
}
.tpl-col {
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  padding: 8px;
  background: #fff;
  min-height: 60px;
  min-width: 120px;
  max-width: 100%;
  transition: border-color 0.15s;
  overflow: hidden;
}
.tpl-col:hover {
  border-color: #93c5fd;
}
.tpl-col__header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid #f3f4f6;
}
.tpl-col__label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #9ca3af;
  margin-right: auto;
}
.tpl-col__btn {
  background: none;
  border: none;
  padding: 2px 4px;
  font-size: 0.75rem;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 3px;
}
.tpl-col__btn:hover { background: #f3f4f6; color: #4b5563; }
.tpl-col__btn--del:hover { background: #fef2f2; color: #dc2626; }

.tpl-col__field-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #333;
  margin-bottom: 2px;
}
.tpl-col__field-placeholder {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.8rem;
  color: #999;
  min-height: 24px;
}
.tpl-col__empty {
  min-height: 40px;
}
.tpl-col__select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.8rem;
  background: #fff;
  color: #333;
}

/* ─── Toolbar ────────────────────────────────────────────── */
.tpl-toolbar {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
}

/* ─── Modal ──────────────────────────────────────────────── */
.tpl-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.tpl-modal {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}
.tpl-modal--wide {
  max-width: 600px;
}
.tpl-preview {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  min-height: 100px;
  max-height: 60vh;
  overflow-y: auto;
  font-size: 0.85rem;
}
</style>
