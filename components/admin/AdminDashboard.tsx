
import React, { useState } from 'react';
import { ArrowLeft, Layout, Database, ShoppingBag } from 'lucide-react';
import { LibraryViewer } from './LibraryViewer';
import { TemplateBuilder } from './TemplateBuilder';
import { OrdersOverview } from './OrdersOverview';

export const AdminDashboard = ({ onExit }: { onExit: () => void }) => {
  const [tab, setTab] = useState<'orders' | 'library' | 'builder'>('orders');
  const [builderInit, setBuilderInit] = useState<{front: string, back: string} | null>(null);

  const handleEdit = (front: string, back: string) => {
      setBuilderInit({ front, back });
      setTab('builder');
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col text-white overflow-hidden animate-fade-in" style={{ backgroundColor: '#000000' }}>
      {/* Admin Header */}
      <div className="h-16 shrink-0 border-b border-neutral-800 flex items-center justify-between px-6" style={{ backgroundColor: '#171717' }}>
        <div className="flex items-center gap-4">
            <button 
                onClick={onExit}
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
                <ArrowLeft size={16} /> Exit Portal
            </button>
            <div className="h-6 w-px bg-neutral-800" />
            <h1 className="font-display text-xl italic text-white">VORTEX <span className="text-brand-accent">ADMIN</span></h1>
        </div>

        <div className="flex gap-2 bg-black p-1 rounded-lg border border-neutral-800">
            <button
                onClick={() => setTab('orders')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${tab === 'orders' ? 'bg-brand-accent text-black shadow-lg' : 'text-neutral-400 hover:text-white'}`}
            >
                <ShoppingBag size={14} /> Orders
            </button>
            <button
                onClick={() => setTab('library')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${tab === 'library' ? 'bg-brand-accent text-black shadow-lg' : 'text-neutral-400 hover:text-white'}`}
            >
                <Database size={14} /> Library
            </button>
            <button
                onClick={() => setTab('builder')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${tab === 'builder' ? 'bg-brand-accent text-black shadow-lg' : 'text-neutral-400 hover:text-white'}`}
            >
                <Layout size={14} /> Builder Tool
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6" style={{ backgroundColor: '#0a0a0a' }}>
         <div className="h-full max-w-7xl mx-auto flex flex-col">
            {tab === 'orders' ? (
                <OrdersOverview />
            ) : tab === 'library' ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <LibraryViewer onEdit={handleEdit} />
                </div>
            ) : (
                <TemplateBuilder initialData={builderInit} />
            )}
         </div>
      </div>
    </div>
  );
};
