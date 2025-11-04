import { Api } from "../lib/Api";
import type {
  PlanTratamiento,
  PlanTratamientoDetalle,
  RespuestaPaginadaPlan,
  CrearPlanTratamientoDTO,
  ActualizarPlanTratamientoDTO,
  CrearItemPlanDTO,
  ActualizarItemPlanDTO,
  RespuestaAprobarPlan,
  RespuestaItemAction,
  RespuestaTotales,
  FiltrosPlanesTratamiento,
  ValidacionAprobacion,
} from "../interfaces/PlanTratamiento";

/**
 * Servicio para gestionar Planes de Tratamiento dentales
 * 
 * Base URL: /api/v1/tratamientos/planes-tratamiento/
 * 
 * Funcionalidades implementadas (SP3-T001):
 * - Crear plan seleccionando paciente y profesional
 * - Agregar/editar/eliminar ítems con pieza, procedimiento, tiempo/costo
 * - Validar consistencia y totales (auto-cálculo)
 * - Workflow borrador→aprobado (inmutabilidad)
 * - Ítems activos/cancelados (impacto en total)
 */

// ========================================
// CRUD de Planes de Tratamiento
// ========================================

/**
 * Obtiene el listado de planes de tratamiento con filtros y paginación
 * @param filtros - Filtros opcionales para la búsqueda
 * @returns Promise con la respuesta paginada de planes
 */
export async function obtenerPlanesTratamiento(
  filtros?: FiltrosPlanesTratamiento
): Promise<RespuestaPaginadaPlan> {
  try {
    const response = await Api.get<RespuestaPaginadaPlan>(
      "/tratamientos/planes-tratamiento/",
      { params: filtros }
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener planes de tratamiento:", error);
    throw error;
  }
}

/**
 * Obtiene el detalle completo de un plan de tratamiento
 * @param id - ID del plan a consultar
 * @returns Promise con los datos completos del plan (incluye items)
 */
export async function obtenerPlanTratamiento(
  id: number
): Promise<PlanTratamientoDetalle> {
  try {
    const response = await Api.get<PlanTratamientoDetalle>(
      `/tratamientos/planes-tratamiento/${id}/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener plan de tratamiento ${id}:`, error);
    throw error;
  }
}

/**
 * Crea un nuevo plan de tratamiento (estado inicial: Borrador)
 * @param plan - Datos del nuevo plan (con items iniciales opcionales)
 * @returns Promise con el plan creado
 */
export async function crearPlanTratamiento(
  plan: CrearPlanTratamientoDTO
): Promise<PlanTratamiento> {
  try {
    const response = await Api.post<PlanTratamiento>(
      "/tratamientos/planes-tratamiento/",
      plan
    );
    return response.data;
  } catch (error) {
    console.error("Error al crear plan de tratamiento:", error);
    throw error;
  }
}

/**
 * Actualiza un plan de tratamiento (solo si está en estado Borrador)
 * @param id - ID del plan a actualizar
 * @param cambios - Campos a actualizar (notas, descuento, fecha_vigencia)
 * @returns Promise con el plan actualizado
 */
export async function actualizarPlanTratamiento(
  id: number,
  cambios: ActualizarPlanTratamientoDTO
): Promise<PlanTratamiento> {
  try {
    const response = await Api.patch<PlanTratamiento>(
      `/tratamientos/planes-tratamiento/${id}/`,
      cambios
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar plan de tratamiento ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina un plan de tratamiento (solo si está en estado Borrador)
 * @param id - ID del plan a eliminar
 * @returns Promise vacía
 */
export async function eliminarPlanTratamiento(id: number): Promise<void> {
  try {
    await Api.delete(`/tratamientos/planes-tratamiento/${id}/`);
  } catch (error) {
    console.error(`Error al eliminar plan de tratamiento ${id}:`, error);
    throw error;
  }
}

// ========================================
// Acciones de Plan
// ========================================

/**
 * Aprueba un plan de tratamiento (lo hace inmutable)
 * Solo puede ser ejecutado por el odontólogo asignado o admin
 * @param id - ID del plan a aprobar
 * @returns Promise con la respuesta de aprobación
 */
export async function aprobarPlanTratamiento(
  id: number
): Promise<RespuestaAprobarPlan> {
  try {
    const response = await Api.post<RespuestaAprobarPlan>(
      `/tratamientos/planes-tratamiento/${id}/aprobar/`,
      { confirmar: true }
    );
    return response.data;
  } catch (error) {
    console.error(`Error al aprobar plan de tratamiento ${id}:`, error);
    throw error;
  }
}

/**
 * Valida si un plan de tratamiento puede ser aprobado
 * Verifica estado, items activos y permisos de usuario
 * @param id - ID del plan a validar
 * @returns Promise con la validación detallada
 */
export async function validarAprobacionPlan(
  id: number
): Promise<ValidacionAprobacion> {
  try {
    const response = await Api.get<ValidacionAprobacion>(
      `/tratamientos/planes-tratamiento/${id}/validar-aprobacion/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al validar aprobación del plan ${id}:`, error);
    throw error;
  }
}

/**
 * Calcula manualmente los totales del plan (subtotal, descuento, total)
 * Normalmente se ejecuta automáticamente tras cambios en items
 * @param id - ID del plan
 * @returns Promise con los totales recalculados
 */
export async function calcularTotalesPlan(
  id: number
): Promise<RespuestaTotales> {
  try {
    const response = await Api.post<RespuestaTotales>(
      `/tratamientos/planes-tratamiento/${id}/calcular-totales/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al calcular totales del plan ${id}:`, error);
    throw error;
  }
}

// ========================================
// Gestión de Items del Plan
// ========================================

/**
 * Agrega un nuevo ítem al plan de tratamiento
 * @param planId - ID del plan
 * @param item - Datos del nuevo ítem
 * @returns Promise con el ítem creado y totales actualizados
 */
export async function agregarItemPlan(
  planId: number,
  item: CrearItemPlanDTO
): Promise<RespuestaItemAction> {
  try {
    const response = await Api.post<RespuestaItemAction>(
      `/tratamientos/planes-tratamiento/${planId}/agregar-item/`,
      item
    );
    return response.data;
  } catch (error) {
    console.error(`Error al agregar ítem al plan ${planId}:`, error);
    throw error;
  }
}

/**
 * Edita un ítem existente del plan (solo en planes borradores)
 * @param planId - ID del plan
 * @param itemId - ID del ítem a editar
 * @param cambios - Campos a actualizar
 * @returns Promise con el ítem actualizado
 */
export async function editarItemPlan(
  planId: number,
  itemId: number,
  cambios: ActualizarItemPlanDTO
): Promise<RespuestaItemAction> {
  try {
    const response = await Api.patch<RespuestaItemAction>(
      `/tratamientos/planes-tratamiento/${planId}/items/${itemId}/`,
      cambios
    );
    return response.data;
  } catch (error) {
    console.error(`Error al editar ítem ${itemId} del plan ${planId}:`, error);
    throw error;
  }
}

/**
 * Elimina un ítem del plan (solo en planes borradores)
 * @param planId - ID del plan
 * @param itemId - ID del ítem a eliminar
 * @returns Promise con los totales recalculados
 */
export async function eliminarItemPlan(
  planId: number,
  itemId: number
): Promise<RespuestaItemAction> {
  try {
    const response = await Api.delete<RespuestaItemAction>(
      `/tratamientos/planes-tratamiento/${planId}/items/${itemId}/eliminar/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar ítem ${itemId} del plan ${planId}:`, error);
    throw error;
  }
}

/**
 * Activa un ítem del plan (lo incluye en el total y habilita para agenda)
 * @param planId - ID del plan
 * @param itemId - ID del ítem a activar
 * @returns Promise con el ítem activado
 */
export async function activarItemPlan(
  planId: number,
  itemId: number
): Promise<RespuestaItemAction> {
  try {
    const response = await Api.post<RespuestaItemAction>(
      `/tratamientos/planes-tratamiento/${planId}/items/${itemId}/activar/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al activar ítem ${itemId} del plan ${planId}:`, error);
    throw error;
  }
}

/**
 * Cancela un ítem del plan (lo excluye del total y NO habilita agenda)
 * ⭐ Items cancelados NO impactan el total del plan
 * @param planId - ID del plan
 * @param itemId - ID del ítem a cancelar
 * @returns Promise con el ítem cancelado y totales recalculados
 */
export async function cancelarItemPlan(
  planId: number,
  itemId: number
): Promise<RespuestaItemAction> {
  try {
    const response = await Api.post<RespuestaItemAction>(
      `/tratamientos/planes-tratamiento/${planId}/items/${itemId}/cancelar/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al cancelar ítem ${itemId} del plan ${planId}:`, error);
    throw error;
  }
}

/**
 * Completa un ítem del plan (marca como realizado)
 * @param planId - ID del plan
 * @param itemId - ID del ítem a completar
 * @returns Promise con el ítem completado
 */
export async function completarItemPlan(
  planId: number,
  itemId: number
): Promise<RespuestaItemAction> {
  try {
    const response = await Api.post<RespuestaItemAction>(
      `/tratamientos/planes-tratamiento/${planId}/items/${itemId}/completar/`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error(`Error al completar ítem ${itemId} del plan ${planId}:`, error);
    throw error;
  }
}

// ========================================
// Helpers
// ========================================

/**
 * Formatea el monto en formato moneda
 * @param monto - Monto a formatear
 * @returns String formateado (ej: "$1,500.00")
 */
export function formatearMonto(monto: string | number): string {
  const numero = typeof monto === 'string' ? parseFloat(monto) : monto;
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  }).format(numero);
}

/**
 * Obtiene el color de badge según el estado del plan
 * @param estado - Estado del plan
 * @returns Clases de Tailwind para el badge
 */
export function getEstadoPlanColor(estado: string): string {
  const colores: Record<string, string> = {
    Borrador: 'bg-yellow-100 text-yellow-800',
    Aprobado: 'bg-green-100 text-green-800',
    Cancelado: 'bg-red-100 text-red-800',
  };
  return colores[estado] || 'bg-gray-100 text-gray-800';
}

/**
 * Obtiene el color de badge según el estado del item
 * @param estado - Estado del item
 * @returns Clases de Tailwind para el badge
 */
export function getEstadoItemColor(estado: string): string {
  const colores: Record<string, string> = {
    Pendiente: 'bg-blue-100 text-blue-800',
    Activo: 'bg-green-100 text-green-800',
    Cancelado: 'bg-red-100 text-red-800',
    Completado: 'bg-purple-100 text-purple-800',
  };
  return colores[estado] || 'bg-gray-100 text-gray-800';
}

// ========================================
// ✅ NUEVO: Progreso Detallado del Plan
// ========================================

/**
 * Obtiene el progreso detallado del plan de tratamiento
 * GET /api/v1/tratamientos/planes-tratamiento/{id}/progreso-detallado/
 * 
 * Retorna información completa sobre el avance del plan:
 * - Total de ítems y su distribución por estado
 * - Porcentaje global de completitud
 * - Sesiones totales vs realizadas
 * - Costos estimados vs ejecutados
 * - Detalle de progreso por cada ítem
 * 
 * @param id - ID del plan de tratamiento
 * @returns Promise con el progreso detallado
 */
export async function obtenerProgresoPlan(id: number) {
  try {
    const response = await Api.get(
      `/tratamientos/planes-tratamiento/${id}/progreso-detallado/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener progreso del plan ${id}:`, error);
    throw error;
  }
}

// ========================================
// 🆕 PROCEDIMIENTOS Y SESIONES - ENDPOINTS FALTANTES
// ========================================

/**
 * Listar procedimientos de un plan de tratamiento
 * GET /api/v1/tratamientos/procedimientos/?plan_tratamiento={id}
 * 
 * Flujo E2E: Sesión 2, paso 2.12h
 * 
 * @param planTratamientoId - ID del plan de tratamiento
 * @returns Promise con lista de procedimientos
 */
export async function obtenerProcedimientosPlan(planTratamientoId: number): Promise<any[]> {
  try {
    console.log(`📋 Obteniendo procedimientos del plan ${planTratamientoId}`);
    const response = await Api.get('/tratamientos/procedimientos/', {
      params: { plan_tratamiento: planTratamientoId }
    });
    
    console.log(`✅ Procedimientos obtenidos: ${response.data.length || response.data.results?.length || 0}`);
    return response.data.results || response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener procedimientos del plan ${planTratamientoId}:`, error);
    throw error.response?.data || error;
  }
}

/**
 * Crear procedimiento en un plan de tratamiento
 * POST /api/v1/tratamientos/procedimientos/
 * 
 * Flujo E2E: Sesión 2, paso 2.12i
 * 
 * @param data - Datos del procedimiento
 * @returns Promise con el procedimiento creado
 */
export async function crearProcedimiento(data: {
  plan_tratamiento: number;
  servicio: number;
  odontologo: number;
  numero_diente?: number;
  descripcion: string;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  fecha_planificada?: string;
  duracion_minutos?: number;
  costo_estimado: number;
  costo_real?: number;
  notas?: string;
}): Promise<any> {
  try {
    console.log('🦷 Creando procedimiento:', data);
    const response = await Api.post('/tratamientos/procedimientos/', data);
    
    console.log('✅ Procedimiento creado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al crear procedimiento:', error);
    throw error.response?.data || error;
  }
}

/**
 * Listar sesiones de tratamiento de un plan
 * GET /api/v1/tratamientos/sesiones-tratamiento/?plan_tratamiento={id}
 * 
 * Flujo E2E: Sesión 2, paso 2.12j
 * 
 * @param planTratamientoId - ID del plan de tratamiento
 * @returns Promise con lista de sesiones
 */
export async function obtenerSesionesTratamiento(planTratamientoId: number): Promise<any[]> {
  try {
    console.log(`📅 Obteniendo sesiones del plan ${planTratamientoId}`);
    const response = await Api.get('/tratamientos/sesiones-tratamiento/', {
      params: { plan_tratamiento: planTratamientoId }
    });
    
    console.log(`✅ Sesiones obtenidas: ${response.data.length || response.data.results?.length || 0}`);
    return response.data.results || response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener sesiones del plan ${planTratamientoId}:`, error);
    throw error.response?.data || error;
  }
}








