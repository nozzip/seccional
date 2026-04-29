-- Ejecutar en el Editor SQL de Supabase
ALTER TABLE public.affiliates 
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS capacidades_digitales TEXT;

-- Comentario: Estos campos permiten a los afiliados completar su perfil desde la PWA.
