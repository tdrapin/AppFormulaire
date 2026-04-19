/**
 * Utilitaire: Validators
 * Fonctions de validation réutilisables
 */

export const validators = {
  // Valider un email
  isEmail: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  // Valider un texte non vide
  isNotEmpty: (value) => {
    return value && value.trim().length > 0
  },

  // Valider la longueur
  minLength: (value, min) => {
    return value && value.length >= min
  },

  maxLength: (value, max) => {
    return value && value.length <= max
  },

  // Valider un nombre
  isNumber: (value) => {
    return !isNaN(value) && value !== ''
  },

  // Valider un URL
  isUrl: (value) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  // Valider un telephone
  isPhone: (value) => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
    return phoneRegex.test(value)
  }
}

export default validators
