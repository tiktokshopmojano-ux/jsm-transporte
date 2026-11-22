// src/components/driver/OcorrenciaModal.jsx
// Modal para reporte rápido de ocorrências na estrada pelo motorista

import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Icon } from '../common/Icons';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';

export const OcorrenciaModal = ({ isOpen, onClose, user, todayDate, onOcorrenciaEnviada }) => {
  const [tipo, setTipo] = useState('Pneu Furado');
  const [gravidade, setGravidade] = useState('Média');
  const [descricao, setDescricao] = useState('');
  const [fotoNome, setFotoNome] = useState('');
  const [fotoPreview, setFotoPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const fileInputRef = useRef(null);

  const tiposOcorrencia = [
    'Pneu Furado / Borracharia',
    'Problema Mecânico / Elétrico',
    'Trânsito Bloqueado / Acidente na Via',
    'Atraso no Recebimento do Cliente',
    'Carga Avariada / Embalagem Rompida',
    'Outros'
  ];

  const handleFoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoNome(file.name);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!descricao.trim()) {
      alert('Por favor, descreva brevemente o que aconteceu.');
      return;
    }

    setEnviando(true);
    try {
      await addDoc(collection(db, 'ocorrencias'), {
        motorista: user.name,
        placa: user.driverId,
        tipo,
        gravidade,
        descricao: descricao.trim(),
        fotoArquivo: fotoNome || 'Sem foto anexada',
        status: 'Aberta',
        data: todayDate,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        criadoEm: new Date().toISOString()
      });

      onOcorrenciaEnviada({
        type: 'warning',
        title: 'Ocorrência Registrada!',
        desc: `Alerta "${tipo}" enviado para a central da JSM Transporte.`
      });

      // Limpar formulário
      setDescricao('');
      setFotoNome('');
      setFotoPreview(null);
      onClose();
    } catch (err) {
      console.error('Erro ao enviar ocorrência:', err);
      alert('Não foi possível registrar a ocorrência. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reportar Ocorrência"
      subtitle="Comunique a central imediatamente sobre imprevistos na rota"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tipo de Ocorrência
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
          >
            {tiposOcorrencia.map((item) => (
              <option key={item} value={item} className="bg-slate-900 text-white">
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nível de Urgência
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Baixa', 'Média', 'Alta'].map((nivel) => (
              <button
                key={nivel}
                type="button"
                onClick={() => setGravidade(nivel)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  gravidade === nivel
                    ? nivel === 'Alta'
                      ? 'bg-red-600/30 border-red-500 text-red-300'
                      : nivel === 'Média'
                        ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                        : 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {nivel}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Descrição do Ocorrido *
          </label>
          <textarea
            required
            rows="3"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Detalhe o local, problema e se necessita de guincho ou apoio..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Captura de Foto da Ocorrência */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFoto}
            className="hidden"
          />
          <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <Icon name="camera" className="w-5 h-5 text-amber-400" />
              <div className="text-xs">
                <p className="font-semibold text-slate-200">Foto do Local / Dano</p>
                <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                  {fotoNome || 'Nenhuma foto anexada'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold border border-slate-700"
            >
              {fotoNome ? 'Alterar' : 'Tirar Foto'}
            </button>
          </div>
          {fotoPreview && (
            <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 max-h-36 bg-black flex items-center justify-center">
              <img src={fotoPreview} alt="Prévia da ocorrência" className="h-36 w-full object-contain" />
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={enviando}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {enviando ? (
              <>
                <Icon name="refresh" className="w-4 h-4 animate-spin" />
                Transmitindo Alerta...
              </>
            ) : (
              <>
                <Icon name="alert-triangle" className="w-4 h-4" />
                Enviar Alerta à Central
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
