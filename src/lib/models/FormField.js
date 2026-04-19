/**
 * Model: FormField
 * Représente un champ dans un formulaire
 */
class FormField {
  constructor(id = null, label = '', type = 'text', required = false, placeholder = '') {
    this.id = id || this.generateId()
    this.label = label
    this.type = type // text, email, textarea, select, checkbox, radio, etc.
    this.required = required
    this.placeholder = placeholder
    this.options = [] // pour select, radio, checkbox
  }

  generateId() {
    return 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  addOption(option) {
    if (!this.options) this.options = []
    this.options.push(option)
  }

  setOptions(options) {
    this.options = options
  }

  toJSON() {
    return {
      id: this.id,
      label: this.label,
      type: this.type,
      required: this.required,
      placeholder: this.placeholder,
      options: this.options
    }
  }
}

export default FormField
