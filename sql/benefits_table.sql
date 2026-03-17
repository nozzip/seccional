-- Tabla de beneficios editable desde el frontend
CREATE TABLE IF NOT EXISTS benefits (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    thumbnail TEXT,
    short_description TEXT,
    mail TEXT,
    telephone TEXT,
    contact_person TEXT,
    address TEXT,
    discount_description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por categoría
CREATE INDEX IF NOT EXISTS idx_benefits_category ON benefits(category);
CREATE INDEX IF NOT EXISTS idx_benefits_active ON benefits(is_active);

-- Habilitar RLS
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
CREATE POLICY "Allow public read access" ON benefits
    FOR SELECT USING (is_active = true);

-- Política de escritura solo para usuarios autenticados (admin)
CREATE POLICY "Allow authenticated update" ON benefits
    FOR ALL USING (auth.role() = 'authenticated');

-- Insertar datos iniciales desde mockData (opcional - ejecutar solo si no hay datos)
-- INSERT INTO benefits (title, category, thumbnail, short_description, is_active, display_order)
-- SELECT title, category, thumbnail, short_description, true, id
-- FROM (VALUES
--     ('Don Numas Posada', 'Salta', 'https://i.ibb.co/cLsgwT8/Don-Numas-Posada.webp', 'Beneficio exclusivo para afiliados.'),
--     ('Hotel La Linda', 'Salta', 'https://i.ibb.co/TR2wddf/Hotel-La-linda.webp', 'Beneficio exclusivo para afiliados.')
-- ) AS v(title, category, thumbnail, short_description)
-- WHERE NOT EXISTS (SELECT 1 FROM benefits);
