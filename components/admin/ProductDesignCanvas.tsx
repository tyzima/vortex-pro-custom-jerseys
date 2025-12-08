import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronLeft,
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
  Upload,
  Save,
  Settings,
  Shirt,
  Scissors,
  X,
  Check,
  AlertCircle,
  Loader2,
  FileUp,
  Edit3
} from 'lucide-react';
import type { ProductCut, DesignTemplate, DesignLayer, SportDefinition } from '../../types';
import { useTemplateLibrary } from '../../contexts/TemplateLibraryContext';
import {
  createTemplate,
  createLayer,
  updateLayer,
  deleteLayer,
  updateLayerPath,
  getProductDetails,
  updateProductDetails,
  type ProductDetails
} from '../../lib/templateService';

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

interface LocalLayer extends DesignLayer {
  isNew?: boolean;
  isModified?: boolean;
}

interface LocalTemplate extends Omit<DesignTemplate, 'layers'> {
  layers: LocalLayer[];
  isNew?: boolean;
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
  onBack
}) => {
  const { refresh } = useTemplateLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCutSlug, setSelectedCutSlug] = useState<string>(
    initialCutSlug && sport.cuts[initialCutSlug] ? initialCutSlug : Object.keys(sport.cuts)[0]
  );
  const [localTemplates, setLocalTemplates] = useState<LocalTemplate[]>(() =>
    sport.templates.map(t => ({ ...t, layers: t.layers.map(l => ({ ...l })) }))
  );
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [viewSide, setViewSide] = useState<'front' | 'back' | 'both'>('both');
  const [zoom, setZoom] = useState(100);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [layerStates, setLayerStates] = useState<Record<string, LayerState>>({});
  const [activePanel, setActivePanel] = useState<'layers' | 'colors'>('layers');
  const [previewColors, setPreviewColors] = useState({
    primary: '#D2F802',
    secondary: '#0a0a0a',
    accent: '#ffffff'
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{ layerId: string; side: 'front' | 'back' } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  const [showNewLayerModal, setShowNewLayerModal] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');

  const [editingLayerName, setEditingLayerName] = useState<string | null>(null);
  const [editLayerNameValue, setEditLayerNameValue] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  const [loadingProductDetails, setLoadingProductDetails] = useState(false);
  const [savingProductDetails, setSavingProductDetails] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  const currentCut = sport.cuts[selectedCutSlug];
  const currentTemplate = localTemplates[selectedTemplateIndex] || null;
  const garment = garmentType === 'jersey' ? currentCut?.jersey : currentCut?.shorts;

  const initializeLayerStates = (template: LocalTemplate) => {
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

  useEffect(() => {
    if (currentTemplate) {
      setLayerStates(prev => {
        const newStates = { ...prev };
        currentTemplate.layers.forEach((layer, index) => {
          if (!newStates[layer.id]) {
            const colorIndex = index % PRESET_COLORS.length;
            newStates[layer.id] = {
              id: layer.id,
              visible: true,
              locked: false,
              color: PRESET_COLORS[colorIndex]
            };
          }
        });
        return newStates;
      });
    }
  }, [currentTemplate]);

  const handleTemplateChange = (index: number) => {
    setSelectedTemplateIndex(index);
    setSelectedLayerId(null);
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

  const extractPathsFromSVG = (svgContent: string): string[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const paths = doc.querySelectorAll('path');
    return Array.from(paths)
      .map(p => p.getAttribute('d') || '')
      .filter(d => d.length > 0);
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;

    setCreatingTemplate(true);
    try {
      const slug = newTemplateName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const newTemplate = await createTemplate({
        sport_id: sport.id,
        slug,
        label: newTemplateName.trim(),
        display_order: localTemplates.length,
        is_published: true
      });

      const localNewTemplate: LocalTemplate = {
        id: slug,
        dbId: newTemplate.id,
        label: newTemplateName.trim(),
        layers: [],
        isNew: true
      };

      setLocalTemplates(prev => [...prev, localNewTemplate]);
      setSelectedTemplateIndex(localTemplates.length);
      setNewTemplateName('');
      setShowNewTemplateModal(false);
      setIsDirty(true);

      await refresh();
    } catch (error) {
      console.error('Failed to create template:', error);
      setSaveError('Failed to create template');
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleAddLayer = async () => {
    if (!newLayerName.trim() || !currentTemplate?.dbId) return;

    try {
      const layerSlug = `layer-${Date.now()}`;
      const newLayer = await createLayer(currentTemplate.dbId, {
        layer_slug: layerSlug,
        label: newLayerName.trim(),
        display_order: currentTemplate.layers.length
      });

      const localNewLayer: LocalLayer = {
        id: layerSlug,
        dbId: newLayer.id,
        label: newLayerName.trim(),
        paths: {
          jersey: { front: [], back: [] },
          shorts: { front: [], back: [] }
        },
        isNew: true
      };

      setLocalTemplates(prev => prev.map((t, i) =>
        i === selectedTemplateIndex
          ? { ...t, layers: [...t.layers, localNewLayer] }
          : t
      ));

      setLayerStates(prev => ({
        ...prev,
        [layerSlug]: {
          id: layerSlug,
          visible: true,
          locked: false,
          color: PRESET_COLORS[currentTemplate.layers.length % PRESET_COLORS.length]
        }
      }));

      setNewLayerName('');
      setShowNewLayerModal(false);
      setSelectedLayerId(layerSlug);
      setIsDirty(true);

      await refresh();
    } catch (error) {
      console.error('Failed to create layer:', error);
      setSaveError('Failed to create layer');
    }
  };

  const handleDeleteLayer = async (layerId: string) => {
    const layer = currentTemplate?.layers.find(l => l.id === layerId);
    if (!layer?.dbId) return;

    try {
      await deleteLayer(layer.dbId);

      setLocalTemplates(prev => prev.map((t, i) =>
        i === selectedTemplateIndex
          ? { ...t, layers: t.layers.filter(l => l.id !== layerId) }
          : t
      ));

      if (selectedLayerId === layerId) {
        setSelectedLayerId(null);
      }

      setShowDeleteConfirm(null);
      setIsDirty(true);

      await refresh();
    } catch (error) {
      console.error('Failed to delete layer:', error);
      setSaveError('Failed to delete layer');
    }
  };

  const handleRenameLayer = async (layerId: string) => {
    if (!editLayerNameValue.trim()) {
      setEditingLayerName(null);
      return;
    }

    const layer = currentTemplate?.layers.find(l => l.id === layerId);
    if (!layer?.dbId) return;

    try {
      await updateLayer(layer.dbId, { label: editLayerNameValue.trim() });

      setLocalTemplates(prev => prev.map((t, i) =>
        i === selectedTemplateIndex
          ? {
              ...t,
              layers: t.layers.map(l =>
                l.id === layerId ? { ...l, label: editLayerNameValue.trim() } : l
              )
            }
          : t
      ));

      setEditingLayerName(null);
      setIsDirty(true);

      await refresh();
    } catch (error) {
      console.error('Failed to rename layer:', error);
      setSaveError('Failed to rename layer');
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !uploadTarget || !currentTemplate) return;

    const file = files[0];
    if (!file.name.endsWith('.svg')) {
      setSaveError('Please upload an SVG file');
      return;
    }

    try {
      const content = await file.text();
      const paths = extractPathsFromSVG(content);

      if (paths.length === 0) {
        setSaveError('No paths found in SVG file');
        return;
      }

      const layer = currentTemplate.layers.find(l => l.id === uploadTarget.layerId);
      if (!layer?.dbId) {
        setSaveError('Layer not found');
        return;
      }

      await updateLayerPath(layer.dbId, garmentType, uploadTarget.side, paths);

      setLocalTemplates(prev => prev.map((t, i) =>
        i === selectedTemplateIndex
          ? {
              ...t,
              layers: t.layers.map(l =>
                l.id === uploadTarget.layerId
                  ? {
                      ...l,
                      paths: {
                        ...l.paths,
                        [garmentType]: {
                          ...l.paths[garmentType],
                          [uploadTarget.side]: paths
                        }
                      },
                      isModified: true
                    }
                  : l
              )
            }
          : t
      ));

      setShowUploadModal(false);
      setUploadTarget(null);
      setIsDirty(true);

      await refresh();
    } catch (error) {
      console.error('Failed to upload SVG:', error);
      setSaveError('Failed to process SVG file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await refresh();
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      setSaveError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const openUploadModal = (layerId: string, side: 'front' | 'back') => {
    setUploadTarget({ layerId, side });
    setShowUploadModal(true);
  };

  const openProductDetailsModal = async () => {
    if (!currentCut?.dbId) return;
    setShowProductDetailsModal(true);
    setLoadingProductDetails(true);
    try {
      const details = await getProductDetails(currentCut.dbId);
      setProductDetails(details);
    } catch (error) {
      console.error('Failed to load product details:', error);
      setSaveError('Failed to load product details');
    } finally {
      setLoadingProductDetails(false);
    }
  };

  const handleSaveProductDetails = async () => {
    if (!productDetails || !currentCut?.dbId) return;
    setSavingProductDetails(true);
    try {
      await updateProductDetails(currentCut.dbId, {
        label: productDetails.label,
        base_price: productDetails.base_price,
        description: productDetails.description,
        features: productDetails.features,
        min_quantity: productDetails.min_quantity,
        production_time: productDetails.production_time
      });
      setShowProductDetailsModal(false);
      setIsDirty(true);
      await refresh();
    } catch (error) {
      console.error('Failed to save product details:', error);
      setSaveError('Failed to save product details');
    } finally {
      setSavingProductDetails(false);
    }
  };

  const addFeature = () => {
    if (!newFeature.trim() || !productDetails) return;
    setProductDetails({
      ...productDetails,
      features: [...productDetails.features, newFeature.trim()]
    });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    if (!productDetails) return;
    setProductDetails({
      ...productDetails,
      features: productDetails.features.filter((_, i) => i !== index)
    });
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

            {currentTemplate.layers.map((layer) => {
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
          {isDirty && (
            <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
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

          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <Check size={14} /> Saved
            </span>
          )}

          {saveError && (
            <span className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle size={14} /> {saveError}
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-black font-bold uppercase text-xs rounded-lg hover:bg-brand-accent/90 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 bg-black border-r border-neutral-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-neutral-800">
            <h3 className="text-xs font-bold uppercase text-neutral-400">Design Templates</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {localTemplates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-neutral-600">No templates yet</p>
                <p className="text-xs text-neutral-700 mt-1">Create one to get started</p>
              </div>
            ) : (
              localTemplates.map((template, index) => (
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
            <button
              onClick={() => setShowNewTemplateModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-neutral-700 rounded-lg text-neutral-500 hover:border-brand-accent hover:text-brand-accent transition-all text-xs"
            >
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

            {currentTemplate ? (
              <div className="relative z-10 flex gap-12 items-start">
                {(viewSide === 'front' || viewSide === 'both') && renderGarmentCanvas('front')}
                {(viewSide === 'back' || viewSide === 'both') && renderGarmentCanvas('back')}
              </div>
            ) : (
              <div className="text-center text-neutral-600">
                <Layers size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-bold">No Template Selected</p>
                <p className="text-sm mt-2">Create a template to start designing</p>
              </div>
            )}
          </div>

          {currentTemplate && (
            <div className="h-24 bg-black border-t border-neutral-800 flex items-center px-4 gap-3 overflow-x-auto shrink-0">
              <span className="text-xs font-bold uppercase text-neutral-500 shrink-0">
                {currentTemplate.label}
              </span>
              <div className="h-8 w-px bg-neutral-800 shrink-0" />
              {localTemplates.map((template, index) => (
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
                onClick={() => setActivePanel('layers')}
                className={`flex-1 px-4 py-3 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors ${
                  activePanel === 'layers' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Layers size={14} /> Layers
              </button>
              <button
                onClick={() => setActivePanel('colors')}
                className={`flex-1 px-4 py-3 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors ${
                  activePanel === 'colors' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Palette size={14} /> Colors
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activePanel === 'layers' && currentTemplate && (
              <div className="p-4 space-y-2">
                {currentTemplate.layers.length === 0 ? (
                  <div className="text-center py-8">
                    <Layers size={32} className="mx-auto text-neutral-700 mb-2" />
                    <p className="text-xs text-neutral-600">No layers yet</p>
                    <p className="text-xs text-neutral-700 mt-1">Add a layer to start designing</p>
                  </div>
                ) : (
                  currentTemplate.layers.map((layer) => {
                    const state = layerStates[layer.id];
                    const isSelected = selectedLayerId === layer.id;

                    return (
                      <div
                        key={layer.id}
                        className={`group bg-neutral-900 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-brand-accent shadow-lg shadow-brand-accent/10'
                            : 'border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div
                          className="flex items-center gap-2 p-3 cursor-pointer"
                          onClick={() => !state?.locked && setSelectedLayerId(layer.id)}
                        >
                          <div className="cursor-grab text-neutral-600 hover:text-neutral-400">
                            <GripVertical size={14} />
                          </div>

                          <div
                            className="w-6 h-6 rounded border-2 border-neutral-700 shrink-0"
                            style={{ backgroundColor: state?.color || '#D2F802' }}
                          />

                          <div className="flex-1 min-w-0">
                            {editingLayerName === layer.id ? (
                              <input
                                type="text"
                                value={editLayerNameValue}
                                onChange={(e) => setEditLayerNameValue(e.target.value)}
                                onBlur={() => handleRenameLayer(layer.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRenameLayer(layer.id);
                                  if (e.key === 'Escape') setEditingLayerName(null);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-1 py-0.5 bg-neutral-800 border border-brand-accent rounded text-sm text-white"
                                autoFocus
                              />
                            ) : (
                              <p
                                className="text-sm font-medium text-white truncate"
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  setEditingLayerName(layer.id);
                                  setEditLayerNameValue(layer.label);
                                }}
                              >
                                {layer.label}
                              </p>
                            )}
                            <p className="text-[10px] text-neutral-500">
                              {layer.paths[garmentType].front.length + layer.paths[garmentType].back.length} paths
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                              className="p-1 hover:bg-neutral-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title={state?.visible ? 'Hide' : 'Show'}
                            >
                              {state?.visible !== false ? (
                                <Eye size={14} className="text-neutral-400" />
                              ) : (
                                <EyeOff size={14} className="text-neutral-600" />
                              )}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                              className="p-1 hover:bg-neutral-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title={state?.locked ? 'Unlock' : 'Lock'}
                            >
                              {state?.locked ? (
                                <Lock size={14} className="text-yellow-500" />
                              ) : (
                                <Unlock size={14} className="text-neutral-400" />
                              )}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(layer.id); }}
                              className="p-1 hover:bg-red-900/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete layer"
                            >
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="px-3 pb-3 pt-1 border-t border-neutral-800 mt-1 space-y-3">
                            <div>
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

                            <div>
                              <label className="text-[10px] text-neutral-500 uppercase mb-2 block">Upload SVG Paths</label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openUploadModal(layer.id, 'front'); }}
                                  className="flex items-center justify-center gap-1 px-2 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-xs transition-colors"
                                >
                                  <Upload size={12} />
                                  Front ({layer.paths[garmentType].front.length})
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); openUploadModal(layer.id, 'back'); }}
                                  className="flex items-center justify-center gap-1 px-2 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-xs transition-colors"
                                >
                                  <Upload size={12} />
                                  Back ({layer.paths[garmentType].back.length})
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                <button
                  onClick={() => setShowNewLayerModal(true)}
                  disabled={!currentTemplate.dbId}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-neutral-700 rounded-lg text-neutral-500 hover:border-brand-accent hover:text-brand-accent transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                  Add Layer
                </button>
              </div>
            )}

            {activePanel === 'colors' && (
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
              <button
                onClick={openProductDetailsModal}
                className="p-2 hover:bg-neutral-800 rounded"
                title="Product Settings"
              >
                <Settings size={16} className="text-neutral-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showNewTemplateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold uppercase">New Template</h3>
              <button
                onClick={() => { setShowNewTemplateModal(false); setNewTemplateName(''); }}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-400 uppercase mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g., Lightning Bolt, Stripes"
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-brand-accent outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTemplate()}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowNewTemplateModal(false); setNewTemplateName(''); }}
                className="flex-1 px-4 py-3 bg-neutral-800 text-white font-bold uppercase text-sm rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplateName.trim() || creatingTemplate}
                className="flex-1 px-4 py-3 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingTemplate && <Loader2 size={16} className="animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewLayerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold uppercase">Add Layer</h3>
              <button
                onClick={() => { setShowNewLayerModal(false); setNewLayerName(''); }}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-400 uppercase mb-2">
                Layer Name
              </label>
              <input
                type="text"
                value={newLayerName}
                onChange={(e) => setNewLayerName(e.target.value)}
                placeholder="e.g., Side Panel, Chevron"
                className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-brand-accent outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddLayer()}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowNewLayerModal(false); setNewLayerName(''); }}
                className="flex-1 px-4 py-3 bg-neutral-800 text-white font-bold uppercase text-sm rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLayer}
                disabled={!newLayerName.trim()}
                className="flex-1 px-4 py-3 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Layer
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && uploadTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold uppercase">Upload SVG</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  {uploadTarget.side} view for {garmentType}
                </p>
              </div>
              <button
                onClick={() => { setShowUploadModal(false); setUploadTarget(null); }}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragOver
                  ? 'border-brand-accent bg-brand-accent/10'
                  : 'border-neutral-700 hover:border-neutral-600'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <FileUp size={48} className="mx-auto text-neutral-600 mb-4" />
              <p className="text-neutral-400 mb-2">
                Drag and drop your SVG file here
              </p>
              <p className="text-neutral-600 text-sm mb-4">or</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-colors"
              >
                Browse Files
              </button>
            </div>

            <p className="text-xs text-neutral-600 mt-4 text-center">
              Upload an SVG file containing path elements. All paths will be extracted and added to this layer.
            </p>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold">Delete Layer?</h3>
            </div>

            <p className="text-neutral-400 text-sm mb-6">
              This will permanently delete this layer and all its paths. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-neutral-800 text-white font-bold uppercase text-sm rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLayer(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold uppercase text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showProductDetailsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold uppercase">Product Settings</h3>
              <button
                onClick={() => { setShowProductDetailsModal(false); setProductDetails(null); }}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {loadingProductDetails ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-brand-accent" />
              </div>
            ) : productDetails ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-neutral-400 uppercase mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={productDetails.label}
                      onChange={(e) => setProductDetails({ ...productDetails, label: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-lg text-white focus:border-brand-accent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-400 uppercase mb-2">
                      Base Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productDetails.base_price}
                      onChange={(e) => setProductDetails({ ...productDetails, base_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-lg text-white focus:border-brand-accent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-400 uppercase mb-2">
                      Min Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={productDetails.min_quantity}
                      onChange={(e) => setProductDetails({ ...productDetails, min_quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-lg text-white focus:border-brand-accent outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-neutral-400 uppercase mb-2">
                      Production Time
                    </label>
                    <input
                      type="text"
                      value={productDetails.production_time}
                      onChange={(e) => setProductDetails({ ...productDetails, production_time: e.target.value })}
                      placeholder="e.g., 2-3 weeks"
                      className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-brand-accent outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-neutral-400 uppercase mb-2">
                      Description
                    </label>
                    <textarea
                      value={productDetails.description}
                      onChange={(e) => setProductDetails({ ...productDetails, description: e.target.value })}
                      rows={4}
                      placeholder="Enter product description..."
                      className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-brand-accent outline-none resize-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-neutral-400 uppercase mb-2">
                      Features
                    </label>
                    <div className="space-y-2 mb-3">
                      {productDetails.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 bg-black border border-neutral-800 rounded-lg"
                        >
                          <span className="flex-1 text-sm text-white">{feature}</span>
                          <button
                            onClick={() => removeFeature(index)}
                            className="text-neutral-500 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add a feature..."
                        className="flex-1 px-4 py-2 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-brand-accent outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                      />
                      <button
                        onClick={addFeature}
                        disabled={!newFeature.trim()}
                        className="px-4 py-2 bg-neutral-800 text-white font-bold uppercase text-xs rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-800">
                  <button
                    onClick={() => { setShowProductDetailsModal(false); setProductDetails(null); }}
                    className="flex-1 px-4 py-3 bg-neutral-800 text-white font-bold uppercase text-sm rounded-lg hover:bg-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProductDetails}
                    disabled={savingProductDetails}
                    className="flex-1 px-4 py-3 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingProductDetails && <Loader2 size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                Failed to load product details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
