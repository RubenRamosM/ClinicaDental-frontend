// src/services/reportesService.ts
/**
 * Servicio para endpoints de reportes y dashboards administrativos
 * 
 * Endpoints disponibles:
 * - GET /reportes/ - Dashboard general
 * - GET /reportes/financiero/ - Dashboard financiero
 * - GET /reportes/operaciones/ - Dashboard de operaciones
 * - GET /reportes/citas/ - Reporte de citas
 * - GET /reportes/tratamientos/ - Reporte de tratamientos
 * - GET /reportes/ingresos/ - Reporte de ingresos
 * - GET /reportes/pacientes/ - Reporte de pacientes con estadísticas 🆕
 */

import { Api } from '../lib/Api';

// ============================================
// INTERFACES
// ============================================

export interface EstadisticasPaciente {
  citas_totales: number;
  citas_periodo: number;
  planes_totales: number;
  planes_activos: number;
  ultima_cita: string | null;
}

export interface PacienteReporte {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string | null;
  estadisticas: EstadisticasPaciente;
}

export interface ReportePacientes {
  periodo: {
    inicio: string;
    fin: string;
  };
  total_pacientes: number;
  pacientes: PacienteReporte[];
}

export interface ReporteCitas {
  periodo: {
    inicio: string;
    fin: string;
  };
  total_citas: number;
  citas_completadas: number;
  citas_canceladas: number;
  citas_pendientes: number;
  citas_por_estado?: Array<{
    estado: string;
    cantidad: number;
  }>;
}

export interface ReporteTratamientos {
  periodo: {
    inicio: string;
    fin: string;
  };
  total_planes: number;
  planes_activos: number;
  planes_completados: number;
  planes_por_estado?: Array<{
    estado: string;
    cantidad: number;
  }>;
}

export interface ReporteIngresos {
  periodo: {
    inicio: string;
    fin: string;
  };
  total_ingresos: number;
  total_pagos: number;
  por_tipo_pago: Array<{
    tipo: string;
    total: number;
    cantidad: number;
  }>;
}

export interface DashboardGeneral {
  total_pacientes: number;
  total_citas_hoy: number;
  total_tratamientos_activos: number;
  ingresos_mes_actual: number;
  citas_pendientes: number;
  [key: string]: any;
}

export interface DashboardFinanciero {
  ingresos_totales: number;
  gastos_totales: number;
  balance: number;
  ingresos_por_mes: Array<{
    mes: string;
    total: number;
  }>;
  [key: string]: any;
}

export interface DashboardOperaciones {
  citas_completadas: number;
  citas_canceladas: number;
  tasa_asistencia: number;
  tratamientos_en_progreso: number;
  [key: string]: any;
}

// ============================================
// FUNCIONES DE SERVICIO
// ============================================

/**
 * Obtener reporte de pacientes con estadísticas
 * Endpoint: GET /api/v1/reportes/pacientes/
 * 
 * @param params Parámetros opcionales de filtrado
 * @returns Reporte completo de pacientes con estadísticas de citas y tratamientos
 */
export const obtenerReportePacientes = async (params?: {
  fecha_inicio?: string;
  fecha_fin?: string;
}): Promise<ReportePacientes> => {
  try {
    console.log('📊 [Reportes] Obteniendo reporte de pacientes...', params);
    
    const response = await Api.get<ReportePacientes>('/reportes/pacientes/', {
      params,
    });
    
    console.log('✅ [Reportes] Reporte de pacientes obtenido:', {
      total: response.data.total_pacientes,
      periodo: response.data.periodo,
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ [Reportes] Error obteniendo reporte de pacientes:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener reporte de citas por período
 * Endpoint: GET /api/v1/reportes/citas/
 * 
 * @param params Parámetros de filtrado
 * @returns Estadísticas de citas por estado
 */
export const obtenerReporteCitas = async (params?: {
  fecha_inicio?: string;
  fecha_fin?: string;
  odontologo?: number;
}): Promise<ReporteCitas> => {
  try {
    console.log('📊 [Reportes] Obteniendo reporte de citas...', params);
    
    const response = await Api.get<ReporteCitas>('/reportes/citas/', {
      params,
    });
    
    console.log('✅ [Reportes] Reporte de citas obtenido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [Reportes] Error obteniendo reporte de citas:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener reporte de tratamientos
 * Endpoint: GET /api/v1/reportes/tratamientos/
 * 
 * @param params Parámetros de filtrado
 * @returns Estadísticas de planes de tratamiento
 */
export const obtenerReporteTratamientos = async (params?: {
  fecha_inicio?: string;
  fecha_fin?: string;
}): Promise<ReporteTratamientos> => {
  try {
    console.log('📊 [Reportes] Obteniendo reporte de tratamientos...', params);
    
    const response = await Api.get<ReporteTratamientos>('/reportes/tratamientos/', {
      params,
    });
    
    console.log('✅ [Reportes] Reporte de tratamientos obtenido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [Reportes] Error obteniendo reporte de tratamientos:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener reporte de ingresos
 * Endpoint: GET /api/v1/reportes/ingresos/
 * 
 * @param params Parámetros de filtrado
 * @returns Estadísticas financieras y distribución por tipo de pago
 */
export const obtenerReporteIngresos = async (params?: {
  fecha_inicio?: string;
  fecha_fin?: string;
}): Promise<ReporteIngresos> => {
  try {
    console.log('📊 [Reportes] Obteniendo reporte de ingresos...', params);
    
    const response = await Api.get<ReporteIngresos>('/reportes/ingresos/', {
      params,
    });
    
    console.log('✅ [Reportes] Reporte de ingresos obtenido:', {
      total_ingresos: response.data.total_ingresos,
      total_pagos: response.data.total_pagos,
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ [Reportes] Error obteniendo reporte de ingresos:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener dashboard general
 * Endpoint: GET /api/v1/reportes/
 * 
 * @returns Dashboard con métricas generales del sistema
 */
export const obtenerDashboardGeneral = async (): Promise<DashboardGeneral> => {
  try {
    console.log('📊 [Reportes] Obteniendo dashboard general...');
    
    const response = await Api.get<DashboardGeneral>('/reportes/');
    
    console.log('✅ [Reportes] Dashboard general obtenido');
    return response.data;
  } catch (error: any) {
    console.error('❌ [Reportes] Error obteniendo dashboard general:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener dashboard financiero
 * Endpoint: GET /api/v1/reportes/financiero/
 * 
 * @returns Dashboard con métricas financieras
 */
export const obtenerDashboardFinanciero = async (): Promise<DashboardFinanciero> => {
  try {
    console.log('📊 [Reportes] Obteniendo dashboard financiero...');
    
    const response = await Api.get<DashboardFinanciero>('/reportes/financiero/');
    
    console.log('✅ [Reportes] Dashboard financiero obtenido');
    return response.data;
  } catch (error: any) {
    console.error('❌ [Reportes] Error obteniendo dashboard financiero:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener dashboard de operaciones
 * Endpoint: GET /api/v1/reportes/operaciones/
 * 
 * @returns Dashboard con métricas operacionales
 */
export const obtenerDashboardOperaciones = async (): Promise<DashboardOperaciones> => {
  try {
    console.log('📊 [Reportes] Obteniendo dashboard de operaciones...');
    
    const response = await Api.get<DashboardOperaciones>('/reportes/operaciones/');
    
    console.log('✅ [Reportes] Dashboard de operaciones obtenido');
    return response.data;
  } catch (error: any) {
    console.error('❌ [Reportes] Error obteniendo dashboard de operaciones:', error);
    throw error.response?.data || error;
  }
};

// ============================================
// 🆕 ENDPOINTS ADICIONALES FALTANTES
// ============================================

/**
 * Obtener servicios más populares
 * GET /api/v1/reportes/servicios-populares/
 */
export const obtenerServiciosPopulares = async (params?: {
  fecha_inicio?: string;
  fecha_fin?: string;
  limite?: number;
}): Promise<Array<{
  servicio_id: number;
  servicio_nombre: string;
  cantidad_usos: number;
  ingresos_totales: number;
}>> => {
  try {
    console.log('📊 [Reportes] Obteniendo servicios populares...', params);
    const response = await Api.get('/reportes/servicios-populares/', { params });
    console.log('✅ [Reportes] Servicios populares obtenidos');
    return response.data;
  } catch (error: any) {
    console.error('❌ [Reportes] Error obteniendo servicios populares:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener rendimiento de odontólogos
 * GET /api/v1/reportes/odontologos/
 */
export const obtenerReporteOdontologos = async (params?: {
  fecha_inicio?: string;
  fecha_fin?: string;
}): Promise<Array<{
  odontologo_id: number;
  odontologo_nombre: string;
  total_citas: number;
  citas_completadas: number;
  tasa_asistencia: number;
  total_tratamientos: number;
  ingresos_generados: number;
}>> => {
  try {
    console.log('📊 [Reportes] Obteniendo reporte de odontólogos...', params);
    const response = await Api.get('/reportes/odontologos/', { params });
    console.log('✅ [Reportes] Reporte de odontólogos obtenido');
    return response.data;
  } catch (error: any) {
    console.error('❌ [Reportes] Error obteniendo reporte de odontólogos:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener reporte de satisfacción de pacientes
 * GET /api/v1/reportes/satisfaccion/
 */
export const obtenerReporteSatisfaccion = async (params?: {
  fecha_inicio?: string;
  fecha_fin?: string;
}): Promise<{
  promedio_satisfaccion: number;
  total_encuestas: number;
  por_calificacion: Array<{
    calificacion: number;
    cantidad: number;
    porcentaje: number;
  }>;
  comentarios_recientes: Array<{
    paciente_nombre: string;
    calificacion: number;
    comentario: string;
    fecha: string;
  }>;
}> => {
  try {
    console.log('📊 [Reportes] Obteniendo reporte de satisfacción...', params);
    const response = await Api.get('/reportes/satisfaccion/', { params });
    console.log('✅ [Reportes] Reporte de satisfacción obtenido');
    return response.data;
  } catch (error: any) {
    console.error('❌ [Reportes] Error obteniendo reporte de satisfacción:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener reporte consolidado completo
 * GET /api/v1/reportes/consolidado/
 */
export const obtenerReporteConsolidado = async (params?: {
  fecha_inicio?: string;
  fecha_fin?: string;
}): Promise<{
  periodo: { inicio: string; fin: string };
  resumen_citas: ReporteCitas;
  resumen_tratamientos: ReporteTratamientos;
  resumen_ingresos: ReporteIngresos;
  top_servicios: Array<any>;
  top_odontologos: Array<any>;
}> => {
  try {
    console.log('📊 [Reportes] Obteniendo reporte consolidado...', params);
    const response = await Api.get('/reportes/consolidado/', { params });
    console.log('✅ [Reportes] Reporte consolidado obtenido');
    return response.data;
  } catch (error: any) {
    console.error('❌ [Reportes] Error obteniendo reporte consolidado:', error);
    throw error.response?.data || error;
  }
};

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Formatear fecha para query params
 * @param date Objeto Date
 * @returns String en formato YYYY-MM-DD
 */
export const formatearFechaParaAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtener rango de fechas predefinido
 * @param tipo Tipo de rango ('hoy' | 'semana' | 'mes' | 'anio')
 * @returns Objeto con fecha_inicio y fecha_fin
 */
export const obtenerRangoFechas = (tipo: 'hoy' | 'semana' | 'mes' | 'anio'): {
  fecha_inicio: string;
  fecha_fin: string;
} => {
  const hoy = new Date();
  const fecha_fin = formatearFechaParaAPI(hoy);
  
  let fecha_inicio: Date;
  
  switch (tipo) {
    case 'hoy':
      fecha_inicio = hoy;
      break;
    case 'semana':
      fecha_inicio = new Date(hoy);
      fecha_inicio.setDate(hoy.getDate() - 7);
      break;
    case 'mes':
      fecha_inicio = new Date(hoy);
      fecha_inicio.setMonth(hoy.getMonth() - 1);
      break;
    case 'anio':
      fecha_inicio = new Date(hoy);
      fecha_inicio.setFullYear(hoy.getFullYear() - 1);
      break;
    default:
      fecha_inicio = hoy;
  }
  
  return {
    fecha_inicio: formatearFechaParaAPI(fecha_inicio),
    fecha_fin,
  };
};

// Export por defecto
export default {
  obtenerReportePacientes,
  obtenerReporteCitas,
  obtenerReporteTratamientos,
  obtenerReporteIngresos,
  obtenerDashboardGeneral,
  obtenerDashboardFinanciero,
  obtenerDashboardOperaciones,
  // 🆕 Nuevos endpoints
  obtenerServiciosPopulares,
  obtenerReporteOdontologos,
  obtenerReporteSatisfaccion,
  obtenerReporteConsolidado,
  // Helpers
  formatearFechaParaAPI,
  obtenerRangoFechas,
};
