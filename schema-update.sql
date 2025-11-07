-- SCHEMA ACTUALIZADO PARA RUTAFÁCIL
-- Ejecuta esto en Supabase SQL Editor

-- Agregar columna de estado a la tabla rutas
ALTER TABLE rutas ADD COLUMN IF NOT EXISTS estado TEXT CHECK (estado IN ('Activa', 'Completada')) DEFAULT 'Activa';

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_rutas_estado ON rutas(estado);
CREATE INDEX IF NOT EXISTS idx_rutas_fecha ON rutas(fecha);
CREATE INDEX IF NOT EXISTS idx_entregas_ruta ON entregas(ruta_id);

-- Verificar datos
SELECT * FROM rutas;
SELECT * FROM entregas;