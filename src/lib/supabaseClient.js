import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export function assertSupabaseConfigured() {
  if (!hasSupabaseConfig) {
    throw new Error(
      'Configuration Supabase manquante. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre .env.'
    )
  }
}

export function isSupabaseConfigured() {
  return hasSupabaseConfig
}
