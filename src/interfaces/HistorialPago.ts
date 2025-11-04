// src/interfaces/HistorialPago.ts

export interface HistorialPago {
  id: number;
  codigo: string;
  plan_tratamiento: number;
  presupuesto: number | null;
  monto: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' | 'qr';
  estado: 'pendiente' | 'completado' | 'cancelado' | 'reembolsado';
  fecha_pago: string;
  numero_comprobante: string | null;
  numero_transaccion: string | null;
  notas: string | null;
  registrado_por: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface HistorialPagoCreate {
  plan_tratamiento: number;
  presupuesto?: number | null;
  monto: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' | 'qr';
  numero_comprobante?: string;
  numero_transaccion?: string;
  notas?: string;
}

export interface ResumenPagos {
  plan_tratamiento: {
    id: number;
    codigo: string;
    descripcion: string;
  };
  total_presupuesto: number;
  total_pagado: number;
  saldo_pendiente: number;
  pagos: HistorialPago[];
}

export const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'qr', label: 'Código QR' },
] as const;

export const ESTADOS_PAGO = {
  completado: { label: 'Completado', color: 'green', icon: '✅' },
  pendiente: { label: 'Pendiente', color: 'yellow', icon: '⏳' },
  cancelado: { label: 'Cancelado', color: 'red', icon: '❌' },
  reembolsado: { label: 'Reembolsado', color: 'orange', icon: '↩️' },
} as const;
