import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerSesionesPorPlan } from "../services/sesionesTratamientoService";
import type { SesionesPorPlan } from "../interfaces/SesionTratamiento";
import CardSesion from "../components/sesiones/CardSesion";

/**
 * Página para listar todas las sesiones de un plan de tratamiento
 * Muestra las sesiones del plan con opción de editar y eliminar
 */
const ListarSesionesPlan: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const [datos, setDatos] = useState<SesionesPorPlan | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarSesiones();
  }, [planId]);

  const cargarSesiones = async () => {
    console.log("🔄 [ListarSesionesPlan] Iniciando carga de sesiones...");
    console.log("  - Plan ID (raw):", planId);
    console.log("  - Plan ID (parsed):", parseInt(planId || "0"));

    if (!planId) {
      console.error("❌ [ListarSesionesPlan] ID de plan no proporcionado");
      setError("ID de plan no proporcionado");
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError(null);
      console.log("📞 [ListarSesionesPlan] Llamando a obtenerSesionesPorPlan...");
      
      const resultado = await obtenerSesionesPorPlan(parseInt(planId));
      
      console.log("✅ [ListarSesionesPlan] Resultado recibido del servicio:");
      console.log("  - Resultado completo:", resultado);
      console.log("  - Tipo de resultado:", typeof resultado);
      console.log("  - Es null?:", resultado === null);
      console.log("  - Es undefined?:", resultado === undefined);
      
      if (resultado) {
        console.log("  - Claves en resultado:", Object.keys(resultado));
        console.log("  - plan_id:", resultado.plan_id);
        console.log("  - count:", resultado.count);
        console.log("  - sesiones:", resultado.sesiones);
        console.log("  - Tipo de sesiones:", Array.isArray(resultado.sesiones) ? "Array" : typeof resultado.sesiones);
        console.log("  - Cantidad de sesiones:", resultado.sesiones?.length);
      }
      
      console.log("💾 [ListarSesionesPlan] Guardando en estado...");
      setDatos(resultado);
      console.log("✅ [ListarSesionesPlan] Estado actualizado correctamente");
      
    } catch (err: any) {
      console.error("❌ [ListarSesionesPlan] Error al cargar sesiones:", err);
      console.error("  - Error completo:", err);
      console.error("  - Mensaje:", err.message);
      console.error("  - Stack:", err.stack);
      setError(err.message || "Error al cargar las sesiones del plan");
    } finally {
      setCargando(false);
      console.log("🏁 [ListarSesionesPlan] Carga finalizada");
    }
  };

  const handleRegistrarNueva = () => {
    navigate(`/planes/${planId}/registrar-sesion`);
  };

  const handleEditar = (sesionId: number) => {
    navigate(`/sesiones/${sesionId}/editar`);
  };

  const handleEliminar = async (sesionId: number) => {
    if (!window.confirm("¿Está seguro de eliminar esta sesión?")) {
      return;
    }

    try {
      // Aquí se implementaría la eliminación
      // await eliminarSesion(sesionId);
      alert("Funcionalidad de eliminación por implementar");
      cargarSesiones(); // Recargar después de eliminar
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message || "Error desconocido"}`);
    }
  };



  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sesiones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-semibold mb-2">❌ Error</p>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  console.log("🎨 [ListarSesionesPlan] Renderizando componente...");
  console.log("  - datos:", datos);
  console.log("  - datos es null?:", datos === null);
  console.log("  - datos es undefined?:", datos === undefined);
  
  if (datos) {
    console.log("  - datos.sesiones:", datos.sesiones);
    console.log("  - datos.sesiones es null?:", datos.sesiones === null);
    console.log("  - datos.sesiones es undefined?:", datos.sesiones === undefined);
    console.log("  - datos.sesiones es Array?:", Array.isArray(datos.sesiones));
    console.log("  - datos.sesiones.length:", datos.sesiones?.length);
  }

  if (!datos || !datos.sesiones || datos.sesiones.length === 0) {
    console.log("ℹ️ [ListarSesionesPlan] Mostrando mensaje de 'sin sesiones'");
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-semibold mb-2">ℹ️ Sin sesiones</p>
          <p className="text-yellow-600 mb-4">
            No hay sesiones registradas para este plan de tratamiento
          </p>
          <button
            onClick={handleRegistrarNueva}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ Registrar Primera Sesión
          </button>
        </div>
      </div>
    );
  }

  console.log("✨ [ListarSesionesPlan] Renderizando vista principal");
  console.log("  - Cantidad de sesiones a mostrar:", datos.sesiones.length);
  console.log("  - Sesiones completas:", datos.sesiones);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Sesiones del Plan de Tratamiento
            </h1>
            <p className="text-gray-600 mt-1">
              Plan #{planId} - {datos.sesiones.length} sesión(es)
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              ← Volver
            </button>
            <button
              onClick={handleRegistrarNueva}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              ➕ Registrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Lista de sesiones */}
      <div className="space-y-4">
        {datos.sesiones.map((sesion, index) => {
          console.log(`🔹 [ListarSesionesPlan] Renderizando sesión ${index + 1}/${datos.sesiones.length}:`, sesion);
          return (
            <CardSesion
              key={sesion.id}
              sesion={sesion}
              onEditar={handleEditar}
              onEliminar={handleEliminar}
              mostrarAcciones={true}
            />
          );
        })}
      </div>

      {/* Footer con resumen */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-blue-800">
            <span className="font-semibold">Total de sesiones:</span> {datos.count || datos.sesiones.length} sesión(es) registrada(s)
          </div>
          <div className="text-sm text-blue-800">
            <span className="font-semibold">Plan ID:</span> {datos.plan_id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListarSesionesPlan;







