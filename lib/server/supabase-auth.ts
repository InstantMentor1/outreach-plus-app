import 'server-only';
import { createClient } from '@supabase/supabase-js';
export function supabaseAuth() { const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_PUBLISHABLE_KEY; if (!url || !key) throw new Error('Authentication is not configured.'); return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }); }
