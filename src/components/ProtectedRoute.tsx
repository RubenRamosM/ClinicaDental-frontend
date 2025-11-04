// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { detectarRol, type UserRole } from "../utils/roleHelpers";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[]; // ✅ CAMBIADO: Usar roles semánticos en lugar de IDs
  allowedRoleIds?: number[]; // ⚠️ DEPRECATED: Solo para compatibilidad legacy
  requireAuth?: boolean;
}

/**
 * ✅ Componente para proteger rutas basándose en autenticación y roles (VERSIÓN MEJORADA).
 *
 * Uso recomendado (con roles semánticos):
 * ```tsx
 * <ProtectedRoute allowedRoles={['paciente']}>
 *   <MisPresupuestosPaciente />
 * </ProtectedRoute>
 *
 * <ProtectedRoute allowedRoles={['administrador', 'odontologo']}>
 *   <CrearPresupuestoDigital />
 * </ProtectedRoute>
 * ```
 *
 * Uso legacy (con IDs - soportado pero no recomendado):
 * ```tsx
 * <ProtectedRoute allowedRoleIds={[1]}>  // Solo pacientes (id=1)
 *   <MisPresupuestosPaciente />
 * </ProtectedRoute>
 * ```
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  allowedRoleIds,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { isAuth, user } = useAuth();

  // 1. Verificar autenticación si es requerida
  if (requireAuth && !isAuth) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  // 2. Verificar roles si se especificaron
  if (allowedRoles && allowedRoles.length > 0) {
    // ✅ NUEVO: Usar detección de rol dinámica
    const userRole = detectarRol(user);

    if (!allowedRoles.includes(userRole)) {
      console.warn(
        `[ProtectedRoute] Acceso denegado: Usuario con rol "${userRole}" intentó acceder a ruta restringida a roles [${allowedRoles.join(", ")}]`
      );

      return (
        <Navigate
          to="/dashboard"
          replace
          state={{
            error: "No tienes permisos para acceder a esta página.",
            requiredRoles: allowedRoles,
            userRole: userRole,
          }}
        />
      );
    }
  }

  // 3. ⚠️ LEGACY: Verificar por IDs (solo para compatibilidad con código antiguo)
  if (allowedRoleIds && allowedRoleIds.length > 0) {
    const userRoleId = user?.tipo_usuario?.id || user?.idtipousuario;

    if (!userRoleId || !allowedRoleIds.includes(userRoleId)) {
      console.warn(
        `[ProtectedRoute] Acceso denegado (legacy): Usuario con ID ${userRoleId} intentó acceder a ruta restringida a IDs [${allowedRoleIds.join(", ")}]`
      );

      return (
        <Navigate
          to="/dashboard"
          replace
          state={{
            error: "No tienes permisos para acceder a esta página.",
            requiredRoleIds: allowedRoleIds,
            userRoleId: userRoleId,
          }}
        />
      );
    }
  }

  // 4. Si pasa todas las validaciones, renderizar el componente hijo
  return children;
}








