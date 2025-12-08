import React, { useState, useMemo } from 'react';
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
  MoreVertical
} from 'lucide-react';
import { useTemplateLibrary } from '../../contexts/TemplateLibraryContext';
import { Template, Sport } from '../../types';
import { createTemplate } from '../../lib/templateService';

type ViewMode = 'gallery' | 'list';
type EditorMode = 'view' | 'edit' | null;
type ViewSide = 'front' | 'back';

interface TemplateWithSport extends Template {
  sport: Sport;
  sportId: string;
}

export const TemplateManager: React.FC = () => {
  const { library: SPORTS_LIBRARY, loading, refresh } = useTemplateLibrary();
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
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

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sport.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSport !== 'all') {
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
  }, [allTemplates, searchQuery, selectedSport, sortBy]);

  const openEditor = (template: TemplateWithSport, mode: 'view' | 'edit') => {
    setActiveTemplate(template);
    setEditorMode(mode);
    setSelectedCut(Object.keys(template.sport.cuts)[0] || '');
  };

  const closeEditor = () => {
    setEditorMode(null);
    setActiveTemplate(null);
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

  return (
    <div className="h-full bg-neutral-950 flex flex-col">
      {/* HEADER */}
      <div className="border-b border-neutral-800 bg-black">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold uppercase text-white">Design Templates</h1>
              <p className="text-neutral-400 mt-1">Manage your jersey design library</p>
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
                onClick={() => setViewMode('gallery')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'gallery'
                    ? 'bg-brand-accent text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-brand-accent text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <List size={18} />
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
        ) : viewMode === 'gallery' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={`${template.sportId}-${template.id}`}
                template={template}
                onView={() => openEditor(template, 'view')}
                onEdit={() => openEditor(template, 'edit')}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTemplates.map(template => (
              <TemplateListItem
                key={`${template.sportId}-${template.id}`}
                template={template}
                onView={() => openEditor(template, 'view')}
                onEdit={() => openEditor(template, 'edit')}
              />
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
};

const TemplateCard: React.FC<{
  template: TemplateWithSport;
  onView: () => void;
  onEdit: () => void;
}> = ({ template, onView, onEdit }) => {
  const [showActions, setShowActions] = useState(false);
  const defaultCut = Object.keys(template.sport.cuts)[0];
  const cut = template.sport.cuts[defaultCut];

  return (
    <div
      className="group bg-black border border-neutral-800 rounded-xl overflow-hidden hover:border-brand-accent transition-all hover:shadow-lg hover:shadow-brand-accent/20"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Preview */}
      <div className="aspect-square bg-gradient-to-br from-neutral-900 to-black p-8 relative">
        <svg viewBox="0 0 400 500" className="w-full h-full">
          {/* Base Shape */}
          {cut?.jersey.shape.front && (
            <path
              d={cut.jersey.shape.front}
              fill="#0a0a0a"
              stroke="#222"
              strokeWidth="1"
              opacity="0.4"
            />
          )}

          {/* Template Layers */}
          {template.layers.map((layer, i) => {
            const colors = ['#D2F802', '#60a5fa', '#f97316', '#22c55e', '#db2777', '#a78bfa'];
            return layer.paths.jersey.front.map((path, j) => (
              <path
                key={`${layer.id}-${j}`}
                d={path}
                fill={colors[i % colors.length]}
                stroke="#fff"
                strokeWidth="1"
                opacity="0.85"
              />
            ));
          })}
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
  onView: () => void;
  onEdit: () => void;
}> = ({ template, onView, onEdit }) => {
  return (
    <div className="bg-black border border-neutral-800 rounded-lg p-4 hover:border-brand-accent transition-colors flex items-center gap-4">
      {/* Mini Preview */}
      <div className="w-16 h-16 bg-neutral-900 rounded flex-shrink-0">
        <svg viewBox="0 0 400 500" className="w-full h-full p-2">
          {template.layers.length > 0 && template.layers[0].paths.jersey.front[0] && (
            <path
              d={template.layers[0].paths.jersey.front[0]}
              fill="#D2F802"
              opacity="0.8"
            />
          )}
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-bold text-white text-lg">{template.label}</h3>
        <p className="text-sm text-neutral-400">{template.sport.label} • {template.layers.length} layers</p>
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
        {/* Left Sidebar - Cut Selector */}
        <div className="w-64 bg-black border-r border-neutral-800 flex flex-col">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="font-bold uppercase text-sm text-neutral-400">Step 1: Select Cut</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {Object.entries(template.sport.cuts).map(([cutSlug, cutData]) => (
              <button
                key={cutSlug}
                onClick={() => setSelectedCut(cutSlug)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  selectedCut === cutSlug
                    ? 'border-brand-accent bg-brand-accent/10'
                    : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                <div className="font-bold text-white text-sm mb-2">{cutData.label}</div>
                <div className="aspect-square bg-black rounded overflow-hidden p-2">
                  <svg viewBox="0 0 400 500" className="w-full h-full">
                    <path
                      d={cutData.jersey.shape.front}
                      fill="#1a1a1a"
                      stroke="#333"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center - Canvas Preview */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-neutral-950 to-black">
          <div className="p-4 border-b border-neutral-800/50">
            <h3 className="font-bold uppercase text-sm text-neutral-400 text-center">
              Customer Preview - Step 2: Template Design
            </h3>
          </div>

          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="relative" style={{ width: '600px', maxWidth: '100%' }}>
              {/* Jersey and Shorts Side by Side */}
              <div className="grid grid-cols-2 gap-8">
                {/* JERSEY */}
                <div>
                  <div className="text-center text-xs font-bold text-neutral-500 uppercase mb-2">Jersey</div>
                  <svg viewBox="0 0 400 500" className="w-full drop-shadow-2xl">
                    {/* Jersey Base Shape */}
                    {cut?.jersey.shape[viewSide] && (
                      <path
                        d={cut.jersey.shape[viewSide]}
                        fill={previewColors.secondary}
                        stroke="#000"
                        strokeWidth="2"
                      />
                    )}

                    {/* Jersey Template Layers */}
                    {template.layers.map((layer, i) => {
                      return layer.paths.jersey[viewSide].map((path, j) => (
                        <path
                          key={`jersey-${layer.id}-${j}`}
                          d={path}
                          fill={i === 0 ? previewColors.primary : i === 1 ? previewColors.accent : previewColors.primary}
                          stroke="none"
                        />
                      ));
                    })}

                    {/* Jersey Trim */}
                    {cut?.jersey.trim[viewSide] && (
                      <path
                        d={cut.jersey.trim[viewSide]}
                        fill="none"
                        stroke={previewColors.accent}
                        strokeWidth="3"
                      />
                    )}
                  </svg>
                </div>

                {/* SHORTS */}
                <div>
                  <div className="text-center text-xs font-bold text-neutral-500 uppercase mb-2">Shorts</div>
                  <svg viewBox="0 0 400 500" className="w-full drop-shadow-2xl">
                    {/* Shorts Base Shape */}
                    {cut?.shorts.shape[viewSide] && (
                      <path
                        d={cut.shorts.shape[viewSide]}
                        fill={previewColors.secondary}
                        stroke="#000"
                        strokeWidth="2"
                      />
                    )}

                    {/* Shorts Template Layers */}
                    {template.layers.map((layer, i) => {
                      return layer.paths.shorts[viewSide].map((path, j) => (
                        <path
                          key={`shorts-${layer.id}-${j}`}
                          d={path}
                          fill={i === 0 ? previewColors.primary : i === 1 ? previewColors.accent : previewColors.primary}
                          stroke="none"
                        />
                      ));
                    })}

                    {/* Shorts Trim */}
                    {cut?.shorts.trim[viewSide] && (
                      <path
                        d={cut.shorts.trim[viewSide]}
                        fill="none"
                        stroke={previewColors.accent}
                        strokeWidth="3"
                      />
                    )}
                  </svg>
                </div>
              </div>
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
                  Add Layer ({viewSide})
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-neutral-500 block mb-1">Jersey SVG</label>
                    <input
                      type="file"
                      accept=".svg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadLayer(file, 'jersey');
                      }}
                      disabled={uploading}
                      className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-accent file:text-black hover:file:bg-brand-accent/90 cursor-pointer disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 block mb-1">Shorts SVG</label>
                    <input
                      type="file"
                      accept=".svg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadLayer(file, 'shorts');
                      }}
                      disabled={uploading}
                      className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-green-500 file:text-black hover:file:bg-green-600 cursor-pointer disabled:opacity-50"
                    />
                  </div>
                  {uploading && (
                    <div className="text-xs text-brand-accent animate-pulse text-center py-2">
                      Uploading...
                    </div>
                  )}
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
                          Jersey: {layer.paths.jersey.front.length + layer.paths.jersey.back.length} paths •
                          Shorts: {layer.paths.shorts.front.length + layer.paths.shorts.back.length} paths
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
