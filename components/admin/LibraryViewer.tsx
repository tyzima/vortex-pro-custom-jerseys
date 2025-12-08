import React, { useState } from 'react';
import { useTemplateLibrary } from '../../contexts/TemplateLibraryContext';
import { Shirt, Layout, PenLine, RefreshCw, Scissors, Eye } from 'lucide-react';

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
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');

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
            onClick={() => setViewSide('front')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
              viewSide === 'front' ? 'bg-brand-accent text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye size={14} /> Front
          </button>
          <button
            onClick={() => setViewSide('back')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
              viewSide === 'back' ? 'bg-brand-accent text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye size={14} /> Back
          </button>
        </div>
        <button
          onClick={() => refresh()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-black font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-brand-accent/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {sports.map(sport => {
          const cutEntries = Object.entries(sport.cuts);
          return (
            <div key={sport.id} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-6">
                <div>
                  <h3 className="font-display text-4xl text-white uppercase italic mb-2">{sport.label}</h3>
                  <span className="text-xs font-mono text-neutral-500">ID: {sport.id}</span>
                </div>
              </div>

              {/* CUTS SECTION */}
              <div className="mb-12">
                <h4 className="text-brand-accent text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Shirt size={16} /> Product Cuts
                </h4>
                <div className="grid grid-cols-1 gap-8">
                  {cutEntries.map(([cutSlug, cut]) => {
                    const jerseyShape = viewSide === 'front' ? cut.jersey.shape.front : cut.jersey.shape.back;
                    const jerseyTrim = viewSide === 'front' ? cut.jersey.trim.front : cut.jersey.trim.back;
                    const shortsShape = viewSide === 'front' ? cut.shorts.shape.front : cut.shorts.shape.back;
                    const shortsTrim = viewSide === 'front' ? cut.shorts.trim.front : cut.shorts.trim.back;

                    const hasJersey = jerseyShape || jerseyTrim;
                    const hasShorts = shortsShape || shortsTrim;

                    return (
                      <div
                        key={cutSlug}
                        className="bg-black/50 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all group"
                      >
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                          <div>
                            <h5 className="text-white font-bold uppercase text-lg mb-1">{cutSlug}</h5>
                            <div className="flex gap-3 text-xs">
                              {hasJersey && <span className="text-brand-accent">● Jersey</span>}
                              {hasShorts && <span className="text-green-500">● Shorts</span>}
                              {!hasJersey && !hasShorts && <span className="text-red-500">● No data</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditCut(sport.id, sport.label, cutSlug, cut.dbId, cutSlug)}
                            className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-brand-accent hover:text-black transition-all flex items-center gap-2 opacity-0 group-hover:opacity-100"
                          >
                            <PenLine size={14} />
                            Edit
                          </button>
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-8">
                          {/* JERSEY VISUAL */}
                          <div className="space-y-3">
                            <div className="text-brand-accent font-bold uppercase text-xs flex items-center gap-2">
                              <Shirt size={12} /> Jersey {viewSide}
                            </div>
                            <div className="aspect-[3/4] bg-gradient-to-br from-neutral-900 to-black rounded-lg flex items-center justify-center p-8 border border-neutral-800">
                              {hasJersey ? (
                                <svg viewBox="0 0 400 500" className="w-full h-full drop-shadow-2xl">
                                  {jerseyShape && (
                                    <path d={jerseyShape} fill="#2a2a2a" stroke="#444" strokeWidth="2" />
                                  )}
                                  {jerseyTrim && (
                                    <path d={jerseyTrim} fill="#D2F802" stroke="#fff" strokeWidth="1" opacity="0.9" />
                                  )}
                                </svg>
                              ) : (
                                <div className="text-center">
                                  <div className="text-neutral-700 mb-2">
                                    <Shirt size={32} className="mx-auto opacity-20" />
                                  </div>
                                  <div className="text-xs text-neutral-600 uppercase">No Jersey Data</div>
                                </div>
                              )}
                            </div>
                            {hasJersey && (
                              <div className="text-[10px] text-neutral-500 space-y-1">
                                <div>Shape: {jerseyShape ? '✓' : '✗'}</div>
                                <div>Trim: {jerseyTrim ? '✓' : '✗'}</div>
                              </div>
                            )}
                          </div>

                          {/* SHORTS VISUAL */}
                          <div className="space-y-3">
                            <div className="text-green-500 font-bold uppercase text-xs flex items-center gap-2">
                              <Scissors size={12} /> Shorts {viewSide}
                            </div>
                            <div className="aspect-[3/4] bg-gradient-to-br from-neutral-900 to-black rounded-lg flex items-center justify-center p-8 border border-neutral-800">
                              {hasShorts ? (
                                <svg viewBox="0 0 400 500" className="w-full h-full drop-shadow-2xl">
                                  {shortsShape && (
                                    <path d={shortsShape} fill="#2a2a2a" stroke="#444" strokeWidth="2" />
                                  )}
                                  {shortsTrim && (
                                    <path d={shortsTrim} fill="#22c55e" stroke="#fff" strokeWidth="1" opacity="0.9" />
                                  )}
                                </svg>
                              ) : (
                                <div className="text-center">
                                  <div className="text-neutral-700 mb-2">
                                    <Scissors size={32} className="mx-auto opacity-20" />
                                  </div>
                                  <div className="text-xs text-neutral-600 uppercase">No Shorts Data</div>
                                </div>
                              )}
                            </div>
                            {hasShorts && (
                              <div className="text-[10px] text-neutral-500 space-y-1">
                                <div>Shape: {shortsShape ? '✓' : '✗'}</div>
                                <div>Trim: {shortsTrim ? '✓' : '✗'}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TEMPLATES SECTION */}
              <div>
                <h4 className="text-brand-accent text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Layout size={16} /> Design Templates
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sport.templates.map(template => {
                    const jerseyLayers = template.layers.filter(
                      layer => layer.paths.jersey.front || layer.paths.jersey.back
                    );
                    const shortsLayers = template.layers.filter(
                      layer => layer.paths.shorts.front || layer.paths.shorts.back
                    );

                    const hasJerseyPaths = jerseyLayers.length > 0;
                    const hasShortsPaths = shortsLayers.length > 0;

                    return (
                      <div
                        key={template.id}
                        className="bg-black/50 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all group"
                      >
                        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                          <div>
                            <div className="text-white font-bold uppercase mb-1">{template.label}</div>
                            <div className="text-[10px] text-neutral-500 flex gap-2">
                              <span>{template.layers.length} Layers</span>
                              {hasJerseyPaths && <span className="text-brand-accent">● Jersey</span>}
                              {hasShortsPaths && <span className="text-green-500">● Shorts</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditTemplate(sport.id, sport.label, template.dbId, template.id, template.label)}
                            className="opacity-0 group-hover:opacity-100 p-2 bg-neutral-800 text-white rounded hover:bg-brand-accent hover:text-black transition-all"
                          >
                            <PenLine size={14} />
                          </button>
                        </div>

                        <div className="p-6 grid grid-cols-2 gap-4">
                          {/* Jersey Template Preview */}
                          <div className="space-y-2">
                            <div className="text-brand-accent font-bold uppercase text-[10px] flex items-center gap-1">
                              <Shirt size={10} /> Jersey
                            </div>
                            <div className="aspect-[3/4] bg-gradient-to-br from-neutral-900 to-black rounded-lg flex items-center justify-center p-4 border border-neutral-800">
                              {hasJerseyPaths ? (
                                <svg viewBox="0 0 400 500" className="w-full h-full">
                                  {jerseyLayers.map((layer, i) => {
                                    const path = viewSide === 'front' ? layer.paths.jersey.front : layer.paths.jersey.back;
                                    const colors = ['#D2F802', '#60a5fa', '#f97316', '#22c55e', '#db2777'];
                                    return path ? (
                                      <path
                                        key={layer.id}
                                        d={path}
                                        fill={colors[i % colors.length]}
                                        opacity="0.7"
                                        stroke="#fff"
                                        strokeWidth="1"
                                      />
                                    ) : null;
                                  })}
                                </svg>
                              ) : (
                                <div className="text-xs text-neutral-600 text-center">No data</div>
                              )}
                            </div>
                          </div>

                          {/* Shorts Template Preview */}
                          <div className="space-y-2">
                            <div className="text-green-500 font-bold uppercase text-[10px] flex items-center gap-1">
                              <Scissors size={10} /> Shorts
                            </div>
                            <div className="aspect-[3/4] bg-gradient-to-br from-neutral-900 to-black rounded-lg flex items-center justify-center p-4 border border-neutral-800">
                              {hasShortsPaths ? (
                                <svg viewBox="0 0 400 500" className="w-full h-full">
                                  {shortsLayers.map((layer, i) => {
                                    const path = viewSide === 'front' ? layer.paths.shorts.front : layer.paths.shorts.back;
                                    const colors = ['#22c55e', '#60a5fa', '#f97316', '#D2F802', '#db2777'];
                                    return path ? (
                                      <path
                                        key={layer.id}
                                        d={path}
                                        fill={colors[i % colors.length]}
                                        opacity="0.7"
                                        stroke="#fff"
                                        strokeWidth="1"
                                      />
                                    ) : null;
                                  })}
                                </svg>
                              ) : (
                                <div className="text-xs text-neutral-600 text-center">No data</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
