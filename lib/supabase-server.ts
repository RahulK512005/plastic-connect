import { createClient } from '@supabase/supabase-js';

// Lazy-load singleton Supabase client for server-side use
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');
    }
    
    if (!key) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    }
    
    supabaseInstance = createClient(url, key);
  }
  
  return supabaseInstance;
}

// Helper function to safely execute database operations
export async function executeDbOperation<T>(
  operation: (client: ReturnType<typeof createClient>) => Promise<T>,
  operationName: string = 'Database operation'
): Promise<T> {
  try {
    const client = getSupabaseClient();
    return await operation(client);
  } catch (error) {
    console.error(`[v0] ${operationName} failed:`, error);
    throw error;
  }
}
