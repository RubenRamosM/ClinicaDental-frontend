/**
 * Utilidad para detección de tenant multi-tenancy
 * Detecta el subdominio actual y retorna información del tenant
 */

export interface TenantInfo {
  subdomain: string | null;
  isPublic: boolean;
  hostname: string;
  tenantId: string;
  displayName: string;
}

/**
 * Detecta el subdominio actual y retorna información del tenant
 */
export const getTenantInfo = (): TenantInfo => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Configuración desde .env
  const isDevelopment = import.meta.env.DEV;
  const baseDomain = import.meta.env.VITE_DOMAIN_BASE || 'dentaabcxy.store';
  
  let subdomain: string | null = null;
  let isPublic = false;
  
  // DESARROLLO LOCAL (*.localhost:5173)
  if (isDevelopment || hostname.includes('localhost')) {
    if (parts.length > 1 && parts[0] !== 'localhost') {
      // clinica1.localhost -> subdomain = 'clinica1'
      subdomain = parts[0];
    } else {
      // localhost -> tenant público
      isPublic = true;
    }
  }
  // PRODUCCIÓN (*.dentaabcxy.store o cualquier dominio configurado)
  else {
    if (parts.length > 2) {
      // clinica1.dentaabcxy.store -> subdomain = 'clinica1'
      subdomain = parts[0];
    } else if (hostname === baseDomain || hostname === `www.${baseDomain}`) {
      // dentaabcxy.store o www.dentaabcxy.store -> tenant público
      isPublic = true;
    }
  }
  
  return {
    subdomain,
    isPublic,
    hostname,
    tenantId: subdomain || 'public',
    displayName: subdomain ? `Clínica ${subdomain}` : 'Sistema Central'
  };
};

/**
 * Obtiene la URL base del API según el tenant actual
 */
export const getApiBaseUrl = (): string => {
  const isDevelopment = import.meta.env.DEV;
  const { subdomain } = getTenantInfo();
  
  if (isDevelopment) {
    // Desarrollo: siempre localhost:8001 (tu puerto actual)
    return import.meta.env.VITE_API_BASE || 'http://localhost:8001/api/v1';
  }
  
  // Producción: Render
  // El backend maneja el routing por subdominio
  if (subdomain) {
    // Opción 1: Subdominios separados (si los configuras en Render)
    // return `https://${subdomain}.dentaabcxy.store/api/v1`;
    
    // Opción 2: Enviar header personalizado al mismo backend
    return import.meta.env.VITE_API_BASE || 'https://clinicadental-backend.onrender.com/api/v1';
  }
  
  // Público
  return import.meta.env.VITE_API_BASE || 'https://clinicadental-backend.onrender.com/api/v1';
};

/**
 * Genera el header personalizado para multi-tenancy
 */
export const getTenantHeader = (): Record<string, string> => {
  const { subdomain } = getTenantInfo();
  return subdomain ? { 'X-Tenant-Subdomain': subdomain } : {};
};

/**
 * Verifica si el usuario puede acceder a este tenant
 */
export const validateTenantAccess = (userTenant: string, currentTenant: string): boolean => {
  // Admin global puede acceder a cualquier tenant
  if (userTenant === 'public' || userTenant === 'admin') {
    return true;
  }
  
  // Usuario normal solo puede acceder a su tenant
  return userTenant === currentTenant;
};

/**
 * Redirige al subdominio correcto según el tenant del usuario
 */
export const redirectToTenant = (tenantId: string): void => {
  const isDevelopment = import.meta.env.DEV;
  const baseDomain = import.meta.env.VITE_DOMAIN_BASE || 'dentaabcxy.store';
  const currentTenant = getTenantInfo().tenantId;
  
  // Ya está en el tenant correcto
  if (currentTenant === tenantId) {
    return;
  }
  
  // Construir URL del tenant
  let targetUrl: string;
  if (isDevelopment) {
    targetUrl = tenantId === 'public' 
      ? 'http://localhost:5173'
      : `http://${tenantId}.localhost:5173`;
  } else {
    targetUrl = tenantId === 'public'
      ? `https://${baseDomain}`
      : `https://${tenantId}.${baseDomain}`;
  }
  
  // Redirigir
  window.location.href = targetUrl;
};

/**
 * Obtiene la URL completa del frontend para el tenant especificado
 */
export const getTenantUrl = (tenantId: string): string => {
  const isDevelopment = import.meta.env.DEV;
  const baseDomain = import.meta.env.VITE_DOMAIN_BASE || 'dentaabcxy.store';
  
  if (isDevelopment) {
    return tenantId === 'public' 
      ? 'http://localhost:5173'
      : `http://${tenantId}.localhost:5173`;
  }
  
  return tenantId === 'public'
    ? `https://${baseDomain}`
    : `https://${tenantId}.${baseDomain}`;
};
