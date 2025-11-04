import { Api } from "../lib/Api";
import type {
  Consulta,
  ConsultaDetalle,
  FiltrosConsultas,
  RespuestaPaginadaConsultas,
  CrearConsultaDTO,
} from "../interfaces/Consulta";

/**
 * Servicio para gestionar Consultas (Citas)
 * Base URL: /api/v1/citas/
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
 * Obtener listado de consultas con filtros
 * @param filtros Filtros opcionales
 * @returns Lista paginada de consultas
 */
export const obtenerConsultas = async (
  filtros?: FiltrosConsultas
): Promise<RespuestaPaginadaConsultas> => {
  try {
    const response = await Api.get<RespuestaPaginadaConsultas>(
      "/citas/",
      {
        params: filtros,
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener consultas:", error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener consultas de un paciente específico
 * @param pacienteId ID del paciente
 * @param filtrosAdicionales Filtros adicionales opcionales
 * @returns Lista de consultas del paciente
 */
export const obtenerConsultasPorPaciente = async (
  pacienteId: number,
  filtrosAdicionales?: Omit<FiltrosConsultas, 'codpaciente'>
): Promise<Consulta[]> => {
  try {
    const response = await obtenerConsultas({
      codpaciente: pacienteId,
      page_size: 1000, // Obtener todas las consultas del paciente
      ...filtrosAdicionales,
    });
    return response.results;
  } catch (error: any) {
    console.error("Error al obtener consultas del paciente:", error);
    throw error;
  }
};

/**
 * Obtener consultas de un odontólogo específico
 * @param odontologoId ID del odontólogo
 * @param filtrosAdicionales Filtros adicionales opcionales
 * @returns Lista de consultas del odontólogo
 */
export const obtenerConsultasPorOdontologo = async (
  odontologoId: number,
  filtrosAdicionales?: Omit<FiltrosConsultas, 'cododontologo'>
): Promise<Consulta[]> => {
  try {
    const response = await obtenerConsultas({
      cododontologo: odontologoId,
      page_size: 1000,
      ...filtrosAdicionales,
    });
    return response.results;
  } catch (error: any) {
    console.error("Error al obtener consultas del odontólogo:", error);
    throw error;
  }
};

/**
 * Obtener detalle de una consulta específica
 * @param id ID de la consulta
 * @returns Detalle de la consulta
 */
export const obtenerConsulta = async (
  id: number
): Promise<ConsultaDetalle> => {
  try {
    const response = await Api.get<ConsultaDetalle>(
      `/citas/${id}/`,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener consulta:", error);
    throw error.response?.data || error;
  }
};

/**
 * Crear nueva consulta
 * @param datos Datos de la consulta
 * @returns Consulta creada
 */
export const crearConsulta = async (
  datos: CrearConsultaDTO
): Promise<Consulta> => {
  try {
    const response = await Api.post<Consulta>(
      "/citas/",
      datos,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al crear consulta:", error);
    throw error.response?.data || error;
  }
};

/**
 * 🆕 ENDPOINTS CUSTOM DEL BACKEND (agregados desde documentación oficial)
 */

/**
 * Obtener consultas del paciente autenticado
 * Endpoint: GET /api/v1/citas/consultas/mis_consultas/
 * @returns Lista de consultas del usuario logueado (paciente)
 */
export const obtenerMisConsultas = async (): Promise<Consulta[]> => {
  try {
    const response = await Api.get<Consulta[]>(
      "/citas/consultas/mis_consultas/",
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener mis consultas:", error);
    throw error.response?.data || error;
  }
};

/**
 * Confirmar una consulta pendiente
 * Endpoint: POST /api/v1/citas/consultas/{id}/confirmar/
 * @param id ID de la consulta
 * @returns Consulta confirmada
 */
export const confirmarConsulta = async (id: number): Promise<Consulta> => {
  try {
    const response = await Api.post<Consulta>(
      `/citas/consultas/${id}/confirmar/`,
      {},
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al confirmar consulta:", error);
    throw error.response?.data || error;
  }
};

/**
 * Cancelar una consulta
 * Endpoint: POST /api/v1/citas/consultas/{id}/cancelar/
 * @param id ID de la consulta
 * @param motivo Motivo de cancelación
 * @returns Consulta cancelada
 */
export const cancelarConsulta = async (
  id: number,
  motivo: string
): Promise<Consulta> => {
  try {
    const response = await Api.post<Consulta>(
      `/citas/consultas/${id}/cancelar/`,
      { motivo_cancelacion: motivo },
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al cancelar consulta:", error);
    throw error.response?.data || error;
  }
};

/**
 * Marcar consulta como No-Show (paciente no asistió)
 * Endpoint: POST /api/v1/citas/consultas/{id}/marcar-noshow/
 * ⚠️ CRÍTICO: Auto-bloquea pacientes con 3+ faltas (CU18)
 * @param id ID de la consulta
 * @returns Consulta marcada + info de bloqueo si aplica
 */
export const marcarNoShow = async (
  id: number
): Promise<{
  consulta: Consulta;
  total_noshows: number;
  mensaje: string;
  alerta_bloqueo?: string;
}> => {
  try {
    const response = await Api.post(
      `/citas/consultas/${id}/marcar-noshow/`,
      {},
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al marcar no-show:", error);
    throw error.response?.data || error;
  }
};

/**
 * Agregar diagnóstico a una consulta (solo odontólogos)
 * Endpoint: PATCH /api/v1/citas/consultas/{id}/agregar_diagnostico/
 * @param id ID de la consulta
 * @param diagnostico Texto del diagnóstico
 * @param tratamientoRecomendado Tratamiento recomendado (opcional)
 * @returns Consulta actualizada
 */
export const agregarDiagnostico = async (
  id: number,
  diagnostico: string,
  tratamientoRecomendado?: string
): Promise<Consulta> => {
  try {
    const response = await Api.patch<Consulta>(
      `/citas/consultas/${id}/agregar_diagnostico/`,
      {
        diagnostico,
        tratamiento_recomendado: tratamientoRecomendado,
      },
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al agregar diagnóstico:", error);
    throw error.response?.data || error;
  }
};

/**
 * Verificar disponibilidad de horarios
 * Endpoint: GET /api/v1/citas/consultas/disponibilidad/?fecha=YYYY-MM-DD&odontologo_id={id}
 * @param fecha Fecha en formato YYYY-MM-DD
 * @param odontologoId ID del odontólogo (opcional)
 * @returns Horarios disponibles y ocupados
 */
export const verificarDisponibilidad = async (
  fecha: string,
  odontologoId?: number
): Promise<{
  fecha: string;
  odontologo_id: number | null;
  horarios_disponibles: any[];
  horarios_ocupados: number[];
}> => {
  try {
    const params: any = { fecha };
    if (odontologoId) params.odontologo_id = odontologoId;

    const response = await Api.get(
      "/citas/consultas/disponibilidad/",
      { params, headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al verificar disponibilidad:", error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener consultas de hoy
 * Endpoint: GET /api/v1/citas/consultas/hoy/
 * @returns Lista de consultas programadas para hoy
 */
export const obtenerConsultasHoy = async (): Promise<Consulta[]> => {
  try {
    const response = await Api.get<Consulta[]>(
      "/citas/consultas/hoy/",
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener consultas de hoy:", error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener consultas pendientes de confirmación
 * Endpoint: GET /api/v1/citas/consultas/pendientes/
 * @returns Lista de consultas pendientes
 */
export const obtenerConsultasPendientes = async (): Promise<Consulta[]> => {
  try {
    const response = await Api.get<Consulta[]>(
      "/citas/consultas/pendientes/",
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener consultas pendientes:", error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener consultas por fecha específica
 * Endpoint: GET /api/v1/citas/consultas/por-fecha/?fecha=YYYY-MM-DD
 * @param fecha Fecha en formato YYYY-MM-DD
 * @returns Lista de consultas de esa fecha
 */
export const obtenerConsultasPorFecha = async (
  fecha: string
): Promise<Consulta[]> => {
  try {
    const response = await Api.get<Consulta[]>(
      "/citas/consultas/por-fecha/",
      { params: { fecha }, headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener consultas por fecha:", error);
    throw error.response?.data || error;
  }
};

/**
 * Formatear fecha de consulta para mostrar
 * @param fecha Fecha en formato YYYY-MM-DD
 * @returns Fecha formateada
 */
export const formatearFechaConsulta = (fecha: string): string => {
  const date = new Date(fecha + 'T00:00:00');
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

// Exportar todo el servicio
export default {
  // Endpoints básicos CRUD
  obtenerConsultas,
  obtenerConsultasPorPaciente,
  obtenerConsultasPorOdontologo,
  obtenerConsulta,
  crearConsulta,
  
  // 🆕 Endpoints custom del backend
  obtenerMisConsultas,
  confirmarConsulta,
  cancelarConsulta,
  marcarNoShow,
  agregarDiagnostico,
  verificarDisponibilidad,
  obtenerConsultasHoy,
  obtenerConsultasPendientes,
  obtenerConsultasPorFecha,
  
  // Utilidades
  formatearFechaConsulta,
};







