import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Palette,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  GripVertical,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Upload,
  Save,
  Settings,
  Shirt,
  Scissors,
  Copy,
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';
import type { ProductCut, DesignTemplate, DesignLayer, SportDefinition } from '../../types';

interface ProductDesignCanvasProps {
  sport: SportDefinition;
  garmentType: 'jersey' | 'shorts';
  initialCutSlug?: string;
  onBack: () => void;
  onSave?: (template: DesignTemplate) => void;
}

interface LayerState {
  id: string;
  visible: boolean;
  locked: boolean;
  color: string;
}

const PRESET_COLORS = [
  '#D2F802', '#ffffff', '#0a0a0a', '#dc2626', '#2563eb',
  '#22c55e', '#f97316', '#7e22ce', '#fbbf24', '#14b8a6',
  '#db2777', '#172554', '#15803d', '#60a5fa', '#991b1b'
];

export const ProductDesignCanvas: React.FC<ProductDesignCanvasProps> = ({
  sport,
  garmentType,
  initialCutSlug,
  onBack,
  onSave
}) => {
  const [selectedCutSlug, setSelectedCutSlug] = useState<string>(
    initialCutSlug && sport.cuts[initialCutSlug] ? initialCutSlug : Object.keys(sport.cuts)[0]
  );
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [viewSide, setViewSide] = useState<'front' | 'back' | 'both'>('both');
  const [zoom, setZoom] = useState(100);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [layerStates, setLayerStates] = useState<Record<string, LayerState>>({});
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [showColorPanel, setShowColorPanel] = useState(true);
  const [previewColors, setPreviewColors] = useState({
    primary: '#D2F802',
    secondary: '#0a0a0a',
    accent: '#ffffff'
  });
  const [isDirty, setIsDirty] = useState(false);

  const currentCut = sport.cuts[selectedCutSlug];
  const templates = sport.templates;
  const currentTemplate = templates[selectedTemplateIndex] || null;
  const garment = garmentType === 'jersey' ? currentCut?.jersey : currentCut?.shorts;

  const initializeLayerStates = (template: DesignTemplate) => {
    const states: Record<string, LayerState> = {};
    template.layers.forEach((layer, index) => {
      const colorIndex = index % PRESET_COLORS.length;
      states[layer.id] = {
        id: layer.id,
        visible: true,
        locked: false,
        color: layerStates[layer.id]?.color || PRESET_COLORS[colorIndex]
      };
    });
    return states;
  };

  useMemo(() => {
    if (currentTemplate && Object.keys(layerStates).length === 0) {
      setLayerStates(initializeLayerStates(currentTemplate));
    }
  }, [currentTemplate]);

  const handleTemplateChange = (index: number) => {
    setSelectedTemplateIndex(index);
    const template = templates[index];
    if (template) {
      setLayerStates(initializeLayerStates(template));
      setSelectedLayerId(null);
    }
  };

  const handleLayerColorChange = (layerId: string, color: string) => {
    setLayerStates(prev => ({
      ...prev,
      [layerId]: { ...prev[layerId], color }
    }));
    setIsDirty(true);
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayerStates(prev => ({
      ...prev,
      [layerId]: { ...prev[layerId], visible: !prev[layerId]?.visible }
    }));
  };

  const toggleLayerLock = (layerId: string) => {
    setLayerStates(prev => ({
      ...prev,
      [layerId]: { ...prev[layerId], locked: !prev[layerId]?.locked }
    }));
  };

  const renderGarmentCanvas = (side: 'front' | 'back') => {
    if (!garment || !currentTemplate) return null;

    const shape = garment.shape[side];
    const trim = garment.trim[side];

    return (
      <div className="flex flex-col items-center">
        <div className="mb-3">
          <span className="text-xs font-bold uppercase text-neutral-500 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
            {side}
          </span>
        </div>
        <div
          className="bg-gradient-to-br from-neutral-200 via-white to-neutral-200 rounded-2xl shadow-2xl border border-neutral-300 relative overflow-hidden"
          style={{
            padding: `${Math.max(16, 48 * (zoom / 100))}px`,
            transition: 'all 0.2s ease'
          }}
        >
          <svg
            viewBox="0 0 400 500"
            style={{
              width: `${280 * (zoom / 100)}px`,
              height: `${350 * (zoom / 100)}px`,
              transition: 'all 0.2s ease'
            }}
            className="drop-shadow-xl"
          >
            <path
              d={shape}
              fill={previewColors.secondary}
              stroke="#1a1a1a"
              strokeWidth="2"
            />

            {currentTemplate.layers.map((layer, index) => {
              const state = layerStates[layer.id];
              if (!state?.visible) return null;

              const paths = garmentType === 'jersey'
                ? layer.paths.jersey[side]
                : layer.paths.shorts[side];

              return paths.map((path, pathIndex) => (
                <path
                  key={`${layer.id}-${pathIndex}`}
                  d={path}
                  fill={state.color}
                  stroke={selectedLayerId === layer.id ? '#fff' : 'none'}
                  strokeWidth={selectedLayerId === layer.id ? 2 : 0}
                  strokeDasharray={selectedLayerId === layer.id ? '4 2' : 'none'}
                  className="cursor-pointer transition-all"
                  onClick={() => !state.locked && setSelectedLayerId(layer.id)}
                  style={{
                    opacity: state.locked ? 0.7 : 1,
                    filter: selectedLayerId === layer.id ? 'drop-shadow(0 0 4px rgba(210, 248, 2, 0.5))' : 'none'
                  }}
                />
              ));
            })}

            {trim && (
              <path
                d={trim}
                fill="none"
                stroke={previewColors.accent}
                strokeWidth="3"
              />
            )}
          </svg>

          {selectedLayerId && (
            <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              Editing: {currentTemplate.layers.find(l => l.id === selectedLayerId)?.label}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!currentCut || !garment) {
    return (
      <div className="h-full bg-neutral-950 flex items-center justify-center">
        <div className="text-center text-neutral-500">
          <p className="text-lg">Invalid product configuration</p>
          <button onClick={onBack} className="mt-4 text-brand-accent hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-neutral-950 flex flex-col">
      <div className="h-14 bg-black border-b border-neutral-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase">Back</span>
          </button>
          <div className="h-6 w-px bg-neutral-800" />
          <div className="flex items-center gap-2">
            {garmentType === 'jersey' ? (
              <Shirt size={18} className="text-brand-accent" />
            ) : (
              <Scissors size={18} className="text-green-500" />
            )}
            <span className="font-bold text-white uppercase">
              {currentCut.label} {garmentType}
            </span>
            <span className="text-neutral-500">-</span>
            <span className="text-neutral-400">{sport.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1.5 hover:bg-neutral-800 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={16} className="text-neutral-400" />
            </button>
            <span className="text-xs text-neutral-400 w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              className="p-1.5 hover:bg-neutral-800 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={16} className="text-neutral-400" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1.5 hover:bg-neutral-800 rounded transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw size={16} className="text-neutral-400" />
            </button>
          </div>

          <div className="h-6 w-px bg-neutral-800" />

          <div className="flex items-center gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
            <button
              onClick={() => setViewSide('front')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${
                viewSide === 'front' ? 'bg-brand-accent text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setViewSide('both')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${
                viewSide === 'both' ? 'bg-brand-accent text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setViewSide('back')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${
                viewSide === 'back' ? 'bg-brand-accent text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Back
            </button>
          </div>

          <div className="h-6 w-px bg-neutral-800" />

          {isDirty && (
            <button
              onClick={() => {
                setIsDirty(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-black font-bold uppercase text-xs rounded-lg hover:bg-brand-accent/90 transition-all"
            >
              <Save size={14} />
              Save
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 bg-black border-r border-neutral-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-neutral-800">
            <h3 className="text-xs font-bold uppercase text-neutral-400">Design Templates</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-neutral-600">No templates yet</p>
              </div>
            ) : (
              templates.map((template, index) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(index)}
                  className={`w-full rounded-lg border-2 transition-all ${
                    index === selectedTemplateIndex
                      ? 'border-brand-accent shadow-lg shadow-brand-accent/20'
                      : 'border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  <div className="aspect-square bg-gradient-to-br from-neutral-200 via-white to-neutral-200 rounded-t-md p-3">
                    <svg viewBox="0 0 400 500" className="w-full h-full">
                      <path
                        d={garment.shape.front}
                        fill="#1a1a1a"
                        stroke="#0a0a0a"
                        strokeWidth="2"
                      />
                      {template.layers.slice(0, 2).map((layer, i) => {
                        const colors = ['#D2F802', '#60a5fa'];
                        const paths = garmentType === 'jersey'
                          ? layer.paths.jersey.front
                          : layer.paths.shorts.front;
                        return paths.map((path, j) => (
                          <path
                            key={`${layer.id}-${j}`}
                            d={path}
                            fill={colors[i % colors.length]}
                          />
                        ));
                      })}
                    </svg>
                  </div>
                  <div className="p-2 bg-neutral-900 rounded-b-md">
                    <p className="text-xs font-bold text-white truncate">{template.label}</p>
                    <p className="text-[10px] text-neutral-500">{template.layers.length} layers</p>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="p-2 border-t border-neutral-800">
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-neutral-700 rounded-lg text-neutral-500 hover:border-brand-accent hover:text-brand-accent transition-all text-xs">
              <Plus size={14} />
              New Template
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-neutral-900 overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-8 relative overflow-auto">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: 'radial-gradient(circle, #404040 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />

            <div className="relative z-10 flex gap-12 items-start">
              {(viewSide === 'front' || viewSide === 'both') && renderGarmentCanvas('front')}
              {(viewSide === 'back' || viewSide === 'both') && renderGarmentCanvas('back')}
            </div>
          </div>

          {currentTemplate && (
            <div className="h-24 bg-black border-t border-neutral-800 flex items-center px-4 gap-3 overflow-x-auto shrink-0">
              <span className="text-xs font-bold uppercase text-neutral-500 shrink-0">
                {currentTemplate.label}
              </span>
              <div className="h-8 w-px bg-neutral-800 shrink-0" />
              {templates.map((template, index) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(index)}
                  className={`shrink-0 w-14 h-16 rounded-lg border-2 transition-all ${
                    index === selectedTemplateIndex
                      ? 'border-brand-accent scale-105'
                      : 'border-neutral-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-md p-1">
                    <svg viewBox="0 0 400 500" className="w-full h-full">
                      <path d={garment.shape.front} fill="#1a1a1a" />
                      {template.layers[0]?.paths[garmentType]?.front?.map((path, i) => (
                        <path key={i} d={path} fill="#D2F802" />
                      ))}
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-72 bg-black border-l border-neutral-800 flex flex-col shrink-0">
          <div className="border-b border-neutral-800">
            <div className="flex">
              <button
                onClick={() => { setShowLayerPanel(true); setShowColorPanel(false); }}
                className={`flex-1 px-4 py-3 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors ${
                  showLayerPanel && !showColorPanel ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Layers size={14} /> Layers
              </button>
              <button
                onClick={() => { setShowColorPanel(true); setShowLayerPanel(false); }}
                className={`flex-1 px-4 py-3 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors ${
                  showColorPanel && !showLayerPanel ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Palette size={14} /> Colors
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {showLayerPanel && currentTemplate && (
              <div className="p-4 space-y-2">
                {currentTemplate.layers.length === 0 ? (
                  <div className="text-center py-8">
                    <Layers size={32} className="mx-auto text-neutral-700 mb-2" />
                    <p className="text-xs text-neutral-600">No layers in this template</p>
                  </div>
                ) : (
                  currentTemplate.layers.map((layer) => {
                    const state = layerStates[layer.id];
                    const isSelected = selectedLayerId === layer.id;

                    return (
                      <div
                        key={layer.id}
                        onClick={() => !state?.locked && setSelectedLayerId(layer.id)}
                        className={`group bg-neutral-900 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-brand-accent shadow-lg shadow-brand-accent/10'
                            : 'border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 p-3">
                          <div className="cursor-grab text-neutral-600 hover:text-neutral-400">
                            <GripVertical size={14} />
                          </div>

                          <div
                            className="w-6 h-6 rounded border-2 border-neutral-700 shrink-0"
                            style={{ backgroundColor: state?.color || '#D2F802' }}
                          />

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{layer.label}</p>
                            <p className="text-[10px] text-neutral-500">
                              {layer.paths[garmentType].front.length + layer.paths[garmentType].back.length} paths
                            </p>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                              className="p-1 hover:bg-neutral-800 rounded"
                              title={state?.visible ? 'Hide' : 'Show'}
                            >
                              {state?.visible ? (
                                <Eye size={14} className="text-neutral-400" />
                              ) : (
                                <EyeOff size={14} className="text-neutral-600" />
                              )}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                              className="p-1 hover:bg-neutral-800 rounded"
                              title={state?.locked ? 'Unlock' : 'Lock'}
                            >
                              {state?.locked ? (
                                <Lock size={14} className="text-yellow-500" />
                              ) : (
                                <Unlock size={14} className="text-neutral-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="px-3 pb-3 pt-1 border-t border-neutral-800 mt-1">
                            <label className="text-[10px] text-neutral-500 uppercase mb-2 block">Layer Color</label>
                            <div className="grid grid-cols-6 gap-1">
                              {PRESET_COLORS.map((color) => (
                                <button
                                  key={color}
                                  onClick={(e) => { e.stopPropagation(); handleLayerColorChange(layer.id, color); }}
                                  className={`w-full aspect-square rounded border-2 transition-all ${
                                    state?.color === color ? 'border-white scale-110' : 'border-transparent hover:border-neutral-600'
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <div className="mt-2 flex gap-2">
                              <input
                                type="color"
                                value={state?.color || '#D2F802'}
                                onChange={(e) => handleLayerColorChange(layer.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-8 h-8 rounded border border-neutral-700 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={state?.color || '#D2F802'}
                                onChange={(e) => handleLayerColorChange(layer.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs font-mono text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {showColorPanel && (
              <div className="p-4 space-y-4">
                <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
                  <h4 className="text-xs font-bold uppercase text-neutral-400 mb-3">Base Colors</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase mb-1 block">Primary (Base)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={previewColors.primary}
                          onChange={(e) => { setPreviewColors(p => ({ ...p, primary: e.target.value })); setIsDirty(true); }}
                          className="w-10 h-10 rounded border border-neutral-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={previewColors.primary}
                          onChange={(e) => { setPreviewColors(p => ({ ...p, primary: e.target.value })); setIsDirty(true); }}
                          className="flex-1 px-3 py-2 bg-black border border-neutral-700 rounded text-sm font-mono text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase mb-1 block">Secondary (Fill)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={previewColors.secondary}
                          onChange={(e) => { setPreviewColors(p => ({ ...p, secondary: e.target.value })); setIsDirty(true); }}
                          className="w-10 h-10 rounded border border-neutral-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={previewColors.secondary}
                          onChange={(e) => { setPreviewColors(p => ({ ...p, secondary: e.target.value })); setIsDirty(true); }}
                          className="flex-1 px-3 py-2 bg-black border border-neutral-700 rounded text-sm font-mono text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase mb-1 block">Accent (Trim)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={previewColors.accent}
                          onChange={(e) => { setPreviewColors(p => ({ ...p, accent: e.target.value })); setIsDirty(true); }}
                          className="w-10 h-10 rounded border border-neutral-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={previewColors.accent}
                          onChange={(e) => { setPreviewColors(p => ({ ...p, accent: e.target.value })); setIsDirty(true); }}
                          className="flex-1 px-3 py-2 bg-black border border-neutral-700 rounded text-sm font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
                  <h4 className="text-xs font-bold uppercase text-neutral-400 mb-3">Quick Presets</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => { setPreviewColors(p => ({ ...p, primary: color })); setIsDirty(true); }}
                        className="w-full aspect-square rounded border border-neutral-700 hover:border-white transition-all hover:scale-105"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-neutral-800 bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <select
                value={selectedCutSlug}
                onChange={(e) => setSelectedCutSlug(e.target.value)}
                className="flex-1 px-3 py-2 bg-black border border-neutral-700 rounded text-sm text-white cursor-pointer"
              >
                {Object.entries(sport.cuts).map(([slug, cut]) => (
                  <option key={slug} value={slug}>{cut.label}</option>
                ))}
              </select>
              <button className="p-2 hover:bg-neutral-800 rounded" title="Settings">
                <Settings size={16} className="text-neutral-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
