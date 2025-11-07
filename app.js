// app.js - RutaFácil con Gestión Completa de Rutas v2
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
// Librería jsPDF para generación de PDFs
import jsPDF from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let cambiosPendientes = new Map();
let rutaActual = null;
let entregasActuales = [];

// ====================================
// FUNCIONES DE API SUPABASE
// ====================================

async function obtenerRutaActiva() {
  const { data, error } = await supabase
    .from('rutas')
    .select('*')
    .eq('estado', 'Activa')
    .order('fecha', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error al obtener ruta activa:', error);
    return null;
  }
  return data;
}

async function obtenerEntregasPorRuta(rutaId) {
  const { data, error } = await supabase
    .from('entregas')
    .select('*')
    .eq('ruta_id', rutaId)
    .order('orden', { ascending: true });

  if (error) {
    console.error('Error al obtener entregas:', error);
    return [];
  }
  return data;
}

async function crearNuevaRuta(repartidor) {
  const { data, error } = await supabase
    .from('rutas')
    .insert([{ repartidor, estado: 'Activa' }])
    .select()
    .single();

  if (error) {
    console.error('Error al crear ruta:', error);
    mostrarToast('Error al crear ruta', 'error');
    return null;
  }
  
  mostrarToast('Ruta creada exitosamente', 'success');
  return data;
}

async function completarRuta(rutaId) {
  const { error } = await supabase
    .from('rutas')
    .update({ estado: 'Completada' })
    .eq('id', rutaId);

  if (error) {
    console.error('Error al completar ruta:', error);
    mostrarToast('Error al completar ruta', 'error');
    return false;
  }
  
  mostrarToast('¡Ruta completada exitosamente!', 'success');
  return true;
}

// ====================================
// GENERACIÓN DE PDF - RESUMEN DEL DÍA
// ====================================

async function generarPDFResumen(ruta, entregas) {
  try {
    const doc = new jsPDF();
    
    // 📋 Encabezado del documento
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('RutaFácil', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('Resumen del Día', 105, 30, { align: 'center' });
    
    // 📅 Información de la ruta
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Información de la Ruta', 20, 55);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const fecha = new Date(ruta.fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    doc.text(`Repartidor: ${ruta.repartidor}`, 20, 65);
    doc.text(`Fecha: ${fecha}`, 20, 72);
    doc.text(`ID Ruta: #${ruta.id}`, 20, 79);
    
    // 📊 Estadísticas
    const stats = calcularEstadisticas(entregas);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Estadísticas del Día', 20, 95);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // Cajas de estadísticas
    const boxY = 105;
    const boxWidth = 40;
    const boxHeight = 20;
    
    // Total
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(20, boxY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(8);
    doc.text('Total', 40, boxY + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`${stats.total}`, 40, boxY + 17, { align: 'center' });
    
    // Pendientes
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(65, boxY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Pendientes', 85, boxY + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`${stats.pendientes}`, 85, boxY + 17, { align: 'center' });
    
    // En Camino
    doc.setFillColor(219, 234, 254);
    doc.roundedRect(110, boxY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('En Camino', 130, boxY + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`${stats.enCamino}`, 130, boxY + 17, { align: 'center' });
    
    // Entregados
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(155, boxY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(21, 128, 61);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Entregados', 175, boxY + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`${stats.entregados}`, 175, boxY + 17, { align: 'center' });
    
    // Intentos
    if (stats.intentos > 0) {
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(20, boxY + 25, boxWidth, boxHeight, 3, 3, 'F');
      doc.setTextColor(153, 27, 27);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text('Intentos', 40, boxY + 33, { align: 'center' });
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(`${stats.intentos}`, 40, boxY + 42, { align: 'center' });
    }
    
    // 📦 Detalle de entregas
    let currentY = 155;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Detalle de Entregas', 20, currentY);
    
    currentY += 10;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    entregas.forEach((entrega, index) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      
      // Estado con color
      let estadoColor = [156, 163, 175]; // Gris por defecto
      let estadoTexto = entrega.estado;
      
      if (entrega.estado === 'Pendiente') {
        estadoColor = [245, 158, 11]; // Amarillo
      } else if (entrega.estado === 'En camino') {
        estadoColor = [59, 130, 246]; // Azul
      } else if (entrega.estado === 'Entregado') {
        estadoColor = [16, 185, 129]; // Verde
      } else if (entrega.estado === 'Intento de Entrega') {
        estadoColor = [239, 68, 68]; // Rojo
        estadoTexto = 'Intento';
      }
      
      // Línea de separación
      if (index > 0) {
        doc.setDrawColor(229, 231, 235);
        doc.line(20, currentY - 3, 190, currentY - 3);
      }
      
      // Orden
      doc.setFont(undefined, 'bold');
      doc.text(`#${entrega.orden}`, 20, currentY);
      
      // Cliente
      doc.setFont(undefined, 'normal');
      doc.text(`${entrega.cliente}`, 35, currentY);
      
      // Estado con badge
      doc.setFillColor(...estadoColor);
      doc.roundedRect(150, currentY - 4, 35, 6, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text(estadoTexto, 167, currentY, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      
      currentY += 10;
    });
    
    // 📄 Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Página ${i} de ${pageCount} | Generado el ${new Date().toLocaleString('es-ES')}`,
        105,
        290,
        { align: 'center' }
      );
    }
    
    // 💾 Guardar PDF
    const nombreArchivo = `RutaFacil_${ruta.repartidor.replace(/\s+/g, '_')}_${new Date(ruta.fecha).toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);
    
    mostrarToast('PDF generado exitosamente', 'success');
    return true;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    mostrarToast('Error al generar PDF', 'error');
    return false;
  }
}

function calcularEstadisticas(entregas) {
  return {
    total: entregas.length,
    pendientes: entregas.filter(e => e.estado === 'Pendiente').length,
    enCamino: entregas.filter(e => e.estado === 'En camino').length,
    entregados: entregas.filter(e => e.estado === 'Entregado').length,
    intentos: entregas.filter(e => e.estado === 'Intento de Entrega').length
  };
}

async function agregarEntrega(rutaId, cliente, orden) {
  const { error } = await supabase
    .from('entregas')
    .insert([{ ruta_id: rutaId, cliente, orden, estado: 'Pendiente' }]);

  if (error) {
    console.error('Error al agregar entrega:', error);
    mostrarToast('Error al agregar entrega', 'error');
    return false;
  }
  
  mostrarToast('Entrega agregada exitosamente', 'success');
  return true;
}

async function eliminarEntrega(entregaId) {
  const { error } = await supabase
    .from('entregas')
    .delete()
    .eq('id', entregaId);

  if (error) {
    console.error('Error al eliminar entrega:', error);
    mostrarToast('Error al eliminar entrega', 'error');
    return false;
  }
  
  mostrarToast('Entrega eliminada', 'success');
  return true;
}

async function actualizarEstadoEntrega(id, nuevoEstado) {
  const { error } = await supabase
    .from('entregas')
    .update({ estado: nuevoEstado })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar estado:', error);
    mostrarToast('Error al actualizar estado', 'error');
    return false;
  }
  
  mostrarToast(`Estado actualizado a: ${nuevoEstado}`, 'success');
  return true;
}

// ====================================
// VISTA CLIENTE (index.html)
// ====================================

function actualizarVistaCliente(entregas) {
  const timeline = document.querySelector('#entregas-timeline');
  if (!timeline) return;

  timeline.innerHTML = '';

  if (entregas.length === 0) {
    timeline.innerHTML = '<div class="empty-state"><p>No hay entregas disponibles</p></div>';
    return;
  }

  entregas.forEach(entrega => {
    const estadoClass = entrega.estado.toLowerCase().replace(' ', '-');
    const isCompleted = entrega.estado === 'Entregado';
    const isActive = entrega.estado === 'En camino';
    const isIntento = entrega.estado === 'Intento de Entrega';
    
    let icon = '⏳';
    if (isCompleted) icon = '✅';
    else if (isActive) icon = '🚚';
    else if (isIntento) icon = '🔄';
    
    const itemClass = isCompleted ? 'completed' : isActive ? 'active' : isIntento ? 'intento' : '';
    
    const li = document.createElement('li');
    li.className = `timeline-item ${itemClass}`;
    li.innerHTML = `
      <div class="timeline-icon ${itemClass}">${icon}</div>
      <div class="timeline-content">
        <div class="timeline-title">Pedido ${entrega.orden} - ${entrega.cliente}</div>
        <div class="timeline-subtitle">
          <span class="timeline-status ${estadoClass}">${entrega.estado}</span>
        </div>
      </div>
    `;
    timeline.appendChild(li);
  });

  const entregadas = entregas.filter(e => e.estado === 'Entregado').length;
  const enCamino = entregas.filter(e => e.estado === 'En camino').length;
  const pendientes = entregas.filter(e => e.estado === 'Pendiente').length;
  const intentos = entregas.filter(e => e.estado === 'Intento de Entrega').length;
  
  let mensaje = '';
  let icon = '⏳';
  
  if (entregadas === entregas.length && entregas.length > 0) {
    mensaje = 'Todos los pedidos han sido entregados';
    icon = '✅';
  } else if (enCamino > 0) {
    mensaje = `${enCamino} pedido${enCamino > 1 ? 's' : ''} en camino`;
    icon = '🚚';
  } else if (intentos > 0) {
    mensaje = `${intentos} intento${intentos > 1 ? 's' : ''} de entrega pendiente${intentos > 1 ? 's' : ''}`;
    icon = '🔄';
  } else if (pendientes > 0) {
    mensaje = `${pendientes} pedido${pendientes > 1 ? 's' : ''} pendiente${pendientes > 1 ? 's' : ''}`;
    icon = '⏳';
  }
  
  const mensajeEl = document.querySelector('#estado-mensaje');
  if (mensajeEl) {
    mensajeEl.innerHTML = `
      <div class="status-icon">${icon}</div>
      <span>${mensaje}</span>
    `;
  }
}

// ====================================
// VISTA REPARTIDOR (repartidor.html)
// ====================================

function mostrarSinRutaActiva() {
  const header = document.getElementById('page-header');
  const content = document.getElementById('main-content');
  
  header.innerHTML = '';
  
  content.innerHTML = `
    <div class="no-ruta-activa">
      <div class="no-ruta-icon">📋</div>
      <h2 class="no-ruta-title">No hay ruta activa</h2>
      <p class="no-ruta-text">Comienza tu día creando una nueva ruta de entregas</p>
      <button class="btn-primary" onclick="abrirModal('modal-nueva-ruta')" style="display:inline-flex;">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Crear Nueva Ruta
      </button>
    </div>
  `;
  
  document.getElementById('btn-agregar-entrega').style.display = 'none';
  document.getElementById('btn-completar-ruta').style.display = 'none';
  document.getElementById('stats-bar').style.display = 'none';
}

function actualizarVistaRepartidor(ruta, entregas) {
  const header = document.getElementById('page-header');
  const content = document.getElementById('main-content');
  
  // Actualizar header
  const fecha = new Date(ruta.fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  header.innerHTML = `
    <div class="header-info">
      <h1>Panel de Control del Repartidor</h1>
      <p>Gestiona el estado de tus entregas en tiempo real</p>
    </div>
    <div class="ruta-info">
      <div class="ruta-titulo">Ruta Actual</div>
      <div class="ruta-nombre">${ruta.repartidor}</div>
      <div class="ruta-fecha">${fecha}</div>
    </div>
  `;
  
  // Mostrar botones
  document.getElementById('btn-agregar-entrega').style.display = 'flex';
  document.getElementById('btn-completar-ruta').style.display = 'flex';
  document.getElementById('stats-bar').style.display = 'flex';
  
  // Actualizar estadísticas
  actualizarEstadisticas(entregas);
  
  // Actualizar entregas
  const container = document.createElement('div');
  container.className = 'entregas-grid';
  
  if (entregas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <div class="empty-state-title">No hay entregas</div>
        <div class="empty-state-text">Agrega entregas a tu ruta para comenzar</div>
        <button class="btn-primary" onclick="abrirModal('modal-agregar-entrega')">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Agregar Primera Entrega
        </button>
      </div>
    `;
  } else {
    entregas.forEach(entrega => {
      const card = crearCardEntrega(entrega, entregas);
      container.appendChild(card);
    });
  }
  
  content.innerHTML = '';
  content.appendChild(container);
}

function crearCardEntrega(entrega, todasEntregas) {
  const estadoClass = entrega.estado.toLowerCase().replace(' ', '-');
  
  const iconPendiente = `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  const iconEnCamino = `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>`;
  const iconEntregado = `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  const iconIntento = `<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`;
  
  let estadoIcon = '⏳', estadoText = 'Pendiente';
  if (entrega.estado === 'En camino') {
    estadoIcon = '🚚';
    estadoText = 'En Camino';
  } else if (entrega.estado === 'Entregado') {
    estadoIcon = '✅';
    estadoText = 'Entregado';
  } else if (entrega.estado === 'Intento de Entrega') {
    estadoIcon = '🔄';
    estadoText = 'Intento de Entrega';
  }
  
  const tieneCambioPendiente = cambiosPendientes.has(entrega.id);
  const estadoPendiente = tieneCambioPendiente ? cambiosPendientes.get(entrega.id) : entrega.estado;
  
  const div = document.createElement('div');
  div.className = `entrega-card ${estadoClass}`;
  div.setAttribute('data-id', entrega.id);
  div.innerHTML = `
    <div class="card-header">
      <div>
        <div class="card-title">Pedido ${entrega.orden}</div>
        <div class="card-subtitle">${entrega.cliente}</div>
      </div>
      <span class="status-badge ${estadoClass}">
        ${estadoIcon} ${estadoText}
      </span>
    </div>
    
    <div class="card-actions">
      <div class="action-label">Cambiar estado a:</div>
      <div class="action-buttons">
        <button class="action-btn pendiente ${estadoPendiente === 'Pendiente' ? 'active' : ''}" 
                data-id="${entrega.id}" 
                data-estado="Pendiente">
          ${iconPendiente}
          Pendiente
        </button>
        <button class="action-btn en-camino ${estadoPendiente === 'En camino' ? 'active' : ''}" 
                data-id="${entrega.id}" 
                data-estado="En camino">
          ${iconEnCamino}
          En Camino
        </button>
        <button class="action-btn entregado ${estadoPendiente === 'Entregado' ? 'active' : ''}" 
                data-id="${entrega.id}" 
                data-estado="Entregado">
          ${iconEntregado}
          Entregado
        </button>
        <button class="action-btn intento ${estadoPendiente === 'Intento de Entrega' ? 'active' : ''}" 
                data-id="${entrega.id}" 
                data-estado="Intento de Entrega">
          ${iconIntento}
          Intento
        </button>
      </div>
      
      ${tieneCambioPendiente ? `
        <div class="confirm-section">
          <button class="btn-confirm btn-save" data-id="${entrega.id}">Guardar Cambios</button>
          <button class="btn-confirm btn-cancel" data-id="${entrega.id}">Cancelar</button>
        </div>
      ` : `
        <div class="confirm-section">
          <button class="btn-confirm btn-delete" data-id="${entrega.id}">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display:inline;margin-right:6px;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Eliminar Entrega
          </button>
        </div>
      `}
    </div>
  `;
  
  // Event listeners para botones de estado
  div.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const nuevoEstado = btn.dataset.estado;
      const estadoActual = todasEntregas.find(e => e.id === id)?.estado;
      
      if (nuevoEstado === estadoActual && !cambiosPendientes.has(id)) return;
      
      cambiosPendientes.set(id, nuevoEstado);
      actualizarVistaRepartidor(rutaActual, todasEntregas);
    });
  });
  
  // Event listeners para guardar/cancelar
  const btnSave = div.querySelector('.btn-save');
  if (btnSave) {
    btnSave.addEventListener('click', async () => {
      const id = parseInt(btnSave.dataset.id);
      const nuevoEstado = cambiosPendientes.get(id);
      
      if (nuevoEstado) {
        const exito = await actualizarEstadoEntrega(id, nuevoEstado);
        if (exito) {
          cambiosPendientes.delete(id);
        }
      }
    });
  }
  
  const btnCancel = div.querySelector('.btn-cancel');
  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      const id = parseInt(btnCancel.dataset.id);
      cambiosPendientes.delete(id);
      actualizarVistaRepartidor(rutaActual, todasEntregas);
    });
  }
  
  // Event listener para eliminar
  const btnDelete = div.querySelector('.btn-delete');
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      if (confirm('¿Estás seguro de eliminar esta entrega?')) {
        const id = parseInt(btnDelete.dataset.id);
        await eliminarEntrega(id);
      }
    });
  }
  
  return div;
}

function actualizarEstadisticas(entregas) {
  const total = entregas.length;
  const pendientes = entregas.filter(e => e.estado === 'Pendiente').length;
  const enCamino = entregas.filter(e => e.estado === 'En camino').length;
  const entregados = entregas.filter(e => e.estado === 'Entregado').length;
  const intentos = entregas.filter(e => e.estado === 'Intento de Entrega').length;
  
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-pendientes').textContent = pendientes;
  document.getElementById('stat-encamino').textContent = enCamino;
  document.getElementById('stat-entregados').textContent = entregados;
  
  // Mostrar/ocultar stat de intentos
  const statIntentosEl = document.getElementById('stat-intentos-container');
  if (statIntentosEl) {
    if (intentos > 0) {
      statIntentosEl.style.display = 'flex';
      document.getElementById('stat-intentos').textContent = intentos;
    } else {
      statIntentosEl.style.display = 'none';
    }
  }
}

// ====================================
// NOTIFICACIONES TOAST
// ====================================

function mostrarToast(mensaje, tipo = 'success') {
  const container = document.getElementById('toast-container') || document.body;
  
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `
    <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      ${tipo === 'success' 
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'}
    </svg>
    <span>${mensaje}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ====================================
// INICIALIZACIÓN
// ====================================

async function cargarDatosRepartidor() {
  rutaActual = await obtenerRutaActiva();
  
  if (!rutaActual) {
    mostrarSinRutaActiva();
    return;
  }
  
  entregasActuales = await obtenerEntregasPorRuta(rutaActual.id);
  actualizarVistaRepartidor(rutaActual, entregasActuales);
}

async function cargarDatosCliente() {
  const ruta = await obtenerRutaActiva();
  
  if (!ruta) {
    const timeline = document.querySelector('#entregas-timeline');
    if (timeline) {
      timeline.innerHTML = '<div class="empty-state"><p>No hay ruta activa en este momento</p></div>';
    }
    return;
  }
  
  const entregas = await obtenerEntregasPorRuta(ruta.id);
  actualizarVistaCliente(entregas);
}

async function initApp() {
  console.log('Inicializando RutaFácil (Gestión Completa de Rutas)...');

  const esVistaCliente = document.querySelector('#entregas-timeline') !== null;
  const esVistaRepartidor = document.querySelector('#page-header') !== null;

  if (esVistaCliente) {
    await cargarDatosCliente();
  } else if (esVistaRepartidor) {
    await cargarDatosRepartidor();
    
    // Event listeners para botones principales
    document.getElementById('btn-agregar-entrega').addEventListener('click', () => {
      document.getElementById('input-orden').value = entregasActuales.length + 1;
      abrirModal('modal-agregar-entrega');
    });
    
    document.getElementById('btn-completar-ruta').addEventListener('click', async () => {
      if (confirm('¿Deseas generar el PDF con el resumen del día antes de completar la ruta?')) {
        await generarPDFResumen(rutaActual, entregasActuales);
      }
      
      if (confirm('¿Estás seguro de completar esta ruta? No podrás modificarla después.')) {
        const exito = await completarRuta(rutaActual.id);
        if (exito) {
          setTimeout(() => location.reload(), 1500);
        }
      }
    });
    
    // Event listener: Crear nueva ruta
    document.getElementById('btn-crear-ruta-confirm').addEventListener('click', async () => {
      const repartidor = document.getElementById('input-repartidor').value.trim();
      if (!repartidor) {
        mostrarToast('Por favor ingresa el nombre del repartidor', 'error');
        return;
      }
      
      const nuevaRuta = await crearNuevaRuta(repartidor);
      if (nuevaRuta) {
        cerrarModal('modal-nueva-ruta');
        document.getElementById('input-repartidor').value = '';
        setTimeout(() => location.reload(), 1000);
      }
    });
    
    // Event listener: Agregar entrega
    document.getElementById('btn-agregar-entrega-confirm').addEventListener('click', async () => {
      const cliente = document.getElementById('input-cliente').value.trim();
      const orden = parseInt(document.getElementById('input-orden').value);
      
      if (!cliente || !orden) {
        mostrarToast('Por favor completa todos los campos', 'error');
        return;
      }
      
      const exito = await agregarEntrega(rutaActual.id, cliente, orden);
      if (exito) {
        cerrarModal('modal-agregar-entrega');
        document.getElementById('input-cliente').value = '';
      }
    });
  }

  // Suscribirse a cambios en tiempo real
  const channelRutas = supabase.channel('public:rutas')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rutas' }, async () => {
      console.log('Cambio en rutas detectado');
      if (esVistaRepartidor) {
        await cargarDatosRepartidor();
      } else if (esVistaCliente) {
        await cargarDatosCliente();
      }
    })
    .subscribe();
  
  const channelEntregas = supabase.channel('public:entregas')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'entregas' }, async (payload) => {
      console.log('Cambio en entregas detectado:', payload);
      
      if (payload.eventType === 'UPDATE') {
        cambiosPendientes.delete(payload.new.id);
      }
      
      if (esVistaRepartidor) {
        await cargarDatosRepartidor();
      } else if (esVistaCliente) {
        await cargarDatosCliente();
      }
    })
    .subscribe();

  console.log('Suscripción a cambios en tiempo real activada.');
}

document.addEventListener('DOMContentLoaded', initApp);