import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  Upload,
  Shirt,
  Scissors,
  ChevronDown,
  ChevronRight,
  Loader2,
  Package,
  DollarSign,
  Clock,
  FileUp,
  AlertCircle,
  Info,
  Search,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTemplateLibrary } from '../../contexts/TemplateLibraryContext';
import {
  createSport,
  createCut,
  updateSport,
  updateCut,
  deleteSport,
  deleteCut,
  updateGarmentPath,
  updateProductDetails,
  getSports,
  getCutsBySport,
  getGarmentPaths,
  Sport,
  Cut,
  GarmentPath
} from '../../lib/templateService';

interface ExtendedCut extends Cut {
  base_price?: number;
  description?: string;
  features?: string[];
  min_quantity?: number;
  production_time?: string;
  garment_paths?: GarmentPath[];
}

export const ProductManager: React.FC = () => {
  const { refreshLibrary } = useTemplateLibrary();
  const [sports, setSports] = useState<Sport[]>([]);
  const [expandedSport, setExpandedSport] = useState<string | null>(null);
  const [cuts, setCuts] = useState<Record<string, ExtendedCut[]>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showNewSportModal, setShowNewSportModal] = useState(false);
  const [showNewCutModal, setShowNewCutModal] = useState<string | null>(null);
  const [showEditProductModal, setShowEditProductModal] = useState<ExtendedCut | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<{
    cutId: string;
    garmentType: 'jersey' | 'shorts';
    pathType: 'shape' | 'trim';
    side: 'front' | 'back';
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'sport' | 'cut'; id: string; label: string } | null>(null);

  const [newSportName, setNewSportName] = useState('');
  const [newCutName, setNewCutName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    setLoading(true);
    try {
      const sportsData = await getSports();
      setSports(sportsData);
      if (sportsData.length > 0 && !expandedSport) {
        setExpandedSport(sportsData[0].id);
        await loadCuts(sportsData[0].id);
      }
    } catch (error) {
      console.error('Failed to load sports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCuts = async (sportId: string) => {
    try {
      const cutsData = await getCutsBySport(sportId);
      const cutsWithPaths = await Promise.all(
        cutsData.map(async (cut) => {
          const paths = await getGarmentPaths(cut.id);
          return { ...cut, garment_paths: paths };
        })
      );
      setCuts(prev => ({ ...prev, [sportId]: cutsWithPaths }));
    } catch (error) {
      console.error('Failed to load cuts:', error);
    }
  };

  const handleExpandSport = async (sportId: string) => {
    if (expandedSport === sportId) {
      setExpandedSport(null);
    } else {
      setExpandedSport(sportId);
      if (!cuts[sportId]) {
        await loadCuts(sportId);
      }
    }
  };

  const handleCreateSport = async () => {
    if (!newSportName.trim()) return;

    setActionLoading('create-sport');
    try {
      const slug = newSportName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await createSport({
        slug,
        label: newSportName.trim(),
        display_order: sports.length
      });
      await loadSports();
      await refreshLibrary();
      setNewSportName('');
      setShowNewSportModal(false);
    } catch (error) {
      console.error('Failed to create sport:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateCut = async () => {
    if (!newCutName.trim() || !showNewCutModal) return;

    setActionLoading('create-cut');
    try {
      const slug = newCutName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await createCut(showNewCutModal, {
        slug,
        label: newCutName.trim(),
        display_order: (cuts[showNewCutModal]?.length || 0)
      });
      await loadCuts(showNewCutModal);
      await refreshLibrary();
      setNewCutName('');
      setShowNewCutModal(null);
    } catch (error) {
      console.error('Failed to create cut:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;

    setActionLoading(`delete-${showDeleteConfirm.id}`);
    try {
      if (showDeleteConfirm.type === 'sport') {
        await deleteSport(showDeleteConfirm.id);
        await loadSports();
      } else {
        await deleteCut(showDeleteConfirm.id);
        if (expandedSport) {
          await loadCuts(expandedSport);
        }
      }
      await refreshLibrary();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateProductDetails = async (cutId: string, data: Partial<ExtendedCut>) => {
    setActionLoading(`update-${cutId}`);
    try {
      await updateProductDetails(cutId, {
        label: data.label,
        base_price: data.base_price,
        description: data.description,
        features: data.features,
        min_quantity: data.min_quantity,
        production_time: data.production_time,
        is_active: data.is_active
      });
      if (expandedSport) {
        await loadCuts(expandedSport);
      }
      await refreshLibrary();
      setShowEditProductModal(null);
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !showUploadModal) return;

    const file = files[0];
    if (!file.name.endsWith('.svg')) return;

    setActionLoading('upload');
    try {
      const content = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'image/svg+xml');
      const paths = doc.querySelectorAll('path');

      if (paths.length === 0) {
        alert('No paths found in SVG');
        return;
      }

      const pathData = Array.from(paths)
        .map(p => p.getAttribute('d'))
        .filter(Boolean)
        .join(' ');

      await updateGarmentPath(
        showUploadModal.cutId,
        showUploadModal.garmentType,
        showUploadModal.pathType,
        showUploadModal.side,
        pathData
      );

      if (expandedSport) {
        await loadCuts(expandedSport);
      }
      await refreshLibrary();
      setShowUploadModal(null);
    } catch (error) {
      console.error('Failed to upload SVG:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const filteredSports = sports.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPathCount = (cut: ExtendedCut, garmentType: 'jersey' | 'shorts') => {
    if (!cut.garment_paths) return 0;
    return cut.garment_paths.filter(p => p.garment_type === garmentType).length;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-accent mb-3" />
          <p className="text-neutral-400 text-sm">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <div className="border-b border-neutral-800 bg-black">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold uppercase text-white">Product Manager</h1>
              <p className="text-neutral-400 mt-1">Create and manage sports categories and product cuts</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { loadSports(); refreshLibrary(); }}
                className="p-2 text-neutral-400 hover:text-white transition-colors"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={() => setShowNewSportModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-colors"
              >
                <Plus size={18} />
                Add Sport Category
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input
              type="text"
              placeholder="Search sports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:border-brand-accent outline-none transition-colors"
            />
          </div>
        </div>

        <div className="px-6 py-3 bg-neutral-900/50 border-t border-neutral-800 flex items-center gap-6 text-sm">
          <span className="text-neutral-400">
            <span className="text-white font-bold">{sports.length}</span> sport categories
          </span>
          <span className="text-neutral-400">
            <span className="text-white font-bold">{Object.values(cuts).flat().length}</span> product cuts
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredSports.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-neutral-700" />
              <h3 className="text-xl font-bold text-neutral-600 mb-2">No sports found</h3>
              <p className="text-neutral-500 mb-4">Create your first sport category to get started</p>
              <button
                onClick={() => setShowNewSportModal(true)}
                className="px-4 py-2 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-colors"
              >
                Add Sport Category
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSports.map(sport => (
              <div key={sport.id} className="bg-black border border-neutral-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => handleExpandSport(sport.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-neutral-900/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {expandedSport === sport.id ? (
                      <ChevronDown className="text-brand-accent" size={20} />
                    ) : (
                      <ChevronRight className="text-neutral-500" size={20} />
                    )}
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white uppercase">{sport.label}</h3>
                      <p className="text-sm text-neutral-500">
                        {cuts[sport.id]?.length || 0} product cuts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowNewCutModal(sport.id); }}
                      className="p-2 text-neutral-400 hover:text-brand-accent hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm({ type: 'sport', id: sport.id, label: sport.label }); }}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </button>

                {expandedSport === sport.id && (
                  <div className="border-t border-neutral-800">
                    {!cuts[sport.id] || cuts[sport.id].length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-neutral-500 mb-3">No product cuts yet</p>
                        <button
                          onClick={() => setShowNewCutModal(sport.id)}
                          className="text-brand-accent hover:underline text-sm font-bold uppercase"
                        >
                          Add First Cut
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {cuts[sport.id].map(cut => (
                          <ProductCutCard
                            key={cut.id}
                            cut={cut}
                            onEdit={() => setShowEditProductModal(cut)}
                            onDelete={() => setShowDeleteConfirm({ type: 'cut', id: cut.id, label: cut.label })}
                            onUpload={(garmentType, pathType, side) => setShowUploadModal({ cutId: cut.id, garmentType, pathType, side })}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewSportModal && (
        <Modal
          title="Add Sport Category"
          onClose={() => { setShowNewSportModal(false); setNewSportName(''); }}
        >
          <input
            type="text"
            placeholder="Sport name (e.g., Baseball)"
            value={newSportName}
            onChange={(e) => setNewSportName(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-brand-accent outline-none mb-4"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={() => { setShowNewSportModal(false); setNewSportName(''); }}
              className="flex-1 px-4 py-2.5 bg-neutral-800 text-white font-bold uppercase text-sm rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSport}
              disabled={!newSportName.trim() || actionLoading === 'create-sport'}
              className="flex-1 px-4 py-2.5 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {actionLoading === 'create-sport' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Create
            </button>
          </div>
        </Modal>
      )}

      {showNewCutModal && (
        <Modal
          title="Add Product Cut"
          onClose={() => { setShowNewCutModal(null); setNewCutName(''); }}
        >
          <input
            type="text"
            placeholder="Cut name (e.g., Men's, Women's, Youth)"
            value={newCutName}
            onChange={(e) => setNewCutName(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-brand-accent outline-none mb-4"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={() => { setShowNewCutModal(null); setNewCutName(''); }}
              className="flex-1 px-4 py-2.5 bg-neutral-800 text-white font-bold uppercase text-sm rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCut}
              disabled={!newCutName.trim() || actionLoading === 'create-cut'}
              className="flex-1 px-4 py-2.5 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {actionLoading === 'create-cut' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Create
            </button>
          </div>
        </Modal>
      )}

      {showEditProductModal && (
        <EditProductModal
          cut={showEditProductModal}
          onSave={(data) => handleUpdateProductDetails(showEditProductModal.id, data)}
          onClose={() => setShowEditProductModal(null)}
          loading={actionLoading === `update-${showEditProductModal.id}`}
        />
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold uppercase">Upload SVG</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  {showUploadModal.garmentType} {showUploadModal.pathType} - {showUploadModal.side} view
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(null)}
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
                disabled={actionLoading === 'upload'}
                className="px-6 py-2 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'upload' ? 'Uploading...' : 'Browse Files'}
              </button>
            </div>

            <div className="mt-4 p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-brand-accent mt-0.5 flex-shrink-0" />
                <div className="text-xs text-neutral-400">
                  <p className="font-semibold text-neutral-300 mb-1">SVG Requirements</p>
                  <ul className="space-y-1 list-disc list-inside text-neutral-500">
                    <li>Viewbox: <span className="text-neutral-300 font-mono">0 0 400 500</span> (400x500)</li>
                    <li>Use only <span className="text-neutral-300 font-mono">&lt;path&gt;</span> elements</li>
                    <li>Paths should be filled, not stroked</li>
                  </ul>
                </div>
              </div>
            </div>
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
              <h3 className="text-lg font-bold">Delete {showDeleteConfirm.type === 'sport' ? 'Sport' : 'Product'}?</h3>
            </div>

            <p className="text-neutral-400 text-sm mb-6">
              This will permanently delete <span className="text-white font-bold">{showDeleteConfirm.label}</span>
              {showDeleteConfirm.type === 'sport' && ' and all its product cuts'}. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-neutral-800 text-white font-bold uppercase text-sm rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading === `delete-${showDeleteConfirm.id}`}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold uppercase text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === `delete-${showDeleteConfirm.id}` ? <Loader2 size={16} className="animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold uppercase">{title}</h3>
        <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const ProductCutCard: React.FC<{
  cut: ExtendedCut;
  onEdit: () => void;
  onDelete: () => void;
  onUpload: (garmentType: 'jersey' | 'shorts', pathType: 'shape' | 'trim', side: 'front' | 'back') => void;
}> = ({ cut, onEdit, onDelete, onUpload }) => {
  const jerseyShapeFront = cut.garment_paths?.find(p => p.garment_type === 'jersey' && p.path_type === 'shape' && p.side === 'front');
  const shortsShapeFront = cut.garment_paths?.find(p => p.garment_type === 'shorts' && p.path_type === 'shape' && p.side === 'front');

  const hasJersey = !!jerseyShapeFront?.svg_path;
  const hasShorts = !!shortsShapeFront?.svg_path;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors">
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-white uppercase">{cut.label}</h4>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-neutral-800 rounded transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <DollarSign size={12} />
            ${cut.base_price?.toFixed(2) || '49.99'}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {cut.production_time || '2-3 weeks'}
          </span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Shirt size={12} className="text-brand-accent" />
            <span className="text-[10px] font-bold uppercase text-neutral-400">Jersey</span>
          </div>
          <div className="aspect-[4/5] bg-neutral-800 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
            {hasJersey ? (
              <svg viewBox="0 0 400 500" className="w-full h-full p-2">
                <path d={jerseyShapeFront.svg_path} fill="#404040" />
              </svg>
            ) : (
              <div className="text-neutral-600 text-center p-2">
                <Upload size={20} className="mx-auto mb-1" />
                <span className="text-[10px]">No shape</span>
              </div>
            )}
          </div>
          <button
            onClick={() => onUpload('jersey', 'shape', 'front')}
            className="w-full text-[10px] py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
          >
            Upload Shape
          </button>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Scissors size={12} className="text-green-500" />
            <span className="text-[10px] font-bold uppercase text-neutral-400">Shorts</span>
          </div>
          <div className="aspect-[4/5] bg-neutral-800 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
            {hasShorts ? (
              <svg viewBox="0 0 400 500" className="w-full h-full p-2">
                <path d={shortsShapeFront.svg_path} fill="#404040" />
              </svg>
            ) : (
              <div className="text-neutral-600 text-center p-2">
                <Upload size={20} className="mx-auto mb-1" />
                <span className="text-[10px]">No shape</span>
              </div>
            )}
          </div>
          <button
            onClick={() => onUpload('shorts', 'shape', 'front')}
            className="w-full text-[10px] py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
          >
            Upload Shape
          </button>
        </div>
      </div>
    </div>
  );
};

const EditProductModal: React.FC<{
  cut: ExtendedCut;
  onSave: (data: Partial<ExtendedCut>) => void;
  onClose: () => void;
  loading: boolean;
}> = ({ cut, onSave, onClose, loading }) => {
  const [label, setLabel] = useState(cut.label);
  const [price, setPrice] = useState(cut.base_price?.toString() || '49.99');
  const [description, setDescription] = useState(cut.description || '');
  const [productionTime, setProductionTime] = useState(cut.production_time || '2-3 weeks');
  const [minQuantity, setMinQuantity] = useState(cut.min_quantity?.toString() || '1');
  const [isActive, setIsActive] = useState(cut.is_active !== false);

  const handleSave = () => {
    onSave({
      label,
      base_price: parseFloat(price) || 49.99,
      description,
      production_time: productionTime,
      min_quantity: parseInt(minQuantity) || 1,
      is_active: isActive
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold uppercase">Edit Product</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-neutral-400 mb-2 block">Product Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-brand-accent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400 mb-2 block">Base Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-brand-accent outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400 mb-2 block">Min Quantity</label>
              <input
                type="number"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-brand-accent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-neutral-400 mb-2 block">Production Time</label>
            <input
              type="text"
              value={productionTime}
              onChange={(e) => setProductionTime(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-brand-accent outline-none"
              placeholder="e.g., 2-3 weeks"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-neutral-400 mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-brand-accent outline-none resize-none"
              placeholder="Product description..."
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
            <div className="flex items-center gap-2">
              {isActive ? <Eye size={16} className="text-green-500" /> : <EyeOff size={16} className="text-neutral-500" />}
              <span className="text-sm text-white">Product Active</span>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-neutral-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-neutral-800 text-white font-bold uppercase text-sm rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
