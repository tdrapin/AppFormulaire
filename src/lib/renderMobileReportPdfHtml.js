import { escapeHtml } from './buildDefaultExportTemplate'
import Mustache from 'mustache'

/**
 * Formate une date ISO en français.
 */
function formatDateFr(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })
  } catch {
    return String(iso ?? '')
  }
}

/**
 * Récupère la valeur d'un champ depuis les données de l'instance.
 */
function getFieldValue(donnees, fieldId) {
  const val = donnees[fieldId]
  return val === undefined || val === null || String(val).trim() === '' ? '—' : String(val)
}

/**
 * Récupère le libellé d'un champ depuis les sections du formulaire.
 */
function getFieldLabel(sections, fieldId) {
  for (const sec of sections) {
    for (const c of sec.fields || sec.champs || []) {
      if (c.id === fieldId) return c.label
    }
  }
  return fieldId
}

/**
 * Construit le style CSS global pour le PDF.
 */
function buildGlobalStyle(settings = {}) {
  const font = settings.font || 'system-ui'
  const labelSize = settings.labelSize || '11pt'
  const primaryColor = settings.primaryColor || '#2563eb'
  const colGap = settings.colGap || 12
  const rowGap = settings.rowGap || 16
  const marginMm = settings.marginMm || 12

  return `
    @page { margin: ${marginMm}mm; }
    * { box-sizing: border-box; }
    body {
      font-family: ${font}, -apple-system, sans-serif;
      font-size: ${labelSize};
      color: #111;
      line-height: 1.5;
      margin: 0;
      padding: 0;
    }
    .page { max-width: 100%; padding: 0; }
    .header {
      border-bottom: 2px solid ${primaryColor};
      padding-bottom: 10px;
      margin-bottom: ${rowGap}px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-title { font-size: 16pt; font-weight: 700; color: ${primaryColor}; margin: 0; }
    .header-subtitle { font-size: 10pt; opacity: 0.7; margin: 2px 0 0; }
    .header-date { font-size: 9pt; opacity: 0.6; }
    .row { display: flex; gap: ${colGap}px; margin-bottom: ${rowGap}px; }
    .col { flex: 1; min-width: 0; }
    .field-label { font-weight: 600; font-size: ${labelSize}; margin-bottom: 2px; color: #333; }
    .field-value {
      border-bottom: 1px solid #ccc;
      padding: 4px 0 2px;
      min-height: 20px;
      color: #111;
    }
    .field-value--empty { color: #999; }
    .section-title {
      font-size: 13pt;
      font-weight: 700;
      color: ${primaryColor};
      margin: ${rowGap}px 0 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #ddd;
    }
  `
}

/**
 * Génère le HTML du gabarit par défaut (fallback).
 * Affiche toujours quelque chose, même sans sections.
 */
function buildDefaultHtml(instance, form, settings = {}) {
  const donnees = instance.donnees_json || {}
  const sections = form?.schema_json?.sections || []
  const nom = instance.nom || 'Rapport'
  const date = formatDateFr(instance.created_at)
  const metaTitle = form?.schema_json?.meta?.title || form?.nom || 'Formulaire'
  const rowGap = settings.rowGap || 16
  const primaryColor = settings.primaryColor || '#2563eb'

  const parts = []

  // En-tête
  parts.push('<div class="header">')
  parts.push('<div>')
  parts.push(`<div class="header-title">${escapeHtml(metaTitle)}</div>`)
  parts.push(`<div class="header-subtitle">${escapeHtml(nom)}</div>`)
  parts.push('</div>')
  parts.push(`<div class="header-date">${escapeHtml(date)}</div>`)
  parts.push('</div>')

  // Compter les champs
  let totalFields = 0
  for (const sec of sections) {
    totalFields += (sec.fields || sec.champs || []).length
  }

  if (totalFields === 0) {
    // Aucun champ défini dans le formulaire
    parts.push(`<p style="color:#999;font-style:italic;margin-top:${rowGap}px;">Aucune donnée à afficher.</p>`)
    parts.push(`<p style="color:#666;font-size:0.9rem;">Instance : ${escapeHtml(nom)}</p>`)
    parts.push(`<p style="color:#666;font-size:0.9rem;">Date : ${escapeHtml(date)}</p>`)
    // Afficher toutes les clés disponibles dans donnees_json
    const keys = Object.keys(donnees)
    if (keys.length) {
      parts.push(`<h2 class="section-title">Données brutes</h2>`)
      for (const key of keys) {
        const val = getFieldValue(donnees, key)
        parts.push(
          `<div class="row" style="margin-bottom:6px;">` +
            `<div class="col" style="flex:0 0 40%"><div class="field-label">${escapeHtml(key)}</div></div>` +
            `<div class="col"><div class="field-value">${escapeHtml(val)}</div></div>` +
          `</div>`
        )
      }
    }
  } else {
    // Afficher les sections avec leurs champs
    for (const sec of sections) {
      const secTitle = sec.title || sec.titre || ''
      const fields = sec.fields || sec.champs || []
      if (!fields.length) continue

      parts.push(`<h2 class="section-title">${escapeHtml(secTitle)}</h2>`)

      for (const c of fields) {
        const val = getFieldValue(donnees, c.id)
        parts.push(
          `<div class="row" style="margin-bottom:6px;">` +
            `<div class="col" style="flex:0 0 40%"><div class="field-label">${escapeHtml(c.label)}</div></div>` +
            `<div class="col"><div class="field-value${val === '—' ? ' field-value--empty' : ''}">${escapeHtml(val)}</div></div>` +
          `</div>`
        )
      }
    }
  }

  return parts.join('')
}

/**
 * Génère le HTML pour l'export PDF d'une instance.
 * Supporte le nouveau format layout (lignes + colonnes), l'ancien format Mustache,
 * et un fallback par défaut qui affiche TOUJOURS quelque chose.
 *
 * @param {object} instance - L'instance Supabase (contient donnees_json, nom, created_at)
 * @param {object} form - Le formulaire associé (contient schema_json avec sections et templates)
 * @param {object|null} gabarit - Gabarit optionnel { layout } ou null pour défaut
 * @returns {string} HTML complet avec style intégré
 */
export function buildMobileReportPdfHtml(instance, form, gabarit = null) {
  if (!instance) {
    return `<style>${buildGlobalStyle()}</style><div class="page"><p style="color:#999;">Instance vide.</p></div>`
  }

  const sections = form?.schema_json?.sections || []
  const layout = gabarit?.layout
  const settings = layout?.settings || {}

  // ─── Layout personnalisé (lignes + colonnes) ──────────────
  if (layout?.rows?.length) {
    const parts = []

    // En-tête
    if (settings.showHeader !== false) {
      parts.push('<div class="header">')
      parts.push('<div>')
      if (settings.headerTitle) {
        parts.push(`<div class="header-title">${escapeHtml(settings.headerTitle)}</div>`)
      }
      if (settings.headerSubtitle) {
        parts.push(`<div class="header-subtitle">${escapeHtml(settings.headerSubtitle)}</div>`)
      }
      parts.push('</div>')
      if (settings.showDate) {
        parts.push(`<div class="header-date">${formatDateFr(instance.created_at)}</div>`)
      }
      parts.push('</div>')
    }

    // Lignes
    for (const row of layout.rows) {
      parts.push('<div class="row">')
      for (const col of row.cols || []) {
        if (!col.fieldId) {
          parts.push('<div class="col"></div>')
          continue
        }
        const label = getFieldLabel(sections, col.fieldId)
        const value = getFieldValue(instance.donnees_json || {}, col.fieldId)
        const align = col.labelAlign || 'left'
        const showLabel = col.showLabel !== false
        const isEmpty = value === '—'

        parts.push('<div class="col">')
        if (showLabel) {
          parts.push(`<div class="field-label" style="text-align:${align}">${escapeHtml(label)}</div>`)
        }
        parts.push(`<div class="field-value${isEmpty ? ' field-value--empty' : ''}" style="text-align:${align}">${escapeHtml(value)}</div>`)
        parts.push('</div>')
      }
      parts.push('</div>')
    }

    return `<style>${buildGlobalStyle(settings)}</style><div class="page">${parts.join('')}</div>`
  }

  // ─── Fallback : gabarit Mustache (ancien format) ──────────
  if (gabarit?.html) {
    const renderData = {}
    for (const sec of sections) {
      for (const c of sec.fields || sec.champs || []) {
        renderData[c.id] = getFieldValue(instance.donnees_json || {}, c.id)
      }
    }
    renderData._nom = instance.nom || 'Rapport'
    renderData._date = formatDateFr(instance.created_at)
    renderData._meta = form?.schema_json?.meta || {}

    const css = gabarit.css || ''
    const html = Mustache.render(gabarit.html, renderData)
    return `<style>${buildGlobalStyle(settings)}${css}</style><div class="page">${html}</div>`
  }

  // ─── Gabarit par défaut (toujours affiché) ────────────────
  const defaultHtml = buildDefaultHtml(instance, form, settings)
  return `<style>${buildGlobalStyle(settings)}</style><div class="page">${defaultHtml}</div>`
}

/**
 * Génère un aperçu HTML visible (pour prévisualisation avant export).
 * Retourne aussi un booléen isEmpty.
 */
export function buildPreviewHtml(instance, form, gabarit = null) {
  const html = buildMobileReportPdfHtml(instance, form, gabarit)
  const isEmpty = !html || html.includes('Aucune donnée') || html.includes('Instance vide')
  return { html, isEmpty }
}
