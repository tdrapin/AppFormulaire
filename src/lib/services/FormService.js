/**
 * Service: FormService
 * Gère la logique métier pour les formulaires
 */
import Form from '../models/Form.js'
import FormField from '../models/FormField.js'

class FormService {
  constructor() {
    this.forms = new Map() // Simulé en mémoire, à remplacer par une API
    this.nextId = 1
  }

  // Créer un nouveau formulaire
  createForm(name, description = '') {
    const form = new Form(this.nextId++, name, description)
    this.forms.set(form.id, form)
    return form
  }

  // Récupérer tous les formulaires
  getAllForms() {
    return Array.from(this.forms.values())
  }

  // Récupérer un formulaire par ID
  getFormById(id) {
    return this.forms.get(id)
  }

  // Mettre à jour un formulaire
  updateForm(id, updates) {
    const form = this.forms.get(id)
    if (!form) throw new Error(`Formulaire ${id} non trouvé`)
    
    Object.assign(form, updates)
    form.updatedAt = new Date()
    return form
  }

  // Supprimer un formulaire
  deleteForm(id) {
    return this.forms.delete(id)
  }

  // Ajouter un champ à un formulaire
  addFieldToForm(formId, field) {
    const form = this.forms.get(formId)
    if (!form) throw new Error(`Formulaire ${formId} non trouvé`)
    
    form.addField(field)
    return form
  }

  // Supprimer un champ d'un formulaire
  removeFieldFromForm(formId, fieldId) {
    const form = this.forms.get(formId)
    if (!form) throw new Error(`Formulaire ${formId} non trouvé`)
    
    form.removeField(fieldId)
    return form
  }
}

// Export d'une instance unique (singleton)
export default new FormService()
