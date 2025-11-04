import { Api } from "../lib/Api";

/**
 * Servicio para gestionar Procedimientos del Plan de Tratamiento
 * Base URL: /api/v1/tratamientos/procedimientos/
 */

/**
 * Headers comunes para todas las peticiones
 */
const getHeaders = () => {
  const token = localStorage.getItem("authToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  return headers;
};

/**
 * Obtener progreso de un procedimiento/ítem individual
 * GET /api/v1/tratamientos/procedimientos/{id}/progreso/
 * 
 * @param itemId - ID del procedimiento
 * @returns Progreso detallado del ítem (sesiones completadas, porcentaje, fechas)
 */
export const obtenerProgresoItem = async (itemId: number) => {
  try {
    const response = await Api.get(
      `/tratamientos/procedimientos/${itemId}/progreso/`,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener progreso del ítem:", error);
    throw error.response?.data || error;
  }
};

/**
 * Marcar procedimiento como completado
 * POST /api/v1/tratamientos/procedimientos/{id}/completar/
 * 
 * @param itemId - ID del procedimiento
 * @param datos - Observaciones y costo real opcional
 * @returns Item actualizado con estado 'completado'
 */
export const marcarItemCompletado = async (
  itemId: number,
  datos: { observaciones: string; costo_real?: number }
) => {
  try {
    const response = await Api.post(
      `/tratamientos/procedimientos/${itemId}/completar/`,
      datos,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al marcar ítem como completado:", error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener procedimientos planificados para hoy
 * GET /api/v1/tratamientos/procedimientos/hoy/
 * 
 * @returns Lista de procedimientos del día
 */
export const obtenerProcedimientosHoy = async () => {
  try {
    const response = await Api.get(
      '/tratamientos/procedimientos/hoy/',
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener procedimientos de hoy:", error);
    throw error.response?.data || error;
  }
};

/**
 * Marcar procedimiento como completado (versión alternativa con más datos)
 * POST /api/v1/tratamientos/procedimientos/{id}/marcar-completado/
 * 
 * @param id - ID del procedimiento
 * @param datos - Datos completos del procedimiento realizado
 * @returns Procedimiento actualizado
 */
export const marcarProcedimientoCompletado = async (
  id: number,
  datos: {
    costo_real?: number;
    notas?: string;
    complicaciones?: string;
    duracion_minutos?: number;
  }
) => {
  try {
    const response = await Api.post(
      `/tratamientos/procedimientos/${id}/marcar-completado/`,
      datos,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al marcar procedimiento completado:", error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener procedimientos pendientes
 * GET /api/v1/tratamientos/procedimientos/pendientes/
 * 
 * @returns Lista de procedimientos pendientes
 */
export const obtenerProcedimientosPendientes = async () => {
  try {
    const response = await Api.get(
      '/tratamientos/procedimientos/pendientes/',
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener procedimientos pendientes:", error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener procedimientos de un plan específico
 * GET /api/v1/tratamientos/procedimientos/por-plan/?plan_id={planId}
 * 
 * @param planId - ID del plan de tratamiento
 * @returns Lista de procedimientos del plan
 */
export const obtenerProcedimientosPorPlan = async (planId: number) => {
  try {
    const response = await Api.get(
      `/tratamientos/procedimientos/por-plan/?plan_id=${planId}`,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener procedimientos por plan:", error);
    throw error.response?.data || error;
  }
};

// Exportar todo como objeto por si se prefiere esa forma de importación
export default {
  obtenerProgresoItem,
  marcarItemCompletado,
  obtenerProcedimientosHoy,
  marcarProcedimientoCompletado,
  obtenerProcedimientosPendientes,
  obtenerProcedimientosPorPlan,
};
