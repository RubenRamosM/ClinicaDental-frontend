import React, {useState, useEffect} from 'react';
import {Api} from '../lib/Api';
import {useAuth} from '../context/AuthContext';
import {useNavigate} from 'react-router-dom';
import TopBar from '../components/TopBar';

// ✅ INTERFACES CORREGIDAS - Coinciden con estructura real del backend
interface Usuario {
    codigo: number;
    nombre: string;
    apellido: string;
    correoelectronico: string;
}

interface Odontologo {
    codusuario: number;  // ✅ Es un número, no un objeto
    usuario: Usuario;    // ✅ Los detalles están en usuario
    especialidad?: string;
    numerolicencia?: string;
}

interface Horario {
    id: number;
    hora: string;
}

interface TipoConsulta {
    id: number;
    nombre: string;  // ✅ Cambiar de 'nombreconsulta' a 'nombre'
}

interface Paciente {
    codusuario: number;  // ✅ Es un número, no un objeto
    usuario: Usuario;    // ✅ Los detalles están en usuario
    carnetidentidad: string;
    direccion: string;
    fechanacimiento: string;
    nombre: string;
    apellido: string;
    correo?: string;
}


const AgendarCita = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [odontologos, setOdontologos] = useState<Odontologo[]>([]);
    const [horarios, setHorarios] = useState<Horario[]>([]);
    const [tiposConsulta, setTiposConsulta] = useState<TipoConsulta[]>([]);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);

    const [selectedOdontologo, setSelectedOdontologo] = useState('');
    const [selectedFecha, setSelectedFecha] = useState('');
    const [selectedHorario, setSelectedHorario] = useState('');
    const [selectedTipoConsulta, setSelectedTipoConsulta] = useState('');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [odontologosRes, tiposConsultaRes, pacientesRes] = await Promise.all([
                    Api.get('/profesionales/odontologos/'), 
                    Api.get('/citas/tipos-consulta/'),  // ✅ CORREGIDO: endpoint correcto
                    Api.get('/usuarios/pacientes/')
                ]);
                
                const odontologosData = odontologosRes.data.results || [];
                const tiposData = tiposConsultaRes.data.results || [];
                const pacientesData = pacientesRes.data.results || [];
                
                setOdontologos(odontologosData);
                setTiposConsulta(tiposData);
                setPacientes(pacientesData);
                
            } catch (fetchError: any) {
                console.error("❌ Error al cargar datos:", fetchError.response?.data || fetchError.message);
                setError('Error al cargar los datos necesarios para agendar.');
            }
        };
        fetchData();
    }, [user]);

    // 🕐 useEffect para cargar horarios disponibles cuando se seleccionan fecha y odontólogo
    useEffect(() => {
        const cargarHorarios = async () => {
            if (!selectedFecha || !selectedOdontologo) {
                setHorarios([]);
                return;
            }

            try {
                const endpoint = `/citas/horarios/disponibles/?fecha=${selectedFecha}&odontologo_id=${selectedOdontologo}`;
                const response = await Api.get(endpoint);
                setHorarios(response.data);
                
                // Limpiar horario seleccionado si ya no está disponible
                if (selectedHorario) {
                    const horarioDisponible = response.data.find(
                        (h: Horario) => h.id === parseInt(selectedHorario)
                    );
                    if (!horarioDisponible) {
                        setSelectedHorario('');
                    }
                }

            } catch (error: any) {
                console.error("❌ Error al cargar horarios:", error.response?.data || error.message);
                setHorarios([]);
                setError('Error al cargar los horarios disponibles. Por favor, intenta con otra fecha.');
            }
        };

        cargarHorarios();
    }, [selectedFecha, selectedOdontologo, selectedHorario]);

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

        // Buscar paciente
        let pacienteActual = pacientes.find(p => p.codusuario === user.id);
        
        if (!pacienteActual) {
            console.error("❌ No se encontró perfil de paciente para el usuario ID:", user.id);
            setError('No se encontró el perfil de paciente para este usuario. Por favor, contacta al administrador.');
            setIsSubmitting(false);
            return;
        }

        const nuevaConsulta = {
            fecha: selectedFecha,
            codpaciente: pacienteActual.codusuario,  // ✅ Ya es un número directo
            cododontologo: parseInt(selectedOdontologo, 10),
            idhorario: parseInt(selectedHorario, 10),
            idtipoconsulta: parseInt(selectedTipoConsulta, 10),
            // ✅ REMOVIDO: idestadoconsulta - El backend lo establece automáticamente en "Pendiente"
            motivo_consulta: "",  // ✅ Campo opcional
            horario_preferido: "cualquiera"  // ✅ Campo opcional
        };

        try{
            const response = await Api.post('/citas/consultas/', nuevaConsulta);
            setMessage('¡Cita agendada con éxito! Redirigiendo al dashboard...');
            
            setSelectedOdontologo('');
            setSelectedFecha('');
            setSelectedHorario('');
            setSelectedTipoConsulta('');
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
            
        } catch (submitError: any) {
            console.error("❌ Error al agendar cita:", submitError.response?.data || submitError.message);
            
            if (submitError.response?.status === 400) {
                const errorMsg = submitError.response?.data?.detail || 
                                submitError.response?.data?.message ||
                                'El horario seleccionado ya está ocupado. Por favor, elige otro horario.';
                setError(errorMsg);
            } else if (submitError.response?.status === 401) {
                setError('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
            } else if (submitError.response?.status === 403) {
                setError('No tienes permisos para realizar esta acción.');
            } else if (submitError.response?.status === 404) {
                setError('El servicio de citas no está disponible. Contacta al administrador.');
            } else if (submitError.response?.status >= 500) {
                setError('Error del servidor. Por favor, intenta nuevamente más tarde.');
            } else {
                setError('Hubo un error al agendar la cita. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 👇 VALIDACIÓN DE ROL ---
    if (!user) {
        return <div>Cargando...</div>;
    }

    const esPaciente = user.tipo_usuario?.rol === 'Paciente';
    
    if (!esPaciente) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopBar/>
                <div className="flex flex-col items-center justify-center px-4 pt-10">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
                        <h2 className="text-xl font-bold text-gray-800">Acción no permitida</h2>
                        <p className="text-gray-600 mt-2">
                            Este formulario es para que los pacientes agenden sus propias citas. Los administradores y
                            recepcionistas deben gestionar las citas desde la sección "Agenda de la Clínica".
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar/>
            <div className="flex flex-col items-center justify-center px-4 pt-10 pb-20">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <div className="flex flex-col items-center mb-6">
                        <img src="/dentist.svg" className="w-12 h-12 mb-3" alt="Icono de diente"/>
                        <h2 className="text-2xl font-bold text-gray-800">Agendar Nueva Cita</h2>
                        <p className="text-sm text-gray-500 mt-1">Completa los siguientes campos para programar tu
                            visita.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label htmlFor="odontologo"
                                   className="block text-sm font-medium text-gray-700 mb-1">Odontólogo</label>
                            <select id="odontologo" value={selectedOdontologo}
                                    onChange={(e) => setSelectedOdontologo(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500">
                                <option value="">Seleccione un odontólogo</option>
                                {odontologos.map(od => (
                                    <option key={od.codusuario} value={od.codusuario}>
                                        Dr(a). {od.usuario.nombre} {od.usuario.apellido}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selector de Fecha */}
                        <div>
                            <label htmlFor="fecha"
                                   className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                            <input type="date" id="fecha" value={selectedFecha}
                                   onChange={(e) => setSelectedFecha(e.target.value)}
                                   required
                                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>

                        {/* Selector de Horario */}
                        <div>
                            <label htmlFor="horario"
                                   className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
                            <select id="horario" value={selectedHorario}
                                    onChange={(e) => setSelectedHorario(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500">
                                <option value="">Seleccione una hora</option>
                                {horarios.map(h => (<option key={h.id} value={h.id}>{h.hora}</option>))}
                            </select>
                        </div>

                        {/* Selector de Tipo de Consulta */}
                        <div>
                            <label htmlFor="tipo-consulta" className="block text-sm font-medium text-gray-700 mb-1">Tipo
                                de Consulta</label>
                            <select id="tipo-consulta" value={selectedTipoConsulta}
                                    onChange={(e) => setSelectedTipoConsulta(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500">
                                <option value="">Seleccione el motivo</option>
                                {tiposConsulta.map(tc => (
                                    <option key={tc.id} value={tc.id}>{tc.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Botón de envío */}
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-300 disabled:bg-cyan-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Agendando...' : 'Agendar Cita'}
                        </button>
                    </form>

                    {/* Mensajes de feedback */}
                    {message && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm font-medium text-green-800">{message}</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgendarCita;







