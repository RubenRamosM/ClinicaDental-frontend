/**
 * 🧾 SERVICIO DE FACTURAS Y TIPOS DE PAGO
 * 
 * Integración con el módulo de facturación del backend
 * Backend: /api/v1/pagos/
 * 
 * Endpoints implementados:
 * - Facturas:
 *   - GET    /pagos/facturas/                        (Listar facturas)
 *   - GET    /pagos/facturas/{id}/                   (Ver detalle)
 *   - POST   /pagos/facturas/                        (Crear factura)
 *   - PUT    /pagos/facturas/{id}/                   (Actualizar completo)
 *   - PATCH  /pagos/facturas/{id}/                   (Actualizar parcial)
 *   - DELETE /pagos/facturas/{id}/                   (Eliminar)
 * 
 * - Catálogos:
 *   - GET    /pagos/tipos-pago/                      (Tipos de pago)
 *   - GET    /pagos/estados-factura/                 (Estados de factura)
 * 
 * Nota: Los pagos de tratamiento están en pagosService.ts (/tratamientos/historial-pagos/)
 */

import { Api } from '../lib/Api';

// ==================== INTERFACES - FACTURAS ====================

export interface Factura {
  id: number;
  consulta: number;
  paciente: number;
  fechaemision: string;
  montototal: number;
  idestadofactura: number;
  detalles?: string;
  
  // Campos expandidos (relaciones)
  paciente_nombre?: string;
  paciente_apellido?: string;
  paciente_correo?: string;
  estado_nombre?: string;
  numero_factura?: string;
  consulta_fecha?: string;
}

export interface CrearFacturaDTO {
  consulta: number;
  paciente: number;
  fechaemision: string;
  montototal: number;
  idestadofactura: number;
  detalles?: string;
}

export interface ActualizarFacturaDTO {
  consulta?: number;
  paciente?: number;
  fechaemision?: string;
  montototal?: number;
  idestadofactura?: number;
  detalles?: string;
}

export interface FiltrosFacturas {
  consulta?: number;
  paciente?: number;
  idestadofactura?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  monto_minimo?: number;
  monto_maximo?: number;
  page?: number;
  page_size?: number;
}

export interface RespuestaPaginadaFacturas {
  count: number;
  next: string | null;
  previous: string | null;
  results: Factura[];
}

// ==================== INTERFACES - CATÁLOGOS ====================

export interface TipoPago {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  codigo?: string;
}

export interface EstadoFactura {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  icono?: string;
}

// ==================== HELPERS ====================

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Token ${token}` }),
  };
};

// ==================== FACTURAS - CRUD COMPLETO ====================

/**
 * Listar todas las facturas
 * GET /api/v1/pagos/facturas/
 */
export const listarFacturas = async (filtros?: FiltrosFacturas): Promise<RespuestaPaginadaFacturas> => {
  try {
    const params = new URLSearchParams();
    
    if (filtros?.consulta) params.append('consulta', filtros.consulta.toString());
    if (filtros?.paciente) params.append('paciente', filtros.paciente.toString());
    if (filtros?.idestadofactura) params.append('idestadofactura', filtros.idestadofactura.toString());
    if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros?.monto_minimo) params.append('monto_minimo', filtros.monto_minimo.toString());
    if (filtros?.monto_maximo) params.append('monto_maximo', filtros.monto_maximo.toString());
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.page_size) params.append('page_size', filtros.page_size.toString());

    const queryString = params.toString();
    const url = `/pagos/facturas/${queryString ? `?${queryString}` : ''}`;

    console.log('📋 Listando facturas:', url);
    const response = await Api.get(url, { headers: getHeaders() });
    
    console.log(`✅ Facturas obtenidas: ${response.data.count || response.data.length} registros`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al listar facturas:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener detalle de una factura específica
 * GET /api/v1/pagos/facturas/{id}/
 */
export const obtenerFactura = async (id: number): Promise<Factura> => {
  try {
    console.log(`📄 Obteniendo factura ${id}`);
    const response = await Api.get(`/pagos/facturas/${id}/`, { headers: getHeaders() });
    
    console.log('✅ Factura obtenida:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener factura ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Crear una nueva factura
 * POST /api/v1/pagos/facturas/
 * 
 * Flujo E2E: Sesión 4, paso 4.8e - Facturación digital
 */
export const crearFactura = async (data: CrearFacturaDTO): Promise<Factura> => {
  try {
    console.log('🧾 Creando factura:', data);
    const response = await Api.post('/pagos/facturas/', data, { headers: getHeaders() });
    
    console.log('✅ Factura creada exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al crear factura:', error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar una factura completa
 * PUT /api/v1/pagos/facturas/{id}/
 */
export const actualizarFactura = async (id: number, data: CrearFacturaDTO): Promise<Factura> => {
  try {
    console.log(`📝 Actualizando factura ${id} (completo):`, data);
    const response = await Api.put(`/pagos/facturas/${id}/`, data, { headers: getHeaders() });
    
    console.log('✅ Factura actualizada:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar factura ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar factura parcialmente
 * PATCH /api/v1/pagos/facturas/{id}/
 */
export const actualizarParcialFactura = async (id: number, data: ActualizarFacturaDTO): Promise<Factura> => {
  try {
    console.log(`📝 Actualizando factura ${id} (parcial):`, data);
    const response = await Api.patch(`/pagos/facturas/${id}/`, data, { headers: getHeaders() });
    
    console.log('✅ Factura actualizada parcialmente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar parcialmente factura ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Eliminar una factura
 * DELETE /api/v1/pagos/facturas/{id}/
 */
export const eliminarFactura = async (id: number): Promise<void> => {
  try {
    console.log(`🗑️ Eliminando factura ${id}`);
    await Api.delete(`/pagos/facturas/${id}/`, { headers: getHeaders() });
    
    console.log('✅ Factura eliminada exitosamente');
  } catch (error: any) {
    console.error(`❌ Error al eliminar factura ${id}:`, error);
    throw error.response?.data || error;
  }
};

// ==================== CATÁLOGOS ====================

/**
 * Obtener tipos de pago disponibles
 * GET /api/v1/pagos/tipos-pago/
 * 
 * Flujo E2E: Sesión 4, paso 4.8b
 */
export const obtenerTiposPago = async (): Promise<TipoPago[]> => {
  try {
    console.log('📋 Obteniendo tipos de pago');
    const response = await Api.get('/pagos/tipos-pago/', { headers: getHeaders() });
    
    const tipos = response.data.results || response.data;
    console.log(`✅ Tipos de pago obtenidos: ${tipos.length} tipos`);
    return tipos;
  } catch (error: any) {
    console.error('❌ Error al obtener tipos de pago:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener estados de factura disponibles
 * GET /api/v1/pagos/estados-factura/
 * 
 * Flujo E2E: Sesión 4, paso 4.8c
 */
export const obtenerEstadosFactura = async (): Promise<EstadoFactura[]> => {
  try {
    console.log('📋 Obteniendo estados de factura');
    const response = await Api.get('/pagos/estados-factura/', { headers: getHeaders() });
    
    const estados = response.data.results || response.data;
    console.log(`✅ Estados de factura obtenidos: ${estados.length} estados`);
    return estados;
  } catch (error: any) {
    console.error('❌ Error al obtener estados de factura:', error);
    throw error.response?.data || error;
  }
};

// ==================== UTILIDADES ====================

/**
 * Obtener clase CSS según estado de factura
 */
export const getEstadoFacturaClase = (estadoId: number, estados: EstadoFactura[]): string => {
  const estado = estados.find(e => e.id === estadoId);
  const nombre = estado?.nombre.toLowerCase() || '';
  
  if (nombre.includes('pagad') || nombre.includes('completad')) {
    return 'bg-green-100 text-green-800';
  }
  if (nombre.includes('pendiente') || nombre.includes('emitid')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (nombre.includes('vencid') || nombre.includes('morosidad')) {
    return 'bg-red-100 text-red-800';
  }
  if (nombre.includes('anulad') || nombre.includes('cancelad')) {
    return 'bg-gray-100 text-gray-800';
  }
  
  return 'bg-blue-100 text-blue-800';
};

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
 * Formatear fecha de emisión
 */
export const formatearFechaEmision = (fecha: string): string => {
  try {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return fecha;
  }
};

/**
 * Generar número de factura automático
 */
export const generarNumeroFactura = (id: number, fecha: string): string => {
  const year = new Date(fecha).getFullYear();
  const numero = id.toString().padStart(6, '0');
  return `FACT-${year}-${numero}`;
};

/**
 * Validar datos de factura
 */
export const validarFactura = (data: CrearFacturaDTO): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];
  
  if (!data.consulta) errores.push('Consulta es requerida');
  if (!data.paciente) errores.push('Paciente es requerido');
  if (!data.fechaemision) errores.push('Fecha de emisión es requerida');
  if (!data.montototal || data.montototal <= 0) errores.push('Monto debe ser mayor a 0');
  if (!data.idestadofactura) errores.push('Estado de factura es requerido');
  
  return {
    valido: errores.length === 0,
    errores,
  };
};

/**
 * Calcular total de facturas
 */
export const calcularTotalFacturas = (facturas: Factura[]): number => {
  return facturas.reduce((sum, factura) => sum + factura.montototal, 0);
};

/**
 * Filtrar facturas por estado
 */
export const filtrarPorEstado = (facturas: Factura[], estadoId: number): Factura[] => {
  return facturas.filter(factura => factura.idestadofactura === estadoId);
};

/**
 * Obtener facturas pendientes
 */
export const obtenerFacturasPendientes = (facturas: Factura[], estados: EstadoFactura[]): Factura[] => {
  const estadoPendiente = estados.find(e => 
    e.nombre.toLowerCase().includes('pendiente') || 
    e.nombre.toLowerCase().includes('emitid')
  );
  
  if (!estadoPendiente) return [];
  
  return filtrarPorEstado(facturas, estadoPendiente.id);
};

/**
 * Calcular estadísticas de facturas
 */
export const calcularEstadisticasFacturas = (facturas: Factura[], estados: EstadoFactura[]) => {
  const total = facturas.length;
  const montoTotal = calcularTotalFacturas(facturas);
  
  const porEstado = estados.map(estado => {
    const facturasEstado = filtrarPorEstado(facturas, estado.id);
    return {
      estado: estado.nombre,
      cantidad: facturasEstado.length,
      monto: calcularTotalFacturas(facturasEstado),
      porcentaje: total > 0 ? Math.round((facturasEstado.length / total) * 100) : 0,
    };
  });
  
  return {
    total,
    montoTotal,
    porEstado,
  };
};

// ==================== EXPORT DEFAULT ====================

export default {
  // Facturas - CRUD completo
  listarFacturas,
  obtenerFactura,
  crearFactura,
  actualizarFactura,
  actualizarParcialFactura,
  eliminarFactura,
  
  // Catálogos
  obtenerTiposPago,
  obtenerEstadosFactura,
  
  // Utilidades
  getEstadoFacturaClase,
  formatearMonto,
  formatearFechaEmision,
  generarNumeroFactura,
  validarFactura,
  calcularTotalFacturas,
  filtrarPorEstado,
  obtenerFacturasPendientes,
  calcularEstadisticasFacturas,
};
