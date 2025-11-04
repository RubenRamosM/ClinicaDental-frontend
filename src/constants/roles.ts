// src/constants/roles.ts

/**
 * IDs FIJOS DE ROLES DEL SISTEMA
 * 
 * Estos IDs son consistentes y están definidos en el seeder del backend.
 * NO cambian entre ejecuciones del seed.
 * 
 * Ver: backend/seed_database.py - Sección "Tipos de Usuario"
 */

export const ROLES = {
  ADMINISTRADOR: 1,
  ODONTOLOGO: 2,
  RECEPCIONISTA: 3,
  PACIENTE: 4,
} as const;

/**
 * Nombres de roles (para display)
 */
export const ROLES_NOMBRES = {
  [ROLES.ADMINISTRADOR]: 'Administrador',
  [ROLES.ODONTOLOGO]: 'Odontólogo',
  [ROLES.RECEPCIONISTA]: 'Recepcionista',
  [ROLES.PACIENTE]: 'Paciente',
} as const;

/**
 * Helper para verificar si un usuario tiene un rol específico
 */
export function tieneRol(user: any, rol: number): boolean {
  return user?.tipo_usuario?.id === rol;
}

/**
 * Helper para verificar si un usuario tiene uno de varios roles
 */
export function tieneAlgunRol(user: any, roles: number[]): boolean {
  return roles.includes(user?.tipo_usuario?.id);
}

/**
 * Helper para obtener el nombre del rol
 */
export function obtenerNombreRol(user: any): string {
  const rolId = user?.tipo_usuario?.id;
  return ROLES_NOMBRES[rolId as keyof typeof ROLES_NOMBRES] || 'Desconocido';
}

// Type-safety
export type RolId = typeof ROLES[keyof typeof ROLES];
