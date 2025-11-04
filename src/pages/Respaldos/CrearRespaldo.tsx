import React, { useState } from 'react';
import respaldoService from '../../services/respaldoService';

interface CrearRespaldoProps {
  onClose: () => void;
  onCreated: () => void;
}

const CrearRespaldo: React.FC<CrearRespaldoProps> = ({ onClose, onCreated }) => {
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await respaldoService.crearRespaldoManual({
        descripcion: descripcion.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onCreated();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear respaldo');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              💾 Crear Respaldo Manual
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-white hover:text-gray-200 disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
              ✅ Respaldo creado exitosamente. Se está procesando en segundo plano.
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">
            Se creará un respaldo completo de todos los datos de tu clínica.
            Este proceso puede tardar varios segundos dependiendo de la cantidad de información.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Respaldo antes de actualización importante"
              rows={3}
              disabled={loading || success}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Agrega una nota para identificar este respaldo
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creando...
                </>
              ) : (
                <>
                  💾 Crear Respaldo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearRespaldo;
