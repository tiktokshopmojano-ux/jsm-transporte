// src/components/admin/tabs/MetasTab.jsx
// Monitoramento dinâmico de metas operacionais e financeiras (Mês e Ano)

import React from 'react';
import { Icon } from '../../common/Icons';

export const MetasTab = ({
  totalRevenue = 0,
  totalViagens = 0,
  metasConfig = {},
  onSelectTab
}) => {
  const metaMes = metasConfig.metaFaturamentoMes || 120000;
  const metaAno = metasConfig.metaFaturamentoAno || 1500000;
  const metaViagens = metasConfig.metaViagensMes || 180;
  const metaConsumo = metasConfig.metaConsumoKmL || 10.0;
  const diasUteisMeta = metasConfig.diasUteisMes || 26;

  // Cálculos percentuais
  const progressoMes = Math.min(100, Math.round((totalRevenue / metaMes) * 100));
  const progressoAno = Math.min(100, Math.round((totalRevenue / metaAno) * 100));
  const progressoViagens = Math.min(100, Math.round((totalViagens / metaViagens) * 100));

  return (
    <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Icon name="target" className="w-5 h-5 text-rose-400" />
            Metas Operacionais e Financeiras (Mês e Ano)
          </h3>
          <p className="text-xs text-slate-400">
            Acompanhamento em tempo real dos objetivos corporativos da JSM Transporte
          </p>
        </div>

        {onSelectTab && (
          <button
            type="button"
            onClick={() => onSelectTab('configuracoes')}
            className="py-1.5 px-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Icon name="settings" className="w-3.5 h-3.5" />
            Configurar Metas
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Meta Financeira 1: Mês Atual */}
        <div className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl space-y-2.5">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-400 font-semibold">Meta de Faturamento do Mês</span>
            <span className="text-cyan-400 font-extrabold text-sm">{progressoMes}%</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Realizado: <strong>R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            <span>Meta: <strong>R$ {metaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressoMes}%` }}
            />
          </div>
        </div>

        {/* Meta Financeira 2: Ano Vigente */}
        <div className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl space-y-2.5">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-400 font-semibold">Meta de Faturamento Anual</span>
            <span className="text-emerald-400 font-extrabold text-sm">{progressoAno}%</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Acumulado: <strong>R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            <span>Meta Anual: <strong>R$ {metaAno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progressoAno}%` }}
            />
          </div>
        </div>

        {/* Meta Operacional 3: Viagens no Mês */}
        <div className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl space-y-2.5">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-400 font-semibold">Viagens Concluídas no Mês</span>
            <span className="text-purple-400 font-extrabold text-sm">{progressoViagens}%</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Concluídas: <strong>{totalViagens} viagens</strong></span>
            <span>Meta: <strong>{metaViagens} viagens</strong></span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressoViagens}%` }}
            />
          </div>
        </div>

        {/* Meta Operacional 4: Eficiência de Combustível */}
        <div className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl space-y-2.5">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-400 font-semibold">Eficiência de Combustível da Frota</span>
            <span className="text-amber-400 font-extrabold text-sm">9.8 km/L</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Média Atual: <strong>9.8 km/L</strong></span>
            <span>Meta: <strong>&ge; {metaConsumo} km/L</strong></span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[98%] h-full bg-amber-500 rounded-full transition-all" />
          </div>
        </div>

        {/* Meta Operacional 5: Dias Úteis Trabalhados */}
        <div className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl space-y-2.5 md:col-span-2">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-400 font-semibold">Jornada Operacional do Mês (Dias Úteis)</span>
            <span className="text-emerald-400 font-bold">18 de {diasUteisMeta} Dias (69%)</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[69%] h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};
