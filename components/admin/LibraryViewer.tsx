
import React from 'react';
import { useTemplateLibrary } from '../../contexts/TemplateLibraryContext';
import { Shirt, Layout, PenLine, RefreshCw } from 'lucide-react';

interface LibraryViewerProps {
    onEdit: (frontSvg: string, backSvg: string) => void;
}

export const LibraryViewer: React.FC<LibraryViewerProps> = ({ onEdit }) => {
    const { library: SPORTS_LIBRARY, loading, error, refresh } = useTemplateLibrary();

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

    // Helpers to reconstruct SVG strings for editing
    const createSvgString = (paths: string[]) => {
        return `<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
        ${paths.map(p => `<path d="${p}" />`).join('')}
      </svg>`;
    };

    const editCut = (cut: any) => {
        const front = createSvgString([cut.jersey.shape.front, cut.jersey.trim.front]);
        const back = createSvgString([cut.jersey.shape.back, cut.jersey.trim.back]);
        onEdit(front, back);
    };

    const editTemplate = (sportId: string, cutId: string, template: any) => {
        // For templates, we need the base cut to make sense of it
        const sport = SPORTS_LIBRARY[sportId];
        const baseCut = sport.cuts[cutId] || Object.values(sport.cuts)[0];

        // Combine Base Cut paths + Template Layer paths
        const frontPaths = [baseCut.jersey.shape.front, baseCut.jersey.trim.front, ...template.layers.map((l: any) => l.paths.jersey.front)];
        const backPaths = [baseCut.jersey.shape.back, baseCut.jersey.trim.back, ...template.layers.map((l: any) => l.paths.jersey.back)];

        const front = createSvgString(frontPaths);
        const back = createSvgString(backPaths);
        onEdit(front, back);
    };

    return (
        <div className="pb-12">
            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => refresh()}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-black font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-brand-accent/90 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Library
                </button>
            </div>
            <div className="grid grid-cols-1 gap-8">
            {sports.map(sport => (
                <div key={sport.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
                        <h3 className="font-display text-3xl text-white uppercase italic">{sport.label}</h3>
                        <span className="text-xs font-mono text-neutral-500 bg-neutral-950 px-2 py-1 rounded">ID: {sport.id}</span>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* COL 1: CUTS (Smaller now) */}
                        <div className="xl:col-span-1">
                            <h4 className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Shirt size={14} /> Available Cuts
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(sport.cuts).map(([key, cut]) => (
                                    <div key={key} className="bg-black/50 p-3 rounded border border-neutral-800 flex flex-col gap-2 group">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white font-bold uppercase text-[10px]">{key}</span>
                                            <button
                                                onClick={() => editCut(cut)}
                                                className="text-neutral-500 hover:text-brand-accent transition-colors"
                                                title="Edit in Builder"
                                            >
                                                <PenLine size={12} />
                                            </button>
                                        </div>
                                        <div className="aspect-[3/4] bg-neutral-900 rounded flex items-center justify-center p-2 relative overflow-hidden">
                                            <svg viewBox="0 0 400 500" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
                                                <path d={cut.jersey.shape.front} fill="#333" />
                                                <path d={cut.jersey.trim.front} fill="#555" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* COL 2 & 3: TEMPLATES */}
                        <div className="xl:col-span-2">
                            <h4 className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Layout size={14} /> Design Templates
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {sport.templates.map(template => (
                                    <div key={template.id} className="bg-black/50 p-4 rounded border border-neutral-800 flex items-center justify-between group hover:border-neutral-700 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-neutral-900 rounded border border-neutral-800 flex items-center justify-center">
                                                <span className="font-display text-lg text-neutral-600">{template.label.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm uppercase">{template.label}</div>
                                                <div className="text-[10px] text-neutral-500 font-mono mt-1">
                                                    {template.layers.length} Layers • {template.layers.map(l => l.id).join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => editTemplate(sport.id, Object.keys(sport.cuts)[0], template)}
                                            className="opacity-0 group-hover:opacity-100 p-2 bg-neutral-800 text-white rounded hover:bg-brand-accent hover:text-black transition-all"
                                            title="Edit in Builder"
                                        >
                                            <PenLine size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
};
