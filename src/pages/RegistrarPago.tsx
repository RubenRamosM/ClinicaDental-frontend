// src/pages/RegistrarPago.tsx
/**
 * ⚠️ ARCHIVO LEGACY - YA NO SE USA
 * Este componente fue reemplazado por MiPlanTratamiento.tsx
 * 
 * Ruta antigua: /registrar-pago
 * Ruta nueva: /mi-plan/:planId (incluye registro de pagos)
 * 
 * Mantener solo para referencia histórica.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registrarPago, formatearMonto } from '../services/pagosService';
import { obtenerPlanTratamiento } from '../services/planesTratamientoService';
import type { HistorialPagoCreate } from '../interfaces/HistorialPago';
import type { PlanTratamientoDetalle, Presupuesto } from '../interfaces/PlanTratamiento';
import { METODOS_PAGO } from '../interfaces/HistorialPago';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';

export default function RegistrarPago() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planIdParam = searchParams.get('planId');

  const [loading, setLoading] = useState(false);
  const [planDetalle, setPlanDetalle] = useState<PlanTratamientoDetalle | null>(null);
  const [presupuestoAprobado, setPresupuestoAprobado] = useState<Presupuesto | null>(null);

  const [formData, setFormData] = useState<HistorialPagoCreate>({
    plan_tratamiento: planIdParam ? parseInt(planIdParam) : 0,
    monto: 0,
    metodo_pago: 'efectivo',
    numero_comprobante: '',
    numero_transaccion: '',
    notas: '',
  });

  useEffect(() => {
    if (planIdParam) {
      cargarPlan(parseInt(planIdParam));
    }
  }, [planIdParam]);

  const cargarPlan = async (planId: number) => {
    try {
      const plan = await obtenerPlanTratamiento(planId);
      setPlanDetalle(plan);

      // Buscar presupuesto aprobado
      const aprobado = plan.presupuestos?.find((p) => p.estado === 'aprobado');
      if (aprobado) {
        setPresupuestoAprobado(aprobado);
        setFormData((prev) => ({ ...prev, presupuesto: aprobado.id }));
      }
    } catch (error: any) {
      console.error('Error al cargar plan:', error);
      toast.error('Error al cargar información del plan');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (formData.monto <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    if (!presupuestoAprobado) {
      toast.error('El plan debe tener un presupuesto aprobado');
      return;
    }

    if (formData.monto > presupuestoAprobado.saldo_pendiente) {
      toast.error(`El monto no puede exceder el saldo pendiente (${formatearMonto(presupuestoAprobado.saldo_pendiente)})`);
      return;
    }

    if (['tarjeta', 'transferencia', 'cheque', 'qr'].includes(formData.metodo_pago) && !formData.numero_comprobante) {
      toast.error('Debe ingresar un número de comprobante para este método de pago');
      return;
    }

    try {
      setLoading(true);
      const response = await registrarPago(formData);
      
      toast.success(`✅ ${response.mensaje}`);
      toast.success(`Código de pago: ${response.pago.codigo}`);
      
      // Redirigir al historial de pagos
      navigate(`/historial-pagos/${formData.plan_tratamiento}`);
    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      toast.error(error.response?.data?.detail || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof HistorialPagoCreate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registrar Pago</h1>
          <p className="text-gray-600 mt-2">
            Registra un nuevo pago para un plan de tratamiento
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              {/* Información del Plan */}
              {planDetalle && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Plan: {planDetalle.codigo}</h3>
                  <p className="text-sm text-gray-700">
                    Paciente: {planDetalle.paciente_detalle.nombre} {planDetalle.paciente_detalle.apellido}
                  </p>
                  <p className="text-sm text-gray-700">
                    Descripción: {planDetalle.descripcion}
                  </p>
                </div>
              )}

              {/* Plan de Tratamiento */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan de Tratamiento *
                </label>
                <input
                  type="number"
                  value={formData.plan_tratamiento}
                  onChange={(e) => handleInputChange('plan_tratamiento', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!!planIdParam}
                />
                {!planIdParam && (
                  <button
                    type="button"
                    onClick={() => cargarPlan(formData.plan_tratamiento)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Cargar información del plan
                  </button>
                )}
              </div>

              {/* Monto */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto (Bs.) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.monto || ''}
                  onChange={(e) => handleInputChange('monto', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
                {presupuestoAprobado && formData.monto > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    Saldo después del pago: {formatearMonto(presupuestoAprobado.saldo_pendiente - formData.monto)}
                  </p>
                )}
              </div>

              {/* Método de Pago */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago *
                </label>
                <select
                  value={formData.metodo_pago}
                  onChange={(e) => handleInputChange('metodo_pago', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {METODOS_PAGO.map((metodo) => (
                    <option key={metodo.value} value={metodo.value}>
                      {metodo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Número de Comprobante */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Comprobante
                  {['tarjeta', 'transferencia', 'cheque', 'qr'].includes(formData.metodo_pago) && ' *'}
                </label>
                <input
                  type="text"
                  value={formData.numero_comprobante}
                  onChange={(e) => handleInputChange('numero_comprobante', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="REC-001"
                  required={['tarjeta', 'transferencia', 'cheque', 'qr'].includes(formData.metodo_pago)}
                />
              </div>

              {/* Número de Transacción */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Transacción
                </label>
                <input
                  type="text"
                  value={formData.numero_transaccion}
                  onChange={(e) => handleInputChange('numero_transaccion', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="TXN-123456789"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Opcional - ID de transacción bancaria
                </p>
              </div>

              {/* Notas */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => handleInputChange('notas', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observaciones adicionales sobre el pago..."
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                           disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Registrando...' : '💰 Registrar Pago'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300
                           transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          {/* Panel de Información */}
          <div className="lg:col-span-1">
            {presupuestoAprobado ? (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información Financiera
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Presupuesto</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {presupuestoAprobado.codigo}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600">Total Presupuesto</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatearMonto(presupuestoAprobado.total)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Total Pagado</div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatearMonto(presupuestoAprobado.total_pagado)}
                    </div>
                  </div>

                  <div className="pb-4 border-b">
                    <div className="text-sm text-gray-600">Saldo Pendiente</div>
                    <div className="text-lg font-semibold text-orange-600">
                      {formatearMonto(presupuestoAprobado.saldo_pendiente)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Progreso</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(presupuestoAprobado.total_pagado / presupuestoAprobado.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {Math.round((presupuestoAprobado.total_pagado / presupuestoAprobado.total) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Nota:</strong> El pago será registrado con tu nombre ({user?.nombre}) como responsable.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">
                      Sin Presupuesto Aprobado
                    </h4>
                    <p className="text-sm text-yellow-700">
                      Este plan no tiene un presupuesto aprobado. El paciente debe aprobar el presupuesto antes de realizar pagos.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
