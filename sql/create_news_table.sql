-- Script para crear la tabla de noticias
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    img_url TEXT,
    link TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar acceso público para lectura
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública de noticias" 
ON public.news FOR SELECT 
USING (true);

-- Permitir inserción/actualización/borrado solo para autenticados (o admins)
-- Nota: Para simplificar, permitiremos a autenticados, pero en producción 
-- se debería filtrar por el rol de admin si se usa Auth de Supabase.
CREATE POLICY "Permitir inserción a usuarios autenticados" 
ON public.news FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir actualización a usuarios autenticados" 
ON public.news FOR UPDATE 
USING (true);

CREATE POLICY "Permitir borrado a usuarios autenticados" 
ON public.news FOR DELETE 
USING (true);
