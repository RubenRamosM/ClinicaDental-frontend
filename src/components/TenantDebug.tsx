/**
 * Componente de Debug para Multi-Tenancy
 * Muestra información sobre el tenant detectado
 * USO: Agregar en la página de Login temporalmente
 */

import { useEffect, useState } from 'react';
import { getTenantInfo, getTenantHeader, getApiBaseUrl } from '../utils/tenant';

export default function TenantDebug() {
  const [tenantInfo, setTenantInfo] = useState(getTenantInfo());
  const [tenantHeader, setTenantHeader] = useState(getTenantHeader());
  const [apiBaseUrl, setApiBaseUrl] = useState(getApiBaseUrl());

  useEffect(() => {
    // Actualizar cada segundo por si cambia la URL
    const interval = setInterval(() => {
      setTenantInfo(getTenantInfo());
      setTenantHeader(getTenantHeader());
      setApiBaseUrl(getApiBaseUrl());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Log en consola
  useEffect(() => {
    console.log('🔍 TENANT DEBUG INFO:');
    console.log('- Hostname:', tenantInfo.hostname);
    console.log('- Subdomain:', tenantInfo.subdomain);
    console.log('- Tenant ID:', tenantInfo.tenantId);
    console.log('- Is Public:', tenantInfo.isPublic);
    console.log('- Display Name:', tenantInfo.displayName);
    console.log('- API Base URL:', apiBaseUrl);
    console.log('- Tenant Header:', tenantHeader);
    console.log('- Environment:', import.meta.env.DEV ? 'DEVELOPMENT' : 'PRODUCTION');
    console.log('- VITE_DOMAIN_BASE:', import.meta.env.VITE_DOMAIN_BASE);
    console.log('- VITE_API_BASE:', import.meta.env.VITE_API_BASE);
  }, [tenantInfo, tenantHeader, apiBaseUrl]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      background: '#1a1a2e',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px 0 0 0',
      fontFamily: 'monospace',
      fontSize: '12px',
      maxWidth: '400px',
      zIndex: 9999,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
    }}>
      <div style={{ borderBottom: '2px solid #16213e', paddingBottom: '10px', marginBottom: '10px' }}>
        <strong style={{ color: '#00d9ff', fontSize: '14px' }}>🔍 TENANT DEBUG</strong>
      </div>
      
      <div style={{ display: 'grid', gap: '8px' }}>
        <div>
          <strong style={{ color: '#ffd700' }}>Hostname:</strong>
          <div style={{ color: '#0ff', marginLeft: '10px' }}>{tenantInfo.hostname}</div>
        </div>

        <div>
          <strong style={{ color: '#ffd700' }}>Subdomain:</strong>
          <div style={{ color: tenantInfo.subdomain ? '#0f0' : '#f00', marginLeft: '10px' }}>
            {tenantInfo.subdomain || 'null (PUBLIC)'}
          </div>
        </div>

        <div>
          <strong style={{ color: '#ffd700' }}>Tenant ID:</strong>
          <div style={{ color: '#0ff', marginLeft: '10px' }}>{tenantInfo.tenantId}</div>
        </div>

        <div>
          <strong style={{ color: '#ffd700' }}>Display Name:</strong>
          <div style={{ color: '#0ff', marginLeft: '10px' }}>{tenantInfo.displayName}</div>
        </div>

        <div>
          <strong style={{ color: '#ffd700' }}>Is Public:</strong>
          <div style={{ color: tenantInfo.isPublic ? '#f00' : '#0f0', marginLeft: '10px' }}>
            {tenantInfo.isPublic ? 'YES ⚠️' : 'NO ✅'}
          </div>
        </div>

        <div>
          <strong style={{ color: '#ffd700' }}>API Base URL:</strong>
          <div style={{ color: '#0ff', marginLeft: '10px', wordBreak: 'break-all' }}>{apiBaseUrl}</div>
        </div>

        <div>
          <strong style={{ color: '#ffd700' }}>Header X-Tenant-Subdomain:</strong>
          <div style={{ 
            color: tenantHeader['X-Tenant-Subdomain'] ? '#0f0' : '#f00', 
            marginLeft: '10px' 
          }}>
            {tenantHeader['X-Tenant-Subdomain'] || 'NOT SET ❌'}
          </div>
        </div>

        <div>
          <strong style={{ color: '#ffd700' }}>Environment:</strong>
          <div style={{ color: '#0ff', marginLeft: '10px' }}>
            {import.meta.env.DEV ? 'DEVELOPMENT' : 'PRODUCTION'}
          </div>
        </div>

        <div>
          <strong style={{ color: '#ffd700' }}>VITE_DOMAIN_BASE:</strong>
          <div style={{ color: '#0ff', marginLeft: '10px' }}>
            {import.meta.env.VITE_DOMAIN_BASE || 'NOT SET'}
          </div>
        </div>

        <div>
          <strong style={{ color: '#ffd700' }}>VITE_API_BASE:</strong>
          <div style={{ color: '#0ff', marginLeft: '10px', wordBreak: 'break-all' }}>
            {import.meta.env.VITE_API_BASE || 'NOT SET'}
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '10px', 
        paddingTop: '10px', 
        borderTop: '1px solid #16213e',
        fontSize: '10px',
        color: '#888'
      }}>
        Actualizado: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
