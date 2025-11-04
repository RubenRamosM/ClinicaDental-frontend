/**
 * 📝 SERVICIO DE CONSENTIMIENTOS INFORMADOS
 * 
 * Integración completa con el backend para consentimientos digitales
 * Backend: /api/v1/historial-clinico/consentimientos/
 * 
 * Endpoints implementados:
 * - GET    /historial-clinico/consentimientos/                    (Listar todos)
 * - GET    /historial-clinico/consentimientos/{id}/               (Ver detalle)
 * - GET    /historial-clinico/consentimientos/por_paciente/       (Filtrar por paciente)
 * - POST   /historial-clinico/consentimientos/                    (Crear)
 * - PUT    /historial-clinico/consentimientos/{id}/               (Actualizar)
 * - DELETE /historial-clinico/consentimientos/{id}/               (Eliminar)
 * - POST   /historial-clinico/consentimientos/{id}/firmar/        (Firmar - Paciente)
 */

import { Api } from '../lib/Api';

// ==================== INTERFACES ====================

export interface Consentimiento {
  id: number;
  paciente: number;
  odontologo: number;
  tipo_tratamiento: string;
  contenido_documento: string;
  riesgos: string;
  beneficios: string;
  alternativas: string;
  estado: 'pendiente' | 'firmado' | 'rechazado';
  fecha_creacion: string;
  fecha_firma?: string | null;
  firma_paciente_url?: string | null;
  ip_firma?: string | null;
  
  // Campos expandidos
  paciente_nombre?: string;
  paciente_apellido?: string;
  odontologo_nombre?: string;
}

export interface CrearConsentimientoDTO {
  paciente: number;
  odontologo: number;
  tipo_tratamiento: string;
  contenido_documento: string;
  riesgos: string;
  beneficios: string;
  alternativas: string;
  estado?: 'pendiente' | 'firmado' | 'rechazado';
}

export interface ActualizarConsentimientoDTO {
  tipo_tratamiento?: string;
  contenido_documento?: string;
  riesgos?: string;
  beneficios?: string;
  alternativas?: string;
  estado?: 'pendiente' | 'firmado' | 'rechazado';
}

export interface FirmarConsentimientoDTO {
  firma_paciente_url?: string;
  ip_firma?: string;
}

export interface FiltrosConsentimientos {
  paciente_id?: number;
  odontologo?: number;
  estado?: 'pendiente' | 'firmado' | 'rechazado';
  tipo_tratamiento?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  page_size?: number;
}

export interface RespuestaPaginadaConsentimientos {
  count: number;
  next: string | null;
  previous: string | null;
  results: Consentimiento[];
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
    // Intentar obtener IP real del cliente
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('No se pudo obtener IP real, usando placeholder');
    return '0.0.0.0';
  }
};

// ==================== CRUD BÁSICO ====================

/**
 * Listar todos los consentimientos (con filtros opcionales)
 * GET /api/v1/historial-clinico/consentimientos/
 */
export const listarConsentimientos = async (
  filtros?: FiltrosConsentimientos
): Promise<RespuestaPaginadaConsentimientos> => {
  try {
    const params = new URLSearchParams();
    
    if (filtros?.odontologo) params.append('odontologo', filtros.odontologo.toString());
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.tipo_tratamiento) params.append('tipo_tratamiento', filtros.tipo_tratamiento);
    if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.page_size) params.append('page_size', filtros.page_size.toString());

    const queryString = params.toString();
    const url = `/historial-clinico/consentimientos/${queryString ? `?${queryString}` : ''}`;

    console.log('📋 Listando consentimientos:', url);
    const response = await Api.get(url, { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al listar consentimientos:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener detalle de un consentimiento específico
 * GET /api/v1/historial-clinico/consentimientos/{id}/
 */
export const obtenerConsentimiento = async (id: number): Promise<Consentimiento> => {
  try {
    console.log(`📄 Obteniendo consentimiento ${id}`);
    const response = await Api.get(`/historial-clinico/consentimientos/${id}/`, { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener consentimiento ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Crear un nuevo consentimiento
 * POST /api/v1/historial-clinico/consentimientos/
 */
export const crearConsentimiento = async (data: CrearConsentimientoDTO): Promise<Consentimiento> => {
  try {
    console.log('✨ Creando consentimiento:', data);
    const response = await Api.post('/historial-clinico/consentimientos/', data, { headers: getHeaders() });
    
    console.log('✅ Consentimiento creado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al crear consentimiento:', error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar un consentimiento
 * PUT /api/v1/historial-clinico/consentimientos/{id}/
 */
export const actualizarConsentimiento = async (
  id: number,
  data: ActualizarConsentimientoDTO
): Promise<Consentimiento> => {
  try {
    console.log(`🔄 Actualizando consentimiento ${id}:`, data);
    const response = await Api.put(`/historial-clinico/consentimientos/${id}/`, data, { headers: getHeaders() });
    
    console.log('✅ Consentimiento actualizado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar consentimiento ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Eliminar un consentimiento
 * DELETE /api/v1/historial-clinico/consentimientos/{id}/
 */
export const eliminarConsentimiento = async (id: number): Promise<void> => {
  try {
    console.log(`🗑️ Eliminando consentimiento ${id}`);
    await Api.delete(`/historial-clinico/consentimientos/${id}/`, { headers: getHeaders() });
    
    console.log('✅ Consentimiento eliminado');
  } catch (error: any) {
    console.error(`❌ Error al eliminar consentimiento ${id}:`, error);
    throw error.response?.data || error;
  }
};

// ==================== ENDPOINTS CUSTOM ====================

/**
 * Obtener consentimientos de un paciente específico
 * GET /api/v1/historial-clinico/consentimientos/por_paciente/?paciente_id={id}
 */
export const obtenerConsentimientosPorPaciente = async (pacienteId: number): Promise<Consentimiento[]> => {
  try {
    console.log(`📋 Obteniendo consentimientos del paciente ${pacienteId}`);
    const response = await Api.get(
      `/historial-clinico/consentimientos/por_paciente/?paciente_id=${pacienteId}`,
      { headers: getHeaders() }
    );
    
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener consentimientos del paciente ${pacienteId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Firmar un consentimiento (Paciente)
 * POST /api/v1/historial-clinico/consentimientos/{id}/firmar/
 */
export const firmarConsentimiento = async (
  id: number,
  firmaUrl?: string
): Promise<Consentimiento> => {
  try {
    console.log(`✍️ Firmando consentimiento ${id}`);
    
    // Obtener IP del cliente
    const ipCliente = await obtenerIPCliente();
    
    const data: FirmarConsentimientoDTO = {
      ip_firma: ipCliente,
      ...(firmaUrl && { firma_paciente_url: firmaUrl }),
    };
    
    const response = await Api.post(
      `/historial-clinico/consentimientos/${id}/firmar/`,
      data,
      { headers: getHeaders() }
    );
    
    console.log('🎉 Consentimiento firmado exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al firmar consentimiento ${id}:`, error);
    throw error.response?.data || error;
  }
};

// ==================== UTILIDADES ====================

/**
 * Obtener clase CSS según estado
 */
export const getEstadoClase = (estado: string): string => {
  switch (estado) {
    case 'firmado':
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
 * Obtener icono según estado
 */
export const getEstadoIcono = (estado: string): string => {
  switch (estado) {
    case 'firmado':
      return '✅';
    case 'rechazado':
      return '❌';
    case 'pendiente':
      return '⏳';
    default:
      return '📄';
  }
};

/**
 * Obtener texto de estado en español
 */
export const getEstadoTexto = (estado: string): string => {
  switch (estado) {
    case 'firmado':
      return 'Firmado';
    case 'rechazado':
      return 'Rechazado';
    case 'pendiente':
      return 'Pendiente de Firma';
    default:
      return estado;
  }
};

/**
 * Verificar si consentimiento puede ser firmado
 */
export const puedeFirmar = (consentimiento: Consentimiento): boolean => {
  return consentimiento.estado === 'pendiente';
};

/**
 * Verificar si consentimiento puede ser editado
 */
export const puedeEditar = (consentimiento: Consentimiento): boolean => {
  return consentimiento.estado === 'pendiente';
};

/**
 * Formatear fecha de firma
 */
export const formatearFechaFirma = (fecha?: string | null): string => {
  if (!fecha) return 'No firmado';
  
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ==================== EXPORT DEFAULT ====================

export default {
  // CRUD básico
  listarConsentimientos,
  obtenerConsentimiento,
  crearConsentimiento,
  actualizarConsentimiento,
  eliminarConsentimiento,
  
  // Endpoints custom
  obtenerConsentimientosPorPaciente,
  firmarConsentimiento,
  
  // Utilidades
  getEstadoClase,
  getEstadoIcono,
  getEstadoTexto,
  puedeFirmar,
  puedeEditar,
  formatearFechaFirma,
};
