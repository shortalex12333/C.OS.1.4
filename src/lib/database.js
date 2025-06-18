import { createClient } from '@supabase/supabase-js';

let supabase = null;

export async function connectDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  
  // Skip health check if SKIP_DB_CHECK is true
  if (process.env.SKIP_DB_CHECK === 'true') {
    console.log('Skipping database health check (SKIP_DB_CHECK=true)');
    return supabase;
  }
  
  // Test the connection
  const { data, error } = await supabase.from('health_check').select('*').limit(1);
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist"
    throw new Error(`Database connection failed: ${error.message}`);
  }
  
  return supabase;
}

export async function disconnectDatabase() {
  if (supabase) {
    // Supabase client doesn't have a disconnect method, but we can clear the reference
    supabase = null;
  }
}

export function getDatabase() {
  if (!supabase) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return supabase;
} 