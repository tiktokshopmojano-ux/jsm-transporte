// src/pages/DriverView.jsx
// Visualização completa e moderna para o motorista no smartphone / tablet

import React, { useState, useEffect } from 'react';
import { DriverHeader } from '../components/driver/DriverHeader';
import { RomaneioCard } from '../components/driver/RomaneioCard';
import { OcorrenciaModal } from '../components/driver/OcorrenciaModal';
import { ScannerModal } from '../components/driver/ScannerModal';
import { DriverHistoryModal } from '../components/driver/DriverHistoryModal';
import { DriverDesempenhoTab } from '../components/driver/DriverDesempenhoTab';
import { Modal } from '../components/common/Modal';
import { Icon } from '../components/common/Icons';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';

const DEFAULT_ROMANEIO_DATA = {
  id: '98473',
  empresa: 'APETITO FOODS LTDA',
  cidade: 'SÃO PAULO',
  pesoBruto: '873,965 kg',
  qtdTotal: 97
};

export const DriverView = ({
  currentUser,
  todayDate,
  fbViagens = [],
  fbDespesas = [],
  usedRomaneioRecords = [],
  setUsedRomaneioRecords,
  onLogout,
  onShowToast
}) => {
  // Sincronização da aba do motorista com a URL e histórico do navegador
  const getDriverHashTab = () => {
    const hash = window.location.hash.replace('#', '');
    return hash === 'desempenho' ? 'desempenho' : 'rota';
  };

  const [driverTab, setDriverTab] = useState(getDriverHashTab);

  const handleSelectDriverTab = (tabId) => {
    setDriverTab(tabId);
    if (window.location.hash !== '#' + tabId) {
      window.history.pushState({ tab: tabId }, '', '#' + tabId);
    }
  };

  // Suporte ao botão voltar do celular/navegador
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState({ tab: 'rota' }, '', '#rota');
    }

    const handlePopState = () => {
      setDriverTab(getDriverHashTab());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Estados do Motorista
  const [romaneio] = useState(DEFAULT_ROMANEIO_DATA);
  const [extractedData, setExtractedData] = useState(null);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [tripCompleted, setTripCompleted] = useState(false);

  // Modais
  const [showOcorrenciaModal, setShowOcorrenciaModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerType, setScannerType] = useState('romaneio');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false);

  // Histórico de viagens do motorista atual
  const motoristaTrips = fbViagens.filter(
    (t) => t.motorista?.toUpperCase() === currentUser.name?.toUpperCase()
  );

  // Abrir scanner
  const handleOpenScanner = (type) => {
    setScannerType(type);
    setShowScannerModal(true);
  };

  // Processar leitura da foto da câmera
  const handleProcessScan = ({ file, scannerType: type, litros, valor, posto, onSuccess, onError }) => {
    const capturedAt = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setTimeout(async () => {
      if (type === 'romaneio') {
        const rawName = file.name.toLowerCase();
        const dateMatch = rawName.match(/(\d{2})[-_](\d{2})[-_](\d{4})/);
        const extractedDocDate = dateMatch
          ? `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`
          : todayDate;
        const idMatch = rawName.match(/romaneio[-_]?(\d+)/i);
        const extractedId = idMatch ? idMatch[1] : romaneio.id;

        const capturedRomaneio = {
          id: extractedId,
          empresa: romaneio.empresa,
          cidade: romaneio.cidade,
          pesoBruto: romaneio.pesoBruto,
          qtdTotal: romaneio.qtdTotal,
          dataDocumento: extractedDocDate,
          arquivoNome: file.name,
          capturadoEm: capturedAt
        };

        // Validação de data
        if (capturedRomaneio.dataDocumento !== todayDate) {
          onError(
            `Romaneio recusado: a data identificada (${capturedRomaneio.dataDocumento}) não confere com a data de hoje (${todayDate}). Tire foto do romaneio atual.`
          );
          return;
        }

        // Validação de duplicidade
        const isDuplicate = usedRomaneioRecords.some(
          (item) => item.id === capturedRomaneio.id && item.dataDocumento === capturedRomaneio.dataDocumento
        );

        if (isDuplicate) {
          onError(
            `Romaneio #${capturedRomaneio.id} já foi validado hoje (${todayDate}). Tire a foto de um romaneio ainda não utilizado.`
          );
          return;
        }

        setUsedRomaneioRecords((prev) => [
          ...prev,
          { id: capturedRomaneio.id, dataDocumento: capturedRomaneio.dataDocumento }
        ]);
        setExtractedData(capturedRomaneio);
        setPhotoCaptured(true);
        onSuccess();

        onShowToast({
          type: 'success',
          title: `Romaneio #${capturedRomaneio.id} Validado!`,
          desc: `Data conferida (${capturedRomaneio.dataDocumento}) • Peso: ${capturedRomaneio.pesoBruto} • Rota liberada.`
        });
      } else {
        // Combustível / Despesa
        try {
          await addDoc(collection(db, 'despesas'), {
            motorista: currentUser.name,
            placa: currentUser.driverId,
            tipo: 'Combustível',
            litros: litros || 85,
            valor: valor || 480,
            posto: posto || 'Posto Rodoanel',
            comprovanteArquivo: file.name,
            status: 'Pendente',
            data: todayDate,
            hora: capturedAt,
            criadoEm: new Date().toISOString()
          });

          onSuccess();
          onShowToast({
            type: 'success',
            title: 'Abastecimento Registrado!',
            desc: `Comprovante (${litros}L - R$ ${valor}) enviado para aprovação da gestão.`
          });
        } catch (err) {
          console.error('Erro ao salvar despesa:', err);
          onError('Erro ao sincronizar comprovante com o Firebase.');
        }
      }
    }, 1200);
  };

  // Solicitar finalização de rota
  const handleRequestFinishTrip = () => {
    if (!photoCaptured || !extractedData) {
      onShowToast({
        type: 'warning',
        title: 'Foto Obrigatória!',
        desc: `Capture e valide a foto do romaneio de hoje (${todayDate}) antes de finalizar a rota.`
      });
      return;
    }
    setShowFinishConfirmModal(true);
  };

  // Confirmar e gravar no Firebase
  const handleConfirmFinishTrip = async () => {
    setShowFinishConfirmModal(false);

    try {
      await addDoc(collection(db, 'viagens'), {
        motorista: currentUser.name,
        placa: currentUser.driverId ?? '',
        valor: 675,
        status: 'Finalizada',
        romaneioId: extractedData.id,
        romaneioDataDocumento: extractedData.dataDocumento,
        romaneioCidade: extractedData.cidade,
        romaneioPesoBruto: extractedData.pesoBruto,
        romaneioQtdTotal: extractedData.qtdTotal,
        romaneioArquivo: extractedData.arquivoNome,
        romaneioFotoEnviada: true,
        data: todayDate,
        criadoEm: new Date().toISOString()
      });

      setTripCompleted(true);
      onShowToast({
        type: 'success',
        title: 'Viagem Finalizada com Sucesso!',
        desc: 'Todos os dados e comprovantes foram entregues à gestão.'
      });
    } catch (err) {
      console.error('Erro ao finalizar viagem:', err);
      onShowToast({
        type: 'error',
        title: 'Erro ao Finalizar Viagem',
        desc: 'Não foi possível gravar no servidor. Verifique a conexão com a internet.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Cabeçalho */}
      <DriverHeader
        user={currentUser}
        todayDate={todayDate}
        onLogout={onLogout}
      />

      <main className="max-w-md mx-auto w-full p-4 flex-1 space-y-4">
        {/* Seletor de Abas do Motorista: Rota vs Meu Desempenho */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSelectDriverTab('rota')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              driverTab === 'rota'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon name="truck" className="w-4 h-4" />
            Minha Rota
          </button>

          <button
            type="button"
            onClick={() => handleSelectDriverTab('desempenho')}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              driverTab === 'desempenho'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon name="award" className="w-4 h-4" />
            Meu Desempenho
          </button>
        </div>

        {/* CONTEÚDO DA ABA 1: ROTA & OPERAÇÃO */}
        {driverTab === 'rota' && (
          <>
            {/* Card do Romaneio */}
            <RomaneioCard
              romaneio={romaneio}
              extractedData={extractedData}
              todayDate={todayDate}
              photoCaptured={photoCaptured}
              tripCompleted={tripCompleted}
              onOpenScanner={handleOpenScanner}
              onOpenOcorrencia={() => setShowOcorrenciaModal(true)}
              onRequestFinishTrip={handleRequestFinishTrip}
            />

            {/* Botão de Histórico de Viagens Concluídas */}
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Icon name="history" className="w-4 h-4 text-cyan-400" />
              Ver Minhas Viagens Concluídas ({motoristaTrips.length})
            </button>
          </>
        )}

        {/* CONTEÚDO DA ABA 2: MEU DESEMPENHO (100% SOMENTE LEITURA) */}
        {driverTab === 'desempenho' && (
          <DriverDesempenhoTab
            user={currentUser}
            viagens={fbViagens}
            despesas={fbDespesas}
          />
        )}
      </main>

      {/* MODAIS DO MOTORISTA */}
      <OcorrenciaModal
        isOpen={showOcorrenciaModal}
        onClose={() => setShowOcorrenciaModal(false)}
        user={currentUser}
        todayDate={todayDate}
        onOcorrenciaEnviada={(toast) => onShowToast(toast)}
      />

      <ScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        scannerType={scannerType}
        todayDate={todayDate}
        onProcessScan={handleProcessScan}
      />

      <DriverHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        trips={motoristaTrips}
      />

      {/* Confirmação de Finalização de Viagem */}
      <Modal
        isOpen={showFinishConfirmModal}
        onClose={() => setShowFinishConfirmModal(false)}
        title="Finalizar Rota de Hoje?"
        subtitle="Confirmação de encerramento da jornada de entregas"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <Icon name="check" className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-300">
            Você está prestes a encerrar a rota do romaneio <strong className="text-white">#{extractedData?.id}</strong>.
            Os dados serão consolidados no faturamento e entregues ao setor administrativo.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowFinishConfirmModal(false)}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleConfirmFinishTrip}
              className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all"
            >
              Sim, Finalizar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
