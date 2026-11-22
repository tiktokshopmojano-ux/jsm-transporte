// src/components/driver/DriverHistoryModal.jsx
// Modal para consulta do histórico de viagens realizadas pelo motorista

import React from 'react';
import { Modal } from '../common/Modal';
import { Icon } from '../common/Icons';

export const DriverHistoryModal = ({ isOpen, onClose, trips = [] }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Minhas Viagens Concluídas"
      subtitle="Histórico pessoal de rotas sincronizadas com a central"
    >
      <div className="space-y-3">
        {trips.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <Icon name="history" className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhuma viagem finalizada encontrada para este motorista.</p>
          </div>
        ) : (
          trips.map((trip) => (
            <div
              key={trip.id}
              className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="font-bold text-cyan-400">Romaneio #{trip.romaneioId || '---'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {trip.status || 'Concluída'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Destino:</span>
                  <strong className="text-white">{trip.romaneioCidade || 'SÃO PAULO'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Data:</span>
                  <span>{trip.data || trip.romaneioDataDocumento || 'Hoje'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Peso Bruto:</span>
                  <span>{trip.romaneioPesoBruto || '---'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Volumes:</span>
                  <span>{trip.romaneioQtdTotal ? `${trip.romaneioQtdTotal} un` : '---'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
