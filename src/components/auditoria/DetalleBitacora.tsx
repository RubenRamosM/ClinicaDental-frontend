// src/components/auditoria/DetalleBitacora.tsx
import React from 'react';
import type { LogAuditoria } from '../../services/auditoriaService';
import auditoriaService from '../../services/auditoriaService';

interface Props {
  registro: LogAuditoria;
  onCerrar: () => void;
}

const DetalleBitacora: React.FC<Props> = ({ registro, onCerrar }) => {
  const formatearFecha = (fecha: string) => {
    try {
      return new Date(fecha).toLocaleString('es-BO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return fecha;
    }
  };

  const parsearDetalles = () => {
    // Intentar parsear datos_anteriores y datos_nuevos si existen
    const detalles: any = {};
    
    if (registro.datos_anteriores) {
      try {
        detalles.anteriores = typeof registro.datos_anteriores === 'string' 
          ? JSON.parse(registro.datos_anteriores)
          : registro.datos_anteriores;
      } catch {
        detalles.anteriores = registro.datos_anteriores;
      }
    }
    
    if (registro.datos_nuevos) {
      try {
        detalles.nuevos = typeof registro.datos_nuevos === 'string'
          ? JSON.parse(registro.datos_nuevos)
          : registro.datos_nuevos;
      } catch {
        detalles.nuevos = registro.datos_nuevos;
      }
    }
    
    return detalles;
  };

  const detalles = parsearDetalles();
  const tieneDetalles = detalles.anteriores || detalles.nuevos;

  const obtenerIconoNavegador = (userAgent?: string) => {
    if (!userAgent) return '🖥️ Desconocido';
    if (userAgent.includes('Chrome')) return '🌐 Google Chrome';
    if (userAgent.includes('Firefox')) return '🦊 Mozilla Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return '🧭 Safari';
    if (userAgent.includes('Edge')) return '🌊 Microsoft Edge';
    if (userAgent.includes('Opera')) return '🎭 Opera';
    return '🖥️ Otro navegador';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              📊 Detalle de Registro de Auditoría
            </h2>
            <button
              onClick={onCerrar}
              className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* ID y Fecha */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                🆔 ID de Registro
              </label>
              <p className="mt-1 text-lg font-mono text-gray-900">#{registro.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                📅 Fecha y Hora
              </label>
              <p className="mt-1 text-gray-900">{formatearFecha(registro.fecha_hora)}</p>
            </div>
          </div>

          {/* Usuario */}
          <div className="pb-4 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 Usuario
            </label>
            {registro.usuario ? (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-900 font-medium text-lg">{registro.usuario_nombre}</p>
                <p className="text-sm text-gray-600">📧 {registro.usuario_correo}</p>
                <p className="text-sm text-gray-600">🆔 ID: {registro.usuario}</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 italic">🤖 Sistema Automatizado</p>
              </div>
            )}
          </div>

          {/* Acción y Descripción */}
          <div className="space-y-3 pb-4 border-b">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⚡ Acción Realizada
              </label>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800">
                  {auditoriaService.getIconoAccion(registro.accion)} {auditoriaService.getTextoAccion(registro.accion)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${auditoriaService.getColorNivel(registro.nivel || 'info')}`}>
                  {registro.nivel || 'info'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Descripción
              </label>
              <p className="bg-gray-50 rounded-lg p-3 text-gray-900">{registro.descripcion}</p>
            </div>
          </div>

          {/* Módulo/Modelo */}
          <div className="pb-4 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🗂️ Módulo Afectado
            </label>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-900">
                <span className="font-medium">{registro.modelo || 'Sistema'}</span>
                {registro.objeto_id && (
                  <span className="ml-2 text-gray-500">
                    (Registro #{registro.objeto_id})
                  </span>
                )}
              </p>
              {registro.objeto_repr && (
                <p className="text-sm text-gray-600 mt-1">
                  📌 {registro.objeto_repr}
                </p>
              )}
            </div>
          </div>

          {/* IP y User Agent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🌐 Dirección IP
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-900 font-mono text-sm">
                  {registro.ip_address || 'No disponible'}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💻 Navegador
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-900 text-sm">
                  {obtenerIconoNavegador(registro.user_agent)}
                </p>
                {registro.user_agent && (
                  <p className="text-xs text-gray-500 mt-1 truncate" title={registro.user_agent}>
                    {registro.user_agent}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Detalles de Cambios */}
          {tieneDetalles && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔄 Cambios Realizados
              </label>
              <div className="space-y-3">
                {detalles.anteriores && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800 mb-2">❌ Datos Anteriores:</p>
                    <pre className="text-xs text-red-900 overflow-x-auto bg-white p-2 rounded">
                      {JSON.stringify(detalles.anteriores, null, 2)}
                    </pre>
                  </div>
                )}
                {detalles.nuevos && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800 mb-2">✅ Datos Nuevos:</p>
                    <pre className="text-xs text-green-900 overflow-x-auto bg-white p-2 rounded">
                      {JSON.stringify(detalles.nuevos, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 border-t flex justify-end space-x-2">
          <button
            onClick={onCerrar}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleBitacora;
