import { Api } from "../lib/Api";
import type {
  Servicio,
  ServicioListado,
  RespuestaPaginada,
  FiltrosServicios,
  NuevoServicio,
} from "../interfaces/Servicio";

/**
 * Servicio para gestionar el catálogo de servicios dentales
 * 
 * Base URL: /administracion/servicios/
 * URL completa: {baseURL}/administracion/servicios/
 * 
 * Ejemplo en desarrollo: http://localhost:8001/api/v1/administracion/servicios/
 * 
 * ✅ Acceso público (GET) - No requiere autenticación
 * ✅ Operaciones de admin (POST/PUT/DELETE) - Requiere autenticación
 */

/**
 * Obtiene el listado de servicios con filtros, búsqueda y paginación
 * @param filtros - Filtros opcionales para la búsqueda
 * @returns Promise con la respuesta paginada de servicios
 * 
 * NOTA: El backend devuelve un objeto paginado {count, next, previous, results[]}.
 */
export async function obtenerServicios(
  filtros?: FiltrosServicios
): Promise<RespuestaPaginada<ServicioListado> | ServicioListado[]> {
  try {
    const response = await Api.get<RespuestaPaginada<ServicioListado> | ServicioListado[]>(
      "/administracion/servicios/",
      {
        params: filtros,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    throw error;
  }
}

/**
 * Obtiene el detalle completo de un servicio específico
 * @param id - ID del servicio a consultar
 * @returns Promise con los datos completos del servicio
 */
export async function obtenerServicio(id: number): Promise<Servicio> {
  try {
    const response = await Api.get<Servicio>(`/administracion/servicios/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener servicio ${id}:`, error);
    throw error;
  }
}

/**
 * Obtiene el detalle completo de un servicio usando el endpoint extendido
 * @param id - ID del servicio a consultar
 * @returns Promise con los datos completos del servicio
 */
export async function obtenerDetalleCompleto(id: number): Promise<Servicio> {
  try {
    const response = await Api.get<Servicio>(
      `/administracion/servicios/${id}/detalle_completo/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener detalle completo del servicio ${id}:`, error);
    throw error;
  }
}

/**
 * Crea un nuevo servicio en el catálogo (solo administradores)
 * @param servicio - Datos del nuevo servicio
 * @returns Promise con el servicio creado
 */
export async function crearServicio(
  servicio: NuevoServicio
): Promise<Servicio> {
  try {
    const response = await Api.post<Servicio>("/administracion/servicios/", servicio);
    return response.data;
  } catch (error) {
    console.error("Error al crear servicio:", error);
    throw error;
  }
}

/**
 * Actualiza completamente un servicio existente (solo administradores)
 * @param id - ID del servicio a actualizar
 * @param servicio - Datos actualizados del servicio
 * @returns Promise con el servicio actualizado
 */
export async function actualizarServicio(
  id: number,
  servicio: NuevoServicio
): Promise<Servicio> {
  try {
    const response = await Api.put<Servicio>(
      `/administracion/servicios/${id}/`,
      servicio
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar servicio ${id}:`, error);
    throw error;
  }
}

/**
 * Actualiza parcialmente un servicio existente (solo administradores)
 * @param id - ID del servicio a actualizar
 * @param cambios - Campos a actualizar
 * @returns Promise con el servicio actualizado
 */
export async function actualizarServicioParcial(
  id: number,
  cambios: Partial<NuevoServicio>
): Promise<Servicio> {
  try {
    const response = await Api.patch<Servicio>(
      `/administracion/servicios/${id}/`,
      cambios
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar parcialmente servicio ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina un servicio del catálogo (solo administradores)
 * @param id - ID del servicio a eliminar
 * @returns Promise vacía
 */
export async function eliminarServicio(id: number): Promise<void> {
  try {
    await Api.delete(`/administracion/servicios/${id}/`);
  } catch (error) {
    console.error(`Error al eliminar servicio ${id}:`, error);
    throw error;
  }
}







