import { Api } from '../lib/Api';

export interface Factura {
  id: number;
  fechaemision: string;
  montototal: number;
  idestadofactura: number;
  estado_nombre?: string;
  items?: ItemFactura[];
  pagos?: PagoFactura[];
}

export interface ItemFactura {
  id?: number;
  descripcion: string;
  monto: number;
}

export interface PagoFactura {
  id?: number;
  montopagado: number;
  fechapago: string;
  idtipopago: number;
  codigo_pago_stripe?: string;
}

class FacturaService {
  // Crear factura nueva (el backend ya tiene este endpoint)
  async crearFactura(data: any): Promise<Factura> {
    const response = await Api.post('/pagos/facturas/', data);
    return response.data;
  }

  // Obtener factura por ID
  async obtenerFactura(facturaId: number): Promise<Factura> {
    const response = await Api.get(`/pagos/facturas/${facturaId}/`);
    return response.data;
  }

  // Listar facturas del usuario (ya existe en backend)
  async listarFacturas(): Promise<Factura[]> {
    const response = await Api.get('/pagos/facturas/');
    return response.data.results || response.data;
  }

  // NOTA: Los endpoints de PDF y Email NO existen en el backend actual
  // Por ahora, estos métodos fallarán hasta que se implementen en Django
  
  // Descargar PDF de factura (pendiente en backend)
  async descargarFacturaPDF(facturaId: number): Promise<Blob> {
    try {
      const response = await Api.get(`/pagos/facturas/${facturaId}/pdf/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.warn('Endpoint PDF no disponible en backend:', error);
      throw new Error('La descarga de PDF aún no está disponible');
    }
  }

  // Enviar factura por email (pendiente en backend)
  async enviarFacturaEmail(facturaId: number, email: string): Promise<void> {
    try {
      await Api.post(`/pagos/facturas/${facturaId}/enviar-email/`, { email });
    } catch (error) {
      console.warn('Endpoint enviar email no disponible en backend:', error);
      throw new Error('El envío por email aún no está disponible');
    }
  }
}

export default new FacturaService();
