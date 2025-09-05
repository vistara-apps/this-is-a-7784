import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database schema types for TypeScript-like documentation
export const DatabaseSchema = {
  users: {
    id: 'uuid',
    email: 'text',
    subscription_status: 'text', // 'free', 'premium', 'cancelled'
    preferred_language: 'text', // 'en', 'es'
    alert_contacts: 'jsonb', // array of contact objects
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  guides: {
    id: 'uuid',
    state: 'text',
    title: 'text',
    rights: 'jsonb', // array of rights
    do_not_say: 'jsonb', // array of things not to say
    scripts: 'jsonb', // object with script types
    language: 'text', // 'en', 'es'
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  recordings: {
    id: 'uuid',
    user_id: 'uuid',
    file_path: 'text', // IPFS hash or storage path
    duration: 'integer', // in seconds
    shared_link: 'text', // public sharing link
    metadata: 'jsonb', // additional recording metadata
    created_at: 'timestamp'
  },
  saved_guides: {
    id: 'uuid',
    user_id: 'uuid',
    guide_id: 'uuid',
    saved_at: 'timestamp'
  }
}
