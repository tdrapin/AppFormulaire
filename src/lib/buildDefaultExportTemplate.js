/**
 * Gabarit HTML / CSS Mustache par défaut pour un schema_json mobile / bureau.
 * Contexte attendu : { instances: [{ ...donnees_json, created_at }, ...] }
 */
export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildDefaultExportTemplate(schemaJson) {
  const titre = escapeHtml(schemaJson?.titre || 'Rapport')
  const blocks = []
  for (const sec of schemaJson?.sections || []) {
    blocks.push(`<h2>${escapeHtml(sec.titre || '')}</h2>`)
    for (const c of sec.champs || []) {
      const id = String(c.id || '').replace(/[^\w\-]/g, '')
      if (!id) continue
      blocks.push(`<p><strong>${escapeHtml(c.label || id)}:</strong> {{${id}}}</p>`)
    }
  }
  const inner = blocks.join('\n')
  const html = `
<div class="export-root">
  <h1>${titre}</h1>
  {{#instances}}
  <div class="instance-block">
    <p class="meta"><small>{{created_at}}</small></p>
    ${inner}
    <hr/>
  </div>
  {{/instances}}
</div>`
  const css = `
.export-root { font-family: Arial, sans-serif; color: #222; }
h1 { font-size: 18px; margin-bottom: 12px; }
h2 { font-size: 14px; margin: 12px 0 6px; color: #444; }
.instance-block { margin-bottom: 20px; }
.meta { color: #666; }
hr { border: none; border-top: 1px solid #ddd; margin: 12px 0; }
`
  return { html, css }
}
