// ============================================
// EJEMPLOS DE USO - Multi-Tenancy Frontend
// ============================================

import { 
  getTenantInfo, 
  getApiBaseUrl, 
  getTenantHeader,
  validateTenantAccess,
  redirectToTenant,
  getTenantUrl
} from '../utils/tenant';

// ============================================
// EJEMPLO 1: Mostrar Información del Tenant
// ============================================

function TenantDisplay() {
  const tenantInfo = getTenantInfo();
  
  return (
    <div>
      <h2>Información del Tenant Actual</h2>
      <p>Tenant ID: {tenantInfo.tenantId}</p>
      <p>Nombre: {tenantInfo.displayName}</p>
      <p>Hostname: {tenantInfo.hostname}</p>
      <p>Es Público: {tenantInfo.isPublic ? 'Sí' : 'No'}</p>
      <p>Subdominio: {tenantInfo.subdomain || 'Ninguno'}</p>
    </div>
  );
}

// ============================================
// EJEMPLO 2: Login con Validación de Tenant
// ============================================

import { useState } from 'react';
import { Api } from '../lib/Api';

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const tenantInfo = getTenantInfo();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // El header X-Tenant-Subdomain se agrega automáticamente
      const response = await Api.post('/autenticacion/login/', {
        correoelectronico: email,
        password: password
      });
      
      const { token, usuario } = response.data;
      
      // Guardar token
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_data', JSON.stringify(usuario));
      
      // Validar tenant del usuario
      const userTenant = usuario.tenant_id || usuario.clinica_schema || 'public';
      const currentTenant = tenantInfo.tenantId;
      
      if (!validateTenantAccess(userTenant, currentTenant)) {
        console.warn('Usuario pertenece a otro tenant, redirigiendo...');
        redirectToTenant(userTenant);
        return;
      }
      
      // Login exitoso
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error('Error en login:', error.response?.data);
      alert(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div>
      <h2>Login - {tenantInfo.displayName}</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
      
      {/* Mostrar info de desarrollo */}
      {import.meta.env.DEV && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
          <p><strong>Modo Desarrollo</strong></p>
          <p>Tenant: {tenantInfo.tenantId}</p>
          <p>API URL: {getApiBaseUrl()}</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// EJEMPLO 3: Selector de Tenant (Admin)
// ============================================

function TenantSelector() {
  const tenants = ['norte', 'sur', 'este', 'oeste', 'public'];
  const currentTenant = getTenantInfo().tenantId;

  const handleTenantChange = (tenantId: string) => {
    if (tenantId === currentTenant) {
      alert('Ya estás en este tenant');
      return;
    }
    
    if (confirm(`¿Cambiar a ${tenantId}?`)) {
      redirectToTenant(tenantId);
    }
  };

  return (
    <div>
      <h3>Cambiar Tenant</h3>
      <p>Actual: <strong>{currentTenant}</strong></p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        {tenants.map(tenant => (
          <button
            key={tenant}
            onClick={() => handleTenantChange(tenant)}
            disabled={tenant === currentTenant}
            style={{
              padding: '8px 16px',
              background: tenant === currentTenant ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: tenant === currentTenant ? 'not-allowed' : 'pointer'
            }}
          >
            {tenant}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 4: Componente Protegido por Tenant
// ============================================

import { useEffect } from 'react';

function TenantProtectedComponent({ allowedTenants }: { allowedTenants: string[] }) {
  const tenantInfo = getTenantInfo();
  
  useEffect(() => {
    // Verificar acceso
    if (!allowedTenants.includes(tenantInfo.tenantId)) {
      alert('No tienes acceso a esta sección desde este tenant');
      window.location.href = '/dashboard';
    }
  }, [tenantInfo.tenantId, allowedTenants]);

  return (
    <div>
      <h2>Sección Exclusiva</h2>
      <p>Solo disponible para: {allowedTenants.join(', ')}</p>
      <p>Tu tenant: {tenantInfo.tenantId}</p>
    </div>
  );
}

// Uso:
// <TenantProtectedComponent allowedTenants={['norte', 'sur']} />

// ============================================
// EJEMPLO 5: Request Manual con Headers
// ============================================

async function fetchDataManually() {
  const tenantHeaders = getTenantHeader();
  const token = localStorage.getItem('access_token');
  
  try {
    const response = await fetch(`${getApiBaseUrl()}/citas/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
        ...tenantHeaders // Agregar X-Tenant-Subdomain
      }
    });
    
    const data = await response.json();
    console.log('Citas:', data);
    return data;
    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// ============================================
// EJEMPLO 6: Breadcrumb con Tenant
// ============================================

function BreadcrumbWithTenant() {
  const tenantInfo = getTenantInfo();
  
  return (
    <nav style={{ padding: '10px', background: '#f5f5f5' }}>
      <span style={{ color: '#666' }}>
        {tenantInfo.isPublic ? (
          <span>🏠 Sistema Central</span>
        ) : (
          <span>
            🏥 {tenantInfo.displayName} 
            <span style={{ marginLeft: '10px', fontSize: '12px', color: '#999' }}>
              ({tenantInfo.subdomain})
            </span>
          </span>
        )}
      </span>
      <span style={{ margin: '0 10px' }}>/</span>
      <span>Dashboard</span>
    </nav>
  );
}

// ============================================
// EJEMPLO 7: Badge de Tenant
// ============================================

function TenantBadge() {
  const tenantInfo = getTenantInfo();
  
  if (tenantInfo.isPublic) {
    return null; // No mostrar badge en público
  }
  
  const colors = {
    norte: 'bg-blue-500',
    sur: 'bg-green-500',
    este: 'bg-yellow-500',
    oeste: 'bg-purple-500'
  };
  
  const colorClass = colors[tenantInfo.tenantId as keyof typeof colors] || 'bg-gray-500';
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${colorClass}`}>
      🏥 {tenantInfo.displayName}
    </span>
  );
}

// ============================================
// EJEMPLO 8: Hook Personalizado
// ============================================

import { useMemo } from 'react';

function useTenant() {
  const tenantInfo = useMemo(() => getTenantInfo(), []);
  
  return {
    ...tenantInfo,
    apiUrl: getApiBaseUrl(),
    headers: getTenantHeader(),
    isNorte: tenantInfo.tenantId === 'norte',
    isSur: tenantInfo.tenantId === 'sur',
    isEste: tenantInfo.tenantId === 'este',
    isOeste: tenantInfo.tenantId === 'oeste',
    redirectTo: redirectToTenant,
    getUrl: getTenantUrl
  };
}

// Uso:
function MyComponent() {
  const tenant = useTenant();
  
  return (
    <div>
      <p>Tenant: {tenant.displayName}</p>
      <p>API: {tenant.apiUrl}</p>
      {tenant.isNorte && <p>Bienvenido a la Clínica Norte</p>}
    </div>
  );
}

// ============================================
// EJEMPLO 9: Verificar Conexión
// ============================================

import { checkConnection } from '../lib/Api';

async function VerifyConnection() {
  const result = await checkConnection();
  
  if (result.connected) {
    console.log('✅ Conectado al backend');
    console.log('Tenant:', result.tenant);
    console.log('Versión:', result.version);
  } else {
    console.error('❌ Error de conexión:', result.error);
  }
}

// ============================================
// EJEMPLO 10: Componente de Debug
// ============================================

function TenantDebugPanel() {
  const tenantInfo = getTenantInfo();
  
  if (!import.meta.env.DEV) {
    return null; // Solo en desarrollo
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#1a1a1a',
      color: '#00ff00',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#ffff00' }}>
        🔧 DEBUG PANEL
      </div>
      <div><strong>Tenant ID:</strong> {tenantInfo.tenantId}</div>
      <div><strong>Display:</strong> {tenantInfo.displayName}</div>
      <div><strong>Hostname:</strong> {tenantInfo.hostname}</div>
      <div><strong>Subdomain:</strong> {tenantInfo.subdomain || 'none'}</div>
      <div><strong>Is Public:</strong> {tenantInfo.isPublic ? 'Yes' : 'No'}</div>
      <div><strong>API URL:</strong> {getApiBaseUrl()}</div>
      <div style={{ marginTop: '10px' }}>
        <strong>Headers:</strong>
        <pre style={{ fontSize: '10px', marginTop: '5px' }}>
          {JSON.stringify(getTenantHeader(), null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ============================================
// EXPORTAR TODO
// ============================================

export {
  TenantDisplay,
  LoginComponent,
  TenantSelector,
  TenantProtectedComponent,
  fetchDataManually,
  BreadcrumbWithTenant,
  TenantBadge,
  useTenant,
  VerifyConnection,
  TenantDebugPanel
};
