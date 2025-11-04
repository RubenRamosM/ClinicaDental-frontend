// src/pages/DetallePresupuestoDigital.tsx
import { useState, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar";
import HistorialAceptaciones from "../components/HistorialAceptaciones";
import { toast, Toaster } from "react-hot-toast";
import {
  obtenerPresupuestoDigital,
  emitirPresupuestoDigital,
  generarPDFPresupuesto,
  formatearMonto,
  getEstadoPresupuestoColor,
} from "../services/presupuestosDigitalesService";
import type { PresupuestoDigitalDetalle } from "../interfaces/PresupuestoDigital";
import { puedeGestionarPresupuestos } from "../utils/roleHelpers";

export default function DetallePresupuestoDigital() {
  const { isAuth, user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [presupuesto, setPresupuesto] = useState<PresupuestoDigitalDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    console.log("\n🔄 useEffect ejecutado - Cargando presupuesto");
    console.log("Parámetro ID de URL:", id);
    if (id) {
      console.log("✅ ID válido, iniciando carga...");
      cargarPresupuesto();
    } else {
      console.warn("⚠️ No hay ID en la URL");
    }
  }, [id]);

  const cargarPresupuesto = async () => {
    console.log("\n=== DETALLE PRESUPUESTO: INICIO CARGA ===");
    console.log("📋 ID del presupuesto solicitado:", id);
    console.log("👤 Usuario actual:", {
      tipo: user?.idtipousuario,
      usuario: user
    });
    
    setLoading(true);
    try {
      console.log("📡 Consultando endpoint: GET /presupuestos-digitales/" + id + "/");
      console.log("⏳ Esperando respuesta del servidor...");
      
      const presupuestoData = await obtenerPresupuestoDigital(parseInt(id!));
      
      console.log("\n✅ RESPUESTA COMPLETA DEL BACKEND:");
      console.log("🔍 Estructura completa del objeto:", JSON.stringify(presupuestoData, null, 2));
      
      console.log("\n📊 ANÁLISIS DE CAMPOS CLAVE:");
      console.log("ID:", presupuestoData.id);
      console.log("Código Corto:", presupuestoData.codigo_corto);
      console.log("Código Completo:", presupuestoData.codigo_presupuesto);
      console.log("Estado:", presupuestoData.estado);
      console.log("Vigente:", presupuestoData.esta_vigente);
      console.log("Puede Editarse:", presupuestoData.puede_editarse);
      
      console.log("\n👥 DATOS DE PACIENTE:");
      console.log("Campo 'paciente_nombre':", presupuestoData.paciente_nombre);
      console.log("Tipo:", typeof presupuestoData.paciente_nombre);
      
      console.log("\n🦷 DATOS DE ODONTÓLOGO:");
      console.log("Campo 'odontologo_nombre':", presupuestoData.odontologo_nombre);
      console.log("Tipo:", typeof presupuestoData.odontologo_nombre);
      
      console.log("\n💰 DATOS FINANCIEROS:");
      console.log("Subtotal:", presupuestoData.subtotal);
      console.log("Descuento:", presupuestoData.descuento);
      console.log("Total:", presupuestoData.total);
      console.log("Cantidad de ítems:", presupuestoData.cantidad_items);
      
      console.log("\n📦 DATOS DE ÍTEMS:");
      console.log("Array items existe:", !!presupuestoData.items);
      console.log("Cantidad de ítems en array:", presupuestoData.items?.length || 0);
      if (presupuestoData.items && presupuestoData.items.length > 0) {
        console.log("Primer ítem (ejemplo):", presupuestoData.items[0]);
      }
      
      console.log("\n📅 FECHAS:");
      console.log("Fecha Emisión:", presupuestoData.fecha_emision);
      console.log("Fecha Vigencia:", presupuestoData.fecha_vigencia);
      console.log("Fecha Emitido:", presupuestoData.fecha_emitido);
      console.log("Días para vencimiento:", presupuestoData.dias_para_vencimiento);
      
      console.log("\n📄 OTROS CAMPOS:");
      console.log("Es tramo:", presupuestoData.es_tramo);
      console.log("Número tramo:", presupuestoData.numero_tramo);
      console.log("PDF generado:", presupuestoData.pdf_generado);
      console.log("Usuario emite nombre:", presupuestoData.usuario_emite_nombre);
      console.log("Términos y condiciones:", !!presupuestoData.terminos_condiciones);
      console.log("Notas:", !!presupuestoData.notas);
      
      console.log("\n✅ Asignando datos al estado del componente...");
      setPresupuesto(presupuestoData);
      console.log("✅ Estado actualizado correctamente");
      
    } catch (error: any) {
      console.error("\n❌ ERROR AL CARGAR PRESUPUESTO");
      console.error("Tipo de error:", error?.constructor?.name);
      console.error("Mensaje:", error?.message);
      console.error("Status HTTP:", error?.response?.status);
      console.error("Status Text:", error?.response?.statusText);
      console.error("Headers respuesta:", error?.response?.headers);
      console.error("Data completa:", error?.response?.data);
      console.error("Stack trace:", error?.stack);
      
      toast.error(
        error?.response?.data?.detail ||
          "Error al cargar el presupuesto digital"
      );
      navigate("/presupuestos-digitales");
    } finally {
      console.log("\n🔚 Finalizando carga (loading = false)");
      setLoading(false);
    }
  };

  const handleEmitirPresupuesto = async () => {
    console.log("=== DETALLE PRESUPUESTO: EMITIR PRESUPUESTO ===");
    console.log("ID del presupuesto:", id);
    
    if (
      !window.confirm(
        "¿Está seguro de emitir este presupuesto? Una vez emitido no podrá editarse."
      )
    ) {
      console.log("⚠️ Usuario canceló la emisión");
      return;
    }

    console.log("✅ Usuario confirmó la emisión");
    setProcesando(true);
    try {
      console.log("📡 Consultando endpoint: POST /presupuestos-digitales/" + id + "/emitir/");
      await emitirPresupuestoDigital(parseInt(id!));
      console.log("✅ Presupuesto emitido exitosamente");
      toast.success("Presupuesto emitido exitosamente");
      cargarPresupuesto();
    } catch (error: any) {
      console.error("❌ Error al emitir presupuesto:", error);
      console.error("Detalle del error:", {
        status: error?.response?.status,
        data: error?.response?.data
      });
      toast.error(
        error?.response?.data?.detail ||
          "Error al emitir el presupuesto."
      );
    } finally {
      setProcesando(false);
    }
  };

  const handleGenerarPDF = async () => {
    console.log("=== DETALLE PRESUPUESTO: GENERAR PDF ===");
    console.log("ID del presupuesto:", id);
    console.log("Código corto:", presupuesto?.codigo_corto);
    
    setProcesando(true);
    try {
      console.log("📡 Consultando endpoint: GET /presupuestos-digitales/" + id + "/pdf/");
      // Obtener el blob del PDF
      const pdfBlob = await generarPDFPresupuesto(parseInt(id!));
      console.log("✅ PDF recibido, tamaño:", pdfBlob.size, "bytes");
      
      // Crear URL temporal del blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Crear elemento <a> para descargar
      const link = document.createElement('a');
      link.href = url;
      const filename = `presupuesto_${presupuesto?.codigo_corto || id}.pdf`;
      link.setAttribute('download', filename);
      console.log("📥 Descargando archivo:", filename);
      
      // Agregar al DOM, hacer click y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL temporal
      window.URL.revokeObjectURL(url);
      
      console.log("✅ PDF descargado exitosamente");
      toast.success("PDF descargado exitosamente");
      
      // Recargar datos del presupuesto
      cargarPresupuesto();
    } catch (error: any) {
      console.error("❌ Error al generar PDF:", error);
      console.error("Detalle del error:", {
        status: error?.response?.status,
        data: error?.response?.data
      });
      toast.error(
        error?.response?.data?.detail ||
          "Error al generar el PDF del presupuesto."
      );
    } finally {
      setProcesando(false);
    }
  };

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white">
        <TopBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando presupuesto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!presupuesto) {
    return <Navigate to="/presupuestos-digitales" replace />;
  }

  // ✅ Usar helper para permisos (Admin: 4/189, Odontólogo: 2)
  const puedeEmitir =
    presupuesto.estado === 'Borrador' &&
    puedeGestionarPresupuestos(user);

  console.log("\n🎨 RENDERIZANDO COMPONENTE");
  console.log("Presupuesto en estado:", presupuesto);
  console.log("Puede emitir:", puedeEmitir);
  console.log("Usuario tipo:", user?.idtipousuario);
  console.log("Estado presupuesto:", presupuesto.estado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white">
      <TopBar />
      <Toaster position="top-right" />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/presupuestos-digitales")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Presupuesto #{presupuesto.codigo_corto}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Creado el {new Date(presupuesto.fecha_emision).toLocaleDateString()}
                {presupuesto.es_tramo && ` • Tramo ${presupuesto.numero_tramo}`}
              </p>
            </div>
          </div>

          {/* Acciones del Presupuesto */}
          <div className="flex gap-2">
            {puedeEmitir && (
              <button
                onClick={handleEmitirPresupuesto}
                disabled={procesando}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Emitir Presupuesto
              </button>
            )}
            {presupuesto.estado === 'Emitido' && (
              <button
                onClick={handleGenerarPDF}
                disabled={procesando}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                {procesando ? 'Generando...' : 'Descargar PDF'}
              </button>
            )}
          </div>
        </header>

        {/* Información del Presupuesto */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Información General */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-cyan-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Información General
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Paciente</p>
                <p className="font-medium text-gray-900">
                  {presupuesto.paciente_nombre || 'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Odontólogo</p>
                <p className="font-medium text-gray-900">
                  {presupuesto.odontologo_nombre || 'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getEstadoPresupuestoColor(
                    presupuesto.estado
                  )}`}
                >
                  {presupuesto.estado}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="font-medium text-gray-900">
                  {presupuesto.es_tramo ? `Presupuesto Parcial (Tramo ${presupuesto.numero_tramo})` : 'Presupuesto Total'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Vigencia</p>
                <p className="font-medium text-gray-900">
                  {new Date(presupuesto.fecha_vigencia).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado de Vigencia</p>
                {presupuesto.esta_vigente ? (
                  <p className="text-green-600 font-medium">
                    ✓ Vigente ({presupuesto.dias_para_vencimiento} días restantes)
                  </p>
                ) : (
                  <p className="text-red-600 font-medium">
                    ✗ Vencido
                  </p>
                )}
              </div>
              {presupuesto.fecha_emitido && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Emisión</p>
                    <p className="font-medium text-gray-900">
                      {new Date(presupuesto.fecha_emitido).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Emitido por</p>
                    <p className="font-medium text-gray-900">
                      {presupuesto.usuario_emite_nombre}
                    </p>
                  </div>
                </>
              )}
            </div>

            {presupuesto.notas && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Notas Internas</p>
                <p className="text-gray-800 text-sm">{presupuesto.notas}</p>
              </div>
            )}
          </div>

          {/* Resumen Financiero */}
          <div className="bg-white/80 backdrop-blur-sm border border-cyan-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Resumen Financiero
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {formatearMonto(presupuesto.subtotal)}
                </span>
              </div>
              {parseFloat(presupuesto.descuento) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-medium text-red-600">
                    - {formatearMonto(presupuesto.descuento)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-cyan-600">
                    {formatearMonto(presupuesto.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Código de trazabilidad */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Código de Trazabilidad
              </h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">UUID Completo:</p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  {presupuesto.codigo_presupuesto}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ítems del Presupuesto */}
        <div className="bg-white/80 backdrop-blur-sm border border-cyan-100 rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ítems del Presupuesto ({presupuesto.cantidad_items})
          </h3>

          {presupuesto.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No hay ítems en este presupuesto
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pieza Dental
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descuento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pago Parcial
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {presupuesto.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.servicio_nombre}</p>
                          {item.servicio_descripcion && (
                            <p className="text-sm text-gray-500">{item.servicio_descripcion}</p>
                          )}
                          {item.notas_item && (
                            <p className="text-xs text-gray-400 italic mt-1">{item.notas_item}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.pieza_dental || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatearMonto(item.precio_unitario)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {parseFloat(item.descuento_item) > 0 ? `- ${formatearMonto(item.descuento_item)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatearMonto(item.precio_final)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.permite_pago_parcial && item.cantidad_cuotas ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {item.cantidad_cuotas} cuotas
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Términos y Condiciones */}
        {presupuesto.terminos_condiciones && (
          <div className="bg-white/80 backdrop-blur-sm border border-cyan-100 rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Términos y Condiciones
            </h3>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans">
                {presupuesto.terminos_condiciones}
              </pre>
            </div>
          </div>
        )}

        {/* Alertas */}
        {presupuesto.estado === 'Borrador' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800">
                  Presupuesto en estado Borrador
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Este presupuesto puede ser editado. Una vez que esté listo, emítalo para que sea inmutable y pueda enviarse al paciente.
                </p>
              </div>
            </div>
          </div>
        )}

        {!presupuesto.esta_vigente && presupuesto.estado === 'Emitido' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-red-800">
                  Presupuesto Vencido
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  Este presupuesto ha superado su fecha de vigencia. Considere generar un nuevo presupuesto actualizado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Historial de Aceptaciones */}
        {presupuesto.estado === 'Emitido' && (
          <div className="mt-6">
            <HistorialAceptaciones 
              presupuestoId={presupuesto.id} 
              codigoPresupuesto={presupuesto.codigo_corto}
            />
          </div>
        )}
      </main>
    </div>
  );
}







