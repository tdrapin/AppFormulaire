import type { FormTemplate, FormSubmission } from '../types'

/**
 * Crée une nouvelle submission à partir d'un template
 */
export function createSubmissionFromTemplate(template: FormTemplate): FormSubmission {
  return {
    id: crypto.randomUUID(),
    templateId: template.form.id,
    templateVersion: template.form.version,
    answers: {},
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    clientGeneratedId: crypto.randomUUID()
  }
}

/**
 * Clone un template (crée une nouvelle version)
 */
export function cloneTemplate(template: FormTemplate): FormTemplate {
  return {
    ...template,
    form: {
      ...template.form,
      version: template.form.version + 1,
      id: `${template.form.id}_v${template.form.version + 1}`
    }
  }
}

/**
 * Vérifie si un champ doit être visible basé sur la règle visibleWhen
 */
export function isFieldVisible(fieldId: string, answers: Record<string, any>, template: FormTemplate): boolean {
  const field = template.fields.find(f => f.id === fieldId)
  if (!field || !field.visibleWhen) {
    return true
  }

  const dependentValue = answers[field.visibleWhen.fieldId]
  return dependentValue === field.visibleWhen.equals
}

/**
 * Exporte les réponses en JSON
 */
export function exportAnswersAsJSON(submission: FormSubmission): string {
  return JSON.stringify(submission.answers, null, 2)
}
