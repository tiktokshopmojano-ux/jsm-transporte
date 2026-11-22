// src/components/driver/RomaneioCard.jsx
// Card principal do romaneio ativo com suporte a leitura por câmera e conferência manual

import React, { useState } from 'react';
import { Icon } from '../common/Icons';

export const RomaneioCard = ({
  romaneio,
  extractedData,
  todayDate,
  photoCaptured,
  tripCompleted,
  onOpenScanner,
  onOpenOcorrencia,
  onRequestFinishTrip
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Icon name="file-text" className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-sm text-white">Romaneio de Carga</span>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
            tripCompleted
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
              : photoCaptured
                ? 'bg-cyan-950/60 text-cyan-400 border-cyan-800'
                : 'bg-amber-950/60 text-amber-400 border-amber-800'
          }`}
        >
          {tripCompleted ? 'Finalizada' : photoCaptured ? 'Validado' : 'Aguardando Foto'}
        </span>
      </div>

      {/* Grid de Informações do Romaneio */}
      <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
        <div>
          <span className="text-slate-500 block text-[11px]">Nº Romaneio:</span>
          <span className="font-bold text-white text-sm">#{extractedData?.id || romaneio.id}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Destino / Cidade:</span>
          <span className="font-bold text-emerald-400">{extractedData?.cidade || romaneio.cidade}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Empresa Embarcadora:</span>
          <span className="font-semibold text-slate-200 truncate block">{extractedData?.empresa || romaneio.empresa}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Data de Validação:</span>
          <span className="font-semibold text-cyan-300">{extractedData ? extractedData.dataDocumento : todayDate}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Peso Bruto:</span>
          <span className="font-bold text-slate-200">{extractedData ? extractedData.pesoBruto : romaneio.pesoBruto}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Qtd. Total Itens:</span>
          <span className="font-bold text-slate-200">{extractedData ? `${extractedData.qtdTotal} un` : `${romaneio.qtdTotal} un`}</span>
        </div>
      </div>

      {/* Status da Captura */}
      <div
        className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          photoCaptured && extractedData
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
            : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Icon name={photoCaptured ? 'check' : 'alert-circle'} className="w-4 h-4" />
          Leitura do Romaneio:
        </span>
        <span>
          {photoCaptured && extractedData
            ? `Capturado às ${extractedData.capturadoEm}`
            : 'Pendente (Obrigatório)'}
        </span>
      </div>

      {/* Botões de Ações Rápidas */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onOpenScanner('romaneio')}
          className="py-3 px-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all"
        >
          <Icon name="camera" className="w-5 h-5" />
          {photoCaptured ? 'Tirar Nova Foto' : 'Foto Romaneio *'}
        </button>

        <button
          type="button"
          onClick={() => onOpenScanner('combustivel')}
          className="py-3 px-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all"
        >
          <Icon name="fuel" className="w-5 h-5" />
          Foto Combustível
        </button>
      </div>

      {/* Ação secundária: Reportar Ocorrência */}
      <div className="pt-1 border-t border-slate-800">
        <button
          type="button"
          onClick={onOpenOcorrencia}
          className="w-full py-2.5 px-3 bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-900/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <Icon name="alert-triangle" className="w-4 h-4 text-red-400" />
          Reportar Ocorrência na Rota
        </button>
      </div>

      {/* Botão de Finalização da Rota */}
      {!tripCompleted ? (
        <div className="pt-2">
          <button
            type="button"
            onClick={onRequestFinishTrip}
            className={`w-full py-4 rounded-xl text-xs font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${
              photoCaptured && extractedData
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer shadow-emerald-900/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Icon name="check" className="w-4 h-4" />
            {photoCaptured && extractedData
              ? 'Finalizar Rota / Viagem de Hoje'
              : 'Tire a Foto do Romaneio para Liberar'}
          </button>
        </div>
      ) : (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-center space-y-1">
          <Icon name="check" className="w-6 h-6 text-emerald-400 mx-auto" />
          <h4 className="font-bold text-emerald-300 text-xs">Viagem Concluída com Sucesso!</h4>
          <p className="text-[11px] text-emerald-400/80">Dados sincronizados em tempo real com a gestão.</p>
        </div>
      )}
    </div>
  );
};
