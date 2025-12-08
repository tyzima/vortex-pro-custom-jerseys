import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Grid3x3,
  List,
  Filter,
  ArrowUpDown,
  Eye,
  Edit,
  Copy,
  Trash2,
  X,
  Upload,
  Layers,
  ChevronLeft,
  Save,
  MoreVertical,
  Shirt,
  Scissors,
  Package,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { useTemplateLibrary } from '../../contexts/TemplateLibraryContext';
import { Template, SportDefinition, ProductCut } from '../../types';
import { createTemplate } from '../../lib/templateService';
import { ProductFormModal, Product, Sport as ProductSport } from './ProductFormModal';
import { supabase } from '../../lib/supabase';

type Sport = SportDefinition;
import { CanvasViewer } from './CanvasViewer';
import { ProductDesignCanvas } from './ProductDesignCanvas';

type ViewMode = 'gallery' | 'list';
type TemplateViewMode = 'grid' | 'canvas';
type EditorMode = 'view' | 'edit' | null;
type ViewSide = 'front' | 'back';
type PageView = 'products' | 'templates' | 'design-canvas';

interface TemplateWithSport extends Template {
  sport: Sport;
  sportId: string;
}

interface SelectedProduct {
  sportId: string;
  sportLabel: string;
  cutSlug: string;
  cutLabel: string;
  garmentType: 'jersey' | 'shorts';
  cut: ProductCut;
}

export const TemplateManager: React.FC = () => {
  const { library: SPORTS_LIBRARY, loading, refresh } = useTemplateLibrary();
  const [pageView, setPageView] = useState<PageView>('products');
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [templateViewMode, setTemplateViewMode] = useState<TemplateViewMode>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'sport' | 'recent'>('recent');
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [activeTemplate, setActiveTemplate] = useState<TemplateWithSport | null>(null);
  const [viewSide, setViewSide] = useState<ViewSide>('front');
  const [selectedCut, setSelectedCut] = useState<string>('');
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSport, setNewTemplateSport] = useState('');
  const [showCutSelectionModal, setShowCutSelectionModal] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<{ template: TemplateWithSport; mode: 'view' | 'edit' } | null>(null);

  const allTemplates: TemplateWithSport[] = useMemo(() => {
    if (!SPORTS_LIBRARY) return [];

    const templates: TemplateWithSport[] = [];
    Object.entries(SPORTS_LIBRARY).forEach(([sportId, sport]) => {
      sport.templates.forEach(template => {
        templates.push({
          ...template,
          sport,
          sportId
        });
      });
    });

    return templates;
  }, [SPORTS_LIBRARY]);

  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    if (selectedProduct) {
      filtered = filtered.filter(t => t.sportId === selectedProduct.sportId);
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sport.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSport !== 'all' && !selectedProduct) {
      filtered = filtered.filter(t => t.sportId === selectedSport);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.label.localeCompare(b.label);
        case 'sport':
          return a.sport.label.localeCompare(b.sport.label);
        case 'recent':
        default:
          return 0;
      }
    });

    return filtered;
  }, [allTemplates, searchQuery, selectedSport, sortBy, selectedProduct]);

  const openEditor = (template: TemplateWithSport, mode: 'view' | 'edit') => {
    setPendingTemplate({ template, mode });
    setShowCutSelectionModal(true);
  };

  const openEditorWithCut = (cut: string) => {
    if (!pendingTemplate) return;
    setActiveTemplate(pendingTemplate.template);
    setEditorMode(pendingTemplate.mode);
    setSelectedCut(cut);
    setShowCutSelectionModal(false);
    setPendingTemplate(null);
  };

  const closeEditor = () => {
    setEditorMode(null);
    setActiveTemplate(null);
  };

  const closeCutSelectionModal = () => {
    setShowCutSelectionModal(false);
    setPendingTemplate(null);
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName || !newTemplateSport) return;

    try {
      const slug = newTemplateName.toLowerCase().replace(/\s+/g, '-');
      await createTemplate(newTemplateSport, '', slug, newTemplateName);

      await refresh();

      setShowNewTemplateModal(false);
      setNewTemplateName('');
      setNewTemplateSport('');
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('Failed to create template. Please try again.');
    }
  };

  const handleSelectProduct = (sportId: string, sportLabel: string, cutSlug: string, cutLabel: string, garmentType: 'jersey' | 'shorts', cut: ProductCut) => {
    setSelectedProduct({ sportId, sportLabel, cutSlug, cutLabel, garmentType, cut });
    setPageView('design-canvas');
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setPageView('products');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="text-brand-accent text-xl font-bold animate-pulse">Loading Templates...</div>
        </div>
      </div>
    );
  }

  if (editorMode && activeTemplate) {
    return (
      <TemplateEditor
        template={activeTemplate}
        mode={editorMode}
        viewSide={viewSide}
        setViewSide={setViewSide}
        selectedCut={selectedCut}
        setSelectedCut={setSelectedCut}
        onClose={closeEditor}
      />
    );
  }

  if (pageView === 'products') {
    return (
      <ProductGalleryView
        SPORTS_LIBRARY={SPORTS_LIBRARY}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
        onSelectProduct={handleSelectProduct}
      />
    );
  }

  if (pageView === 'design-canvas' && selectedProduct && SPORTS_LIBRARY) {
    const sportData = SPORTS_LIBRARY[selectedProduct.sportId];
    if (sportData) {
      return (
        <ProductDesignCanvas
          sport={{
            id: selectedProduct.sportId,
            label: selectedProduct.sportLabel,
            cuts: sportData.cuts,
            templates: sportData.templates
          }}
          garmentType={selectedProduct.garmentType}
          initialCutSlug={selectedProduct.cutSlug}
          onBack={handleBackToProducts}
        />
      );
    }
  }

  return (
    <div className="h-full bg-neutral-950 flex flex-col">
      {templateViewMode === 'canvas' && selectedProduct && SPORTS_LIBRARY ? (
        <div className="flex flex-col h-full">
          {/* Minimal Header for Canvas Mode */}
          <div className="border-b border-neutral-800 bg-black px-6 py-3 flex items-center justify-between">
            <button
              onClick={handleBackToProducts}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              title="Back to Products"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTemplateViewMode('grid')}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-600 transition-all"
                title="Switch to Grid View"
              >
                <Grid3x3 size={16} />
                <span className="text-sm font-bold uppercase">Grid View</span>
              </button>
              <button
                onClick={() => setShowNewTemplateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-all"
              >
                <Plus size={16} />
                New Template
              </button>
            </div>
          </div>
          <CanvasViewer
            sportId={selectedProduct.sportId}
            sportLabel={selectedProduct.sportLabel}
            garmentType={selectedProduct.garmentType}
            templates={filteredTemplates}
            cuts={SPORTS_LIBRARY[selectedProduct.sportId].cuts}
            onEditTemplate={(template) => openEditor(template, 'edit')}
          />
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="border-b border-neutral-800 bg-black">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToProducts}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                    title="Back to Products"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-3xl font-bold uppercase text-white">Design Templates</h1>
                      {selectedProduct && (
                        <span className="px-3 py-1 bg-brand-accent/20 text-brand-accent text-sm font-bold uppercase rounded-full border border-brand-accent/30">
                          {selectedProduct.cutLabel} {selectedProduct.garmentType === 'jersey' ? 'Jersey' : 'Shorts'} • {selectedProduct.sportLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-400">Browse design templates for this product</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewTemplateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-all hover:scale-105"
                >
                  <Plus size={18} />
                  New Template
                </button>
              </div>

              {/* TOOLBAR */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* Search */}
                <div className="flex-1 min-w-[300px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:border-brand-accent outline-none transition-colors"
                  />
                </div>

                {/* Sport Filter */}
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:border-brand-accent outline-none cursor-pointer"
                >
                  <option value="all">All Sports</option>
                  {SPORTS_LIBRARY && Object.entries(SPORTS_LIBRARY).map(([id, sport]) => (
                    <option key={id} value={id}>{sport.label}</option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:border-brand-accent outline-none cursor-pointer"
                >
                  <option value="recent">Most Recent</option>
                  <option value="name">Name A-Z</option>
                  <option value="sport">Sport</option>
                </select>

                {/* View Mode */}
                <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
                  <button
                    onClick={() => setTemplateViewMode('canvas')}
                    className={`p-2 rounded transition-colors ${
                      templateViewMode === 'canvas'
                        ? 'bg-brand-accent text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Canvas View"
                  >
                    <Maximize2 size={18} />
                  </button>
                  <button
                    onClick={() => setTemplateViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      templateViewMode === 'grid'
                        ? 'bg-brand-accent text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Grid View"
                  >
                    <Grid3x3 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="px-6 py-3 bg-neutral-900/50 border-t border-neutral-800 flex items-center gap-6 text-sm">
              <span className="text-neutral-400">
                <span className="text-white font-bold">{filteredTemplates.length}</span> templates
              </span>
              {selectedSport !== 'all' && SPORTS_LIBRARY && (
                <span className="text-neutral-400">
                  in <span className="text-brand-accent font-bold">{SPORTS_LIBRARY[selectedSport]?.label}</span>
                </span>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-auto p-6">
            {filteredTemplates.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-20">🎨</div>
                  <h3 className="text-xl font-bold text-neutral-600 mb-2">No templates found</h3>
                  <p className="text-neutral-500">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map(template => (
                  <TemplateCard
                    key={`${template.sportId}-${template.id}`}
                    template={template}
                    selectedCutSlug={selectedProduct?.cutSlug}
                    onView={() => openEditor(template, 'view')}
                    onEdit={() => openEditor(template, 'edit')}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* NEW TEMPLATE MODAL */}
      {showNewTemplateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold uppercase">New Template</h3>
              <button
                onClick={() => setShowNewTemplateModal(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-400 uppercase mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g., Lightning Bolt, Flames, Stripes"
                  className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-brand-accent outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-400 uppercase mb-2">
                  Sport
                </label>
                <select
                  value={newTemplateSport}
                  onChange={(e) => setNewTemplateSport(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-lg text-white focus:border-brand-accent outline-none cursor-pointer"
                >
                  <option value="">Select a sport...</option>
                  {SPORTS_LIBRARY && Object.entries(SPORTS_LIBRARY).map(([id, sport]) => (
                    <option key={id} value={id}>{sport.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewTemplateModal(false)}
                className="flex-1 px-4 py-3 bg-neutral-800 text-white font-bold uppercase text-sm rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplateName || !newTemplateSport}
                className="flex-1 px-4 py-3 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUT SELECTION MODAL */}
      {showCutSelectionModal && pendingTemplate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold uppercase">Select Garment Type</h3>
                <p className="text-sm text-neutral-400 mt-1">Choose which garment to edit</p>
              </div>
              <button
                onClick={closeCutSelectionModal}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(pendingTemplate.template.sport.cuts).map(([cutSlug, cutData]) => (
                <button
                  key={cutSlug}
                  onClick={() => openEditorWithCut(cutSlug)}
                  className="group relative bg-black border-2 border-neutral-800 rounded-xl p-4 hover:border-brand-accent transition-all hover:scale-105"
                >
                  <div className="text-center mb-3">
                    <h4 className="font-bold text-white text-lg uppercase">{cutData.label}</h4>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300 rounded-lg overflow-hidden p-4">
                    <svg viewBox="0 0 400 500" className="w-full h-full drop-shadow-md">
                      <path
                        d={cutData.jersey.shape.front}
                        fill="#2a2a2a"
                        stroke="#1a1a1a"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TemplateCard: React.FC<{
  template: TemplateWithSport;
  selectedCutSlug?: string;
  onView: () => void;
  onEdit: () => void;
}> = ({ template, selectedCutSlug, onView, onEdit }) => {
  const [showActions, setShowActions] = useState(false);
  const cutSlug = selectedCutSlug || Object.keys(template.sport.cuts)[0];
  const cut = template.sport.cuts[cutSlug];

  return (
    <div
      className="group bg-black border border-neutral-800 rounded-xl overflow-hidden hover:border-brand-accent transition-all hover:shadow-lg hover:shadow-brand-accent/20"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Preview */}
      <div className="aspect-square bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300 p-8 relative">
        <svg viewBox="0 0 400 500" className="w-full h-full drop-shadow-lg">
          {/* Base Jersey Shape */}
          {cut?.jersey.shape.front && (
            <path
              d={cut.jersey.shape.front}
              fill="#1a1a1a"
              stroke="#0a0a0a"
              strokeWidth="2"
            />
          )}

          {/* Template Design Layers */}
          {template.layers.map((layer, i) => {
            const colors = ['#D2F802', '#60a5fa', '#f97316', '#22c55e', '#db2777', '#a78bfa'];
            return layer.paths.jersey.front.map((path, j) => (
              <path
                key={`${layer.id}-${j}`}
                d={path}
                fill={colors[i % colors.length]}
                stroke="none"
              />
            ));
          })}

          {/* Jersey Trim */}
          {cut?.jersey.trim.front && (
            <path
              d={cut.jersey.trim.front}
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
            />
          )}
        </svg>

        {/* Quick Actions Overlay */}
        {showActions && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3">
            <button
              onClick={onView}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md transition-all hover:scale-110"
              title="View"
            >
              <Eye size={20} className="text-white" />
            </button>
            <button
              onClick={onEdit}
              className="p-3 bg-brand-accent/90 hover:bg-brand-accent rounded-lg transition-all hover:scale-110"
              title="Edit"
            >
              <Edit size={20} className="text-black" />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg mb-1">{template.label}</h3>
            <p className="text-sm text-neutral-400">{template.sport.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-neutral-500 pt-3 border-t border-neutral-800">
          <div className="flex items-center gap-1">
            <Layers size={12} />
            <span>{template.layers.length} layers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TemplateListItem: React.FC<{
  template: TemplateWithSport;
  selectedCutSlug?: string;
  onView: () => void;
  onEdit: () => void;
}> = ({ template, selectedCutSlug, onView, onEdit }) => {
  const cutSlug = selectedCutSlug || Object.keys(template.sport.cuts)[0];
  const cut = template.sport.cuts[cutSlug];

  return (
    <div className="bg-black border border-neutral-800 rounded-lg p-4 hover:border-brand-accent transition-colors flex items-center gap-4">
      {/* Mini Preview */}
      <div className="w-20 h-20 bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300 rounded flex-shrink-0 p-2">
        <svg viewBox="0 0 400 500" className="w-full h-full">
          {/* Base Jersey Shape */}
          {cut?.jersey.shape.front && (
            <path
              d={cut.jersey.shape.front}
              fill="#1a1a1a"
              stroke="#0a0a0a"
              strokeWidth="2"
            />
          )}

          {/* First Design Layer */}
          {template.layers.length > 0 && template.layers[0].paths.jersey.front.map((path, i) => (
            <path
              key={i}
              d={path}
              fill="#D2F802"
              stroke="none"
            />
          ))}
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-bold text-white text-lg">{template.label}</h3>
        <p className="text-sm text-neutral-400 mt-1">{template.sport.label} • {template.layers.length} layers</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          className="p-2 hover:bg-neutral-800 rounded transition-colors"
          title="View"
        >
          <Eye size={18} className="text-neutral-400" />
        </button>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-brand-accent hover:text-black rounded transition-colors"
          title="Edit"
        >
          <Edit size={18} className="text-neutral-400" />
        </button>
      </div>
    </div>
  );
};

const TemplateEditor: React.FC<{
  template: TemplateWithSport;
  mode: 'view' | 'edit';
  viewSide: ViewSide;
  setViewSide: (side: ViewSide) => void;
  selectedCut: string;
  setSelectedCut: (cut: string) => void;
  onClose: () => void;
}> = ({ template, mode, viewSide, setViewSide, selectedCut, setSelectedCut, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState<'jersey' | 'shorts'>('jersey');
  const [previewColors, setPreviewColors] = useState({
    primary: '#D2F802',
    secondary: '#000000',
    accent: '#FFFFFF'
  });
  const { refresh } = useTemplateLibrary();
  const cut = template.sport.cuts[selectedCut];

  const handleUploadLayer = async (file: File, garmentType: 'jersey' | 'shorts') => {
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const svgContent = e.target?.result as string;
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
        const paths = svgDoc.querySelectorAll('path');

        if (paths.length === 0) {
          alert('No paths found in SVG file');
          setUploading(false);
          return;
        }

        alert(`SVG upload functionality coming soon! Found ${paths.length} paths in the file.`);
        await refresh();
      } catch (error) {
        console.error('Failed to process SVG:', error);
        alert('Failed to process SVG file. Please try again.');
      } finally {
        setUploading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="h-full bg-neutral-950 flex flex-col">
      {/* Editor Header */}
      <div className="bg-black border-b border-neutral-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold uppercase text-white">{template.label}</h2>
              <p className="text-sm text-neutral-400">{template.sport.label}</p>
            </div>
            <div className="flex items-center gap-2">
              {mode === 'view' && (
                <span className="px-3 py-1 bg-neutral-800 text-neutral-400 text-xs font-bold uppercase rounded-full">
                  View Only
                </span>
              )}
              {mode === 'edit' && (
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                  template.isPublished
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {template.isPublished ? 'Published' : 'Draft'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cut Type Switcher */}
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
              {Object.entries(template.sport.cuts).map(([cutSlug, cutData]) => (
                <button
                  key={cutSlug}
                  onClick={() => setSelectedCut(cutSlug)}
                  className={`px-4 py-2 rounded text-sm font-bold uppercase transition-colors ${
                    selectedCut === cutSlug
                      ? 'bg-brand-accent text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cutData.label}
                </button>
              ))}
            </div>

            {/* Garment Selector */}
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setSelectedGarment('jersey')}
                className={`px-4 py-2 rounded text-sm font-bold uppercase transition-colors ${
                  selectedGarment === 'jersey'
                    ? 'bg-brand-accent text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Jersey
              </button>
              <button
                onClick={() => setSelectedGarment('shorts')}
                className={`px-4 py-2 rounded text-sm font-bold uppercase transition-colors ${
                  selectedGarment === 'shorts'
                    ? 'bg-brand-accent text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Shorts
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setViewSide('front')}
                className={`px-4 py-2 rounded text-sm font-bold uppercase transition-colors ${
                  viewSide === 'front'
                    ? 'bg-brand-accent text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setViewSide('back')}
                className={`px-4 py-2 rounded text-sm font-bold uppercase transition-colors ${
                  viewSide === 'back'
                    ? 'bg-brand-accent text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Back
              </button>
            </div>

            {mode === 'edit' && (
              <button className="flex items-center gap-2 px-6 py-2 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-colors">
                <Save size={18} />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Current Cut Info */}
        <div className="w-64 bg-black border-r border-neutral-800 flex flex-col">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="font-bold uppercase text-sm text-neutral-400 mb-1">Editing</h3>
            <div className="text-white text-lg font-bold">{cut?.label} {selectedGarment === 'jersey' ? 'Jersey' : 'Shorts'}</div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-800">
              <div className="aspect-square bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300 rounded overflow-hidden p-4 mb-2">
                <svg viewBox="0 0 400 500" className="w-full h-full drop-shadow-md">
                  <path
                    d={selectedGarment === 'jersey' ? cut?.jersey.shape.front : cut?.shorts.shape.front}
                    fill="#2a2a2a"
                    stroke="#1a1a1a"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="text-xs text-neutral-400 text-center">
                Use the switcher above to change cut or garment
              </div>
            </div>
          </div>
        </div>

        {/* Center - Canvas Preview */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
          <div className="p-4 border-b border-neutral-700/50 bg-black/20">
            <h3 className="font-bold uppercase text-sm text-neutral-300 text-center">
              Template Design Preview
            </h3>
          </div>

          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="relative bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-300 rounded-2xl p-8 shadow-2xl" style={{ width: '500px', maxWidth: '100%' }}>
              <div className="text-center text-xs font-bold text-neutral-600 uppercase mb-3">
                {selectedGarment === 'jersey' ? 'Jersey' : 'Shorts'}
              </div>
              <svg viewBox="0 0 400 500" className="w-full drop-shadow-xl">
                {/* Base Shape */}
                {selectedGarment === 'jersey' ? (
                  cut?.jersey.shape[viewSide] && (
                    <path
                      d={cut.jersey.shape[viewSide]}
                      fill={previewColors.secondary}
                      stroke="#1a1a1a"
                      strokeWidth="2"
                    />
                  )
                ) : (
                  cut?.shorts.shape[viewSide] && (
                    <path
                      d={cut.shorts.shape[viewSide]}
                      fill={previewColors.secondary}
                      stroke="#1a1a1a"
                      strokeWidth="2"
                    />
                  )
                )}

                {/* Template Layers */}
                {template.layers.map((layer, i) => {
                  const paths = selectedGarment === 'jersey'
                    ? layer.paths.jersey[viewSide]
                    : layer.paths.shorts[viewSide];

                  return paths.map((path, j) => (
                    <path
                      key={`${selectedGarment}-${layer.id}-${j}`}
                      d={path}
                      fill={i === 0 ? previewColors.primary : i === 1 ? previewColors.accent : previewColors.primary}
                      stroke="none"
                    />
                  ));
                })}

                {/* Trim */}
                {selectedGarment === 'jersey' ? (
                  cut?.jersey.trim[viewSide] && (
                    <path
                      d={cut.jersey.trim[viewSide]}
                      fill="none"
                      stroke={previewColors.accent}
                      strokeWidth="3"
                    />
                  )
                ) : (
                  cut?.shorts.trim[viewSide] && (
                    <path
                      d={cut.shorts.trim[viewSide]}
                      fill="none"
                      stroke={previewColors.accent}
                      strokeWidth="3"
                    />
                  )
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Layer Management */}
        {mode === 'edit' && (
          <div className="w-80 bg-black border-l border-neutral-800 flex flex-col">
            <div className="p-4 border-b border-neutral-800">
              <h3 className="font-bold uppercase text-sm text-neutral-400">Template Builder</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Publish Status */}
              <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
                <h4 className="text-sm font-bold uppercase mb-3">Status</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white font-medium mb-1">
                      {template.isPublished ? 'Published' : 'Draft'}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {template.isPublished ? 'Visible to customers' : 'Hidden from customers'}
                    </div>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-colors ${
                      template.isPublished
                        ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                        : 'bg-green-500 text-black hover:bg-green-600'
                    }`}
                  >
                    {template.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>

              {/* Color Preview Controls */}
              <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
                <h4 className="text-sm font-bold uppercase mb-3">Preview Colors</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Primary</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={previewColors.primary}
                        onChange={(e) => setPreviewColors(prev => ({ ...prev, primary: e.target.value }))}
                        className="w-12 h-10 rounded border border-neutral-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewColors.primary}
                        onChange={(e) => setPreviewColors(prev => ({ ...prev, primary: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-black border border-neutral-700 rounded text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Secondary</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={previewColors.secondary}
                        onChange={(e) => setPreviewColors(prev => ({ ...prev, secondary: e.target.value }))}
                        className="w-12 h-10 rounded border border-neutral-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewColors.secondary}
                        onChange={(e) => setPreviewColors(prev => ({ ...prev, secondary: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-black border border-neutral-700 rounded text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Accent</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={previewColors.accent}
                        onChange={(e) => setPreviewColors(prev => ({ ...prev, accent: e.target.value }))}
                        className="w-12 h-10 rounded border border-neutral-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewColors.accent}
                        onChange={(e) => setPreviewColors(prev => ({ ...prev, accent: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-black border border-neutral-700 rounded text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Layer */}
              <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
                <h4 className="text-sm font-bold text-brand-accent uppercase mb-3 flex items-center gap-2">
                  <Upload size={14} />
                  Add Layer to {selectedGarment === 'jersey' ? 'Jersey' : 'Shorts'}
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-neutral-500 block mb-1">Upload SVG ({viewSide} side)</label>
                    <input
                      type="file"
                      accept=".svg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadLayer(file, selectedGarment);
                      }}
                      disabled={uploading}
                      className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-accent file:text-black hover:file:bg-brand-accent/90 cursor-pointer disabled:opacity-50"
                    />
                  </div>
                  {uploading && (
                    <div className="text-xs text-brand-accent animate-pulse text-center py-2">
                      Uploading...
                    </div>
                  )}
                  <p className="text-xs text-neutral-600">
                    Upload an SVG file with design paths for the {viewSide} side of the {selectedGarment}.
                  </p>
                </div>
              </div>

              {/* Layers List */}
              <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
                <h4 className="text-sm font-bold uppercase mb-3 flex items-center gap-2">
                  <Layers size={14} />
                  Design Layers ({template.layers.length})
                </h4>
                {template.layers.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-neutral-600 mb-2">No design layers yet</p>
                    <p className="text-xs text-neutral-700">Upload SVG files to add layers</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {template.layers.map((layer, i) => (
                      <div
                        key={layer.id}
                        className="bg-black rounded p-3 border border-neutral-800 hover:border-brand-accent transition-colors cursor-move"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-white text-sm">{layer.label}</div>
                          <button
                            className="p-1 hover:bg-neutral-700 rounded transition-colors"
                            title="Delete layer"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                        <div className="text-xs text-neutral-500">
                          {selectedGarment === 'jersey' ? (
                            <>Front: {layer.paths.jersey.front.length} paths • Back: {layer.paths.jersey.back.length} paths</>
                          ) : (
                            <>Front: {layer.paths.shorts.front.length} paths • Back: {layer.paths.shorts.back.length} paths</>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductGalleryView: React.FC<{
  SPORTS_LIBRARY: Record<string, Sport> | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSport: string;
  setSelectedSport: (sport: string) => void;
  onSelectProduct: (sportId: string, sportLabel: string, cutSlug: string, cutLabel: string, garmentType: 'jersey' | 'shorts', cut: ProductCut) => void;
}> = ({ SPORTS_LIBRARY, searchQuery, setSearchQuery, selectedSport, setSelectedSport, onSelectProduct }) => {
  const [garmentFilter, setGarmentFilter] = useState<'all' | 'jersey' | 'shorts'>('all');
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [dbSports, setDbSports] = useState<ProductSport[]>([]);

  useEffect(() => {
    const loadSports = async () => {
      const { data } = await supabase
        .from('sports')
        .select('id, slug, label')
        .eq('is_active', true)
        .order('display_order');
      if (data) setDbSports(data);
    };
    loadSports();
  }, []);

  const handleProductCreated = (product: Product) => {
    setShowCreateProductModal(false);
  };

  const allProducts = useMemo(() => {
    if (!SPORTS_LIBRARY) return [];

    const products: Array<{
      sportId: string;
      sportLabel: string;
      cutSlug: string;
      cutLabel: string;
      garmentType: 'jersey' | 'shorts';
      cut: ProductCut;
      templateCount: number;
      price: number;
      description: string;
    }> = [];

    Object.entries(SPORTS_LIBRARY).forEach(([sportId, sport]) => {
      Object.entries(sport.cuts).forEach(([cutSlug, cut]) => {
        const hasJersey = !!(cut.jersey.shape.front || cut.jersey.shape.back);
        const hasShorts = !!(cut.shorts.shape.front || cut.shorts.shape.back);

        if (hasJersey) {
          products.push({
            sportId,
            sportLabel: sport.label,
            cutSlug,
            cutLabel: cut.label,
            garmentType: 'jersey',
            cut,
            templateCount: sport.templates.length,
            price: 49.99,
            description: `Premium ${cut.label.toLowerCase()} jersey with moisture-wicking fabric and professional fit.`
          });
        }

        if (hasShorts) {
          products.push({
            sportId,
            sportLabel: sport.label,
            cutSlug,
            cutLabel: cut.label,
            garmentType: 'shorts',
            cut,
            templateCount: sport.templates.length,
            price: 34.99,
            description: `High-performance ${cut.label.toLowerCase()} shorts with breathable fabric and comfort fit.`
          });
        }
      });
    });

    return products;
  }, [SPORTS_LIBRARY]);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.sportLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cutLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.garmentType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSport !== 'all') {
      filtered = filtered.filter(p => p.sportId === selectedSport);
    }

    if (garmentFilter !== 'all') {
      filtered = filtered.filter(p => p.garmentType === garmentFilter);
    }

    return filtered;
  }, [allProducts, searchQuery, selectedSport, garmentFilter]);

  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProducts.length };
    allProducts.forEach(p => {
      counts[p.sportId] = (counts[p.sportId] || 0) + 1;
    });
    return counts;
  }, [allProducts]);

  return (
    <div className="h-full bg-neutral-950 flex flex-col">
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-black">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1 h-8 bg-brand-accent rounded-full" />
                  <h1 className="text-4xl font-black uppercase tracking-tight text-white">
                    Product Catalog
                  </h1>
                </div>
                <p className="text-neutral-400 ml-4">
                  Browse our collection and select a product to customize
                </p>
              </div>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setShowCreateProductModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-accent text-black font-bold text-sm rounded-lg hover:bg-brand-accent/90 transition-colors"
                >
                  <Plus size={18} />
                  Add Product
                </button>
                <div className="text-right">
                  <div className="text-3xl font-black text-brand-accent">{filteredProducts.length}</div>
                  <div className="text-xs text-neutral-500 uppercase tracking-widest">Products</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[320px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-black/50 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/30 outline-none transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-2 p-1 bg-black/50 border border-neutral-800 rounded-xl">
                <button
                  onClick={() => setGarmentFilter('all')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    garmentFilter === 'all'
                      ? 'bg-brand-accent text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setGarmentFilter('jersey')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
                    garmentFilter === 'jersey'
                      ? 'bg-brand-accent text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Shirt size={14} />
                  Jerseys
                </button>
                <button
                  onClick={() => setGarmentFilter('shorts')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
                    garmentFilter === 'shorts'
                      ? 'bg-brand-accent text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Scissors size={14} />
                  Shorts
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-3 bg-black/30 border-t border-neutral-800/50">
          <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedSport('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all ${
                selectedSport === 'all'
                  ? 'bg-white text-black'
                  : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              All Sports ({sportCounts.all})
            </button>
            {SPORTS_LIBRARY && Object.entries(SPORTS_LIBRARY).map(([id, sport]) => (
              <button
                key={id}
                onClick={() => setSelectedSport(id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all ${
                  selectedSport === id
                    ? 'bg-white text-black'
                    : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                {sport.label} ({sportCounts[id] || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-neutral-900 flex items-center justify-center">
                  <Package className="w-12 h-12 text-neutral-700" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-500 mb-2">No products found</h3>
                <p className="text-neutral-600 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedSport('all'); setGarmentFilter('all'); }}
                  className="px-6 py-2.5 bg-neutral-800 text-white font-bold uppercase text-sm rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={`${product.sportId}-${product.cutSlug}-${product.garmentType}`}
                  product={product}
                  onSelect={() => onSelectProduct(
                    product.sportId,
                    product.sportLabel,
                    product.cutSlug,
                    product.cutLabel,
                    product.garmentType,
                    product.cut
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateProductModal && dbSports.length > 0 && (
        <ProductFormModal
          product={null}
          sports={dbSports}
          onSave={handleProductCreated}
          onClose={() => setShowCreateProductModal(false)}
        />
      )}
    </div>
  );
};

const ProductCard: React.FC<{
  product: {
    sportId: string;
    sportLabel: string;
    cutSlug: string;
    cutLabel: string;
    garmentType: 'jersey' | 'shorts';
    cut: ProductCut;
    templateCount: number;
    price: number;
    description: string;
  };
  onSelect: () => void;
}> = ({ product, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isJersey = product.garmentType === 'jersey';
  const shape = isJersey ? product.cut.jersey.shape : product.cut.shorts.shape;
  const trim = isJersey ? product.cut.jersey.trim : product.cut.shorts.trim;

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-accent/10 text-left w-full hover:-translate-y-1"
    >
      <div className="aspect-square bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200 p-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
            isJersey
              ? 'bg-brand-accent/90 text-black'
              : 'bg-emerald-500/90 text-white'
          }`}>
            {isJersey ? 'Jersey' : 'Shorts'}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-black/80 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase text-white">
            {product.sportLabel}
          </span>
        </div>

        <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        <svg
          viewBox="0 0 400 500"
          className={`w-full h-full drop-shadow-2xl relative z-10 transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
        >
          <defs>
            <linearGradient id={`gradient-${product.sportId}-${product.cutSlug}-${product.garmentType}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#2d2d2d" />
            </linearGradient>
          </defs>
          <path
            d={shape.front}
            fill={`url(#gradient-${product.sportId}-${product.cutSlug}-${product.garmentType})`}
            stroke="#0a0a0a"
            strokeWidth="1"
          />
          {trim.front && (
            <path
              d={trim.front}
              fill="none"
              stroke={isJersey ? "#D2F802" : "#10b981"}
              strokeWidth="3"
              className={`transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-70'}`}
            />
          )}
        </svg>

        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="px-4 py-2 bg-brand-accent text-black font-bold uppercase text-xs rounded-full flex items-center gap-2 shadow-lg">
            Customize
            <ChevronLeft size={14} className="rotate-180" />
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-white text-lg uppercase leading-tight group-hover:text-brand-accent transition-colors">
              {product.cutLabel}
            </h3>
            <p className="text-xs text-neutral-500 uppercase tracking-wider mt-0.5">
              {isJersey ? 'Custom Jersey' : 'Custom Shorts'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-white">
              ${product.price.toFixed(0)}
            </div>
            <div className="text-[10px] text-neutral-600 uppercase">per unit</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <div className="flex items-center gap-1.5">
            <Layers size={12} className="text-neutral-600" />
            <span className="text-xs text-neutral-500">
              {product.templateCount} design{product.templateCount !== 1 ? 's' : ''} available
            </span>
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold uppercase transition-all ${isHovered ? 'text-brand-accent' : 'text-neutral-600'}`}>
            <span>View</span>
            <ChevronLeft size={12} className="rotate-180" />
          </div>
        </div>
      </div>
    </button>
  );
};
