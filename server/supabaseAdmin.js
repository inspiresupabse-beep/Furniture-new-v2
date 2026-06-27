import { createClient } from '@supabase/supabase-js';

let client;

function cleanEnv(value) {
  if (!value) return '';
  return String(value).trim().replace(/^['"]|['"]$/g, '');
}

function normalizeSupabaseUrl(url) {
  const cleaned = cleanEnv(url);
  if (!cleaned) return '';
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return cleaned.replace(/\/+$/, '');
  }
  return `https://${cleaned.replace(/\/+$/, '')}`;
}

export function getSupabaseAdmin() {
  if (client) return client;

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL);
  const key = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  try {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err) {
    throw new Error(`Invalid Supabase config: ${err.message}`);
  }

  return client;
}
