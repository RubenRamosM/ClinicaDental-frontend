// src/services/CrearUsuario.ts
import { Api } from "../lib/Api";
import axios from "axios";

// ✅ CORRECTO: Backend devuelve "rol" no "nombre"
// Endpoint: GET /api/v1/usuarios/tipos-usuario/
// Response: [{ "id": 192, "rol": "Paciente", "descripcion": "..." }, ...]
export type TipoUsuario = {
  id: number;
  rol: string;  // ✅ Campo "rol" del backend (NO "nombre")
  tiene_tabla_adicional: boolean;
  descripcion?: string;  // ✅ Campo opcional que también envía el backend
};

export type CampoInfo = {
  tipo: string;
  requerido: boolean;
  max_length?: number;
  descripcion: string;
  opciones?: string[];
  formato?: string;
};

// ✅ Respuesta del backend para campos dinámicos
// Endpoint: POST /api/v1/usuarios/tipos-usuario/{id}/campos-requeridos/
type RespuestaBackendCampos = {
  tipo_usuario: {
    id: number;
    rol: string;  // ✅ Backend usa "rol" (no "nombre")
  };
  campos_requeridos: string[];
  campos_opcionales: string[];
};

// ✅ Estructura procesada para el frontend
export type EstructuraCampos = {
  tipo_usuario: number;
  nombre_tipo: string;
  campos_base: Record<string, CampoInfo>;
  campos_adicionales: Record<string, CampoInfo>;
};

export type UsuarioCreado = {
  codigo: number;
  nombre: string;
  apellido: string;
  correoelectronico: string;
  sexo: string | null;
  telefono: string | null;
  idtipousuario: number;
  tipo_usuario_nombre: string;
  recibir_notificaciones: boolean;
  notificaciones_email: boolean;
  notificaciones_push: boolean;
  paciente?: any;
  odontologo?: any;
  recepcionista?: any;
};

export type RespuestaCreacion = {
  mensaje: string;
  usuario: UsuarioCreado;
};

/**
 * Obtiene los tipos de usuario disponibles para crear
 */
export async function obtenerTiposUsuario(): Promise<TipoUsuario[]> {
  try {
    console.log('🔍 Obteniendo tipos de usuario...');
    
    // ✅ Usar el endpoint estándar de tipos de usuario
    const { data } = await Api.get<TipoUsuario[] | { results: TipoUsuario[] }>('/usuarios/tipos-usuario/');
    
    // El endpoint devuelve array directo o paginado
    const tipos = Array.isArray(data) ? data : (data.results ?? []);
    console.log('✅ Tipos de usuario obtenidos:', tipos);
    return tipos;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const mensaje = error.response?.data?.error || error.response?.data?.detail;
      
      console.error('❌ Error al obtener tipos de usuario:', {
        status,
        mensaje
      });
      
      if (status === 403) {
        throw new Error("No tienes permisos para ver los tipos de usuario.");
      }
      
      throw new Error(mensaje || "Error al obtener tipos de usuario.");
    }
    
    throw new Error("Error de conexión. Por favor, intente nuevamente.");
  }
}

/**
 * Helper: Genera metadata de un campo basándose en su nombre
 */
function generarMetadataCampo(nombreCampo: string, esRequerido: boolean): CampoInfo {
  const nombre = nombreCampo.toLowerCase();
  
  // Determinar tipo de campo
  let tipo = 'string';
  let max_length = 100;
  let opciones: string[] | undefined;
  let descripcion = '';
  
  if (nombre.includes('email') || nombre.includes('correo')) {
    tipo = 'email';
    descripcion = 'Ingrese un correo electrónico válido';
    max_length = 255;
  } else if (nombre.includes('password') || nombre.includes('contraseña')) {
    tipo = 'password';
    descripcion = 'Mínimo 8 caracteres';
    max_length = 128;
  } else if (nombre.includes('fecha') || nombre.includes('date')) {
    tipo = 'date';
    descripcion = 'Seleccione una fecha';
  } else if (nombre.includes('descripcion') || nombre.includes('observ') || nombre.includes('alergias')) {
    tipo = 'text';
    descripcion = 'Ingrese información detallada';
    max_length = 500;
  } else if (nombre.includes('telefono') || nombre.includes('celular')) {
    tipo = 'tel';
    descripcion = 'Ej: +591 12345678';
    max_length = 20;
  } else if (nombre.includes('sexo') || nombre === 'sexo') {
    tipo = 'select';
    opciones = ['Masculino', 'Femenino'];
    descripcion = 'Seleccione el sexo';
  } else if (nombre.includes('grupo') && nombre.includes('sanguineo')) {
    tipo = 'select';
    opciones = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    descripcion = 'Seleccione el tipo de sangre';
  } else if (nombre.includes('especialidad')) {
    tipo = 'select';
    opciones = ['Ortodoncia', 'Endodoncia', 'Periodoncia', 'Odontopediatría', 'Cirugía Oral', 'Estética Dental', 'Implantología', 'General'];
    descripcion = 'Especialidad del odontólogo';
  } else if (nombre.includes('turno')) {
    tipo = 'select';
    opciones = ['Mañana', 'Tarde', 'Noche'];
    descripcion = 'Turno de trabajo';
  } else {
    descripcion = `Ingrese ${nombreCampo}`;
  }
  
  return {
    tipo,
    requerido: esRequerido,
    max_length,
    descripcion,
    opciones
  };
}

/**
 * Helper: Transforma respuesta del backend a estructura del frontend
 */
function transformarRespuestaBackend(data: RespuestaBackendCampos): EstructuraCampos {
  // Separar campos base de campos específicos
  const camposBaseComunes = ['nombre', 'apellido', 'correoelectronico', 'password', 'sexo', 'telefono', 'direccion', 'fechanacimiento'];
  
  const campos_base: Record<string, CampoInfo> = {};
  const campos_adicionales: Record<string, CampoInfo> = {};
  
  // Procesar campos requeridos
  data.campos_requeridos.forEach(campo => {
    const metadata = generarMetadataCampo(campo, true);
    
    if (camposBaseComunes.includes(campo)) {
      campos_base[campo] = metadata;
    } else {
      campos_adicionales[campo] = metadata;
    }
  });
  
  // Procesar campos opcionales
  data.campos_opcionales.forEach(campo => {
    const metadata = generarMetadataCampo(campo, false);
    
    if (camposBaseComunes.includes(campo)) {
      campos_base[campo] = metadata;
    } else {
      campos_adicionales[campo] = metadata;
    }
  });
  
  return {
    tipo_usuario: data.tipo_usuario.id,
    nombre_tipo: data.tipo_usuario.rol,  // ✅ Backend usa "rol" no "nombre"
    campos_base,
    campos_adicionales
  };
}

/**
 * Obtiene los campos requeridos para un tipo de usuario específico
 */
export async function obtenerCamposRequeridos(tipoUsuario: number): Promise<EstructuraCampos> {
  try {
    console.log(`🔍 Obteniendo campos requeridos para tipo ${tipoUsuario}...`);
    
    const { data } = await Api.get<RespuestaBackendCampos>(
      `/usuarios/usuarios/crear-usuario/campos-requeridos/?tipo=${tipoUsuario}`
    );
    
    console.log('✅ Respuesta del backend:', data);
    
    // Transformar respuesta del backend a estructura del frontend
    const estructuraTransformada = transformarRespuestaBackend(data);
    
    console.log('✅ Estructura transformada:', estructuraTransformada);
    return estructuraTransformada;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const mensaje = error.response?.data?.error || error.response?.data?.detail;
      
      console.error('❌ Error al obtener campos requeridos:', {
        status,
        mensaje,
        tipoUsuario
      });
      
      if (status === 400) {
        throw new Error("Tipo de usuario inválido.");
      }
      
      throw new Error(mensaje || "Error al obtener campos requeridos.");
    }
    
    throw new Error("Error de conexión. Por favor, intente nuevamente.");
  }
}

/**
 * Crea un nuevo usuario con los datos proporcionados
 */
export async function crearUsuario(
  tipoUsuario: number,
  datos: Record<string, any>
): Promise<RespuestaCreacion> {
  try {
    console.log(`🔄 Creando usuario tipo ${tipoUsuario}...`, {
      datos: {
        ...datos,
        password: datos.password ? '[PROTEGIDO]' : undefined
      }
    });
    
    const { data } = await Api.post<RespuestaCreacion>('/usuarios/usuarios/crear-usuario/', {
      tipo_usuario: tipoUsuario,
      datos
    });
    
    console.log('✅ Usuario creado exitosamente:', {
      codigo: data.usuario.codigo,
      nombre: data.usuario.nombre,
      tipo: data.usuario.tipo_usuario_nombre
    });
    
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      console.error('❌ Error al crear usuario:', {
        status,
        errorData
      });
      
      // Errores específicos
      if (status === 403) {
        throw new Error("No tienes permisos para crear usuarios. Solo administradores pueden realizar esta acción.");
      }

      // Si el backend retorna 500 pero el usuario podría haberse creado
      if (status === 500) {
        console.warn('⚠️ Error 500 del servidor - posiblemente error en bitácora pero usuario creado');
        throw new Error("El usuario pudo haberse creado pero hubo un error en el registro. Por favor, verifica en la lista de usuarios.");
      }
      
      if (status === 400 && errorData?.detalles) {
        // Errores de validación detallados
        const errores: string[] = [];
        
        // Errores en el nivel superior
        Object.keys(errorData.detalles).forEach(campo => {
          if (campo === 'datos' && typeof errorData.detalles[campo] === 'object') {
            // Errores en los datos específicos
            Object.keys(errorData.detalles[campo]).forEach(campoDatos => {
              const mensajes = errorData.detalles[campo][campoDatos];
              if (Array.isArray(mensajes)) {
                errores.push(`${campoDatos}: ${mensajes.join(', ')}`);
              } else {
                errores.push(`${campoDatos}: ${mensajes}`);
              }
            });
          } else {
            const mensajes = errorData.detalles[campo];
            if (Array.isArray(mensajes)) {
              errores.push(`${campo}: ${mensajes.join(', ')}`);
            } else {
              errores.push(`${campo}: ${mensajes}`);
            }
          }
        });
        
        throw new Error(errores.join('\n'));
      }
      
      throw new Error(errorData?.error || "Error al crear el usuario.");
    }
    
    throw new Error("Error de conexión. Por favor, intente nuevamente.");
  }
}

/**
 * Validación local de datos antes de enviar al servidor
 * ✅ Actualizado para trabajar con estructura transformada
 */
export function validarDatosUsuario(
  datos: Record<string, any>,
  estructura: EstructuraCampos
): { valido: boolean; errores: string[] } {
  const errores: string[] = [];
  
  // Validar campos base
  Object.entries(estructura.campos_base).forEach(([campo, info]) => {
    const valor = datos[campo];
    
    if (info.requerido && (!valor || valor.toString().trim() === '')) {
      errores.push(`${campo} es requerido`);
    }
    
    if (valor && info.max_length && valor.toString().length > info.max_length) {
      errores.push(`${campo} no puede tener más de ${info.max_length} caracteres`);
    }
    
    if (valor && info.tipo === 'email' && !isValidEmail(valor)) {
      errores.push(`${campo} debe ser un email válido`);
    }
  });
  
  // Validar campos adicionales
  Object.entries(estructura.campos_adicionales).forEach(([campo, info]) => {
    const valor = datos[campo];
    
    if (info.requerido && (!valor || valor.toString().trim() === '')) {
      errores.push(`${campo} es requerido`);
    }
    
    if (valor && info.max_length && valor.toString().length > info.max_length) {
      errores.push(`${campo} no puede tener más de ${info.max_length} caracteres`);
    }
  });
  
  return {
    valido: errores.length === 0,
    errores
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}







