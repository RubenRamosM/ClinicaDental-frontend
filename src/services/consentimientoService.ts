// src/services/consentimientoService.ts
import { Api } from '../lib/Api';

// Interface para los datos que se envían al backend al crear un consentimiento
export interface NuevoConsentimientoData {
  paciente: number; // Se requiere el ID del paciente
  consulta?: number; // ID opcional de la consulta relacionada
  plan_tratamiento?: number; // ID opcional del plan de tratamiento
  titulo: string;
  texto_contenido: string;
  firma_base64: string; // La firma como un string en base64
}

// ✅ NUEVA: Interface para el endpoint crear-y-firmar (compatible con backend actualizado)
export interface CrearYFirmarConsentimientoData {
  paciente: number; // ID del paciente
  consulta?: number; // ID opcional de la consulta relacionada
  tipo_tratamiento: string; // Tipo de tratamiento (ej: "Limpieza Dental")
  contenido_documento: string; // Texto del consentimiento
  firma_paciente_url: string; // Firma en base64 (data:image/png;base64,...)
  
  // Opcionales para tutor legal
  firma_tutor_url?: string;
  nombre_tutor?: string;
  documento_tutor?: string;
}

// Interface que representa el objeto Consentimiento completo que devuelve la API
export interface Consentimiento {
  id: number;
  paciente: number;
  consulta?: number;
  plan_tratamiento?: number;
  titulo: string;
  texto_contenido:string;
  firma_base64: string;
  paciente_nombre: string;
  paciente_apellido: string;
  fecha_creacion: string;
  fecha_creacion_formateada: string;
  ip_creacion: string;
  empresa: number;
}

/**
 * Llama a la API para crear un nuevo registro de consentimiento firmado.
 * @param datos Los datos del consentimiento a guardar.
 * @returns La respuesta de la API con el consentimiento creado.
 * @deprecated Usar crearYFirmarConsentimiento() para pacientes (evita error 403)
 */
export const crearConsentimiento = async (datos: NuevoConsentimientoData): Promise<Consentimiento> => {
  try {
    const response = await Api.post('/historial-clinico/consentimientos/', datos);
    return response.data;
  } catch (error) {
    console.error("Error al crear el consentimiento:", error);
    // Propagar el error para que el componente que llama pueda manejarlo
    throw error;
  }
};

/**
 * ✅ NUEVO: Crea Y firma un consentimiento en un solo paso.
 * Este endpoint permite a los PACIENTES crear y firmar sus propios consentimientos.
 * @param datos Los datos del consentimiento a crear y firmar.
 * @returns La respuesta de la API con el consentimiento creado y firmado.
 */
export const crearYFirmarConsentimiento = async (datos: CrearYFirmarConsentimientoData): Promise<Consentimiento> => {
  try {
    console.log('📤 Enviando al endpoint crear-y-firmar:', datos);
    const response = await Api.post('/historial-clinico/consentimientos/crear-y-firmar/', datos);
    console.log('✅ Consentimiento creado y firmado:', response.data);
    console.log('🔍 [DEBUG] Respuesta COMPLETA del backend:', JSON.stringify(response.data, null, 2));
    console.log('🔍 [DEBUG] Campo consulta en respuesta:', response.data.consulta);
    console.log('🔍 [DEBUG] Tipo de consulta:', typeof response.data.consulta);
    console.log('🔍 [DEBUG] Todas las claves:', Object.keys(response.data));
    return response.data;
  } catch (error) {
    console.error("❌ Error al crear y firmar el consentimiento:", error);
    throw error;
  }
};

/**
 * Llama a la API para obtener la lista de todos los consentimientos de un paciente.
 * @param pacienteId El ID del paciente para filtrar los consentimientos.
 * @returns Una lista de los consentimientos firmados por el paciente.
 */
export const listarConsentimientosDePaciente = async (pacienteId: number): Promise<Consentimiento[]> => {
  try {
    // ✅ CORREGIDO: Usar endpoint correcto con parámetro 'paciente_id'
    const response = await Api.get(`/historial-clinico/consentimientos/por_paciente/?paciente_id=${pacienteId}`);
    // La API devuelve directamente un array, no un objeto paginado
    return response.data || [];
  } catch (error) {
    console.error(`Error al listar los consentimientos del paciente ${pacienteId}:`, error);
    throw error;
  }
};

/**
 * Llama a la API para descargar el PDF de un consentimiento.
 * @param consentimientoId El ID del consentimiento para descargar el PDF.
 */
export const descargarPDFConsentimiento = async (consentimientoId: number): Promise<Blob> => {
  try {
    const response = await Api.get(`/historial-clinico/consentimientos/${consentimientoId}/pdf/`, {
      responseType: 'blob' // Importante para recibir el PDF como blob
    });
    return response.data;
  } catch (error) {
    console.error(`Error al descargar el PDF del consentimiento ${consentimientoId}:`, error);
    throw error;
  }
};






