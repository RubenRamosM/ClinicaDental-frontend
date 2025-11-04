import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Api } from '../lib/Api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import VistaFactura from '../components/VistaFactura';
import facturaService from '../services/facturaService';

// ===== INTERFACES =====
interface Usuario {
    codigo: number;
    nombre: string;
    apellido: string;
    correoelectronico: string;
}

interface Odontologo {
    codusuario: number;
    usuario: Usuario;
    especialidad?: string;
    numerolicencia?: string;
}

interface Horario {
    id: number;
    hora: string;
}

interface TipoConsulta {
    id: number;
    nombre: string;
    costobase?: string;
}

interface Paciente {
    codusuario: number;
    usuario: Usuario;
    carnetidentidad: string;
    direccion: string;
    fechanacimiento: string;
    nombre: string;
    apellido: string;
}

interface PaymentIntentResponse {
    client_secret: string;
    pago_id: number;
    codigo_pago: string;
    monto: number;
    moneda: string;
}

// ===== COMPONENTE DE FORMULARIO DE PAGO =====
const CheckoutForm: React.FC<{
    datosConsulta: any;
    clientSecret: string;
    pagoId: number;
    onSuccess: () => void;
    onCancel: () => void;
}> = ({ datosConsulta, clientSecret, pagoId, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcesando(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        try {
            // 1. Confirmar pago con Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement!,
                        billing_details: {
                            name: datosConsulta.nombrePaciente || 'Paciente',
                        },
                    },
                }
            );

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            if (paymentIntent.status === 'succeeded') {
                // 2. Confirmar en backend
                const confirmacion = await Api.post('/pagos/stripe/confirmar-pago/', {
                    pago_id: pagoId,
                });

                if (confirmacion.data.success) {
                    // 3. Crear la cita con el pago vinculado
                    const citaResponse = await Api.post('/citas/', {
                        fecha: datosConsulta.fecha,
                        codpaciente: datosConsulta.codpaciente,
                        cododontologo: datosConsulta.cododontologo,
                        idhorario: datosConsulta.idhorario,
                        idtipoconsulta: datosConsulta.idtipoconsulta,
                        idestadoconsulta: 295,
                        pago_id: pagoId, // ← Vincula el pago
                    });

                    // 4. 📄 CREAR FACTURA AUTOMÁTICAMENTE
                    try {
                        const facturaData = {
                            montototal: datosConsulta.monto,
                            idestadofactura: 1, // Estado: Pagada
                            items: [
                                {
                                    descripcion: `Consulta - ${datosConsulta.nombreConsulta}`,
                                    monto: datosConsulta.monto
                                }
                            ],
                            pago_stripe_id: pagoId
                        };
                        
                        await facturaService.crearFactura(facturaData);
                        console.log('✅ Factura creada exitosamente');
                    } catch (facturaError) {
                        console.error('⚠️ Error al crear factura (continúa el flujo):', facturaError);
                        // No bloqueamos el flujo si falla la factura
                    }

                    onSuccess();
                } else {
                    throw new Error('Error al confirmar el pago en el servidor');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Error al procesar el pago');
            console.error('Error en pago:', err);
        } finally {
            setProcesando(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resumen de Consulta */}
            <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Resumen de tu Cita:</h3>
                <p><strong>Tipo:</strong> {datosConsulta.nombreConsulta}</p>
                <p><strong>Odontólogo:</strong> Dr(a). {datosConsulta.nombreOdontologo}</p>
                <p><strong>Fecha:</strong> {datosConsulta.fecha} a las {datosConsulta.hora}</p>
                <p className="text-xl font-bold mt-3 text-cyan-700">
                    Total a pagar: Bs. {datosConsulta.monto?.toFixed(2)}
                </p>
            </div>

            {/* Stripe Card Element */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datos de Tarjeta
                </label>
                <div className="shadow border rounded py-3 px-3 bg-white">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {/* Tarjetas de Prueba */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm">
                <p className="font-bold">💳 Tarjetas de Prueba:</p>
                <p><strong>Exitosa:</strong> 4242 4242 4242 4242</p>
                <p><strong>Declinada:</strong> 4000 0000 0000 9995</p>
                <p>CVV: Cualquier 3 dígitos | Fecha: Cualquier fecha futura</p>
            </div>

            {/* Mensaje de Error */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={procesando}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={!stripe || procesando}
                    className={`flex-1 font-bold py-3 px-4 rounded-lg ${
                        procesando
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                    {procesando ? 'Procesando...' : `Pagar Bs. ${datosConsulta.monto?.toFixed(2)}`}
                </button>
            </div>
        </form>
    );
};

// ===== COMPONENTE PRINCIPAL =====
const AgendarCitaConPago = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Estados para datos
    const [odontologos, setOdontologos] = useState<Odontologo[]>([]);
    const [horarios, setHorarios] = useState<Horario[]>([]);
    const [tiposConsulta, setTiposConsulta] = useState<TipoConsulta[]>([]);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);

    // Estados del formulario
    const [selectedOdontologo, setSelectedOdontologo] = useState('');
    const [selectedFecha, setSelectedFecha] = useState('');
    const [selectedHorario, setSelectedHorario] = useState('');
    const [selectedTipoConsulta, setSelectedTipoConsulta] = useState('');

    // Estados de flujo de pago
    const [paso, setPaso] = useState<'formulario' | 'pago' | 'factura'>('formulario');
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const [clientSecret, setClientSecret] = useState('');
    const [pagoId, setPagoId] = useState<number | null>(null);
    const [datosConsulta, setDatosConsulta] = useState<any>(null);

    // Estados de UI
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cargar Stripe al montar el componente
    useEffect(() => {
        const initStripe = async () => {
            try {
                const response = await Api.get('/pagos/stripe/clave-publica/');
                const publicKey = response.data.publishable_key;
                setStripePromise(loadStripe(publicKey));
            } catch (err) {
                console.error('Error al cargar Stripe:', err);
                setError('Error al inicializar el sistema de pagos.');
            }
        };
        initStripe();
    }, []);

    // Cargar datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [odontologosRes, tiposConsultaRes, pacientesRes] = await Promise.all([
                    Api.get('/profesionales/odontologos/'),
                    Api.get('/citas/tipos-consulta/'),
                    Api.get('/usuarios/pacientes/')
                ]);

                setOdontologos(odontologosRes.data.results || []);
                setTiposConsulta(tiposConsultaRes.data.results || []);
                setPacientes(pacientesRes.data.results || []);
            } catch (fetchError: any) {
                console.error('❌ Error al cargar datos:', fetchError.response?.data || fetchError.message);
                setError('Error al cargar los datos necesarios.');
            }
        };
        fetchData();
    }, [user]);

    // Cargar horarios disponibles
    useEffect(() => {
        const cargarHorarios = async () => {
            if (!selectedFecha || !selectedOdontologo) {
                setHorarios([]);
                return;
            }

            try {
                const response = await Api.get(
                    `/citas/horarios/disponibles/?fecha=${selectedFecha}&odontologo_id=${selectedOdontologo}`
                );
                setHorarios(response.data);

                if (selectedHorario) {
                    const horarioDisponible = response.data.find(
                        (h: Horario) => h.id === parseInt(selectedHorario)
                    );
                    if (!horarioDisponible) {
                        setSelectedHorario('');
                    }
                }
            } catch (err: any) {
                console.error('❌ Error al cargar horarios:', err.response?.data || err.message);
                setHorarios([]);
            }
        };

        cargarHorarios();
    }, [selectedFecha, selectedOdontologo]);

    // Manejar envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsSubmitting(true);

        if (!user) {
            setError('Debes iniciar sesión para agendar una cita.');
            setIsSubmitting(false);
            return;
        }

        const pacienteActual = pacientes.find(p => p.codusuario === user.id);

        if (!pacienteActual) {
            setError('No se encontró el perfil de paciente.');
            setIsSubmitting(false);
            return;
        }

        const tipoConsulta = tiposConsulta.find(tc => tc.id === parseInt(selectedTipoConsulta));
        const odontologo = odontologos.find(od => od.codusuario === parseInt(selectedOdontologo));
        const horario = horarios.find(h => h.id === parseInt(selectedHorario));

        try {
            // Crear Payment Intent
            const response = await Api.post('/pagos/stripe/crear-intencion-consulta/', {
                tipo_consulta_id: parseInt(selectedTipoConsulta),
                monto: tipoConsulta?.costobase ? parseFloat(tipoConsulta.costobase) : undefined,
            });

            setClientSecret(response.data.client_secret);
            setPagoId(response.data.pago_id);

            // Guardar datos de la consulta
            setDatosConsulta({
                fecha: selectedFecha,
                hora: horario?.hora,
                codpaciente: pacienteActual.codusuario,
                cododontologo: parseInt(selectedOdontologo),
                idhorario: parseInt(selectedHorario),
                idtipoconsulta: parseInt(selectedTipoConsulta),
                nombreConsulta: tipoConsulta?.nombre,
                nombreOdontologo: `${odontologo?.usuario.nombre} ${odontologo?.usuario.apellido}`,
                nombrePaciente: `${pacienteActual.nombre} ${pacienteActual.apellido}`,
                monto: parseFloat(tipoConsulta?.costobase || '0'),
                codigoPago: response.data.codigo_pago,
            });

            setPaso('pago');
        } catch (err: any) {
            console.error('Error al crear intención de pago:', err);
            setError('Error al iniciar el pago. Por favor intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePagoExitoso = () => {
        setPaso('factura');
    };

    const handleCancelarPago = () => {
        setPaso('formulario');
        setClientSecret('');
        setPagoId(null);
    };

    // Validación de rol
    if (!user) {
        return <div className="p-10 text-center">Cargando...</div>;
    }

    const esPaciente = user.tipo_usuario?.rol === 'Paciente';

    if (!esPaciente) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopBar />
                <div className="flex flex-col items-center justify-center px-4 pt-10">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
                        <h2 className="text-xl font-bold text-gray-800">Acción no permitida</h2>
                        <p className="text-gray-600 mt-2">
                            Este formulario es solo para pacientes.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar />
            <div className="flex flex-col items-center justify-center px-4 pt-10 pb-20">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-6">
                        <img src="/dentist.svg" className="w-12 h-12 mb-3" alt="Icono" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            {paso === 'formulario' && 'Agendar Cita con Pago'}
                            {paso === 'pago' && 'Completar Pago'}
                            {paso === 'factura' && '¡Pago Exitoso!'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {paso === 'formulario' && 'Paga tu consulta con tarjeta de crédito/débito'}
                            {paso === 'pago' && 'Ingresa los datos de tu tarjeta'}
                            {paso === 'factura' && 'Tu cita ha sido agendada correctamente'}
                        </p>
                    </div>

                    {/* Paso 1: Formulario */}
                    {paso === 'formulario' && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Odontólogo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Odontólogo
                                </label>
                                <select
                                    value={selectedOdontologo}
                                    onChange={(e) => setSelectedOdontologo(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="">Seleccione un odontólogo</option>
                                    {odontologos.map((od) => (
                                        <option key={od.codusuario} value={od.codusuario}>
                                            Dr(a). {od.usuario.nombre} {od.usuario.apellido}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Fecha */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    value={selectedFecha}
                                    onChange={(e) => setSelectedFecha(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                                />
                            </div>

                            {/* Horario */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Horario
                                </label>
                                <select
                                    value={selectedHorario}
                                    onChange={(e) => setSelectedHorario(e.target.value)}
                                    required
                                    disabled={horarios.length === 0}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-100"
                                >
                                    <option value="">
                                        {horarios.length === 0 ? 'Seleccione fecha y odontólogo' : 'Seleccione una hora'}
                                    </option>
                                    {horarios.map((h) => (
                                        <option key={h.id} value={h.id}>
                                            {h.hora}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tipo de Consulta */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Consulta
                                </label>
                                <select
                                    value={selectedTipoConsulta}
                                    onChange={(e) => setSelectedTipoConsulta(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="">Seleccione el tipo</option>
                                    {tiposConsulta.map((tc) => (
                                        <option key={tc.id} value={tc.id}>
                                            {tc.nombre} {tc.costobase && `- Bs. ${parseFloat(tc.costobase).toFixed(2)}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Botón */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors disabled:bg-cyan-300"
                            >
                                {isSubmitting ? 'Procesando...' : 'Continuar al Pago'}
                            </button>
                        </form>
                    )}

                    {/* Paso 2: Pago con Stripe */}
                    {paso === 'pago' && stripePromise && clientSecret && pagoId && (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <CheckoutForm
                                datosConsulta={datosConsulta}
                                clientSecret={clientSecret}
                                pagoId={pagoId}
                                onSuccess={handlePagoExitoso}
                                onCancel={handleCancelarPago}
                            />
                        </Elements>
                    )}

                    {/* Paso 3: Mostrar Factura */}
                    {paso === 'factura' && pagoId && (
                        <div>
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                                <div className="flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h2 className="text-xl font-bold">✅ ¡Pago Exitoso!</h2>
                                        <p>Tu cita ha sido agendada correctamente.</p>
                                        <p className="text-sm mt-1">Código de pago: <strong>{datosConsulta?.codigoPago}</strong></p>
                                    </div>
                                </div>
                            </div>
                            <VistaFactura
                                pagoId={pagoId}
                                codigoPago={datosConsulta?.codigoPago}
                                onClose={() => navigate('/mis-citas')}
                            />
                        </div>
                    )}

                    {/* Mensajes de error */}
                    {error && paso === 'formulario' && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgendarCitaConPago;
