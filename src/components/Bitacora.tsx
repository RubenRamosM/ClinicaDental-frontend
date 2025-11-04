// src/components/Bitacora.tsx
import React, { useState } from 'react';
import TablaBitacora from './auditoria/TablaBitacora.tsx';
import DetalleBitacora from './auditoria/DetalleBitacora.tsx';
import FiltrosBitacora from './auditoria/FiltrosBitacora.tsx';
import type { LogAuditoria } from '../services/auditoriaService';
import type { FiltrosBitacora as IFiltrosBitacora } from '../types/auditoria';
import auditoriaService from '../services/auditoriaService';

const Bitacora: React.FC = () => {
    const [registroSeleccionado, setRegistroSeleccionado] = useState<LogAuditoria | null>(null);
    const [filtros, setFiltros] = useState<IFiltrosBitacora>({});

    const handleExportarCSV = async () => {
        try {
            const resultado = await auditoriaService.listarLogs(filtros);
            const registros = Array.isArray(resultado) ? resultado : resultado.results || [];
            
            if (registros.length === 0) {
                alert('No hay registros para exportar con los filtros aplicados');
                return;
            }

            // Crear CSV manual
            const headers = ['ID', 'Fecha/Hora', 'Usuario', 'Acción', 'Descripción', 'Modelo', 'IP'];
            const rows = registros.map(r => [
                r.id,
                r.fecha_hora,
                r.usuario_nombre || 'Sistema',
                r.accion,
                r.descripcion,
                r.modelo || '-',
                r.ip_address || '-'
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `auditoria-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('Error al exportar los registros');
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">📊 Auditoría y Bitácora del Sistema</h2>
                    <p className="text-gray-600 mt-1">
                        Registro completo de todas las acciones realizadas en el sistema
                    </p>
                </div>
                <button
                    onClick={handleExportarCSV}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center space-x-2"
                >
                    <span>📥</span>
                    <span>Exportar CSV</span>
                </button>
            </div>

            {/* Filtros */}
            <FiltrosBitacora onFiltrosChange={setFiltros} />

            {/* Tabla */}
            <TablaBitacora
                filtros={filtros}
                onVerDetalle={setRegistroSeleccionado}
            />

            {/* Modal de Detalle */}
            {registroSeleccionado && (
                <DetalleBitacora
                    registro={registroSeleccionado}
                    onCerrar={() => setRegistroSeleccionado(null)}
                />
            )}
        </div>
    );
};

export default Bitacora;







