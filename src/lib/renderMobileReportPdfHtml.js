import { escapeHtml } from './buildDefaultExportTemplate'
import Mustache from 'mustache'

function formatDateFr(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })
  } catch {
    return String(iso ?? '')
  }
}

/**
 * Génère le HTML pour l'export PDF d'une instance.
 * Utilise un gabarit Mustache si fourni, sinon un template par défaut.
 *
 * @param {object} instance - L'instance Supabase (contient donnees_json, created_at, formulaire_id)
 * @param {object} form - Le formulaire associé (contient schema_json)
 * @param {object|null} gabarit - Gabarit Mustache optionnel { html_content, css_content }
 */
export function buildMobileReportPdfHtml(instance, form, gabarit = null) {
  if (!instance) return '<div></div>'

  const donnees = instance.donnees_json || {}
  const sections = form?.schema_json?.sections || []

  // Construire le contexte de rendu
  const renderData = {}
  for (const sec of sections) {
    for (const c of sec.champs || []) {
      const val = donnees[c.id]
      renderData[c.id] = val === undefined || val === null || String(val).trim() === '' ? '—' : String(val)
    }
  }
  renderData._nom = donnees._nom || instance.nom || 'Rapport'
  renderData._date = formatDateFr(instance.created_at)

  if (gabarit && gabarit.html_content) {
    // Utiliser le gabarit Mustache
    const css = gabarit.css_content || ''
    const html = Mustache.render(gabarit.html_content, renderData)
    return `<style>${css}</style><div style="font-family:system-ui,-apple-system,sans-serif;font-size:11pt;color:#111;">${html}</div>`
  }

  // Gabarit par défaut
  const parts = []
  parts.push(`<h1 style="font-size:18pt;margin:0 0 10px;">${escapeHtml(renderData._nom)}</h1>`)
  parts.push(`<p style="margin:4px 0;color:#444;">Date : ${escapeHtml(renderData._date)}</p>`)

  for (const sec of sections) {
    parts.push('<section style="margin-top:14px;">')
    parts.push(`<h2 style="font-size:12pt;margin:0 0 8px;color:#333;">${escapeHtml(sec.titre || '')}</h2>`)
    for (const c of sec.champs || []) {
      const val = renderData[c.id]
      parts.push(
        `<div style="display:grid;grid-template-columns:40% 60%;gap:8px;margin-bottom:6px;">` +
          `<strong>${escapeHtml(c.label)}</strong>` +
          `<span>${escapeHtml(val)}</span>` +
        `</div>`
      )
    }
    parts.push('</section>')
  }
  return `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:11pt;color:#111;">${parts.join('')}</div>`
}
