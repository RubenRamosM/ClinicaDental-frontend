// src/pages/Reportes.tsx
import React, { useState, useEffect } from 'react';
import { Api } from '../lib/Api';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import toast, { Toaster } from 'react-hot-toast';
import { puedeVerReportes as puedeVerReportesHelper, obtenerNombreRol } from '../utils/roleHelpers';
import {
  obtenerReportePacientes,
  obtenerRangoFechas,
  formatearFechaParaAPI,
  type ReportePacientes,
  type PacienteReporte as PacienteReporteEstadisticas,
} from '../services/reportesService';

interface ConsultaReporte {
  idconsulta: number;
  fecha: string;
  paciente_nombre: string;
  paciente_apellido: string;
  paciente_rut: string;
  odontologo_nombre: string;
  odontologo_apellido: string;
  hora_inicio: string;
  tipo_consulta: string;
  estado: string;
}

interface PacienteReporte {
  codusuario: {
    codigo: number;
    nombre: string;
    apellido: string;
    correoelectronico: string;
    telefono?: string;
    sexo?: string;
  };
  carnetidentidad: string;
  fechanacimiento: string;
  direccion?: string;
}

const Reportes = () => {
  const { user, isAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'consultas' | 'pacientes'>('consultas');
  const [consultasData, setConsultasData] = useState<ConsultaReporte[]>([]);
  const [pacientesData, setPacientesData] = useState<PacienteReporte[]>([]);
  const [reportePacientes, setReportePacientes] = useState<ReportePacientes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtros para Consultas
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [odontologoFilter, setOdontologoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [pacienteFilter, setPacienteFilter] = useState('');
  
  // Filtros para Pacientes
  const [rangoFechasPacientes, setRangoFechasPacientes] = useState<'hoy' | 'semana' | 'mes' | 'anio'>('anio');
  const [actividadFilter, setActividadFilter] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [minCitasFilter, setMinCitasFilter] = useState('');
  const [maxCitasFilter, setMaxCitasFilter] = useState('');

  // Función auxiliar para procesar respuestas del backend
  const processApiResponse = (data: any, type: 'consultas' | 'pacientes'): any[] => {
    console.log(`🔍 [processApiResponse] Iniciando procesamiento de ${type}...`);
    console.log(`📦 [processApiResponse] Data recibida:`, data);
    console.log(`📊 [processApiResponse] Tipo de data:`, typeof data);
    console.log(`📋 [processApiResponse] Es array:`, Array.isArray(data));
    
    // Si ya es un array, devolverlo directamente
    if (Array.isArray(data)) {
      console.log(`✅ [processApiResponse] Data es un array directo, longitud: ${data.length}`);
      return data;
    }
    
    console.log(`🔍 [processApiResponse] Data NO es array, buscando propiedades...`);
    console.log(`📋 [processApiResponse] Claves disponibles:`, Object.keys(data || {}));
    
    // Si tiene una propiedad 'results' que es array (paginación)
    if (data?.results && Array.isArray(data.results)) {
      console.log(`✅ [processApiResponse] Encontrado data.results (paginación), longitud: ${data.results.length}`);
      return data.results;
    }
    
    // Si tiene una propiedad específica para el tipo
    if (type === 'consultas' && data?.consultas && Array.isArray(data.consultas)) {
      console.log(`✅ [processApiResponse] Encontrado data.consultas, longitud: ${data.consultas.length}`);
      console.log(`📄 [processApiResponse] Primera consulta:`, data.consultas[0]);
      return data.consultas;
    }
    
    if (type === 'pacientes' && data?.pacientes && Array.isArray(data.pacientes)) {
      console.log(`✅ [processApiResponse] Encontrado data.pacientes, longitud: ${data.pacientes.length}`);
      console.log(`📄 [processApiResponse] Primer paciente:`, data.pacientes[0]);
      return data.pacientes;
    }
    
    // Fallback: devolver array vacío y mostrar warning
    console.warn(`⚠️ [processApiResponse] NO se pudo procesar la respuesta ${type}`);
    console.warn(`⚠️ [processApiResponse] Estructura recibida:`, JSON.stringify(data, null, 2));
    console.warn(`⚠️ [processApiResponse] Devolviendo array vacío`);
    return [];
  };

  // Función auxiliar para obtener el nombre del paciente
  const getPacienteNombre = (consulta: ConsultaReporte): string => {
    try {
      return `${consulta.paciente_nombre} ${consulta.paciente_apellido}`.trim() || 'Sin paciente';
    } catch (error) {
      console.warn('Error obteniendo nombre del paciente:', error);
      return 'Sin paciente';
    }
  };

  // Función auxiliar para obtener el nombre del odontólogo
  const getOdontologoNombre = (consulta: ConsultaReporte): string => {
    try {
      return `Dr. ${consulta.odontologo_nombre} ${consulta.odontologo_apellido}`.trim() || 'Sin odontólogo';
    } catch (error) {
      console.warn('Error obteniendo nombre del odontólogo:', error);
      return 'Sin odontólogo';
    }
  };

  // Función auxiliar para obtener el tipo de consulta
  const getTipoConsulta = (consulta: ConsultaReporte): string => {
    try {
      return consulta.tipo_consulta || 'Sin tipo';
    } catch (error) {
      console.warn('Error obteniendo tipo de consulta:', error);
      return 'Sin tipo';
    }
  };

  // Función auxiliar para obtener el estado
  const getEstado = (consulta: ConsultaReporte): string => {
    try {
      return consulta.estado || 'Sin estado';
    } catch (error) {
      console.warn('Error obteniendo estado:', error);
      return 'Sin estado';
    }
  };

  // Función auxiliar para obtener la hora
  const getHora = (consulta: ConsultaReporte): string => {
    try {
      return consulta.hora_inicio || 'Sin hora';
    } catch (error) {
      console.warn('Error obteniendo hora:', error);
      return 'Sin hora';
    }
  };

  // Función auxiliar para formatear fechas
  const formatearFecha = (fecha: any): string => {
    if (!fecha) return 'Sin fecha';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.warn('Error formateando fecha:', fecha);
      return 'Fecha inválida';
    }
  };

  // ✅ NOTA: Backend acepta formato YYYY-MM-DD directamente (no necesita conversión)
  // Se eliminó la función convertirFechaParaBackend porque era innecesaria

  // Función para cargar reporte de pacientes con estadísticas
  const cargarReportePacientesEstadisticas = async () => {
    console.log("� [ADMIN - Reportes PACIENTES] ================== INICIO CARGA REPORTE PACIENTES ==================");
    console.log("�📊 [ADMIN - Reportes PACIENTES] Cargando reporte de pacientes con estadísticas...");
    console.log("🎯 [ADMIN - Reportes PACIENTES] Rango seleccionado:", rangoFechasPacientes);
    console.log("👤 [ADMIN - Reportes PACIENTES] Usuario:", {
      email: user?.email,
      tipo: user?.idtipousuario,
      subtipo: user?.subtipo
    });
    
    console.log("🔄 [ADMIN - Reportes PACIENTES] Estableciendo estados...");
    setLoading(true);
    setError('');
    console.log("✅ [ADMIN - Reportes PACIENTES] Estados inicializados (loading=true, error='')");
    
    try {
      console.log("📅 [ADMIN - Reportes PACIENTES] Obteniendo rango de fechas...");
      const rango = obtenerRangoFechas(rangoFechasPacientes);
      console.log("📅 [ADMIN - Reportes PACIENTES] Rango calculado:", {
        tipo: rangoFechasPacientes,
        fecha_inicio: rango.fecha_inicio,
        fecha_fin: rango.fecha_fin,
        dias: Math.ceil((new Date(rango.fecha_fin).getTime() - new Date(rango.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24))
      });
      
      // Agregar filtros adicionales
      const params: any = { ...rango };
      if (actividadFilter !== 'todos') {
        params.actividad = actividadFilter;
        console.log("🎯 [ADMIN - Reportes PACIENTES] Filtro actividad:", actividadFilter);
      }
      if (minCitasFilter) {
        params.min_citas = minCitasFilter;
        console.log("� [ADMIN - Reportes PACIENTES] Filtro mín. citas:", minCitasFilter);
      }
      if (maxCitasFilter) {
        params.max_citas = maxCitasFilter;
        console.log("📊 [ADMIN - Reportes PACIENTES] Filtro máx. citas:", maxCitasFilter);
      }
      
      console.log("�📡 [ADMIN - Reportes PACIENTES] Llamando API: /reportes/pacientes/");
      console.log("📦 [ADMIN - Reportes PACIENTES] Parámetros completos:", params);
      console.log("⏳ [ADMIN - Reportes PACIENTES] Iniciando petición HTTP...");
      
      const data = await obtenerReportePacientes(params);
      
      console.log("✅ [ADMIN - Reportes PACIENTES] Petición completada exitosamente");
      console.log("📊 [ADMIN - Reportes PACIENTES] Análisis de respuesta:", {
        tieneData: !!data,
        totalPacientes: data?.total_pacientes || 0,
        tienePeriodo: !!data?.periodo,
        periodoInicio: data?.periodo?.inicio || 'N/A',
        periodoFin: data?.periodo?.fin || 'N/A',
        tienePacientes: !!data?.pacientes,
        longitudPacientes: data?.pacientes?.length || 0,
      });
      
      console.log("📄 [ADMIN - Reportes PACIENTES] Respuesta COMPLETA:");
      console.log(JSON.stringify(data, null, 2));
      
      if (data?.pacientes && data.pacientes.length > 0) {
        console.log("📋 [ADMIN - Reportes PACIENTES] Primer paciente del reporte:");
        console.log(JSON.stringify(data.pacientes[0], null, 2));
        console.log("🔑 [ADMIN - Reportes PACIENTES] Campos del primer paciente:", Object.keys(data.pacientes[0]));
        console.log("📊 [ADMIN - Reportes PACIENTES] Estadísticas del primer paciente:", data.pacientes[0].estadisticas);
      } else {
        console.warn("⚠️ [ADMIN - Reportes PACIENTES] No se encontraron pacientes en la respuesta");
      }
      
      console.log("💾 [ADMIN - Reportes PACIENTES] Actualizando estado con setReportePacientes...");
      setReportePacientes(data);
      console.log("✅ [ADMIN - Reportes PACIENTES] Estado actualizado correctamente");
      
      toast.success(`Reporte cargado: ${data?.total_pacientes || 0} pacientes encontrados`);
    } catch (error: any) {
      console.error('❌ [ADMIN - Reportes PACIENTES] ================== ERROR ==================');
      console.error('❌ [ADMIN - Reportes PACIENTES] Tipo de error:', error?.constructor?.name);
      console.error('❌ [ADMIN - Reportes PACIENTES] Mensaje:', error?.message);
      console.error('❌ [ADMIN - Reportes PACIENTES] Response status:', error?.response?.status);
      console.error('❌ [ADMIN - Reportes PACIENTES] Response data:', error?.response?.data);
      console.error('❌ [ADMIN - Reportes PACIENTES] Error completo:', error);
      console.error('❌ [ADMIN - Reportes PACIENTES] Stack trace:', error?.stack);
      
      setError('Error al cargar el reporte de pacientes');
      toast.error('Error al cargar el reporte de pacientes');
      setReportePacientes(null);
    } finally {
      console.log('🏁 [ADMIN - Reportes PACIENTES] Finalizando carga...');
      setLoading(false);
      console.log('✅ [ADMIN - Reportes PACIENTES] Loading establecido a false');
      console.log("🏁 [ADMIN - Reportes PACIENTES] ================== FIN CARGA REPORTE PACIENTES ==================");
    }
  };

  useEffect(() => {
    if (isAuth) {
      console.log("🔄 [ADMIN - Reportes] Hook useEffect disparado", {
        isAuth,
        activeTab
      });
      
      if (activeTab === 'pacientes') {
        cargarReportePacientesEstadisticas();
      } else {
        loadReportes();
      }
    }
  }, [isAuth, activeTab, rangoFechasPacientes, actividadFilter, minCitasFilter, maxCitasFilter]);

  const loadReportes = async () => {
    console.log("� [ADMIN - Reportes] ================== INICIO CARGA REPORTES ==================");
    console.log("📊 [ADMIN - Reportes] Tab activo:", activeTab);
    console.log("📅 [ADMIN - Reportes] Filtros RAW:", {
      fechaInicio: fechaInicio || '(vacío)',
      fechaFin: fechaFin || '(vacío)',
      odontologoFilter: odontologoFilter || '(vacío)'
    });
    console.log("👤 [ADMIN - Reportes] Usuario autenticado:", {
      email: user?.email,
      tipo: user?.idtipousuario,
      subtipo: user?.subtipo
    });

    console.log("🔄 [ADMIN - Reportes] Estableciendo estados de loading...");
    setLoading(true);
    setError('');
    console.log("✅ [ADMIN - Reportes] Estados inicializados (loading=true, error='')");
    
    try {
      if (activeTab === 'consultas') {
        console.log("📋 [ADMIN - Reportes] ➡️ Procesando TAB: CONSULTAS");
        const params = new URLSearchParams();
        
        console.log("🔄 [ADMIN - Reportes] Creando URLSearchParams...");
        
        // ✅ Enviar fechas en formato ISO (YYYY-MM-DD) directamente
        if (fechaInicio) {
          params.append('fecha_inicio', fechaInicio);
          console.log("📅 [ADMIN - Reportes] Fecha inicio:", fechaInicio);
        }
        if (fechaFin) {
          params.append('fecha_fin', fechaFin);
          console.log("📅 [ADMIN - Reportes] Fecha fin:", fechaFin);
        }
        if (odontologoFilter) {
          params.append('odontologo', odontologoFilter);
          console.log("👨‍⚕️ [ADMIN - Reportes] Filtro odontólogo aplicado:", odontologoFilter);
        }
        if (estadoFilter) {
          params.append('estado', estadoFilter);
          console.log("📊 [ADMIN - Reportes] Filtro estado aplicado:", estadoFilter);
        }
        if (pacienteFilter) {
          params.append('paciente', pacienteFilter);
          console.log("👤 [ADMIN - Reportes] Filtro paciente aplicado:", pacienteFilter);
        }

        // ✅ CORRECCIÓN: Usar endpoint específico de citas en lugar de dashboard general
        const endpoint = `/reportes/citas/?${params.toString()}`;
        console.log("📡 [ADMIN - Reportes] Llamando API de CITAS:", {
          endpoint,
          endpointCompleto: `${Api.defaults?.baseURL || 'http://127.0.0.1:8000/api/v1'}${endpoint}`,
          params: Object.fromEntries(params.entries()),
          tipoReporte: 'CONSULTAS'
        });

        // Usar el endpoint correcto según la documentación
        console.log("⏳ [ADMIN - Reportes] Iniciando petición HTTP...");
        const response = await Api.get(endpoint);
        console.log("✅ [ADMIN - Reportes] Petición HTTP completada");
        
        console.log("📦 [ADMIN - Reportes] Respuesta HTTP recibida:", {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
        
        console.log("📊 [ADMIN - Reportes] Análisis de response.data:", {
          tipo: typeof response.data,
          esArray: Array.isArray(response.data),
          esObjeto: typeof response.data === 'object' && response.data !== null,
          claves: response.data ? Object.keys(response.data) : [],
          tieneConsultas: response.data?.consultas !== undefined,
          totalConsultas: response.data?.consultas?.length || 'N/A',
          totalCitas: response.data?.total_citas || 'N/A',
          periodo: response.data?.periodo || 'N/A',
        });
        
        console.log('🔍 [ADMIN - Reportes] URL final generada:', endpoint);
        console.log('📅 [ADMIN - Reportes] Filtros aplicados:', {
          fecha_inicio: params.get('fecha_inicio') || 'Sin filtro',
          fecha_fin: params.get('fecha_fin') || 'Sin filtro',
          odontologo: odontologoFilter || 'Sin filtro',
          estado: estadoFilter || 'Sin filtro',
          paciente: pacienteFilter || 'Sin filtro'
        });
        
        console.log('📄 [ADMIN - Reportes] Respuesta COMPLETA del backend:');
        console.log(JSON.stringify(response.data, null, 2));
        
        // Usar la función auxiliar para procesar la respuesta
        console.log('🔄 [ADMIN - Reportes] Procesando respuesta con processApiResponse...');
        const consultasArray = processApiResponse(response.data, 'consultas');
        
        console.log('✅ [ADMIN - Reportes] Array procesado exitosamente:', {
          longitud: consultasArray.length,
          primeraConsulta: consultasArray[0] || 'Array vacío',
          todasLasConsultas: consultasArray
        });
        
        console.log('💾 [ADMIN - Reportes] Actualizando estado con setConsultasData...');
        setConsultasData(consultasArray);
        console.log('✅ [ADMIN - Reportes] Estado actualizado correctamente');
      } else {
        // Para pacientes, usar el endpoint específico
        const response = await Api.get('/reportes/pacientes/');
        
        console.log('🔍 URL pacientes:', '/reportes/pacientes/');
        
        // Usar la función auxiliar para procesar la respuesta
        const pacientesArray = processApiResponse(response.data, 'pacientes');
        
        console.log('Respuesta pacientes:', response.data);
        console.log('Array procesado:', pacientesArray);
        setPacientesData(pacientesArray);
      }
    } catch (err: any) {
      console.error('❌ [ADMIN - Reportes] ================== ERROR CARGANDO REPORTES ==================');
      console.error('❌ [ADMIN - Reportes] Tipo de error:', err?.constructor?.name);
      console.error('❌ [ADMIN - Reportes] Mensaje:', err?.message);
      console.error('❌ [ADMIN - Reportes] Response status:', err?.response?.status);
      console.error('❌ [ADMIN - Reportes] Response data:', err?.response?.data);
      console.error('❌ [ADMIN - Reportes] Error completo:', err);
      console.error('❌ [ADMIN - Reportes] Stack trace:', err?.stack);
      
      setError('Error al cargar los reportes');
      toast.error('Error al cargar los reportes');
    } finally {
      console.log('🏁 [ADMIN - Reportes] Finalizando carga (finally block)...');
      setLoading(false);
      console.log('✅ [ADMIN - Reportes] Loading establecido a false');
      console.log("🏁 [ADMIN - Reportes] ================== FIN CARGA REPORTES ==================");
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    // Validación más estricta para asegurar que data es un array
    if (!Array.isArray(data) || data.length === 0) {
      toast.error('No hay datos para exportar o el formato es incorrecto');
      console.warn('Datos para exportar:', data);
      return;
    }

    // Para consultas, crear headers más legibles
    if (filename.includes('consultas') && data.length > 0 && 'idconsulta' in data[0]) {
      const csvData = data.map(consulta => ({
        'ID': consulta.idconsulta || '',
        'Fecha': formatearFecha(consulta.fecha) || '',
        'Hora': consulta.hora_inicio || '',
        'Paciente': `${consulta.paciente_nombre || ''} ${consulta.paciente_apellido || ''}`.trim(),
        'RUT': consulta.paciente_rut || '',
        'Odontólogo': `${consulta.odontologo_nombre || ''} ${consulta.odontologo_apellido || ''}`.trim(),
        'Tipo de Consulta': consulta.tipo_consulta || '',
        'Estado': consulta.estado || ''
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${(row as any)[header]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Reporte exportado exitosamente');
      return;
    }

    // Para otros tipos de datos, usar el método genérico
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Reporte exportado exitosamente');
  };

  if (!isAuth) {
    console.log("⚠️ [ADMIN - Reportes] Usuario no autenticado");
    return <div>Cargando...</div>;
  }

  // ✅ Verificar permisos usando helper dinámico (sin IDs hardcodeados)
  const esAdministrador = puedeVerReportesHelper(user);
  const nombreRol = obtenerNombreRol(user);
  
  console.log("🔐 [ADMIN - Reportes] Verificación de permisos:", {
    usuario: {
      email: user?.email,
      idtipousuario: user?.idtipousuario,
      tipo_usuario_rol: user?.tipo_usuario?.rol,
      subtipo: user?.subtipo
    },
    nombreRol,
    esAdministrador
  });
  
  if (!esAdministrador) {
    console.warn("⛔ [ADMIN - Reportes] Acceso denegado - Usuario no es administrador");
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex flex-col items-center justify-center px-4 pt-10">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-bold text-gray-800">Acceso no autorizado</h2>
            <p className="text-gray-600 mt-2">
              Solo los administradores pueden acceder a los reportes del sistema.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Tu rol actual: {nombreRol}
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log("✅ [ADMIN - Reportes] Acceso permitido - Renderizando reportes");
  
  // 🎨 LOGS DE RENDERIZADO
  console.log('🎨 [RENDER] Estado actual antes de renderizar:', {
    activeTab,
    loading,
    error,
    consultasData: {
      esArray: Array.isArray(consultasData),
      longitud: consultasData?.length || 0,
      primera: consultasData?.[0] || null
    },
    reportePacientes: {
      existe: !!reportePacientes,
      totalPacientes: reportePacientes?.total_pacientes || 0
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reportes del Sistema</h1>
          <p className="text-gray-600 mt-2">
            Genera y visualiza reportes de consultas y pacientes
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('consultas')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'consultas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reporte de Consultas
              </button>
              <button
                onClick={() => setActiveTab('pacientes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pacientes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reporte de Pacientes
              </button>
            </nav>
          </div>
        </div>

        {/* Filtros para consultas */}
        {activeTab === 'consultas' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h3>
            
            {/* Fila 1: Fechas y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Fecha Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Fecha Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📊 Estado de Cita
                </label>
                <select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="completada">✅ Completadas</option>
                  <option value="pendiente">⏳ Pendientes</option>
                  <option value="cancelada">❌ Canceladas</option>
                </select>
              </div>
            </div>
            
            {/* Fila 2: Búsquedas por nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👨‍⚕️ Buscar Odontólogo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Maria, Lopez, Carlos..."
                  value={odontologoFilter}
                  onChange={(e) => setOdontologoFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Busca por nombre o apellido</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 Buscar Paciente
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ana, Martinez, María..."
                  value={pacienteFilter}
                  onChange={(e) => setPacienteFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Busca por nombre o apellido</p>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={loadReportes}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {loading ? 'Buscando...' : 'Aplicar Filtros'}
              </button>
              <button
                onClick={() => {
                  setFechaInicio('');
                  setFechaFin('');
                  setOdontologoFilter('');
                  setEstadoFilter('');
                  setPacienteFilter('');
                  loadReportes();
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar Filtros
              </button>
              
              {/* Contador de filtros activos */}
              {(fechaInicio || fechaFin || odontologoFilter || estadoFilter || pacienteFilter) && (
                <div className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md text-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                  {[fechaInicio, fechaFin, odontologoFilter, estadoFilter, pacienteFilter].filter(Boolean).length} filtro(s) activo(s)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'consultas' ? 'Reporte de Consultas' : 'Reporte de Pacientes'}
            </h2>
            <button
              onClick={() => {
                if (activeTab === 'consultas') {
                  exportToCSV(consultasData, `reporte_${activeTab}_${new Date().toISOString().split('T')[0]}`);
                } else if (reportePacientes) {
                  // Exportar reporte de pacientes con estadísticas
                  const dataParaExportar = reportePacientes.pacientes.map(p => ({
                    'ID': p.id,
                    'Nombre': p.nombre,
                    'Apellido': p.apellido,
                    'Email': p.email || 'N/A',
                    'Teléfono': p.telefono || 'N/A',
                    'Citas en Período': p.estadisticas?.citas_periodo || 0,
                    'Citas Totales': p.estadisticas?.citas_totales || 0,
                    'Planes Activos': p.estadisticas?.planes_activos || 0,
                    'Planes Totales': p.estadisticas?.planes_totales || 0,
                    'Última Cita': p.estadisticas?.ultima_cita || 'Sin citas'
                  }));
                  exportToCSV(dataParaExportar, `reporte_${activeTab}_${new Date().toISOString().split('T')[0]}`);
                }
              }}
              disabled={activeTab === 'pacientes' && !reportePacientes}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar CSV
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando datos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                {error}
              </div>
            ) : (
              <>
                {activeTab === 'consultas' ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odontólogo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(consultasData) && consultasData.map((consulta, index) => {
                          // Debug: mostrar la estructura de cada consulta
                          if (index === 0) {
                            console.log('🎨 [RENDER] Renderizando primera consulta...');
                            console.log('📄 [RENDER] Estructura completa:', consulta);
                            console.log('🔑 [RENDER] Campos disponibles:', Object.keys(consulta));
                            console.log('📊 [RENDER] Valores:', {
                              id: consulta.idconsulta,
                              fecha: consulta.fecha,
                              paciente: `${consulta.paciente_nombre} ${consulta.paciente_apellido}`,
                              odontologo: `${consulta.odontologo_nombre} ${consulta.odontologo_apellido}`,
                              tipo: consulta.tipo_consulta,
                              estado: consulta.estado
                            });
                          }
                          
                          return (
                            <tr key={consulta.idconsulta || index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatearFecha(consulta.fecha)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {getHora(consulta)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {getPacienteNombre(consulta)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {getOdontologoNombre(consulta)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {getTipoConsulta(consulta)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  getEstado(consulta) === 'Completada' 
                                    ? 'bg-green-100 text-green-800'
                                    : getEstado(consulta) === 'Cancelada'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {getEstado(consulta)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {(!Array.isArray(consultasData) || consultasData.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        {!Array.isArray(consultasData) 
                          ? 'Error: Los datos no están en el formato correcto'
                          : 'No se encontraron consultas con los filtros aplicados'
                        }
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Filtros de rango para pacientes */}
                    <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Filtro de Período */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">📅 Período de Análisis:</label>
                          <div className="flex flex-wrap gap-2">
                            {(['hoy', 'semana', 'mes', 'anio'] as const).map((rango) => (
                              <button
                                key={rango}
                                onClick={() => setRangoFechasPacientes(rango)}
                                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                  rangoFechasPacientes === rango
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                }`}
                              >
                                {rango === 'hoy' ? '📆 Hoy' : rango === 'semana' ? '📅 Semana' : rango === 'mes' ? '🗓️ Mes' : '📊 Año'}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Filtro de Actividad */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">🎯 Filtrar por Actividad:</label>
                          <select
                            value={actividadFilter}
                            onChange={(e) => setActividadFilter(e.target.value as 'todos' | 'activos' | 'inactivos')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="todos">👥 Todos los pacientes</option>
                            <option value="activos">✅ Solo activos (con citas en período)</option>
                            <option value="inactivos">⚠️ Solo inactivos (sin citas en período)</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            {actividadFilter === 'activos' && '✅ Pacientes que vinieron en el período seleccionado'}
                            {actividadFilter === 'inactivos' && '⚠️ Pacientes SIN citas en el período (para recordatorios)'}
                            {actividadFilter === 'todos' && '👥 Mostrando todos los pacientes registrados'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Filtros de Cantidad de Citas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">📊 Mínimo de Citas Totales:</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Ej: 3"
                            value={minCitasFilter}
                            onChange={(e) => setMinCitasFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Ver pacientes con al menos X citas</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">📊 Máximo de Citas Totales:</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Ej: 10"
                            value={maxCitasFilter}
                            onChange={(e) => setMaxCitasFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Ver pacientes con máximo X citas</p>
                        </div>
                      </div>
                      
                      {/* Botón de limpiar filtros de pacientes */}
                      {(actividadFilter !== 'todos' || minCitasFilter || maxCitasFilter) && (
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setActividadFilter('todos');
                              setMinCitasFilter('');
                              setMaxCitasFilter('');
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Limpiar Filtros Adicionales
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Resumen de estadísticas */}
                    {reportePacientes && (() => {
                      console.log('🎨 [RENDER PACIENTES] Renderizando resumen de estadísticas...');
                      console.log('📊 [RENDER PACIENTES] Total pacientes:', reportePacientes.total_pacientes);
                      console.log('📅 [RENDER PACIENTES] Período:', reportePacientes.periodo);
                      console.log('📋 [RENDER PACIENTES] Cantidad de pacientes en array:', reportePacientes.pacientes.length);
                      return null;
                    })()}
                    {reportePacientes && (
                      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Total Pacientes</p>
                          <p className="text-2xl font-bold text-blue-600">{reportePacientes.total_pacientes}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Período</p>
                          <p className="text-sm font-medium text-green-600">
                            {new Date(reportePacientes.periodo.inicio).toLocaleDateString('es-ES')} - {new Date(reportePacientes.periodo.fin).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Promedio Citas/Paciente</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {reportePacientes.pacientes.length > 0
                              ? (reportePacientes.pacientes.reduce((sum, p) => sum + (p.estadisticas?.citas_totales || 0), 0) / reportePacientes.pacientes.length).toFixed(1)
                              : '0'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tabla de pacientes con estadísticas */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Citas (Período)</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Citas (Total)</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Planes Activos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Cita</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportePacientes && reportePacientes.pacientes.map((paciente, index) => {
                            if (index === 0) {
                              console.log('🎨 [RENDER PACIENTES] Renderizando primer paciente de la tabla...');
                              console.log('📄 [RENDER PACIENTES] Estructura completa del paciente:', paciente);
                              console.log('🔑 [RENDER PACIENTES] Campos disponibles:', Object.keys(paciente));
                              console.log('📊 [RENDER PACIENTES] Valores extraídos:', {
                                id: paciente.id,
                                nombre: paciente.nombre,
                                apellido: paciente.apellido,
                                email: paciente.email,
                                telefono: paciente.telefono,
                                tieneEstadisticas: !!paciente.estadisticas,
                                estadisticas: paciente.estadisticas
                              });
                            }
                            
                            return (
                              <tr key={paciente.id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {paciente.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {paciente.nombre} {paciente.apellido}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {paciente.email || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {paciente.telefono || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {paciente.estadisticas?.citas_periodo || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {paciente.estadisticas?.citas_totales || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  (paciente.estadisticas?.planes_activos || 0) > 0
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {paciente.estadisticas?.planes_activos || 0} / {paciente.estadisticas?.planes_totales || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {paciente.estadisticas?.ultima_cita 
                                  ? new Date(paciente.estadisticas.ultima_cita).toLocaleDateString('es-ES')
                                  : 'Sin citas'
                                }
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {(!reportePacientes || reportePacientes.pacientes.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          No se encontraron pacientes en el período seleccionado
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;






