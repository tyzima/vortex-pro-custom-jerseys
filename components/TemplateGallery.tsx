import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FaBasketballBall, FaFutbol, FaRunning } from 'react-icons/fa';
import { LacrosseIcon } from './icons/SportsIcons';
import { useTemplateLibrary } from '../contexts/TemplateLibraryContext';
import { JerseySVG } from './JerseySVG';
import { DesignState } from '../types';

interface TemplateGalleryProps {
  onSelectTemplate: (sport: string, cut: string, template: string) => void;
  onBack: () => void;
}

const SPORT_ICONS: Record<string, React.ElementType> = {
  basketball: FaBasketballBall,
  soccer: FaFutbol,
  lacrosse: LacrosseIcon,
  general: FaRunning,
};

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate, onBack }) => {
  const { library, loading } = useTemplateLibrary();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedCut, setSelectedCut] = useState<string | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (library.length > 0 && !selectedSport) {
      setSelectedSport(library[0].id);
    }
  }, [library]);

  useEffect(() => {
    if (selectedSport && !selectedCut) {
      const sport = library.find(s => s.id === selectedSport);
      if (sport && Object.keys(sport.cuts).length > 0) {
        setSelectedCut(Object.keys(sport.cuts)[0]);
      }
    }
  }, [selectedSport, library]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-brand-black flex items-center justify-center z-50">
        <div className="text-brand-accent text-xl font-bold uppercase tracking-widest animate-pulse">
          Loading Templates...
        </div>
      </div>
    );
  }

  const currentSport = library.find(s => s.id === selectedSport);
  const templates = currentSport?.templates || [];

  return (
    <div className="fixed inset-0 bg-brand-black z-50 flex flex-col">
      <div className="h-20 border-b border-neutral-800 flex items-center justify-between px-8" style={{ backgroundColor: '#0a0a0a' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="font-display text-2xl italic text-white">
          Choose Your <span className="text-brand-accent">Template</span>
        </h1>
        <div className="w-24" />
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">Select Sport</h2>
            <div className="flex gap-4">
              {library.map((sport) => {
                const Icon = SPORT_ICONS[sport.id] || FaRunning;
                const isSelected = selectedSport === sport.id;
                return (
                  <button
                    key={sport.id}
                    onClick={() => {
                      setSelectedSport(sport.id);
                      setSelectedCut(null);
                    }}
                    className={`flex items-center gap-3 px-6 py-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-brand-accent text-black border-brand-accent'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-brand-accent hover:text-white'
                    }`}
                  >
                    <Icon size={24} />
                    <span className="font-bold uppercase tracking-widest text-sm">{sport.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {currentSport && (
            <>
              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">Select Cut</h2>
                <div className="flex gap-4">
                  {Object.entries(currentSport.cuts).map(([cutId, cut]) => {
                    const isSelected = selectedCut === cutId;
                    return (
                      <button
                        key={cutId}
                        onClick={() => setSelectedCut(cutId)}
                        className={`px-6 py-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-brand-accent text-black border-brand-accent'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-brand-accent hover:text-white'
                        }`}
                      >
                        <span className="font-bold uppercase tracking-widest text-sm">{cut.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedCut && templates.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6">
                    Choose Template ({templates.length} Available)
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {templates.map((template) => {
                      const isHovered = hoveredTemplate === template.id;

                      const previewDesign: DesignState = {
                        sport: selectedSport!,
                        cut: selectedCut,
                        garmentType: 'jersey',
                        template: template.id,
                        zones: template.layers.reduce((acc, layer) => {
                          acc[layer.id] = {
                            color: layer.id === 'body' ? '#ffffff' : '#0a0a0a',
                            pattern: 'none',
                            patternColor: '#000000',
                            patternMode: 'ghost'
                          };
                          return acc;
                        }, {} as Record<string, any>),
                        textElements: [],
                        logos: []
                      };

                      return (
                        <button
                          key={template.id}
                          onClick={() => onSelectTemplate(selectedSport!, selectedCut, template.id)}
                          onMouseEnter={() => setHoveredTemplate(template.id)}
                          onMouseLeave={() => setHoveredTemplate(null)}
                          className={`group relative bg-neutral-900 rounded-lg border transition-all overflow-hidden ${
                            isHovered
                              ? 'border-brand-accent scale-105 shadow-2xl'
                              : 'border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="aspect-square p-6 flex items-center justify-center bg-neutral-950">
                            <div className="w-full h-full max-w-[200px] max-h-[200px]">
                              <JerseySVG
                                design={previewDesign}
                                view="front"
                                id={`gallery-${template.id}`}
                              />
                            </div>
                          </div>

                          <div className={`p-4 border-t transition-colors ${
                            isHovered ? 'border-brand-accent bg-brand-accent' : 'border-neutral-800 bg-neutral-900'
                          }`}>
                            <h3 className={`font-bold uppercase tracking-widest text-sm transition-colors ${
                              isHovered ? 'text-black' : 'text-white'
                            }`}>
                              {template.label}
                            </h3>
                            <p className={`text-xs mt-1 transition-colors ${
                              isHovered ? 'text-black opacity-70' : 'text-neutral-500'
                            }`}>
                              {template.layers.length} customizable zones
                            </p>
                          </div>

                          {isHovered && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 pointer-events-none">
                              <div className="flex items-center gap-2 text-brand-accent font-bold uppercase tracking-widest">
                                <span>Customize</span>
                                <ArrowRight size={18} />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedCut && templates.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-neutral-500 text-lg">No templates available for this sport yet.</p>
                  <p className="text-neutral-600 text-sm mt-2">Check back soon for new designs!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
