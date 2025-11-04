/**
 * 📋 SERVICIO DE AUDITORÍA
 * 
 * Sistema de auditoría y trazabilidad de operaciones
 * Backend: /api/v1/auditoria/
 * 
 * Funcionalidades:
 * - Registro automático de operaciones críticas
 * - Consulta de logs por usuario, modelo, acción
 * - Estadísticas de actividad
 * - Trazabilidad completa (quién, qué, cuándo, dónde)
 * 
 * Endpoints implementados:
 * - GET    /auditoria/logs/                        (Listar logs)
 * - GET    /auditoria/logs/{id}/                   (Ver detalle)
 * - POST   /auditoria/logs/                        (Registro manual)
 * - GET    /auditoria/logs/por-usuario/            (Filtrar por usuario)
 * - GET    /auditoria/logs/por-modelo/             (Filtrar por modelo)
 * - GET    /auditoria/logs/estadisticas/           (Estadísticas)
 * 
 * TOTAL: 6 endpoints
 */

import { Api } from '../lib/Api';

// ==================== INTERFACES ====================

export interface LogAuditoria {
  id: number;
  usuario: number;
  usuario_nombre?: string;
  usuario_correo?: string;
  accion: 'crear' | 'actualizar' | 'eliminar' | 'ver' | 'login' | 'logout' | 'aprobar' | 'rechazar' | 'otro';
  modelo: string;
  objeto_id?: number;
  objeto_repr?: string;
  descripcion: string;
  fecha_hora: string;
  ip_address?: string;
  user_agent?: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
  nivel: 'info' | 'warning' | 'error' | 'critical';
}

export interface CrearLogAuditoriaDTO {
  accion: 'crear' | 'actualizar' | 'eliminar' | 'ver' | 'login' | 'logout' | 'aprobar' | 'rechazar' | 'otro';
  modelo: string;
  objeto_id?: number;
  objeto_repr?: string;
  descripcion: string;
  ip_address?: string;
  user_agent?: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
  nivel?: 'info' | 'warning' | 'error' | 'critical';
}

export interface FiltrosAuditoria {
  usuario?: number;
  accion?: string;
  modelo?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  nivel?: string;
  ip_address?: string;
  page?: number;
  page_size?: number;
}

export interface RespuestaPaginadaLogs {
  count: number;
  next: string | null;
  previous: string | null;
  results: LogAuditoria[];
}

export interface EstadisticasAuditoria {
  total_logs: number;
  por_accion: Array<{
    accion: string;
    cantidad: number;
    porcentaje: number;
  }>;
  por_modelo: Array<{
    modelo: string;
    cantidad: number;
    porcentaje: number;
  }>;
  por_usuario: Array<{
    usuario_id: number;
    usuario_nombre: string;
    cantidad: number;
  }>;
  por_nivel: Array<{
    nivel: string;
    cantidad: number;
  }>;
  ultimos_7_dias: Array<{
    fecha: string;
    cantidad: number;
  }>;
}

// ==================== HELPERS ====================

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Token ${token}` }),
  };
};

/**
 * Obtener IP del cliente
 */
const obtenerIPCliente = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return '0.0.0.0';
  }
};

/**
 * Obtener User Agent del navegador
 */
const obtenerUserAgent = (): string => {
  return navigator.userAgent || 'Unknown';
};

// ==================== CRUD BÁSICO ====================

/**
 * Listar todos los logs de auditoría
 * GET /api/v1/auditoria/logs/
 */
export const listarLogs = async (filtros?: FiltrosAuditoria): Promise<RespuestaPaginadaLogs> => {
  try {
    const params = new URLSearchParams();
    
    if (filtros?.usuario) params.append('usuario', filtros.usuario.toString());
    if (filtros?.accion) params.append('accion', filtros.accion);
    if (filtros?.modelo) params.append('modelo', filtros.modelo);
    if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros?.nivel) params.append('nivel', filtros.nivel);
    if (filtros?.ip_address) params.append('ip_address', filtros.ip_address);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.page_size) params.append('page_size', filtros.page_size.toString());

    const queryString = params.toString();
    const url = `/auditoria/logs/${queryString ? `?${queryString}` : ''}`;

    console.log('📋 Listando logs de auditoría:', url);
    const response = await Api.get(url, { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al listar logs:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener detalle de un log específico
 * GET /api/v1/auditoria/logs/{id}/
 */
export const obtenerLog = async (id: number): Promise<LogAuditoria> => {
  try {
    console.log(`📄 Obteniendo log ${id}`);
    const response = await Api.get(`/auditoria/logs/${id}/`, { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener log ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Registrar un log de auditoría manualmente
 * POST /api/v1/auditoria/logs/
 */
export const registrarLog = async (data: CrearLogAuditoriaDTO): Promise<LogAuditoria> => {
  try {
    // Obtener datos de contexto si no se proporcionaron
    const ipCliente = data.ip_address || await obtenerIPCliente();
    const userAgent = data.user_agent || obtenerUserAgent();
    
    const logData = {
      ...data,
      ip_address: ipCliente,
      user_agent: userAgent,
      nivel: data.nivel || 'info',
    };
    
    console.log('📝 Registrando log de auditoría:', logData);
    const response = await Api.post('/auditoria/logs/', logData, { headers: getHeaders() });
    
    console.log('✅ Log registrado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al registrar log:', error);
    throw error.response?.data || error;
  }
};

// ==================== ENDPOINTS CUSTOM ====================

/**
 * Obtener logs por usuario
 * GET /api/v1/auditoria/logs/por-usuario/?usuario_id={id}
 */
export const obtenerLogsPorUsuario = async (usuarioId: number, filtros?: FiltrosAuditoria): Promise<LogAuditoria[]> => {
  try {
    const params = new URLSearchParams();
    params.append('usuario_id', usuarioId.toString());
    
    if (filtros?.accion) params.append('accion', filtros.accion);
    if (filtros?.modelo) params.append('modelo', filtros.modelo);
    if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros?.nivel) params.append('nivel', filtros.nivel);

    const queryString = params.toString();
    const url = `/auditoria/logs/por-usuario/?${queryString}`;

    console.log(`📋 Obteniendo logs del usuario ${usuarioId}`);
    const response = await Api.get(url, { headers: getHeaders() });
    
    console.log(`✅ Logs obtenidos: ${response.data.length || response.data.results?.length || 0}`);
    return response.data.results || response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener logs del usuario ${usuarioId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener logs por modelo
 * GET /api/v1/auditoria/logs/por-modelo/?modelo={nombre}
 */
export const obtenerLogsPorModelo = async (modelo: string, filtros?: FiltrosAuditoria): Promise<LogAuditoria[]> => {
  try {
    const params = new URLSearchParams();
    params.append('modelo', modelo);
    
    if (filtros?.usuario) params.append('usuario', filtros.usuario.toString());
    if (filtros?.accion) params.append('accion', filtros.accion);
    if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros?.nivel) params.append('nivel', filtros.nivel);

    const queryString = params.toString();
    const url = `/auditoria/logs/por-modelo/?${queryString}`;

    console.log(`📋 Obteniendo logs del modelo "${modelo}"`);
    const response = await Api.get(url, { headers: getHeaders() });
    
    console.log(`✅ Logs obtenidos: ${response.data.length || response.data.results?.length || 0}`);
    return response.data.results || response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener logs del modelo "${modelo}":`, error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener estadísticas de auditoría
 * GET /api/v1/auditoria/logs/estadisticas/
 */
export const obtenerEstadisticas = async (filtros?: { fecha_desde?: string; fecha_hasta?: string }): Promise<EstadisticasAuditoria> => {
  try {
    const params = new URLSearchParams();
    if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

    const queryString = params.toString();
    const url = `/auditoria/logs/estadisticas/${queryString ? `?${queryString}` : ''}`;

    console.log('📊 Obteniendo estadísticas de auditoría');
    const response = await Api.get(url, { headers: getHeaders() });
    
    console.log('✅ Estadísticas obtenidas:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al obtener estadísticas:', error);
    throw error.response?.data || error;
  }
};

// ==================== HELPERS DE LOGGING ====================

/**
 * Log rápido para crear registro
 */
export const logCrear = async (modelo: string, objetoId: number, objetoRepr: string, datosNuevos?: any) => {
  return registrarLog({
    accion: 'crear',
    modelo,
    objeto_id: objetoId,
    objeto_repr: objetoRepr,
    descripcion: `Se creó ${modelo} "${objetoRepr}"`,
    datos_nuevos: datosNuevos,
    nivel: 'info',
  });
};

/**
 * Log rápido para actualizar registro
 */
export const logActualizar = async (modelo: string, objetoId: number, objetoRepr: string, datosAnteriores?: any, datosNuevos?: any) => {
  return registrarLog({
    accion: 'actualizar',
    modelo,
    objeto_id: objetoId,
    objeto_repr: objetoRepr,
    descripcion: `Se actualizó ${modelo} "${objetoRepr}"`,
    datos_anteriores: datosAnteriores,
    datos_nuevos: datosNuevos,
    nivel: 'info',
  });
};

/**
 * Log rápido para eliminar registro
 */
export const logEliminar = async (modelo: string, objetoId: number, objetoRepr: string, datosAnteriores?: any) => {
  return registrarLog({
    accion: 'eliminar',
    modelo,
    objeto_id: objetoId,
    objeto_repr: objetoRepr,
    descripcion: `Se eliminó ${modelo} "${objetoRepr}"`,
    datos_anteriores: datosAnteriores,
    nivel: 'warning',
  });
};

/**
 * Log rápido para aprobar
 */
export const logAprobar = async (modelo: string, objetoId: number, objetoRepr: string) => {
  return registrarLog({
    accion: 'aprobar',
    modelo,
    objeto_id: objetoId,
    objeto_repr: objetoRepr,
    descripcion: `Se aprobó ${modelo} "${objetoRepr}"`,
    nivel: 'info',
  });
};

/**
 * Log rápido para rechazar
 */
export const logRechazar = async (modelo: string, objetoId: number, objetoRepr: string, motivo?: string) => {
  return registrarLog({
    accion: 'rechazar',
    modelo,
    objeto_id: objetoId,
    objeto_repr: objetoRepr,
    descripcion: `Se rechazó ${modelo} "${objetoRepr}"${motivo ? `: ${motivo}` : ''}`,
    nivel: 'warning',
  });
};

// ==================== UTILIDADES ====================

/**
 * Obtener color según nivel de log
 */
export const getColorNivel = (nivel: string): string => {
  const colores: Record<string, string> = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    critical: 'bg-purple-100 text-purple-800',
  };
  return colores[nivel] || 'bg-gray-100 text-gray-800';
};

/**
 * Obtener icono según acción
 */
export const getIconoAccion = (accion: string): string => {
  const iconos: Record<string, string> = {
    crear: '➕',
    actualizar: '✏️',
    eliminar: '🗑️',
    ver: '👁️',
    login: '🔐',
    logout: '🚪',
    aprobar: '✅',
    rechazar: '❌',
    otro: '📝',
  };
  return iconos[accion] || '📝';
};

/**
 * Obtener texto de acción en español
 */
export const getTextoAccion = (accion: string): string => {
  const textos: Record<string, string> = {
    crear: 'Crear',
    actualizar: 'Actualizar',
    eliminar: 'Eliminar',
    ver: 'Ver',
    login: 'Inicio de sesión',
    logout: 'Cierre de sesión',
    aprobar: 'Aprobar',
    rechazar: 'Rechazar',
    otro: 'Otro',
  };
  return textos[accion] || accion;
};

/**
 * Formatear fecha y hora
 */
export const formatearFechaHora = (fechaHora: string): string => {
  try {
    const date = new Date(fechaHora);
    return new Intl.DateTimeFormat('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch {
    return fechaHora;
  }
};

/**
 * Detectar cambios entre objetos
 */
export const detectarCambios = (anterior: any, nuevo: any): Array<{ campo: string; anterior: any; nuevo: any }> => {
  const cambios: Array<{ campo: string; anterior: any; nuevo: any }> = [];
  
  if (!anterior || !nuevo) return cambios;
  
  Object.keys(nuevo).forEach(key => {
    if (anterior[key] !== nuevo[key]) {
      cambios.push({
        campo: key,
        anterior: anterior[key],
        nuevo: nuevo[key],
      });
    }
  });
  
  return cambios;
};

// ==================== EXPORT DEFAULT ====================

export default {
  // CRUD básico
  listarLogs,
  obtenerLog,
  registrarLog,
  
  // Endpoints custom
  obtenerLogsPorUsuario,
  obtenerLogsPorModelo,
  obtenerEstadisticas,
  
  // Helpers de logging
  logCrear,
  logActualizar,
  logEliminar,
  logAprobar,
  logRechazar,
  
  // Utilidades
  getColorNivel,
  getIconoAccion,
  getTextoAccion,
  formatearFechaHora,
  detectarCambios,
};
