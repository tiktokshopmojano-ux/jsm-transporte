// src/components/driver/ChecklistModal.jsx
// Checklist diário de inspeção veicular pré-viagem (segurança e conformidade)

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Icon } from '../common/Icons';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';

export const ChecklistModal = ({ isOpen, onClose, user, todayDate, onChecklistCompleted }) => {
  const [odometro, setOdometro] = useState('');
  const [items, setItems] = useState({
    oleoAgua: true,
    pneusEstepe: true,
    iluminacao: true,
    freios: true,
    documentacao: true,
    limpezaCabine: true
  });
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  const toggleItem = (key) => {
    setItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!odometro.trim()) {
      alert('Por favor, informe a quilometragem atual do odômetro.');
      return;
    }

    setSalvando(true);
    try {
      await addDoc(collection(db, 'checklists'), {
        motorista: user.name,
        placa: user.driverId,
        data: todayDate,
        odometroInicial: Number(odometro),
        itens: items,
        observacao: observacao.trim(),
        criadoEm: new Date().toISOString()
      });

      onChecklistCompleted(true);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar checklist:', err);
      alert('Não foi possível salvar o checklist. Verifique sua conexão.');
    } finally {
      setSalvando(false);
    }
  };

  const checklistFields = [
    { key: 'oleoAgua', label: 'Nível de Óleo do Motor e Água do Radiador' },
    { key: 'pneusEstepe', label: 'Calibragem dos Pneus e Condição do Estepe' },
    { key: 'iluminacao', label: 'Faróis, Lanternas, Setas e Luzes de Freio' },
    { key: 'freios', label: 'Freio de Serviço e Freio de Estacionamento' },
    { key: 'documentacao', label: 'Documentação do Veículo (CRLV) e CNH Válida' },
    { key: 'limpezaCabine', label: 'Cabine Limpa, Cinto de Segurança e Retrovisores' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Checklist Pré-Viagem"
      subtitle={`Inspeção de segurança diária • Placa ${user.driverId}`}
    >
      <form onSubmit={handleSalvar} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Odômetro Inicial (KM) *
          </label>
          <div className="relative">
            <input
              type="number"
              required
              value={odometro}
              onChange={(e) => setOdometro(e.target.value)}
              placeholder="Ex: 148250"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500 pl-10"
            />
            <Icon name="gauge" className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <p className="text-xs font-semibold text-slate-300">Itens de Inspeção Rápida:</p>
          <div className="space-y-2">
            {checklistFields.map((field) => (
              <button
                key={field.key}
                type="button"
                onClick={() => toggleItem(field.key)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                  items[field.key]
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/40 text-red-200'
                }`}
              >
                <span>{field.label}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  items[field.key] ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {items[field.key] ? 'Conforme' : 'Irregular'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Observações Adicionais (opcional)
          </label>
          <textarea
            rows="2"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex: Pequeno risco na lateral direita, farol de milha direito queimado..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={salvando}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {salvando ? (
              <>
                <Icon name="refresh" className="w-4 h-4 animate-spin" />
                Salvando Inspeção...
              </>
            ) : (
              <>
                <Icon name="check" className="w-4 h-4" />
                Confirmar Checklist e Iniciar Rota
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
