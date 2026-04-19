/**
 * Model: Form
 * Représente la structure d'un formulaire
 */
class Form {
  constructor(id = null, name = '', description = '', fields = [], createdAt = new Date()) {
    this.id = id
    this.name = name
    this.description = description
    this.fields = fields
    this.createdAt = createdAt
    this.updatedAt = new Date()
  }

  addField(field) {
    this.fields.push(field)
    this.updatedAt = new Date()
  }

  removeField(fieldId) {
    this.fields = this.fields.filter(f => f.id !== fieldId)
    this.updatedAt = new Date()
  }

  getFieldById(fieldId) {
    return this.fields.find(f => f.id === fieldId)
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      fields: this.fields,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}

export default Form
