/**
 * 👥 SERVICIO DE GESTIÓN DE USUARIOS - EXTENSIÓN
 * 
 * Complemento del servicio Usuarios.ts con endpoints administrativos faltantes
 * Backend: /api/v1/usuarios/
 * 
 * Endpoints implementados:
 * - POST   /usuarios/usuarios/                    (Crear usuario)
 * - PUT    /usuarios/usuarios/{id}/               (Actualizar completo)
 * - DELETE /usuarios/usuarios/{id}/               (Eliminar usuario)
 * - GET    /usuarios/usuarios/estadisticas/       (Estadísticas)
 * 
 * TOTAL: 4 endpoints adicionales
 * 
 * Nota: El servicio Usuarios.ts ya implementa:
 * - GET /usuarios/usuarios/ (buscarUsuarios)
 * - PATCH /usuarios/{codigo}/ (cambiarRolPorCodigo)
 * - GET /usuario/me (verMiPerfil)
 * - PATCH /usuario/me (editarMiPerfil)
 */

import { Api } from '../lib/Api';

// ==================== INTERFACES ====================

export interface CrearUsuarioDTO {
  nombre: string;
  apellido: string;
  correoelectronico: string;
  password: string;
  telefono?: string;
  sexo?: 'M' | 'F';
  idtipousuario: number;
  recibir_notificaciones?: boolean;
  
  // Campos específicos por tipo de usuario
  // Paciente
  fecha_nacimiento?: string;
  direccion?: string;
  
  // Odontólogo
  especialidad?: string;
  numero_licencia?: string;
  anios_experiencia?: number;
}

export interface ActualizarUsuarioDTO {
  nombre?: string;
  apellido?: string;
  correoelectronico?: string;
  telefono?: string;
  sexo?: 'M' | 'F';
  idtipousuario?: number;
  recibir_notificaciones?: boolean;
  password?: string;
  
  // Campos específicos
  fecha_nacimiento?: string;
  direccion?: string;
  especialidad?: string;
  numero_licencia?: string;
  anios_experiencia?: number;
}

export interface EstadisticasUsuarios {
  total_usuarios: number;
  por_tipo: Array<{
    tipo_usuario: string;
    cantidad: number;
    porcentaje: number;
  }>;
  usuarios_activos: number;
  usuarios_inactivos: number;
  registros_ultimo_mes: number;
  por_mes: Array<{
    mes: string;
    cantidad: number;
  }>;
}

// ==================== HELPERS ====================

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Token ${token}` }),
  };
};

// ==================== CRUD ADMINISTRATIVO ====================

/**
 * Crear nuevo usuario
 * POST /api/v1/usuarios/usuarios/
 * 
 * IMPORTANTE: Solo administradores pueden crear usuarios
 */
export const crearUsuario = async (data: CrearUsuarioDTO): Promise<any> => {
  try {
    console.log('👤 Creando nuevo usuario:', { ...data, password: '[PROTEGIDO]' });
    const response = await Api.post('/usuarios/usuarios/', data, { headers: getHeaders() });
    
    console.log('✅ Usuario creado exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al crear usuario:', error);
    
    // Manejar errores específicos del backend
    if (error.response?.status === 400) {
      const errores = error.response.data;
      if (errores.correoelectronico) {
        throw new Error('El correo electrónico ya está registrado');
      }
      if (errores.password) {
        throw new Error('La contraseña no cumple con los requisitos mínimos');
      }
    }
    
    throw error.response?.data || error;
  }
};

/**
 * Actualizar usuario completo
 * PUT /api/v1/usuarios/usuarios/{id}/
 * 
 * IMPORTANTE: Solo administradores pueden actualizar otros usuarios
 */
export const actualizarUsuario = async (id: number, data: ActualizarUsuarioDTO): Promise<any> => {
  try {
    console.log(`📝 Actualizando usuario ${id}:`, { ...data, password: data.password ? '[PROTEGIDO]' : undefined });
    const response = await Api.put(`/usuarios/usuarios/${id}/`, data, { headers: getHeaders() });
    
    console.log('✅ Usuario actualizado exitosamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar usuario ${id}:`, error);
    
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para actualizar este usuario');
    }
    if (error.response?.status === 404) {
      throw new Error('Usuario no encontrado');
    }
    
    throw error.response?.data || error;
  }
};

/**
 * Actualizar usuario parcialmente
 * PATCH /api/v1/usuarios/usuarios/{id}/
 */
export const actualizarParcialUsuario = async (id: number, data: Partial<ActualizarUsuarioDTO>): Promise<any> => {
  try {
    console.log(`📝 Actualizando parcialmente usuario ${id}:`, { ...data, password: data.password ? '[PROTEGIDO]' : undefined });
    const response = await Api.patch(`/usuarios/usuarios/${id}/`, data, { headers: getHeaders() });
    
    console.log('✅ Usuario actualizado parcialmente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar parcialmente usuario ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Eliminar usuario
 * DELETE /api/v1/usuarios/usuarios/{id}/
 * 
 * IMPORTANTE: Solo administradores pueden eliminar usuarios
 * PRECAUCIÓN: Esta acción puede afectar datos relacionados (citas, tratamientos, etc.)
 */
export const eliminarUsuario = async (id: number): Promise<void> => {
  try {
    console.log(`🗑️ Eliminando usuario ${id}`);
    await Api.delete(`/usuarios/usuarios/${id}/`, { headers: getHeaders() });
    
    console.log('✅ Usuario eliminado exitosamente');
  } catch (error: any) {
    console.error(`❌ Error al eliminar usuario ${id}:`, error);
    
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para eliminar usuarios');
    }
    if (error.response?.status === 404) {
      throw new Error('Usuario no encontrado');
    }
    if (error.response?.status === 400) {
      throw new Error('No se puede eliminar el usuario porque tiene datos relacionados');
    }
    
    throw error.response?.data || error;
  }
};

/**
 * Obtener estadísticas de usuarios
 * GET /api/v1/usuarios/usuarios/estadisticas/
 */
export const obtenerEstadisticasUsuarios = async (): Promise<EstadisticasUsuarios> => {
  try {
    console.log('📊 Obteniendo estadísticas de usuarios');
    const response = await Api.get('/usuarios/usuarios/estadisticas/', { headers: getHeaders() });
    
    console.log('✅ Estadísticas obtenidas:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al obtener estadísticas:', error);
    throw error.response?.data || error;
  }
};

// ==================== UTILIDADES ====================

/**
 * Validar formato de correo electrónico
 */
export const validarCorreo = (correo: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
};

/**
 * Validar contraseña (mínimo 8 caracteres)
 */
export const validarPassword = (password: string): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];
  
  if (password.length < 8) {
    errores.push('Debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errores.push('Debe contener al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errores.push('Debe contener al menos una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errores.push('Debe contener al menos un número');
  }
  
  return {
    valido: errores.length === 0,
    errores,
  };
};

/**
 * Validar datos completos de usuario
 */
export const validarUsuario = (data: CrearUsuarioDTO): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];
  
  if (!data.nombre || data.nombre.trim().length === 0) {
    errores.push('El nombre es requerido');
  }
  if (!data.apellido || data.apellido.trim().length === 0) {
    errores.push('El apellido es requerido');
  }
  if (!validarCorreo(data.correoelectronico)) {
    errores.push('El correo electrónico no es válido');
  }
  if (!data.password) {
    errores.push('La contraseña es requerida');
  } else {
    const validacionPassword = validarPassword(data.password);
    if (!validacionPassword.valido) {
      errores.push(...validacionPassword.errores);
    }
  }
  if (!data.idtipousuario) {
    errores.push('El tipo de usuario es requerido');
  }
  
  return {
    valido: errores.length === 0,
    errores,
  };
};

/**
 * Obtener texto descriptivo del tipo de usuario
 */
export const getTipoUsuarioTexto = (idTipo: number): string => {
  const tipos: Record<number, string> = {
    1: 'Administrador',
    2: 'Paciente',
    3: 'Odontólogo',
    4: 'Recepcionista',
    5: 'Asistente',
  };
  return tipos[idTipo] || `Tipo ${idTipo}`;
};

/**
 * Obtener icono según tipo de usuario
 */
export const getIconoTipoUsuario = (idTipo: number): string => {
  const iconos: Record<number, string> = {
    1: '👨‍💼', // Admin
    2: '😊',    // Paciente
    3: '🦷',    // Odontólogo
    4: '📋',    // Recepcionista
    5: '👩‍⚕️',  // Asistente
  };
  return iconos[idTipo] || '👤';
};

/**
 * Generar username automático
 */
export const generarUsername = (nombre: string, apellido: string): string => {
  const nombreLimpio = nombre.toLowerCase().trim().replace(/\s+/g, '');
  const apellidoLimpio = apellido.toLowerCase().trim().replace(/\s+/g, '');
  return `${nombreLimpio}.${apellidoLimpio}`;
};

// ==================== EXPORT DEFAULT ====================

export default {
  // CRUD administrativo
  crearUsuario,
  actualizarUsuario,
  actualizarParcialUsuario,
  eliminarUsuario,
  obtenerEstadisticasUsuarios,
  
  // Utilidades
  validarCorreo,
  validarPassword,
  validarUsuario,
  getTipoUsuarioTexto,
  getIconoTipoUsuario,
  generarUsername,
};
