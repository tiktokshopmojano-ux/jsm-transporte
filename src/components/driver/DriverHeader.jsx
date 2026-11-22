// src/components/driver/DriverHeader.jsx
// Cabeçalho da visualização do motorista com informações do veículo e suporte

import React from 'react';
import { Icon } from '../common/Icons';

export const DriverHeader = ({ user, todayDate, onLogout }) => {
  const whatsappSuporte = '5511999999999'; // Central JSM Transporte
  const mensagemWpp = encodeURIComponent(`Olá, sou o motorista ${user.name} (Placa ${user.driverId}) e preciso de suporte com a rota de hoje.`);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white p-4 sticky top-0 z-30 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <Icon name="truck" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight text-white">
              {user.name}
            </h2>
            <p className="text-xs text-slate-400">
              Placa: <strong className="text-cyan-400">{user.driverId}</strong> • {todayDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Suporte / SOS */}
          <a
            href={`https://wa.me/${whatsappSuporte}?text=${mensagemWpp}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Contatar Central via WhatsApp"
            className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all flex items-center justify-center"
          >
            <Icon name="phone" className="w-4 h-4" />
          </a>

          {/* Botão de Logout */}
          <button
            type="button"
            onClick={onLogout}
            title="Sair do Sistema"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-all"
          >
            <Icon name="logout" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
