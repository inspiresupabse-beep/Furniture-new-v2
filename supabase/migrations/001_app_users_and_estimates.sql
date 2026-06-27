-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  client_name TEXT,
  product_type TEXT NOT NULL,
  form_state JSONB NOT NULL,
  estimate_data JSONB NOT NULL,
  final_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS estimates_user_id_created_at_idx
  ON public.estimates (user_id, created_at DESC);

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

-- Block direct client access; server API uses service role key
CREATE POLICY "block direct app_users access"
  ON public.app_users FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "block direct estimates access"
  ON public.estimates FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
