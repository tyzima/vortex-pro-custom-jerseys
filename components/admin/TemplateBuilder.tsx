
import React, { useState, useEffect } from 'react';
import { Save, FileUp, ArrowLeft, ArrowRight, Plus, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTemplateLibrary } from '../../contexts/TemplateLibraryContext';

interface ParsedPath {
  d: string;
  index: number;
}

interface Sport {
  id: string;
  slug: string;
  label: string;
}

interface Cut {
  id: string;
  slug: string;
  label: string;
}

type BuilderMode = 'select' | 'cut' | 'template';
type Step = 'mode' | 'sport' | 'upload' | 'assign' | 'details' | 'review';

interface TemplateBuilderProps {
  initialData?: { front: string; back: string } | null;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ initialData }) => {
  const { user } = useAuth();
  const { refresh } = useTemplateLibrary();

  const [mode, setMode] = useState<BuilderMode>('select');
  const [step, setStep] = useState<Step>('mode');

  const [sports, setSports] = useState<Sport[]>([]);
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [selectedCut, setSelectedCut] = useState<Cut | null>(null);

  const [frontSvgInput, setFrontSvgInput] = useState('');
  const [backSvgInput, setBackSvgInput] = useState('');
  const [frontPaths, setFrontPaths] = useState<ParsedPath[]>([]);
  const [backPaths, setBackPaths] = useState<ParsedPath[]>([]);

  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [selectedPathIndex, setSelectedPathIndex] = useState<number | null>(null);

  const [pathAssignments, setPathAssignments] = useState<{
    front: { [index: number]: { type: string; label: string } };
    back: { [index: number]: { type: string; label: string } };
  }>({ front: {}, back: {} });

  const [itemSlug, setItemSlug] = useState('');
  const [itemLabel, setItemLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFrontSvgInput(initialData.front);
      setBackSvgInput(initialData.back);
    }
  }, [initialData]);

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    if (frontSvgInput) setFrontPaths(parseSvgPaths(frontSvgInput));
  }, [frontSvgInput]);

  useEffect(() => {
    if (backSvgInput) setBackPaths(parseSvgPaths(backSvgInput));
  }, [backSvgInput]);

  useEffect(() => {
    if (selectedSport) {
      fetchCuts(selectedSport.id);
    }
  }, [selectedSport]);

  const fetchSports = async () => {
    const { data, error } = await supabase
      .from('sports')
      .select('id, slug, label')
      .order('display_order');

    if (!error && data) {
      setSports(data);
    }
  };

  const fetchCuts = async (sportId: string) => {
    const { data, error } = await supabase
      .from('product_cuts')
      .select('id, slug, label')
      .eq('sport_id', sportId)
      .order('display_order');

    if (!error && data) {
      setCuts(data);
    }
  };

  const parseSvgPaths = (svgString: string): ParsedPath[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const paths = Array.from(doc.querySelectorAll('path'));
    return paths.map((p, i) => ({ d: p.getAttribute('d') || '', index: i })).filter(p => p.d);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (side === 'front') {
        setFrontSvgInput(result);
      } else {
        setBackSvgInput(result);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePathClick = (index: number) => {
    setSelectedPathIndex(index);
  };

  const assignPath = (type: string, label: string) => {
    if (selectedPathIndex === null) return;

    setPathAssignments(prev => ({
      ...prev,
      [activeSide]: {
        ...prev[activeSide],
        [selectedPathIndex]: { type, label }
      }
    }));

    setSelectedPathIndex(null);
  };

  const removePath = (side: 'front' | 'back', index: number) => {
    setPathAssignments(prev => {
      const newSide = { ...prev[side] };
      delete newSide[index];
      return { ...prev, [side]: newSide };
    });
  };

  const saveCut = async () => {
    if (!selectedSport || !itemSlug || !itemLabel) return;

    setSaving(true);
    setSaveError('');

    try {
      const { data: cutData, error: cutError } = await supabase
        .from('product_cuts')
        .insert({
          sport_id: selectedSport.id,
          slug: itemSlug,
          label: itemLabel,
          display_order: 0,
          is_active: true
        })
        .select()
        .single();

      if (cutError) throw cutError;

      const garmentPaths = [];

      for (const [index, assignment] of Object.entries(pathAssignments.front)) {
        const pathData = frontPaths[Number(index)];
        if (pathData && assignment.type) {
          garmentPaths.push({
            cut_id: cutData.id,
            garment_type: 'jersey',
            path_type: assignment.type,
            side: 'front',
            svg_path: pathData.d
          });
        }
      }

      for (const [index, assignment] of Object.entries(pathAssignments.back)) {
        const pathData = backPaths[Number(index)];
        if (pathData && assignment.type) {
          garmentPaths.push({
            cut_id: cutData.id,
            garment_type: 'jersey',
            path_type: assignment.type,
            side: 'back',
            svg_path: pathData.d
          });
        }
      }

      if (garmentPaths.length > 0) {
        const { error: pathsError } = await supabase
          .from('garment_paths')
          .insert(garmentPaths);

        if (pathsError) throw pathsError;
      }

      setSaveSuccess(true);
      await refresh();
      setTimeout(() => {
        resetBuilder();
      }, 2000);

    } catch (error: any) {
      setSaveError(error.message || 'Failed to save cut');
    } finally {
      setSaving(false);
    }
  };

  const saveTemplate = async () => {
    if (!selectedSport || !selectedCut || !itemSlug || !itemLabel) return;

    setSaving(true);
    setSaveError('');

    try {
      const { data: templateData, error: templateError } = await supabase
        .from('sport_templates')
        .insert({
          sport_id: selectedSport.id,
          slug: itemSlug,
          label: itemLabel,
          display_order: 0,
          is_published: true,
          created_by: user?.id
        })
        .select()
        .single();

      if (templateError) throw templateError;

      const layerTypes = new Set<string>();
      Object.values(pathAssignments.front).forEach(a => layerTypes.add(a.type));
      Object.values(pathAssignments.back).forEach(a => layerTypes.add(a.type));

      for (const layerType of layerTypes) {
        const layerLabel = pathAssignments.front[
          Object.keys(pathAssignments.front).find(k => pathAssignments.front[Number(k)].type === layerType) as any
        ]?.label || layerType;

        const { data: layerData, error: layerError } = await supabase
          .from('template_layers')
          .insert({
            template_id: templateData.id,
            layer_slug: layerType,
            label: layerLabel,
            display_order: 0
          })
          .select()
          .single();

        if (layerError) throw layerError;

        const layerPaths = [];

        for (const [index, assignment] of Object.entries(pathAssignments.front)) {
          if (assignment.type === layerType) {
            const pathData = frontPaths[Number(index)];
            if (pathData) {
              layerPaths.push({
                layer_id: layerData.id,
                garment_type: 'jersey',
                side: 'front',
                svg_path: pathData.d
              });
            }
          }
        }

        for (const [index, assignment] of Object.entries(pathAssignments.back)) {
          if (assignment.type === layerType) {
            const pathData = backPaths[Number(index)];
            if (pathData) {
              layerPaths.push({
                layer_id: layerData.id,
                garment_type: 'jersey',
                side: 'back',
                svg_path: pathData.d
              });
            }
          }
        }

        if (layerPaths.length > 0) {
          const { error: pathsError } = await supabase
            .from('layer_paths')
            .insert(layerPaths);

          if (pathsError) throw pathsError;
        }
      }

      setSaveSuccess(true);
      await refresh();
      setTimeout(() => {
        resetBuilder();
      }, 2000);

    } catch (error: any) {
      setSaveError(error.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const resetBuilder = () => {
    setMode('select');
    setStep('mode');
    setSelectedSport(null);
    setSelectedCut(null);
    setFrontSvgInput('');
    setBackSvgInput('');
    setFrontPaths([]);
    setBackPaths([]);
    setPathAssignments({ front: {}, back: {} });
    setItemSlug('');
    setItemLabel('');
    setSaveSuccess(false);
    setSaveError('');
  };

  const activePaths = activeSide === 'front' ? frontPaths : backPaths;
  const activeAssignments = pathAssignments[activeSide];

  if (saveSuccess) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-500" />
          </div>
          <h3 className="text-white text-xl font-bold uppercase mb-2">Saved Successfully!</h3>
          <p className="text-neutral-400">Your {mode === 'cut' ? 'cut' : 'template'} has been added to the library.</p>
        </div>
      </div>
    );
  }

  if (step === 'mode') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-white text-2xl font-bold uppercase mb-2">What would you like to create?</h2>
            <p className="text-neutral-400 text-sm">Choose between creating a new base cut or a design template</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => {
                setMode('cut');
                setStep('sport');
              }}
              className="bg-neutral-900 border-2 border-neutral-800 hover:border-brand-accent rounded-xl p-8 text-left transition-all group"
            >
              <div className="text-4xl mb-4">👕</div>
              <h3 className="text-white text-xl font-bold uppercase mb-2 group-hover:text-brand-accent transition-colors">New Cut</h3>
              <p className="text-neutral-400 text-sm">Create a base jersey shape with trim paths for a sport</p>
            </button>

            <button
              onClick={() => {
                setMode('template');
                setStep('sport');
              }}
              className="bg-neutral-900 border-2 border-neutral-800 hover:border-brand-accent rounded-xl p-8 text-left transition-all group"
            >
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-white text-xl font-bold uppercase mb-2 group-hover:text-brand-accent transition-colors">New Template</h3>
              <p className="text-neutral-400 text-sm">Create a design template with customizable layers for an existing cut</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'sport') {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <button
            onClick={() => setStep('mode')}
            className="text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-bold uppercase mb-2">Select Sport</h2>
              <p className="text-neutral-400 text-sm">Choose which sport this {mode} belongs to</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {sports.map(sport => (
                <button
                  key={sport.id}
                  onClick={() => {
                    setSelectedSport(sport);
                    if (mode === 'cut') {
                      setStep('upload');
                    } else {
                      setStep('details');
                    }
                  }}
                  className="bg-neutral-900 border-2 border-neutral-800 hover:border-brand-accent rounded-xl p-6 text-center transition-all"
                >
                  <h3 className="text-white font-bold uppercase">{sport.label}</h3>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'details' && mode === 'template') {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <button
            onClick={() => setStep('sport')}
            className="text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-bold uppercase mb-2">Select Base Cut</h2>
              <p className="text-neutral-400 text-sm">Choose which cut this template uses</p>
            </div>

            <div className="space-y-3">
              {cuts.map(cut => (
                <button
                  key={cut.id}
                  onClick={() => {
                    setSelectedCut(cut);
                    setStep('upload');
                  }}
                  className="w-full bg-neutral-900 border-2 border-neutral-800 hover:border-brand-accent rounded-xl p-4 text-left transition-all"
                >
                  <h3 className="text-white font-bold uppercase">{cut.label}</h3>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <button
            onClick={() => setStep(mode === 'cut' ? 'sport' : 'details')}
            className="text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-bold uppercase mb-2">Upload SVG Files</h2>
              <p className="text-neutral-400 text-sm">Upload or paste the front and back SVG paths</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-brand-accent font-bold uppercase text-xs">Front</h3>
                  <label className="cursor-pointer text-[10px] bg-neutral-800 hover:bg-brand-accent hover:text-black px-2 py-1 rounded flex items-center gap-1 text-neutral-300 transition-colors">
                    <FileUp size={10} />
                    Import
                    <input type="file" accept=".svg" className="hidden" onChange={(e) => handleFileUpload(e, 'front')} />
                  </label>
                </div>
                <textarea
                  value={frontSvgInput}
                  onChange={e => setFrontSvgInput(e.target.value)}
                  className="w-full h-48 bg-black border border-neutral-700 rounded p-2 text-[10px] font-mono text-neutral-400 focus:border-brand-accent outline-none"
                  placeholder="Paste SVG code..."
                />
                {frontPaths.length > 0 && (
                  <p className="text-xs text-green-500 mt-2">✓ {frontPaths.length} paths detected</p>
                )}
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-brand-accent font-bold uppercase text-xs">Back</h3>
                  <label className="cursor-pointer text-[10px] bg-neutral-800 hover:bg-brand-accent hover:text-black px-2 py-1 rounded flex items-center gap-1 text-neutral-300 transition-colors">
                    <FileUp size={10} />
                    Import
                    <input type="file" accept=".svg" className="hidden" onChange={(e) => handleFileUpload(e, 'back')} />
                  </label>
                </div>
                <textarea
                  value={backSvgInput}
                  onChange={e => setBackSvgInput(e.target.value)}
                  className="w-full h-48 bg-black border border-neutral-700 rounded p-2 text-[10px] font-mono text-neutral-400 focus:border-brand-accent outline-none"
                  placeholder="Paste SVG code..."
                />
                {backPaths.length > 0 && (
                  <p className="text-xs text-green-500 mt-2">✓ {backPaths.length} paths detected</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep('assign')}
                disabled={frontPaths.length === 0 || backPaths.length === 0}
                className="bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold uppercase text-sm px-6 py-3 rounded-lg hover:bg-white transition-colors flex items-center gap-2"
              >
                Next: Assign Paths <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'assign') {
    const pathTypes = mode === 'cut'
      ? [
          { value: 'shape', label: 'Jersey Shape' },
          { value: 'trim', label: 'Jersey Trim' }
        ]
      : [
          { value: 'primary', label: 'Primary Layer' },
          { value: 'secondary', label: 'Secondary Layer' },
          { value: 'accent', label: 'Accent Layer' },
          { value: 'stripe', label: 'Stripe Layer' },
          { value: 'panel', label: 'Side Panel' }
        ];

    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setStep('upload')}
            className="text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveSide('front')}
              className={`px-4 py-1 rounded-full text-xs font-bold uppercase transition-colors ${activeSide === 'front' ? 'bg-brand-accent text-black' : 'bg-neutral-800 text-neutral-400'}`}
            >
              Front
            </button>
            <button
              onClick={() => setActiveSide('back')}
              className={`px-4 py-1 rounded-full text-xs font-bold uppercase transition-colors ${activeSide === 'back' ? 'bg-brand-accent text-black' : 'bg-neutral-800 text-neutral-400'}`}
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
          <div className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col">
            <h3 className="text-brand-accent font-bold uppercase text-xs mb-4">Click paths to select, then assign a type</h3>

            <div className="flex-1 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] rounded-lg">
              <div className="w-full h-full max-w-md p-8">
                <svg viewBox="0 0 400 500" className="w-full h-full drop-shadow-2xl">
                  {activePaths.map((path) => {
                    const isSelected = selectedPathIndex === path.index;
                    const assignment = activeAssignments[path.index];

                    return (
                      <path
                        key={path.index}
                        d={path.d}
                        fill={isSelected ? '#D2F802' : (assignment ? '#ffffff' : '#333333')}
                        stroke={isSelected ? '#fff' : (assignment ? '#D2F802' : '#555')}
                        strokeWidth={isSelected ? 4 : 1}
                        className="cursor-pointer hover:opacity-80 transition-all"
                        onClick={() => handlePathClick(path.index)}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto">
            {selectedPathIndex !== null && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <h4 className="text-white font-bold text-xs uppercase mb-3">Assign Path {selectedPathIndex}</h4>
                <div className="space-y-2">
                  {pathTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => assignPath(type.value, type.label)}
                      className="w-full bg-neutral-800 hover:bg-brand-accent hover:text-black border border-neutral-700 rounded p-2 text-xs font-bold uppercase transition-colors text-left"
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <h4 className="text-white font-bold text-xs uppercase mb-3">Assigned Paths</h4>
              <div className="space-y-2">
                {Object.entries(activeAssignments).map(([index, assignment]) => (
                  <div key={index} className="flex justify-between items-center bg-black/50 p-2 rounded text-xs">
                    <span className="text-neutral-400">Path {index}: <span className="text-white">{assignment.label}</span></span>
                    <button
                      onClick={() => removePath(activeSide, Number(index))}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {Object.keys(activeAssignments).length === 0 && (
                  <p className="text-neutral-600 text-xs">No paths assigned yet</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setStep('review')}
              disabled={Object.keys(pathAssignments.front).length === 0 || Object.keys(pathAssignments.back).length === 0}
              className="w-full bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold uppercase text-sm px-4 py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              Review & Save <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <button
            onClick={() => setStep('assign')}
            className="text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-2xl w-full space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-bold uppercase mb-2">Final Details</h2>
              <p className="text-neutral-400 text-sm">Review and save your {mode}</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
              <div>
                <label className="text-xs text-neutral-500 uppercase font-bold block mb-2">Sport</label>
                <p className="text-white font-bold">{selectedSport?.label}</p>
              </div>

              {mode === 'template' && (
                <div>
                  <label className="text-xs text-neutral-500 uppercase font-bold block mb-2">Base Cut</label>
                  <p className="text-white font-bold">{selectedCut?.label}</p>
                </div>
              )}

              <div>
                <label className="text-xs text-neutral-500 uppercase font-bold block mb-2">Slug (URL-friendly ID)</label>
                <input
                  type="text"
                  value={itemSlug}
                  onChange={e => setItemSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="w-full bg-black border border-neutral-700 rounded p-2 text-white focus:border-brand-accent outline-none"
                  placeholder="e.g. mens-pro-fit"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-500 uppercase font-bold block mb-2">Display Label</label>
                <input
                  type="text"
                  value={itemLabel}
                  onChange={e => setItemLabel(e.target.value)}
                  className="w-full bg-black border border-neutral-700 rounded p-2 text-white focus:border-brand-accent outline-none"
                  placeholder="e.g. Men's Pro Fit"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-500 uppercase font-bold block mb-2">Summary</label>
                <div className="bg-black/50 p-3 rounded text-xs space-y-1">
                  <p className="text-neutral-400">Front paths: <span className="text-white">{Object.keys(pathAssignments.front).length}</span></p>
                  <p className="text-neutral-400">Back paths: <span className="text-white">{Object.keys(pathAssignments.back).length}</span></p>
                  {mode === 'template' && (
                    <p className="text-neutral-400">
                      Layers: <span className="text-white">
                        {new Set([
                          ...Object.values(pathAssignments.front).map(a => a.type),
                          ...Object.values(pathAssignments.back).map(a => a.type)
                        ]).size}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {saveError && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500 text-sm">
                {saveError}
              </div>
            )}

            <button
              onClick={mode === 'cut' ? saveCut : saveTemplate}
              disabled={saving || !itemSlug || !itemLabel}
              className="w-full bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold uppercase text-sm px-6 py-4 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={16} /> Save {mode === 'cut' ? 'Cut' : 'Template'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
