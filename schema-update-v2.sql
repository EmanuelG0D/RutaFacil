-- ====================================
-- RutaFácil - Actualización v2
-- ====================================

-- Paso 1: ELIMINAR constraint antiguo que limita los estados
ALTER TABLE entregas DROP CONSTRAINT IF EXISTS entregas_estado_check;

-- Paso 2: AGREGAR nuevo constraint con el estado "Intento de Entrega"
ALTER TABLE entregas ADD CONSTRAINT entregas_estado_check 
  CHECK (estado IN ('Pendiente', 'En camino', 'Entregado', 'Intento de Entrega'));

-- Paso 3: Agregar comentario descriptivo
COMMENT ON COLUMN entregas.estado IS 'Estados válidos: Pendiente, En camino, Entregado, Intento de Entrega';

-- Paso 4: Índice adicional para búsquedas por estado
CREATE INDEX IF NOT EXISTS idx_entregas_estado ON entregas(estado);

-- Paso 5: Verificar datos existentes
SELECT COUNT(*) as total_entregas, estado 
FROM entregas 
GROUP BY estado;
