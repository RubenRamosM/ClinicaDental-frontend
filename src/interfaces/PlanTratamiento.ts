// Interfaces para el módulo de Planes de Tratamiento

// ========================================
// Interfaces Base
// ========================================

export interface PlanTratamiento {
  id: number;
  fecha_creacion: string;
  paciente_nombre: string;
  odontologo_nombre: string;
  estado_plan: 'Borrador' | 'Aprobado' | 'Cancelado';
  estado_aceptacion: 'Pendiente' | 'Aceptado' | 'Rechazado' | 'Caducado' | 'Parcial';
  costo_total: string;
  subtotal_calculado: string;
  descuento: string;
  cantidad_items: number;
  items_activos: number;
  items_completados: number;
  es_borrador: boolean;
  puede_editarse: boolean;
  fecha_aprobacion: string | null;
  fecha_vigencia: string;
  version: number;
  notas_plan?: string;
}

export interface PlanTratamientoDetalle extends PlanTratamiento {
  // ✅ NUEVOS: Objetos completos desde backend
  paciente_detalle: {
    id: number;  // ID del paciente (usar este para filtrar consultas)
    nombre: string;
    apellido: string;
    email: string;
  };

  odontologo_detalle: {
    id: number;  // ID del odontólogo
    nombre: string;
    especialidad: string;
  };

  // Campos adicionales del detalle
  codigo: string;
  descripcion: string;
  diagnostico: string | null;
  observaciones: string | null;
  estado: string;
  estado_display: string;
  fecha_inicio: string | null;
  fecha_finalizacion: string | null;
  duracion_estimada_dias: number | null;
  progreso: number;
  
  // Campos calculados
  aceptacion_tipo: string | null;
  usuario_aprueba_nombre: string | null;
  es_aprobado: boolean;
  puede_ser_aceptado: boolean;
  
  // Arrays (backend devuelve ambos - "items" es alias de "procedimientos")
  items: ItemPlanTratamiento[];  // ✅ Alias de procedimientos
  procedimientos?: ItemPlanTratamiento[];  // ✅ Lista original del backend
  
  // Estadísticas completas
  estadisticas: {
    total_items: number;
    items_pendientes: number;
    items_activos: number;
    items_cancelados: number;
    items_completados: number;
    progreso_porcentaje: number;
  };
  
  // ✅ NUEVO: Presupuestos y Pagos
  presupuestos?: Presupuesto[];
  pagos?: HistorialPago[];
  total_pagado?: number;
  saldo_pendiente?: number;
}

// ========================================
// Presupuestos
// ========================================

export interface Presupuesto {
  id: number;
  codigo: string;
  plan_tratamiento: number;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'vencido';
  notas: string | null;
  fecha_creacion: string;
  fecha_vencimiento: string | null;
  fecha_aprobacion: string | null;
  aprobado_por: string | null;
  motivo_rechazo: string | null;
  items: ItemPresupuesto[];
  total_pagado: number;
  saldo_pendiente: number;
}

export interface ItemPresupuesto {
  id: number;
  servicio_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  pieza_dental_nombre?: string | null;
}

export interface AprobarPresupuestoDTO {
  aprobado_por: string;
}

export interface RechazarPresupuestoDTO {
  motivo_rechazo: string;
}

// ========================================
// Historial de Pagos
// ========================================

export interface HistorialPago {
  id: number;
  codigo: string;
  plan_tratamiento: number;
  presupuesto: number | null;
  monto: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'qr'; // ✅ CORREGIDO: Eliminado 'cheque' (no está en GUIA_TRATAMIENTOS_PARTE_5)
  estado: 'pendiente' | 'completado' | 'cancelado' | 'reembolsado';
  fecha_pago: string;
  numero_comprobante: string | null;
  numero_transaccion: string | null;
  notas: string | null;
  registrado_por: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// ========================================
// Sesión de Tratamiento
// ========================================

export interface SesionTratamiento {
  id: number;
  codigo: string;
  plan_tratamiento: number;
  plan_codigo?: string;
  plan_tratamiento_detalle?: {
    id: number;
    codigo: string;
    paciente_nombre: string;
    diagnostico: string;
    estado: string;
  };
  odontologo: number;
  odontologo_nombre: string;
  odontologo_detalle?: {
    id: number;
    nombre: string;
    especialidad?: string;
    email: string;
  };
  numero_sesion: number;
  titulo: string;
  descripcion: string;
  estado: 'programada' | 'en_curso' | 'completada' | 'cancelada';
  estado_display: string;
  fecha_programada: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  duracion_minutos?: number;
  duracion_estimada_minutos?: number;
  observaciones?: string;
  recomendaciones?: string;
  proxima_sesion_programada?: string | null;
  procedimientos_relacionados?: ItemPlanTratamiento[];
  puede_iniciar?: boolean;
  puede_completar?: boolean;
  puede_cancelar?: boolean;
}

export interface SesionForm {
  plan_tratamiento: number;
  titulo: string;
  descripcion: string;
  fecha_programada: string;
  hora_programada: string;
  duracion_estimada_minutos: number;
  observaciones: string;
}

export interface CompletarSesionForm {
  observaciones: string;
  recomendaciones: string;
  proxima_sesion_programada?: string;
  procedimientos_completados?: number[];
  complicaciones?: string;
}

// ========================================
// Items de Plan de Tratamiento (Procedimientos)
// ========================================

export interface ItemPlanTratamiento {
  id: number;
  servicio_nombre: string;
  servicio_descripcion: string | null;
  descripcion: string; // ✅ AGREGADO: Usado en CrearPresupuestoDigital.tsx (alias de servicio_descripcion)
  servicio_duracion: number;
  pieza_dental_nombre: string | null;
  estado_nombre: string;
  costofinal: string;
  costo_base_servicio: string;
  fecha_objetivo: string | null;
  tiempo_estimado: number;
  estado_item: 'Pendiente' | 'Activo' | 'Cancelado' | 'Completado';
  notas_item: string;
  orden: number;
  es_activo: boolean;
  es_cancelado: boolean;
  puede_editarse: boolean;
}

// ========================================
// DTOs para Crear/Actualizar
// ========================================

export interface CrearPlanTratamientoDTO {
  codpaciente: number;
  cododontologo: number;
  fechaplan?: string;          // Opcional - formato YYYY-MM-DD (si no se envía, usa fecha actual)
  notas_plan?: string;
  descuento?: number;          // Descuento global en Bs. (default: 0)
  fecha_vigencia?: string;     // Fecha límite de vigencia YYYY-MM-DD
  items_iniciales?: CrearItemPlanDTO[]; // IMPORTANTE: Backend espera "items_iniciales"
}

export interface CrearItemPlanDTO {
  idservicio: number;          // IMPORTANTE: Backend espera "idservicio" (no codservicio)
  idpiezadental?: number | null; // IMPORTANTE: Backend espera "idpiezadental" (no codpiezadental)
  costofinal?: number;         // IMPORTANTE: Backend espera "costofinal" (no precio_unitario)
  fecha_objetivo?: string;     // Formato YYYY-MM-DD
  tiempo_estimado?: number;    // Tiempo en minutos
  estado_item?: 'Pendiente' | 'Activo' | 'Cancelado' | 'Completado'; // OPCIONAL: Estado del item (default: Pendiente)
  notas_item?: string;
  orden?: number;              // Orden de ejecución (0, 1, 2...)
  
  // NOTA: idestado NO debe enviarse - se asigna automáticamente en el backend
}

export interface ActualizarPlanTratamientoDTO {
  notas_plan?: string;
  descuento?: string;
  fecha_vigencia?: string;
}

export interface ActualizarItemPlanDTO {
  costofinal?: number;         // Costo final del ítem
  fecha_objetivo?: string;     // Fecha estimada (YYYY-MM-DD)
  tiempo_estimado?: number;    // Tiempo en minutos
  notas_item?: string;         // Notas del procedimiento
  orden?: number;              // Orden de ejecución
}

// ========================================
// Respuestas de la API
// ========================================

export interface RespuestaPaginadaPlan {
  count: number;
  next: string | null;
  previous: string | null;
  results: PlanTratamiento[];
}

export interface RespuestaAprobarPlan {
  success: boolean;
  mensaje: string;
  plan: {
    id: number;
    estado_plan: string;
    fecha_aprobacion: string;
    usuario_aprueba_nombre: string;
    es_borrador: boolean;
    puede_editarse: boolean;
    puede_ser_aceptado: boolean;
  };
}

export interface RespuestaItemAction {
  success: boolean;
  mensaje: string;
  item: {
    id: number;
    estado_item: string;
    es_activo?: boolean;
    es_cancelado?: boolean;
  };
  totales?: {
    subtotal: string;
    total: string;
  };
}

export interface RespuestaTotales {
  success: boolean;
  mensaje: string;
  totales: {
    subtotal: number;
    descuento: number;
    total: number;
    items_activos: number;
  };
}

export interface ValidacionAprobacion {
  puede_aprobar: boolean;
  razones: string[];  // ✅ Cambiado de "motivos" a "razones" para coincidir con backend
  detalles: {
    es_borrador: boolean;
    items_totales: number;
    items_activos: number;
    items_pendientes: number;
    items_cancelados: number;
    items_completados: number;
    es_editable: boolean;
    estado_plan: string;
    usuario_puede_aprobar: boolean;
    // ✅ NUEVO: Información de debugging agregada por el backend
    debug?: {
      usuario_codigo: number;
      usuario_tipo_id: number;
      usuario_tipo_rol: string;
      plan_odontologo_id: number | null;
      es_odontologo_del_plan: boolean;
      es_admin: boolean;
    };
  };
}

// ========================================
// Filtros para Listado
// ========================================

export interface FiltrosPlanesTratamiento {
  search?: string;
  estado_plan?: 'Borrador' | 'Aprobado' | 'Cancelado' | '';
  estado_aceptacion?: 'Pendiente' | 'Aceptado' | 'Rechazado' | 'Caducado' | 'Parcial' | '';
  paciente?: number;
  odontologo?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
