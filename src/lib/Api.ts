import axios, { AxiosHeaders } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl, getTenantHeader, getTenantInfo } from '../utils/tenant';

// 🌐 Configuración dinámica de la API con multi-tenancy
const baseURL = getApiBaseUrl();

console.log("🔧 API Configuration:");
console.log("- Environment:", import.meta.env.DEV ? "development" : "production");
console.log("- Tenant:", getTenantInfo().tenantId);
console.log("- baseURL:", baseURL);

export const Api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
});

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  idtipousuario: number; // ✅ AGREGADO: Campo directo del backend para checks de roles
  tipo_usuario: {
    id: number;
    rol: string;
  };
  odontologo?: {
    codusuario: number;
    especialidad: string;
    nromatricula: string;
  };
  paciente?: {
    codusuario: number;
  };
  recepcionista?: {
    codusuario: number;
  };
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() ?? null;
  return null;
}

// 👉 Helper para saber si una URL es absoluta (no la tocamos en ese caso)
function isAbsoluteUrl(u: string): boolean {
  return /^https?:\/\//i.test(u);
}

// 👉 Interceptor: normaliza URL para evitar doble "/api" y agrega headers de tenant
Api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // --- Normalización anti "/api/api/..." ---
  if (typeof config.url === "string" && !isAbsoluteUrl(config.url)) {
    const base = String(config.baseURL ?? Api.defaults.baseURL ?? "");
    let url = config.url;

    // Asegura slash inicial en rutas relativas
    if (!url.startsWith("/")) url = `/${url}`;

    // Si base termina en "/api" y la url empieza con "/api/", quita el prefijo duplicado
    if (base.endsWith("/api") && url.startsWith("/api/")) {
      url = url.replace(/^\/api\/+/, "/"); // "/api/usuario/me" -> "/usuario/me"
    }

    config.url = url;
  }

  // --- Headers de Multi-Tenancy ---
  const tenantHeaders = getTenantHeader();
  const hdrs = AxiosHeaders.from(config.headers);
  
  // Agregar headers de tenant
  Object.entries(tenantHeaders).forEach(([key, value]) => {
    hdrs.set(key, value);
  });
  
  config.headers = hdrs;
  
  // Log para debugging en desarrollo
  if (import.meta.env.DEV) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      tenant: getTenantInfo().tenantId,
      tenantHeaders
    });
  }
  
  return config;
});

// Interceptor de respuesta - Manejo de errores y multi-tenancy
Api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Error 404: Tenant no encontrado
    if (error.response?.status === 404 && error.response?.data?.error?.includes('tenant')) {
      console.error('❌ Tenant no encontrado:', getTenantInfo().tenantId);
      // Redirigir al público
      window.location.href = import.meta.env.DEV 
        ? 'http://localhost:5173'
        : 'https://psicoadmin.xyz';
    }
    
    // Error 401: No autenticado
    if (error.response?.status === 401) {
      console.warn('⚠️ Token expirado o inválido - redirigiendo a login');
      localStorage.removeItem('access_token');
      localStorage.removeItem('userData');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    console.error("❌ API Error:", error.config?.url, error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// NOTA: seedCsrf() eliminado - Este backend NO usa CSRF, usa Token Authentication

export const updateUserSettings = async (settings: { recibir_notificaciones: boolean }, token: string) => {
  try {
    const response = await Api.patch('/auth/user/settings/', settings, {
      headers: { 'Authorization': `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar las preferencias:", error);
    throw error;
  }
};

export const cancelarCita = async (consultaId: number, motivo?: string): Promise<void> => {
  try {
    await Api.post(`/citas/${consultaId}/cancelar/`, { motivo_cancelacion: motivo || '' });
  } catch (error) {
    console.error(`Error al cancelar la cita ${consultaId}:`, error);
    throw error;
  }
};

export const reprogramarCita = async (consultaId: number, nuevaFecha: string, nuevoHorarioId: number) => {
  try {
    const response = await Api.patch(`/citas/${consultaId}/reprogramar/`, {
      fecha: nuevaFecha,
      idhorario: nuevoHorarioId,
    });
    return response.data;
  } catch (error) {
    console.error(`Error al reprogramar la cita ${consultaId}:`, error);
    throw error;
  }
};

export const obtenerHorariosDisponibles = async (fecha: string, odontologoId: number) => {
  try {
    const response = await Api.get(`/citas/horarios/disponibles/?fecha=${fecha}&odontologo_id=${odontologoId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener horarios disponibles:', error);
    throw error;
  }
};

// ============================================
// UTILIDADES MULTI-TENANCY
// ============================================

/**
 * Manejo genérico de errores de API
 */
export const handleApiError = (error: any, customMessage = '') => {
  const message = error.response?.data?.error 
    || error.response?.data?.message 
    || error.message 
    || customMessage
    || 'Ocurrió un error inesperado';
  
  return {
    message,
    status: error.response?.status,
    data: error.response?.data
  };
};

/**
 * Verificar conexión con el backend y obtener info del tenant
 */
export const checkConnection = async () => {
  try {
    const response = await Api.get('/');
    return {
      connected: true,
      tenant: response.data.tenant,
      version: response.data.version
    };
  } catch (error: any) {
    return {
      connected: false,
      error: handleApiError(error)
    };
  }
};






