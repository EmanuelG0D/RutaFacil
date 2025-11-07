# RutaFácil v2.0 🚚

Sistema profesional de gestión y seguimiento de entregas en tiempo real.

## ✨ Características v2.0

- ⏳ 4 Estados de entrega (incluye "Intento de Entrega")
- 📄 Generación de PDF con resumen del día
- 🎨 Vista cliente con animaciones premium
- 📊 Dashboard en tiempo real
- 🔄 Sincronización automática con Supabase
- 📱 Diseño responsive

## 🚀 Deploy en Vercel

### Opción 1: Deploy Automático

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/EmanuelG0D/RutaFacil)

### Opción 2: Deploy Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## ⚙️ Configuración

1. **Crear proyecto en Supabase**
   - Ir a [supabase.com](https://supabase.com)
   - Crear nuevo proyecto
   - Copiar URL y anon key

2. **Ejecutar scripts SQL**
   - Abrir SQL Editor en Supabase
   - Ejecutar `schema-update.sql`
   - Ejecutar `schema-update-v2.sql`

3. **Configurar RLS Policies**
   ```sql
   -- Políticas para rutas
   CREATE POLICY "allow_anon_select_rutas" ON rutas FOR SELECT TO anon USING (true);
   CREATE POLICY "allow_anon_insert_rutas" ON rutas FOR INSERT TO anon WITH CHECK (true);
   CREATE POLICY "allow_anon_update_rutas" ON rutas FOR UPDATE TO anon USING (true);
   CREATE POLICY "allow_anon_delete_rutas" ON rutas FOR DELETE TO anon USING (true);

   -- Políticas para entregas
   CREATE POLICY "allow_anon_select_entregas" ON entregas FOR SELECT TO anon USING (true);
   CREATE POLICY "allow_anon_insert_entregas" ON entregas FOR INSERT TO anon WITH CHECK (true);
   CREATE POLICY "allow_anon_update_entregas" ON entregas FOR UPDATE TO anon USING (true);
   CREATE POLICY "allow_anon_delete_entregas" ON entregas FOR DELETE TO anon USING (true);
   ```

4. **Actualizar `config.js`**
   ```javascript
   const SUPABASE_URL = 'TU_URL_AQUI';
   const SUPABASE_ANON_KEY = 'TU_KEY_AQUI';
   ```

5. **Push a GitHub y Deploy**
   ```bash
   git add .
   git commit -m "Deploy RutaFacil v2.0"
   git push origin main
   ```

## 📦 Estructura

```
RutaFacil/
├── index.html              # Vista cliente (animada)
├── repartidor.html         # Panel repartidor
├── app.js                  # Lógica + PDF
├── config.js               # Credenciales Supabase
├── vercel.json             # Configuración Vercel
├── schema-update.sql       # BD inicial
├── schema-update-v2.sql    # Actualización v2
└── README.md               # Este archivo
```

## 🎯 Uso

### Cliente
- Visitar: `https://tu-app.vercel.app`
- Ver entregas en tiempo real

### Repartidor
- Visitar: `https://tu-app.vercel.app/repartidor`
- Crear rutas y gestionar entregas

## 🔒 Seguridad

- Variables de entorno en Vercel (opcional)
- Políticas RLS en Supabase
- Headers de seguridad configurados
- HTTPS por defecto

## 📱 Compatible con

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Móviles iOS y Android
- ✅ Tablets

## 🐛 Solución de Problemas

**No cargan datos:**
- Verificar credenciales en `config.js`
- Revisar políticas RLS en Supabase
- Comprobar consola del navegador (F12)

**PDF no funciona:**
- Verificar que jsPDF cargue desde CDN
- Revisar errores en consola

## 📄 Licencia

MIT License - Uso libre

---

**Desarrollado con ❤️ | v2.0 | 2025**
