
import React, { useState, useEffect } from 'react';
import { Copy, Check, Upload, RefreshCw, Code, Trash2, FileUp } from 'lucide-react';

interface ParsedPath {
  d: string;
  index: number;
}

interface ZoneMap {
  [pathIndex: number]: string; // Maps SVG path index to a Zone ID
}

interface TemplateBuilderProps {
  initialData?: { front: string; back: string } | null;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ initialData }) => {
  const [frontSvgInput, setFrontSvgInput] = useState('');
  const [backSvgInput, setBackSvgInput] = useState('');

  const [frontPaths, setFrontPaths] = useState<ParsedPath[]>([]);
  const [backPaths, setBackPaths] = useState<ParsedPath[]>([]);

  const [frontZoneMap, setFrontZoneMap] = useState<ZoneMap>({});
  const [backZoneMap, setBackZoneMap] = useState<ZoneMap>({});

  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [selectedPathIndex, setSelectedPathIndex] = useState<number | null>(null);
  const [activeZoneId, setActiveZoneId] = useState('');

  const [generatedCode, setGeneratedCode] = useState('');

  // Load initial data if provided (from Library "Edit" action)
  useEffect(() => {
    if (initialData) {
      setFrontSvgInput(initialData.front);
      setBackSvgInput(initialData.back);
      // Reset maps when loading new data
      setFrontZoneMap({});
      setBackZoneMap({});
      setGeneratedCode('');
    }
  }, [initialData]);

  // Helper to extract paths from SVG string
  const parseSvgPaths = (svgString: string): ParsedPath[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const paths = Array.from(doc.querySelectorAll('path'));
    return paths.map((p, i) => ({ d: p.getAttribute('d') || '', index: i })).filter(p => p.d);
  };

  useEffect(() => {
    if (frontSvgInput) setFrontPaths(parseSvgPaths(frontSvgInput));
  }, [frontSvgInput]);

  useEffect(() => {
    if (backSvgInput) setBackPaths(parseSvgPaths(backSvgInput));
  }, [backSvgInput]);

  const handlePathClick = (index: number) => {
    setSelectedPathIndex(index);
    // If this path already has a zone, pre-fill the input
    const currentMap = activeSide === 'front' ? frontZoneMap : backZoneMap;
    if (currentMap[index]) {
      setActiveZoneId(currentMap[index]);
    } else {
      setActiveZoneId('');
    }
  };

  const assignZone = () => {
    if (selectedPathIndex === null || !activeZoneId) return;

    if (activeSide === 'front') {
      setFrontZoneMap(prev => ({ ...prev, [selectedPathIndex]: activeZoneId }));
    } else {
      setBackZoneMap(prev => ({ ...prev, [selectedPathIndex]: activeZoneId }));
    }
    setSelectedPathIndex(null);
    setActiveZoneId('');
  };

  const clearAll = () => {
    setFrontSvgInput('');
    setBackSvgInput('');
    setFrontPaths([]);
    setBackPaths([]);
    setFrontZoneMap({});
    setBackZoneMap({});
    setGeneratedCode('');
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
    // Reset value so the same file can be selected again if needed
    e.target.value = '';
  };

  const generateTemplateCode = () => {
    // 1. Identify all unique Zone IDs used
    const allZones = new Set<string>([...Object.values(frontZoneMap) as string[], ...Object.values(backZoneMap) as string[]]);

    // 2. Build Layer Objects
    const layers = Array.from(allZones).map(zoneId => {
      // Find paths for this zone
      const frontPathIndex = Object.keys(frontZoneMap).find(k => frontZoneMap[Number(k)] === zoneId);
      const backPathIndex = Object.keys(backZoneMap).find(k => backZoneMap[Number(k)] === zoneId);

      const frontD = frontPathIndex ? frontPaths[Number(frontPathIndex)].d : '';
      const backD = backPathIndex ? backPaths[Number(backPathIndex)].d : '';

      return `
      {
        id: '${zoneId}',
        label: '${zoneId.charAt(0).toUpperCase() + zoneId.slice(1).replace('-', ' ')}',
        paths: {
          front: "${frontD}",
          back: "${backD}"
        }
      }`;
    });

    const code = `
    {
      id: 'new-template-id',
      label: 'New Template Name',
      layers: [${layers.join(',')}
      ]
    }
    `;
    setGeneratedCode(code);
  };

  const activePaths = activeSide === 'front' ? frontPaths : backPaths;
  const activeMap = activeSide === 'front' ? frontZoneMap : backZoneMap;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

      {/* LEFT: INPUTS & CONTROLS */}
      <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar pb-12">
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-accent font-bold uppercase tracking-widest text-xs">1. Upload SVG Data</h3>
            <button onClick={clearAll} className="text-neutral-500 hover:text-white p-1" title="Clear All">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-neutral-500 uppercase font-bold">Front SVG Code</label>
                <label className="cursor-pointer text-[10px] bg-neutral-800 hover:bg-brand-accent hover:text-black px-2 py-1 rounded flex items-center gap-1 text-neutral-300 transition-colors border border-neutral-700">
                  <FileUp size={10} />
                  <span>Import File</span>
                  <input type="file" accept=".svg" className="hidden" onChange={(e) => handleFileUpload(e, 'front')} />
                </label>
              </div>
              <textarea
                value={frontSvgInput}
                onChange={e => setFrontSvgInput(e.target.value)}
                className="w-full h-24 bg-black border border-neutral-700 rounded p-2 text-[10px] font-mono text-neutral-400 focus:border-brand-accent outline-none custom-scrollbar"
                placeholder="Paste <svg> or <path> data here..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-neutral-500 uppercase font-bold">Back SVG Code</label>
                <label className="cursor-pointer text-[10px] bg-neutral-800 hover:bg-brand-accent hover:text-black px-2 py-1 rounded flex items-center gap-1 text-neutral-300 transition-colors border border-neutral-700">
                  <FileUp size={10} />
                  <span>Import File</span>
                  <input type="file" accept=".svg" className="hidden" onChange={(e) => handleFileUpload(e, 'back')} />
                </label>
              </div>
              <textarea
                value={backSvgInput}
                onChange={e => setBackSvgInput(e.target.value)}
                className="w-full h-24 bg-black border border-neutral-700 rounded p-2 text-[10px] font-mono text-neutral-400 focus:border-brand-accent outline-none custom-scrollbar"
                placeholder="Paste <svg> or <path> data here..."
              />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
          <h3 className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-4">2. Assign Zones</h3>
          <p className="text-neutral-400 text-xs mb-4">Click a path in the preview to select it, then assign a Zone ID (e.g., 'stripe', 'side-panel').</p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={activeZoneId}
              onChange={e => setActiveZoneId(e.target.value)}
              className="flex-1 bg-black border border-neutral-700 rounded p-2 text-white text-sm focus:border-brand-accent outline-none"
              placeholder="e.g. side-stripe"
              disabled={selectedPathIndex === null}
            />
            <button
              onClick={assignZone}
              disabled={selectedPathIndex === null || !activeZoneId}
              className="bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold uppercase text-xs px-4 rounded hover:bg-white transition-colors"
            >
              Assign
            </button>
          </div>

          {selectedPathIndex !== null && (
            <div className="text-xs text-brand-accent">Selected Path Index: {selectedPathIndex}</div>
          )}
        </div>

        <button
          onClick={generateTemplateCode}
          className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 border border-neutral-700 transition-colors"
        >
          <Code size={16} /> Generate Code
        </button>
      </div>

      {/* CENTER: INTERACTIVE PREVIEW */}
      <div className="lg:col-span-2 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-black/50">
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
          <div className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Interactive Preview</div>
        </div>

        <div className="flex-1 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] relative">
          <div className="w-full h-full max-w-md p-8">
            {activePaths.length > 0 ? (
              <svg viewBox="0 0 400 500" className="w-full h-full drop-shadow-2xl">
                {activePaths.map((path) => {
                  const isSelected = selectedPathIndex === path.index;
                  const assignedZone = activeMap[path.index];

                  return (
                    <path
                      key={path.index}
                      d={path.d}
                      fill={isSelected ? '#D2F802' : (assignedZone ? '#ffffff' : '#333333')}
                      stroke={isSelected ? '#fff' : (assignedZone ? '#D2F802' : '#555')}
                      strokeWidth={isSelected ? 4 : 1}
                      className="cursor-pointer hover:opacity-80 transition-all"
                      onClick={() => handlePathClick(path.index)}
                    />
                  );
                })}
              </svg>
            ) : (
              <div className="text-neutral-600 flex flex-col items-center">
                <Upload size={48} className="mb-4 opacity-20" />
                <p className="uppercase font-bold tracking-widest text-sm">No SVG Data Loaded</p>
                <label className="mt-4 cursor-pointer px-4 py-2 bg-neutral-800 hover:bg-brand-accent hover:text-black rounded text-xs font-bold uppercase transition-colors">
                  Upload File
                  <input type="file" accept=".svg" className="hidden" onChange={(e) => handleFileUpload(e, activeSide)} />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* GENERATED CODE OUTPUT */}
        {generatedCode && (
          <div className="h-64 bg-black border-t border-neutral-800 p-4 overflow-auto relative group">
            <button
              onClick={() => navigator.clipboard.writeText(generatedCode)}
              className="absolute top-4 right-4 p-2 bg-neutral-800 text-white rounded hover:bg-brand-accent hover:text-black transition-colors"
              title="Copy to Clipboard"
            >
              <Copy size={16} />
            </button>
            <pre className="text-[10px] font-mono text-neutral-400 whitespace-pre-wrap">
              {generatedCode}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
};
