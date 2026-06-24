-- Script para crear la tabla de imagenes del carrusel
CREATE TABLE IF NOT EXISTS public.carousel_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar acceso público para lectura
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública de carrusel" 
ON public.carousel_images FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserción a usuarios" 
ON public.carousel_images FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir actualización a usuarios" 
ON public.carousel_images FOR UPDATE 
USING (true);

CREATE POLICY "Permitir borrado a usuarios" 
ON public.carousel_images FOR DELETE 
USING (true);
