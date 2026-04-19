/**
 * Model: FormResponse
 * Représente une réponse soumise pour un formulaire
 */
class FormResponse {
  constructor(id = null, formId = null, answers = {}, submittedAt = new Date()) {
    this.id = id
    this.formId = formId
    this.answers = answers // { fieldId: value, ... }
    this.submittedAt = submittedAt
  }

  addAnswer(fieldId, value) {
    this.answers[fieldId] = value
  }

  getAnswer(fieldId) {
    return this.answers[fieldId]
  }

  isComplete(requiredFields) {
    return requiredFields.every(field => this.answers[field.id] != null)
  }

  toJSON() {
    return {
      id: this.id,
      formId: this.formId,
      answers: this.answers,
      submittedAt: this.submittedAt
    }
  }
}

export default FormResponse
