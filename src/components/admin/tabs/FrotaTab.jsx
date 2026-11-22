// src/components/admin/tabs/FrotaTab.jsx
// Gestão de veículos da frota, controle de odômetro, alertas de manutenção e cadastro

import React, { useState } from 'react';
import { Icon } from '../../common/Icons';
import { Modal } from '../../common/Modal';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export const FrotaTab = ({ veiculos = [], onShowToast }) => {
  const [showNovoVeiculoModal, setShowNovoVeiculoModal] = useState(false);
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('2023');
  const [odometro, setOdometro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Lista padrão caso o banco esteja vazio
  const listaVeiculos =
    veiculos.length > 0
      ? veiculos
      : [
          { id: '1', placa: 'CVP-3G01', modelo: 'Mercedes-Benz Accelo 1016', odometro: 148250, status: 'Em Operação' },
          { id: '2', placa: 'EJK-7F42', modelo: 'Volkswagen Delivery 9.170', odometro: 92400, status: 'Em Operação' },
          { id: '3', placa: 'BRL-9A88', modelo: 'Ford Cargo 816', odometro: 215100, status: 'Revisão Agendada' }
        ];

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

  return (
    <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Icon name="truck" className="w-5 h-5 text-purple-400" />
            Gestão da Frota de Veículos ({listaVeiculos.length})
          </h3>
          <p className="text-xs text-slate-400">Monitoramento de odômetro e manutenção preventiva</p>
        </div>

        <button
          type="button"
          onClick={() => setShowNovoVeiculoModal(true)}
          className="py-2 px-3.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Icon name="plus" className="w-4 h-4" />
          Cadastrar Novo Veículo
        </button>
      </div>

      {/* Grade de Veículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listaVeiculos.map((v) => {
          const proxRevisaoKm = Math.ceil(v.odometro / 10000) * 10000;
          const kmParaRevisao = proxRevisaoKm - v.odometro;
          const precisaAtencao = kmParaRevisao < 1500;

          return (
            <div
              key={v.id}
              className="p-4 bg-[#0B1329] border border-slate-800 hover:border-purple-500/40 rounded-xl space-y-3 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="font-extrabold text-base text-white tracking-wider">{v.placa}</span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold">
                  {v.status || 'Em Operação'}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-slate-400">Modelo: <strong className="text-white block">{v.modelo}</strong></p>
                <p className="text-slate-400">Odômetro: <strong className="text-cyan-400">{v.odometro.toLocaleString('pt-BR')} km</strong></p>
              </div>

              {/* Indicador de Manutenção Preventiva */}
              <div className={`p-2.5 rounded-lg border text-[11px] ${
                precisaAtencao
                  ? 'bg-amber-950/30 border-amber-600/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
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
                    style={{ width: `${Math.min(100, Math.max(10, ((10000 - kmParaRevisao) / 10000) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro de Veículo */}
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
