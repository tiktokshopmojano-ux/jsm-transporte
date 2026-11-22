// src/pages/LoginView.jsx
// Tela de login moderna com seleção rápida de perfil (Motorista ou Gestor)

import React, { useState } from 'react';
import { Icon } from '../components/common/Icons';

export const LoginView = ({ onLogin, loginError, onClearError }) => {
  const [role, setRole] = useState('driver');
  const [driverName, setDriverName] = useState('SILVIO LUIZ MOJANO');
  const [driverPlate, setDriverPlate] = useState('CVP-3G01');
  const [driverPassword, setDriverPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'driver') {
      onLogin({
        role: 'driver',
        name: driverName.trim().toUpperCase(),
        driverId: driverPlate.trim().toUpperCase(),
        password: driverPassword
      });
    } else {
      onLogin({
        role: 'admin',
        email: adminEmail.trim(),
        password: adminPassword
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Elementos visuais de fundo futuristas */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-8 backdrop-blur-md relative z-10 space-y-6">
        {/* Identidade Visual */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-3">
            <Icon name="truck" className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">JSM Transporte</h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
            <Icon name="map-pin" className="w-3.5 h-3.5 text-emerald-400" />
            Sistema Integrado de Gestão & Rotas
          </p>
        </div>

        {/* Seletor de Perfil */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setRole('driver');
              onClearError();
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'driver'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Icon name="user" className="w-4 h-4" /> Motorista
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              onClearError();
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'admin'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Icon name="shield" className="w-4 h-4" /> Gestor ADM
          </button>
        </div>

        {/* Mensagem de Erro */}
        {loginError && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-300 text-center font-semibold flex items-center justify-center gap-2">
            <Icon name="alert-circle" className="w-4 h-4 shrink-0 text-red-400" />
            <span>{loginError}</span>
          </div>
        )}

        {/* Formulário de Acesso */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {role === 'driver' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome do Motorista
                </label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Ex: SILVIO LUIZ MOJANO"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Placa do Veículo
                </label>
                <input
                  type="text"
                  required
                  value={driverPlate}
                  onChange={(e) => setDriverPlate(e.target.value)}
                  placeholder="Ex: CVP-3G01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-xs font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Senha de Acesso
                </label>
                <input
                  type="password"
                  required
                  value={driverPassword}
                  onChange={(e) => setDriverPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  E-mail do Administrador
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@jsmtransporte.com.br"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Senha de Segurança
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all text-xs shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2"
            >
              <span>Acessar o Painel</span>
              <Icon name="check" className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
