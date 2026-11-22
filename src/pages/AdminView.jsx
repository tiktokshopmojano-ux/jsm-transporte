// src/pages/AdminView.jsx
// Visualização completa e moderna do Painel Administrativo

import React, { useState } from 'react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminNavigation } from '../components/admin/AdminNavigation';
import { DashboardTab } from '../components/admin/tabs/DashboardTab';
import { ViagensTab } from '../components/admin/tabs/ViagensTab';
import { DespesasTab } from '../components/admin/tabs/DespesasTab';
import { FrotaTab } from '../components/admin/tabs/FrotaTab';
import { MotoristasTab } from '../components/admin/tabs/MotoristasTab';
import { OcorrenciasTab } from '../components/admin/tabs/OcorrenciasTab';
import { MetasTab } from '../components/admin/tabs/MetasTab';
import { ExpansaoTab } from '../components/admin/tabs/ExpansaoTab';
import { ConfiguracoesTab } from '../components/admin/tabs/ConfiguracoesTab';

export const AdminView = ({
  currentUser,
  totalRevenue = 0,
  fbViagens = [],
  fbDespesas = [],
  fbVeiculos = [],
  fbMotoristas = [],
  fbOcorrencias = [],
  metasConfig = {},
  onLogout,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const despesasPendentes = fbDespesas.filter((d) => d.status === 'Pendente').length;
  const ocorrenciasAbertas = fbOcorrencias.filter((o) => o.status === 'Aberta').length;

  return (
    <div className="min-h-screen bg-[#0B1329] text-slate-100 flex flex-col font-sans pb-24 lg:pb-12">
      {/* Cabeçalho */}
      <AdminHeader
        user={currentUser}
        totalViagens={fbViagens.length}
        onLogout={onLogout}
      />

      {/* Navegação de Abas */}
      <AdminNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        despesasPendentes={despesasPendentes}
        ocorrenciasAbertas={ocorrenciasAbertas}
      />

      {/* Área Principal de Conteúdo */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 flex-1">
        {activeTab === 'dashboard' && (
          <DashboardTab
            totalRevenue={totalRevenue}
            viagens={fbViagens}
            despesas={fbDespesas}
            veiculos={fbVeiculos}
            motoristas={fbMotoristas}
            ocorrencias={fbOcorrencias}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'viagens' && (
          <ViagensTab viagens={fbViagens} onShowToast={onShowToast} />
        )}

        {activeTab === 'despesas' && (
          <DespesasTab despesas={fbDespesas} onShowToast={onShowToast} />
        )}

        {activeTab === 'frota' && (
          <FrotaTab veiculos={fbVeiculos} onShowToast={onShowToast} />
        )}

        {activeTab === 'motoristas' && (
          <MotoristasTab
            motoristas={fbMotoristas}
            veiculos={fbVeiculos}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'ocorrencias' && (
          <OcorrenciasTab
            ocorrencias={fbOcorrencias}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'metas' && (
          <MetasTab
            totalRevenue={totalRevenue}
            totalViagens={fbViagens.length}
            metasConfig={metasConfig}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'expansao' && (
          <ExpansaoTab totalRevenue={totalRevenue} />
        )}

        {activeTab === 'configuracoes' && (
          <ConfiguracoesTab
            metasConfig={metasConfig}
            viagens={fbViagens}
            despesas={fbDespesas}
            ocorrencias={fbOcorrencias}
            onShowToast={onShowToast}
          />
        )}
      </main>
    </div>
  );
};
