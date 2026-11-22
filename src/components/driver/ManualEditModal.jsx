// src/components/driver/ManualEditModal.jsx
// Modal para conferência e ajuste manual dos dados do romaneio

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Icon } from '../common/Icons';

export const ManualEditModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    id: initialData?.id || '98473',
    empresa: initialData?.empresa || 'APETITO FOODS LTDA',
    cidade: initialData?.cidade || 'SÃO PAULO',
    pesoBruto: initialData?.pesoBruto || '873,965 kg',
    qtdTotal: initialData?.qtdTotal || 97
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Conferência de Dados do Romaneio"
      subtitle="Ajuste os valores caso a leitura da foto precise de correção"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Número do Romaneio:</label>
          <input
            type="text"
            name="id"
            required
            value={formData.id}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-bold"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Empresa / Embarcador:</label>
          <input
            type="text"
            name="empresa"
            required
            value={formData.empresa}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Cidade de Destino:</label>
          <input
            type="text"
            name="cidade"
            required
            value={formData.cidade}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-semibold text-emerald-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Peso Bruto Total:</label>
            <input
              type="text"
              name="pesoBruto"
              required
              value={formData.pesoBruto}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Qtd. Total de Itens:</label>
            <input
              type="number"
              name="qtdTotal"
              required
              value={formData.qtdTotal}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-bold"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Icon name="check" className="w-4 h-4" />
            Salvar e Atualizar Romaneio
          </button>
        </div>
      </form>
    </Modal>
  );
};
