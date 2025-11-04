// src/pages/HistorialPagos.tsx
/**
 * ⚠️ ARCHIVO LEGACY - YA NO SE USA
 * Este componente fue reemplazado por MiPlanTratamiento.tsx
 * 
 * Ruta antigua: /historial-pagos/:planId
 * Ruta nueva: /mi-plan/:planId (incluye historial de pagos completo)
 * 
 * Mantener solo para referencia histórica.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { obtenerPagosPorPlan, formatearMonto, calcularPorcentajePagado } from '../services/pagosService'; // ✅ Nombre correcto
import type { ResumenPagos } from '../interfaces/HistorialPago';
import { ESTADOS_PAGO, METODOS_PAGO } from '../interfaces/HistorialPago';
import TopBar from '../components/TopBar';

export default function HistorialPagos() {
  const { planId } = useParams<{ planId: string }>();
  const [data, setData] = useState<ResumenPagos | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarPagos = async () => {
      if (!planId) return;

      try {
        setLoading(true);
        const response = await obtenerPagosPorPlan(parseInt(planId)); // ✅ Nombre correcto de función
        setData(response);
      } catch (error: any) {
        console.error('Error al cargar pagos:', error);
        toast.error(error.response?.data?.detail || 'Error al cargar el historial de pagos');
      } finally {
        setLoading(false);
      }
    };

    cargarPagos();
  }, [planId]);

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMetodoPagoLabel = (metodo: string) => {
    return METODOS_PAGO.find(m => m.value === metodo)?.label || metodo;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando historial de pagos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No se encontró información de pagos</p>
            <Link to="/mis-planes" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              ← Volver a mis planes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const porcentajePagado = calcularPorcentajePagado(data.total_pagado, data.total_presupuesto);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/mis-planes" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a mis planes
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Historial de Pagos</h1>
          <p className="text-gray-600 mt-2">
            Plan: {data.plan_tratamiento.codigo} - {data.plan_tratamiento.descripcion}
          </p>
        </div>

        {/* Resumen de Pagos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Presupuesto</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatearMonto(data.total_presupuesto)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Pagado</div>
            <div className="text-2xl font-bold text-green-600">
              {formatearMonto(data.total_pagado)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Saldo Pendiente</div>
            <div className="text-2xl font-bold text-orange-600">
              {formatearMonto(data.saldo_pendiente)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Progreso</div>
            <div className="text-2xl font-bold text-blue-600">
              {porcentajePagado}%
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${porcentajePagado}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabla de Pagos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Pagos Realizados ({data.pagos.length})
            </h2>
          </div>

          {data.pagos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>No se han registrado pagos aún</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comprobante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrado por
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.pagos.map((pago) => {
                    const estadoInfo = ESTADOS_PAGO[pago.estado];
                    return (
                      <tr key={pago.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {pago.codigo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatFecha(pago.fecha_pago)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                          {formatearMonto(pago.monto)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {getMetodoPagoLabel(pago.metodo_pago)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pago.numero_comprobante || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            estadoInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                            estadoInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            estadoInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {estadoInfo.icon} {estadoInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {pago.registrado_por}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Nota informativa */}
        {data.saldo_pendiente > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Saldo Pendiente: {formatearMonto(data.saldo_pendiente)}
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Puedes realizar pagos parciales o totales en recepción.
                </p>
              </div>
            </div>
          </div>
        )}

        {data.saldo_pendiente === 0 && data.total_pagado > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  ¡Plan Completamente Pagado!
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Has completado el pago total de tu plan de tratamiento.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
