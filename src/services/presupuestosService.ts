/**
 * 💰 SERVICIO DE PRESUPUESTOS
 * 
 * Integración completa con el backend para gestión de presupuestos
 * Backend: /api/v1/tratamientos/presupuestos/
 * 
 * Endpoints implementados:
 * - GET    /tratamientos/presupuestos/                    (Listar todos)
 * - GET    /tratamientos/presupuestos/{id}/               (Ver detalle)
 * - GET    /tratamientos/presupuestos/mis-presupuestos/   (Paciente)
 * - POST   /tratamientos/presupuestos/                    (Crear)
 * - PUT    /tratamientos/presupuestos/{id}/               (Actualizar completo)
 * - PATCH  /tratamientos/presupuestos/{id}/               (Actualizar parcial)
 * - DELETE /tratamientos/presupuestos/{id}/               (Eliminar)
 * - POST   /tratamientos/presupuestos/{id}/aprobar/       (Aprobar - Paciente)
 * - POST   /tratamientos/presupuestos/{id}/rechazar/      (Rechazar - Paciente)
 */

import { Api } from '../lib/Api';

// ==================== INTERFACES ====================

export interface ItemPresupuesto {
  id?: number;
  servicio: number;
  cantidad: number;
  precio_unitario: number;
  numero_diente?: number;
  descripcion?: string;
  // Campos expandidos (vienen del backend)
  servicio_nombre?: string;
  subtotal?: number;
}

export interface Presupuesto {
  id: number;
  plan_tratamiento: number;
  fecha_creacion: string;
  fecha_aprobacion?: string | null;
  fecha_rechazo?: string | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  subtotal: number;
  descuento: number;
  total: number;
  notas?: string;
  aprobado_por?: string | null;
  motivo_rechazo?: string | null;
  vigencia_dias?: number;
  fecha_vencimiento?: string;
  
  // Campos expandidos
  paciente_nombre?: string;
  paciente_apellido?: string;
  odontologo_nombre?: string;
  items?: ItemPresupuesto[];
}

export interface CrearPresupuestoDTO {
  plan_tratamiento: number;
  items: {
    servicio: number;
    cantidad: number;
    precio_unitario: number;
    numero_diente?: number;
    descripcion?: string;
  }[];
  descuento?: number;
  notas?: string;
  vigencia_dias?: number;
}

export interface ActualizarPresupuestoDTO {
  items?: {
    servicio: number;
    cantidad: number;
    precio_unitario: number;
    numero_diente?: number;
    descripcion?: string;
  }[];
  descuento?: number;
  notas?: string;
  vigencia_dias?: number;
}

export interface AprobarPresupuestoDTO {
  aprobado_por?: string;
}

export interface RechazarPresupuestoDTO {
  motivo_rechazo: string;
}

export interface FiltrosPresupuestos {
  plan_tratamiento?: number;
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  paciente?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  page_size?: number;
}

export interface RespuestaPaginadaPresupuestos {
  count: number;
  next: string | null;
  previous: string | null;
  results: Presupuesto[];
}

// ==================== HELPERS ====================

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Token ${token}` }),
  };
};

// ==================== CRUD BÁSICO ====================

/**
 * Listar todos los presupuestos (con filtros opcionales)
 * GET /api/v1/tratamientos/presupuestos/
 */
export const listarPresupuestos = async (
  filtros?: FiltrosPresupuestos
): Promise<RespuestaPaginadaPresupuestos> => {
  try {
    const params = new URLSearchParams();
    
    if (filtros?.plan_tratamiento) params.append('plan_tratamiento', filtros.plan_tratamiento.toString());
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.paciente) params.append('paciente', filtros.paciente.toString());
    if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.page_size) params.append('page_size', filtros.page_size.toString());

    const queryString = params.toString();
    const url = `/tratamientos/presupuestos/${queryString ? `?${queryString}` : ''}`;

    console.log('📋 Listando presupuestos:', url);
    const response = await Api.get(url, { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al listar presupuestos:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener detalle de un presupuesto específico
 * GET /api/v1/tratamientos/presupuestos/{id}/
 */
export const obtenerPresupuesto = async (id: number): Promise<Presupuesto> => {
  try {
    console.log(`📄 Obteniendo presupuesto ${id}`);
    const response = await Api.get(`/tratamientos/presupuestos/${id}/`, { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener presupuesto ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Crear un nuevo presupuesto
 * POST /api/v1/tratamientos/presupuestos/
 */
export const crearPresupuesto = async (data: CrearPresupuestoDTO): Promise<Presupuesto> => {
  try {
    console.log('✨ Creando presupuesto:', data);
    const response = await Api.post('/tratamientos/presupuestos/', data, { headers: getHeaders() });
    
    console.log('✅ Presupuesto creado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al crear presupuesto:', error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar un presupuesto completo
 * PUT /api/v1/tratamientos/presupuestos/{id}/
 */
export const actualizarPresupuesto = async (
  id: number,
  data: ActualizarPresupuestoDTO
): Promise<Presupuesto> => {
  try {
    console.log(`🔄 Actualizando presupuesto ${id}:`, data);
    const response = await Api.put(`/tratamientos/presupuestos/${id}/`, data, { headers: getHeaders() });
    
    console.log('✅ Presupuesto actualizado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar presupuesto ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar parcialmente un presupuesto
 * PATCH /api/v1/tratamientos/presupuestos/{id}/
 */
export const actualizarParcialPresupuesto = async (
  id: number,
  data: Partial<ActualizarPresupuestoDTO>
): Promise<Presupuesto> => {
  try {
    console.log(`🔄 Actualizando parcialmente presupuesto ${id}:`, data);
    const response = await Api.patch(`/tratamientos/presupuestos/${id}/`, data, { headers: getHeaders() });
    
    console.log('✅ Presupuesto actualizado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar presupuesto ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Eliminar un presupuesto
 * DELETE /api/v1/tratamientos/presupuestos/{id}/
 */
export const eliminarPresupuesto = async (id: number): Promise<void> => {
  try {
    console.log(`🗑️ Eliminando presupuesto ${id}`);
    await Api.delete(`/tratamientos/presupuestos/${id}/`, { headers: getHeaders() });
    
    console.log('✅ Presupuesto eliminado');
  } catch (error: any) {
    console.error(`❌ Error al eliminar presupuesto ${id}:`, error);
    throw error.response?.data || error;
  }
};

// ==================== ENDPOINTS CUSTOM ====================

/**
 * Obtener presupuestos del paciente autenticado
 * GET /api/v1/tratamientos/presupuestos/mis-presupuestos/
 */
export const obtenerMisPresupuestos = async (): Promise<Presupuesto[]> => {
  try {
    console.log('📋 Obteniendo mis presupuestos (paciente)');
    const response = await Api.get('/tratamientos/presupuestos/mis-presupuestos/', { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al obtener mis presupuestos:', error);
    throw error.response?.data || error;
  }
};

/**
 * Aprobar un presupuesto (Paciente)
 * POST /api/v1/tratamientos/presupuestos/{id}/aprobar/
 */
export const aprobarPresupuesto = async (
  id: number,
  data?: AprobarPresupuestoDTO
): Promise<Presupuesto> => {
  try {
    console.log(`✅ Aprobando presupuesto ${id}`);
    const response = await Api.post(
      `/tratamientos/presupuestos/${id}/aprobar/`,
      data || {},
      { headers: getHeaders() }
    );
    
    console.log('🎉 Presupuesto aprobado exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al aprobar presupuesto ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Rechazar un presupuesto (Paciente)
 * POST /api/v1/tratamientos/presupuestos/{id}/rechazar/
 */
export const rechazarPresupuesto = async (
  id: number,
  data: RechazarPresupuestoDTO
): Promise<Presupuesto> => {
  try {
    console.log(`❌ Rechazando presupuesto ${id}:`, data.motivo_rechazo);
    const response = await Api.post(
      `/tratamientos/presupuestos/${id}/rechazar/`,
      data,
      { headers: getHeaders() }
    );
    
    console.log('✅ Presupuesto rechazado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al rechazar presupuesto ${id}:`, error);
    throw error.response?.data || error;
  }
};

// ==================== UTILIDADES ====================

/**
 * Calcular subtotal de items
 */
export const calcularSubtotal = (items: ItemPresupuesto[]): number => {
  return items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
};

/**
 * Calcular total con descuento
 */
export const calcularTotal = (subtotal: number, descuento: number): number => {
  return Math.max(0, subtotal - descuento);
};

/**
 * Verificar si presupuesto está vencido
 */
export const estaVencido = (presupuesto: Presupuesto): boolean => {
  if (!presupuesto.fecha_vencimiento) return false;
  
  const hoy = new Date();
  const vencimiento = new Date(presupuesto.fecha_vencimiento);
  return hoy > vencimiento;
};

/**
 * Obtener clase CSS según estado
 */
export const getEstadoClase = (estado: string): string => {
  switch (estado) {
    case 'aprobado':
      return 'bg-green-100 text-green-800';
    case 'rechazado':
      return 'bg-red-100 text-red-800';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Obtener texto de estado en español
 */
export const getEstadoTexto = (estado: string): string => {
  switch (estado) {
    case 'aprobado':
      return 'Aprobado';
    case 'rechazado':
      return 'Rechazado';
    case 'pendiente':
      return 'Pendiente';
    default:
      return estado;
  }
};

// ==================== EXPORT DEFAULT ====================

export default {
  // CRUD básico
  listarPresupuestos,
  obtenerPresupuesto,
  crearPresupuesto,
  actualizarPresupuesto,
  actualizarParcialPresupuesto,
  eliminarPresupuesto,
  
  // Endpoints custom
  obtenerMisPresupuestos,
  aprobarPresupuesto,
  rechazarPresupuesto,
  
  // Utilidades
  calcularSubtotal,
  calcularTotal,
  estaVencido,
  getEstadoClase,
  getEstadoTexto,
};
