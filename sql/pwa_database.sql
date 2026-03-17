-- =====================================================
-- Script de Base de Datos para PWA Afiliados AEFIP
-- Seccional Noroeste
-- =====================================================

-- 1. Agregar campos a la tabla affiliates (si no existen)
-- NOTA: Ejecutar solo si los campos no existen

-- ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS telefono TEXT;
-- ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS email TEXT;
-- ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS es_jubilado BOOLEAN DEFAULT false;

-- 2. Tabla de solicitudes de turismo
CREATE TABLE IF NOT EXISTS tourism_requests (
    id SERIAL PRIMARY KEY,
    affiliate_id INTEGER REFERENCES affiliates(id) ON DELETE SET NULL,
    nombre_apellido TEXT NOT NULL,
    cuil TEXT,
    es_jubilado BOOLEAN DEFAULT false,
    departamento TEXT DEFAULT 'Noroeste',
    telefono TEXT,
    mail TEXT,
    destino TEXT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    plazas_req INTEGER DEFAULT 1,
    observaciones TEXT,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'confirmado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de invitados de turismo
CREATE TABLE IF NOT EXISTS tourism_guests (
    id SERIAL PRIMARY KEY,
    tourism_request_id INTEGER REFERENCES tourism_requests(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    parentesco TEXT,
    edad INTEGER,
    dni TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de solicitudes generales (opcional, para otros tipos de solicitudes)
CREATE TABLE IF NOT EXISTS general_requests (
    id SERIAL PRIMARY KEY,
    affiliate_id INTEGER REFERENCES affiliates(id) ON DELETE SET NULL,
    nombre_apellido TEXT NOT NULL,
    cuil TEXT,
    tipo_solicitud TEXT NOT NULL,
    descripcion TEXT,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesando', 'resuelto', 'rechazado')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Habilitar Row Level Security (RLS) - Opcional
-- ALTER TABLE tourism_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tourism_guests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE general_requests ENABLE ROW LEVEL SECURITY;

-- 6. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_tourism_requests_affiliate ON tourism_requests(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_tourism_requests_estado ON tourism_requests(estado);
CREATE INDEX IF NOT EXISTS idx_tourism_guests_request ON tourism_guests(tourism_request_id);
CREATE INDEX IF NOT EXISTS idx_general_requests_affiliate ON general_requests(affiliate_id);

-- =====================================================
-- PARA ACTUALIZAR LA TABLA AFFILIATES EXISTENTE
-- Ejecutar en Supabase SQL Editor:
-- =====================================================

-- Agregar campos si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'telefono') THEN
        ALTER TABLE affiliates ADD COLUMN telefono TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'email') THEN
        ALTER TABLE affiliates ADD COLUMN email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliates' AND column_name = 'es_jubilado') THEN
        ALTER TABLE affiliates ADD COLUMN es_jubilado BOOLEAN DEFAULT false;
    END IF;
END $$;
