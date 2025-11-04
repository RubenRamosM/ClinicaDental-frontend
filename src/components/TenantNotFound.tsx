// src/components/TenantNotFound.tsx
import React from 'react';
import { getTenantInfo } from '../utils/tenant';

const TenantNotFound: React.FC = () => {
  const tenantInfo = getTenantInfo();
  
  const goToPublic = () => {
    window.location.href = import.meta.env.DEV 
      ? 'http://localhost:5173'
      : 'https://psicoadmin.xyz';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-md px-6">
        {/* Ícono de clínica */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full">
            <svg 
              className="w-12 h-12 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
              />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Clínica No Encontrada
        </h1>
        
        {/* Mensaje */}
        <p className="text-lg text-gray-600 mb-2">
          La clínica <strong className="text-blue-600 font-semibold">{tenantInfo.tenantId}</strong> no existe o no está activa.
        </p>
        
        {/* Detalles técnicos */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 mt-6">
          <p className="text-sm text-gray-500 mb-2">
            <strong>Hostname:</strong> {tenantInfo.hostname}
          </p>
          <p className="text-sm text-gray-500">
            Verifica que el subdominio sea correcto o contacta al administrador.
          </p>
        </div>
        
        {/* Botón de acción */}
        <button
          onClick={goToPublic}
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
          Ir al Sistema Central
        </button>

        {/* Ayuda adicional en desarrollo */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs font-semibold text-yellow-800 mb-2">
              🔧 Modo Desarrollo - Subdominios Disponibles:
            </p>
            <div className="space-y-1 text-xs text-yellow-700">
              <p>• <code className="bg-yellow-100 px-2 py-1 rounded">http://localhost:5173</code> → Público</p>
              <p>• <code className="bg-yellow-100 px-2 py-1 rounded">http://norte.localhost:5173</code> → Clínica Norte</p>
              <p>• <code className="bg-yellow-100 px-2 py-1 rounded">http://sur.localhost:5173</code> → Clínica Sur</p>
              <p>• <code className="bg-yellow-100 px-2 py-1 rounded">http://este.localhost:5173</code> → Clínica Este</p>
              <p>• <code className="bg-yellow-100 px-2 py-1 rounded">http://oeste.localhost:5173</code> → Clínica Oeste</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantNotFound;
