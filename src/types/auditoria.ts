// src/types/auditoria.ts

/**
 * 📊 TIPOS TYPESCRIPT PARA AUDITORÍA
 * 
 * Modelos y tipos para el sistema de bitácora y auditoría
 */

// ==================== REGISTRO DE BITÁCORA ====================

export interface RegistroBitacora {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    email: string;
  } | null;
  accion: string;
  accion_display?: string;
  tabla_afectada: string | null;
  registro_id: number | null;
  descripcion: string;
  detalles: string | null;
  ip_address: string | null;
  user_agent: string | null;
  fecha: string;
  fecha_hora?: string; // Alias para compatibilidad
  nivel?: 'info' | 'warning' | 'error' | 'critical';
  modelo_afectado?: string | null;
  objeto_id?: number | null;
  datos_adicionales?: Record<string, any> | null;
  datos_anteriores?: any;
  datos_nuevos?: any;
}

// ==================== RESUMEN Y ESTADÍSTICAS ====================

export interface ResumenBitacora {
  total_registros: number;
  por_accion: Array<{
    accion: string;
    total: number;
    porcentaje?: number;
  }>;
  por_tabla: Array<{
    tabla_afectada: string;
    total: number;
  }>;
  por_usuario?: Array<{
    usuario_id: number;
    usuario_nombre: string;
    cantidad: number;
  }>;
  ultimos_7_dias: number;
  ultimos_30_dias: number;
  acciones?: { [key: string]: number };
  usuarios_activos?: { [key: string]: number };
  actividad_diaria?: { [key: string]: number };
  periodo?: string;
}

// ==================== FILTROS ====================

export interface FiltrosBitacora {
  usuario?: number;
  accion?: string;
  tabla_afectada?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
  nivel?: string;
  ip_address?: string;
  page?: number;
  page_size?: number;
}

// ==================== RESPUESTAS PAGINADAS ====================

export interface RespuestaPaginadaBitacora {
  count: number;
  next: string | null;
  previous: string | null;
  results: RegistroBitacora[];
}

// ==================== TIPOS DE ACCIONES ====================

export type AccionBitacora =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREAR_CITA'
  | 'EDITAR_CITA'
  | 'CANCELAR_CITA'
  | 'ELIMINAR_CITA'
  | 'CREAR_PACIENTE'
  | 'EDITAR_PACIENTE'
  | 'CREAR_PAGO'
  | 'CONFIRMAR_PAGO'
  | 'RECHAZAR_PAGO'
  | 'VER_HISTORIAL'
  | 'DESCARGAR_REPORTE'
  | 'crear'
  | 'actualizar'
  | 'eliminar'
  | 'ver'
  | 'login'
  | 'logout'
  | 'aprobar'
  | 'rechazar'
  | 'otro';

// ==================== TIPOS DE TABLAS/MODELOS ====================

export type TablaBitacora =
  | 'consulta'
  | 'usuario'
  | 'paciente'
  | 'pago_en_linea'
  | 'factura'
  | 'historial_clinico'
  | 'tratamiento'
  | 'sesion_tratamiento'
  | 'plan_tratamiento'
  | 'odontograma';

// ==================== CONFIGURACIÓN DE VISUALIZACIÓN ====================

export interface ConfiguracionBitacora {
  mostrarIP: boolean;
  mostrarUserAgent: boolean;
  registrosPorPagina: number;
  formatoFecha: 'corta' | 'larga' | 'relativa';
  autoRefresh: boolean;
  intervaloRefresh: number; // en segundos
}

// ==================== EXPORTACIÓN ====================

export interface OpcionesExportacion {
  formato: 'csv' | 'pdf' | 'excel';
  incluirDetalles: boolean;
  incluirIP: boolean;
  incluirUserAgent: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
}

// ==================== DETALLE DE CAMBIOS ====================

export interface CambioDetalle {
  campo: string;
  anterior: any;
  nuevo: any;
}

// ==================== ALERTA DE AUDITORÍA ====================

export interface AlertaAuditoria {
  id: number;
  tipo: 'seguridad' | 'integridad' | 'rendimiento';
  severidad: 'baja' | 'media' | 'alta' | 'crítica';
  mensaje: string;
  registros_relacionados: number[];
  fecha_deteccion: string;
  estado: 'activa' | 'revisada' | 'resuelta';
}
