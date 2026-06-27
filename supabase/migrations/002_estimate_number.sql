-- Add monthly estimate numbers: EST-YYYY-MM-01, EST-YYYY-MM-02, ...

ALTER TABLE public.estimates
  ADD COLUMN IF NOT EXISTS estimate_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS estimates_estimate_number_unique_idx
  ON public.estimates (estimate_number)
  WHERE estimate_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS estimates_estimate_number_prefix_idx
  ON public.estimates (estimate_number text_pattern_ops);
