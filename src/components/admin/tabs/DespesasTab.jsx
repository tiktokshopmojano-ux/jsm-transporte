// src/components/admin/tabs/DespesasTab.jsx
// Gestão de Despesas Fixas & Obrigações da Empresa (Furgão Master, Diesel, Seguro, IPVA, Equipe)

import React, { useState, useEffect } from 'react';
import { Icon } from '../../common/Icons';
import { Modal } from '../../common/Modal';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export const DespesasTab = ({
  despesas = [],
  despesasFixasConfig = {},
  onShowToast
}) => {
  // Valores das Despesas Fixas e Obrigações (com padrões solicitados)
  const [prestacaoFurgao, setPrestacaoFurgao] = useState(despesasFixasConfig.prestacaoFurgao ?? 7000);
  const [seguroMaster, setSeguroMaster] = useState(despesasFixasConfig.seguroMaster ?? 680);
  const [rastreamento, setRastreamento] = useState(despesasFixasConfig.rastreamento ?? 70);
  const [ipva, setIpva] = useState(despesasFixasConfig.ipva ?? 550);
  const [salarioMotorista, setSalarioMotorista] = useState(despesasFixasConfig.salarioMotorista ?? 3500);
  const [salarioAjudante, setSalarioAjudante] = useState(despesasFixasConfig.salarioAjudante ?? 1800);
  const [impostos, setImpostos] = useState(despesasFixasConfig.impostos ?? 850);
  const [dieselAjusteManual, setDieselAjusteManual] = useState(despesasFixasConfig.dieselAjusteManual ?? 0);
  const [usarDieselManual, setUsarDieselManual] = useState(despesasFixasConfig.usarDieselManual ?? false);
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  // Sincronizar quando despesasFixasConfig mudar
  useEffect(() => {
    if (despesasFixasConfig.prestacaoFurgao !== undefined) setPrestacaoFurgao(despesasFixasConfig.prestacaoFurgao);
    if (despesasFixasConfig.seguroMaster !== undefined) setSeguroMaster(despesasFixasConfig.seguroMaster);
    if (despesasFixasConfig.rastreamento !== undefined) setRastreamento(despesasFixasConfig.rastreamento);
    if (despesasFixasConfig.ipva !== undefined) setIpva(despesasFixasConfig.ipva);
    if (despesasFixasConfig.salarioMotorista !== undefined) setSalarioMotorista(despesasFixasConfig.salarioMotorista);
    if (despesasFixasConfig.salarioAjudante !== undefined) setSalarioAjudante(despesasFixasConfig.salarioAjudante);
    if (despesasFixasConfig.impostos !== undefined) setImpostos(despesasFixasConfig.impostos);
    if (despesasFixasConfig.dieselAjusteManual !== undefined) setDieselAjusteManual(despesasFixasConfig.dieselAjusteManual);
    if (despesasFixasConfig.usarDieselManual !== undefined) setUsarDieselManual(despesasFixasConfig.usarDieselManual);
  }, [despesasFixasConfig]);

  // Cálculo de Combustível Diesel registrado nos comprovantes
  const totalDieselRegistrado = despesas
    .filter((d) => d.status !== 'Rejeitada')
    .reduce((acc, cur) => acc + (Number(cur.valor) || 0), 0);

  const totalDieselLitros = despesas
    .filter((d) => d.status !== 'Rejeitada')
    .reduce((acc, cur) => acc + (Number(cur.litros) || 0), 0);

  const valorDieselEfetivo = usarDieselManual ? Number(dieselAjusteManual) : totalDieselRegistrado;

  // Total das Obrigações Mensais
  const totalObrigacoesMensais =
    Number(prestacaoFurgao) +
    Number(valorDieselEfetivo) +
    Number(seguroMaster) +
    Number(rastreamento) +
    Number(ipva) +
    Number(salarioMotorista) +
    Number(salarioAjudante) +
    Number(impostos);

  // Estados de auditoria de comprovantes de combustível
  const [filtroStatus, setFiltroStatus] = useState('Pendentes');
  const [comprovanteModal, setComprovanteModal] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [showRejeitarModal, setShowRejeitarModal] = useState(false);
  const [despesaParaRejeitar, setDespesaParaRejeitar] = useState(null);
  const [despesaParaExcluir, setDespesaParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  // Salvar valores das despesas fixas no Firestore
  const handleSalvarDespesasFixas = async (e) => {
    e.preventDefault();
    setSalvandoConfig(true);

    try {
      await setDoc(doc(db, 'configuracoes', 'despesasFixas'), {
        prestacaoFurgao: Number(prestacaoFurgao),
        seguroMaster: Number(seguroMaster),
        rastreamento: Number(rastreamento),
        ipva: Number(ipva),
        salarioMotorista: Number(salarioMotorista),
        salarioAjudante: Number(salarioAjudante),
        impostos: Number(impostos),
        dieselAjusteManual: Number(dieselAjusteManual),
        usarDieselManual: Boolean(usarDieselManual),
        totalObrigacoesCalculado: totalObrigacoesMensais,
        atualizadoEm: new Date().toISOString()
      }, { merge: true });

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Despesas Fixas Atualizadas!',
          desc: 'Os valores das obrigações mensais foram salvos com sucesso.'
        });
      }
    } catch (err) {
      console.error('Erro ao salvar despesas fixas:', err);
      alert('Erro ao salvar no Firebase.');
    } finally {
      setSalvandoConfig(false);
    }
  };

  // Filtragem da lista de comprovantes
  const despesasFiltradas = despesas.filter((d) => {
    if (filtroStatus === 'Todos') return true;
    if (filtroStatus === 'Pendentes') return d.status === 'Pendente';
    if (filtroStatus === 'Aprovadas') return d.status === 'Aprovada';
    if (filtroStatus === 'Rejeitadas') return d.status === 'Rejeitada';
    return true;
  });

  const handleAprovar = async (despesaId) => {
    try {
      await updateDoc(doc(db, 'despesas', despesaId), {
        status: 'Aprovada',
        auditadoEm: new Date().toISOString()
      });
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Abastecimento Aprovado',
          desc: 'Despesa validada e contabilizada no cálculo de diesel.'
        });
      }
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      alert('Erro ao atualizar status no Firebase.');
    }
  };

  const handleConfirmarRejeicao = async () => {
    if (!despesaParaRejeitar) return;
    try {
      await updateDoc(doc(db, 'despesas', despesaParaRejeitar.id), {
        status: 'Rejeitada',
        motivoRejeicao: motivoRejeicao.trim() || 'Comprovante ilegível ou divergente',
        auditadoEm: new Date().toISOString()
      });

      setShowRejeitarModal(false);
      setDespesaParaRejeitar(null);
      setMotivoRejeicao('');

      if (onShowToast) {
        onShowToast({
          type: 'warning',
          title: 'Abastecimento Recusado',
          desc: 'O lançamento foi recusado e excluído do cálculo do diesel.'
        });
      }
    } catch (err) {
      console.error('Erro ao rejeitar:', err);
      alert('Erro ao atualizar no Firebase.');
    }
  };

  const handleExcluirDespesa = async () => {
    if (!despesaParaExcluir) return;
    setExcluindo(true);
    try {
      await deleteDoc(doc(db, 'despesas', despesaParaExcluir.id));
      if (onShowToast) {
        onShowToast({
          type: 'info',
          title: 'Lançamento Excluído',
          desc: 'Registro removido permanentemente da base.'
        });
      }
      setDespesaParaExcluir(null);
    } catch (err) {
      console.error('Erro ao excluir:', err);
      alert('Erro ao excluir no Firebase.');
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. SEÇÃO DE DESPESAS FIXAS E OBRIGAÇÕES MENSAIS */}
      <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Icon name="fuel" className="w-5 h-5 text-amber-400" />
              Gestão de Despesas Fixas & Obrigações Mensais
            </h3>
            <p className="text-xs text-slate-400">
              Controle dos custos operacionais do veículo, seguro, combustível e equipe para cálculo do lucro líquido
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block uppercase font-semibold">Total de Obrigações / Mês</span>
            <span className="text-xl sm:text-2xl font-extrabold text-amber-400">
              R$ {totalObrigacoesMensais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Formulário de Despesas Fixas Configuráveis */}
        <form onSubmit={handleSalvarDespesasFixas} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Prestação Master */}
            <div className="p-3 bg-[#0B1329] border border-slate-800 rounded-xl space-y-1">
              <label className="block text-slate-400 text-[11px] font-semibold">
                Prestação Furgão Master (Mês) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">R$</span>
                <input
                  type="number"
                  required
                  value={prestacaoFurgao}
                  onChange={(e) => setPrestacaoFurgao(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">Valor fixo contratual do veículo</span>
            </div>

            {/* Combustível Diesel */}
            <div className="p-3 bg-[#0B1329] border border-amber-500/30 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-amber-300 text-[11px] font-bold">
                  Combustível (Diesel)
                </label>
                <span className="text-[10px] text-slate-400">{totalDieselLitros}L consumidos</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">R$</span>
                <input
                  type="number"
                  value={valorDieselEfetivo}
                  disabled={!usarDieselManual}
                  onChange={(e) => setDieselAjusteManual(e.target.value)}
                  className={`w-full bg-slate-900 border rounded-lg pl-9 pr-3 py-1.5 font-bold text-sm focus:outline-none ${
                    usarDieselManual
                      ? 'border-amber-500 text-amber-300'
                      : 'border-slate-800 text-slate-200 opacity-90'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usarDieselManual}
                    onChange={(e) => setUsarDieselManual(e.target.checked)}
                    className="rounded"
                  />
                  Ajustar Manualmente
                </label>
                {!usarDieselManual && (
                  <span className="text-[10px] text-emerald-400 font-semibold">Atualização em Tempo Real</span>
                )}
              </div>
            </div>

            {/* Seguro Master */}
            <div className="p-3 bg-[#0B1329] border border-slate-800 rounded-xl space-y-1">
              <label className="block text-slate-400 text-[11px] font-semibold">
                Seguro Furgão Master *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">R$</span>
                <input
                  type="number"
                  required
                  value={seguroMaster}
                  onChange={(e) => setSeguroMaster(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">Proteção e apólice da frota</span>
            </div>

            {/* Rastreamento Interno */}
            <div className="p-3 bg-[#0B1329] border border-slate-800 rounded-xl space-y-1">
              <label className="block text-slate-400 text-[11px] font-semibold">
                Rastreamento Interno *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">R$</span>
                <input
                  type="number"
                  required
                  value={rastreamento}
                  onChange={(e) => setRastreamento(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">Telemetria e rastreador via satélite</span>
            </div>

            {/* IPVA */}
            <div className="p-3 bg-[#0B1329] border border-slate-800 rounded-xl space-y-1">
              <label className="block text-slate-400 text-[11px] font-semibold">
                IPVA (Parcela / Mês) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">R$</span>
                <input
                  type="number"
                  required
                  value={ipva}
                  onChange={(e) => setIpva(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">Provisão de licenciamento e tributo</span>
            </div>

            {/* Motorista */}
            <div className="p-3 bg-[#0B1329] border border-slate-800 rounded-xl space-y-1">
              <label className="block text-slate-400 text-[11px] font-semibold">
                Custo Motorista (Salário / Diárias) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">R$</span>
                <input
                  type="number"
                  required
                  value={salarioMotorista}
                  onChange={(e) => setSalarioMotorista(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">Remuneração do condutor</span>
            </div>

            {/* Ajudante */}
            <div className="p-3 bg-[#0B1329] border border-slate-800 rounded-xl space-y-1">
              <label className="block text-slate-400 text-[11px] font-semibold">
                Custo Ajudante (Apoio de Carga) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">R$</span>
                <input
                  type="number"
                  required
                  value={salarioAjudante}
                  onChange={(e) => setSalarioAjudante(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">Diárias de ajudante nas entregas</span>
            </div>

            {/* Impostos */}
            <div className="p-3 bg-[#0B1329] border border-slate-800 rounded-xl space-y-1">
              <label className="block text-slate-400 text-[11px] font-semibold">
                Impostos (DAS / Simples Nacional) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-bold">R$</span>
                <input
                  type="number"
                  required
                  value={impostos}
                  onChange={(e) => setImpostos(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">Estimativa de tributação sobre notas</span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={salvandoConfig}
              className="py-2.5 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center gap-2"
            >
              {salvandoConfig ? (
                <>
                  <Icon name="refresh" className="w-4 h-4 animate-spin" />
                  Salvando Despesas Fixas...
                </>
              ) : (
                <>
                  <Icon name="check" className="w-4 h-4" />
                  Salvar Despesas Fixas da Empresa
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. SEÇÃO DE AUDITORIA DE COMPROVANTES DE COMBUSTÍVEL */}
      <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Icon name="camera" className="w-4 h-4 text-cyan-400" />
              Auditoria de Comprovantes de Diesel Enviados ({despesasFiltradas.length})
            </h4>
            <p className="text-[11px] text-slate-400">
              Conferência dos cupons fiscais e notas de abastecimento dos motoristas
            </p>
          </div>

          {/* Filtros de Status */}
          <div className="flex items-center gap-1.5 bg-[#0B1329] p-1 rounded-xl border border-slate-800 text-xs">
            {['Pendentes', 'Aprovadas', 'Rejeitadas', 'Todos'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFiltroStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filtroStatus === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Comprovantes */}
        <div className="space-y-2.5 pt-1">
          {despesasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <Icon name="fuel" className="w-7 h-7 mx-auto mb-2 opacity-40" />
              Nenhum abastecimento encontrado no filtro "{filtroStatus}".
            </div>
          ) : (
            despesasFiltradas.map((despesa) => {
              const isPendente = despesa.status === 'Pendente';
              const isAprovada = despesa.status === 'Aprovada';

              return (
                <div
                  key={despesa.id}
                  className="p-3.5 bg-[#0B1329] border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{despesa.tipo || 'Combustível'}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isAprovada
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : isPendente
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : 'bg-red-950 text-red-400 border-red-800'
                        }`}
                      >
                        {despesa.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Motorista: <strong className="text-white">{despesa.motorista}</strong>
                      {despesa.placa && <span> • Placa: {despesa.placa}</span>}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      {despesa.litros && (
                        <span className="text-emerald-400 font-semibold">{despesa.litros} Litros</span>
                      )}
                      {despesa.valor && (
                        <span className="text-amber-300 font-bold">R$ {despesa.valor}</span>
                      )}
                      {despesa.data && <span>Data: {despesa.data}</span>}
                      {despesa.posto && <span className="text-slate-500">• {despesa.posto}</span>}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setComprovanteModal(despesa)}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Icon name="eye" className="w-3.5 h-3.5" />
                      Ver Foto
                    </button>

                    {isPendente && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAprovar(despesa.id)}
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <Icon name="check" className="w-3.5 h-3.5" />
                          Aprovar
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDespesaParaRejeitar(despesa);
                            setShowRejeitarModal(true);
                          }}
                          className="py-1.5 px-3 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 rounded-lg text-xs font-semibold transition-all"
                        >
                          Recusar
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setDespesaParaExcluir(despesa)}
                      title="Excluir lançamento incorreto"
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-lg border border-red-900/60 transition-colors"
                    >
                      <Icon name="trash" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal para Visualizar Foto do Comprovante */}
      {comprovanteModal && (
        <Modal
          isOpen={true}
          onClose={() => setComprovanteModal(null)}
          title="Comprovante de Combustível"
          subtitle={`${comprovanteModal.tipo} • Motorista ${comprovanteModal.motorista}`}
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <p>Arquivo: <strong className="text-cyan-400 font-mono">{comprovanteModal.comprovanteArquivo || 'Foto direta'}</strong></p>
              <p>Posto: <strong>{comprovanteModal.posto || 'Não informado'}</strong></p>
              <p>Litros: <strong className="text-emerald-400">{comprovanteModal.litros} L</strong> • Valor: <strong className="text-amber-400">R$ {comprovanteModal.valor}</strong></p>
              <p>Data e Hora: <strong>{comprovanteModal.data} - {comprovanteModal.hora || 'Hoje'}</strong></p>
            </div>

            <div className="min-h-[160px] bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <Icon name="camera" className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-slate-400 text-xs">Arquivo de comprovante validado:</p>
              <p className="text-emerald-400 font-bold mt-1">{comprovanteModal.comprovanteArquivo}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Rejeição de Despesa */}
      <Modal
        isOpen={showRejeitarModal}
        onClose={() => setShowRejeitarModal(false)}
        title="Recusar Comprovante de Combustível"
        subtitle="Informe a justificativa da recusa para o motorista"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Motivo da Recusa *</label>
            <textarea
              rows="3"
              required
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              placeholder="Ex: Foto tremida, valor não confere com a nota, posto sem identificação..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowRejeitarModal(false)}
              className="py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmarRejeicao}
              className="py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold"
            >
              Confirmar Recusa
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Exclusão de Despesa */}
      {despesaParaExcluir && (
        <Modal
          isOpen={true}
          onClose={() => setDespesaParaExcluir(null)}
          title="Excluir Abastecimento Incorreto?"
          subtitle="Essa ação removerá o comprovante e ajustará as contas da empresa"
        >
          <div className="space-y-4 text-xs text-center">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <Icon name="trash" className="w-6 h-6" />
            </div>
            <p className="text-slate-300">
              Deseja apagar o abastecimento no valor de{' '}
              <strong className="text-amber-400">R$ {despesaParaExcluir.valor}</strong> enviado por{' '}
              <strong className="text-white">{despesaParaExcluir.motorista}</strong>?
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDespesaParaExcluir(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={excluindo}
                onClick={handleExcluirDespesa}
                className="py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2"
              >
                {excluindo ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
