// src/pages/DriverView.jsx
// Visualização completa e moderna para o motorista no smartphone / tablet

import React, { useState } from 'react';
import { DriverHeader } from '../components/driver/DriverHeader';
import { RomaneioCard } from '../components/driver/RomaneioCard';
import { ParadasList } from '../components/driver/ParadasList';
import { ChecklistModal } from '../components/driver/ChecklistModal';
import { OcorrenciaModal } from '../components/driver/OcorrenciaModal';
import { ScannerModal } from '../components/driver/ScannerModal';
import { ManualEditModal } from '../components/driver/ManualEditModal';
import { DriverHistoryModal } from '../components/driver/DriverHistoryModal';
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
  usedRomaneioRecords = [],
  setUsedRomaneioRecords,
  onLogout,
  onShowToast
}) => {
  // Estados do Motorista
  const [romaneio, setRomaneio] = useState(DEFAULT_ROMANEIO_DATA);
  const [extractedData, setExtractedData] = useState(null);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [tripCompleted, setTripCompleted] = useState(false);
  const [checklistDone, setChecklistDone] = useState(false);

  // Modais
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showOcorrenciaModal, setShowOcorrenciaModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerType, setScannerType] = useState('romaneio');
  const [showManualEditModal, setShowManualEditModal] = useState(false);
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
        checklistDone={checklistDone}
        onLogout={onLogout}
        onOpenChecklist={() => setShowChecklistModal(true)}
      />

      <main className="max-w-md mx-auto w-full p-4 flex-1 space-y-4">
        {/* Banner de Aviso de Checklist */}
        {!checklistDone && (
          <div
            onClick={() => setShowChecklistModal(true)}
            className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-amber-900/40 transition-all shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <Icon name="check-square" className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-200">Inspeção Pré-Viagem Pendente</p>
                <p className="text-[11px] text-amber-300/80">Toque aqui para conferir pneus, óleo e odômetro.</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
              Fazer Agora
            </span>
          </div>
        )}

        {/* Card do Romaneio */}
        <RomaneioCard
          romaneio={romaneio}
          extractedData={extractedData}
          todayDate={todayDate}
          photoCaptured={photoCaptured}
          tripCompleted={tripCompleted}
          onOpenScanner={handleOpenScanner}
          onOpenOcorrencia={() => setShowOcorrenciaModal(true)}
          onOpenManualEdit={() => setShowManualEditModal(true)}
          onRequestFinishTrip={handleRequestFinishTrip}
        />

        {/* Lista de Paradas / Entregas da Rota com Waze / Google Maps */}
        <ParadasList
          onParadaAtualizada={(lista) => {
            console.log('Paradas atualizadas pelo motorista:', lista);
          }}
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
      </main>

      {/* MODAIS DO MOTORISTA */}
      <ChecklistModal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        user={currentUser}
        todayDate={todayDate}
        onChecklistCompleted={() => {
          setChecklistDone(true);
          onShowToast({
            type: 'success',
            title: 'Inspeção Registrada!',
            desc: 'Checklist de segurança concluído. Boa viagem!'
          });
        }}
      />

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

      <ManualEditModal
        isOpen={showManualEditModal}
        onClose={() => setShowManualEditModal(false)}
        initialData={extractedData || romaneio}
        onSave={(novosDados) => {
          setRomaneio((prev) => ({ ...prev, ...novosDados }));
          if (extractedData) {
            setExtractedData((prev) => ({ ...prev, ...novosDados }));
          }
          onShowToast({
            type: 'info',
            title: 'Romaneio Atualizado',
            desc: 'Dados ajustados com sucesso.'
          });
        }}
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
