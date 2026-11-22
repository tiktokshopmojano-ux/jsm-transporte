// src/components/admin/tabs/MetasTab.jsx
// Monitoramento de metas operacionais e eficiência de consumo

import React from 'react';
import { Icon } from '../../common/Icons';

export const MetasTab = ({ totalViagens = 0 }) => {
  return (
    <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Icon name="target" className="w-5 h-5 text-rose-400" />
          Metas Operacionais do Mês
        </h3>
        <p className="text-xs text-slate-400">Acompanhamento de pontualidade, rotas e metas de consumo</p>
      </div>

      <div className="space-y-4">
        {/* Meta 1: Dias Úteis */}
        <div className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-semibold">Jornada Operacional (Meta: 26 dias/mês)</span>
            <span className="text-emerald-400 font-bold">18 Dias (69%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[69%] h-full bg-emerald-500 rounded-full transition-all"></div>
          </div>
        </div>

        {/* Meta 2: Eficiência de Combustível */}
        <div className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-semibold">Eficiência de Combustível (Meta: &ge; 10 km/L)</span>
            <span className="text-cyan-400 font-bold">9.8 km/L (98% da meta)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[98%] h-full bg-cyan-500 rounded-full transition-all"></div>
          </div>
        </div>

        {/* Meta 3: Pontualidade de Entrega */}
        <div className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-semibold">Índice de Pontualidade nas Entregas (Meta: &ge; 95%)</span>
            <span className="text-emerald-400 font-bold">97.4% (Superada)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[97%] h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
