// utils/roleHelpers.ts
// ✅ Helper para detectar roles de usuario de forma dinámica (sin IDs hardcodeados)

// Tipo de usuario compatible con AuthContext
type UsuarioApp = {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  idtipousuario: number;
  subtipo?: string;
  tipo_usuario: {
    id: number;
    rol: string;
  };
} | null;

export type UserRole = 'administrador' | 'odontologo' | 'recepcionista' | 'paciente' | 'desconocido';

/**
 * Detecta el rol de un usuario basándose en el nombre del tipo de usuario
 * en lugar de IDs hardcodeados
 */
export function detectarRol(user: UsuarioApp): UserRole {
  if (!user) return 'desconocido';

  // 1️⃣ Primero intentar con subtipo
  if (user.subtipo) {
    const subtipo = user.subtipo.toLowerCase();
    if (subtipo.includes('admin')) return 'administrador';
    if (subtipo.includes('odontologo')) return 'odontologo';
    if (subtipo.includes('recepcionista')) return 'recepcionista';
    if (subtipo.includes('paciente')) return 'paciente';
  }

  // 2️⃣ Luego intentar con tipo_usuario.rol
  if (user.tipo_usuario?.rol) {
    const rol = user.tipo_usuario.rol.toLowerCase();
    if (rol.includes('admin')) return 'administrador';
    if (rol.includes('odontologo') || rol.includes('odontólogo')) return 'odontologo';
    if (rol.includes('recepcionista')) return 'recepcionista';
    if (rol.includes('paciente')) return 'paciente';
  }

  // 3️⃣ Fallback: intentar con idtipousuario (mantener compatibilidad)
  // Nota: Solo como último recurso, ya que los IDs pueden variar entre bases de datos
  if (user.idtipousuario) {
    // IDs comunes observados: 1=Paciente, 2=Odontólogo, 3=Recepcionista, 4=Admin, 189=Admin
    if (user.idtipousuario === 4 || user.idtipousuario === 189) return 'administrador';
    if (user.idtipousuario === 2) return 'odontologo';
    if (user.idtipousuario === 3) return 'recepcionista';
    if (user.idtipousuario === 1) return 'paciente';
  }

  return 'desconocido';
}

/**
 * Verifica si el usuario es administrador
 */
export function esAdministrador(user: UsuarioApp): boolean {
  return detectarRol(user) === 'administrador';
}

/**
 * Verifica si el usuario es odontólogo
 */
export function esOdontologo(user: UsuarioApp): boolean {
  return detectarRol(user) === 'odontologo';
}

/**
 * Verifica si el usuario es recepcionista
 */
export function esRecepcionista(user: UsuarioApp): boolean {
  return detectarRol(user) === 'recepcionista';
}

/**
 * Verifica si el usuario es paciente
 */
export function esPaciente(user: UsuarioApp): boolean {
  return detectarRol(user) === 'paciente';
}

/**
 * Verifica si el usuario es staff (admin u odontólogo)
 */
export function esStaff(user: UsuarioApp): boolean {
  const rol = detectarRol(user);
  return rol === 'administrador' || rol === 'odontologo';
}

/**
 * Verifica si el usuario puede ver/editar presupuestos
 */
export function puedeGestionarPresupuestos(user: UsuarioApp): boolean {
  return esAdministrador(user) || esOdontologo(user);
}

/**
 * Verifica si el usuario puede ver reportes
 */
export function puedeVerReportes(user: UsuarioApp): boolean {
  return esAdministrador(user);
}

/**
 * Obtiene la ruta del dashboard según el rol
 */
export function obtenerDashboardPorRol(user: UsuarioApp): string {
  switch (detectarRol(user)) {
    case 'administrador':
      return '/dashboard';
    case 'odontologo':
      return '/dashboard';
    case 'recepcionista':
      return '/dashboard';
    case 'paciente':
      return '/dashboard-paciente';
    default:
      return '/login';
  }
}

/**
 * Obtiene el nombre legible del rol
 */
export function obtenerNombreRol(user: UsuarioApp): string {
  switch (detectarRol(user)) {
    case 'administrador':
      return 'Administrador';
    case 'odontologo':
      return 'Odontólogo';
    case 'recepcionista':
      return 'Recepcionista';
    case 'paciente':
      return 'Paciente';
    default:
      return 'Desconocido';
  }
}
