import { Api } from '../lib/Api';

// Interfaces
export interface Respaldo {
  id: number;
  clinica_id: number;
  fecha_respaldo: string;
  tamaño_bytes: number;
  tamaño_mb: number;
  numero_registros: number;
  estado: 'pendiente' | 'procesando' | 'completado' | 'fallido' | 'cancelado';
  estado_display: string;
  tipo_respaldo: 'manual' | 'automatico' | 'por_demanda';
  tipo_respaldo_display: string;
  descripcion: string;
  usuario: number | null;
  fecha_creacion: string;
  puede_restaurar: boolean;
}

export interface RespaldoDetail extends Respaldo {
  archivo_s3: string;
  hash_md5: string;
  tiempo_ejecucion: string;
  tiempo_ejecucion_segundos: number;
  metadata: {
    modelos_respaldados: string[];
    detalles_registros: Record<string, number>;
    tamaño_original_mb: number;
    tamaño_comprimido_mb: number;
    compresion_porcentaje: number;
  };
  usuario_nombre: string | null;
  fecha_actualizacion: string;
}

export interface Estadisticas {
  total_respaldos: number;
  completados: number;
  fallidos: number;
  tamaño_total_mb: number;
  ultimo_respaldo: {
    id: number;
    fecha: string;
    tamaño_mb: number;
  } | null;
}

export interface CrearRespaldoRequest {
  descripcion?: string;
}

export interface DescargarRespaldoResponse {
  url: string;
  expira_en_segundos: number;
  archivo: string;
  tamaño_mb: number;
}

// Servicio de Respaldos
const respaldoService = {
  /**
   * Listar todos los respaldos de la clínica del usuario autenticado
   */
  async listarRespaldos(): Promise<Respaldo[]> {
    try {
      const response = await Api.get('/respaldos/');
      return response.data;
    } catch (error) {
      console.error('Error al listar respaldos:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un respaldo específico
   */
  async obtenerRespaldo(id: number): Promise<RespaldoDetail> {
    try {
      const response = await Api.get(`/respaldos/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener respaldo ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear respaldo manual/por demanda
   */
  async crearRespaldoManual(data: CrearRespaldoRequest): Promise<{
    mensaje: string;
    respaldo: RespaldoDetail;
  }> {
    try {
      const response = await Api.post('/respaldos/crear_respaldo_manual/', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear respaldo manual:', error);
      throw error;
    }
  },

  /**
   * Obtener URL de descarga temporal (válida por 1 hora)
   */
  async obtenerUrlDescarga(id: number): Promise<DescargarRespaldoResponse> {
    try {
      const response = await Api.get(`/respaldos/${id}/descargar/`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener URL de descarga para respaldo ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar respaldo (soft delete)
   */
  async eliminarRespaldo(id: number): Promise<void> {
    try {
      await Api.delete(`/respaldos/${id}/`);
    } catch (error) {
      console.error(`Error al eliminar respaldo ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de respaldos
   */
  async obtenerEstadisticas(): Promise<Estadisticas> {
    try {
      const response = await Api.get('/respaldos/estadisticas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  /**
   * Descargar archivo de respaldo
   */
  async descargarArchivo(id: number): Promise<void> {
    try {
      // Primero obtener la URL prefirmada
      const { url, archivo } = await this.obtenerUrlDescarga(id);
      
      // Crear link temporal y hacer clic programáticamente
      const link = document.createElement('a');
      link.href = url;
      link.download = archivo.split('/').pop() || `respaldo_${id}.json.gz`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Error al descargar respaldo ${id}:`, error);
      throw error;
    }
  },
};

export default respaldoService;
