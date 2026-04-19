/**
 * Utilitaire: Date Helper
 * Fonctions utilitaires pour les dates
 */

export const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString('fr-FR', options)
}

export const formatDateTime = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(date).toLocaleDateString('fr-FR', options)
}

export const getRelativeTime = (date) => {
  const now = new Date()
  const time = new Date(date)
  const secondsAgo = Math.floor((now - time) / 1000)

  if (secondsAgo < 60) return 'à l\'instant'
  if (secondsAgo < 3600) return `il y a ${Math.floor(secondsAgo / 60)} minutes`
  if (secondsAgo < 86400) return `il y a ${Math.floor(secondsAgo / 3600)} heures`
  if (secondsAgo < 604800) return `il y a ${Math.floor(secondsAgo / 86400)} jours`
  return formatDate(date)
}

export default {
  formatDate,
  formatDateTime,
  getRelativeTime
}
