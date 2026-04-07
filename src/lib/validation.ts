import { z } from 'zod'
import type { FormField, FormTemplate, FormSubmission } from '../types'

// Zod schema pour validation d'un champ
export const fieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'multiline', 'number', 'date', 'boolean', 'select', 'multiselect']),
  label: z.string(),
  required: z.boolean(),
  placeholder: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  visibleWhen: z.object({
    fieldId: z.string(),
    equals: z.union([z.boolean(), z.string(), z.number()])
  }).optional()
})

// Zod schema pour un template
export const templateSchema = z.object({
  schemaVersion: z.number(),
  form: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    version: z.number(),
    tags: z.array(z.string()).optional()
  }),
  layout: z.object({
    header: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      showDate: z.boolean().optional()
    }),
    footer: z.object({
      text: z.string().optional(),
      showSignature: z.boolean().optional()
    })
  }),
  fields: z.array(fieldSchema)
})

// Zod schema pour une submission
export const submissionSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  templateVersion: z.number(),
  answers: z.record(z.any()),
  status: z.enum(['draft', 'submitted', 'synced']),
  createdAt: z.date(),
  updatedAt: z.date(),
  clientGeneratedId: z.string().optional(),
  syncedAt: z.date().optional()
})

export type ValidTemplateError = {
  field: string
  error: string
}

export function validateTemplate(data: unknown): { valid: boolean; errors?: ValidTemplateError[] } {
  const result = templateSchema.safeParse(data)
  if (result.success) {
    return { valid: true }
  }
  return {
    valid: false,
    errors: result.error.errors.map(err => ({
      field: err.path.join('.'),
      error: err.message
    }))
  }
}

export function validateSubmission(data: unknown): { valid: boolean; errors?: ValidTemplateError[] } {
  const result = submissionSchema.safeParse(data)
  if (result.success) {
    return { valid: true }
  }
  return {
    valid: false,
    errors: result.error.errors.map(err => ({
      field: err.path.join('.'),
      error: err.message
    }))
  }
}
