import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import { Api } from "../lib/Api";
import { useAuth } from "../context/AuthContext";
import { descargarPDFConsentimiento } from "../services/consentimientoService";

// Ajusta esta ruta si tu router usa otra (por ejemplo: "/politicanoshow")
const POLITICAS_ROUTE = "/politicanoshow";

// Interfaz actualizada para coincidir con la respuesta real del backend
interface Consulta {
  id: number;
  fecha: string;
  
  // IDs simples (no son objetos anidados)
  codpaciente: number;
  cododontologo: number | null;
  codrecepcionista: number | null;
  idhorario: number;
  idtipoconsulta: number;
  idestadoconsulta: number;
  
  // Campos calculados por el backend (estos SÍ existen)
  paciente_nombre: string;
  paciente_apellido: string;
  odontologo_nombre: string | null;
  tipo_consulta_nombre: string;
  estado_consulta_nombre: string;
  
  // Campos de estado
  estado: string;
  fecha_preferida: string | null;
  horario_preferido: string;
  motivo_consulta: string;
  diagnostico: string | null;
  tratamiento: string | null;
  costo_consulta: string;
  requiere_pago: boolean;
  
  // Consentimientos (agregado por el frontend)
  consentimientos?: { id: number }[];
}

const Agenda = () => {
  const [citas, setCitas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);

  // Traemos el usuario para controlar visibilidad (admin=1, recepcionista=3)
  const auth = (useAuth?.() as any) || {};
  const { user } = auth;

  const rolId: number = useMemo(() => {
    const raw = user?.tipo_usuario?.id as number | undefined;
    return Number(raw || 0);
  }, [user]);

  const canManagePolicies = rolId === 1 || rolId === 3;

  useEffect(() => {
    const fetchCitas = async () => {
      console.log("\n\n");
      console.log("═══════════════════════════════════════════════════════════════");
      console.log("📅 AGENDA: CARGA INICIAL DE CITAS");
      console.log("═══════════════════════════════════════════════════════════════");
      console.log("📍 Timestamp:", new Date().toISOString());
      console.log("👤 Usuario actual:", user?.nombre, user?.apellido);
      console.log("🎭 Rol ID:", rolId);
      console.log("🔐 Puede gestionar políticas:", canManagePolicies);
      
      try {
        console.log("\n🔍 PASO 1: Cargando citas desde API");
        console.log("📤 Endpoint: GET /citas/");
        const tiempoInicio = Date.now();
        
        const response = await Api.get("/citas/");
        const duracion = Date.now() - tiempoInicio;
        
        console.log("✅ Respuesta recibida en", duracion, "ms");
        console.log("📊 Status:", response.status);
        console.log("📦 Estructura de response.data:", Object.keys(response.data));
        
        const citasRecibidas = response.data.results || [];
        console.log("📋 Cantidad de citas recibidas:", citasRecibidas.length);
        
        if (citasRecibidas.length > 0) {
          console.log("🔍 Primera cita (ejemplo):", JSON.stringify(citasRecibidas[0], null, 2));
          console.log("📊 Campos disponibles:", Object.keys(citasRecibidas[0]));
        } else {
          console.log("⚠️ No hay citas para mostrar");
        }

        // Agregar información de consentimientos a cada cita
        console.log("\n🔍 PASO 2: Cargando consentimientos para cada cita");
        const citasConConsentimientos = await Promise.all(
          citasRecibidas.map(async (cita: any, index: number) => {
            console.log(`\n--- Cita ${index + 1}/${citasRecibidas.length} ---`);
            console.log("  📋 ID Cita:", cita.id);
            console.log("  👤 Paciente ID:", cita.codpaciente);
            console.log("  📅 Fecha:", cita.fecha);
            console.log("  🕐 Hora:", cita.idhorario?.hora);
            console.log("  📊 Estado:", cita.idestadoconsulta?.estado);
            
            try {
              // ✅ CORREGIDO: Usar endpoint correcto con parámetro 'paciente_id'
              const consentimientoUrl = `/historia-clinica/consentimientos/por_paciente/?paciente_id=${cita.codpaciente}`;
              console.log("  📤 Buscando consentimientos:", consentimientoUrl);
              
              const consentimientosResponse = await Api.get(consentimientoUrl);
              const consentimientos = consentimientosResponse.data || [];
              
              console.log("  ✅ Consentimientos encontrados:", consentimientos.length);
              if (consentimientos.length > 0) {
                console.log("  📄 IDs de consentimientos:", consentimientos.map((c: any) => c.id));
              }
              
              return { ...cita, consentimientos };
            } catch (err: unknown) {
              console.error(`  ❌ Error cargando consentimientos:`, err);
              
              const error = err as {
                response?: {
                  status?: number;
                  data?: unknown;
                };
                message?: string;
              };
              
              if (error.response) {
                console.error("  📥 Status:", error.response.status);
                console.error("  📥 Data:", JSON.stringify(error.response.data, null, 2));
              }
              
              return { ...cita, consentimientos: [] };
            }
          })
        );

        console.log("\n✅ PASO 3: Procesamiento completado");
        console.log("📊 Total de citas procesadas:", citasConConsentimientos.length);
        console.log("📊 Resumen de consentimientos:");
        
        const conConsentimiento = citasConConsentimientos.filter(c => c.consentimientos?.length > 0).length;
        const sinConsentimiento = citasConConsentimientos.length - conConsentimiento;
        
        console.log("  ✅ Con consentimiento:", conConsentimiento);
        console.log("  ⚠️ Sin consentimiento:", sinConsentimiento);

        setCitas(citasConConsentimientos);
        console.log("\n🎉 Citas cargadas exitosamente en el estado");
        console.log("═══════════════════════════════════════════════════════════════\n\n");
      } catch (err: unknown) {
        console.error("\n❌❌❌ ERROR CARGANDO CITAS ❌❌❌");
        console.error("📍 Timestamp:", new Date().toISOString());
        
        const error = err as {
          response?: {
            status?: number;
            statusText?: string;
            data?: unknown;
          };
          message?: string;
        };
        
        if (error.response) {
          console.error("🌐 HTTP Status:", error.response.status);
          console.error("📄 Status Text:", error.response.statusText);
          console.error("📦 Response Data:", JSON.stringify(error.response.data, null, 2));
        } else {
          console.error("⚠️ NO HAY RESPONSE - Error de red o CORS");
          console.error("💬 Message:", error.message);
        }
        
        console.error("═══════════════════════════════════════════════════════════════\n\n");
      } finally {
        setLoading(false);
        console.log("🏁 Loading finalizado");
      }
    };
    fetchCitas();
  }, []);

  const handleConfirmarCita = async (citaId: number) => {
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("✅ CONFIRMAR CITA");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("📍 Timestamp:", new Date().toISOString());
    console.log("🆔 ID de cita:", citaId);
    
    const idEstadoConfirmada = 2;
    console.log("📊 Nuevo estado ID:", idEstadoConfirmada, "(Confirmada)");
    
    try {
      console.log("\n📤 Enviando PATCH al backend");
      console.log("📍 URL:", `/citas/${citaId}/`);
      console.log("📦 Payload:", { idestadoconsulta: idEstadoConfirmada });
      
      const tiempoInicio = Date.now();
      const response = await Api.patch(`/citas/${citaId}/`, {
        idestadoconsulta: idEstadoConfirmada,
      });
      const duracion = Date.now() - tiempoInicio;
      
      console.log("✅ Respuesta recibida en", duracion, "ms");
      console.log("📥 Status:", response.status);
      console.log("📥 Data:", JSON.stringify(response.data, null, 2));
      
      console.log("\n🔄 Actualizando estado local");
      setCitas((citasActuales) => {
        const citaActualizada = citasActuales.find(c => c.id === citaId);
        console.log("📋 Cita antes de actualizar:", citaActualizada);
        
        const nuevasCitas = citasActuales.map((cita) =>
          cita.id === citaId
            ? {
                ...cita,
                idestadoconsulta: idEstadoConfirmada,
                estado_consulta_nombre: "Confirmada",  // ← Actualizar campo calculado
                estado: "confirmada",
              }
            : cita
        );
        
        const citaNueva = nuevasCitas.find(c => c.id === citaId);
        console.log("📋 Cita después de actualizar:", citaNueva);
        
        return nuevasCitas;
      });
      
      console.log("✅ Cita confirmada exitosamente");
      console.log("═══════════════════════════════════════════════════════════════\n");
    } catch (error: unknown) {
      console.error("\n❌❌❌ ERROR AL CONFIRMAR CITA ❌❌❌");
      console.error("📍 Timestamp:", new Date().toISOString());
      console.error("🔴 Error completo:", error);
      
      const err = error as {
        response?: {
          status?: number;
          statusText?: string;
          data?: unknown;
        };
        message?: string;
      };
      
      if (err.response) {
        console.error("🌐 HTTP Status:", err.response.status);
        console.error("📄 Status Text:", err.response.statusText);
        console.error("📦 Response Data:", JSON.stringify(err.response.data, null, 2));
      } else {
        console.error("⚠️ NO HAY RESPONSE - Error de red");
        console.error("💬 Message:", err.message);
      }
      
      console.error("═══════════════════════════════════════════════════════════════\n");
      alert("No se pudo confirmar la cita.");
    }
  };

  const handleDescargarPDF = async (consentimientoId: number) => {
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("📄 DESCARGAR PDF CONSENTIMIENTO");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("📍 Timestamp:", new Date().toISOString());
    console.log("🆔 ID de consentimiento:", consentimientoId);
    
    try {
      console.log("\n🔍 PASO 1: Descargando PDF del backend");
      console.log("📤 Llamando a descargarPDFConsentimiento()");
      
      const tiempoInicio = Date.now();
      const pdfBlob = await descargarPDFConsentimiento(consentimientoId);
      const duracion = Date.now() - tiempoInicio;
      
      console.log("✅ Blob recibido en", duracion, "ms");
      console.log("📊 Tamaño del blob:", (pdfBlob.size / 1024).toFixed(2), "KB");
      console.log("📊 Tipo MIME:", pdfBlob.type);
      
      console.log("\n🔍 PASO 2: Creando URL temporal");
      const url = window.URL.createObjectURL(pdfBlob);
      console.log("🔗 URL temporal creada:", url.substring(0, 50) + "...");
      
      console.log("\n🔍 PASO 3: Creando elemento <a> para descarga");
      const link = document.createElement("a");
      link.href = url;
      const fileName = `consentimiento_${consentimientoId}.pdf`;
      link.setAttribute("download", fileName);
      console.log("📁 Nombre de archivo:", fileName);
      
      console.log("\n🔍 PASO 4: Iniciando descarga automática");
      document.body.appendChild(link);
      link.click();
      console.log("✅ Click simulado en el link");
      
      console.log("\n🔍 PASO 5: Limpieza de recursos");
      link.remove();
      console.log("✅ Elemento <a> removido del DOM");
      
      window.URL.revokeObjectURL(url);
      console.log("✅ URL temporal revocada");
      
      console.log("\n🎉 PDF descargado exitosamente");
      console.log("═══════════════════════════════════════════════════════════════\n");
    } catch (error: unknown) {
      console.error("\n❌❌❌ ERROR AL DESCARGAR PDF ❌❌❌");
      console.error("📍 Timestamp:", new Date().toISOString());
      console.error("🔴 Error completo:", error);
      
      const err = error as {
        response?: {
          status?: number;
          statusText?: string;
          data?: unknown;
        };
        message?: string;
      };
      
      if (err.response) {
        console.error("🌐 HTTP Status:", err.response.status);
        console.error("📄 Status Text:", err.response.statusText);
        console.error("📦 Response Data:", JSON.stringify(err.response.data, null, 2));
      } else {
        console.error("⚠️ NO HAY RESPONSE - Error de red o procesamiento");
        console.error("💬 Message:", err.message);
      }
      
      console.error("═══════════════════════════════════════════════════════════════\n");
      alert("No se pudo descargar el PDF del consentimiento.");
    }
  };

  const getStatusBadgeClass = (estado: string) => {
    const estadoLower = estado?.toLowerCase();
    
    let clase: string;
    switch (estadoLower) {
      case "pendiente":
        clase = "bg-yellow-100 text-yellow-800";
        break;
      case "agendada":
        clase = "bg-blue-100 text-blue-800";
        break;
      case "confirmada":
        clase = "bg-green-100 text-green-800";
        break;
      case "cancelada":
        clase = "bg-red-100 text-red-800";
        break;
      case "finalizada":
        clase = "bg-gray-100 text-gray-800";
        break;
      default:
        console.log("⚠️ Estado desconocido:", estado, "→ usando estilo amarillo");
        clase = "bg-yellow-100 text-yellow-800";
    }
    
    return clase;
  };

  if (loading) {
    console.log("⏳ AGENDA: Mostrando pantalla de carga");
    return <div className="p-6 text-gray-700">Cargando agenda...</div>;
  }

  console.log("\n🎨 AGENDA: RENDERIZANDO INTERFAZ");
  console.log("📊 Cantidad de citas a mostrar:", citas.length);
  console.log("👤 Usuario:", user?.nombre, user?.apellido);
  console.log("🔐 Puede gestionar políticas:", canManagePolicies);
  
  if (citas.length > 0) {
    console.log("📋 Resumen de estados:");
    const estadosCount = citas.reduce((acc, cita) => {
      const estado = cita.estado_consulta_nombre || "Sin estado";
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(estadosCount).forEach(([estado, count]) => {
      console.log(`  • ${estado}: ${count} cita(s)`);
    });
    
    const conConsentimientos = citas.filter(c => c.consentimientos && c.consentimientos.length > 0).length;
    console.log("📄 Citas con consentimiento:", conConsentimientos);
    console.log("⚠️ Citas sin consentimiento:", citas.length - conConsentimientos);
  }
  console.log("");

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agenda de la Clínica</h1>
        </header>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Paciente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Odontólogo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Consentimiento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {citas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-gray-50">
                    {/* COLUMNA PACIENTE - Usar campos calculados */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cita.paciente_nombre} {cita.paciente_apellido}
                    </td>
                    
                    {/* COLUMNA FECHA Y HORA - Usar horario_preferido temporalmente */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cita.fecha} a las {cita.horario_preferido || "N/A"}
                    </td>
                    
                    {/* COLUMNA ODONTÓLOGO - Usar campo calculado */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cita.odontologo_nombre || "No asignado"}
                    </td>
                    
                    {/* COLUMNA ESTADO - Usar campo calculado */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          cita.estado_consulta_nombre
                        )}`}
                      >
                        {cita.estado_consulta_nombre}
                      </span>
                    </td>
                    
                    {/* COLUMNA CONSENTIMIENTO - Sin cambios */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {cita.consentimientos && cita.consentimientos.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓ Firmado</span>
                          <button
                            onClick={() =>
                              handleDescargarPDF(cita.consentimientos![0].id)
                            }
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            title="Descargar PDF"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">No firmado</span>
                      )}
                    </td>
                    
                    {/* COLUMNA ACCIONES - Actualizar condición */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {cita.idestadoconsulta === 1 && (
                        <button
                          onClick={() => handleConfirmarCita(cita.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Confirmar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Políticas No-Show: solo Admin (1) y Recepcionista (3) */}
        {canManagePolicies && (
          <section className="mt-8">
            <div className="rounded-2xl border border-cyan-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Políticas de No‑Show</h2>
                    <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                      Configura multas y bloqueos automáticos para estados como “Atrasado”,
                      “No asistió” u otros. Administra todas tus políticas desde una sola
                      pantalla.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to={POLITICAS_ROUTE}
                      className="inline-flex justify-center rounded-lg bg-cyan-600 px-4 py-2 text-white text-sm font-semibold hover:bg-cyan-700"
                    >
                      Ver políticas
                    </Link>
                    {/* Conservamos la misma ruta que usa tu proyecto para crear, 
                        si tu router tiene una ruta específica de creación, cámbiala a `${POLITICAS_ROUTE}/crear` */}
                    <Link
                      to={`${POLITICAS_ROUTE}`}
                      className="inline-flex justify-center rounded-lg border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
                    >
                      Crear nueva
                    </Link>
                  </div>
                </div>

                {/* Tips breves y responsive */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg bg-cyan-50 border border-cyan-100 p-4">
                    <p className="text-sm text-cyan-900">
                      Define el estado objetivo y el monto de la multa.
                    </p>
                  </div>
                  <div className="rounded-lg bg-cyan-50 border border-cyan-100 p-4">
                    <p className="text-sm text-cyan-900">
                      Activa bloqueo temporal (ej. 2 días) para evitar nuevos turnos.
                    </p>
                  </div>
                  <div className="rounded-lg bg-cyan-50 border border-cyan-100 p-4">
                    <p className="text-sm text-cyan-900">
                      Los cambios se aplican automáticamente al cambiar el estado de la cita.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Agenda;







