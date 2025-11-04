// src/pages/MiPlanTratamiento.tsx
/**
 * Vista UNIFICADA: Plan de Tratamiento + Historial de Pagos + Registrar Pago
 * 
 * Esta página combina:
 * 1. Ver el plan de tratamiento del paciente
 * 2. Ver historial de pagos realizados
 * 3. Registrar nuevos pagos (si tiene permisos)
 * 
 * Roles permitidos:
 * - Paciente (1): Ver sus pagos
 * - Recepcionista (3): Registrar pagos
 * - Administrador (4): Registrar pagos
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  obtenerPagosPorPlan,
  registrarPago,
  formatearMonto,
  calcularPorcentajePagado 
} from '../services/pagosService';
import { obtenerPlanTratamiento } from '../services/planesTratamientoService';
import type { HistorialPago } from '../interfaces/HistorialPago';
import type { PlanTratamientoDetalle } from '../interfaces/PlanTratamiento';
import { METODOS_PAGO, ESTADOS_PAGO } from '../interfaces/HistorialPago';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import { esAdministrador } from '../utils/roleHelpers';

export default function MiPlanTratamiento() {
  const { planId } = useParams<{ planId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estado del plan
  const [plan, setPlan] = useState<PlanTratamientoDetalle | null>(null);
  const [pagos, setPagos] = useState<HistorialPago[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cálculos
  const [totalPagado, setTotalPagado] = useState(0);
  const [saldoPendiente, setSaldoPendiente] = useState(0);
  const [porcentajePagado, setPorcentajePagado] = useState(0);

  // Formulario de nuevo pago (solo para staff)
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [formPago, setFormPago] = useState({
    monto: '',
    metodo_pago: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' | 'qr',
    numero_comprobante: '',
    numero_transaccion: '',
    notas: '',
  });

  // ✅ Usar helper para detectar staff (Recepcionista: 3, Admin: 4 o 189)
  const esStaff = user?.idtipousuario === 3 || esAdministrador(user);

  useEffect(() => {
    if (planId) {
      cargarDatos();
    }
  }, [planId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar plan de tratamiento
      const planData = await obtenerPlanTratamiento(parseInt(planId!));
      setPlan(planData);

      // Cargar pagos del plan
      const response = await obtenerPagosPorPlan(parseInt(planId!));
      setPagos(response.pagos || []);
      
      // Calcular totales
      const costoTotal = parseFloat(planData.costo_total || '0');
      const pagado = response.resumen_pagos?.total_pagado || 0;
      const saldo = costoTotal - pagado;
      const porcentaje = calcularPorcentajePagado(pagado, costoTotal);

      setTotalPagado(pagado);
      setSaldoPendiente(saldo);
      setPorcentajePagado(porcentaje);

    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar el plan de tratamiento');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formPago.monto || parseFloat(formPago.monto) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    if (parseFloat(formPago.monto) > saldoPendiente) {
      toast.error(`El monto no puede exceder el saldo pendiente (${formatearMonto(saldoPendiente)})`);
      return;
    }

    try {
      setProcesando(true);
      
      await registrarPago({
        plan_tratamiento: parseInt(planId!),
        monto: parseFloat(formPago.monto),
        metodo_pago: formPago.metodo_pago,
        numero_comprobante: formPago.numero_comprobante || undefined,
        numero_transaccion: formPago.numero_transaccion || undefined,
        notas: formPago.notas || undefined,
      });

      toast.success('¡Pago registrado exitosamente!');
      setMostrarFormulario(false);
      setFormPago({
        monto: '',
        metodo_pago: 'efectivo' as 'efectivo',
        numero_comprobante: '',
        numero_transaccion: '',
        notas: '',
      });
      cargarDatos(); // Recargar datos

    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      toast.error(error.response?.data?.detail || 'Error al registrar el pago');
    } finally {
      setProcesando(false);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      completado: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      cancelado: 'bg-red-100 text-red-800',
      reembolsado: 'bg-orange-100 text-orange-800',
    };
    return badges[estado as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getMetodoPagoIcon = (metodo: string) => {
    const iconos = {
      efectivo: '💵',
      tarjeta: '💳',
      transferencia: '🏦',
      cheque: '📝',
      qr: '📱',
    };
    return iconos[metodo as keyof typeof iconos] || '💰';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando información...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">No se encontró el plan de tratamiento</p>
            <Link to="/dashboard-paciente" className="mt-4 inline-block text-blue-600 hover:underline">
              ← Volver al Dashboard
            </Link>
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
          <h1 className="text-3xl font-bold text-gray-900">Mi Plan de Tratamiento</h1>
          <p className="text-gray-600 mt-2">
            Resumen financiero y pagos del plan
          </p>
        </div>

        {/* Información del Plan */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Información del Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Paciente</p>
              <p className="font-medium">{plan.paciente_nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Odontólogo</p>
              <p className="font-medium">{plan.odontologo_nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado del Plan</p>
              <p className="font-medium">{plan.estado_plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Progreso</p>
              <p className="font-medium">{plan.progreso}%</p>
            </div>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Costo Total</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatearMonto(parseFloat(plan.costo_total || '0'))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Total Pagado</div>
            <div className="text-2xl font-bold text-green-600">
              {formatearMonto(totalPagado)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Saldo Pendiente</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatearMonto(saldoPendiente)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-2">Porcentaje Pagado</div>
            <div className="text-2xl font-bold text-purple-600">
              {porcentajePagado.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Barra de Progreso de Pago */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3">Progreso de Pago</h3>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${porcentajePagado}%` }}
            ></div>
          </div>
        </div>

        {/* Botón Registrar Pago (solo para staff) */}
        {esStaff && saldoPendiente > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg
                       hover:bg-green-700 transition-colors font-medium shadow-md"
            >
              {mostrarFormulario ? '❌ Cancelar' : '💰 Registrar Nuevo Pago'}
            </button>
          </div>
        )}

        {/* Formulario de Nuevo Pago */}
        {mostrarFormulario && esStaff && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">📝 Nuevo Pago</h3>
            <form onSubmit={handleRegistrarPago} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={saldoPendiente}
                    value={formPago.monto}
                    onChange={(e) => setFormPago({ ...formPago, monto: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo: {formatearMonto(saldoPendiente)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago *
                  </label>
                  <select
                    value={formPago.metodo_pago}
                    onChange={(e) => setFormPago({ ...formPago, metodo_pago: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="tarjeta">💳 Tarjeta</option>
                    <option value="transferencia">🏦 Transferencia</option>
                    <option value="cheque">📝 Cheque</option>
                    <option value="qr">📱 QR</option>
                  </select>
                </div>

                {formPago.metodo_pago !== ('efectivo' as const) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        N° Comprobante
                      </label>
                      <input
                        type="text"
                        value={formPago.numero_comprobante}
                        onChange={(e) => setFormPago({ ...formPago, numero_comprobante: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Número de comprobante"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        N° Transacción
                      </label>
                      <input
                        type="text"
                        value={formPago.numero_transaccion}
                        onChange={(e) => setFormPago({ ...formPago, numero_transaccion: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Número de transacción"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={formPago.notas}
                  onChange={(e) => setFormPago({ ...formPago, notas: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Observaciones sobre el pago..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={procesando}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg
                           hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors font-medium"
                >
                  {procesando ? 'Procesando...' : '✅ Registrar Pago'}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg
                           hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Historial de Pagos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">💳 Historial de Pagos</h2>
          
          {pagos.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600">No hay pagos registrados aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pagos.map((pago) => (
                <div key={pago.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getMetodoPagoIcon(pago.metodo_pago)}</span>
                        <span className="font-semibold text-lg">{formatearMonto(pago.monto)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(pago.estado)}`}>
                          {pago.estado}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatFecha(pago.fecha_pago)}
                      </p>
                      {pago.notas && (
                        <p className="text-sm text-gray-500 mt-2 italic">{pago.notas}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>Código: {pago.codigo}</p>
                      {pago.numero_comprobante && (
                        <p className="text-xs">Comp: {pago.numero_comprobante}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de navegación */}
        <div className="mt-8 flex gap-4">
          <Link
            to={user?.idtipousuario === 1 ? "/dashboard-paciente" : "/dashboard"}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg
                     hover:bg-gray-300 transition-colors font-medium"
          >
            ← Volver al Dashboard
          </Link>
          <Link
            to="/mis-presupuestos"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 transition-colors font-medium"
          >
            Ver Presupuestos Digitales
          </Link>
        </div>
      </div>
    </div>
  );
}
