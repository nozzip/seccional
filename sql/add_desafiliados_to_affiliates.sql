-- ==============================================================================
-- Migración: Registro de Afiliados Desafiliados y Fecha de Desafiliación
-- Ejecutar en el Editor SQL de Supabase (SQL Editor)
-- ==============================================================================

-- 1. Agregar columnas a la tabla affiliates si no existen
ALTER TABLE public.affiliates 
ADD COLUMN IF NOT EXISTS desafiliado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fecha_desafiliacion DATE;

-- 2. Inicializar afiliados que previamente fueron marcados como baja (is_aefip = false)
-- y que no corresponden a sindicatos externos (UPS) ni jubilados
UPDATE public.affiliates 
SET desafiliado = true 
WHERE (is_aefip = false OR is_aefip IS NULL) 
  AND (is_ups = false OR is_ups IS NULL) 
  AND (es_jubilado = false OR es_jubilado IS NULL);

-- 3. Crear índice para optimizar consultas de afiliados activos y desafiliados
CREATE INDEX IF NOT EXISTS idx_affiliates_desafiliado ON public.affiliates(desafiliado);
CREATE INDEX IF NOT EXISTS idx_affiliates_fecha_desafiliacion ON public.affiliates(fecha_desafiliacion);
