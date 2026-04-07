export interface FormField {
  id: string
  type: 'text' | 'multiline' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect'
  label: string
  required: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  visibleWhen?: {
    fieldId: string
    equals: boolean | string | number
  }
}

export interface FormTemplate {
  schemaVersion: number
  form: {
    id: string
    name: string
    code: string
    version: number
    tags?: string[]
  }
  layout: {
    header: {
      title: string
      subtitle?: string
      showDate?: boolean
    }
    footer: {
      text?: string
      showSignature?: boolean
    }
  }
  fields: FormField[]
}

export interface FormSubmission {
  id: string
  templateId: string
  templateVersion: number
  answers: Record<string, any>
  status: 'draft' | 'submitted' | 'synced'
  createdAt: Date
  updatedAt: Date
  clientGeneratedId?: string
  syncedAt?: Date
}
