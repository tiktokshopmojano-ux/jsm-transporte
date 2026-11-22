// src/components/driver/ScannerModal.jsx
// Modal de captura de foto pela câmera para Romaneio e Comprovante de Combustível

import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Icon } from '../common/Icons';

export const ScannerModal = ({
  isOpen,
  onClose,
  scannerType,
  todayDate,
  onProcessScan
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [litros, setLitros] = useState('85');
  const [valorCombustivel, setValorCombustivel] = useState('480.00');
  const [postoNome, setPostoNome] = useState('Posto Ipiranga Rodoanel');
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, capture uma imagem válida diretamente pela câmera.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleConfirmScan = () => {
    if (!selectedFile) {
      setErrorMsg('Tire uma foto antes de continuar.');
      return;
    }

    setScanning(true);
    setErrorMsg('');

    // Processar e encaminhar dados
    onProcessScan({
      file: selectedFile,
      scannerType,
      litros: Number(litros) || 0,
      valor: Number(valorCombustivel) || 0,
      posto: postoNome,
      onSuccess: () => {
        setScanning(false);
        handleClose();
      },
      onError: (msg) => {
        setScanning(false);
        setErrorMsg(msg);
      }
    });
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg('');
    setScanning(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={scannerType === 'romaneio' ? 'Câmera: Foto do Romaneio' : 'Câmera: Cupom de Combustível'}
      subtitle={`Data atual do app: ${todayDate}`}
    >
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Área de Visualização / Captura */}
        <div className="relative min-h-[220px] bg-slate-950 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-4 text-center gap-3">
          {scanning ? (
            <div className="flex flex-col items-center gap-2">
              <Icon name="refresh" className="w-10 h-10 text-cyan-400 animate-spin" />
              <p className="text-xs text-cyan-300 font-semibold">Validando e processando foto...</p>
            </div>
          ) : previewUrl ? (
            <div className="w-full space-y-2">
              <img
                src={previewUrl}
                alt="Foto capturada"
                className="max-h-44 w-full object-contain rounded-lg border border-slate-800 bg-black"
              />
              <p className="text-[11px] text-emerald-400 font-medium truncate">
                Foto capturada: {selectedFile?.name}
              </p>
            </div>
          ) : (
            <>
              <Icon name="camera" className="w-10 h-10 text-slate-500" />
              <p className="text-xs text-slate-300 max-w-xs">
                {scannerType === 'romaneio'
                  ? `Posicione o romaneio em local iluminado. Validação da data de hoje (${todayDate}).`
                  : 'Fotografe o cupom fiscal ou comprovante da bomba com valores visíveis.'}
              </p>
            </>
          )}

          {!scanning && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Icon name="camera" className="w-4 h-4" />
              {selectedFile ? 'Tirar Outra Foto' : 'Abrir Câmera'}
            </button>
          )}
        </div>

        {/* Campos extras para combustível */}
        {scannerType === 'combustivel' && (
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Litros Abastecidos:</label>
              <input
                type="number"
                value={litros}
                onChange={(e) => setLitros(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Valor Total (R$):</label>
              <input
                type="number"
                value={valorCombustivel}
                onChange={(e) => setValorCombustivel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-amber-400"
              />
            </div>
            <div className="col-span-2 mt-1">
              <label className="block text-slate-400 text-[11px] mb-1">Nome do Posto / Cidade:</label>
              <input
                type="text"
                value={postoNome}
                onChange={(e) => setPostoNome(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
          </div>
        )}

        {errorMsg && (
          <p className="text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800/60 rounded-xl p-3 text-center">
            {errorMsg}
          </p>
        )}

        <button
          type="button"
          disabled={!selectedFile || scanning}
          onClick={handleConfirmScan}
          className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            selectedFile && !scanning
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Icon name="sparkles" className="w-4 h-4" />
          {selectedFile ? 'Confirmar e Processar Foto' : 'Aguardando Captura da Foto'}
        </button>
      </div>
    </Modal>
  );
};
