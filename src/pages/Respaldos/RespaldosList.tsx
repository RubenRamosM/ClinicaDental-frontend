import React, { useState, useEffect } from 'react';
import respaldoService, { type Respaldo } from '../../services/respaldoService';
import CrearRespaldo from './CrearRespaldo';
import RespaldoDetail from './RespaldoDetail';

const RespaldosList: React.FC = () => {
  const [respaldos, setRespaldos] = useState<Respaldo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCrear, setOpenCrear] = useState(false);
  const [selectedRespaldo, setSelectedRespaldo] = useState<number | null>(null);
  const [descargando, setDescargando] = useState<number | null>(null);

  // Cargar respaldos
  const cargarRespaldos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await respaldoService.listarRespaldos();
      setRespaldos(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar respaldos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRespaldos();
  }, []);

  // Descargar respaldo
  const handleDescargar = async (id: number) => {
    try {
      setDescargando(id);
      await respaldoService.descargarArchivo(id);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al descargar respaldo');
    } finally {
      setDescargando(null);
    }
  };

  // Eliminar respaldo
  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este respaldo?')) return;

    try {
      await respaldoService.eliminarRespaldo(id);
      cargarRespaldos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar respaldo');
    }
  };

  // Obtener color según estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'procesando':
        return 'bg-blue-100 text-blue-800';
      case 'fallido':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener icono según tipo
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'automatico':
        return '🤖';
      case 'manual':
        return '👤';
      case 'por_demanda':
        return '⚡';
      default:
        return '📦';
    }
  };

  // Formatear fecha
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatear tamaño
  const formatTamaño = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(2)} KB`;
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-4 text-gray-600">Cargando respaldos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          ☁️ Respaldos en la Nube
        </h1>
        <div className="space-x-2">
          <button
            onClick={cargarRespaldos}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            🔄 Actualizar
          </button>
          <button
            onClick={() => setOpenCrear(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Crear Respaldo
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          ⚠️ {error}
        </div>
      )}

      {/* Tabla de Respaldos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamaño
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {respaldos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-lg font-medium">No hay respaldos disponibles</p>
                    <p className="text-sm mt-2">Crea tu primer respaldo para proteger tus datos</p>
                  </td>
                </tr>
              ) : (
                respaldos.map((respaldo) => (
                  <tr key={respaldo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{respaldo.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span title={respaldo.tipo_respaldo_display} className="text-2xl cursor-help">
                        {getTipoIcon(respaldo.tipo_respaldo)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFecha(respaldo.fecha_respaldo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTamaño(respaldo.tamaño_mb)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {respaldo.numero_registros.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(respaldo.estado)}`}>
                        {respaldo.estado_display}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {respaldo.descripcion || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => setSelectedRespaldo(respaldo.id)}
                        className="text-blue-600 hover:text-blue-900 mx-1"
                        title="Ver detalles"
                      >
                        ℹ️
                      </button>
                      <button
                        onClick={() => handleDescargar(respaldo.id)}
                        disabled={respaldo.estado !== 'completado' || descargando === respaldo.id}
                        className="text-green-600 hover:text-green-900 mx-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Descargar"
                      >
                        {descargando === respaldo.id ? '⏳' : '⬇️'}
                      </button>
                      <button
                        onClick={() => handleEliminar(respaldo.id)}
                        className="text-red-600 hover:text-red-900 mx-1"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {openCrear && (
        <CrearRespaldo
          onClose={() => setOpenCrear(false)}
          onCreated={cargarRespaldos}
        />
      )}

      {selectedRespaldo && (
        <RespaldoDetail
          respaldoId={selectedRespaldo}
          onClose={() => setSelectedRespaldo(null)}
        />
      )}
    </div>
  );
};

export default RespaldosList;
