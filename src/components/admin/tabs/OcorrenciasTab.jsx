// src/components/admin/tabs/OcorrenciasTab.jsx
// Central de ocorrências em tempo real enviadas pelos motoristas na estrada

import React from 'react';
import { Icon } from '../../common/Icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export const OcorrenciasTab = ({ ocorrencias = [], onShowToast }) => {
  const handleResolver = async (ocorrenciaId) => {
    try {
      await updateDoc(doc(db, 'ocorrencias', ocorrenciaId), {
        status: 'Resolvida',
        resolvidoEm: new Date().toISOString()
      });

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Ocorrência Finalizada',
          desc: 'Status atualizado para Resolvida.'
        });
      }
    } catch (err) {
      console.error('Erro ao resolver ocorrência:', err);
      alert('Erro ao atualizar no Firebase.');
    }
  };

  return (
    <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Icon name="alert-triangle" className="w-5 h-5 text-amber-400" />
            Central de Ocorrências e Alertas ({ocorrencias.length})
          </h3>
          <p className="text-xs text-slate-400">Incidentes reportados pela frota durante a operação</p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {ocorrencias.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Icon name="check" className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
            Nenhuma ocorrência registrada no momento. Toda a frota operando normalmente!
          </div>
        ) : (
          ocorrencias.map((oc) => {
            const isAberta = oc.status === 'Aberta';

            return (
              <div
                key={oc.id}
                className={`p-4 rounded-xl border transition-all ${
                  isAberta
                    ? 'bg-[#0B1329] border-amber-500/40 shadow-sm'
                    : 'bg-[#0B1329]/60 border-slate-800 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{oc.tipo}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        oc.gravidade === 'Alta'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : oc.gravidade === 'Média'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      Prioridade {oc.gravidade}
                    </span>
                    <span className="text-[11px] text-slate-400">• Status: <strong>{oc.status}</strong></span>
                  </div>

                  <span className="text-xs text-slate-400">
                    {oc.data} às {oc.hora || 'Agora'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-300">
                    Motorista: <strong className="text-white">{oc.motorista}</strong> • Placa:{' '}
                    <strong className="text-cyan-400">{oc.placa}</strong>
                  </p>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-200">
                    <p className="font-medium">{oc.descricao}</p>
                    {oc.fotoArquivo && oc.fotoArquivo !== 'Sem foto anexada' && (
                      <p className="text-[11px] text-cyan-400 mt-2 flex items-center gap-1 font-mono">
                        <Icon name="camera" className="w-3.5 h-3.5" /> Foto: {oc.fotoArquivo}
                      </p>
                    )}
                  </div>

                  {isAberta && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleResolver(oc.id)}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Icon name="check" className="w-3.5 h-3.5" />
                        Marcar como Resolvida
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
