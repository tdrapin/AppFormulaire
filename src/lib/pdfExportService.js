/**
 * Service d'export PDF fiable.
 * Utilise html2pdf.js avec un conteneur visible pour garantir la capture.
 */

const defaultPdfOptions = {
  margin: 10,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, logging: false },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
}

/**
 * Nettoie un nom de fichier.
 */
function sanitizeFilename(name) {
  return String(name || 'export')
    .trim()
    .slice(0, 80)
    .replace(/[/\\?%*:|"<>]/g, '-')
}

/**
 * Exporte un HTML string en PDF.
 * Crée un conteneur visible temporaire pour garantir la capture html2canvas.
 *
 * @param {string} htmlContent - Le HTML complet à exporter
 * @param {string} filename - Nom du fichier (sans extension)
 * @param {object} options - Options PDF supplémentaires
 */
export async function exportHtmlStringToPdf(htmlContent, filename, options = {}) {
  if (!htmlContent) {
    throw new Error('Contenu HTML vide — impossible d\'exporter le PDF.')
  }

  const html2pdf = (await import('html2pdf.js')).default
  const safeName = `${sanitizeFilename(filename)}.pdf`

  // Créer un conteneur visible dans le body
  const container = document.createElement('div')
  container.innerHTML = htmlContent
  container.style.position = 'absolute'
  container.style.left = '0'
  container.style.top = '0'
  container.style.width = '800px'
  container.style.background = '#ffffff'
  container.style.zIndex = '9999'
  container.style.padding = '0'
  container.style.margin = '0'
  // S'assurer que le contenu est bien visible pour html2canvas
  container.style.overflow = 'visible'
  document.body.appendChild(container)

  try {
    // Attendre un tick pour que le DOM soit rendu
    await new Promise(resolve => setTimeout(resolve, 100))

    await html2pdf()
      .set({
        ...defaultPdfOptions,
        ...options,
        filename: safeName
      })
      .from(container)
      .save()
  } finally {
    // Nettoyage : retirer le conteneur
    if (container.parentNode) {
      document.body.removeChild(container)
    }
  }
}

/**
 * Construit un nom de fichier pour le PDF.
 */
export function buildPdfFilename(base, prefix = 'formulaire') {
  return `${prefix}-${sanitizeFilename(base || 'export')}`
}
