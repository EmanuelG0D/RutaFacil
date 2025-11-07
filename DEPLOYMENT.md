# 📋 Guía de Deployment - RutaFácil v2.0

## 🚀 Pasos para Deploy en Vercel

### 1️⃣ Preparar Repositorio Git

```bash
# Inicializar git (si no existe)
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "RutaFacil v2.0 - Sistema completo de entregas"

# Agregar remote (reemplaza con tu repo)
git remote add origin https://github.com/TU_USUARIO/RutaFacil.git

# Push
git push -u origin main
```

### 2️⃣ Configurar Supabase

#### A. Crear Proyecto
1. Ir a [supabase.com](https://supabase.com)
2. Clic en "New Project"
3. Completar:
   - Name: `rutafacil`
   - Database Password: (guardar en lugar seguro)
   - Region: Elegir más cercana
4. Esperar ~2 minutos hasta que esté listo

#### B. Obtener Credenciales
1. Project Settings → API
2. Copiar:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGci...`

#### C. Ejecutar SQL
1. SQL Editor → New Query
2. Copiar y ejecutar `schema-update.sql`:
```sql
-- Crear tabla rutas
CREATE TABLE IF NOT EXISTS rutas (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP DEFAULT NOW(),
  repartidor TEXT NOT NULL,
  estado TEXT DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Completada'))
);

-- Crear tabla entregas
CREATE TABLE IF NOT EXISTS entregas (
  id SERIAL PRIMARY KEY,
  ruta_id INTEGER REFERENCES rutas(id) ON DELETE CASCADE,
  cliente TEXT NOT NULL,
  orden INTEGER NOT NULL,
  estado TEXT DEFAULT 'Pendiente' 
);

-- Índices
CREATE INDEX idx_rutas_estado ON rutas(estado);
CREATE INDEX idx_rutas_fecha ON rutas(fecha);
CREATE INDEX idx_entregas_ruta_id ON entregas(ruta_id);
```

3. Nueva query → Ejecutar `schema-update-v2.sql`:
```sql
-- Eliminar constraint antiguo
ALTER TABLE entregas DROP CONSTRAINT IF EXISTS entregas_estado_check;

-- Nuevo constraint con 4 estados
ALTER TABLE entregas ADD CONSTRAINT entregas_estado_check 
  CHECK (estado IN ('Pendiente', 'En camino', 'Entregado', 'Intento de Entrega'));

-- Índice adicional
CREATE INDEX IF NOT EXISTS idx_entregas_estado ON entregas(estado);
```

4. Nueva query → Políticas RLS:
```sql
-- RUTAS
CREATE POLICY "allow_anon_select_rutas" ON rutas FOR SELECT TO anon USING (true);
CREATE POLICY "allow_anon_insert_rutas" ON rutas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_anon_update_rutas" ON rutas FOR UPDATE TO anon USING (true);
CREATE POLICY "allow_anon_delete_rutas" ON rutas FOR DELETE TO anon USING (true);

-- ENTREGAS
CREATE POLICY "allow_anon_select_entregas" ON entregas FOR SELECT TO anon USING (true);
CREATE POLICY "allow_anon_insert_entregas" ON entregas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_anon_update_entregas" ON entregas FOR UPDATE TO anon USING (true);
CREATE POLICY "allow_anon_delete_entregas" ON entregas FOR DELETE TO anon USING (true);
```

5. Habilitar Realtime:
   - Settings → API → Enable Realtime
   - Database → Publications → Agregar `rutas` y `entregas`

### 3️⃣ Actualizar config.js

Editar `config.js` con tus credenciales:

```javascript
// config.js
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**⚠️ IMPORTANTE:** Hacer commit del cambio:
```bash
git add config.js
git commit -m "Update Supabase credentials"
git push
```

### 4️⃣ Deploy en Vercel

#### Opción A: Desde Vercel Dashboard (Recomendado)

1. Ir a [vercel.com](https://vercel.com)
2. Clic en "Add New..." → "Project"
3. Import Git Repository → Autorizar GitHub
4. Seleccionar repo `RutaFacil`
5. Configurar proyecto:
   - **Framework Preset**: Other
   - **Build Command**: (dejar vacío)
   - **Output Directory**: (dejar vacío)
6. Clic en "Deploy"
7. Esperar ~30 segundos
8. ✅ ¡Listo! Tu app está en: `https://rutafacil.vercel.app`

#### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Producción
vercel --prod
```

### 5️⃣ Configurar Dominio Personalizado (Opcional)

1. Vercel Dashboard → Tu proyecto → Settings → Domains
2. Agregar dominio (ej: `rutafacil.com`)
3. Configurar DNS según instrucciones de Vercel
4. Esperar propagación DNS (~5-48 horas)

### 6️⃣ Variables de Entorno (Opcional - Más Seguro)

Para ocultar credenciales del código:

1. Vercel → Settings → Environment Variables
2. Agregar:
   - `VITE_SUPABASE_URL`: `https://xxxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGci...`

3. Actualizar `config.js`:
```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGci...';
```

4. Redeploy desde Vercel dashboard

---

## 🧪 Probar Deploy

### Vista Cliente
Abrir: `https://tu-app.vercel.app`

Deberías ver:
- ✅ Fondo animado púrpura con burbujas
- ✅ Header con logo "RutaFácil"
- ✅ Timeline de entregas vacío

### Panel Repartidor
Abrir: `https://tu-app.vercel.app/repartidor`

Deberías ver:
- ✅ Mensaje "No hay ruta activa"
- ✅ Botón "Crear Nueva Ruta"

### Flujo Completo
1. Crear ruta (nombre del repartidor)
2. Agregar entregas
3. Cambiar estados (incluyendo "Intento")
4. Completar ruta (generar PDF)
5. Verificar vista cliente en tiempo real

---

## 🐛 Troubleshooting

### Error: "No cargan datos"
**Solución:**
- Verificar que `config.js` tenga credenciales correctas
- Revisar políticas RLS en Supabase
- Abrir consola (F12) y buscar errores

### Error: "Failed to fetch"
**Solución:**
- Verificar que Realtime esté habilitado en Supabase
- Revisar CORS settings en Supabase (Authentication → URL Configuration)

### Error: "PDF no genera"
**Solución:**
- Verificar que jsPDF cargue desde CDN (revisar consola)
- Probar con entregas en la ruta

### Error 404 en rutas
**Solución:**
- Verificar que `vercel.json` esté en la raíz del proyecto
- Redeploy desde Vercel dashboard

---

## 📊 Monitoreo

### Analytics (Vercel)
- Dashboard → Analytics
- Ver visitantes, páginas vistas, performance

### Supabase Logs
- Dashboard → Database → Logs
- Ver queries ejecutadas en tiempo real

### Errores
- Vercel → Runtime Logs
- Ver errores de servidor/cliente

---

## 🔄 Actualizar Producción

```bash
# Hacer cambios en código
git add .
git commit -m "Descripción de cambios"
git push origin main

# Vercel detecta push y redeploy automáticamente
```

---

## ✅ Checklist Final

Antes de considerar el deploy completo:

- [ ] Supabase configurado con tablas
- [ ] Políticas RLS creadas
- [ ] Realtime habilitado
- [ ] `config.js` con credenciales correctas
- [ ] Git push exitoso
- [ ] Deploy en Vercel completado
- [ ] Vista cliente funciona
- [ ] Panel repartidor funciona
- [ ] Cambios de estado en tiempo real
- [ ] PDF se genera correctamente
- [ ] Probado en móvil

---

## 🎉 ¡Listo para Producción!

Tu app estará disponible 24/7 en:
- 🌐 **URL**: `https://tu-app.vercel.app`
- 📱 **PWA**: Instalable en móviles
- 🚀 **CDN Global**: Edge network de Vercel
- 🔒 **HTTPS**: SSL automático
- ⚡ **Performance**: Carga ultra rápida

---

**¿Necesitas ayuda?** Abre un issue en GitHub o contacta al equipo.
