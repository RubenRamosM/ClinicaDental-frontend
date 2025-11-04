import { Api } from "../lib/Api";
import type {
  SesionTratamiento,
  SesionTratamientoDetalle,
  SesionesPaginadas,
  FormularioSesion,
  ProgresoItem,
  ProgresoPlan,
  SesionesPorPlan,
  EstadisticasOdontologo,
  QueryParamsSesiones,
  MarcarCompletadoRequest,
  MarcarCompletadoResponse,
} from "../interfaces/SesionTratamiento";

/**
 * Servicio para gestionar sesiones de tratamiento
 * Base URL: /api/v1/tratamientos/sesiones-tratamiento/
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
 * 1. Listar Sesiones (GET /api/v1/tratamientos/sesiones-tratamiento/)
 * @param params Query parameters opcionales para filtrar
 * @returns Lista paginada de sesiones
 */
export const listarSesiones = async (
  params?: QueryParamsSesiones
): Promise<SesionesPaginadas> => {
  try {
    const response = await Api.get<SesionesPaginadas>(
      "/tratamientos/sesiones-tratamiento/",
      {
        params,
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al listar sesiones:", error);
    throw error.response?.data || error;
  }
};

/**
 * 2. Crear Sesión (POST /api/sesiones-tratamiento/)
 * @param datos Datos del formulario de sesión
 * @returns Sesión creada
 */
export const crearSesion = async (
  datos: FormularioSesion
): Promise<SesionTratamiento> => {
  try {
    const response = await Api.post<SesionTratamiento>(
      "/tratamientos/sesiones-tratamiento/",
      datos,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al crear sesión:", error);
    throw error.response?.data || error;
  }
};

/**
 * 3. Obtener Detalle de Sesión (GET /api/sesiones-tratamiento/{id}/)
 * @param id ID de la sesión
 * @returns Detalle completo de la sesión
 */
export const obtenerSesion = async (
  id: number
): Promise<SesionTratamientoDetalle> => {
  try {
    const response = await Api.get<SesionTratamientoDetalle>(
      `/tratamientos/sesiones-tratamiento/${id}/`,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener sesión:", error);
    throw error.response?.data || error;
  }
};

/**
 * 4. Actualizar Sesión (PATCH /api/sesiones-tratamiento/{id}/)
 * @param id ID de la sesión
 * @param datos Datos a actualizar (parciales)
 * @returns Sesión actualizada
 */
export const actualizarSesion = async (
  id: number,
  datos: Partial<FormularioSesion>
): Promise<SesionTratamiento> => {
  try {
    const response = await Api.patch<SesionTratamiento>(
      `/tratamientos/sesiones-tratamiento/${id}/`,
      datos,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al actualizar sesión:", error);
    throw error.response?.data || error;
  }
};

/**
 * 5. Eliminar Sesión (DELETE /api/sesiones-tratamiento/{id}/)
 * @param id ID de la sesión
 */
export const eliminarSesion = async (id: number): Promise<void> => {
  try {
    await Api.delete(`/tratamientos/sesiones-tratamiento/${id}/`, {
      headers: getHeaders(),
    });
  } catch (error: any) {
    console.error("Error al eliminar sesión:", error);
    throw error.response?.data || error;
  }
};

/**
 * 6. Sesiones por Paciente (GET /api/sesiones-tratamiento/paciente/{paciente_id}/)
 * @param pacienteId ID del paciente
 * @param fechaDesde Fecha de inicio del filtro (opcional)
 * @param fechaHasta Fecha de fin del filtro (opcional)
 * @returns Objeto con información del paciente y sus sesiones
 */
export const obtenerSesionesPorPaciente = async (
  pacienteId: number,
  fechaDesde?: string,
  fechaHasta?: string
) => {
  try {
    const params: Record<string, string> = {};
    if (fechaDesde) params.fecha_desde = fechaDesde;
    if (fechaHasta) params.fecha_hasta = fechaHasta;

    const response = await Api.get(
      `/tratamientos/sesiones-tratamiento/paciente/${pacienteId}/`,
      {
        params,
        headers: getHeaders(),
      }
    );
    
    // Backend retorna: { paciente_id, nombre_paciente, total_sesiones, sesiones: [] }
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener sesiones por paciente:", error);
    throw error.response?.data || error;
  }
};

/**
 * 10. Sesiones por Plan (GET /api/sesiones-tratamiento/por-plan/{plan_id}/)
 * @param planId ID del plan de tratamiento
 * @returns Sesiones agrupadas por ítem
 */
export const obtenerSesionesPorPlan = async (
  planId: number
): Promise<SesionesPorPlan> => {
  try {
    console.log("📡 [obtenerSesionesPorPlan] Iniciando petición...");
    console.log("  - Plan ID:", planId);
    console.log("  - URL completa:", `/tratamientos/sesiones-tratamiento/por-plan/${planId}/`);
    console.log("  - Headers:", getHeaders());

    const response = await Api.get<SesionesPorPlan>(
      `/tratamientos/sesiones-tratamiento/por-plan/${planId}/`,
      {
        headers: getHeaders(),
      }
    );

    console.log("✅ [obtenerSesionesPorPlan] Respuesta recibida:");
    console.log("  - Status:", response.status);
    console.log("  - Data completa:", response.data);
    console.log("  - Tipo de data:", typeof response.data);
    console.log("  - Claves en data:", Object.keys(response.data));
    
    if (response.data) {
      console.log("  - plan_id:", response.data.plan_id);
      console.log("  - count:", response.data.count);
      console.log("  - sesiones:", response.data.sesiones);
      console.log("  - Tipo de sesiones:", Array.isArray(response.data.sesiones) ? "Array" : typeof response.data.sesiones);
      console.log("  - Cantidad de sesiones:", response.data.sesiones?.length);
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ [obtenerSesionesPorPlan] Error al obtener sesiones por plan:", error);
    console.error("  - Error completo:", error);
    console.error("  - Response data:", error.response?.data);
    console.error("  - Status:", error.response?.status);
    throw error.response?.data || error;
  }
};

/**
 * 7. Estadísticas del Odontólogo (GET /api/sesiones-tratamiento/estadisticas/odontologo/{id}/)
 * @param odontologoId ID del odontólogo (OBLIGATORIO)
 * @param fechaDesde Fecha de inicio del periodo (opcional)
 * @param fechaHasta Fecha de fin del periodo (opcional)
 * @returns Estadísticas del odontólogo
 */
export const obtenerEstadisticasOdontologo = async (
  odontologoId: number,
  fechaDesde?: string,
  fechaHasta?: string
): Promise<EstadisticasOdontologo> => {
  try {
    const params: Record<string, string> = {};
    if (fechaDesde) params.fecha_desde = fechaDesde;
    if (fechaHasta) params.fecha_hasta = fechaHasta;

    const response = await Api.get<EstadisticasOdontologo>(
      `/tratamientos/sesiones-tratamiento/estadisticas/odontologo/${odontologoId}/`,
      {
        params,
        headers: getHeaders(),
      }
    );
    
    // Backend retorna: { odontologo_id, nombre_completo, estadisticas: {...}, por_mes: [...] }
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener estadísticas del odontólogo:", error);
    throw error.response?.data || error;
  }
};

/**
 * 8. Iniciar Sesión (POST /api/sesiones-tratamiento/{id}/iniciar/)
 * @param id ID de la sesión
 * @returns Sesión actualizada con estado 'en_curso'
 */
export const iniciarSesion = async (id: number): Promise<SesionTratamiento> => {
  try {
    const response = await Api.post<SesionTratamiento>(
      `/tratamientos/sesiones-tratamiento/${id}/iniciar/`,
      {},
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error);
    throw error.response?.data || error;
  }
};

/**
 * 9. Completar Sesión (POST /api/sesiones-tratamiento/{id}/completar/)
 * @param id ID de la sesión
 * @param datos Observaciones, recomendaciones, próxima sesión
 * @returns Sesión actualizada con estado 'completada'
 */
export const completarSesion = async (
  id: number,
  datos?: {
    observaciones?: string;
    recomendaciones?: string;
    proxima_sesion_programada?: string;
  }
): Promise<SesionTratamiento> => {
  try {
    const response = await Api.post<SesionTratamiento>(
      `/tratamientos/sesiones-tratamiento/${id}/completar/`,
      datos || {},
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al completar sesión:", error);
    throw error.response?.data || error;
  }
};

/**
 * 10. Cancelar Sesión (POST /api/sesiones-tratamiento/{id}/cancelar/)
 * @param id ID de la sesión
 * @param motivo Motivo de cancelación
 * @returns Sesión actualizada con estado 'cancelada'
 */
export const cancelarSesion = async (
  id: number,
  motivo?: string
): Promise<SesionTratamiento> => {
  try {
    const response = await Api.post<SesionTratamiento>(
      `/tratamientos/sesiones-tratamiento/${id}/cancelar/`,
      { motivo },
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al cancelar sesión:", error);
    throw error.response?.data || error;
  }
};

/**
 * Función auxiliar para validar el formulario de sesión antes de enviar
 * @param datos Datos del formulario
 * @param progresoAnterior Progreso anterior del ítem
 * @returns Objeto con errores o null si no hay errores
 */
export const validarFormularioSesion = (
  datos: FormularioSesion,
  progresoAnterior: number
): Record<string, string> | null => {
  const errores: Record<string, string> = {};

  // Validar progreso
  if (datos.progreso_actual < 0 || datos.progreso_actual > 100) {
    errores.progreso_actual = "El progreso debe estar entre 0 y 100%";
  }

  if (datos.progreso_actual < progresoAnterior) {
    errores.progreso_actual = `El progreso no puede ser menor a ${progresoAnterior}%`;
  }

  // Validar duración
  if (datos.duracion_minutos <= 0) {
    errores.duracion_minutos = "La duración debe ser mayor a 0 minutos";
  }

  // Validar campos obligatorios
  if (!datos.acciones_realizadas?.trim()) {
    errores.acciones_realizadas = "Debe describir las acciones realizadas";
  }

  if (!datos.fecha_sesion) {
    errores.fecha_sesion = "La fecha de sesión es obligatoria";
  }

  if (!datos.item_plan) {
    errores.item_plan = "Debe seleccionar un ítem del plan";
  }

  if (!datos.consulta) {
    errores.consulta = "Debe seleccionar una consulta";
  }

  return Object.keys(errores).length === 0 ? null : errores;
};

/**
 * Función auxiliar para formatear fecha a YYYY-MM-DD
 * @param fecha Fecha a formatear
 * @returns String con formato YYYY-MM-DD
 */
export const formatearFecha = (fecha: Date): string => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Función auxiliar para formatear fecha de YYYY-MM-DD a DD/MM/YYYY
 * @param fecha String con formato YYYY-MM-DD (puede ser null/undefined)
 * @returns String con formato DD/MM/YYYY o mensaje de error
 */
export const formatearFechaLegible = (fecha: string | null | undefined): string => {
  if (!fecha) {
    return "Fecha no disponible";
  }
  try {
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error al formatear fecha:", fecha, error);
    return fecha; // Retornar la fecha original si falla el formato
  }
};

/**
 * Función auxiliar para formatear hora a HH:MM:SS
 * @param fecha Fecha con hora a formatear
 * @returns String con formato HH:MM:SS
 */
export const formatearHora = (fecha: Date): string => {
  const hours = String(fecha.getHours()).padStart(2, "0");
  const minutes = String(fecha.getMinutes()).padStart(2, "0");
  const seconds = String(fecha.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Función auxiliar para parsear progreso de string a número
 * @param progreso Progreso como string decimal
 * @returns Progreso como número
 */
export const parsearProgreso = (progreso: string): number => {
  return parseFloat(progreso) || 0;
};

/**
 * Función auxiliar para determinar el color de la barra de progreso
 * @param progreso Progreso en porcentaje (0-100)
 * @returns Clase de color
 */
export const obtenerColorProgreso = (progreso: number): string => {
  if (progreso === 0) return "bg-gray-400";
  if (progreso < 30) return "bg-red-500";
  if (progreso < 70) return "bg-yellow-500";
  if (progreso < 100) return "bg-blue-500";
  return "bg-green-500";
};

/**
 * Función auxiliar para formatear duración en minutos a horas y minutos
 * @param minutos Duración en minutos
 * @returns String formateado
 */
export const formatearDuracion = (minutos: number): string => {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
};

// Exportar todo el servicio como objeto por si se prefiere esa forma de importación
export default {
  listarSesiones,
  crearSesion,
  obtenerSesion,
  actualizarSesion,
  eliminarSesion,
  obtenerSesionesPorPaciente,
  obtenerSesionesPorPlan,
  obtenerEstadisticasOdontologo,
  iniciarSesion,
  completarSesion,
  cancelarSesion,
  validarFormularioSesion,
  formatearFecha,
  formatearHora,
  parsearProgreso,
  obtenerColorProgreso,
  formatearDuracion,
};







