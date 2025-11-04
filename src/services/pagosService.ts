// src/services/pagosService.ts
/**
 * ⚠️ IMPORTANTE: Este servicio maneja SOLO HistorialPago (registros de pagos).
 * Los presupuestos digitales se manejan en presupuestosDigitalesService.ts
 * 
 * Base URL CORRECTA: /api/v1/tratamientos/historial-pagos/
 * (Antes estaba incorrectamente en /historial-clinico/)
 * 
 * Endpoints del backend implementados:
 * ✅ GET /historial-pagos/mis-pagos/
 * ✅ GET /historial-pagos/por-plan/{plan_id}/
 * ✅ POST /historial-pagos/{id}/anular/ (NUEVO)
 * ✅ GET /historial-pagos/estadisticas/ (NUEVO)
 * ✅ GET /historial-pagos/por-presupuesto/{presupuesto_id}/ (NUEVO)
 */

import { Api } from '../lib/Api';
import type { HistorialPago, HistorialPagoCreate } from '../interfaces/HistorialPago';

/**
 * Headers comunes con autenticación
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

// ========================================
// ENDPOINTS CUSTOM DEL BACKEND
// ========================================

/**
 * Obtener mis pagos como paciente autenticado
 * Endpoint: GET /api/v1/tratamientos/historial-pagos/mis-pagos/
 * @returns Lista de mis pagos + estadísticas
 */
export const obtenerMisPagos = async (): Promise<{
  total_pagos: number;
  total_pagado: number;
  pagos: HistorialPago[];
}> => {
  try {
    const response = await Api.get(
      '/tratamientos/historial-pagos/mis-pagos/',
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener mis pagos:", error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener pagos de un plan de tratamiento específico
 * Endpoint: GET /api/v1/tratamientos/historial-pagos/por-plan/{plan_id}/
 * @param planId ID del plan de tratamiento
 * @returns Resumen completo de pagos del plan
 */
export const obtenerPagosPorPlan = async (planId: number): Promise<{
  plan_tratamiento: {
    id: number;
    codigo: string;
    descripcion: string;
    estado: string;
  };
  presupuesto: {
    id: number | null;
    codigo: string | null;
    total: number;
  };
  resumen_pagos: {
    total_presupuesto: number;
    total_pagado: number;
    saldo_pendiente: number;
    cantidad_pagos: number;
  };
  pagos: HistorialPago[];
}> => {
  try {
    const response = await Api.get(
      `/tratamientos/historial-pagos/por-plan/${planId}/`,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener pagos del plan:", error);
    throw error.response?.data || error;
  }
};

/**
 * 🆕 Anular un pago (solo staff)
 * Endpoint: POST /api/v1/tratamientos/historial-pagos/{id}/anular/
 * @param id ID del pago
 * @param motivo Motivo de anulación
 * @returns Pago anulado
 */
export const anularPago = async (
  id: number,
  motivo: string
): Promise<{
  mensaje: string;
  pago: HistorialPago;
}> => {
  try {
    const response = await Api.post(
      `/tratamientos/historial-pagos/${id}/anular/`,
      { motivo },
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al anular pago:", error);
    throw error.response?.data || error;
  }
};

/**
 * 🆕 Obtener estadísticas generales de pagos (solo staff)
 * Endpoint: GET /api/v1/tratamientos/historial-pagos/estadisticas/
 * @returns Estadísticas por estado, método de pago, totales
 */
export const obtenerEstadisticasPagos = async (): Promise<{
  total_completado: number;
  cantidad_total: number;
  por_estado: Array<{
    estado: string;
    cantidad: number;
    total: number;
  }>;
  por_metodo_pago: Array<{
    metodo_pago: string;
    cantidad: number;
    total: number;
  }>;
}> => {
  try {
    const response = await Api.get(
      '/tratamientos/historial-pagos/estadisticas/',
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener estadísticas:", error);
    throw error.response?.data || error;
  }
};

/**
 * 🆕 Obtener pagos de un presupuesto específico
 * Endpoint: GET /api/v1/tratamientos/historial-pagos/por-presupuesto/{presupuesto_id}/
 * @param presupuestoId ID del presupuesto digital
 * @returns Pagos asociados al presupuesto
 */
export const obtenerPagosPorPresupuesto = async (
  presupuestoId: number
): Promise<{
  presupuesto: {
    id: number;
    codigo: string;
    total: number;
    estado: string;
  };
  total_pagado: number;
  saldo_pendiente: number;
  pagos: HistorialPago[];
}> => {
  try {
    const response = await Api.get(
      `/tratamientos/historial-pagos/por-presupuesto/${presupuestoId}/`,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener pagos del presupuesto:", error);
    throw error.response?.data || error;
  }
};

// ========================================
// CRUD BÁSICO (desde model ViewSet standard)
// ========================================

/**
 * Obtener todos los pagos (con filtros opcionales)
 * Endpoint: GET /api/v1/tratamientos/historial-pagos/
 * @param filters Filtros: plan_tratamiento, metodo_pago, estado, fecha_desde, fecha_hasta
 * @returns Lista de pagos
 */
export const obtenerPagos = async (
  filters?: Record<string, any>
): Promise<HistorialPago[]> => {
  try {
    const response = await Api.get<HistorialPago[]>(
      '/tratamientos/historial-pagos/',
      {
        params: filters,
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener pagos:", error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener detalle de un pago
 * Endpoint: GET /api/v1/tratamientos/historial-pagos/{id}/
 * @param id ID del pago
 * @returns Detalle del pago
 */
export const obtenerPago = async (id: number): Promise<HistorialPago> => {
  try {
    const response = await Api.get<HistorialPago>(
      `/tratamientos/historial-pagos/${id}/`,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener pago:", error);
    throw error.response?.data || error;
  }
};

/**
 * Registrar nuevo pago
 * Endpoint: POST /api/v1/tratamientos/historial-pagos/
 * @param data Datos del pago
 * @returns Pago creado con mensaje
 */
export const registrarPago = async (
  data: HistorialPagoCreate
): Promise<{
  mensaje: string;
  pago: HistorialPago;
  saldo_restante: number;
}> => {
  try {
    const response = await Api.post(
      '/tratamientos/historial-pagos/',
      data,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al registrar pago:", error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar un pago existente
 * Endpoint: PATCH /api/v1/tratamientos/historial-pagos/{id}/
 * @param id ID del pago
 * @param data Datos a actualizar
 * @returns Pago actualizado
 */
export const actualizarPago = async (
  id: number,
  data: Partial<HistorialPagoCreate>
): Promise<HistorialPago> => {
  try {
    const response = await Api.patch<HistorialPago>(
      `/tratamientos/historial-pagos/${id}/`,
      data,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al actualizar pago:", error);
    throw error.response?.data || error;
  }
};

/**
 * Eliminar un pago
 * Endpoint: DELETE /api/v1/tratamientos/historial-pagos/{id}/
 * @param id ID del pago
 */
export const eliminarPago = async (id: number): Promise<void> => {
  try {
    await Api.delete(
      `/tratamientos/historial-pagos/${id}/`,
      { headers: getHeaders() }
    );
  } catch (error: any) {
    console.error("Error al eliminar pago:", error);
    throw error.response?.data || error;
  }
};

// ========================================
// UTILIDADES
// ========================================

/**
 * Formatear monto en bolivianos
 */
export const formatearMonto = (monto: number): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(monto);
};

/**
 * Calcular porcentaje pagado
 */
export const calcularPorcentajePagado = (pagado: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((pagado / total) * 100);
};

/**
 * Validar estado de pago
 */
export const esEstadoValido = (estado: string): boolean => {
  const estadosValidos = ['pendiente', 'completado', 'cancelado', 'reembolsado'];
  return estadosValidos.includes(estado.toLowerCase());
};

/**
 * Obtener color según estado de pago
 */
export const obtenerColorEstado = (estado: string): string => {
  const colores: Record<string, string> = {
    completado: 'green',
    pendiente: 'yellow',
    cancelado: 'red',
    reembolsado: 'orange',
  };
  return colores[estado.toLowerCase()] || 'gray';
};

// ========================================
// ALIAS para retrocompatibilidad
// ========================================
export const obtenerPagosPlan = obtenerPagosPorPlan; // ✅ Alias

// ========================================
// STUBS para presupuestos (deberían estar en presupuestosDigitalesService.ts)
// ========================================
export const obtenerMisPresupuestos = async (): Promise<any[]> => {
  console.warn('⚠️ obtenerMisPresupuestos debería estar en presupuestosDigitalesService.ts');
  return [];
};

export const aprobarPresupuesto = async (id: number, datos: any): Promise<any> => {
  console.warn('⚠️ aprobarPresupuesto debería estar en presupuestosDigitalesService.ts');
  return {};
};

export const rechazarPresupuesto = async (id: number, motivo: string): Promise<any> => {
  console.warn('⚠️ rechazarPresupuesto debería estar en presupuestosDigitalesService.ts');
  return {};
};

// Exportar todo el servicio
export default {
  // Endpoints custom del backend
  obtenerMisPagos,
  obtenerPagosPorPlan,
  obtenerPagosPlan, // ✅ Alias
  anularPago,
  obtenerEstadisticasPagos,
  obtenerPagosPorPresupuesto,
  
  // Stubs para presupuestos
  obtenerMisPresupuestos,
  aprobarPresupuesto,
  rechazarPresupuesto,
  
  // CRUD básico
  obtenerPagos,
  obtenerPago,
  registrarPago,
  actualizarPago,
  eliminarPago,
  
  // Utilidades
  formatearMonto,
  calcularPorcentajePagado,
  esEstadoValido,
  obtenerColorEstado,
};
