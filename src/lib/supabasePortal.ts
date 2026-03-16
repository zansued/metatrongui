import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://supa.techstorebrasil.com'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.N2nG61tlUEcrIqkCTnHLABlAo4z8fcl6an30W40fdac'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
