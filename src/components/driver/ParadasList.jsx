// src/components/driver/ParadasList.jsx
// Gerenciamento dinâmico de paradas e entregas da rota do motorista com navegação GPS

import React, { useState } from 'react';
import { Icon } from '../common/Icons';

export const ParadasList = ({ paradasIniciais = [], onParadaAtualizada }) => {
  const [paradas, setParadas] = useState(
    paradasIniciais.length > 0
      ? paradasIniciais
      : [
          {
            id: 1,
            cliente: 'Supermercado Nova Esperança',
            endereco: 'Av. Celso Garcia, 1200 - Brás, São Paulo - SP',
            volumes: 28,
            peso: '250 kg',
            status: 'Concluída'
          },
          {
            id: 2,
            cliente: 'Restaurante Sabor da Terra',
            endereco: 'Rua Vergueiro, 3180 - Vila Mariana, São Paulo - SP',
            volumes: 15,
            peso: '140 kg',
            status: 'Em Trânsito'
          },
          {
            id: 3,
            cliente: 'Hortifruti Bom Preço',
            endereco: 'Rua Teodoro Sampaio, 840 - Pinheiros, São Paulo - SP',
            volumes: 34,
            peso: '310 kg',
            status: 'Pendente'
          },
          {
            id: 4,
            cliente: 'Padaria & Confeitaria Estrela',
            endereco: 'Av. Cupecê, 2450 - Cidade Ademar, São Paulo - SP',
            volumes: 20,
            peso: '173 kg',
            status: 'Pendente'
          }
        ]
  );

  const atualizarStatus = (id, novoStatus) => {
    const atualizadas = paradas.map((p) => (p.id === id ? { ...p, status: novoStatus } : p));
    setParadas(atualizadas);
    if (onParadaAtualizada) {
      onParadaAtualizada(atualizadas);
    }
  };

  const abrirGps = (endereco) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    window.open(url, '_blank');
  };

  const concluidas = paradas.filter((p) => p.status === 'Concluída').length;
  const porcentagem = Math.round((concluidas / paradas.length) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Icon name="navigation" className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm text-white">Paradas da Rota ({concluidas}/{paradas.length})</h3>
        </div>
        <span className="text-xs font-bold text-cyan-400">{porcentagem}% Concluído</span>
      </div>

      {/* Barra de progresso */}
      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${porcentagem}%` }}
        />
      </div>

      {/* Lista de Paradas */}
      <div className="space-y-2.5 pt-1">
        {paradas.map((item, index) => {
          const isConcluida = item.status === 'Concluída';
          const isEmTransito = item.status === 'Em Trânsito';

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all ${
                isConcluida
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                  : isEmTransito
                    ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm shadow-cyan-500/5'
                    : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isConcluida
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isEmTransito
                          ? 'bg-cyan-500 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isConcluida ? '✓' : index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white leading-snug">{item.cliente}</h4>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5 flex items-center gap-1">
                      <Icon name="map-pin" className="w-3 h-3 text-slate-500 shrink-0" />
                      {item.endereco}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Volumes: <strong className="text-slate-300">{item.volumes} cx</strong> • Peso: <strong className="text-slate-300">{item.peso}</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => abrirGps(item.endereco)}
                  title="Abrir no Google Maps / Waze"
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg shrink-0 border border-slate-700 transition-colors"
                >
                  <Icon name="navigation" className="w-4 h-4" />
                </button>
              </div>

              {/* Botões de Ação de Entrega */}
              <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60">
                {item.status !== 'Concluída' && (
                  <>
                    {item.status !== 'Em Trânsito' && (
                      <button
                        type="button"
                        onClick={() => atualizarStatus(item.id, 'Em Trânsito')}
                        className="py-1 px-2.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 rounded-lg text-[11px] font-semibold transition-all"
                      >
                        Iniciar Deslocamento
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => atualizarStatus(item.id, 'Concluída')}
                      className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center gap-1"
                    >
                      <Icon name="check" className="w-3.5 h-3.5" />
                      Confirmar Entrega
                    </button>
                  </>
                )}
                {isConcluida && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Icon name="check" className="w-3.5 h-3.5" /> Entrega Concluída com Sucesso
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
