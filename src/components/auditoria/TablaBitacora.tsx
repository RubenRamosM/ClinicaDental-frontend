// src/components/auditoria/TablaBitacora.tsx
import React, { useEffect, useState } from 'react';
import auditoriaService, { type LogAuditoria } from '../../services/auditoriaService';
import type { FiltrosBitacora } from '../../types/auditoria';

interface Props {
  filtros?: FiltrosBitacora;
  onVerDetalle?: (registro: LogAuditoria) => void;
}

const TablaBitacora: React.FC<Props> = ({ filtros, onVerDetalle }) => {
  const [registros, setRegistros] = useState<LogAuditoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);

  useEffect(() => {
    cargarRegistros();
  }, [filtros, pagina]);

  const cargarRegistros = async () => {
    try {
      setCargando(true);
      const resultado = await auditoriaService.listarLogs({
        ...filtros,
        page: pagina,
        page_size: 20,
      });
      
      // Manejar ambos formatos de respuesta (paginada o array directo)
      if (Array.isArray(resultado)) {
        setRegistros(resultado);
        setTotalRegistros(resultado.length);
        setTotalPaginas(1);
      } else {
        setRegistros(resultado.results || []);
        setTotalRegistros(resultado.count || 0);
        setTotalPaginas(Math.ceil((resultado.count || 0) / 20));
      }
    } catch (error) {
      console.error('Error al cargar registros:', error);
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    try {
      const date = new Date(fecha);
      return new Intl.DateTimeFormat('es-BO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    } catch {
      return fecha;
    }
  };

  const obtenerIconoAccion = (accion: string): string => {
    const iconos: Record<string, string> = {
      login: '🔐',
      logout: '🚪',
      crear: '➕',
      crear_cita: '📅',
      actualizar: '✏️',
      modificar_cita: '✏️',
      eliminar: '🗑️',
      eliminar_cita: '❌',
      ver: '👁️',
      aprobar: '✅',
      rechazar: '❌',
      registro: '📝',
      crear_paciente: '👤',
      modificar_paciente: '✏️',
    };
    return iconos[accion.toLowerCase()] || '📝';
  };

  if (cargando && registros.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Cargando registros...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Fecha y Hora
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Acción
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Módulo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                IP
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registros.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No se encontraron registros con los filtros aplicados
                </td>
              </tr>
            ) : (
              registros.map((registro) => (
                <tr key={registro.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {formatearFecha(registro.fecha_hora || '')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {registro.usuario ? (
                      <div>
                        <p className="font-medium text-gray-900">{registro.usuario_nombre || 'Usuario'}</p>
                        <p className="text-gray-500 text-xs">{registro.usuario_correo || ''}</p>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Sistema</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {obtenerIconoAccion(registro.accion)} {registro.accion}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {registro.descripcion}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {registro.modelo || '-'}
                    {registro.objeto_id && (
                      <span className="ml-2 text-gray-500 text-xs">
                        #{registro.objeto_id}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {registro.ip_address || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => onVerDetalle?.(registro)}
                      className="text-blue-600 hover:text-blue-900 font-medium hover:underline"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{registros.length}</span> de{' '}
                <span className="font-medium">{totalRegistros}</span> registros
              </p>
            </div>
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {pagina} de {totalPaginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {cargando && registros.length > 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default TablaBitacora;
