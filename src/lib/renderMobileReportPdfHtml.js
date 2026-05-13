import { escapeHtml } from './buildDefaultExportTemplate'

function formatDateFr(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })
  } catch {
    return String(iso ?? '')
  }
}

/**
 * HTML statique pour export PDF d'un rapport mobile (contenu échappé).
 * Styles inline pour un rendu correct hors des feuilles de style de l'app.
 */
export function buildMobileReportPdfHtml(report, form) {
  if (!report) return '<div></div>'
  const parts = []
  parts.push(
    `<h1 style="font-size:18pt;margin:0 0 10px;">${escapeHtml(report.formTitre)}</h1>`
  )
  parts.push(
    `<p style="margin:4px 0;color:#444;">Client : ${escapeHtml(report.client)}</p>`
  )
  parts.push(
    `<p style="margin:4px 0;color:#444;">Date : ${escapeHtml(formatDateFr(report.dateISO))}</p>`
  )

  const sections = form?.schema_json?.sections || []
  for (const sec of sections) {
    parts.push('<section style="margin-top:14px;">')
    parts.push(
      `<h2 style="font-size:12pt;margin:0 0 8px;color:#333;">${escapeHtml(sec.titre || '')}</h2>`
    )
    for (const c of sec.champs || []) {
      const val = report.answers?.[c.id]
      const display =
        val === undefined || val === null || String(val).trim() === '' ? '—' : String(val)
      parts.push(
        `<div style="display:grid;grid-template-columns:40% 60%;gap:8px;margin-bottom:6px;">` +
          `<strong>${escapeHtml(c.label)}</strong>` +
          `<span>${escapeHtml(display)}</span>` +
          `</div>`
      )
    }
    parts.push('</section>')
  }
  return `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:11pt;color:#111;">${parts.join('')}</div>`
}
