import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Plus,
  ChevronLeft,
  Package,
  Loader2,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  X,
  Check,
  Upload,
  FileUp,
  RotateCcw,
  Layers,
  Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTemplateLibrary } from '../../contexts/TemplateLibraryContext';
import { ProductDesignCanvas } from './ProductDesignCanvas';

interface Product {
  id: string;
  sport_id: string;
  name: string;
  slug: string;
  product_type: string;
  gender: string;
  description: string;
  base_price: number;
  min_quantity: number;
  production_time: string;
  features: string[];
  is_active: boolean;
  display_order: number;
  sport?: { id: string; label: string; slug: string };
  shapes?: ProductShape[];
}

interface ProductShape {
  id: string;
  product_id: string;
  side: 'front' | 'back';
  shape_path: string;
  trim_path: string;
}

interface Sport {
  id: string;
  slug: string;
  label: string;
}

const PRODUCT_TYPES = [
  { value: 'jersey', label: 'Jersey' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'pants', label: 'Pants' },
  { value: 'hoodie', label: 'Hoodie' },
  { value: 'jacket', label: 'Jacket' },
  { value: 'tank', label: 'Tank Top' },
  { value: 'polo', label: 'Polo' },
  { value: 'warmup', label: 'Warm-up' },
];

const GENDERS = [
  { value: 'mens', label: "Men's" },
  { value: 'womens', label: "Women's" },
  { value: 'youth', label: 'Youth' },
  { value: 'unisex', label: 'Unisex' },
];

type ViewMode = 'products' | 'templates';

export const TemplateManager: React.FC = () => {
  const { library: SPORTS_LIBRARY, loading: libraryLoading } = useTemplateLibrary();

  const [products, setProducts] = useState<Product[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSport, setFilterSport] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, sportsRes] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            sport:sports(id, slug, label),
            shapes:product_shapes(*)
          `)
          .order('display_order'),
        supabase
          .from('sports')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (sportsRes.data) setSports(sportsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await supabase.from('products').delete().eq('id', product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleToggleActive = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p)
      );
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  };

  const filteredProducts = products.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterSport !== 'all' && p.sport_id !== filterSport) return false;
    if (filterType !== 'all' && p.product_type !== filterType) return false;
    return true;
  });

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    } else {
      setProducts(prev => [...prev, product]);
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewMode('templates');
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setViewMode('products');
  };

  if (loading || libraryLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-accent mb-3" />
          <p className="text-neutral-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'templates' && selectedProduct && SPORTS_LIBRARY) {
    const sportData = SPORTS_LIBRARY[selectedProduct.sport?.slug || ''];
    if (sportData) {
      const cutSlug = Object.keys(sportData.cuts)[0];
      return (
        <ProductDesignCanvas
          sport={{
            id: selectedProduct.sport?.slug || '',
            label: selectedProduct.sport?.label || '',
            cuts: sportData.cuts,
            templates: sportData.templates
          }}
          garmentType={selectedProduct.product_type === 'shorts' ? 'shorts' : 'jersey'}
          initialCutSlug={cutSlug}
          onBack={handleBackToProducts}
        />
      );
    }
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <div className="shrink-0 border-b border-neutral-800 bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Products & Templates</h1>
              <p className="text-neutral-500 text-sm mt-1">
                {products.length} product{products.length !== 1 ? 's' : ''} configured
              </p>
            </div>
            <button
              onClick={() => setShowProductModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-accent text-black font-bold text-sm rounded-lg hover:bg-brand-accent/90 transition-colors"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:border-brand-accent outline-none transition-colors text-sm"
              />
            </div>
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
              className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:border-brand-accent outline-none cursor-pointer"
            >
              <option value="all">All Sports</option>
              {sports.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:border-brand-accent outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              {PRODUCT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-neutral-900 flex items-center justify-center">
                <Package className="w-10 h-10 text-neutral-700" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No products yet</h3>
              <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
                {products.length === 0
                  ? 'Create your first product to start building your catalog. Each product can have multiple design templates.'
                  : 'No products match your filters. Try adjusting your search criteria.'}
              </p>
              {products.length === 0 && (
                <button
                  onClick={() => setShowProductModal(true)}
                  className="px-6 py-3 bg-brand-accent text-black font-bold text-sm rounded-lg hover:bg-brand-accent/90 transition-colors"
                >
                  Create First Product
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={() => handleSelectProduct(product)}
                  onEdit={(e) => { e.stopPropagation(); setEditingProduct(product); setShowProductModal(true); }}
                  onDelete={(e) => { e.stopPropagation(); setDeleteConfirm(product); }}
                  onToggleActive={(e) => handleToggleActive(product, e)}
                />
              ))}
              <button
                onClick={() => setShowProductModal(true)}
                className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-800 rounded-xl hover:border-brand-accent/50 transition-colors min-h-[200px]"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-3 group-hover:bg-brand-accent/20 transition-colors">
                  <Plus size={24} className="text-neutral-600 group-hover:text-brand-accent transition-colors" />
                </div>
                <span className="text-neutral-600 font-medium group-hover:text-neutral-400 transition-colors">Add Product</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {(showProductModal || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          sports={sports}
          onSave={handleSaveProduct}
          onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Delete Product?</h3>
            <p className="text-neutral-400 text-sm mb-6">
              This will permanently delete <span className="text-white font-medium">{deleteConfirm.name}</span> and all its templates. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-neutral-800 text-white font-medium text-sm rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductCard: React.FC<{
  product: Product;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onToggleActive: (e: React.MouseEvent) => void;
}> = ({ product, onSelect, onEdit, onDelete, onToggleActive }) => {
  const frontShape = product.shapes?.find(s => s.side === 'front');
  const hasShape = !!frontShape?.shape_path;

  return (
    <button
      onClick={onSelect}
      className={`group text-left bg-neutral-900 border rounded-xl overflow-hidden transition-all hover:border-brand-accent/50 hover:shadow-lg hover:shadow-brand-accent/5 ${
        product.is_active ? 'border-neutral-800' : 'border-neutral-800/50 opacity-60'
      }`}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center relative overflow-hidden">
        {hasShape ? (
          <svg viewBox="0 0 400 500" className="w-full h-full p-6 group-hover:scale-105 transition-transform duration-300">
            <path d={frontShape.shape_path} fill="#2a2a2a" />
            {frontShape.trim_path && (
              <path d={frontShape.trim_path} fill="none" stroke="#D2F802" strokeWidth="3" />
            )}
          </svg>
        ) : (
          <div className="text-center">
            <Package size={40} className="mx-auto text-neutral-700 mb-2" />
            <span className="text-xs text-neutral-600">No shape uploaded</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold uppercase rounded">
            {product.sport?.label || 'Unknown'}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggleActive}
            className={`p-1.5 rounded-lg backdrop-blur-sm transition-colors ${
              product.is_active
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-neutral-800/80 text-neutral-500 hover:bg-neutral-700'
            }`}
            title={product.is_active ? 'Deactivate' : 'Activate'}
          >
            {product.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 bg-neutral-800/80 backdrop-blur-sm text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-neutral-800/80 backdrop-blur-sm text-neutral-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {!product.is_active && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 bg-neutral-800/80 backdrop-blur-sm text-neutral-500 text-[10px] font-bold uppercase rounded">
              Inactive
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white mb-1 group-hover:text-brand-accent transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="capitalize">{product.product_type}</span>
          <span className="w-1 h-1 bg-neutral-700 rounded-full" />
          <span>{GENDERS.find(g => g.value === product.gender)?.label}</span>
          <span className="w-1 h-1 bg-neutral-700 rounded-full" />
          <span>${product.base_price}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-neutral-600">
          <Layers size={12} />
          <span>Click to manage templates</span>
        </div>
      </div>
    </button>
  );
};

const ProductFormModal: React.FC<{
  product: Product | null;
  sports: Sport[];
  onSave: (product: Product) => void;
  onClose: () => void;
}> = ({ product, sports, onSave, onClose }) => {
  const isEditing = !!product;
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'shapes'>('details');

  const [sportId, setSportId] = useState(product?.sport_id || (sports[0]?.id || ''));
  const [name, setName] = useState(product?.name || '');
  const [productType, setProductType] = useState(product?.product_type || 'jersey');
  const [gender, setGender] = useState(product?.gender || 'mens');
  const [description, setDescription] = useState(product?.description || '');
  const [basePrice, setBasePrice] = useState(product?.base_price?.toString() || '49.99');
  const [minQuantity, setMinQuantity] = useState(product?.min_quantity?.toString() || '1');
  const [productionTime, setProductionTime] = useState(product?.production_time || '2-3 weeks');

  const [frontShapePath, setFrontShapePath] = useState(product?.shapes?.find(s => s.side === 'front')?.shape_path || '');
  const [frontTrimPath, setFrontTrimPath] = useState(product?.shapes?.find(s => s.side === 'front')?.trim_path || '');
  const [backShapePath, setBackShapePath] = useState(product?.shapes?.find(s => s.side === 'back')?.shape_path || '');
  const [backTrimPath, setBackTrimPath] = useState(product?.shapes?.find(s => s.side === 'back')?.trim_path || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{ side: 'front' | 'back'; type: 'shape' | 'trim' } | null>(null);

  const generateSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    if (!name.trim() || !sportId) return;

    setSaving(true);
    try {
      const slug = generateSlug(name);
      const productData = {
        sport_id: sportId,
        name: name.trim(),
        slug,
        product_type: productType,
        gender,
        description: description.trim(),
        base_price: parseFloat(basePrice) || 49.99,
        min_quantity: parseInt(minQuantity) || 1,
        production_time: productionTime,
      };

      let savedProduct: Product;

      if (isEditing && product) {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .select(`*, sport:sports(id, slug, label)`)
          .single();

        if (error) throw error;
        savedProduct = data;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select(`*, sport:sports(id, slug, label)`)
          .single();

        if (error) throw error;
        savedProduct = data;
      }

      if (frontShapePath || backShapePath) {
        const shapesToUpsert = [];

        if (frontShapePath) {
          shapesToUpsert.push({
            product_id: savedProduct.id,
            side: 'front',
            shape_path: frontShapePath,
            trim_path: frontTrimPath
          });
        }

        if (backShapePath) {
          shapesToUpsert.push({
            product_id: savedProduct.id,
            side: 'back',
            shape_path: backShapePath,
            trim_path: backTrimPath
          });
        }

        for (const shape of shapesToUpsert) {
          await supabase
            .from('product_shapes')
            .upsert(shape, { onConflict: 'product_id,side' });
        }

        const { data: shapes } = await supabase
          .from('product_shapes')
          .select('*')
          .eq('product_id', savedProduct.id);

        savedProduct.shapes = shapes || [];
      }

      onSave(savedProduct);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !uploadTarget) return;

    const file = files[0];
    if (!file.name.endsWith('.svg')) return;

    try {
      const content = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'image/svg+xml');
      const paths = doc.querySelectorAll('path');

      if (paths.length === 0) return;

      const pathData = Array.from(paths)
        .map(p => p.getAttribute('d'))
        .filter(Boolean)
        .join(' ');

      if (uploadTarget.side === 'front') {
        if (uploadTarget.type === 'shape') setFrontShapePath(pathData);
        else setFrontTrimPath(pathData);
      } else {
        if (uploadTarget.type === 'shape') setBackShapePath(pathData);
        else setBackTrimPath(pathData);
      }
    } catch (error) {
      console.error('Failed to parse SVG:', error);
    }

    setUploadTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerUpload = (side: 'front' | 'back', type: 'shape' | 'trim') => {
    setUploadTarget({ side, type });
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Product' : 'New Product'}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-white border-b-2 border-brand-accent'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('shapes')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'shapes'
                ? 'text-white border-b-2 border-brand-accent'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            Shapes
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'details' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Sport *</label>
                  <select
                    value={sportId}
                    onChange={(e) => setSportId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-brand-accent outline-none"
                  >
                    {sports.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Product Type *</label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-brand-accent outline-none"
                  >
                    {PRODUCT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Gender / Fit *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-brand-accent outline-none"
                  >
                    {GENDERS.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Pro Jersey"
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:border-brand-accent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Product description..."
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:border-brand-accent outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-brand-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Min Quantity</label>
                  <input
                    type="number"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:border-brand-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Production Time</label>
                  <input
                    type="text"
                    value={productionTime}
                    onChange={(e) => setProductionTime(e.target.value)}
                    placeholder="2-3 weeks"
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:border-brand-accent outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-6">
                <ShapeUploader
                  label="Front View"
                  shapePath={frontShapePath}
                  trimPath={frontTrimPath}
                  onUploadShape={() => triggerUpload('front', 'shape')}
                  onUploadTrim={() => triggerUpload('front', 'trim')}
                  onClearShape={() => setFrontShapePath('')}
                  onClearTrim={() => setFrontTrimPath('')}
                />
                <ShapeUploader
                  label="Back View"
                  shapePath={backShapePath}
                  trimPath={backTrimPath}
                  onUploadShape={() => triggerUpload('back', 'shape')}
                  onUploadTrim={() => triggerUpload('back', 'trim')}
                  onClearShape={() => setBackShapePath('')}
                  onClearTrim={() => setBackTrimPath('')}
                />
              </div>

              <div className="p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                <p className="text-xs text-neutral-400">
                  <span className="font-medium text-neutral-300">SVG Requirements:</span>{' '}
                  Upload SVG files with path elements. Recommended viewBox: 0 0 400 500
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-800 text-white font-medium text-sm rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !sportId}
            className="px-5 py-2.5 bg-brand-accent text-black font-bold text-sm rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isEditing ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ShapeUploader: React.FC<{
  label: string;
  shapePath: string;
  trimPath: string;
  onUploadShape: () => void;
  onUploadTrim: () => void;
  onClearShape: () => void;
  onClearTrim: () => void;
}> = ({ label, shapePath, trimPath, onUploadShape, onUploadTrim, onClearShape, onClearTrim }) => {
  return (
    <div>
      <div className="text-sm font-medium text-white mb-3">{label}</div>
      <div className="aspect-[4/5] bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
        {shapePath ? (
          <svg viewBox="0 0 400 500" className="w-full h-full p-4">
            <path d={shapePath} fill="#505050" />
            {trimPath && (
              <path d={trimPath} fill="none" stroke="#D2F802" strokeWidth="3" />
            )}
          </svg>
        ) : (
          <div className="text-center text-neutral-600">
            <Upload size={32} className="mx-auto mb-2" />
            <p className="text-xs">No shape uploaded</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onUploadShape}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors"
        >
          <FileUp size={14} />
          {shapePath ? 'Replace Shape' : 'Upload Shape'}
        </button>
        {shapePath && (
          <button
            onClick={onClearShape}
            className="p-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-500 hover:text-red-500 hover:border-red-500/30 transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
      {shapePath && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={onUploadTrim}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800/50 border border-dashed border-neutral-700 rounded-lg text-xs text-neutral-500 hover:text-neutral-300 hover:border-neutral-600 transition-colors"
          >
            <FileUp size={12} />
            {trimPath ? 'Replace Trim' : 'Add Trim (Optional)'}
          </button>
          {trimPath && (
            <button
              onClick={onClearTrim}
              className="p-2 bg-neutral-800/50 border border-dashed border-neutral-700 rounded-lg text-neutral-600 hover:text-red-500 hover:border-red-500/30 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
