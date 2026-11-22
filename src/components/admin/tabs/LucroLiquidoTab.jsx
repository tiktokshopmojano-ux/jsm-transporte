// src/components/admin/tabs/LucroLiquidoTab.jsx
// Aba de Lucro Líquido Real: DRE Operacional da Empresa após dedução de todas as obrigações

import React from 'react';
import { Icon } from '../../common/Icons';

export const LucroLiquidoTab = ({
  totalRevenue = 0,
  viagens = [],
  despesas = [],
  despesasFixasConfig = {},
  onSelectTab
}) => {
  // Valores das obrigações configuradas
  const prestacaoFurgao = Number(despesasFixasConfig.prestacaoFurgao ?? 7000);
  const seguroMaster = Number(despesasFixasConfig.seguroMaster ?? 680);
  const rastreamento = Number(despesasFixasConfig.rastreamento ?? 70);
  const ipva = Number(despesasFixasConfig.ipva ?? 550);
  const salarioMotorista = Number(despesasFixasConfig.salarioMotorista ?? 3500);
  const salarioAjudante = Number(despesasFixasConfig.salarioAjudante ?? 1800);
  const impostos = Number(despesasFixasConfig.impostos ?? 850);

  // Combustível Diesel real dos abastecimentos (ou ajuste manual se configurado)
  const totalDieselRegistrado = despesas
    .filter((d) => d.status !== 'Rejeitada')
    .reduce((acc, cur) => acc + (Number(cur.valor) || 0), 0);

  const dieselEfetivo = despesasFixasConfig.usarDieselManual
    ? Number(despesasFixasConfig.dieselAjusteManual ?? 0)
    : totalDieselRegistrado;

  // Total das obrigações
  const totalObrigacoes =
    prestacaoFurgao +
    dieselEfetivo +
    seguroMaster +
    rastreamento +
    ipva +
    salarioMotorista +
    salarioAjudante +
    impostos;

  // Lucro Líquido Real da Empresa
  const lucroLiquidoReal = totalRevenue - totalObrigacoes;
  const margemLiquida = totalRevenue > 0 ? ((lucroLiquidoReal / totalRevenue) * 100).toFixed(1) : 0;

  // Reserva de Expansão (20% sobre faturamento)
  const percentualExp = Number(despesasFixasConfig.percentualExpansao || 20);
  const reservaExpansao = (totalRevenue * percentualExp) / 100;

  // Saldo Líquido Final para os Sócios
  const saldoFinalSocios = Math.max(0, lucroLiquidoReal - reservaExpansao);

  // Exportar DRE para CSV
  const exportarDRE = () => {
    const cabecalho = ['Descricao', 'Tipo', 'Valor_RS'];
    const linhas = [
      ['Faturamento Bruto Real', 'Receita (+)', totalRevenue.toFixed(2)],
      ['Prestacao Furgao Master', 'Despesa Fixa (-)', (-prestacaoFurgao).toFixed(2)],
      ['Combustivel Diesel', 'Despesa Operacional (-)', (-dieselEfetivo).toFixed(2)],
      ['Seguro Master', 'Despesa Fixa (-)', (-seguroMaster).toFixed(2)],
      ['Rastreamento Interno', 'Despesa Fixa (-)', (-rastreamento).toFixed(2)],
      ['IPVA Provisao', 'Despesa Fixa (-)', (-ipva).toFixed(2)],
      ['Salario Motorista', 'Despesa com Equipe (-)', (-salarioMotorista).toFixed(2)],
      ['Ajudante Entregas', 'Despesa com Equipe (-)', (-salarioAjudante).toFixed(2)],
      ['Impostos DAS Simples', 'Tributos (-)', (-impostos).toFixed(2)],
      ['TOTAL DE OBRIGACOES', 'Total Despesas (-)', (-totalObrigacoes).toFixed(2)],
      ['LUCRO LIQUIDO REAL', 'Resultado (=)', lucroLiquidoReal.toFixed(2)],
      ['Reserva Expansao (20%)', 'Retencao (-)', (-reservaExpansao).toFixed(2)],
      ['SALDO FINAL PARA SOCIOS', 'Disponivel (=)', saldoFinalSocios.toFixed(2)]
    ];

    const conteudoCSV = [cabecalho.join(';'), ...linhas.map((e) => e.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DRE_Lucro_Liquido_JSM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. CARDS DE DESTAQUE DO LUCRO LÍQUIDO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Faturamento Bruto */}
        <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Faturamento Bruto</span>
            <Icon name="trending-up" className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-2">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Total gerado por {viagens.length} viagens concluídas
          </p>
        </div>

        {/* Total de Obrigações / Despesas Fixas */}
        <div className="bg-[#111C38] border border-amber-900/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total das Obrigações</span>
            <Icon name="fuel" className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-amber-400 mt-2">
            - R$ {totalObrigacoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-400">Custos fixos, diesel e equipe</span>
            {onSelectTab && (
              <button
                type="button"
                onClick={() => onSelectTab('despesas')}
                className="text-[11px] text-amber-400 hover:underline font-semibold"
              >
                Ajustar valores →
              </button>
            )}
          </div>
        </div>

        {/* LUCRO LÍQUIDO REAL */}
        <div className={`border rounded-2xl p-5 shadow-xl relative overflow-hidden ${
          lucroLiquidoReal >= 0
            ? 'bg-gradient-to-br from-emerald-950/60 to-[#111C38] border-emerald-500/50 shadow-emerald-950/20'
            : 'bg-gradient-to-br from-red-950/60 to-[#111C38] border-red-500/50 shadow-red-950/20'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <span className={lucroLiquidoReal >= 0 ? 'text-emerald-300' : 'text-red-300'}>
              Lucro Líquido Real
            </span>
            <Icon name="wallet" className={`w-5 h-5 ${lucroLiquidoReal >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
          <h2 className={`text-3xl font-extrabold mt-2 ${
            lucroLiquidoReal >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            R$ {lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-xs text-slate-300 mt-2 flex items-center justify-between">
            <span>Margem Líquida Real:</span>
            <strong className={`font-bold ${lucroLiquidoReal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {margemLiquida}%
            </strong>
          </p>
        </div>
      </div>

      {/* 2. DRE COMPLETO (DEMONSTRATIVO DE RESULTADO DO EXERCÍCIO) */}
      <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Icon name="file-text" className="w-5 h-5 text-cyan-400" />
              DRE Operacional • O que a Empresa Realmente Recebe
            </h3>
            <p className="text-xs text-slate-400">
              Detalhamento de cada saída após quitar as obrigações da empresa no período
            </p>
          </div>

          <button
            type="button"
            onClick={exportarDRE}
            className="py-2 px-3.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Icon name="download" className="w-4 h-4" />
            Exportar DRE em Planilha
          </button>
        </div>

        {/* Tabela Estruturada do DRE */}
        <div className="space-y-2 text-xs">
          {/* Receita Bruta */}
          <div className="p-3.5 bg-[#0B1329] border border-slate-800 rounded-xl flex items-center justify-between font-bold">
            <div className="flex items-center gap-2 text-white">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>(+) Faturamento Bruto Operacional (Viagens)</span>
            </div>
            <span className="text-cyan-400 font-extrabold text-sm">
              + R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Seção de Deduções / Despesas Fixas */}
          <div className="p-3.5 bg-[#0B1329] border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-slate-800/80 pb-2">
              <span>(-) Obrigações da Aba de Despesas Fixas</span>
              <span className="text-amber-400 font-bold">
                - R$ {totalObrigacoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-1.5 pl-2 text-slate-300 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span>Prestação Furgão Master</span>
                <span className="text-red-300 font-mono">- R$ {prestacaoFurgao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span>Combustível Diesel (Abastecimentos)</span>
                <span className="text-red-300 font-mono">- R$ {dieselEfetivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span>Seguro Master</span>
                <span className="text-red-300 font-mono">- R$ {seguroMaster.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span>Rastreamento Interno</span>
                <span className="text-red-300 font-mono">- R$ {rastreamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span>Provisão IPVA</span>
                <span className="text-red-300 font-mono">- R$ {ipva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span>Custo Motorista</span>
                <span className="text-red-300 font-mono">- R$ {salarioMotorista.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span>Custo Ajudante</span>
                <span className="text-red-300 font-mono">- R$ {salarioAjudante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between py-1">
                <span>Impostos Estimados (DAS / Simples)</span>
                <span className="text-red-300 font-mono">- R$ {impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Linha de Lucro Líquido Real */}
          <div className="p-4 bg-[#0B1329] border border-emerald-500/40 rounded-xl flex items-center justify-between font-bold">
            <div className="flex items-center gap-2 text-emerald-300">
              <Icon name="check" className="w-4 h-4 text-emerald-400" />
              <span className="text-sm">(=) LUCRO LÍQUIDO REAL DA EMPRESA</span>
            </div>
            <span className={`text-base font-extrabold ${lucroLiquidoReal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {lucroLiquidoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Reserva de Expansão e Saldo Final dos Sócios */}
          <div className="p-3.5 bg-gradient-to-r from-orange-950/20 to-[#0B1329] border border-orange-800/40 rounded-xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-orange-300">
                (-) Provisão Cofre de Expansão ({percentualExp}% do Faturamento)
              </p>
              <p className="text-[10px] text-slate-400">
                Reserva estratégica para entrada de novo caminhão e fundo de emergência
              </p>
            </div>
            <span className="text-orange-400 font-bold">
              - R$ {reservaExpansao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Saldo Líquido Disponível para Retirada */}
          <div className="p-4 bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-[#0B1329] border border-cyan-500/50 rounded-xl flex items-center justify-between font-extrabold">
            <div>
              <p className="text-sm text-cyan-300">(=) SALDO LÍQUIDO DISPONÍVEL PARA OS SÓCIOS</p>
              <p className="text-[11px] text-slate-400 font-normal">Valor 100% livre em caixa após despesas e reserva</p>
            </div>
            <span className="text-lg sm:text-xl text-cyan-400">
              R$ {saldoFinalSocios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
