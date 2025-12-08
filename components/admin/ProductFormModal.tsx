import React, { useState, useRef } from 'react';
import {
  X,
  Check,
  Upload,
  Loader2,
  FileUp,
  RotateCcw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export interface Product {
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

export interface ProductShape {
  id: string;
  product_id: string;
  side: 'front' | 'back';
  shape_path: string;
  trim_path: string;
}

export interface Sport {
  id: string;
  slug: string;
  label: string;
}

export const PRODUCT_TYPES = [
  { value: 'jersey', label: 'Jersey' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'pants', label: 'Pants' },
  { value: 'hoodie', label: 'Hoodie' },
  { value: 'jacket', label: 'Jacket' },
  { value: 'tank', label: 'Tank Top' },
  { value: 'polo', label: 'Polo' },
  { value: 'warmup', label: 'Warm-up' },
];

export const GENDERS = [
  { value: 'mens', label: "Men's" },
  { value: 'womens', label: "Women's" },
  { value: 'youth', label: 'Youth' },
  { value: 'unisex', label: 'Unisex' },
];

interface ProductFormModalProps {
  product: Product | null;
  sports: Sport[];
  defaultSportId?: string;
  defaultProductType?: string;
  onSave: (product: Product) => void;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  sports,
  defaultSportId,
  defaultProductType,
  onSave,
  onClose
}) => {
  const isEditing = !!product;
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'shapes'>('details');

  const [sportId, setSportId] = useState(product?.sport_id || defaultSportId || (sports[0]?.id || ''));
  const [name, setName] = useState(product?.name || '');
  const [productType, setProductType] = useState(product?.product_type || defaultProductType || 'jersey');
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
