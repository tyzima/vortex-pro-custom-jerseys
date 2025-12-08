import React, { useState, useEffect } from 'react';
import { useTemplateLibrary } from '../../contexts/TemplateLibraryContext';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Upload,
  Trash2,
  Save,
  Eye,
  Shirt,
  Scissors,
  Layers,
  PenLine
} from 'lucide-react';
import { Sport, Cut, Template } from '../../types';
import {
  createTemplate,
  updateTemplate,
  createLayer,
  updateLayer,
  updateLayerPath,
  getSports
} from '../../lib/templateService';

type ViewSide = 'front' | 'back';
type GarmentType = 'jersey' | 'shorts';

interface SelectedContext {
  sport: Sport;
  cutSlug: string;
  cut: Cut;
  template?: Template;
}

interface VisualEditorProps {
  templateId?: string;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({ templateId }) => {
  const { library: SPORTS_LIBRARY, loading, refresh } = useTemplateLibrary();
  const [viewSide, setViewSide] = useState<ViewSide>('front');
  const [selectedContext, setSelectedContext] = useState<SelectedContext | null>(null);
  const [expandedSports, setExpandedSports] = useState<Set<string>>(new Set());
  const [expandedCuts, setExpandedCuts] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);

  useEffect(() => {
    if (templateId && SPORTS_LIBRARY && !loading) {
      loadTemplateById(templateId);
    }
  }, [templateId, SPORTS_LIBRARY, loading]);

  const loadTemplateById = (id: string) => {
    if (!SPORTS_LIBRARY) return;

    for (const [sportId, sportData] of Object.entries(SPORTS_LIBRARY)) {
      if (!sportData?.cuts) continue;

      for (const [cutSlug, cutData] of Object.entries(sportData.cuts)) {
        if (!cutData?.templates || !Array.isArray(cutData.templates)) continue;

        const template = cutData.templates.find((t: Template) => t.id === id);
        if (template) {
          setExpandedSports(new Set([sportId]));
          setExpandedCuts(new Set([`${sportId}-${cutSlug}`]));
          selectTemplate(sportData, cutSlug, cutData, template);
          return;
        }
      }
    }
  };

  const toggleSport = (sportId: string) => {
    const newExpanded = new Set(expandedSports);
    if (newExpanded.has(sportId)) {
      newExpanded.delete(sportId);
    } else {
      newExpanded.add(sportId);
    }
    setExpandedSports(newExpanded);
  };

  const toggleCut = (key: string) => {
    const newExpanded = new Set(expandedCuts);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCuts(newExpanded);
  };

  const selectCut = (sport: Sport, cutSlug: string, cut: Cut) => {
    setSelectedContext({
      sport,
      cutSlug,
      cut,
      template: undefined
    });
  };

  const selectTemplate = (sport: Sport, cutSlug: string, cut: Cut, template: Template) => {
    setSelectedContext({
      sport,
      cutSlug,
      cut,
      template
    });
  };

  const handleNewTemplate = async () => {
    if (!selectedContext || !newTemplateName.trim()) return;

    try {
      setUploading(true);
      const newTemplate = await createTemplate(
        selectedContext.sport.id,
        selectedContext.cutSlug,
        newTemplateName.toLowerCase().replace(/\s+/g, '-'),
        newTemplateName.trim()
      );

      await refresh();
      setNewTemplateName('');
      setShowNewTemplateDialog(false);

      const refreshedSport = SPORTS_LIBRARY?.[selectedContext.sport.id];
      if (refreshedSport) {
        const template = refreshedSport.templates.find(t => t.id === newTemplate.slug);
        if (template) {
          setSelectedContext({
            ...selectedContext,
            sport: refreshedSport,
            template
          });
        }
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadSVG = async (garmentType: GarmentType, side: ViewSide, file: File) => {
    if (!selectedContext?.template) return;

    try {
      setUploading(true);
      const text = await file.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(text, 'image/svg+xml');
      const paths = Array.from(svgDoc.querySelectorAll('path'));

      if (paths.length === 0) {
        alert('No paths found in SVG file');
        return;
      }

      const layerName = `${garmentType}-${side}-${Date.now()}`;
      const layer = await createLayer(
        selectedContext.template.dbId!,
        layerName,
        `${garmentType.charAt(0).toUpperCase() + garmentType.slice(1)} ${side}`
      );

      const pathData = paths.map(p => p.getAttribute('d') || '').filter(Boolean);

      await updateLayerPath(
        layer.id,
        garmentType,
        side,
        pathData
      );

      await refresh();

      const refreshedSport = SPORTS_LIBRARY?.[selectedContext.sport.id];
      if (refreshedSport) {
        const template = refreshedSport.templates.find(t => t.dbId === selectedContext.template?.dbId);
        if (template) {
          setSelectedContext({
            ...selectedContext,
            sport: refreshedSport,
            template
          });
        }
      }
    } catch (error) {
      console.error('Failed to upload SVG:', error);
      alert('Failed to upload SVG');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !SPORTS_LIBRARY) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-brand-accent text-xl font-bold uppercase tracking-widest animate-pulse">
          Loading Editor...
        </div>
      </div>
    );
  }

  const sports = Object.values(SPORTS_LIBRARY);

  console.log('VisualEditor - SPORTS_LIBRARY:', SPORTS_LIBRARY);
  console.log('VisualEditor - sports array:', sports);
  if (selectedContext) {
    console.log('VisualEditor - selectedContext:', selectedContext);
    console.log('VisualEditor - selectedContext.cut:', selectedContext.cut);
    if (selectedContext.template) {
      console.log('VisualEditor - selectedContext.template.layers:', selectedContext.template.layers);
    }
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* LEFT SIDEBAR - Navigation */}
      <div className="w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-xl font-bold uppercase text-brand-accent">Template Library</h2>
          <p className="text-xs text-neutral-400 mt-1">Select a design to edit</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sports.map(sport => {
            const isExpanded = expandedSports.has(sport.id);
            return (
              <div key={sport.id} className="mb-2">
                <button
                  onClick={() => toggleSport(sport.id)}
                  className="w-full flex items-center gap-2 p-2 rounded hover:bg-neutral-800 transition-colors text-left"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="font-bold uppercase text-sm">{sport.label}</span>
                </button>

                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {Object.entries(sport.cuts).map(([cutSlug, cut]) => {
                      const cutKey = `${sport.id}-${cutSlug}`;
                      const isCutExpanded = expandedCuts.has(cutKey);
                      const templates = sport.templates.filter(t => t.id.includes(cutSlug) || true);

                      return (
                        <div key={cutSlug}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleCut(cutKey)}
                              className="flex-1 flex items-center gap-2 p-2 rounded hover:bg-neutral-800 transition-colors text-left text-sm"
                            >
                              {isCutExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              <Shirt size={14} className="text-neutral-400" />
                              <span className="text-neutral-300">{cutSlug}</span>
                            </button>
                            <button
                              onClick={() => selectCut(sport, cutSlug, cut)}
                              className="p-2 hover:bg-brand-accent hover:text-black rounded transition-colors"
                              title="Edit Cut Paths"
                            >
                              <PenLine size={12} />
                            </button>
                          </div>

                          {isCutExpanded && (
                            <div className="ml-6 mt-1 space-y-1">
                              {templates.map(template => (
                                <button
                                  key={template.id}
                                  onClick={() => selectTemplate(sport, cutSlug, cut, template)}
                                  className={`w-full flex items-center gap-2 p-2 rounded transition-colors text-left text-xs ${
                                    selectedContext?.template?.id === template.id
                                      ? 'bg-brand-accent text-black'
                                      : 'hover:bg-neutral-800 text-neutral-400'
                                  }`}
                                >
                                  <Layers size={12} />
                                  <span>{template.label}</span>
                                  <span className="ml-auto text-[10px] opacity-50">
                                    {template.layers.length} layers
                                  </span>
                                </button>
                              ))}

                              <button
                                onClick={() => {
                                  setSelectedContext({ sport, cutSlug, cut, template: undefined });
                                  setShowNewTemplateDialog(true);
                                }}
                                className="w-full flex items-center gap-2 p-2 rounded border border-dashed border-neutral-700 hover:border-brand-accent hover:text-brand-accent transition-colors text-xs text-neutral-500"
                              >
                                <Plus size={12} />
                                <span>New Template</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER CANVAS */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-neutral-950 to-black">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            {selectedContext ? (
              <div>
                <h3 className="text-2xl font-bold uppercase">
                  {selectedContext.template
                    ? selectedContext.template.label
                    : `${selectedContext.cutSlug} Base Paths`}
                </h3>
                <p className="text-sm text-neutral-400">
                  {selectedContext.sport.label} • {selectedContext.cutSlug}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold uppercase text-neutral-600">No Selection</h3>
                <p className="text-sm text-neutral-500">Select a cut or template from the left sidebar</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-8">
          {selectedContext && (
            <div className="h-full grid grid-cols-2 gap-8">
              {/* JERSEY CANVAS */}
              <div className="flex flex-col">
                <div className="text-brand-accent font-bold uppercase text-sm mb-4 flex items-center gap-2">
                  <Shirt size={16} /> Jersey {viewSide}
                </div>
                <div className="flex-1 bg-black rounded-xl border-2 border-neutral-800 p-8 flex items-center justify-center">
                  <svg viewBox="0 0 400 500" className="w-full h-full max-w-md max-h-full drop-shadow-2xl">
                    {!selectedContext.template && (
                      <>
                        {selectedContext.cut.jersey.shape[viewSide] && (
                          <path
                            d={selectedContext.cut.jersey.shape[viewSide]}
                            fill="#1a1a1a"
                            stroke="#333"
                            strokeWidth="2"
                          />
                        )}
                        {selectedContext.cut.jersey.trim[viewSide] && (
                          <path
                            d={selectedContext.cut.jersey.trim[viewSide]}
                            fill="#D2F802"
                            stroke="#fff"
                            strokeWidth="1"
                            opacity="0.9"
                          />
                        )}
                      </>
                    )}

                    {selectedContext.template && selectedContext.cut.jersey.shape[viewSide] && (
                      <path
                        d={selectedContext.cut.jersey.shape[viewSide]}
                        fill="#0a0a0a"
                        stroke="#222"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                    )}

                    {selectedContext.template?.layers.map((layer, i) => {
                      const path = layer.paths.jersey[viewSide];
                      const colors = ['#D2F802', '#60a5fa', '#f97316', '#22c55e', '#db2777', '#a78bfa'];
                      if (!Array.isArray(path)) return null;
                      return path.map((p, j) => (
                        <path
                          key={`${layer.id}-${j}`}
                          d={p}
                          fill={colors[i % colors.length]}
                          stroke="#fff"
                          strokeWidth="1"
                          opacity="0.85"
                        />
                      ));
                    })}
                  </svg>
                </div>
              </div>

              {/* SHORTS CANVAS */}
              <div className="flex flex-col">
                <div className="text-green-500 font-bold uppercase text-sm mb-4 flex items-center gap-2">
                  <Scissors size={16} /> Shorts {viewSide}
                </div>
                <div className="flex-1 bg-black rounded-xl border-2 border-neutral-800 p-8 flex items-center justify-center">
                  <svg viewBox="0 0 400 500" className="w-full h-full max-w-md max-h-full drop-shadow-2xl">
                    {!selectedContext.template && (
                      <>
                        {selectedContext.cut.shorts.shape[viewSide] && (
                          <path
                            d={selectedContext.cut.shorts.shape[viewSide]}
                            fill="#1a1a1a"
                            stroke="#333"
                            strokeWidth="2"
                          />
                        )}
                        {selectedContext.cut.shorts.trim[viewSide] && (
                          <path
                            d={selectedContext.cut.shorts.trim[viewSide]}
                            fill="#22c55e"
                            stroke="#fff"
                            strokeWidth="1"
                            opacity="0.9"
                          />
                        )}
                      </>
                    )}

                    {selectedContext.template && selectedContext.cut.shorts.shape[viewSide] && (
                      <path
                        d={selectedContext.cut.shorts.shape[viewSide]}
                        fill="#0a0a0a"
                        stroke="#222"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                    )}

                    {selectedContext.template?.layers.map((layer, i) => {
                      const path = layer.paths.shorts[viewSide];
                      const colors = ['#22c55e', '#60a5fa', '#f97316', '#D2F802', '#db2777', '#a78bfa'];
                      if (!Array.isArray(path)) return null;
                      return path.map((p, j) => (
                        <path
                          key={`${layer.id}-${j}`}
                          d={p}
                          fill={colors[i % colors.length]}
                          stroke="#fff"
                          strokeWidth="1"
                          opacity="0.85"
                        />
                      ));
                    })}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {!selectedContext && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-neutral-600">
                <Layers size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-xl font-bold uppercase">No Design Selected</p>
                <p className="text-sm mt-2">Choose a cut or template from the left sidebar to begin editing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR - Controls */}
      <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold uppercase">Design Tools</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedContext?.template && (
            <>
              <div className="bg-black/50 rounded-lg p-4 border border-neutral-800">
                <h3 className="text-sm font-bold uppercase text-brand-accent mb-3 flex items-center gap-2">
                  <Upload size={14} /> Upload New Design Layer
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-400 uppercase mb-2 block">Jersey {viewSide}</label>
                    <input
                      type="file"
                      accept=".svg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadSVG('jersey', viewSide, file);
                      }}
                      className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-accent file:text-black hover:file:bg-brand-accent/90 cursor-pointer"
                      disabled={uploading}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 uppercase mb-2 block">Shorts {viewSide}</label>
                    <input
                      type="file"
                      accept=".svg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadSVG('shorts', viewSide, file);
                      }}
                      className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-green-500 file:text-black hover:file:bg-green-600 cursor-pointer"
                      disabled={uploading}
                    />
                  </div>
                  {uploading && (
                    <div className="text-xs text-brand-accent animate-pulse text-center">Uploading...</div>
                  )}
                </div>
              </div>

              <div className="bg-black/50 rounded-lg p-4 border border-neutral-800">
                <h3 className="text-sm font-bold uppercase text-white mb-3 flex items-center gap-2">
                  <Layers size={14} /> Layers ({selectedContext.template.layers.length})
                </h3>
                <div className="space-y-2">
                  {selectedContext.template.layers.length === 0 ? (
                    <div className="text-xs text-neutral-600 text-center py-4">
                      No layers yet. Upload SVG files to create layers.
                    </div>
                  ) : (
                    selectedContext.template.layers.map((layer, i) => (
                      <div
                        key={layer.id}
                        className="bg-neutral-800 rounded p-3 text-xs"
                      >
                        <div className="font-bold text-white mb-1">{layer.label}</div>
                        <div className="text-neutral-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Jersey:</span>
                            <span>
                              {layer.paths.jersey.front.length + layer.paths.jersey.back.length} paths
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shorts:</span>
                            <span>
                              {layer.paths.shorts.front.length + layer.paths.shorts.back.length} paths
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {selectedContext && !selectedContext.template && (
            <div className="bg-black/50 rounded-lg p-4 border border-neutral-800">
              <h3 className="text-sm font-bold uppercase text-white mb-3">Base Cut Paths</h3>
              <p className="text-xs text-neutral-400 mb-4">
                These are the foundational shape and trim paths for this cut. To create design variations, add a new template.
              </p>
              <button
                onClick={() => setShowNewTemplateDialog(true)}
                className="w-full py-2 bg-brand-accent text-black font-bold uppercase text-xs rounded hover:bg-brand-accent/90 transition-colors"
              >
                Create New Template
              </button>
            </div>
          )}

          {!selectedContext && (
            <div className="text-center text-neutral-600 py-8">
              <p className="text-xs">Select a design to see tools</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW TEMPLATE DIALOG */}
      {showNewTemplateDialog && selectedContext && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold uppercase mb-4">Create New Template</h3>
            <p className="text-sm text-neutral-400 mb-4">
              Creating template for: <span className="text-white">{selectedContext.sport.label} • {selectedContext.cutSlug}</span>
            </p>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Template Name (e.g., Lightning Bolt)"
              className="w-full px-4 py-3 bg-black border border-neutral-800 rounded text-white focus:border-brand-accent outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewTemplateDialog(false);
                  setNewTemplateName('');
                }}
                className="flex-1 px-4 py-2 bg-neutral-800 text-white font-bold uppercase text-sm rounded hover:bg-neutral-700 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleNewTemplate}
                disabled={!newTemplateName.trim() || uploading}
                className="flex-1 px-4 py-2 bg-brand-accent text-black font-bold uppercase text-sm rounded hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
