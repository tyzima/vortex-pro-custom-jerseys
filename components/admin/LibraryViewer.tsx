import React, { useState } from 'react';
import { useTemplateLibrary } from '../../contexts/TemplateLibraryContext';
import { Shirt, Layout, PenLine, RefreshCw, Scissors } from 'lucide-react';

export interface EditContext {
  mode: 'cut' | 'template';
  sportId: string;
  sportLabel: string;
  cutSlug?: string;
  cutDbId?: string;
  cutLabel?: string;
  templateDbId?: string;
  templateSlug?: string;
  templateLabel?: string;
}

interface LibraryViewerProps {
  onEdit: (context: EditContext) => void;
}

export const LibraryViewer: React.FC<LibraryViewerProps> = ({ onEdit }) => {
  const { library: SPORTS_LIBRARY, loading, error, refresh } = useTemplateLibrary();
  const [viewMode, setViewMode] = useState<'jersey' | 'shorts'>('jersey');

  if (loading || !SPORTS_LIBRARY) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-brand-accent text-xl font-bold uppercase tracking-widest animate-pulse">
          Loading Library...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500 text-xl font-bold uppercase tracking-widest">
          Error: {error}
        </div>
      </div>
    );
  }

  const sports = Object.values(SPORTS_LIBRARY);

  const handleEditCut = (sportId: string, sportLabel: string, cutSlug: string, cutDbId: string | undefined, cutLabel: string) => {
    onEdit({
      mode: 'cut',
      sportId,
      sportLabel,
      cutSlug,
      cutDbId,
      cutLabel
    });
  };

  const handleEditTemplate = (sportId: string, sportLabel: string, templateDbId: string | undefined, templateSlug: string, templateLabel: string) => {
    onEdit({
      mode: 'template',
      sportId,
      sportLabel,
      templateDbId,
      templateSlug,
      templateLabel
    });
  };

  return (
    <div className="pb-12">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2 bg-black p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setViewMode('jersey')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
              viewMode === 'jersey' ? 'bg-brand-accent text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Shirt size={14} /> Jersey
          </button>
          <button
            onClick={() => setViewMode('shorts')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
              viewMode === 'shorts' ? 'bg-brand-accent text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Scissors size={14} /> Shorts
          </button>
        </div>
        <button
          onClick={() => refresh()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-black font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-brand-accent/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Library
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {sports.map(sport => {
          const cutEntries = Object.entries(sport.cuts);
          return (
            <div key={sport.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
                <h3 className="font-display text-3xl text-white uppercase italic">{sport.label}</h3>
                <span className="text-xs font-mono text-neutral-500 bg-neutral-950 px-2 py-1 rounded">
                  ID: {sport.id}
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* CUTS SECTION */}
                <div className="xl:col-span-1">
                  <h4 className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shirt size={14} /> {viewMode === 'jersey' ? 'Jersey Cuts' : 'Shorts Cuts'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {cutEntries.map(([cutSlug, cut]) => {
                      const garmentData = viewMode === 'jersey' ? cut.jersey : cut.shorts;
                      const hasData = garmentData.shape.front || garmentData.shape.back;

                      return (
                        <div
                          key={cutSlug}
                          className={`bg-black/50 p-3 rounded border ${
                            hasData ? 'border-neutral-800' : 'border-red-900/50'
                          } flex flex-col gap-2 group`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold uppercase text-[10px]">{cutSlug}</span>
                            <button
                              onClick={() => handleEditCut(sport.id, sport.label, cutSlug, cut.dbId, cutSlug)}
                              className="text-neutral-500 hover:text-brand-accent transition-colors"
                              title="Edit in Builder"
                            >
                              <PenLine size={12} />
                            </button>
                          </div>
                          <div className="aspect-[3/4] bg-neutral-900 rounded flex items-center justify-center p-2 relative overflow-hidden">
                            {hasData ? (
                              <svg viewBox="0 0 400 500" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
                                {garmentData.shape.front && (
                                  <path d={garmentData.shape.front} fill="#333" />
                                )}
                                {garmentData.trim.front && (
                                  <path d={garmentData.trim.front} fill="#555" />
                                )}
                              </svg>
                            ) : (
                              <div className="text-[8px] text-neutral-600 text-center uppercase">
                                No {viewMode} data
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* TEMPLATES SECTION */}
                <div className="xl:col-span-2">
                  <h4 className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layout size={14} /> Design Templates
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sport.templates.map(template => {
                      const hasJerseyPaths = template.layers.some(
                        layer => layer.paths.jersey.front || layer.paths.jersey.back
                      );
                      const hasShortsPaths = template.layers.some(
                        layer => layer.paths.shorts.front || layer.paths.shorts.back
                      );
                      const currentViewHasData = viewMode === 'jersey' ? hasJerseyPaths : hasShortsPaths;

                      return (
                        <div
                          key={template.id}
                          className={`bg-black/50 p-4 rounded border ${
                            currentViewHasData ? 'border-neutral-800' : 'border-red-900/50'
                          } flex items-center justify-between group hover:border-neutral-700 transition-colors`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-neutral-900 rounded border border-neutral-800 flex items-center justify-center">
                              <span className="font-display text-lg text-neutral-600">
                                {template.label.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-white font-bold text-sm uppercase">{template.label}</div>
                              <div className="text-[10px] text-neutral-500 font-mono mt-1">
                                {template.layers.length} Layers
                                {hasJerseyPaths && <span className="ml-2 text-brand-accent">• Jersey</span>}
                                {hasShortsPaths && <span className="ml-2 text-green-500">• Shorts</span>}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditTemplate(sport.id, sport.label, template.dbId, template.id, template.label)}
                            className="opacity-0 group-hover:opacity-100 p-2 bg-neutral-800 text-white rounded hover:bg-brand-accent hover:text-black transition-all"
                            title="Edit in Builder"
                          >
                            <PenLine size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
