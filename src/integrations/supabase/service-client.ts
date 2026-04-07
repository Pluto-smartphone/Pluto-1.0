import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Service role key for bypassing RLS (keep this secret!)
const SUPABASE_SERVICE_URL = "https://mjpbbnmxfuuaevwotsfh.supabase.co"
const SUPABASE_SERVICE_KEY = "your-service-role-key-here" // You need to get this from Supabase dashboard

export const supabaseService = createClient<Database>(
  SUPABASE_SERVICE_URL, 
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
