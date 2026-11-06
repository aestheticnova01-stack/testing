import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and fill in your Supabase values.'
  );
}

/**
 * Server-only Supabase client with the service-role key.
 * NEVER import or use this in browser/client components — it bypasses RLS.
 */
export const supabaseServer = createClient(supabaseUrl, serviceRoleKey);
