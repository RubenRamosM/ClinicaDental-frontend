import React, { useState, useEffect } from 'react';
import respaldoService, { type Estadisticas } from '../../services/respaldoService';

const EstadisticasRespaldos: React.FC = () => {
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await respaldoService.obtenerEstadisticas();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status"></div>
          <p className="mt-2 text-gray-600 text-sm">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
        ⚠️ {error}
      </div>
    );
  }

  if (!stats) return null;

  const tasaExito = stats.total_respaldos > 0
    ? ((stats.completados / stats.total_respaldos) * 100).toFixed(1)
    : 0;

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-BO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Estadísticas de Respaldos</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Respaldos */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-4xl mb-2">💾</div>
          <p className="text-3xl font-bold text-blue-600">{stats.total_respaldos}</p>
          <p className="text-sm text-gray-500 mt-1">Total Respaldos</p>
        </div>

        {/* Completados */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-3xl font-bold text-green-600">{stats.completados}</p>
          <p className="text-sm text-gray-500 mt-1">Completados ({tasaExito}%)</p>
        </div>

        {/* Fallidos */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-4xl mb-2">❌</div>
          <p className="text-3xl font-bold text-red-600">{stats.fallidos}</p>
          <p className="text-sm text-gray-500 mt-1">Fallidos</p>
        </div>

        {/* Tamaño Total */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-4xl mb-2">💽</div>
          <p className="text-3xl font-bold text-purple-600">
            {stats.tamaño_total_mb < 1024 
              ? `${stats.tamaño_total_mb.toFixed(1)} MB`
              : `${(stats.tamaño_total_mb / 1024).toFixed(2)} GB`
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">Almacenado</p>
        </div>
      </div>

      {/* Último Respaldo */}
      {stats.ultimo_respaldo && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            🕒 Último Respaldo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Fecha</p>
              <p className="text-sm font-medium">{formatFecha(stats.ultimo_respaldo.fecha)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">ID</p>
              <p className="text-sm font-medium">#{stats.ultimo_respaldo.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Tamaño</p>
              <p className="text-sm font-medium">{stats.ultimo_respaldo.tamaño_mb.toFixed(2)} MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstadisticasRespaldos;
