import React, { useState, useEffect } from 'react';
import respaldoService, { type RespaldoDetail as RespaldoDetailType } from '../../services/respaldoService';

interface RespaldoDetailProps {
  respaldoId: number;
  onClose: () => void;
}

const RespaldoDetail: React.FC<RespaldoDetailProps> = ({ respaldoId, onClose }) => {
  const [respaldo, setRespaldo] = useState<RespaldoDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    cargarRespaldo();
  }, [respaldoId]);

  const cargarRespaldo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await respaldoService.obtenerRespaldo(respaldoId);
      setRespaldo(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar detalles');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async () => {
    try {
      setDescargando(true);
      await respaldoService.descargarArchivo(respaldoId);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al descargar respaldo');
    } finally {
      setDescargando(false);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              ℹ️ Detalles del Respaldo #{respaldoId}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full" role="status"></div>
                <p className="mt-4 text-gray-600">Cargando detalles...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              ⚠️ {error}
            </div>
          ) : respaldo ? (
            <div className="space-y-6">
              {/* Información General */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Fecha de Creación</p>
                    <p className="text-sm font-medium">{formatFecha(respaldo.fecha_respaldo)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Estado</p>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      respaldo.estado === 'completado' ? 'bg-green-100 text-green-800' :
                      respaldo.estado === 'procesando' ? 'bg-blue-100 text-blue-800' :
                      respaldo.estado === 'fallido' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {respaldo.estado_display}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Tipo</p>
                    <p className="text-sm font-medium">{respaldo.tipo_respaldo_display}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Creado por</p>
                    <p className="text-sm font-medium">{respaldo.usuario_nombre || 'Sistema'}</p>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  📊 Estadísticas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {respaldo.numero_registros.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">Registros</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {respaldo.tamaño_mb.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">MB Comprimido</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {respaldo.metadata?.compresion_porcentaje?.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-gray-600">Compresión</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {respaldo.tiempo_ejecucion_segundos.toFixed(1)}s
                    </p>
                    <p className="text-xs text-gray-600">Tiempo</p>
                  </div>
                </div>
              </div>

              {/* Modelos Respaldados */}
              {respaldo.metadata?.detalles_registros && Object.keys(respaldo.metadata.detalles_registros).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    📦 Modelos Respaldados
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(respaldo.metadata.detalles_registros).map(([modelo, count]) => (
                        <div key={modelo} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                          <span className="text-sm font-medium text-gray-700">{modelo}</span>
                          <span className="text-sm text-gray-500">
                            {count} registro{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Información Técnica */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-700">Información Técnica</h3>
                <div className="space-y-1 text-xs text-gray-500">
                  <p><strong>Archivo S3:</strong> {respaldo.archivo_s3}</p>
                  <p><strong>Hash MD5:</strong> {respaldo.hash_md5}</p>
                  {respaldo.descripcion && (
                    <p className="mt-2"><strong>Descripción:</strong> {respaldo.descripcion}</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cerrar
          </button>
          {respaldo?.estado === 'completado' && (
            <button
              onClick={handleDescargar}
              disabled={descargando}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {descargando ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Descargando...
                </>
              ) : (
                <>
                  ⬇️ Descargar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RespaldoDetail;
