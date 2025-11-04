/**
 * 🦷 SERVICIO DE ODONTOGRAMAS
 * 
 * Gestión de odontogramas digitales para registro visual del estado dental
 * Backend: /api/v1/historial-clinico/odontogramas/
 * 
 * Endpoints implementados:
 * - GET    /historial-clinico/odontogramas/                    (Listar todos)
 * - GET    /historial-clinico/odontogramas/{id}/               (Ver detalle)
 * - POST   /historial-clinico/odontogramas/                    (Crear nuevo)
 * - PUT    /historial-clinico/odontogramas/{id}/               (Actualizar completo)
 * - PATCH  /historial-clinico/odontogramas/{id}/               (Actualizar parcial)
 * - DELETE /historial-clinico/odontogramas/{id}/               (Eliminar)
 * - POST   /historial-clinico/odontogramas/{id}/actualizar_diente/  (Actualizar diente específico)
 * - GET    /historial-clinico/odontogramas/por_paciente/?paciente_id={id}  (Por paciente)
 * 
 * Sistema de numeración FDI (Fédération Dentaire Internationale):
 * - Adultos: 11-18, 21-28, 31-38, 41-48 (32 dientes)
 * - Niños: 51-55, 61-65, 71-75, 81-85 (20 dientes deciduos)
 */

import { Api } from '../lib/Api';

// ==================== INTERFACES ====================

export interface EstadoDiente {
  numero_diente: number;
  estado: 'sano' | 'caries' | 'obturado' | 'ausente' | 'endodoncia' | 'corona' | 'implante' | 'protesis' | 'otro';
  observaciones?: string;
  color?: string;
  fecha_registro?: string;
}

export interface Odontograma {
  id: number;
  paciente: number;
  odontologo: number;
  fecha_registro: string;
  dientes: EstadoDiente[];
  observaciones_generales?: string;
  tipo_denticion: 'adulto' | 'infantil' | 'mixta';
  
  // Campos expandidos
  paciente_nombre?: string;
  paciente_apellido?: string;
  odontologo_nombre?: string;
  odontologo_apellido?: string;
}

export interface CrearOdontogramaDTO {
  paciente: number;
  odontologo: number;
  fecha_registro?: string;
  dientes: EstadoDiente[];
  observaciones_generales?: string;
  tipo_denticion: 'adulto' | 'infantil' | 'mixta';
}

export interface ActualizarOdontogramaDTO {
  odontologo?: number;
  fecha_registro?: string;
  dientes?: EstadoDiente[];
  observaciones_generales?: string;
  tipo_denticion?: 'adulto' | 'infantil' | 'mixta';
}

export interface ActualizarDienteDTO {
  numero_diente: number;
  estado: 'sano' | 'caries' | 'obturado' | 'ausente' | 'endodoncia' | 'corona' | 'implante' | 'protesis' | 'otro';
  observaciones?: string;
  color?: string;
}

export interface FiltrosOdontogramas {
  paciente?: number;
  odontologo?: number;
  tipo_denticion?: 'adulto' | 'infantil' | 'mixta';
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  page_size?: number;
}

export interface RespuestaPaginadaOdontogramas {
  count: number;
  next: string | null;
  previous: string | null;
  results: Odontograma[];
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
 * Listar todos los odontogramas
 * GET /api/v1/historial-clinico/odontogramas/
 */
export const listarOdontogramas = async (filtros?: FiltrosOdontogramas): Promise<RespuestaPaginadaOdontogramas> => {
  try {
    const params = new URLSearchParams();
    
    if (filtros?.paciente) params.append('paciente', filtros.paciente.toString());
    if (filtros?.odontologo) params.append('odontologo', filtros.odontologo.toString());
    if (filtros?.tipo_denticion) params.append('tipo_denticion', filtros.tipo_denticion);
    if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.page_size) params.append('page_size', filtros.page_size.toString());

    const queryString = params.toString();
    const url = `/historial-clinico/odontogramas/${queryString ? `?${queryString}` : ''}`;

    console.log('📋 Listando odontogramas:', url);
    const response = await Api.get(url, { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al listar odontogramas:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener detalle de un odontograma específico
 * GET /api/v1/historial-clinico/odontogramas/{id}/
 */
export const obtenerOdontograma = async (id: number): Promise<Odontograma> => {
  try {
    console.log(`📄 Obteniendo odontograma ${id}`);
    const response = await Api.get(`/historial-clinico/odontogramas/${id}/`, { headers: getHeaders() });
    
    console.log('✅ Odontograma obtenido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener odontograma ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Crear un nuevo odontograma
 * POST /api/v1/historial-clinico/odontogramas/
 */
export const crearOdontograma = async (data: CrearOdontogramaDTO): Promise<Odontograma> => {
  try {
    console.log('🦷 Creando odontograma:', data);
    const response = await Api.post('/historial-clinico/odontogramas/', data, { headers: getHeaders() });
    
    console.log('✅ Odontograma creado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al crear odontograma:', error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar odontograma completo
 * PUT /api/v1/historial-clinico/odontogramas/{id}/
 */
export const actualizarOdontograma = async (id: number, data: CrearOdontogramaDTO): Promise<Odontograma> => {
  try {
    console.log(`📝 Actualizando odontograma ${id} (completo):`, data);
    const response = await Api.put(`/historial-clinico/odontogramas/${id}/`, data, { headers: getHeaders() });
    
    console.log('✅ Odontograma actualizado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar odontograma ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar odontograma parcialmente
 * PATCH /api/v1/historial-clinico/odontogramas/{id}/
 */
export const actualizarParcialOdontograma = async (id: number, data: ActualizarOdontogramaDTO): Promise<Odontograma> => {
  try {
    console.log(`📝 Actualizando odontograma ${id} (parcial):`, data);
    const response = await Api.patch(`/historial-clinico/odontogramas/${id}/`, data, { headers: getHeaders() });
    
    console.log('✅ Odontograma actualizado parcialmente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar parcialmente odontograma ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Eliminar un odontograma
 * DELETE /api/v1/historial-clinico/odontogramas/{id}/
 */
export const eliminarOdontograma = async (id: number): Promise<void> => {
  try {
    console.log(`🗑️ Eliminando odontograma ${id}`);
    await Api.delete(`/historial-clinico/odontogramas/${id}/`, { headers: getHeaders() });
    
    console.log('✅ Odontograma eliminado exitosamente');
  } catch (error: any) {
    console.error(`❌ Error al eliminar odontograma ${id}:`, error);
    throw error.response?.data || error;
  }
};

// ==================== ENDPOINTS CUSTOM ====================

/**
 * Obtener odontogramas de un paciente específico
 * GET /api/v1/historial-clinico/odontogramas/por_paciente/?paciente_id={id}
 */
export const obtenerOdontogramasPorPaciente = async (pacienteId: number): Promise<Odontograma[]> => {
  try {
    console.log(`📋 Obteniendo odontogramas del paciente ${pacienteId}`);
    const response = await Api.get('/historial-clinico/odontogramas/por_paciente/', {
      params: { paciente_id: pacienteId },
      headers: getHeaders(),
    });
    
    console.log(`✅ Odontogramas obtenidos: ${response.data.length || 0}`);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener odontogramas del paciente ${pacienteId}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar estado de un diente específico
 * POST /api/v1/historial-clinico/odontogramas/{id}/actualizar_diente/
 * 
 * Permite actualizar rápidamente un diente sin enviar el odontograma completo
 */
export const actualizarDiente = async (odontogramaId: number, data: ActualizarDienteDTO): Promise<Odontograma> => {
  try {
    console.log(`🦷 Actualizando diente ${data.numero_diente} en odontograma ${odontogramaId}:`, data);
    const response = await Api.post(
      `/historial-clinico/odontogramas/${odontogramaId}/actualizar_diente/`,
      data,
      { headers: getHeaders() }
    );
    
    console.log('✅ Diente actualizado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar diente ${data.numero_diente}:`, error);
    throw error.response?.data || error;
  }
};

// ==================== UTILIDADES ====================

/**
 * Obtener color según estado del diente
 */
export const getColorEstadoDiente = (estado: string): string => {
  const colores: Record<string, string> = {
    sano: '#4ADE80',           // verde
    caries: '#EF4444',         // rojo
    obturado: '#3B82F6',       // azul
    ausente: '#9CA3AF',        // gris
    endodoncia: '#F59E0B',     // naranja
    corona: '#8B5CF6',         // púrpura
    implante: '#06B6D4',       // cyan
    protesis: '#EC4899',       // rosa
    otro: '#6B7280',           // gris oscuro
  };
  return colores[estado] || '#000000';
};

/**
 * Obtener texto descriptivo del estado
 */
export const getTextoEstadoDiente = (estado: string): string => {
  const textos: Record<string, string> = {
    sano: 'Sano',
    caries: 'Caries',
    obturado: 'Obturado',
    ausente: 'Ausente',
    endodoncia: 'Endodoncia',
    corona: 'Corona',
    implante: 'Implante',
    protesis: 'Prótesis',
    otro: 'Otro',
  };
  return textos[estado] || estado;
};

/**
 * Validar número de diente según FDI
 */
export const validarNumeroDiente = (numero: number, tipoDenticion: 'adulto' | 'infantil' | 'mixta'): boolean => {
  // Adultos: 11-18, 21-28, 31-38, 41-48
  const dientesAdultos = [
    11, 12, 13, 14, 15, 16, 17, 18,
    21, 22, 23, 24, 25, 26, 27, 28,
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48,
  ];
  
  // Niños: 51-55, 61-65, 71-75, 81-85
  const dientesInfantiles = [
    51, 52, 53, 54, 55,
    61, 62, 63, 64, 65,
    71, 72, 73, 74, 75,
    81, 82, 83, 84, 85,
  ];
  
  if (tipoDenticion === 'adulto') {
    return dientesAdultos.includes(numero);
  } else if (tipoDenticion === 'infantil') {
    return dientesInfantiles.includes(numero);
  } else {
    // mixta - permite ambos
    return dientesAdultos.includes(numero) || dientesInfantiles.includes(numero);
  }
};

/**
 * Obtener dientes por cuadrante
 */
export const obtenerDientesPorCuadrante = (odontograma: Odontograma, cuadrante: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): EstadoDiente[] => {
  const primerDigito = cuadrante.toString();
  return odontograma.dientes.filter(d => 
    d.numero_diente.toString().startsWith(primerDigito)
  );
};

/**
 * Calcular estadísticas del odontograma
 */
export const calcularEstadisticas = (odontograma: Odontograma) => {
  const total = odontograma.dientes.length;
  
  const porEstado = odontograma.dientes.reduce((acc, diente) => {
    acc[diente.estado] = (acc[diente.estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sanos = porEstado['sano'] || 0;
  const conCaries = porEstado['caries'] || 0;
  const ausentes = porEstado['ausente'] || 0;
  const obturados = porEstado['obturado'] || 0;
  
  return {
    total,
    sanos,
    conCaries,
    ausentes,
    obturados,
    porcentajeSanos: total > 0 ? Math.round((sanos / total) * 100) : 0,
    porEstado,
  };
};

/**
 * Generar odontograma inicial vacío (todos sanos)
 */
export const generarOdontogramaInicial = (tipoDenticion: 'adulto' | 'infantil' | 'mixta'): EstadoDiente[] => {
  let dientes: number[] = [];
  
  if (tipoDenticion === 'adulto') {
    dientes = [
      11, 12, 13, 14, 15, 16, 17, 18,
      21, 22, 23, 24, 25, 26, 27, 28,
      31, 32, 33, 34, 35, 36, 37, 38,
      41, 42, 43, 44, 45, 46, 47, 48,
    ];
  } else if (tipoDenticion === 'infantil') {
    dientes = [
      51, 52, 53, 54, 55,
      61, 62, 63, 64, 65,
      71, 72, 73, 74, 75,
      81, 82, 83, 84, 85,
    ];
  } else {
    // mixta - incluir ambos
    dientes = [
      11, 12, 13, 14, 15, 16, 17, 18,
      21, 22, 23, 24, 25, 26, 27, 28,
      31, 32, 33, 34, 35, 36, 37, 38,
      41, 42, 43, 44, 45, 46, 47, 48,
      51, 52, 53, 54, 55,
      61, 62, 63, 64, 65,
      71, 72, 73, 74, 75,
      81, 82, 83, 84, 85,
    ];
  }
  
  return dientes.map(numero => ({
    numero_diente: numero,
    estado: 'sano',
    observaciones: '',
    color: getColorEstadoDiente('sano'),
  }));
};

/**
 * Formatear fecha de registro
 */
export const formatearFechaRegistro = (fecha: string): string => {
  try {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return fecha;
  }
};

// ==================== EXPORT DEFAULT ====================

export default {
  // CRUD básico
  listarOdontogramas,
  obtenerOdontograma,
  crearOdontograma,
  actualizarOdontograma,
  actualizarParcialOdontograma,
  eliminarOdontograma,
  
  // Endpoints custom
  obtenerOdontogramasPorPaciente,
  actualizarDiente,
  
  // Utilidades
  getColorEstadoDiente,
  getTextoEstadoDiente,
  validarNumeroDiente,
  obtenerDientesPorCuadrante,
  calcularEstadisticas,
  generarOdontogramaInicial,
  formatearFechaRegistro,
};
