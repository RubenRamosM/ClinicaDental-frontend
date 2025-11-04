// src/pages/Dashboard.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import AdminDashboard from "../components/AdminDashboard.tsx";
import PacienteDashboard from "../components/PacienteDashboard.tsx";
import OdontologoDashboard from "../components/OdontologoDashboard.tsx";
import RecepcionistaDashboard from "../components/RecepcionistaDashboard.tsx";
import { detectarRol, obtenerNombreRol } from "../utils/roleHelpers";

export default function Dashboard() {
  const { isAuth, user, loading } = useAuth();

  console.log("=== DASHBOARD DEBUG ===");
  console.log("isAuth:", isAuth);
  console.log("user:", user);
  console.log("loading:", loading);
  console.log("user.tipo_usuario:", user?.tipo_usuario);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuth || !user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Routing basado en el ROL del usuario (detectado dinámicamente)
  const rol = detectarRol(user);
  const nombreRol = obtenerNombreRol(user);
  
  console.log("🎭 [Dashboard] Rol detectado:", { rol, nombreRol, idtipousuario: user.idtipousuario });
  
  switch (rol) {
    case 'administrador':
      return <AdminDashboard />;
    
    case 'paciente':
      return <PacienteDashboard />;
    
    case 'odontologo':
      return <OdontologoDashboard />;
    
    case 'recepcionista':
      return <RecepcionistaDashboard />;
    
    default:
      console.warn("⚠️ [Dashboard] Rol no reconocido:", { rol, user });
      // Default a AdminDashboard por seguridad
      return <AdminDashboard />;
  }
}






