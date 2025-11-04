// src/components/auditoria/FiltrosBitacora.tsx
import React, { useState } from 'react';
import type { FiltrosBitacora as IFiltrosBitacora } from '../../types/auditoria';

interface Props {
  onFiltrosChange: (filtros: IFiltrosBitacora) => void;
}

const FiltrosBitacora: React.FC<Props> = ({ onFiltrosChange }) => {
  const [accion, setAccion] = useState('');
  const [modelo, setModelo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [nivel, setNivel] = useState('');

  const handleAplicarFiltros = () => {
    const filtros: IFiltrosBitacora = {};
    
    if (accion) filtros.accion = accion;
    if (modelo) filtros.tabla_afectada = modelo;
    if (busqueda) filtros.search = busqueda;
    if (fechaDesde) filtros.fecha_desde = fechaDesde;
    if (fechaHasta) filtros.fecha_hasta = fechaHasta;
    if (nivel) filtros.nivel = nivel;
    
    onFiltrosChange(filtros);
  };

  const handleLimpiarFiltros = () => {
    setAccion('');
    setModelo('');
    setBusqueda('');
    setFechaDesde('');
    setFechaHasta('');
    setNivel('');
    onFiltrosChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtros de Búsqueda</h3>
      
      <div className="space-y-4">
        {/* Primera fila: Búsqueda general y Acción */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔎 Búsqueda General
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="IP, usuario, descripción..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ⚡ Acción
            </label>
            <select
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las acciones</option>
              <option value="login">🔐 Inicio de sesión</option>
              <option value="logout">🚪 Cierre de sesión</option>
              <option value="crear">➕ Crear</option>
              <option value="actualizar">✏️ Actualizar</option>
              <option value="eliminar">🗑️ Eliminar</option>
              <option value="ver">👁️ Ver</option>
              <option value="aprobar">✅ Aprobar</option>
              <option value="rechazar">❌ Rechazar</option>
            </select>
          </div>
        </div>

        {/* Segunda fila: Módulo y Nivel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🗂️ Módulo
            </label>
            <select
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los módulos</option>
              <option value="Consulta">📅 Citas</option>
              <option value="Usuario">👤 Usuarios</option>
              <option value="Paciente">🏥 Pacientes</option>
              <option value="PagoEnLinea">💳 Pagos</option>
              <option value="Factura">📄 Facturas</option>
              <option value="HistorialClinico">📋 Historial Clínico</option>
              <option value="Tratamiento">🦷 Tratamientos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🎯 Nivel de Severidad
            </label>
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los niveles</option>
              <option value="info">ℹ️ Información</option>
              <option value="warning">⚠️ Advertencia</option>
              <option value="error">❌ Error</option>
              <option value="critical">🔴 Crítico</option>
            </select>
          </div>
        </div>

        {/* Tercera fila: Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-500">
            {(accion || modelo || busqueda || fechaDesde || fechaHasta || nivel) && (
              <span>✓ Filtros activos</span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleLimpiarFiltros}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-md transition-colors"
            >
              🔄 Limpiar
            </button>
            <button
              onClick={handleAplicarFiltros}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-md"
            >
              🔍 Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosBitacora;
