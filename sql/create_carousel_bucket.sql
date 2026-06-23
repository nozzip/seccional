-- Script para crear el Bucket (Almacenamiento de archivos) y sus permisos

-- 1. Crear el bucket llamado 'carousel_images' y hacerlo público
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel_images', 'carousel_images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir a cualquier persona VER (descargar) las imágenes del carrusel
CREATE POLICY "Lectura pública de imágenes del carrusel"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'carousel_images' );

-- 3. Permitir SUBIR imágenes al bucket
CREATE POLICY "Permitir subida de imágenes al carrusel"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'carousel_images' );

-- 4. Permitir ELIMINAR imágenes del bucket
CREATE POLICY "Permitir borrado de imágenes al carrusel"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'carousel_images' );
