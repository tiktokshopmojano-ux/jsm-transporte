// src/components/common/Toast.jsx
// Notificações visuais modernas para o sistema

import React from 'react';
import { Icon } from './Icons';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'warning':
        return {
          container: 'bg-amber-900/90 border-amber-600/50 text-amber-100',
          iconName: 'alert-triangle',
          iconColor: 'text-amber-400'
        };
      case 'error':
        return {
          container: 'bg-red-950/90 border-red-600/50 text-red-100',
          iconName: 'alert-circle',
          iconColor: 'text-red-400'
        };
      case 'info':
        return {
          container: 'bg-blue-950/90 border-blue-600/50 text-blue-100',
          iconName: 'sparkles',
          iconColor: 'text-blue-400'
        };
      case 'success':
      default:
        return {
          container: 'bg-emerald-950/90 border-emerald-600/50 text-emerald-100',
          iconName: 'check',
          iconColor: 'text-emerald-400'
        };
    }
  };

  const { container, iconName, iconColor } = getStyle();

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-bounce-short">
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 ${container}`}>
        <Icon name={iconName} className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1 text-xs">
          <p className="font-bold tracking-wide">{toast.title}</p>
          <p className="opacity-90 mt-0.5 leading-relaxed">{toast.desc}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:opacity-80 rounded-lg text-slate-400 hover:text-white"
            aria-label="Fechar notificação"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
