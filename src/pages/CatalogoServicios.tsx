import { useState, useEffect } from "react";
import { obtenerServicios, obtenerServicio } from "../services/serviciosService";
import type {
  ServicioListado,
  Servicio,
  FiltrosServicios,
} from "../interfaces/Servicio";
import toast from "react-hot-toast";

export default function CatalogoServicios() {
  console.log("\n🎬 ════════════════════════════════════════════════════════════");
  console.log("🎬 CATÁLOGO SERVICIOS: COMPONENTE INICIALIZADO");
  console.log("🎬 ════════════════════════════════════════════════════════════");
  console.log("📍 Timestamp de montaje:", new Date().toISOString());
  
  const [servicios, setServicios] = useState<ServicioListado[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResultados, setTotalResultados] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  
  // Modal de detalle
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioDetalle, setServicioDetalle] = useState<Servicio | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Estados para los filtros
  const [busqueda, setBusqueda] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [duracionMin, setDuracionMin] = useState("");
  const [duracionMax, setDuracionMax] = useState("");
  const [ordenamiento, setOrdenamiento] = useState("nombre");
  const pageSize = 10;

  // Función para cargar servicios
  const cargarServicios = async () => {
    console.log("\n\n");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("📋 CATÁLOGO SERVICIOS: CARGANDO DATOS");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("📍 Timestamp:", new Date().toISOString());
    console.log("📊 Parámetros de búsqueda:");
    console.log("  - Página:", paginaActual);
    console.log("  - Page Size:", pageSize);
    console.log("  - Ordenamiento:", ordenamiento);
    console.log("  - Búsqueda:", busqueda || "(vacío)");
    console.log("  - Precio Min:", precioMin || "(sin filtro)");
    console.log("  - Precio Max:", precioMax || "(sin filtro)");
    console.log("  - Duración Min:", duracionMin || "(sin filtro)");
    console.log("  - Duración Max:", duracionMax || "(sin filtro)");
    
    setLoading(true);
    try {
      const filtros: FiltrosServicios = {
        page: paginaActual,
        page_size: pageSize,
        ordering: ordenamiento,
      };

      if (busqueda.trim()) filtros.search = busqueda.trim();
      
      // ✅ Filtros implementados en el backend
      if (precioMin) filtros.costobase_min = parseFloat(precioMin);
      if (precioMax) filtros.costobase_max = parseFloat(precioMax);
      if (duracionMin) filtros.duracion_min = parseInt(duracionMin);
      if (duracionMax) filtros.duracion_max = parseInt(duracionMax);

      console.log("\n📤 Llamando a obtenerServicios()");
      console.log("📦 Filtros enviados:", JSON.stringify(filtros, null, 2));
      
      const tiempoInicio = Date.now();
      const response = await obtenerServicios(filtros);
      const duracion = Date.now() - tiempoInicio;
      
      console.log("\n✅ Respuesta recibida en", duracion, "ms");
      console.log("🔍 Tipo de respuesta:", typeof response);
      console.log("🔍 Es Array?:", Array.isArray(response));
      console.log("🔍 Tiene 'results'?:", response && typeof response === 'object' && 'results' in response);
      
      // ✅ ADAPTACIÓN: Manejar tanto array directo como objeto paginado
      let serviciosData: ServicioListado[] = [];
      let totalCount = 0;
      
      if (Array.isArray(response)) {
        // Backend devuelve array directo
        console.log("📊 Array directo detectado");
        serviciosData = response;
        totalCount = response.length;
        console.log("📊 Total servicios:", totalCount);
      } else if (response && typeof response === 'object' && 'results' in response) {
        // Backend devuelve objeto paginado {count, results, next, previous}
        console.log("📊 Objeto paginado detectado");
        serviciosData = response.results || [];
        totalCount = response.count || 0;
        console.log("📊 Total resultados:", totalCount);
        console.log("📊 Servicios en esta página:", serviciosData.length);
      } else {
        // Formato desconocido
        console.error("❌ Formato de respuesta desconocido:", response);
        serviciosData = [];
        totalCount = 0;
      }
      
      if (serviciosData.length > 0) {
        console.log("🔍 Primer servicio (ejemplo):", JSON.stringify(serviciosData[0], null, 2));
        console.log("📊 Campos disponibles:", Object.keys(serviciosData[0]));
      }
      
      setServicios(serviciosData);
      setTotalResultados(totalCount);
      setTotalPaginas(Math.ceil(totalCount / pageSize));
      
      console.log("\n🎨 ════════════════════════════════════════════════════════════");
      console.log("🎨 ACTUALIZANDO ESTADO DE REACT");
      console.log("🎨 ════════════════════════════════════════════════════════════");
      console.log("✅ Estado actualizado correctamente");
      console.log("  - Servicios cargados:", serviciosData.length);
      console.log("  - Total resultados:", totalCount);
      console.log("  - Total páginas:", Math.ceil(totalCount / pageSize));
      console.log("  - Página actual:", paginaActual);
      console.log("  - Loading:", false);
      
      if (serviciosData.length > 0) {
        console.log("\n📋 Estructura de servicios:");
        serviciosData.slice(0, 3).forEach((servicio, index) => {
          console.log(`\n  Servicio ${index + 1}:`);
          console.log("    - ID:", servicio.id);
          console.log("    - Nombre:", servicio.nombre);
          console.log("    - Precio:", (servicio as any).costobase || (servicio as any).precio_vigente);
          console.log("    - Duración:", servicio.duracion);
          console.log("    - Activo:", servicio.activo);
        });
        if (serviciosData.length > 3) {
          console.log(`\n  ... y ${serviciosData.length - 3} servicios más`);
        }
      }
      
      console.log("🎨 ════════════════════════════════════════════════════════════");
      console.log("═══════════════════════════════════════════════════════════════\n\n");
    } catch (error) {
      console.error("\n❌❌❌ ERROR CARGANDO SERVICIOS ❌❌❌");
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
        console.error("⚠️ NO HAY RESPONSE - Error de red o CORS");
        console.error("💬 Message:", err.message);
      }
      
      console.error("═══════════════════════════════════════════════════════════════\n\n");
      toast.error("Error al cargar el catálogo de servicios");
      
      // Resetear estado en caso de error
      setServicios([]);
      setTotalResultados(0);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
      console.log("🏁 Loading finalizado");
    }
  };

  // Cargar servicios cuando cambien los filtros o la página
  useEffect(() => {
    console.log("\n🔄 ════════════════════════════════════════════════════════════");
    console.log("🔄 USEEFFECT DISPARADO - Detectado cambio en dependencias");
    console.log("🔄 ════════════════════════════════════════════════════════════");
    console.log("📍 Timestamp:", new Date().toISOString());
    console.log("📊 Estado actual:");
    console.log("  - paginaActual:", paginaActual);
    console.log("  - ordenamiento:", ordenamiento);
    console.log("  - loading:", loading);
    console.log("  - servicios.length:", servicios.length);
    console.log("🔄 Llamando a cargarServicios()...");
    console.log("🔄 ════════════════════════════════════════════════════════════\n");
    
    cargarServicios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaActual, ordenamiento]);

  // Función para aplicar filtros (resetea a página 1)
  const aplicarFiltros = () => {
    console.log("\n🎯 ════════════════════════════════════════════════════════════");
    console.log("🎯 APLICAR FILTROS - Acción del usuario");
    console.log("🎯 ════════════════════════════════════════════════════════════");
    console.log("📍 Timestamp:", new Date().toISOString());
    console.log("🔍 Filtros actuales:");
    console.log("  - Búsqueda:", busqueda || "(vacío)");
    console.log("  - Precio Min:", precioMin || "(sin filtro)");
    console.log("  - Precio Max:", precioMax || "(sin filtro)");
    console.log("  - Duración Min:", duracionMin || "(sin filtro)");
    console.log("  - Duración Max:", duracionMax || "(sin filtro)");
    console.log("  - Ordenamiento:", ordenamiento);
    console.log("🔄 Reseteando página a 1 y cargando servicios...");
    console.log("🎯 ════════════════════════════════════════════════════════════\n");
    
    setPaginaActual(1);
    cargarServicios();
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    console.log("\n🧹 ════════════════════════════════════════════════════════════");
    console.log("🧹 LIMPIAR FILTROS - Acción del usuario");
    console.log("🧹 ════════════════════════════════════════════════════════════");
    console.log("📍 Timestamp:", new Date().toISOString());
    console.log("🔄 Reseteando todos los filtros a valores por defecto...");
    console.log("🧹 ════════════════════════════════════════════════════════════\n");
    
    setBusqueda("");
    setPrecioMin("");
    setPrecioMax("");
    setDuracionMin("");
    setDuracionMax("");
    setOrdenamiento("nombre");
    setPaginaActual(1);
  };

  // Manejar cambio de página
  const cambiarPagina = (nuevaPagina: number) => {
    console.log("\n📄 ════════════════════════════════════════════════════════════");
    console.log("📄 CAMBIAR PÁGINA - Acción del usuario");
    console.log("📄 ════════════════════════════════════════════════════════════");
    console.log("📍 Timestamp:", new Date().toISOString());
    console.log("📊 Paginación:");
    console.log("  - Página actual:", paginaActual);
    console.log("  - Nueva página solicitada:", nuevaPagina);
    console.log("  - Total páginas:", totalPaginas);
    console.log("  - Válida?:", nuevaPagina >= 1 && nuevaPagina <= totalPaginas);
    
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      console.log("✅ Cambio de página permitido");
      console.log("🔄 Actualizando estado y scrolleando...");
      setPaginaActual(nuevaPagina);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      console.warn("⚠️ Cambio de página bloqueado - fuera de rango");
    }
    console.log("📄 ════════════════════════════════════════════════════════════\n");
  };

  // Función para abrir modal con detalles del servicio
  const verDetalleServicio = async (id: number) => {
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("🔍 VER DETALLE DE SERVICIO");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("📍 Timestamp:", new Date().toISOString());
    console.log("🆔 ID del servicio:", id);
    
    setModalAbierto(true);
    setLoadingDetalle(true);
    
    try {
      console.log("\n📤 Llamando a obtenerServicio()");
      console.log("📍 URL:", `/servicios/${id}/`);
      
      const tiempoInicio = Date.now();
      const detalle = await obtenerServicio(id);
      const duracion = Date.now() - tiempoInicio;
      
      console.log("\n✅ Detalle recibido en", duracion, "ms");
      console.log("📦 Datos completos:", JSON.stringify(detalle, null, 2));
      console.log("📊 Campos disponibles:", Object.keys(detalle));
      
      setServicioDetalle(detalle);
      console.log("✅ Modal abierto con detalle");
      console.log("═══════════════════════════════════════════════════════════════\n");
    } catch (error: unknown) {
      console.error("\n❌❌❌ ERROR CARGANDO DETALLE ❌❌❌");
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
        console.error("⚠️ NO HAY RESPONSE");
        console.error("💬 Message:", err.message);
      }
      
      console.error("═══════════════════════════════════════════════════════════════\n");
      toast.error("No se pudo cargar el detalle del servicio");
      setModalAbierto(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  // Cerrar modal
  const cerrarModal = () => {
    console.log("\n❌ ════════════════════════════════════════════════════════════");
    console.log("❌ CERRAR MODAL - Acción del usuario");
    console.log("❌ ════════════════════════════════════════════════════════════");
    console.log("📍 Timestamp:", new Date().toISOString());
    console.log("🔄 Reseteando estado del modal...");
    console.log("  - modalAbierto: false");
    console.log("  - servicioDetalle: null");
    console.log("❌ ════════════════════════════════════════════════════════════\n");
    
    setModalAbierto(false);
    setServicioDetalle(null);
  };

  console.log("\n🖼️  ════════════════════════════════════════════════════════════");
  console.log("🖼️  RENDERIZANDO COMPONENTE");
  console.log("🖼️  ════════════════════════════════════════════════════════════");
  console.log("📍 Timestamp render:", new Date().toISOString());
  console.log("📊 Estado actual para render:");
  console.log("  - Loading:", loading);
  console.log("  - Servicios:", servicios.length);
  console.log("  - Total Resultados:", totalResultados);
  console.log("  - Página Actual:", paginaActual);
  console.log("  - Total Páginas:", totalPaginas);
  console.log("  - Modal Abierto:", modalAbierto);
  console.log("  - Servicio Detalle:", servicioDetalle ? `ID ${servicioDetalle.id}` : "null");
  console.log("🔍 Filtros activos:");
  console.log("  - Búsqueda:", busqueda || "(vacío)");
  console.log("  - Precio Min:", precioMin || "(sin filtro)");
  console.log("  - Precio Max:", precioMax || "(sin filtro)");
  console.log("  - Duración Min:", duracionMin || "(sin filtro)");
  console.log("  - Duración Max:", duracionMax || "(sin filtro)");
  console.log("  - Ordenamiento:", ordenamiento);
  console.log("🖼️  ════════════════════════════════════════════════════════════\n");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Catálogo de Servicios
          </h1>
          <p className="text-gray-600">
            Explora nuestros servicios dentales disponibles
          </p>
        </div>

        {/* Panel de Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Filtros de Búsqueda
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Búsqueda por texto */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar servicio
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  console.log("🔍 [Input] Búsqueda cambiada:", e.target.value);
                  setBusqueda(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    console.log("⌨️ [Enter] Aplicando filtros desde búsqueda");
                    aplicarFiltros();
                  }
                }}
                placeholder="Ej: Limpieza, Endodoncia..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Precio Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio mínimo ($)
              </label>
              <input
                type="number"
                value={precioMin}
                onChange={(e) => {
                  console.log("💰 [Input] Precio mínimo cambiado:", e.target.value);
                  setPrecioMin(e.target.value);
                }}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Precio Máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio máximo ($)
              </label>
              <input
                type="number"
                value={precioMax}
                onChange={(e) => {
                  console.log("💰 [Input] Precio máximo cambiado:", e.target.value);
                  setPrecioMax(e.target.value);
                }}
                placeholder="999.99"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Ordenamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={ordenamiento}
                onChange={(e) => {
                  console.log("🔄 [Select] Ordenamiento cambiado:", e.target.value);
                  setOrdenamiento(e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="nombre">Nombre (A-Z)</option>
                <option value="-nombre">Nombre (Z-A)</option>
                <option value="costobase">Precio (Menor a Mayor)</option>
                <option value="-costobase">Precio (Mayor a Menor)</option>
                <option value="duracion">Duración (Corta a Larga)</option>
                <option value="-duracion">Duración (Larga a Corta)</option>
              </select>
            </div>

            {/* Duración Mínima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración mínima (min)
              </label>
              <input
                type="number"
                value={duracionMin}
                onChange={(e) => {
                  console.log("⏱️ [Input] Duración mínima cambiada:", e.target.value);
                  setDuracionMin(e.target.value);
                }}
                placeholder="30"
                min="0"
                step="15"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Duración Máxima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración máxima (min)
              </label>
              <input
                type="number"
                value={duracionMax}
                onChange={(e) => {
                  console.log("⏱️ [Input] Duración máxima cambiada:", e.target.value);
                  setDuracionMax(e.target.value);
                }}
                placeholder="120"
                min="0"
                step="15"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log("\n🔘 [Botón] Aplicar Filtros clickeado");
                aplicarFiltros();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={() => {
                console.log("\n🔘 [Botón] Limpiar Filtros clickeado");
                limpiarFiltros();
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Servicios Disponibles
            </h2>
            <span className="text-sm text-gray-600">
              {totalResultados} resultado{totalResultados !== 1 ? "s" : ""}{" "}
              encontrado{totalResultados !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Sin resultados */}
          {!loading && servicios.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600 text-lg">
                No se encontraron servicios con los filtros seleccionados
              </p>
              <button
                onClick={limpiarFiltros}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Lista de servicios */}
          {!loading && servicios.length > 0 && (() => {
            console.log("\n🎨 ════════════════════════════════════════════════════════════");
            console.log("🎨 RENDERIZANDO LISTA DE SERVICIOS");
            console.log("🎨 ════════════════════════════════════════════════════════════");
            console.log("📊 Total servicios a renderizar:", servicios.length);
            console.log("📍 Página:", paginaActual, "de", totalPaginas);
            console.log("🎨 ════════════════════════════════════════════════════════════\n");
            return null;
          })()}
          
          {!loading && servicios.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.map((servicio, index) => {
                if (index === 0) {
                  console.log("🎴 Renderizando card de servicio:", {
                    index,
                    id: servicio.id,
                    nombre: servicio.nombre,
                    precio: (servicio as any).costobase || (servicio as any).precio_vigente,
                    duracion: servicio.duracion,
                    activo: servicio.activo
                  });
                }
                
                return (
                  <div
                    key={servicio.id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow bg-white"
                  >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 flex-1">
                      {servicio.nombre}
                    </h3>
                    {servicio.activo && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        Activo
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Precio:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${(servicio as any).costobase || (servicio as any).precio_vigente || "0.00"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Duración:</span>
                      <span className="text-sm font-medium text-gray-800">
                        {servicio.duracion} minutos
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        console.log("\n🔘 [Botón] Ver Detalles clickeado - ID:", servicio.id);
                        verDetalleServicio(servicio.id);
                      }}
                      className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* Paginación */}
          {!loading && servicios.length > 0 && totalPaginas > 1 && (() => {
            console.log("\n📄 Renderizando controles de paginación:", {
              paginaActual,
              totalPaginas,
              totalResultados
            });
            return null;
          })()}
          
          {!loading && servicios.length > 0 && totalPaginas > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  console.log("\n🔘 [Botón] Página Anterior clickeado");
                  cambiarPagina(paginaActual - 1);
                }}
                disabled={paginaActual === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPaginas)].map((_, index) => {
                  const numeroPagina = index + 1;

                  // Mostrar solo algunas páginas alrededor de la actual
                  if (
                    numeroPagina === 1 ||
                    numeroPagina === totalPaginas ||
                    (numeroPagina >= paginaActual - 1 &&
                      numeroPagina <= paginaActual + 1)
                  ) {
                    return (
                      <button
                        key={numeroPagina}
                        onClick={() => {
                          console.log("\n🔘 [Botón] Página", numeroPagina, "clickeada");
                          cambiarPagina(numeroPagina);
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          paginaActual === numeroPagina
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {numeroPagina}
                      </button>
                    );
                  } else if (
                    numeroPagina === paginaActual - 2 ||
                    numeroPagina === paginaActual + 2
                  ) {
                    return (
                      <span key={numeroPagina} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => {
                  console.log("\n🔘 [Botón] Página Siguiente clickeado");
                  cambiarPagina(paginaActual + 1);
                }}
                disabled={paginaActual === totalPaginas}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Modal de Detalle */}
        {modalAbierto && (() => {
          console.log("\n🪟 ════════════════════════════════════════════════════════════");
          console.log("🪟 RENDERIZANDO MODAL DE DETALLE");
          console.log("🪟 ════════════════════════════════════════════════════════════");
          console.log("📊 Estado del modal:");
          console.log("  - modalAbierto:", modalAbierto);
          console.log("  - loadingDetalle:", loadingDetalle);
          console.log("  - servicioDetalle:", servicioDetalle ? `ID ${servicioDetalle.id} - ${servicioDetalle.nombre}` : "null");
          console.log("🪟 ════════════════════════════════════════════════════════════\n");
          return null;
        })()}
        
        {modalAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del modal */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Detalle del Servicio
                </h2>
                <button
                  onClick={() => {
                    console.log("\n🔘 [Botón] Cerrar Modal (X) clickeado");
                    cerrarModal();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                {loadingDetalle ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : servicioDetalle ? (
                  <div className="space-y-6">
                    {/* Nombre y estado */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {servicioDetalle.nombre}
                      </h3>
                      {servicioDetalle.activo && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                          Activo
                        </span>
                      )}
                    </div>

                    {/* Descripción */}
                    {servicioDetalle.descripcion && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Descripción
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {servicioDetalle.descripcion}
                        </p>
                      </div>
                    )}

                    {/* Información de precio y duración */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium mb-1">
                          Precio del Servicio
                        </p>
                        <p className="text-3xl font-bold text-blue-700">
                          ${(servicioDetalle as any).precio || (servicioDetalle as any).costobase || (servicioDetalle as any).precio_vigente || "0.00"}
                        </p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium mb-1">
                          Duración Estimada
                        </p>
                        <p className="text-3xl font-bold text-purple-700">
                          {(servicioDetalle as any).duracion_minutos || (servicioDetalle as any).duracion || 0}
                        </p>
                        <p className="text-sm text-purple-600">minutos</p>
                      </div>
                    </div>

                    {/* Fechas de registro */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Fecha de creación:</span>
                          <p className="text-gray-800 font-medium">
                            {new Date((servicioDetalle as any).created_at || (servicioDetalle as any).fecha_creacion || new Date()).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Última modificación:</span>
                          <p className="text-gray-800 font-medium">
                            {new Date((servicioDetalle as any).updated_at || (servicioDetalle as any).fecha_modificacion || new Date()).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          console.log("\n🔘 [Botón] Cerrar Modal (botón) clickeado");
                          cerrarModal();
                        }}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">
                    No se pudo cargar el detalle del servicio
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}







