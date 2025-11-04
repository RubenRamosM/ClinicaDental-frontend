import React, { useEffect, useState } from 'react';
import facturaService from '../services/facturaService';
import type { Factura } from '../services/facturaService';

interface Props {
  pagoId?: number;
  codigoPago?: string;
  onClose?: () => void;
}

const VistaFactura: React.FC<Props> = ({ pagoId, codigoPago, onClose }) => {
  const [factura, setFactura] = useState<Factura | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarFactura();
  }, [pagoId]);

  const cargarFactura = async () => {
    try {
      setCargando(true);
      
      // Obtener la lista de facturas y tomar la más reciente
      const facturas = await facturaService.listarFacturas();
      
      if (facturas && facturas.length > 0) {
        // Ordenar por ID descendente y tomar la primera (más reciente)
        const facturasMasRecientes = facturas.sort((a, b) => b.id - a.id);
        setFactura(facturasMasRecientes[0]);
      } else {
        setError('No se encontraron facturas');
      }
    } catch (err: any) {
      console.error('Error al cargar factura:', err);
      setError(err.response?.data?.detail || err.message || 'Error al cargar la factura');
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    if (!factura) return;
    
    try {
      const blob = await facturaService.descargarFacturaPDF(factura.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${factura.id.toString().padStart(6, '0')}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'La descarga de PDF aún no está disponible');
    }
  };

  const enviarPorEmail = async () => {
    if (!factura) return;
    
    const email = prompt('Ingresa el email donde deseas recibir la factura:');
    if (!email) return;

    try {
      await facturaService.enviarFacturaEmail(factura.id, email);
      alert(`Factura enviada exitosamente a ${email}`);
    } catch (err: any) {
      alert(err.message || 'El envío por email aún no está disponible');
    }
  };

  if (cargando) {
    return (
      <div className="text-center p-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Generando factura...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error al generar factura</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!factura) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl mx-auto">
      {/* Encabezado */}
      <div className="border-b pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">FACTURA</h2>
            <p className="text-gray-600">Nº {factura.id.toString().padStart(6, '0')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Fecha de Emisión</p>
            <p className="font-bold">{new Date(factura.fechaemision).toLocaleDateString('es-BO')}</p>
          </div>
        </div>
      </div>

      {/* Información de la Clínica */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 mb-2">CLÍNICA DENTAL</h3>
        <p className="text-sm text-gray-600">NIT: 123456789</p>
        <p className="text-sm text-gray-600">Dirección: Av. Principal #123, La Paz, Bolivia</p>
        <p className="text-sm text-gray-600">Teléfono: +591 2 1234567</p>
        <p className="text-sm text-gray-600">Email: info@clinicadental.com</p>
      </div>

      {/* Items de la Factura */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 mb-3">DETALLE</h3>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border">Descripción</th>
              <th className="text-right p-2 border">Monto</th>
            </tr>
          </thead>
          <tbody>
            {factura.items?.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2 border">{item.descripcion}</td>
                <td className="text-right p-2 border">Bs. {item.monto.toFixed(2)}</td>
              </tr>
            ))}
            {!factura.items || factura.items.length === 0 ? (
              <tr>
                <td className="p-2 border">Consulta Odontológica</td>
                <td className="text-right p-2 border">Bs. {factura.montototal.toFixed(2)}</td>
              </tr>
            ) : null}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="p-2 font-bold text-right border">TOTAL:</td>
              <td className="p-2 font-bold text-right text-xl border">
                Bs. {factura.montototal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Estado de Pago */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 mb-3">ESTADO DE PAGO</h3>
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <p className="text-green-800">
            <strong>✓ PAGADO</strong> {factura.estado_nombre && `- ${factura.estado_nombre}`}
          </p>
          {codigoPago && (
            <p className="text-sm text-gray-600 mt-1">
              Código de pago: {codigoPago}
            </p>
          )}
          {factura.pagos?.map((pago, index) => (
            <p key={index} className="text-sm text-gray-600 mt-1">
              Pago de Bs. {pago.montopagado.toFixed(2)} el{' '}
              {new Date(pago.fechapago).toLocaleDateString('es-BO')}
              {pago.codigo_pago_stripe && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Stripe: {pago.codigo_pago_stripe}
                </span>
              )}
            </p>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={descargarPDF}
          className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          📥 Descargar PDF
        </button>
        <button
          onClick={enviarPorEmail}
          className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          📧 Enviar por Email
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
          >
            Cerrar
          </button>
        )}
      </div>

      {/* Nota Legal */}
      <div className="mt-6 pt-4 border-t text-xs text-gray-500 text-center">
        <p>Esta factura es válida sin firma ni sello</p>
        <p>Gracias por su preferencia</p>
      </div>
    </div>
  );
};

export default VistaFactura;
