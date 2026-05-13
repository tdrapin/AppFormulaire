/**
 * Utilitaire: Validators
 * Fonctions de validation réutilisables pour les formulaires terrain
 */

/**
 * Valide la valeur d'un champ selon son type et ses contraintes.
 * @param {string} value - La valeur saisie
 * @param {object} field - Le champ avec { type, required, min, max, pattern }
 * @returns {string|null} Message d'erreur ou null si valide
 */
export function validateField(value, field) {
  const val = String(value ?? '').trim()

  // Champ obligatoire vide
  if (field.required && !val) {
    return 'Ce champ est obligatoire.'
  }

  // Si vide et pas obligatoire → OK
  if (!val) return null

  // Validation par type
  switch (field.type) {
    case 'number': {
      const num = Number(val)
      if (isNaN(num)) return 'Veuillez saisir un nombre valide.'
      if (field.min !== undefined && num < field.min) {
        return `La valeur minimale est ${field.min}.`
      }
      if (field.max !== undefined && num > field.max) {
        return `La valeur maximale est ${field.max}.`
      }
      break
    }
    case 'date': {
      const d = new Date(val)
      if (isNaN(d.getTime())) return 'Veuillez saisir une date valide.'
      if (field.min) {
        const min = new Date(field.min)
        if (d < min) return `La date doit être après le ${min.toLocaleDateString('fr-FR')}.`
      }
      if (field.max) {
        const max = new Date(field.max)
        if (d > max) return `La date doit être avant le ${max.toLocaleDateString('fr-FR')}.`
      }
      break
    }
    case 'textarea':
    case 'text': {
      if (field.minLength !== undefined && val.length < field.minLength) {
        return `Minimum ${field.minLength} caractères requis.`
      }
      if (field.maxLength !== undefined && val.length > field.maxLength) {
        return `Maximum ${field.maxLength} caractères autorisés.`
      }
      if (field.pattern) {
        try {
          const regex = new RegExp(field.pattern)
          if (!regex.test(val)) return 'Le format saisi n\'est pas valide.'
        } catch { /* pattern invalide, on ignore */ }
      }
      break
    }
  }

  return null
}

/**
 * Valide toutes les réponses d'un formulaire.
 * @param {object} answers - { [fieldId]: value }
 * @param {Array} fields - Liste des champs [{ id, type, required, ... }]
 * @returns {object} { [fieldId]: errorMessage | null }
 */
export function validateAll(answers, fields) {
  const errors = {}
  for (const field of fields) {
    const msg = validateField(answers[field.id], field)
    if (msg) errors[field.id] = msg
  }
  return errors
}

// Garder l'export par défaut pour compatibilité
export default { validateField, validateAll }
