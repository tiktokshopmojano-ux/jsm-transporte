// src/components/admin/tabs/ViagensTab.jsx
// Gestão de viagens e romaneios com filtros de busca e exportação para CSV

import React, { useState } from 'react';
import { Icon } from '../../common/Icons';
import { Modal } from '../../common/Modal';

export const ViagensTab = ({ viagens = [] }) => {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [viagemDetalhe, setViagemDetalhe] = useState(null);

  // Filtragem dinâmica
  const viagensFiltradas = viagens.filter((item) => {
    const textoMatch =
      item.motorista?.toLowerCase().includes(busca.toLowerCase()) ||
      item.placa?.toLowerCase().includes(busca.toLowerCase()) ||
      String(item.romaneioId || '').includes(busca);

    const statusMatch =
      filtroStatus === 'todos' || item.status?.toLowerCase() === filtroStatus.toLowerCase();

    return textoMatch && statusMatch;
  });

  // Exportar dados para CSV
  const exportarCSV = () => {
    if (viagensFiltradas.length === 0) {
      alert('Não há viagens para exportar com os filtros atuais.');
      return;
    }

    const cabecalho = ['ID', 'Motorista', 'Placa', 'Romaneio', 'Destino', 'Peso', 'Itens', 'Valor_RS', 'Data', 'Status'];
    const linhas = viagensFiltradas.map((v) => [
      v.id,
      `"${v.motorista || ''}"`,
      `"${v.placa || ''}"`,
      `"${v.romaneioId || ''}"`,
      `"${v.romaneioCidade || ''}"`,
      `"${v.romaneioPesoBruto || ''}"`,
      v.romaneioQtdTotal || 0,
      v.valor || 0,
      `"${v.data || ''}"`,
      `"${v.status || ''}"`
    ]);

    const conteudoCSV = [cabecalho.join(';'), ...linhas.map((e) => e.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_viagens_jsm_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#111C38] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Barra de Ações: Título e Botão de Exportação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Icon name="file-text" className="w-5 h-5 text-cyan-400" />
            Controle de Viagens e Romaneios ({viagensFiltradas.length})
          </h3>
          <p className="text-xs text-slate-400">Registros em tempo real transmitidos pelos motoristas</p>
        </div>

        <button
          type="button"
          onClick={exportarCSV}
          className="py-2 px-3.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Icon name="download" className="w-4 h-4" />
          Exportar Relatório CSV
        </button>
      </div>

      {/* Filtros de Busca e Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por motorista, placa ou nº do romaneio..."
            className="w-full bg-[#0B1329] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white pl-10 focus:outline-none focus:border-cyan-500"
          />
          <Icon name="search" className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        </div>

        <div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full bg-[#0B1329] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="finalizada">Apenas Finalizadas</option>
            <option value="em andamento">Apenas Em Andamento</option>
          </select>
        </div>
      </div>

      {/* Lista de Viagens */}
      <div className="space-y-3 pt-1">
        {viagensFiltradas.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <Icon name="file-text" className="w-8 h-8 mx-auto mb-2 opacity-40" />
            Nenhuma viagem encontrada com os critérios informados.
          </div>
        ) : (
          viagensFiltradas.map((log) => (
            <div
              key={log.id}
              className="p-4 bg-[#0B1329] border border-slate-800 hover:border-cyan-500/40 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-cyan-400">Placa: {log.placa}</span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold">
                    {log.status || 'Finalizada'}
                  </span>
                  {log.romaneioId && (
                    <span className="text-[11px] text-slate-400">
                      • Romaneio #{log.romaneioId}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
                  <p>Motorista: <strong className="text-white block">{log.motorista}</strong></p>
                  <p>Destino: <strong className="text-emerald-400 block">{log.romaneioCidade || 'SÃO PAULO'}</strong></p>
                  <p>Data: <span className="block text-slate-400">{log.data || 'Hoje'}</span></p>
                  <p>Faturamento: <strong className="text-cyan-300 block">R$ {log.valor || 675}</strong></p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setViagemDetalhe(log)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Icon name="eye" className="w-3.5 h-3.5" />
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalhes da Viagem */}
      {viagemDetalhe && (
        <Modal
          isOpen={true}
          onClose={() => setViagemDetalhe(null)}
          title={`Detalhes da Viagem • Placa ${viagemDetalhe.placa}`}
          subtitle={`Romaneio #${viagemDetalhe.romaneioId || '---'}`}
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Motorista:</span>
                <strong className="text-white text-sm">{viagemDetalhe.motorista}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Faturamento Gerado:</span>
                <strong className="text-emerald-400 text-sm">R$ {viagemDetalhe.valor}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Cidade / Destino:</span>
                <span className="text-white">{viagemDetalhe.romaneioCidade || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Data do Documento:</span>
                <span className="text-cyan-300">{viagemDetalhe.romaneioDataDocumento || viagemDetalhe.data}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Peso Bruto:</span>
                <span className="text-white">{viagemDetalhe.romaneioPesoBruto || '---'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Quantidade de Itens:</span>
                <span className="text-white">{viagemDetalhe.romaneioQtdTotal ? `${viagemDetalhe.romaneioQtdTotal} un` : '---'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Arquivo do Romaneio Capturado:</span>
              <p className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-cyan-300 font-mono">
                {viagemDetalhe.romaneioArquivo || 'Foto direta capturada'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
