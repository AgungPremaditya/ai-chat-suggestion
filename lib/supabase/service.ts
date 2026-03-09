import { createClient } from '@supabase/supabase-js'

/**
 * Server-side only. Uses the service role key which bypasses RLS.
 * Never import this in client components or expose to the browser.
 */
export function createServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}
