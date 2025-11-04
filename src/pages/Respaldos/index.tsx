import React from 'react';
import EstadisticasRespaldos from './EstadisticasRespaldos';
import RespaldosList from './RespaldosList';

const RespaldosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <EstadisticasRespaldos />
      <RespaldosList />
    </div>
  );
};

export default RespaldosPage;
