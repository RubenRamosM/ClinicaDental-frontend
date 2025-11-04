/**
 * 📦 SERVICIO DE INVENTARIO
 * 
 * Gestión completa de inventario de la clínica dental
 * Backend: /api/v1/inventario/
 * 
 * Módulos implementados:
 * - Categorías de productos
 * - Productos (insumos dentales, medicamentos, equipos)
 * - Movimientos de inventario (entradas/salidas)
 * - Alertas de stock bajo
 * 
 * Endpoints implementados:
 * - Categorías: GET, POST, PUT, DELETE (4 endpoints)
 * - Productos: GET, POST, PUT, DELETE (4 endpoints)
 * - Movimientos: GET, POST (2 endpoints)
 * - Alertas: GET stock-bajo (1 endpoint)
 * 
 * TOTAL: 11 endpoints
 */

import { Api } from '../lib/Api';

// ==================== INTERFACES - CATEGORÍAS ====================

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion?: string;
  productos_count?: number;
}

export interface CrearCategoriaDTO {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface ActualizarCategoriaDTO {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

// ==================== INTERFACES - PRODUCTOS ====================

export interface Producto {
  id: number;
  categoria: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  unidad_medida: 'unidad' | 'caja' | 'paquete' | 'ml' | 'gr' | 'kg' | 'litro' | 'otro';
  stock_actual: number;
  stock_minimo: number;
  precio_unitario: number;
  proveedor?: string;
  fecha_vencimiento?: string;
  activo: boolean;
  
  // Campos expandidos
  categoria_nombre?: string;
  estado_stock?: 'critico' | 'bajo' | 'normal' | 'exceso';
  dias_hasta_vencimiento?: number;
}

export interface CrearProductoDTO {
  categoria: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  unidad_medida: 'unidad' | 'caja' | 'paquete' | 'ml' | 'gr' | 'kg' | 'litro' | 'otro';
  stock_actual?: number;
  stock_minimo: number;
  precio_unitario: number;
  proveedor?: string;
  fecha_vencimiento?: string;
  activo?: boolean;
}

export interface ActualizarProductoDTO {
  categoria?: number;
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  unidad_medida?: 'unidad' | 'caja' | 'paquete' | 'ml' | 'gr' | 'kg' | 'litro' | 'otro';
  stock_actual?: number;
  stock_minimo?: number;
  precio_unitario?: number;
  proveedor?: string;
  fecha_vencimiento?: string;
  activo?: boolean;
}

export interface FiltrosProductos {
  categoria?: number;
  codigo?: string;
  nombre?: string;
  activo?: boolean;
  stock_bajo?: boolean;
  proximo_vencer?: boolean;
  page?: number;
  page_size?: number;
}

// ==================== INTERFACES - MOVIMIENTOS ====================

export interface MovimientoInventario {
  id: number;
  producto: number;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste' | 'devolucion';
  cantidad: number;
  motivo: string;
  usuario: number;
  fecha_movimiento: string;
  costo_unitario?: number;
  costo_total?: number;
  documento_referencia?: string;
  
  // Campos expandidos
  producto_nombre?: string;
  producto_codigo?: string;
  usuario_nombre?: string;
  stock_anterior?: number;
  stock_nuevo?: number;
}

export interface CrearMovimientoDTO {
  producto: number;
  tipo_movimiento: 'entrada' | 'salida' | 'ajuste' | 'devolucion';
  cantidad: number;
  motivo: string;
  costo_unitario?: number;
  documento_referencia?: string;
}

export interface FiltrosMovimientos {
  producto?: number;
  tipo_movimiento?: 'entrada' | 'salida' | 'ajuste' | 'devolucion';
  fecha_desde?: string;
  fecha_hasta?: string;
  usuario?: number;
  page?: number;
  page_size?: number;
}

// ==================== INTERFACES - RESPUESTAS ====================

export interface RespuestaPaginadaCategorias {
  count: number;
  next: string | null;
  previous: string | null;
  results: Categoria[];
}

export interface RespuestaPaginadaProductos {
  count: number;
  next: string | null;
  previous: string | null;
  results: Producto[];
}

export interface RespuestaPaginadaMovimientos {
  count: number;
  next: string | null;
  previous: string | null;
  results: MovimientoInventario[];
}

export interface ProductoStockBajo {
  id: number;
  codigo: string;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  diferencia: number;
  categoria_nombre: string;
  criticidad: 'critico' | 'bajo' | 'normal';
}

// ==================== HELPERS ====================

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Token ${token}` }),
  };
};

// ==================== CATEGORÍAS ====================

/**
 * Listar todas las categorías
 * GET /api/v1/inventario/categorias/
 */
export const listarCategorias = async (filtros?: { activo?: boolean }): Promise<RespuestaPaginadaCategorias> => {
  try {
    const params = new URLSearchParams();
    if (filtros?.activo !== undefined) params.append('activo', filtros.activo.toString());

    const queryString = params.toString();
    const url = `/inventario/categorias/${queryString ? `?${queryString}` : ''}`;

    console.log('📋 Listando categorías:', url);
    const response = await Api.get(url, { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al listar categorías:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener detalle de una categoría
 * GET /api/v1/inventario/categorias/{id}/
 */
export const obtenerCategoria = async (id: number): Promise<Categoria> => {
  try {
    console.log(`📄 Obteniendo categoría ${id}`);
    const response = await Api.get(`/inventario/categorias/${id}/`, { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener categoría ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Crear nueva categoría
 * POST /api/v1/inventario/categorias/
 * 
 * Flujo E2E: Sesión 1, paso 1.18j
 */
export const crearCategoria = async (data: CrearCategoriaDTO): Promise<Categoria> => {
  try {
    console.log('📦 Creando categoría:', data);
    const response = await Api.post('/inventario/categorias/', data, { headers: getHeaders() });
    
    console.log('✅ Categoría creada:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al crear categoría:', error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar categoría
 * PUT /api/v1/inventario/categorias/{id}/
 */
export const actualizarCategoria = async (id: number, data: ActualizarCategoriaDTO): Promise<Categoria> => {
  try {
    console.log(`📝 Actualizando categoría ${id}:`, data);
    const response = await Api.put(`/inventario/categorias/${id}/`, data, { headers: getHeaders() });
    
    console.log('✅ Categoría actualizada:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar categoría ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Eliminar categoría
 * DELETE /api/v1/inventario/categorias/{id}/
 */
export const eliminarCategoria = async (id: number): Promise<void> => {
  try {
    console.log(`🗑️ Eliminando categoría ${id}`);
    await Api.delete(`/inventario/categorias/${id}/`, { headers: getHeaders() });
    
    console.log('✅ Categoría eliminada exitosamente');
  } catch (error: any) {
    console.error(`❌ Error al eliminar categoría ${id}:`, error);
    throw error.response?.data || error;
  }
};

// ==================== PRODUCTOS ====================

/**
 * Listar todos los productos
 * GET /api/v1/inventario/productos/
 */
export const listarProductos = async (filtros?: FiltrosProductos): Promise<RespuestaPaginadaProductos> => {
  try {
    const params = new URLSearchParams();
    
    if (filtros?.categoria) params.append('categoria', filtros.categoria.toString());
    if (filtros?.codigo) params.append('codigo', filtros.codigo);
    if (filtros?.nombre) params.append('nombre', filtros.nombre);
    if (filtros?.activo !== undefined) params.append('activo', filtros.activo.toString());
    if (filtros?.stock_bajo) params.append('stock_bajo', 'true');
    if (filtros?.proximo_vencer) params.append('proximo_vencer', 'true');
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.page_size) params.append('page_size', filtros.page_size.toString());

    const queryString = params.toString();
    const url = `/inventario/productos/${queryString ? `?${queryString}` : ''}`;

    console.log('📋 Listando productos:', url);
    const response = await Api.get(url, { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al listar productos:', error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener detalle de un producto
 * GET /api/v1/inventario/productos/{id}/
 */
export const obtenerProducto = async (id: number): Promise<Producto> => {
  try {
    console.log(`📄 Obteniendo producto ${id}`);
    const response = await Api.get(`/inventario/productos/${id}/`, { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener producto ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Crear nuevo producto
 * POST /api/v1/inventario/productos/
 * 
 * Flujo E2E: Sesión 1, paso 1.18k
 */
export const crearProducto = async (data: CrearProductoDTO): Promise<Producto> => {
  try {
    console.log('📦 Creando producto:', data);
    const response = await Api.post('/inventario/productos/', data, { headers: getHeaders() });
    
    console.log('✅ Producto creado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al crear producto:', error);
    throw error.response?.data || error;
  }
};

/**
 * Actualizar producto
 * PUT /api/v1/inventario/productos/{id}/
 */
export const actualizarProducto = async (id: number, data: ActualizarProductoDTO): Promise<Producto> => {
  try {
    console.log(`📝 Actualizando producto ${id}:`, data);
    const response = await Api.put(`/inventario/productos/${id}/`, data, { headers: getHeaders() });
    
    console.log('✅ Producto actualizado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar producto ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Eliminar producto
 * DELETE /api/v1/inventario/productos/{id}/
 */
export const eliminarProducto = async (id: number): Promise<void> => {
  try {
    console.log(`🗑️ Eliminando producto ${id}`);
    await Api.delete(`/inventario/productos/${id}/`, { headers: getHeaders() });
    
    console.log('✅ Producto eliminado exitosamente');
  } catch (error: any) {
    console.error(`❌ Error al eliminar producto ${id}:`, error);
    throw error.response?.data || error;
  }
};

/**
 * Obtener productos con stock bajo
 * GET /api/v1/inventario/productos/stock-bajo/
 * 
 * Flujo E2E: Sesión 1, paso 1.18m
 */
export const obtenerProductosStockBajo = async (): Promise<ProductoStockBajo[]> => {
  try {
    console.log('⚠️ Obteniendo productos con stock bajo');
    const response = await Api.get('/inventario/productos/stock-bajo/', { headers: getHeaders() });
    
    console.log(`✅ Productos con stock bajo: ${response.data.length}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al obtener productos con stock bajo:', error);
    throw error.response?.data || error;
  }
};

// ==================== MOVIMIENTOS ====================

/**
 * Listar movimientos de inventario
 * GET /api/v1/inventario/movimientos/
 */
export const listarMovimientos = async (filtros?: FiltrosMovimientos): Promise<RespuestaPaginadaMovimientos> => {
  try {
    const params = new URLSearchParams();
    
    if (filtros?.producto) params.append('producto', filtros.producto.toString());
    if (filtros?.tipo_movimiento) params.append('tipo_movimiento', filtros.tipo_movimiento);
    if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros?.usuario) params.append('usuario', filtros.usuario.toString());
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.page_size) params.append('page_size', filtros.page_size.toString());

    const queryString = params.toString();
    const url = `/inventario/movimientos/${queryString ? `?${queryString}` : ''}`;

    console.log('📋 Listando movimientos:', url);
    const response = await Api.get(url, { headers: getHeaders() });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al listar movimientos:', error);
    throw error.response?.data || error;
  }
};

/**
 * Registrar movimiento de inventario
 * POST /api/v1/inventario/movimientos/
 * 
 * Flujo E2E: Sesión 1, paso 1.18l
 */
export const registrarMovimiento = async (data: CrearMovimientoDTO): Promise<MovimientoInventario> => {
  try {
    console.log('📦 Registrando movimiento:', data);
    const response = await Api.post('/inventario/movimientos/', data, { headers: getHeaders() });
    
    console.log('✅ Movimiento registrado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error al registrar movimiento:', error);
    throw error.response?.data || error;
  }
};

// ==================== UTILIDADES ====================

/**
 * Obtener estado del stock
 */
export const getEstadoStock = (stockActual: number, stockMinimo: number): 'critico' | 'bajo' | 'normal' | 'exceso' => {
  if (stockActual === 0) return 'critico';
  if (stockActual < stockMinimo) return 'bajo';
  if (stockActual > stockMinimo * 3) return 'exceso';
  return 'normal';
};

/**
 * Obtener color según estado de stock
 */
export const getColorEstadoStock = (estado: string): string => {
  const colores: Record<string, string> = {
    critico: 'bg-red-100 text-red-800',
    bajo: 'bg-yellow-100 text-yellow-800',
    normal: 'bg-green-100 text-green-800',
    exceso: 'bg-blue-100 text-blue-800',
  };
  return colores[estado] || 'bg-gray-100 text-gray-800';
};

/**
 * Obtener texto de tipo de movimiento
 */
export const getTextoTipoMovimiento = (tipo: string): string => {
  const textos: Record<string, string> = {
    entrada: 'Entrada',
    salida: 'Salida',
    ajuste: 'Ajuste',
    devolucion: 'Devolución',
  };
  return textos[tipo] || tipo;
};

/**
 * Obtener icono según tipo de movimiento
 */
export const getIconoTipoMovimiento = (tipo: string): string => {
  const iconos: Record<string, string> = {
    entrada: '📥',
    salida: '📤',
    ajuste: '⚙️',
    devolucion: '🔄',
  };
  return iconos[tipo] || '📦';
};

/**
 * Calcular valor total del inventario
 */
export const calcularValorInventario = (productos: Producto[]): number => {
  return productos.reduce((total, p) => total + (p.stock_actual * p.precio_unitario), 0);
};

/**
 * Formatear precio
 */
export const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  }).format(precio);
};

/**
 * Validar stock suficiente
 */
export const validarStockSuficiente = (producto: Producto, cantidad: number): boolean => {
  return producto.stock_actual >= cantidad;
};

/**
 * Calcular días hasta vencimiento
 */
export const calcularDiasVencimiento = (fechaVencimiento: string): number => {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferencia = vencimiento.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

/**
 * Verificar si está próximo a vencer
 */
export const estaProximoVencer = (fechaVencimiento: string, diasUmbral: number = 30): boolean => {
  const dias = calcularDiasVencimiento(fechaVencimiento);
  return dias >= 0 && dias <= diasUmbral;
};

// ==================== EXPORT DEFAULT ====================

export default {
  // Categorías
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  
  // Productos
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductosStockBajo,
  
  // Movimientos
  listarMovimientos,
  registrarMovimiento,
  
  // Utilidades
  getEstadoStock,
  getColorEstadoStock,
  getTextoTipoMovimiento,
  getIconoTipoMovimiento,
  calcularValorInventario,
  formatearPrecio,
  validarStockSuficiente,
  calcularDiasVencimiento,
  estaProximoVencer,
};
