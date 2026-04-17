import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://czyxfbqjonwmjqqkdesd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eXhmYnFqb253bWpxcWtkZXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDA0ODgsImV4cCI6MjA2ODc3NjQ4OH0.9JiPDQM84mTD5vQRKnr5CVPTHF6gvz3Qd4qJzEaiglM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase.from('empresas').select('logo_url').limit(5)
  console.log(JSON.stringify(data, null, 2))
}

check()
