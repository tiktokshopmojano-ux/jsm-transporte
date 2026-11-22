// src/components/admin/tabs/ExpansaoTab.jsx
// Cofre estratégico de expansão da frota e investimentos futuros

import React from 'react';
import { Icon } from '../../common/Icons';

export const ExpansaoTab = ({ totalRevenue = 0 }) => {
  const cofreExpansao = totalRevenue * 0.20;

  return (
    <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Icon name="rocket" className="w-5 h-5 text-orange-400" />
          Planejamento de Expansão & Cofre Estratégico
        </h3>
        <p className="text-xs text-slate-400">Reserva de capital automática destinada a novos veículos e inovação</p>
      </div>

      <div className="p-6 bg-gradient-to-br from-orange-950/40 via-[#0B1329] to-[#0B1329] border border-orange-800/50 rounded-2xl text-center space-y-3">
        <span className="text-xs text-orange-300 font-bold uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
          Reserva de Expansão (20% do Faturamento Bruto)
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          R$ {cofreExpansao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h2>
        <p className="text-xs text-orange-200/80 max-w-md mx-auto">
          Fundo provisionado para aquisição de novos caminhões, manutenção pesada da frota e renovação de equipamentos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 bg-[#0B1329] border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 block">Objetivo 1:</span>
          <strong className="text-white block text-sm">Aquisição de 4º Caminhão 3/4</strong>
          <p className="text-slate-500 text-[11px]">Meta de acumulação para entrada e seguro: R$ 45.000,00</p>
        </div>

        <div className="p-3.5 bg-[#0B1329] border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 block">Objetivo 2:</span>
          <strong className="text-white block text-sm">Fundo de Emergência de Pneus & Mecânica</strong>
          <p className="text-slate-500 text-[11px]">Reserva líquida para socorro em trânsito: R$ 15.000,00</p>
        </div>
      </div>
    </div>
  );
};
