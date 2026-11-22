// src/components/admin/tabs/ConfiguracoesTab.jsx
// Aba de Configurações Administrativas: Metas Mensais/Anuais e Limpeza de Registros Incorretos

import React, { useState } from 'react';
import { Icon } from '../../common/Icons';
import { Modal } from '../../common/Modal';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export const ConfiguracoesTab = ({
  metasConfig = {},
  viagens = [],
  despesas = [],
  ocorrencias = [],
  veiculos = [],
  onShowToast
}) => {
  // Estado das Metas da Empresa
  const [metaMes, setMetaMes] = useState(metasConfig.metaFaturamentoMes || 120000);
  const [metaAno, setMetaAno] = useState(metasConfig.metaFaturamentoAno || 1500000);
  const [metaViagens, setMetaViagens] = useState(metasConfig.metaViagensMes || 180);
  const [metaConsumo, setMetaConsumo] = useState(metasConfig.metaConsumoKmL || 10.0);
  const [diasUteis, setDiasUteis] = useState(metasConfig.diasUteisMes || 26);
  const [percentualExpansao, setPercentualExpansao] = useState(metasConfig.percentualExpansao || 20);
  const [salvandoMetas, setSalvandoMetas] = useState(false);

  // Estado para exclusão de registros incorretos
  const [abaLimpeza, setAbaLimpeza] = useState('viagens');
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  // Salvar Metas no Firestore
  const handleSalvarMetas = async (e) => {
    e.preventDefault();
    setSalvandoMetas(true);

    try {
      await setDoc(doc(db, 'configuracoes', 'metas'), {
        metaFaturamentoMes: Number(metaMes),
        metaFaturamentoAno: Number(metaAno),
        metaViagensMes: Number(metaViagens),
        metaConsumoKmL: Number(metaConsumo),
        diasUteisMes: Number(diasUteis),
        percentualExpansao: Number(percentualExpansao),
        atualizadoEm: new Date().toISOString()
      }, { merge: true });

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Metas Atualizadas!',
          desc: 'Os valores de planejamento mensal e anual foram salvos com sucesso.'
        });
      }
    } catch (err) {
      console.error('Erro ao salvar metas:', err);
      alert('Erro ao atualizar metas no Firebase.');
    } finally {
      setSalvandoMetas(false);
    }
  };

  // Confirmar Exclusão de Registro Incorreto
  const handleConfirmarExclusao = async () => {
    if (!itemParaExcluir) return;
    setExcluindo(true);

    try {
      const colecao = itemParaExcluir.tipoColecao; // 'viagens', 'despesas', 'ocorrencias'
      await deleteDoc(doc(db, colecao, itemParaExcluir.id));

      if (onShowToast) {
        onShowToast({
          type: 'info',
          title: 'Registro Excluído!',
          desc: `O item selecionado foi removido permanentemente da base.`
        });
      }
      setItemParaExcluir(null);
    } catch (err) {
      console.error('Erro ao excluir item:', err);
      alert('Erro ao excluir registro no Firebase.');
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SEÇÃO 1: CONFIGURAÇÃO DE METAS E VALORES */}
      <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Icon name="settings" className="w-5 h-5 text-cyan-400" />
              Configuração de Metas da Empresa (Mês e Ano)
            </h3>
            <p className="text-xs text-slate-400">
              Defina os objetivos de faturamento, volume de viagens e consumo que alimentam os gráficos e painéis
            </p>
          </div>
        </div>

        <form onSubmit={handleSalvarMetas} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Meta de Faturamento Mensal (R$) *
              </label>
              <input
                type="number"
                required
                value={metaMes}
                onChange={(e) => setMetaMes(e.target.value)}
                placeholder="Ex: 120000"
                className="w-full bg-[#0B1329] border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Meta de Faturamento Anual (R$) *
              </label>
              <input
                type="number"
                required
                value={metaAno}
                onChange={(e) => setMetaAno(e.target.value)}
                placeholder="Ex: 1500000"
                className="w-full bg-[#0B1329] border border-slate-800 rounded-xl px-3 py-2.5 text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Meta de Viagens no Mês *
              </label>
              <input
                type="number"
                required
                value={metaViagens}
                onChange={(e) => setMetaViagens(e.target.value)}
                placeholder="Ex: 180"
                className="w-full bg-[#0B1329] border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Meta Eficiência Combustível (km/L) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={metaConsumo}
                onChange={(e) => setMetaConsumo(e.target.value)}
                placeholder="Ex: 10.0"
                className="w-full bg-[#0B1329] border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Dias Úteis no Mês *
              </label>
              <input
                type="number"
                required
                value={diasUteis}
                onChange={(e) => setDiasUteis(e.target.value)}
                placeholder="Ex: 26"
                className="w-full bg-[#0B1329] border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Reserva para Cofre de Expansão (%) *
              </label>
              <input
                type="number"
                required
                value={percentualExpansao}
                onChange={(e) => setPercentualExpansao(e.target.value)}
                placeholder="Ex: 20"
                className="w-full bg-[#0B1329] border border-slate-800 rounded-xl px-3 py-2.5 text-orange-400 font-bold focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={salvandoMetas}
              className="py-2.5 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center gap-2"
            >
              {salvandoMetas ? (
                <>
                  <Icon name="refresh" className="w-4 h-4 animate-spin" />
                  Salvando Metas...
                </>
              ) : (
                <>
                  <Icon name="check" className="w-4 h-4" />
                  Salvar Metas da Empresa
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SEÇÃO 2: GERENCIADOR DE LIMPEZA E EXCLUSÃO DE DADOS */}
      <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-red-400 flex items-center gap-2">
              <Icon name="trash" className="w-5 h-5 text-red-400" />
              Limpeza de Dados Incorretos Enviados por Motoristas
            </h3>
            <p className="text-xs text-slate-400">
              Exclua viagens duplicadas, comprovantes errados ou ocorrências falsas para não poluir o faturamento
            </p>
          </div>

          {/* Seletor de Tipo para Limpeza */}
          <div className="flex items-center gap-1 bg-[#0B1329] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setAbaLimpeza('viagens')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                abaLimpeza === 'viagens' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Viagens ({viagens.length})
            </button>
            <button
              type="button"
              onClick={() => setAbaLimpeza('despesas')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                abaLimpeza === 'despesas' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Despesas ({despesas.length})
            </button>
            <button
              type="button"
              onClick={() => setAbaLimpeza('ocorrencias')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                abaLimpeza === 'ocorrencias' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ocorrências ({ocorrencias.length})
            </button>
            <button
              type="button"
              onClick={() => setAbaLimpeza('veiculos')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                abaLimpeza === 'veiculos' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Veículos ({veiculos.length})
            </button>
          </div>
        </div>

        {/* Listagem com botão de exclusão */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {abaLimpeza === 'viagens' && (
            viagens.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Nenhuma viagem encontrada.</p>
            ) : (
              viagens.map((item) => (
                <div key={item.id} className="p-3 bg-[#0B1329] border border-slate-800 hover:border-red-500/40 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">
                      Romaneio #{item.romaneioId || '---'} • {item.motorista} ({item.placa})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Destino: {item.romaneioCidade || 'SÃO PAULO'} • Faturamento: R$ {item.valor} • Data: {item.data}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItemParaExcluir({ ...item, tipoColecao: 'viagens', titulo: `Viagem Romaneio #${item.romaneioId} (${item.motorista})` })}
                    className="py-1.5 px-3 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Icon name="trash" className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              ))
            )
          )}

          {abaLimpeza === 'despesas' && (
            despesas.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Nenhuma despesa encontrada.</p>
            ) : (
              despesas.map((item) => (
                <div key={item.id} className="p-3 bg-[#0B1329] border border-slate-800 hover:border-red-500/40 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">
                      {item.tipo} • {item.motorista} ({item.placa || 'Sem placa'})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {item.litros ? `${item.litros} Litros` : ''} • R$ {item.valor || 0} • Status: {item.status} • {item.data}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItemParaExcluir({ ...item, tipoColecao: 'despesas', titulo: `Despesa de ${item.tipo} (${item.motorista})` })}
                    className="py-1.5 px-3 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Icon name="trash" className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              ))
            )
          )}

          {abaLimpeza === 'ocorrencias' && (
            ocorrencias.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Nenhuma ocorrência encontrada.</p>
            ) : (
              ocorrencias.map((item) => (
                <div key={item.id} className="p-3 bg-[#0B1329] border border-slate-800 hover:border-red-500/40 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-amber-300">
                      {item.tipo} ({item.gravidade}) • {item.motorista}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate max-w-md">
                      {item.descricao} • {item.data}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItemParaExcluir({ ...item, tipoColecao: 'ocorrencias', titulo: `Ocorrência "${item.tipo}" (${item.motorista})` })}
                    className="py-1.5 px-3 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Icon name="trash" className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              ))
            )
          )}

          {abaLimpeza === 'veiculos' && (
            veiculos.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Nenhum veículo encontrado no banco.</p>
            ) : (
              veiculos.map((item) => (
                <div key={item.id} className="p-3 bg-[#0B1329] border border-slate-800 hover:border-red-500/40 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white flex items-center gap-2">
                      <Icon name="truck" className="w-3.5 h-3.5 text-purple-400" />
                      {item.placa} • {item.modelo}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Odômetro: {(Number(item.odometro) || 0).toLocaleString('pt-BR')} km • Status: {item.status || 'Em Operação'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setItemParaExcluir({ ...item, tipoColecao: 'veiculos', titulo: `Veículo ${item.placa} (${item.modelo})` })}
                    className="py-1.5 px-3 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Icon name="trash" className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {itemParaExcluir && (
        <Modal
          isOpen={true}
          onClose={() => setItemParaExcluir(null)}
          title="Excluir Registro Incorreto?"
          subtitle="Atenção: essa ação removerá o dado permanentemente do sistema"
        >
          <div className="space-y-4 text-xs text-center">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <Icon name="trash" className="w-6 h-6" />
            </div>
            <p className="text-slate-300">
              Você tem certeza que deseja apagar o registro:
              <strong className="block text-white text-sm mt-1">{itemParaExcluir.titulo}</strong>
            </p>
            <p className="text-[11px] text-red-400">
              Essa exclusão ajustará automaticamente o total de faturamento e os indicadores do painel.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemParaExcluir(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={excluindo}
                onClick={handleConfirmarExclusao}
                className="py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2"
              >
                {excluindo ? 'Apagando...' : 'Sim, Excluir Agora'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
