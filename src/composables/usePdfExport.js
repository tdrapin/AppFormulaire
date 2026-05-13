const defaultPdfOptions = {
  margin: 10,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
}

/**
 * @param {HTMLElement} sourceElement
 * @param {string} filename ex. rapport-maintenance.pdf
 */
export async function exportHtmlElementToPdf(sourceElement, filename) {
  if (!sourceElement) {
    throw new Error('Élément source manquant pour export PDF.')
  }
  const html2pdf = (await import('html2pdf.js')).default
  const safeName =
    filename && String(filename).trim().endsWith('.pdf')
      ? String(filename).trim()
      : `${String(filename || 'export').replace(/[/\\?%*:|"<>]/g, '-')}.pdf`

  await html2pdf()
    .set({
      ...defaultPdfOptions,
      filename: safeName
    })
    .from(sourceElement)
    .save()
}

export function buildPdfFilename(base, prefix = 'formulaire') {
  const raw = String(base || 'export')
    .trim()
    .slice(0, 80)
    .replace(/[/\\?%*:|"<>]/g, '-')
  return `${prefix}-${raw || 'export'}.pdf`
}
