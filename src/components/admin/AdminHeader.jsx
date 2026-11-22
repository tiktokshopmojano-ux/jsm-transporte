// src/components/admin/AdminHeader.jsx
// Cabeçalho do Painel Administrativo

import React from 'react';
import { Icon } from '../common/Icons';

export const AdminHeader = ({ user, totalViagens, onLogout }) => {
  return (
    <header className="bg-[#111C38] border-b border-slate-800/80 sticky top-0 z-30 shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Icon name="shield" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
              PAINEL DE GESTÃO LOGÍSTICA
              <span className="hidden sm:inline-flex text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">
                JSM Transporte
              </span>
            </h1>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Conexão Ativa: Nuvem Firebase • {totalViagens} viagens registradas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex flex-col text-right text-xs">
            <span className="font-bold text-slate-200">{user.name}</span>
            <span className="text-[10px] text-slate-400">Administrador Geral</span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Encerrar Sessão"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 rounded-xl transition-all border border-slate-700/80"
          >
            <Icon name="logout" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
