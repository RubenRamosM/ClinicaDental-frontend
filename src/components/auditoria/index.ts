// src/components/auditoria/index.ts

/**
 * 📊 EXPORTACIÓN CENTRALIZADA DE COMPONENTES DE AUDITORÍA
 * 
 * Permite importar todos los componentes desde un solo lugar:
 * import { TablaBitacora, DetalleBitacora, FiltrosBitacora } from './auditoria';
 */

export { default as TablaBitacora } from './TablaBitacora.tsx';
export { default as DetalleBitacora } from './DetalleBitacora.tsx';
export { default as FiltrosBitacora } from './FiltrosBitacora.tsx';

// Exportar tipos útiles
export type { LogAuditoria, FiltrosAuditoria } from '../../services/auditoriaService';
export type { RegistroBitacora, FiltrosBitacora as IFiltrosBitacora, ResumenBitacora } from '../../types/auditoria';
