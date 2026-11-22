// src/components/admin/tabs/DespesasTab.jsx
// Auditoria financeira de despesas e comprovantes de combustível com aprovação/rejeição

import React, { useState } from 'react';
import { Icon } from '../../common/Icons';
import { Modal } from '../../common/Modal';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export const DespesasTab = ({ despesas = [], onShowToast }) => {
  const [filtroStatus, setFiltroStatus] = useState('Pendentes');
  const [comprovanteModal, setComprovanteModal] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [showRejeitarModal, setShowRejeitarModal] = useState(false);
  const [despesaParaRejeitar, setDespesaParaRejeitar] = useState(null);
  const [despesaParaExcluir, setDespesaParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const handleExcluirDespesa = async () => {
    if (!despesaParaExcluir) return;
    setExcluindo(true);
    try {
      await deleteDoc(doc(db, 'despesas', despesaParaExcluir.id));
      if (onShowToast) {
        onShowToast({
          type: 'info',
          title: 'Despesa Excluída',
          desc: 'Registro removido da base com sucesso.'
        });
      }
      setDespesaParaExcluir(null);
    } catch (err) {
      console.error('Erro ao excluir despesa:', err);
      alert('Erro ao excluir despesa no Firebase.');
    } finally {
      setExcluindo(false);
    }
  };

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
          title: 'Despesa Aprovada',
          desc: 'O lançamento foi validado e contabilizado no faturamento.'
        });
      }
    } catch (err) {
      console.error('Erro ao aprovar despesa:', err);
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
          title: 'Despesa Rejeitada',
          desc: 'O motorista será notificado para enviar novo comprovante.'
        });
      }
    } catch (err) {
      console.error('Erro ao rejeitar despesa:', err);
      alert('Erro ao atualizar no Firebase.');
    }
  };

  return (
    <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Icon name="fuel" className="w-5 h-5 text-amber-400" />
            Auditoria de Despesas & Combustível ({despesasFiltradas.length})
          </h3>
          <p className="text-xs text-slate-400">Validação de notas fiscais e abastecimentos da frota</p>
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

      {/* Lista de Despesas */}
      <div className="space-y-3 pt-1">
        {despesasFiltradas.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <Icon name="fuel" className="w-8 h-8 mx-auto mb-2 opacity-40" />
            Nenhuma despesa encontrada para o filtro "{filtroStatus}".
          </div>
        ) : (
          despesasFiltradas.map((despesa) => {
            const isPendente = despesa.status === 'Pendente';
            const isAprovada = despesa.status === 'Aprovada';

            return (
              <div
                key={despesa.id}
                className="p-4 bg-[#0B1329] border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{despesa.tipo}</span>
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

      {/* Modal para Visualizar Comprovante */}
      {comprovanteModal && (
        <Modal
          isOpen={true}
          onClose={() => setComprovanteModal(null)}
          title="Comprovante de Despesa"
          subtitle={`${comprovanteModal.tipo} • Motorista ${comprovanteModal.motorista}`}
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <p>Arquivo: <strong className="text-cyan-400 font-mono">{comprovanteModal.comprovanteArquivo || 'Foto direta'}</strong></p>
              <p>Posto: <strong>{comprovanteModal.posto || 'Não informado'}</strong></p>
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
        title="Recusar Comprovante de Despesa"
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
          title="Excluir Despesa Incorreta?"
          subtitle="Essa ação removerá o comprovante e ajustará as contas da empresa"
        >
          <div className="space-y-4 text-xs text-center">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <Icon name="trash" className="w-6 h-6" />
            </div>
            <p className="text-slate-300">
              Deseja apagar a despesa de <strong className="text-white">{despesaParaExcluir.tipo}</strong> no valor de{' '}
              <strong className="text-amber-400">R$ {despesaParaExcluir.valor}</strong> enviada por{' '}
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
