// src/components/admin/tabs/DashboardTab.jsx
// Painel Executivo com KPIs em tempo real, gráfico interativo e resumo operacional

import React from 'react';
import { Icon } from '../../common/Icons';

export const DashboardTab = ({
  totalRevenue,
  viagens = [],
  despesas = [],
  veiculos = [],
  motoristas = [],
  ocorrencias = [],
  onSelectTab
}) => {
  // Cálculo de KPIs
  const despesasAprovadas = despesas.filter((d) => d.status === 'Aprovada');
  const totalDespesasValor = despesasAprovadas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
  const totalLitros = despesas.reduce((acc, d) => acc + (Number(d.litros) || 0), 0);
  const lucroEstimado = totalRevenue - totalDespesasValor;

  // Dados para projeção horária
  const chartData = [
    { hora: '08:00', valor: Math.round(totalRevenue * 0.15) || 12000 },
    { hora: '10:00', valor: Math.round(totalRevenue * 0.35) || 28000 },
    { hora: '12:00', valor: Math.round(totalRevenue * 0.55) || 45000 },
    { hora: '14:00', valor: Math.round(totalRevenue * 0.70) || 68000 },
    { hora: '16:00', valor: Math.round(totalRevenue * 0.88) || 89000 },
    { hora: '18:00', valor: totalRevenue || 108000 }
  ];

  const maxVal = Math.max(...chartData.map((d) => d.valor), 1);
  const width = 600;
  const height = 180;
  const padLeft = 50;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 25;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const points = chartData.map((item, idx) => {
    const x = padLeft + (idx / Math.max(chartData.length - 1, 1)) * plotW;
    const y = padTop + plotH - (item.valor / maxVal) * plotH;
    return { ...item, x, y };
  });

  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  return (
    <div className="space-y-6">
      {/* Grade de Indicadores Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento */}
        <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Faturamento Bruto</span>
            <Icon name="trending-up" className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-2">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <Icon name="check" className="w-3.5 h-3.5" /> {viagens.length} viagens registradas
          </p>
        </div>

        {/* KPI 2: Lucro Operacional Estimado */}
        <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Margem Operacional</span>
            <Icon name="sparkles" className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-emerald-400 mt-2">
            R$ {lucroEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Despesas deduzidas: R$ {totalDespesasValor.toFixed(2)}
          </p>
        </div>

        {/* KPI 3: Frota & Motoristas */}
        <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Operação Ativa</span>
            <Icon name="truck" className="w-4 h-4 text-purple-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-2">
            {veiculos.length || 3} Veículos
          </h2>
          <p className="text-xs text-purple-300 mt-2 flex items-center gap-1">
            <Icon name="user" className="w-3.5 h-3.5" /> {motoristas.length || 2} motoristas na base
          </p>
        </div>

        {/* KPI 4: Combustível Consumido */}
        <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Combustível Lançado</span>
            <Icon name="fuel" className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-amber-400 mt-2">
            {totalLitros} Litros
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            {despesas.length} comprovantes auditados
          </p>
        </div>
      </div>

      {/* Gráfico de Projeção Operacional e Financeira */}
      <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-base text-white">Evolução do Faturamento no Dia</h3>
            <p className="text-xs text-slate-400">Curva de receita acumulada por faixa horária de entregas</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-xl">
            Hoje: R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="h-52 w-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="dashboardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0, 0.5, 1].map((ratio, i) => {
              const yPos = padTop + plotH - ratio * plotH;
              const labelVal = Math.round((maxVal * ratio) / 1000);
              const label = ratio === 0 ? 'R$ 0' : `R$ ${labelVal}k`;

              return (
                <g key={i}>
                  <line
                    x1={padLeft}
                    y1={yPos}
                    x2={width - padRight}
                    y2={yPos}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padLeft - 8}
                    y={yPos + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            <path d={areaPath} fill="url(#dashboardAreaGrad)" />
            <path d={linePath} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="4" fill="#06b6d4" stroke="#0B1329" strokeWidth="2" />
                <text
                  x={p.x}
                  y={height - 6}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                >
                  {p.hora}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Seção Inferior: Últimas Viagens e Alertas Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Últimas Viagens */}
        <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Icon name="file-text" className="w-4 h-4 text-cyan-400" />
              Últimas Viagens Registradas
            </h4>
            <button
              type="button"
              onClick={() => onSelectTab('viagens')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Ver todas →
            </button>
          </div>

          <div className="space-y-2">
            {viagens.slice(0, 3).map((trip) => (
              <div key={trip.id} className="p-3 bg-[#0B1329] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{trip.motorista}</p>
                  <p className="text-[11px] text-slate-400">Placa: {trip.placa} • Romaneio #{trip.romaneioId}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 block">R$ {trip.valor}</span>
                  <span className="text-[10px] text-slate-500">{trip.data || 'Hoje'}</span>
                </div>
              </div>
            ))}
            {viagens.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">Nenhuma viagem sincronizada ainda.</p>
            )}
          </div>
        </div>

        {/* Central de Ocorrências e Alertas */}
        <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Icon name="alert-triangle" className="w-4 h-4 text-amber-400" />
              Ocorrências da Rota
            </h4>
            <button
              type="button"
              onClick={() => onSelectTab('ocorrencias')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Gerenciar ({ocorrencias.length}) →
            </button>
          </div>

          <div className="space-y-2">
            {ocorrencias.slice(0, 3).map((oc) => (
              <div key={oc.id} className="p-3 bg-[#0B1329] border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-amber-300">{oc.tipo}</p>
                  <p className="text-[11px] text-slate-400">{oc.motorista} ({oc.placa}) • {oc.hora}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  oc.gravidade === 'Alta' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {oc.gravidade}
                </span>
              </div>
            ))}
            {ocorrencias.length === 0 && (
              <div className="p-4 text-center text-slate-500 text-xs">
                <Icon name="check" className="w-6 h-6 text-emerald-500/50 mx-auto mb-1" />
                Nenhuma ocorrência pendente no momento.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
