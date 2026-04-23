-- Run this in Supabase SQL Editor to update the affiliates table
ALTER TABLE public.affiliates 
ADD COLUMN IF NOT EXISTS is_ups BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_aportante BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tipo_jubilado TEXT,
ADD COLUMN IF NOT EXISTS is_aefip BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS es_jubilado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Allow nulls in CUIL since some external sources don't provide it
ALTER TABLE public.affiliates ALTER COLUMN cuil DROP NOT NULL;
ALTER TABLE public.affiliates ALTER COLUMN legajo DROP NOT NULL;
ALTER TABLE public.affiliates ALTER COLUMN provincia DROP NOT NULL;
ALTER TABLE public.affiliates ALTER COLUMN ciudad DROP NOT NULL;
ALTER TABLE public.affiliates ALTER COLUMN sexo DROP NOT NULL;

-- Update existing records to ensure defaults
UPDATE public.affiliates SET is_aefip = true WHERE is_aefip IS NULL;
UPDATE public.affiliates SET is_ups = false WHERE is_ups IS NULL;
UPDATE public.affiliates SET is_aportante = false WHERE is_aportante IS NULL;
