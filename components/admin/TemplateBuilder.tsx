import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Upload,
  Check,
  X,
  Shirt,
  Scissors,
  Save,
  AlertCircle,
  Loader2,
  Layout
} from 'lucide-react';
import { EditContext } from './LibraryViewer';
import {
  getSports,
  getCutById,
  getTemplateById,
  createCut,
  updateCut,
  updateGarmentPath,
  createTemplate,
  updateTemplate,
  createLayer,
  updateLayer,
  updateLayerPath
} from '../../lib/templateService';
import { useTemplateLibrary } from '../../contexts/TemplateLibraryContext';

type BuilderMode = 'cut' | 'template';
type BuilderStep = 'mode' | 'sport' | 'garments' | 'upload' | 'assign' | 'review';

interface GarmentUpload {
  jersey?: { front: string; back: string };
  shorts?: { front: string; back: string };
}

interface PathAssignment {
  jersey?: {
    shape: { front: string[]; back: string[] };
    trim: { front: string[]; back: string[] };
  };
  shorts?: {
    shape: { front: string[]; back: string[] };
    trim: { front: string[]; back: string[] };
  };
}

interface LayerData {
  id: string;
  dbId?: string;
  label: string;
  paths: {
    jersey: { front: string[]; back: string[] };
    shorts: { front: string[]; back: string[] };
  };
}

interface TemplateBuilderProps {
  editContext: EditContext | null;
  onExit: () => void;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ editContext, onExit }) => {
  const { refresh } = useTemplateLibrary();
  const [step, setStep] = useState<BuilderStep>('mode');
  const [mode, setMode] = useState<BuilderMode>('cut');
  const [selectedSport, setSelectedSport] = useState<{ id: string; label: string } | null>(null);
  const [availableSports, setAvailableSports] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedGarments, setSelectedGarments] = useState<Set<'jersey' | 'shorts'>>(new Set(['jersey']));
  const [uploads, setUploads] = useState<GarmentUpload>({});
  const [pathAssignments, setPathAssignments] = useState<PathAssignment>({});
  const [cutSlug, setCutSlug] = useState('');
  const [cutLabel, setCutLabel] = useState('');
  const [templateSlug, setTemplateSlug] = useState('');
  const [templateLabel, setTemplateLabel] = useState('');
  const [layers, setLayers] = useState<LayerData[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEditMode = !!editContext;

  useEffect(() => {
    loadSports();
  }, []);

  useEffect(() => {
    if (editContext) {
      loadEditData();
    }
  }, [editContext]);

  const loadSports = async () => {
    try {
      const sports = await getSports();
      setAvailableSports(sports.map(s => ({ id: s.id, label: s.label })));
    } catch (err) {
      setError('Failed to load sports');
    }
  };

  const loadEditData = async () => {
    if (!editContext) return;

    try {
      setMode(editContext.mode);
      setSelectedSport({ id: editContext.sportId, label: editContext.sportLabel });

      if (editContext.mode === 'cut' && editContext.cutDbId) {
        const cutData = await getCutById(editContext.cutDbId);
        setCutSlug(editContext.cutSlug || '');
        setCutLabel(editContext.cutLabel || '');

        const jerseyPaths = cutData.garment_paths.filter(p => p.garment_type === 'jersey');
        const shortsPaths = cutData.garment_paths.filter(p => p.garment_type === 'shorts');

        const hasJersey = jerseyPaths.length > 0;
        const hasShorts = shortsPaths.length > 0;

        const activeGarments = new Set<'jersey' | 'shorts'>();
        if (hasJersey) activeGarments.add('jersey');
        if (hasShorts) activeGarments.add('shorts');
        setSelectedGarments(activeGarments);

        const assignments: PathAssignment = {};

        if (hasJersey) {
          assignments.jersey = {
            shape: {
              front: jerseyPaths.filter(p => p.path_type === 'shape' && p.side === 'front').map(p => p.svg_path),
              back: jerseyPaths.filter(p => p.path_type === 'shape' && p.side === 'back').map(p => p.svg_path)
            },
            trim: {
              front: jerseyPaths.filter(p => p.path_type === 'trim' && p.side === 'front').map(p => p.svg_path),
              back: jerseyPaths.filter(p => p.path_type === 'trim' && p.side === 'back').map(p => p.svg_path)
            }
          };
        }

        if (hasShorts) {
          assignments.shorts = {
            shape: {
              front: shortsPaths.filter(p => p.path_type === 'shape' && p.side === 'front').map(p => p.svg_path),
              back: shortsPaths.filter(p => p.path_type === 'shape' && p.side === 'back').map(p => p.svg_path)
            },
            trim: {
              front: shortsPaths.filter(p => p.path_type === 'trim' && p.side === 'front').map(p => p.svg_path),
              back: shortsPaths.filter(p => p.path_type === 'trim' && p.side === 'back').map(p => p.svg_path)
            }
          };
        }

        setPathAssignments(assignments);
        setStep('review');
      } else if (editContext.mode === 'template' && editContext.templateDbId) {
        const templateData = await getTemplateById(editContext.templateDbId);
        setTemplateSlug(editContext.templateSlug || '');
        setTemplateLabel(editContext.templateLabel || '');

        const loadedLayers: LayerData[] = templateData.template_layers.map(layer => {
          const layerPaths = layer.layer_paths || [];
          return {
            id: layer.layer_slug,
            dbId: layer.id,
            label: layer.label,
            paths: {
              jersey: {
                front: layerPaths.filter(p => p.garment_type === 'jersey' && p.side === 'front').map(p => p.svg_path),
                back: layerPaths.filter(p => p.garment_type === 'jersey' && p.side === 'back').map(p => p.svg_path)
              },
              shorts: {
                front: layerPaths.filter(p => p.garment_type === 'shorts' && p.side === 'front').map(p => p.svg_path),
                back: layerPaths.filter(p => p.garment_type === 'shorts' && p.side === 'back').map(p => p.svg_path)
              }
            }
          };
        });

        const hasJersey = loadedLayers.some(l => l.paths.jersey.front.length > 0 || l.paths.jersey.back.length > 0);
        const hasShorts = loadedLayers.some(l => l.paths.shorts.front.length > 0 || l.paths.shorts.back.length > 0);

        const activeGarments = new Set<'jersey' | 'shorts'>();
        if (hasJersey) activeGarments.add('jersey');
        if (hasShorts) activeGarments.add('shorts');
        setSelectedGarments(activeGarments);

        setLayers(loadedLayers);
        setStep('review');
      }
    } catch (err) {
      setError(`Failed to load ${editContext.mode} data: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const extractPathsFromSVG = (svgString: string): string[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const paths = doc.querySelectorAll('path');
    return Array.from(paths).map(p => p.getAttribute('d') || '').filter(d => d.length > 0);
  };

  const handleFileUpload = (garment: 'jersey' | 'shorts', side: 'front' | 'back', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgContent = e.target?.result as string;
      setUploads(prev => ({
        ...prev,
        [garment]: {
          ...prev[garment],
          [side]: svgContent
        }
      }));
    };
    reader.readAsText(file);
  };

  const processUploads = () => {
    const assignments: PathAssignment = {};

    if (uploads.jersey?.front || uploads.jersey?.back) {
      const frontPaths = uploads.jersey.front ? extractPathsFromSVG(uploads.jersey.front) : [];
      const backPaths = uploads.jersey.back ? extractPathsFromSVG(uploads.jersey.back) : [];
      assignments.jersey = {
        shape: { front: frontPaths, back: backPaths },
        trim: { front: [], back: [] }
      };
    }

    if (uploads.shorts?.front || uploads.shorts?.back) {
      const frontPaths = uploads.shorts.front ? extractPathsFromSVG(uploads.shorts.front) : [];
      const backPaths = uploads.shorts.back ? extractPathsFromSVG(uploads.shorts.back) : [];
      assignments.shorts = {
        shape: { front: frontPaths, back: backPaths },
        trim: { front: [], back: [] }
      };
    }

    setPathAssignments(assignments);
    if (mode === 'cut') {
      setStep('assign');
    } else {
      const newLayers: LayerData[] = [];
      if (assignments.jersey) {
        newLayers.push({
          id: 'layer_1',
          label: 'Layer 1',
          paths: {
            jersey: assignments.jersey.shape,
            shorts: { front: [], back: [] }
          }
        });
      }
      if (assignments.shorts && !newLayers.length) {
        newLayers.push({
          id: 'layer_1',
          label: 'Layer 1',
          paths: {
            jersey: { front: [], back: [] },
            shorts: assignments.shorts.shape
          }
        });
      }
      setLayers(newLayers);
      setStep('review');
    }
  };

  const movePath = (
    garment: 'jersey' | 'shorts',
    fromType: 'shape' | 'trim',
    toType: 'shape' | 'trim',
    side: 'front' | 'back',
    pathIndex: number
  ) => {
    setPathAssignments(prev => {
      const garmentData = prev[garment];
      if (!garmentData) return prev;

      const fromArray = [...garmentData[fromType][side]];
      const toArray = [...garmentData[toType][side]];
      const [movedPath] = fromArray.splice(pathIndex, 1);
      toArray.push(movedPath);

      return {
        ...prev,
        [garment]: {
          ...garmentData,
          [fromType]: { ...garmentData[fromType], [side]: fromArray },
          [toType]: { ...garmentData[toType], [side]: toArray }
        }
      };
    });
  };

  const handleSaveCut = async () => {
    if (!selectedSport || !cutSlug || !cutLabel) {
      setError('Sport, slug, and label are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let cutId: string;

      if (isEditMode && editContext.cutDbId) {
        await updateCut(editContext.cutDbId, { slug: cutSlug, label: cutLabel });
        cutId = editContext.cutDbId;
      } else {
        const newCut = await createCut(selectedSport.id, {
          slug: cutSlug,
          label: cutLabel,
          display_order: 0
        });
        cutId = newCut.id;
      }

      if (pathAssignments.jersey) {
        for (const path of pathAssignments.jersey.shape.front) {
          await updateGarmentPath(cutId, 'jersey', 'shape', 'front', path);
        }
        for (const path of pathAssignments.jersey.shape.back) {
          await updateGarmentPath(cutId, 'jersey', 'shape', 'back', path);
        }
        for (const path of pathAssignments.jersey.trim.front) {
          await updateGarmentPath(cutId, 'jersey', 'trim', 'front', path);
        }
        for (const path of pathAssignments.jersey.trim.back) {
          await updateGarmentPath(cutId, 'jersey', 'trim', 'back', path);
        }
      }

      if (pathAssignments.shorts) {
        for (const path of pathAssignments.shorts.shape.front) {
          await updateGarmentPath(cutId, 'shorts', 'shape', 'front', path);
        }
        for (const path of pathAssignments.shorts.shape.back) {
          await updateGarmentPath(cutId, 'shorts', 'shape', 'back', path);
        }
        for (const path of pathAssignments.shorts.trim.front) {
          await updateGarmentPath(cutId, 'shorts', 'trim', 'front', path);
        }
        for (const path of pathAssignments.shorts.trim.back) {
          await updateGarmentPath(cutId, 'shorts', 'trim', 'back', path);
        }
      }

      await refresh();
      setSuccess(true);
      setTimeout(() => {
        onExit();
      }, 2000);
    } catch (err) {
      setError(`Failed to save cut: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedSport || !templateSlug || !templateLabel || layers.length === 0) {
      setError('Sport, slug, label, and at least one layer are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let templateId: string;

      if (isEditMode && editContext.templateDbId) {
        await updateTemplate(editContext.templateDbId, {
          slug: templateSlug,
          label: templateLabel
        });
        templateId = editContext.templateDbId;
      } else {
        const newTemplate = await createTemplate({
          sport_id: selectedSport.id,
          slug: templateSlug,
          label: templateLabel,
          display_order: 0,
          is_published: true
        });
        templateId = newTemplate.id;
      }

      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        let layerId: string;

        if (layer.dbId) {
          await updateLayer(layer.dbId, {
            layer_slug: layer.id,
            label: layer.label,
            display_order: i
          });
          layerId = layer.dbId;
        } else {
          const newLayer = await createLayer(templateId, {
            layer_slug: layer.id,
            label: layer.label,
            display_order: i
          });
          layerId = newLayer.id;
        }

        for (const path of layer.paths.jersey.front) {
          await updateLayerPath(layerId, 'jersey', 'front', path);
        }
        for (const path of layer.paths.jersey.back) {
          await updateLayerPath(layerId, 'jersey', 'back', path);
        }
        for (const path of layer.paths.shorts.front) {
          await updateLayerPath(layerId, 'shorts', 'front', path);
        }
        for (const path of layer.paths.shorts.back) {
          await updateLayerPath(layerId, 'shorts', 'back', path);
        }
      }

      await refresh();
      setSuccess(true);
      setTimeout(() => {
        onExit();
      }, 2000);
    } catch (err) {
      setError(`Failed to save template: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const addLayer = () => {
    const layerId = `layer_${Date.now()}`;
    setLayers([
      ...layers,
      {
        id: layerId,
        label: `Layer ${layers.length + 1}`,
        paths: {
          jersey: { front: [], back: [] },
          shorts: { front: [], back: [] }
        }
      }
    ]);
  };

  const removeLayer = (index: number) => {
    setLayers(layers.filter((_, i) => i !== index));
  };

  const updateLayerLabel = (index: number, label: string) => {
    const updated = [...layers];
    updated[index].label = label;
    setLayers(updated);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {isEditMode ? 'Updated' : 'Created'} Successfully!
          </h2>
          <p className="text-neutral-400">Returning to library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> {isEditMode ? 'Cancel Edit' : 'Back'}
          </button>
          <div className="h-6 w-px bg-neutral-800" />
          <h2 className="text-2xl font-bold text-white uppercase">
            {isEditMode
              ? `Editing: ${editContext.mode === 'cut' ? editContext.cutLabel : editContext.templateLabel}`
              : 'Template Builder'}
          </h2>
        </div>
        {!isEditMode && (
          <div className="flex gap-2">
            {['mode', 'sport', 'garments', 'upload', 'assign', 'review'].map((s, i) => (
              <div
                key={s}
                className={`w-8 h-1 rounded ${
                  ['mode', 'sport', 'garments', 'upload', 'assign', 'review'].indexOf(step) >= i
                    ? 'bg-brand-accent'
                    : 'bg-neutral-800'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-400 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {step === 'mode' && !isEditMode && (
          <div className="max-w-2xl mx-auto py-12">
            <h3 className="text-xl font-bold text-white mb-6 text-center uppercase">Select Builder Mode</h3>
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => {
                  setMode('cut');
                  setStep('sport');
                }}
                className="p-8 bg-neutral-900 border-2 border-neutral-800 hover:border-brand-accent rounded-lg transition-all"
              >
                <Shirt className="w-12 h-12 text-brand-accent mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">Product Cut</h4>
                <p className="text-sm text-neutral-400">Define garment shapes and silhouettes</p>
              </button>
              <button
                onClick={() => {
                  setMode('template');
                  setStep('sport');
                }}
                className="p-8 bg-neutral-900 border-2 border-neutral-800 hover:border-brand-accent rounded-lg transition-all"
              >
                <Layout className="w-12 h-12 text-brand-accent mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">Design Template</h4>
                <p className="text-sm text-neutral-400">Create layered design patterns</p>
              </button>
            </div>
          </div>
        )}

        {step === 'sport' && (
          <div className="max-w-2xl mx-auto py-12">
            <h3 className="text-xl font-bold text-white mb-6 text-center uppercase">Select Sport</h3>
            <div className="grid grid-cols-2 gap-4">
              {availableSports.map(sport => (
                <button
                  key={sport.id}
                  onClick={() => {
                    setSelectedSport(sport);
                    setStep('garments');
                  }}
                  className="p-6 bg-neutral-900 border-2 border-neutral-800 hover:border-brand-accent rounded-lg transition-all text-white font-bold uppercase"
                >
                  {sport.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'garments' && (
          <div className="max-w-2xl mx-auto py-12">
            <h3 className="text-xl font-bold text-white mb-6 text-center uppercase">
              Select Garment Types
            </h3>
            <p className="text-neutral-400 text-center mb-8">Choose which garments to configure</p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => {
                  const updated = new Set(selectedGarments);
                  if (updated.has('jersey')) {
                    if (updated.size > 1) updated.delete('jersey');
                  } else {
                    updated.add('jersey');
                  }
                  setSelectedGarments(updated);
                }}
                className={`p-8 border-2 rounded-lg transition-all ${
                  selectedGarments.has('jersey')
                    ? 'bg-brand-accent/10 border-brand-accent'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <Shirt className="w-12 h-12 text-brand-accent mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white">Jersey</h4>
              </button>
              <button
                onClick={() => {
                  const updated = new Set(selectedGarments);
                  if (updated.has('shorts')) {
                    if (updated.size > 1) updated.delete('shorts');
                  } else {
                    updated.add('shorts');
                  }
                  setSelectedGarments(updated);
                }}
                className={`p-8 border-2 rounded-lg transition-all ${
                  selectedGarments.has('shorts')
                    ? 'bg-green-500/10 border-green-500'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <Scissors className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white">Shorts</h4>
              </button>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setStep('upload')}
                disabled={selectedGarments.size === 0}
                className="px-8 py-3 bg-brand-accent text-black font-bold uppercase rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'upload' && (
          <div className="max-w-4xl mx-auto py-12">
            <h3 className="text-xl font-bold text-white mb-6 text-center uppercase">Upload SVG Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {selectedGarments.has('jersey') && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                  <h4 className="text-brand-accent font-bold uppercase mb-4 flex items-center gap-2">
                    <Shirt size={16} /> Jersey
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-400 mb-2">Front View</label>
                      <input
                        type="file"
                        accept=".svg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('jersey', 'front', file);
                        }}
                        className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand-accent file:text-black hover:file:bg-brand-accent/90"
                      />
                      {uploads.jersey?.front && (
                        <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
                          <Check size={12} /> Uploaded ({extractPathsFromSVG(uploads.jersey.front).length} paths)
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-400 mb-2">Back View</label>
                      <input
                        type="file"
                        accept=".svg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('jersey', 'back', file);
                        }}
                        className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand-accent file:text-black hover:file:bg-brand-accent/90"
                      />
                      {uploads.jersey?.back && (
                        <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
                          <Check size={12} /> Uploaded ({extractPathsFromSVG(uploads.jersey.back).length} paths)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedGarments.has('shorts') && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                  <h4 className="text-green-500 font-bold uppercase mb-4 flex items-center gap-2">
                    <Scissors size={16} /> Shorts
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-400 mb-2">Front View</label>
                      <input
                        type="file"
                        accept=".svg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('shorts', 'front', file);
                        }}
                        className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-black hover:file:bg-green-400"
                      />
                      {uploads.shorts?.front && (
                        <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
                          <Check size={12} /> Uploaded ({extractPathsFromSVG(uploads.shorts.front).length} paths)
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-400 mb-2">Back View</label>
                      <input
                        type="file"
                        accept=".svg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('shorts', 'back', file);
                        }}
                        className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-black hover:file:bg-green-400"
                      />
                      {uploads.shorts?.back && (
                        <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
                          <Check size={12} /> Uploaded ({extractPathsFromSVG(uploads.shorts.back).length} paths)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center mt-8">
              <button
                onClick={processUploads}
                className="px-8 py-3 bg-brand-accent text-black font-bold uppercase rounded-lg hover:bg-brand-accent/90 transition-colors flex items-center gap-2"
              >
                <Upload size={16} />
                Process & Continue
              </button>
            </div>
          </div>
        )}

        {step === 'assign' && mode === 'cut' && (
          <div className="max-w-7xl mx-auto py-12">
            <h3 className="text-xl font-bold text-white mb-6 text-center uppercase">Assign Paths Visually</h3>
            <p className="text-neutral-400 text-center mb-8">
              Move paths between Shape (dark gray) and Trim (highlighted color)
            </p>

            {selectedGarments.has('jersey') && pathAssignments.jersey && (
              <div className="mb-12">
                <h4 className="text-brand-accent font-bold uppercase mb-6 flex items-center gap-2 text-lg">
                  <Shirt size={20} /> Jersey Paths
                </h4>
                <div className="grid grid-cols-2 gap-8">
                  {(['front', 'back'] as const).map(side => (
                    <div key={side} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                      <div className="p-4 bg-neutral-900/50 border-b border-neutral-800">
                        <h5 className="text-white font-bold uppercase">{side} View</h5>
                      </div>

                      {/* VISUAL PREVIEW */}
                      <div className="p-8 bg-gradient-to-br from-black to-neutral-900 flex items-center justify-center">
                        <svg viewBox="0 0 400 500" className="w-full max-w-sm h-auto drop-shadow-2xl">
                          {pathAssignments.jersey.shape[side].map((path, i) => (
                            <path
                              key={`shape-${i}`}
                              d={path}
                              fill="#2a2a2a"
                              stroke="#444"
                              strokeWidth="2"
                            />
                          ))}
                          {pathAssignments.jersey.trim[side].map((path, i) => (
                            <path
                              key={`trim-${i}`}
                              d={path}
                              fill="#D2F802"
                              stroke="#fff"
                              strokeWidth="1"
                              opacity="0.9"
                            />
                          ))}
                        </svg>
                      </div>

                      {/* PATH CONTROLS */}
                      <div className="p-6 space-y-4">
                        <div className="bg-black/50 p-4 rounded-lg">
                          <div className="text-xs text-neutral-400 uppercase mb-3 font-bold flex items-center justify-between">
                            <span>Shape Paths ({pathAssignments.jersey.shape[side].length})</span>
                            <span className="text-[10px] text-neutral-600">Dark Gray</span>
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {pathAssignments.jersey.shape[side].map((path, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <span className="flex-1 truncate font-mono text-neutral-500">Path {i + 1}</span>
                                <button
                                  onClick={() => movePath('jersey', 'shape', 'trim', side, i)}
                                  className="text-brand-accent hover:bg-brand-accent hover:text-black px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                >
                                  → Trim
                                </button>
                              </div>
                            ))}
                            {pathAssignments.jersey.shape[side].length === 0 && (
                              <div className="text-xs text-neutral-600 text-center py-2">No shape paths</div>
                            )}
                          </div>
                        </div>

                        <div className="bg-black/50 p-4 rounded-lg">
                          <div className="text-xs text-neutral-400 uppercase mb-3 font-bold flex items-center justify-between">
                            <span>Trim Paths ({pathAssignments.jersey.trim[side].length})</span>
                            <span className="text-[10px] text-brand-accent">Highlighted</span>
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {pathAssignments.jersey.trim[side].map((path, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <button
                                  onClick={() => movePath('jersey', 'trim', 'shape', side, i)}
                                  className="text-brand-accent hover:bg-brand-accent hover:text-black px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                >
                                  ← Shape
                                </button>
                                <span className="flex-1 truncate font-mono text-neutral-500">Path {i + 1}</span>
                              </div>
                            ))}
                            {pathAssignments.jersey.trim[side].length === 0 && (
                              <div className="text-xs text-neutral-600 text-center py-2">No trim paths</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedGarments.has('shorts') && pathAssignments.shorts && (
              <div className="mb-12">
                <h4 className="text-green-500 font-bold uppercase mb-6 flex items-center gap-2 text-lg">
                  <Scissors size={20} /> Shorts Paths
                </h4>
                <div className="grid grid-cols-2 gap-8">
                  {(['front', 'back'] as const).map(side => (
                    <div key={side} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                      <div className="p-4 bg-neutral-900/50 border-b border-neutral-800">
                        <h5 className="text-white font-bold uppercase">{side} View</h5>
                      </div>

                      {/* VISUAL PREVIEW */}
                      <div className="p-8 bg-gradient-to-br from-black to-neutral-900 flex items-center justify-center">
                        <svg viewBox="0 0 400 500" className="w-full max-w-sm h-auto drop-shadow-2xl">
                          {pathAssignments.shorts.shape[side].map((path, i) => (
                            <path
                              key={`shape-${i}`}
                              d={path}
                              fill="#2a2a2a"
                              stroke="#444"
                              strokeWidth="2"
                            />
                          ))}
                          {pathAssignments.shorts.trim[side].map((path, i) => (
                            <path
                              key={`trim-${i}`}
                              d={path}
                              fill="#22c55e"
                              stroke="#fff"
                              strokeWidth="1"
                              opacity="0.9"
                            />
                          ))}
                        </svg>
                      </div>

                      {/* PATH CONTROLS */}
                      <div className="p-6 space-y-4">
                        <div className="bg-black/50 p-4 rounded-lg">
                          <div className="text-xs text-neutral-400 uppercase mb-3 font-bold flex items-center justify-between">
                            <span>Shape Paths ({pathAssignments.shorts.shape[side].length})</span>
                            <span className="text-[10px] text-neutral-600">Dark Gray</span>
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {pathAssignments.shorts.shape[side].map((path, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <span className="flex-1 truncate font-mono text-neutral-500">Path {i + 1}</span>
                                <button
                                  onClick={() => movePath('shorts', 'shape', 'trim', side, i)}
                                  className="text-green-500 hover:bg-green-500 hover:text-black px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                >
                                  → Trim
                                </button>
                              </div>
                            ))}
                            {pathAssignments.shorts.shape[side].length === 0 && (
                              <div className="text-xs text-neutral-600 text-center py-2">No shape paths</div>
                            )}
                          </div>
                        </div>

                        <div className="bg-black/50 p-4 rounded-lg">
                          <div className="text-xs text-neutral-400 uppercase mb-3 font-bold flex items-center justify-between">
                            <span>Trim Paths ({pathAssignments.shorts.trim[side].length})</span>
                            <span className="text-[10px] text-green-500">Highlighted</span>
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {pathAssignments.shorts.trim[side].map((path, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <button
                                  onClick={() => movePath('shorts', 'trim', 'shape', side, i)}
                                  className="text-green-500 hover:bg-green-500 hover:text-black px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                >
                                  ← Shape
                                </button>
                                <span className="flex-1 truncate font-mono text-neutral-500">Path {i + 1}</span>
                              </div>
                            ))}
                            {pathAssignments.shorts.trim[side].length === 0 && (
                              <div className="text-xs text-neutral-600 text-center py-2">No trim paths</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={() => setStep('review')}
                className="px-8 py-3 bg-brand-accent text-black font-bold uppercase rounded-lg hover:bg-brand-accent/90 transition-colors"
              >
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="max-w-4xl mx-auto py-12">
            <h3 className="text-xl font-bold text-white mb-6 text-center uppercase">Review & Save</h3>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
              <h4 className="text-white font-bold uppercase mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">
                    {mode === 'cut' ? 'Cut' : 'Template'} Slug
                  </label>
                  <input
                    type="text"
                    value={mode === 'cut' ? cutSlug : templateSlug}
                    onChange={(e) => mode === 'cut' ? setCutSlug(e.target.value) : setTemplateSlug(e.target.value)}
                    className="w-full px-4 py-2 bg-black border border-neutral-800 rounded text-white focus:border-brand-accent outline-none"
                    placeholder="e.g., mens-elite"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">
                    {mode === 'cut' ? 'Cut' : 'Template'} Label
                  </label>
                  <input
                    type="text"
                    value={mode === 'cut' ? cutLabel : templateLabel}
                    onChange={(e) => mode === 'cut' ? setCutLabel(e.target.value) : setTemplateLabel(e.target.value)}
                    className="w-full px-4 py-2 bg-black border border-neutral-800 rounded text-white focus:border-brand-accent outline-none"
                    placeholder="e.g., Men's Elite"
                  />
                </div>
              </div>
            </div>

            {mode === 'cut' && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
                <h4 className="text-white font-bold uppercase mb-6">Visual Preview</h4>
                <div className="grid grid-cols-2 gap-8">
                  {selectedGarments.has('jersey') && pathAssignments.jersey && (
                    <div className="space-y-4">
                      <h5 className="text-brand-accent font-bold flex items-center gap-2">
                        <Shirt size={16} /> Jersey
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-neutral-400 mb-2">Front</div>
                          <div className="aspect-[3/4] bg-gradient-to-br from-black to-neutral-900 rounded-lg flex items-center justify-center p-4 border border-neutral-800">
                            <svg viewBox="0 0 400 500" className="w-full h-full">
                              {pathAssignments.jersey.shape.front.map((path, i) => (
                                <path key={`shape-${i}`} d={path} fill="#2a2a2a" stroke="#444" strokeWidth="2" />
                              ))}
                              {pathAssignments.jersey.trim.front.map((path, i) => (
                                <path key={`trim-${i}`} d={path} fill="#D2F802" stroke="#fff" strokeWidth="1" opacity="0.9" />
                              ))}
                            </svg>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-2">
                            {pathAssignments.jersey.shape.front.length} shape, {pathAssignments.jersey.trim.front.length} trim
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-400 mb-2">Back</div>
                          <div className="aspect-[3/4] bg-gradient-to-br from-black to-neutral-900 rounded-lg flex items-center justify-center p-4 border border-neutral-800">
                            <svg viewBox="0 0 400 500" className="w-full h-full">
                              {pathAssignments.jersey.shape.back.map((path, i) => (
                                <path key={`shape-${i}`} d={path} fill="#2a2a2a" stroke="#444" strokeWidth="2" />
                              ))}
                              {pathAssignments.jersey.trim.back.map((path, i) => (
                                <path key={`trim-${i}`} d={path} fill="#D2F802" stroke="#fff" strokeWidth="1" opacity="0.9" />
                              ))}
                            </svg>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-2">
                            {pathAssignments.jersey.shape.back.length} shape, {pathAssignments.jersey.trim.back.length} trim
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedGarments.has('shorts') && pathAssignments.shorts && (
                    <div className="space-y-4">
                      <h5 className="text-green-500 font-bold flex items-center gap-2">
                        <Scissors size={16} /> Shorts
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-neutral-400 mb-2">Front</div>
                          <div className="aspect-[3/4] bg-gradient-to-br from-black to-neutral-900 rounded-lg flex items-center justify-center p-4 border border-neutral-800">
                            <svg viewBox="0 0 400 500" className="w-full h-full">
                              {pathAssignments.shorts.shape.front.map((path, i) => (
                                <path key={`shape-${i}`} d={path} fill="#2a2a2a" stroke="#444" strokeWidth="2" />
                              ))}
                              {pathAssignments.shorts.trim.front.map((path, i) => (
                                <path key={`trim-${i}`} d={path} fill="#22c55e" stroke="#fff" strokeWidth="1" opacity="0.9" />
                              ))}
                            </svg>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-2">
                            {pathAssignments.shorts.shape.front.length} shape, {pathAssignments.shorts.trim.front.length} trim
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-400 mb-2">Back</div>
                          <div className="aspect-[3/4] bg-gradient-to-br from-black to-neutral-900 rounded-lg flex items-center justify-center p-4 border border-neutral-800">
                            <svg viewBox="0 0 400 500" className="w-full h-full">
                              {pathAssignments.shorts.shape.back.map((path, i) => (
                                <path key={`shape-${i}`} d={path} fill="#2a2a2a" stroke="#444" strokeWidth="2" />
                              ))}
                              {pathAssignments.shorts.trim.back.map((path, i) => (
                                <path key={`trim-${i}`} d={path} fill="#22c55e" stroke="#fff" strokeWidth="1" opacity="0.9" />
                              ))}
                            </svg>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-2">
                            {pathAssignments.shorts.shape.back.length} shape, {pathAssignments.shorts.trim.back.length} trim
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {mode === 'template' && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-bold uppercase">Template Layers</h4>
                  <button
                    onClick={addLayer}
                    className="px-4 py-2 bg-brand-accent text-black font-bold uppercase text-xs rounded hover:bg-brand-accent/90"
                  >
                    Add Layer
                  </button>
                </div>
                {layers.length === 0 ? (
                  <p className="text-neutral-500 text-sm text-center py-8">No layers added yet. Click "Add Layer" to create one.</p>
                ) : (
                  layers.map((layer, index) => (
                    <div key={layer.id} className="bg-black/50 p-4 rounded mb-4">
                      <div className="flex items-center gap-4 mb-2">
                        <input
                          type="text"
                          value={layer.label}
                          onChange={(e) => updateLayerLabel(index, e.target.value)}
                          className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white text-sm focus:border-brand-accent outline-none"
                          placeholder="Layer name"
                        />
                        <button
                          onClick={() => removeLayer(index)}
                          className="text-red-500 hover:text-red-400 p-2"
                          title="Remove layer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="text-xs text-neutral-400 flex gap-4">
                        <span>Jersey: {layer.paths.jersey.front.length + layer.paths.jersey.back.length} paths</span>
                        <span>Shorts: {layer.paths.shorts.front.length + layer.paths.shorts.back.length} paths</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={mode === 'cut' ? handleSaveCut : handleSaveTemplate}
                disabled={saving}
                className="px-8 py-3 bg-brand-accent text-black font-bold uppercase rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEditMode ? 'Update' : 'Create'} {mode === 'cut' ? 'Cut' : 'Template'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
