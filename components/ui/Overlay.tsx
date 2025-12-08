
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface OverlayProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  currentOverlay?: string; // To highlight active link
  onNavigate?: (menu: string) => void; // To switch overlays
}

const MENU_ITEMS = [
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'team-packs', label: 'Team Packs' },
  { id: 'fabrics', label: 'Fabrics' },
  { id: 'tournaments', label: 'Tournaments' },
  { id: 'contact', label: 'Contact' },
];

export const Overlay: React.FC<OverlayProps> = ({ title, onClose, children, currentOverlay, onNavigate }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Wait for animation to finish
  };

  const handleNavClick = (id: string) => {
    if (id === currentOverlay) return;
    if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 transition-all duration-300 ${isClosing ? 'opacity-0' : (isMounted ? 'opacity-100' : 'opacity-0')}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-brand-black transition-opacity duration-200 ease-out ${isClosing ? 'opacity-0' : (isMounted ? 'opacity-100' : 'opacity-0')
          }`}
        onClick={handleClose}
      />


      {/* Header Controls - Floating Fixed Top Right */}
      <div className="absolute top-6 right-6 z-[110] flex items-center gap-4">

        {/* Secondary Navigation (Desktop Only) */}
        {onNavigate && (
          <nav className="hidden md:flex bg-brand-gray/90 border border-brand-border rounded-full p-1.5 shadow-2xl items-center">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                            relative px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300
                            ${currentOverlay === item.id ? 'text-brand-black bg-brand-accent shadow-[0_0_15px_rgba(210,248,2,0.3)]' : 'text-brand-secondary hover:text-brand-white hover:bg-brand-white/5'}
                        `}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="p-3 rounded-full bg-brand-gray/90 text-brand-white hover:bg-brand-white hover:text-brand-black transition-all hover:rotate-90 backdrop-blur-md border border-brand-border shadow-xl group"
        >
          <X size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Content Container */}
      <div
        className={`
            relative w-full max-w-7xl h-full max-h-full flex flex-col 
            bg-transparent rounded-3xl overflow-hidden
            transform transition-all duration-300 delay-150 cubic-bezier(0.34, 1.56, 0.64, 1)
            ${isClosing ? 'scale-95 opacity-0' : (isMounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0')}
        `}
      >

        {/* Scrollable Body - Hidden Scrollbar */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 no-scrollbar">

          {/* Fade wrapper for content switching */}
          <div key={currentOverlay} className="animate-fade-in">
            {/* Large Integrated Header */}
            <div className="mb-12 mt-5 max-w-4xl">
              <h2 className="font-display text-4xl md:text-6xl uppercase italic text-brand-white tracking-tighter leading-[0.85] mb-6">
                {title}<span className="text-brand-accent">.</span>
              </h2>
              <div className="h-1 w-24 bg-brand-gray rounded-full" />
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
