// src/pages/MisPresupuestos.tsx
/**
 * Página para que los PACIENTES vean y acepten sus presupuestos digitales
 * Sistema: Presupuestos Digitales (SP3-T003)
 * 
 * Flujo:
 * 1. Odontólogo crea presupuesto → Estado: Borrador
 * 2. Odontólogo emite presupuesto → Estado: Emitido
 * 3. Paciente acepta presupuesto → Puede registrar pagos
 * 4. Si pasa fecha de vigencia → Estado: Caducado
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  obtenerMisPresupuestos, 
  aceptarPresupuesto,
  construirFirmaDigital,
  formatearMonto,
  calcularDiasRestantes,
  estaVigente,
  getEstadoPresupuestoColor,
} from '../services/presupuestosDigitalesService';
import type { PresupuestoDigital } from '../interfaces/PresupuestoDigital';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';

export default function MisPresupuestos() {
  const { user } = useAuth();
  const [presupuestos, setPresupuestos] = useState<PresupuestoDigital[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const cargarPresupuestos = async () => {
    try {
      setLoading(true);
      const response = await obtenerMisPresupuestos();
      setPresupuestos(response.results);
    } catch (error: any) {
      console.error('Error al cargar presupuestos:', error);
      toast.error('Error al cargar los presupuestos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPresupuestos();
  }, []);

  const handleAceptar = async (presupuesto: PresupuestoDigital) => {
    if (!user) {
      toast.error('Debes iniciar sesión para aceptar presupuestos');
      return;
    }

    const consentText = `Acepto el presupuesto ${presupuesto.codigo_corto} por un monto total de ${formatearMonto(presupuesto.total)} para el plan de tratamiento. Autorizo el inicio de los procedimientos según lo acordado.`;

    if (!window.confirm(`¿Aceptas este presupuesto de ${formatearMonto(presupuesto.total)}?\n\n${consentText}`)) {
      return;
    }

    try {
      setProcesando(presupuesto.id);

      // Construir firma digital
      const firmaDigital = await construirFirmaDigital(
        user.id,
        presupuesto.id,
        [], // Aceptación total (todos los items)
        consentText
      );

      // Aceptar presupuesto
      await aceptarPresupuesto(presupuesto.id, {
        tipo_aceptacion: 'Total',
        firma_digital: firmaDigital,
        notas: 'Aceptado desde portal del paciente',
      });

      toast.success('¡Presupuesto aceptado exitosamente! Ahora puedes registrar pagos.');
      cargarPresupuestos();
    } catch (error: any) {
      console.error('Error al aceptar presupuesto:', error);
      const mensaje = error.message || error.response?.data?.detail || 'Error al aceptar el presupuesto';
      toast.error(mensaje);
    } finally {
      setProcesando(null);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEstadoInfo = (estado: string) => {
    const info = {
      Borrador: { label: 'En preparación', icon: '📝', descripcion: 'El odontólogo está preparando tu presupuesto' },
      Emitido: { label: 'Pendiente', icon: '⏳', descripcion: 'Esperando tu aceptación' },
      Caducado: { label: 'Vencido', icon: '⏰', descripcion: 'El presupuesto ha expirado' },
      Anulado: { label: 'Anulado', icon: '❌', descripcion: 'Presupuesto cancelado' },
    };
    return info[estado as keyof typeof info] || info.Borrador;
  };

  const presupuestosFiltrados = filtroEstado === 'todos' 
    ? presupuestos 
    : presupuestos.filter(p => p.estado === filtroEstado);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando presupuestos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Presupuestos</h1>
          <p className="text-gray-600 mt-2">
            Revisa y acepta los presupuestos de tus tratamientos dentales
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === 'todos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Todos ({presupuestos.length})
            </button>
            <button
              onClick={() => setFiltroEstado('Emitido')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === 'Emitido'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              ⏳ Pendientes ({presupuestos.filter(p => p.estado === 'Emitido').length})
            </button>
            <button
              onClick={() => setFiltroEstado('Caducado')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === 'Caducado'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              ⏰ Vencidos ({presupuestos.filter(p => p.estado === 'Caducado').length})
            </button>
          </div>
        </div>

        {/* Lista de Presupuestos */}
        {presupuestosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-lg">
              {filtroEstado === 'todos' 
                ? 'No tienes presupuestos aún' 
                : `No hay presupuestos ${filtroEstado.toLowerCase()}`}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Los presupuestos aparecerán aquí cuando tu odontólogo los emita
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {presupuestosFiltrados.map((presupuesto) => {
              const estadoInfo = getEstadoInfo(presupuesto.estado);
              const colorClass = getEstadoPresupuestoColor(presupuesto.estado);
              const diasRestantes = calcularDiasRestantes(presupuesto.fecha_vigencia);
              const vigente = estaVigente(presupuesto.fecha_vigencia, presupuesto.estado);

              return (
                <div key={presupuesto.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Presupuesto #{presupuesto.codigo_corto}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Emitido el {formatFecha(presupuesto.fecha_emision)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          📋 Plan: {presupuesto.plan_detalle.id} • 👨‍⚕️ {presupuesto.odontologo_nombre}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                        {estadoInfo.icon} {estadoInfo.label}
                      </span>
                    </div>

                    {/* Alerta de vigencia */}
                    {presupuesto.estado === 'Emitido' && diasRestantes <= 3 && diasRestantes > 0 && (
                      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Este presupuesto vence en {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}. Acéptalo pronto.
                        </p>
                      </div>
                    )}

                    {presupuesto.estado === 'Caducado' && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700">
                          ❌ Este presupuesto ha vencido. Contacta a tu odontólogo para solicitar uno nuevo.
                        </p>
                      </div>
                    )}

                    {presupuesto.estado === 'Borrador' && (
                      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">
                          📝 El odontólogo está preparando este presupuesto. Te notificaremos cuando esté listo.
                        </p>
                      </div>
                    )}

                    {/* Resumen Financiero */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-600">Subtotal</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatearMonto(presupuesto.subtotal)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Descuento</div>
                        <div className="text-lg font-semibold text-green-600">
                          -{formatearMonto(presupuesto.descuento)}
                        </div>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <div className="text-xs text-gray-600">Total a Pagar</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatearMonto(presupuesto.total)}
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">📅 Vigencia:</span>
                        <span>Hasta el {formatFecha(presupuesto.fecha_vigencia)}</span>
                        {vigente && (
                          <span className="ml-2 text-green-600 text-xs">✓ Vigente</span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">🦷 Servicios:</span>
                        <span>{presupuesto.cantidad_items} {presupuesto.cantidad_items === 1 ? 'procedimiento' : 'procedimientos'}</span>
                      </div>

                      {presupuesto.es_tramo && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">📊 Tramo:</span>
                          <span>Fase {presupuesto.numero_tramo} del tratamiento</span>
                        </div>
                      )}
                    </div>

                    {/* Notas */}
                    {presupuesto.notas && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-900 mb-1">📌 Notas del odontólogo:</p>
                        <p className="text-sm text-blue-800">{presupuesto.notas}</p>
                      </div>
                    )}

                    {/* Descripción del estado */}
                    <div className="mb-4 text-sm text-gray-600 italic">
                      {estadoInfo.descripcion}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-3">
                      {/* Botón Aceptar (solo si está Emitido y vigente) */}
                      {presupuesto.estado === 'Emitido' && vigente && (
                        <button
                          onClick={() => handleAceptar(presupuesto)}
                          disabled={procesando === presupuesto.id}
                          className="flex-1 min-w-[200px] px-6 py-3 bg-green-600 text-white rounded-lg
                                   hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                                   transition-colors font-medium shadow-md hover:shadow-lg"
                        >
                          {procesando === presupuesto.id ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Procesando...
                            </span>
                          ) : (
                            '✅ Aceptar Presupuesto'
                          )}
                        </button>
                      )}

                      {/* Botón Ver Detalles */}
                      <Link
                        to={`/presupuesto/${presupuesto.id}`}
                        className="flex-1 min-w-[150px] px-6 py-3 bg-blue-600 text-white rounded-lg
                                 hover:bg-blue-700 transition-colors font-medium text-center shadow-md hover:shadow-lg"
                      >
                        📄 Ver Detalles
                      </Link>

                      {/* Botón Descargar PDF (si existe) */}
                      {presupuesto.pdf_url && (
                        <a
                          href={presupuesto.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-gray-600 text-white rounded-lg
                                   hover:bg-gray-700 transition-colors font-medium shadow-md hover:shadow-lg"
                        >
                          📥 Descargar PDF
                        </a>
                      )}

                      {/* Botón Registrar Pago (si ya fue aceptado) */}
                      {/* NOTA: El backend no devuelve estado de aceptación directamente,
                          pero si el presupuesto fue aceptado, se puede verificar con otro endpoint.
                          Por ahora, mostramos el botón solo si NO está en Borrador ni Caducado */}
                      {presupuesto.estado !== 'Borrador' && presupuesto.estado !== 'Caducado' && (
                        <Link
                          to={`/registrar-pago?plan=${presupuesto.plan_tratamiento}`}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg
                                   hover:bg-purple-700 transition-colors font-medium shadow-md hover:shadow-lg"
                        >
                          💳 Registrar Pago
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">ℹ️ Información sobre presupuestos</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Los presupuestos tienen una fecha de vigencia. Acéptalos antes de que venzan.</li>
            <li>• Una vez aceptado un presupuesto, puedes comenzar a realizar pagos parciales.</li>
            <li>• Si un presupuesto vence, tu odontólogo puede emitir uno nuevo.</li>
            <li>• Puedes descargar el PDF del presupuesto para tus registros.</li>
            <li>• Los presupuestos por tramos te permiten pagar en fases tu tratamiento.</li>
          </ul>
        </div>

        {/* Botón volver */}
        <div className="mt-8 text-center">
          <Link
            to="/dashboard-paciente"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg
                     hover:bg-gray-300 transition-colors font-medium"
          >
            ← Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
