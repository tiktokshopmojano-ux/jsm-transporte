// src/components/admin/tabs/FrotaTab.jsx
// Gestão de veículos da frota, controle de odômetro, alertas de manutenção preventiva, cadastro e exclusão

import React, { useState } from 'react';
import { Icon } from '../../common/Icons';
import { Modal } from '../../common/Modal';
import { addDoc, collection, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export const FrotaTab = ({ veiculos = [], onShowToast }) => {
  const [showNovoVeiculoModal, setShowNovoVeiculoModal] = useState(false);
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('2023');
  const [odometro, setOdometro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Estados para exclusão de veículos
  const [veiculoParaExcluir, setVeiculoParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [veiculosLocaisExcluidos, setVeiculosLocaisExcluidos] = useState([]);

  // Lista padrão caso o banco ainda não tenha registros
  const baseVeiculos =
    veiculos.length > 0
      ? veiculos
      : [
          { id: 'mock-1', placa: 'CVP-3G01', modelo: 'Mercedes-Benz Accelo 1016', odometro: 148250, status: 'Em Operação', ano: 2022 },
          { id: 'mock-2', placa: 'EJK-7F42', modelo: 'Volkswagen Delivery 9.170', odometro: 92400, status: 'Em Operação', ano: 2023 },
          { id: 'mock-3', placa: 'BRL-9A88', modelo: 'Ford Cargo 816', odometro: 215100, status: 'Revisão Agendada', ano: 2021 }
        ];

  // Filtra itens já excluídos localmente
  const listaVeiculos = baseVeiculos.filter(
    (v) => !veiculosLocaisExcluidos.includes(v.id)
  );

  // Cadastrar novo veículo no Firestore
  const handleSalvarVeiculo = async (e) => {
    e.preventDefault();
    if (!placa.trim() || !modelo.trim()) {
      alert('Preencha a placa e o modelo do veículo.');
      return;
    }

    setSalvando(true);
    try {
      await addDoc(collection(db, 'veiculos'), {
        placa: placa.trim().toUpperCase(),
        modelo: modelo.trim(),
        ano: Number(ano) || 2023,
        odometro: Number(odometro) || 0,
        status: 'Em Operação',
        criadoEm: new Date().toISOString()
      });

      setShowNovoVeiculoModal(false);
      setPlaca('');
      setModelo('');
      setOdometro('');

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Veículo Cadastrado!',
          desc: `Placa ${placa.toUpperCase()} adicionada à frota com sucesso.`
        });
      }
    } catch (err) {
      console.error('Erro ao cadastrar veículo:', err);
      alert('Erro ao salvar veículo no Firebase.');
    } finally {
      setSalvando(false);
    }
  };

  // Excluir veículo do Firestore
  const handleExcluirVeiculo = async () => {
    if (!veiculoParaExcluir) return;
    setExcluindo(true);

    try {
      if (veiculoParaExcluir.id && !String(veiculoParaExcluir.id).startsWith('mock-')) {
        await deleteDoc(doc(db, 'veiculos', veiculoParaExcluir.id));
      }
      setVeiculosLocaisExcluidos((prev) => [...prev, veiculoParaExcluir.id]);

      if (onShowToast) {
        onShowToast({
          type: 'info',
          title: 'Veículo Excluído!',
          desc: `O veículo de placa ${veiculoParaExcluir.placa} foi removido da frota com sucesso.`
        });
      }
      setVeiculoParaExcluir(null);
    } catch (err) {
      console.error('Erro ao excluir veículo:', err);
      alert('Erro ao excluir veículo no Firebase: ' + (err.message || ''));
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Cabeçalho da Aba Frota */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Icon name="truck" className="w-5 h-5 text-purple-400" />
            Gestão da Frota de Veículos ({listaVeiculos.length})
          </h3>
          <p className="text-xs text-slate-400">Monitoramento de odômetro, manutenção preventiva e controle de carros</p>
        </div>

        <button
          type="button"
          onClick={() => setShowNovoVeiculoModal(true)}
          className="py-2 px-3.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
        >
          <Icon name="plus" className="w-4 h-4" />
          Cadastrar Novo Veículo
        </button>
      </div>

      {/* Grade de Veículos */}
      {listaVeiculos.length === 0 ? (
        <div className="p-8 text-center bg-[#0B1329] border border-slate-800 rounded-xl space-y-2">
          <Icon name="truck" className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">Nenhum veículo cadastrado na frota</p>
          <p className="text-xs text-slate-500">Clique em "Cadastrar Novo Veículo" acima para adicionar um carro à frota.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listaVeiculos.map((v) => {
            const proxRevisaoKm = Math.ceil((Number(v.odometro) || 0) / 10000) * 10000;
            const kmParaRevisao = proxRevisaoKm - (Number(v.odometro) || 0);
            const precisaAtencao = kmParaRevisao < 1500;

            return (
              <div
                key={v.id}
                className="p-4 bg-[#0B1329] border border-slate-800 hover:border-purple-500/40 rounded-xl space-y-3 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-950/50 rounded-lg text-purple-400 border border-purple-800/40">
                        <Icon name="truck" className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-base text-white tracking-wider">{v.placa}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold">
                        {v.status || 'Em Operação'}
                      </span>
                      {/* Botão de Excluir Veículo rápido */}
                      <button
                        type="button"
                        onClick={() => setVeiculoParaExcluir(v)}
                        title="Excluir este carro da frota"
                        className="p-1.5 bg-red-950/40 hover:bg-red-900/70 text-red-400 hover:text-red-200 border border-red-800/40 hover:border-red-600 rounded-lg transition-all"
                      >
                        <Icon name="trash" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs pt-2">
                    <p className="text-slate-400">
                      Modelo: <strong className="text-white block font-semibold">{v.modelo}</strong>
                    </p>
                    <p className="text-slate-400">
                      Odômetro:{' '}
                      <strong className="text-cyan-400 font-bold">
                        {(Number(v.odometro) || 0).toLocaleString('pt-BR')} km
                      </strong>
                    </p>
                  </div>

                  {/* Indicador de Manutenção Preventiva */}
                  <div
                    className={`p-2.5 rounded-lg border text-[11px] mt-3 ${
                      precisaAtencao
                        ? 'bg-amber-950/30 border-amber-600/40 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold flex items-center gap-1">
                        <Icon name="wrench" className="w-3.5 h-3.5 text-purple-400" />
                        Troca de Óleo / Revisão
                      </span>
                      <strong>em {kmParaRevisao} km</strong>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${precisaAtencao ? 'bg-amber-500' : 'bg-purple-500'}`}
                        style={{
                          width: `${Math.min(100, Math.max(10, ((10000 - kmParaRevisao) / 10000) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Rodapé do Card com Ação Explícita de Excluir Carro */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Ano: {v.ano || '2023'}</span>
                  <button
                    type="button"
                    onClick={() => setVeiculoParaExcluir(v)}
                    className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-red-950/50 border border-transparent hover:border-red-900/50 transition-all"
                  >
                    <Icon name="trash" className="w-3.5 h-3.5" />
                    Excluir Carro
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação para Excluir Veículo */}
      <Modal
        isOpen={Boolean(veiculoParaExcluir)}
        onClose={() => !excluindo && setVeiculoParaExcluir(null)}
        title="Excluir Veículo da Frota"
        subtitle="Confirme a remoção definitiva deste veículo do sistema"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-red-300 flex items-start gap-3">
            <div className="p-2 bg-red-900/50 rounded-lg text-red-200 shrink-0">
              <Icon name="trash" className="w-5 h-5 text-red-300" />
            </div>
            <div>
              <p className="font-bold text-sm text-white mb-0.5">Tem certeza que deseja excluir?</p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Esta ação removerá permanentemente o veículo da frota e do controle de manutenção preventiva.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-slate-300">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="text-slate-400">Placa:</span>
              <span className="text-white font-extrabold text-sm tracking-wider">{veiculoParaExcluir?.placa}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="text-slate-400">Modelo:</span>
              <span className="text-white font-medium">{veiculoParaExcluir?.modelo}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="text-slate-400">Odômetro:</span>
              <span className="text-cyan-400 font-bold">
                {(Number(veiculoParaExcluir?.odometro) || 0).toLocaleString('pt-BR')} km
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status Operacional:</span>
              <span className="text-emerald-400 font-semibold">{veiculoParaExcluir?.status || 'Em Operação'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={excluindo}
              onClick={() => setVeiculoParaExcluir(null)}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-all text-center"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={excluindo}
              onClick={handleExcluirVeiculo}
              className="py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {excluindo ? (
                <>
                  <Icon name="refresh" className="w-4 h-4 animate-spin" />
                  Excluindo Carro...
                </>
              ) : (
                <>
                  <Icon name="trash" className="w-4 h-4" />
                  Sim, Excluir Carro
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Cadastro de Novo Veículo */}
      <Modal
        isOpen={showNovoVeiculoModal}
        onClose={() => setShowNovoVeiculoModal(false)}
        title="Cadastrar Veículo na Frota"
        subtitle="Informe os dados técnicos para monitoramento no sistema"
      >
        <form onSubmit={handleSalvarVeiculo} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Placa do Veículo (Padrão Mercosul / Antigo) *</label>
            <input
              type="text"
              required
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              placeholder="Ex: CVP-3G01"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold uppercase focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Modelo / Marca *</label>
            <input
              type="text"
              required
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Ex: Mercedes-Benz Accelo 1016"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ano de Fabricação</label>
              <input
                type="number"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Odômetro Atual (KM) *</label>
              <input
                type="number"
                required
                value={odometro}
                onChange={(e) => setOdometro(e.target.value)}
                placeholder="Ex: 148000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {salvando ? (
                <>
                  <Icon name="refresh" className="w-4 h-4 animate-spin" />
                  Salvando Veículo...
                </>
              ) : (
                <>
                  <Icon name="check" className="w-4 h-4" />
                  Confirmar Cadastro
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
