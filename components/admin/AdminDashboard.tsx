import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Palette } from 'lucide-react';
import { OrdersOverview } from './OrdersOverview';
import { TemplateManager } from './TemplateManager';

export const AdminDashboard = ({ onExit }: { onExit: () => void }) => {
  const [tab, setTab] = useState<'orders' | 'templates'>('templates');

  return (
    <div className="fixed inset-0 z-[200] flex flex-col text-white overflow-hidden animate-fade-in" style={{ backgroundColor: '#000000' }}>
      <div className="h-16 shrink-0 border-b border-neutral-800 flex items-center justify-between px-6" style={{ backgroundColor: '#171717' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Exit Portal
          </button>
          <div className="h-6 w-px bg-neutral-800" />
          <h1 className="font-display text-xl italic text-white">
            VORTEX <span className="text-brand-accent">ADMIN</span>
          </h1>
        </div>

        <div className="flex gap-2 bg-black p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setTab('orders')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
              tab === 'orders' ? 'bg-brand-accent text-black shadow-lg' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={14} /> Orders
          </button>
          <button
            onClick={() => setTab('templates')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
              tab === 'templates' ? 'bg-brand-accent text-black shadow-lg' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Palette size={14} /> Templates
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
        {tab === 'orders' ? (
          <div className="h-full max-w-7xl mx-auto flex flex-col p-6">
            <OrdersOverview />
          </div>
        ) : (
          <TemplateManager />
        )}
      </div>
    </div>
  );
};
