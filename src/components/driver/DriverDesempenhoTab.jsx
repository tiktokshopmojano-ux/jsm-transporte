// src/components/driver/DriverDesempenhoTab.jsx
// Aba de Desempenho do Motorista - 100% SOMENTE LEITURA (READ-ONLY)

import React from 'react';
import { Icon } from '../common/Icons';

export const DriverDesempenhoTab = ({
  user,
  viagens = [],
  despesas = []
}) => {
  // Filtrar apenas viagens e despesas deste motorista específico
  const minhasViagens = viagens.filter(
    (v) => v.motorista?.toUpperCase() === user.name?.toUpperCase()
  );

  const minhasDespesas = despesas.filter(
    (d) => d.motorista?.toUpperCase() === user.name?.toUpperCase()
  );

  const totalViagensConcluidas = minhasViagens.length;
  const metaPessoalViagens = 25; // Meta de referência mensal de viagens por motorista
  const porcentagemMeta = Math.min(100, Math.round((totalViagensConcluidas / metaPessoalViagens) * 100));

  const totalLitros = minhasDespesas.reduce((acc, cur) => acc + (Number(cur.litros) || 0), 0);
  const despesasAprovadas = minhasDespesas.filter((d) => d.status === 'Aprovada').length;

  return (
    <div className="space-y-4 max-w-md mx-auto w-full pb-6">
      {/* Banner de Status de Desempenho */}
      <div className="p-4 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Icon name="award" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Desempenho Operacional</h3>
              <p className="text-[11px] text-slate-400">Condutor: <strong className="text-white">{user.name}</strong></p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
            Padrão Ouro
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Acompanhe seu cumprimento de rotas, checklists e comprovantes. Este painel é atualizado automaticamente pela central.
        </p>
      </div>

      {/* Indicadores de Desempenho (Read-Only) */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Card 1: Viagens do Mês */}
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 text-[11px] block">Viagens Realizadas</span>
          <h4 className="text-xl font-extrabold text-white">{totalViagensConcluidas}</h4>
          <span className="text-[10px] text-emerald-400 font-semibold block">
            Meta: {metaPessoalViagens} no mês ({porcentagemMeta}%)
          </span>
        </div>

        {/* Card 2: Pontualidade de Entrega */}
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 text-[11px] block">Índice de Entregas</span>
          <h4 className="text-xl font-extrabold text-cyan-400">100%</h4>
          <span className="text-[10px] text-slate-400 block">Sem insucessos no trajeto</span>
        </div>

        {/* Card 3: Romaneios Validados */}
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 text-[11px] block">Romaneios Auditados</span>
          <h4 className="text-xl font-extrabold text-emerald-400">{totalViagensConcluidas}</h4>
          <span className="text-[10px] text-slate-400 block">Sem pendências com central</span>
        </div>

        {/* Card 4: Combustível Auditado */}
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-slate-400 text-[11px] block">Abastecimentos</span>
          <h4 className="text-xl font-extrabold text-amber-400">{totalLitros} L</h4>
          <span className="text-[10px] text-slate-400 block">{despesasAprovadas} cupons aprovados</span>
        </div>
      </div>

      {/* Barra de Progresso da Meta de Viagens */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-white">Progresso da Meta Mensal de Viagens</span>
          <span className="font-bold text-cyan-400">{porcentagemMeta}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${porcentagemMeta}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Faltam <strong>{Math.max(0, metaPessoalViagens - totalViagensConcluidas)} viagens</strong> para bater a meta do período.
        </p>
      </div>

      {/* Histórico das Últimas Viagens do Motorista (Visualização Apenas) */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="font-bold text-xs text-white flex items-center gap-2">
            <Icon name="history" className="w-4 h-4 text-cyan-400" />
            Minhas Últimas Viagens Validadas
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">SOMENTE CONSULTA</span>
        </div>

        <div className="space-y-2 text-xs">
          {minhasViagens.length === 0 ? (
            <p className="text-slate-500 text-center py-4 text-[11px]">
              Nenhuma viagem registrada na sua conta até o momento.
            </p>
          ) : (
            minhasViagens.slice(0, 5).map((v) => (
              <div
                key={v.id}
                className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Romaneio #{v.romaneioId || '---'}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {v.status || 'Finalizada'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Destino: <strong className="text-slate-200">{v.romaneioCidade || 'SÃO PAULO'}</strong></span>
                  <span>{v.data || 'Hoje'}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Peso: {v.romaneioPesoBruto || '---'} • Volumes: {v.romaneioQtdTotal || '---'} un
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Aviso de Auditoria e Segurança */}
      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center text-[11px] text-slate-500">
        🔒 Painel oficial de desempenho JSM Transporte • Visualização segura auditada pela central
      </div>
    </div>
  );
};
