/**
 * Service: ResponseService
 * Gère la logique métier pour les réponses aux formulaires
 */
import FormResponse from '../models/FormResponse.js'

class ResponseService {
  constructor() {
    this.responses = new Map() // Simulé en mémoire, à remplacer par une API
    this.nextId = 1
  }

  // Créer une nouvelle réponse
  createResponse(formId) {
    const response = new FormResponse(this.nextId++, formId, {})
    this.responses.set(response.id, response)
    return response
  }

  // Récupérer toutes les réponses pour un formulaire
  getResponsesByFormId(formId) {
    return Array.from(this.responses.values())
      .filter(r => r.formId === formId)
  }

  // Récupérer une réponse par ID
  getResponseById(id) {
    return this.responses.get(id)
  }

  // Ajouter une réponse à un champ
  addAnswer(responseId, fieldId, value) {
    const response = this.responses.get(responseId)
    if (!response) throw new Error(`Réponse ${responseId} non trouvée`)
    
    response.addAnswer(fieldId, value)
    return response
  }

  // Soumettre une réponse
  submitResponse(responseId) {
    const response = this.responses.get(responseId)
    if (!response) throw new Error(`Réponse ${responseId} non trouvée`)
    
    response.submittedAt = new Date()
    // Ici, on pourrait envoyer à une API
    return response
  }

  // Supprimer une réponse
  deleteResponse(id) {
    return this.responses.delete(id)
  }
}

// Export d'une instance unique (singleton)
export default new ResponseService()
