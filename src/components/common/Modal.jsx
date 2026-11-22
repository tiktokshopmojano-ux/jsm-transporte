// src/components/common/Modal.jsx
// Componente de modal responsivo e acessível com tema escuro elegante

import React from 'react';
import { Icon } from './Icons';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full ${maxWidth} bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
          <div>
            <h3 className="font-bold text-base text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-slate-200 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};
