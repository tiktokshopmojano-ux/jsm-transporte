// src/components/admin/AdminNavigation.jsx
// Barra de navegação responsiva do painel administrativo com contadores e atalhos

import React from 'react';
import { Icon } from '../common/Icons';

export const AdminNavigation = ({
  activeTab,
  onSelectTab,
  despesasPendentes = 0,
  ocorrenciasAbertas = 0
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Visão Geral', icon: 'trending-up' },
    { id: 'viagens', label: 'Viagens', icon: 'file-text' },
    {
      id: 'despesas',
      label: 'Despesas',
      icon: 'fuel',
      badge: despesasPendentes > 0 ? despesasPendentes : null,
      badgeColor: 'bg-amber-500 text-slate-950'
    },
    { id: 'frota', label: 'Frota', icon: 'truck' },
    { id: 'motoristas', label: 'Motoristas', icon: 'users' },
    {
      id: 'ocorrencias',
      label: 'Ocorrências',
      icon: 'alert-triangle',
      badge: ocorrenciasAbertas > 0 ? ocorrenciasAbertas : null,
      badgeColor: 'bg-red-500 text-white animate-pulse'
    },
    { id: 'metas', label: 'Metas', icon: 'target' },
    { id: 'expansao', label: 'Expansão', icon: 'rocket' }
  ];

  return (
    <>
      {/* Barra de Navegação Superior para Telas Maiores (Desktop / Tablet) */}
      <div className="hidden lg:block bg-[#111C38] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon name={tab.icon} className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra de Navegação Inferior Fixa para Dispositivos Móveis */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#111C38] border-t border-slate-800/80 z-40 px-2 py-1 flex items-center justify-between overflow-x-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[64px] flex-1 ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative mb-1">
                <Icon name={tab.icon} className="w-5 h-5" />
                {tab.badge && (
                  <span className={`absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full text-[9px] font-extrabold ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] uppercase tracking-wider">{tab.label}</span>
              {isActive && <div className="absolute bottom-0 w-8 h-1 bg-cyan-500 rounded-t-full" />}
            </button>
          );
        })}
      </nav>
    </>
  );
};
