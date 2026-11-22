// src/components/admin/tabs/MotoristasTab.jsx
// Gestão completa de motoristas cadastrados na JSM Transporte

import React, { useState } from 'react';
import { Icon } from '../../common/Icons';
import { Modal } from '../../common/Modal';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../services/firebase';

export const MotoristasTab = ({ motoristas = [], veiculos = [], onShowToast }) => {
  const [showNovoMotoristaModal, setShowNovoMotoristaModal] = useState(false);
  const [nome, setNome] = useState('');
  const [placa, setPlaca] = useState('');
  const [telefone, setTelefone] = useState('');
  const [salvando, setSalvando] = useState(false);

  const listaMotoristas =
    motoristas.length > 0
      ? motoristas
      : [
          { id: '1', nome: 'SILVIO LUIZ MOJANO', placa: 'CVP-3G01', telefone: '(11) 98765-4321', status: 'Ativo' },
          { id: '2', nome: 'CARLOS EDUARDO SILVA', placa: 'EJK-7F42', telefone: '(11) 97654-3210', status: 'Ativo' }
        ];

  const handleSalvarMotorista = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !placa.trim()) {
      alert('Preencha o nome do motorista e selecione a placa do veículo.');
      return;
    }

    setSalvando(true);
    try {
      await addDoc(collection(db, 'motoristas'), {
        nome: nome.trim().toUpperCase(),
        placa: placa.trim().toUpperCase(),
        telefone: telefone.trim(),
        status: 'Ativo',
        criadoEm: new Date().toISOString()
      });

      setShowNovoMotoristaModal(false);
      setNome('');
      setPlaca('');
      setTelefone('');

      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Motorista Cadastrado!',
          desc: `${nome.toUpperCase()} vinculado ao veículo ${placa.toUpperCase()}.`
        });
      }
    } catch (err) {
      console.error('Erro ao cadastrar motorista:', err);
      alert('Erro ao salvar motorista no Firebase.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Icon name="users" className="w-5 h-5 text-cyan-400" />
            Equipe de Motoristas ({listaMotoristas.length})
          </h3>
          <p className="text-xs text-slate-400">Gerenciamento de acessos, veículos e dados de contato</p>
        </div>

        <button
          type="button"
          onClick={() => setShowNovoMotoristaModal(true)}
          className="py-2 px-3.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Icon name="plus" className="w-4 h-4" />
          Cadastrar Novo Motorista
        </button>
      </div>

      {/* Lista de Motoristas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listaMotoristas.map((m) => (
          <div
            key={m.id}
            className="p-4 bg-[#0B1329] border border-slate-800 hover:border-cyan-500/40 rounded-xl space-y-2.5 transition-all"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  {m.nome?.slice(0, 2)}
                </div>
                <h4 className="font-bold text-sm text-white">{m.nome}</h4>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold">
                {m.status || 'Ativo'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block text-[11px]">Veículo Vinculado:</span>
                <strong className="text-cyan-400">{m.placa}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Telefone / Contato:</span>
                <span>{m.telefone || 'Não informado'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Cadastro de Motorista */}
      <Modal
        isOpen={showNovoMotoristaModal}
        onClose={() => setShowNovoMotoristaModal(false)}
        title="Cadastrar Motorista"
        subtitle="Adicione um novo condutor à base da JSM Transporte"
      >
        <form onSubmit={handleSalvarMotorista} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nome Completo do Motorista *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: SILVIO LUIZ MOJANO"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold uppercase focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Placa do Veículo Principal *</label>
            <input
              type="text"
              required
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              placeholder="Ex: CVP-3G01"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Telefone WhatsApp</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Ex: (11) 99999-8888"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {salvando ? (
                <>
                  <Icon name="refresh" className="w-4 h-4 animate-spin" />
                  Cadastrando Motorista...
                </>
              ) : (
                <>
                  <Icon name="check" className="w-4 h-4" />
                  Salvar Cadastro
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
