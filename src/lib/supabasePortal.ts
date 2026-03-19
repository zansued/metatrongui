import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ikbplapmzbskyyexyeyf.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYnBsYXBtemJza3l5ZXh5ZXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzk1OTQsImV4cCI6MjA4MTg1NTU5NH0.hMEf4Bi551EbBh-xAjD9XtjzpzekohBrD9_pwkL2gyY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
