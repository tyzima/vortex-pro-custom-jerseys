import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Package,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ProductFormModal, Product, Sport, PRODUCT_TYPES, GENDERS } from './ProductFormModal';

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSport, setFilterSport] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

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

  const handleToggleActive = async (product: Product) => {
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
    setShowCreateModal(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-accent mb-3" />
          <p className="text-neutral-400 text-sm">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      <div className="shrink-0 border-b border-neutral-800 bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Products</h1>
              <p className="text-neutral-500 text-sm mt-1">
                {products.length} product{products.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-900 flex items-center justify-center">
                <Package className="w-8 h-8 text-neutral-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-500 mb-2">No products found</h3>
              <p className="text-neutral-600 text-sm mb-4">
                {products.length === 0 ? 'Create your first product to get started' : 'Try adjusting your filters'}
              </p>
              {products.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-brand-accent text-black font-bold text-sm rounded-lg hover:bg-brand-accent/90 transition-colors"
                >
                  Add Product
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProducts.map(product => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={() => setEditingProduct(product)}
                  onDelete={() => setDeleteConfirm(product)}
                  onToggleActive={() => handleToggleActive(product)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {(showCreateModal || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          sports={sports}
          onSave={handleSaveProduct}
          onClose={() => { setShowCreateModal(false); setEditingProduct(null); }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Delete Product?</h3>
            <p className="text-neutral-400 text-sm mb-6">
              This will permanently delete <span className="text-white font-medium">{deleteConfirm.name}</span>. This action cannot be undone.
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

const ProductRow: React.FC<{
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}> = ({ product, onEdit, onDelete, onToggleActive }) => {
  const frontShape = product.shapes?.find(s => s.side === 'front');
  const hasShape = !!frontShape?.shape_path;

  return (
    <div className={`flex items-center gap-4 p-4 bg-neutral-900 border rounded-xl transition-colors ${
      product.is_active ? 'border-neutral-800' : 'border-neutral-800/50 opacity-60'
    }`}>
      <div className="w-16 h-20 bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
        {hasShape ? (
          <svg viewBox="0 0 400 500" className="w-full h-full p-1">
            <path d={frontShape.shape_path} fill="#404040" />
            {frontShape.trim_path && (
              <path d={frontShape.trim_path} fill="none" stroke="#D2F802" strokeWidth="3" />
            )}
          </svg>
        ) : (
          <Package size={24} className="text-neutral-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-white truncate">{product.name}</h3>
          {!product.is_active && (
            <span className="px-2 py-0.5 bg-neutral-800 text-neutral-500 text-xs rounded">Inactive</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span>{product.sport?.label || 'Unknown Sport'}</span>
          <span className="w-1 h-1 bg-neutral-700 rounded-full" />
          <span className="capitalize">{product.product_type}</span>
          <span className="w-1 h-1 bg-neutral-700 rounded-full" />
          <span>{GENDERS.find(g => g.value === product.gender)?.label || product.gender}</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-lg font-bold text-white">${product.base_price}</div>
        <div className="text-xs text-neutral-500">{product.production_time}</div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggleActive}
          className={`p-2 rounded-lg transition-colors ${
            product.is_active
              ? 'text-green-500 hover:bg-green-500/10'
              : 'text-neutral-500 hover:bg-neutral-800'
          }`}
          title={product.is_active ? 'Deactivate' : 'Activate'}
        >
          {product.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <Edit3 size={18} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
