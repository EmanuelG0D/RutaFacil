# 🚚 RutaFácil v2.0

Sistema profesional de gestión y seguimiento de entregas en tiempo real.

## ✨ Nuevas Características v2.0

### 🔄 **Estado: "Intento de Entrega"**
Nuevo estado para cuando no hay nadie en casa para recibir el pedido. Visible en dashboard con color rojo distintivo.

### 📄 **Generación de PDF con Resumen del Día**
Al completar la ruta, opción de generar PDF profesional con estadísticas completas, lista de entregas y branding corporativo.

### 🎨 **Vista Cliente Rediseñada**
- Fondo animado con gradiente púrpura y burbujas flotantes
- Cards glassmorphism con transparencia y blur
- Animaciones fluidas CSS (entrada progresiva, iconos animados)
- Hover effects profesionales en todos los elementos

## 📦 Estados de Entrega

- ⏳ **Pendiente** (amarillo)
- 🚚 **En Camino** (azul)
- ✅ **Entregado** (verde)
- 🔄 **Intento de Entrega** (rojo) ← NUEVO

## ⚙️ Configuración Rápida

1. Crear proyecto en Supabase
2. Ejecutar `schema-update.sql` y `schema-update-v2.sql`
3. Configurar políticas RLS (ver archivo completo)
4. Editar `config.js` con credenciales
5. Ejecutar: `python -m http.server 8000`
6. Abrir: http://localhost:8000

## 🎯 Características

✅ Gestión completa de rutas  
✅ 4 estados de entrega (nuevo: Intento)  
✅ Generación de PDF profesional  
✅ Realtime updates  
✅ Vista cliente animada  
✅ Dashboard con estadísticas  
✅ Sistema de confirmación  
✅ Diseño responsive  

Ver documentación completa en [RutaFacil_Docs_v2.md] para guía detallada.
