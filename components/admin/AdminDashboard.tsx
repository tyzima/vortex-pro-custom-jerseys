import React, { useState, useEffect } from 'react';
import { ArrowLeft, Layout, Database, ShoppingBag, Palette } from 'lucide-react';
import { LibraryViewer, EditContext } from './LibraryViewer';
import { TemplateBuilder } from './TemplateBuilder';
import { OrdersOverview } from './OrdersOverview';
import { VisualEditor } from './VisualEditor';
import HierarchicalNav from './HierarchicalNav';
import TemplateGrid from './TemplateGrid';
import CreateTemplateModal from './CreateTemplateModal';
import { supabase } from '../../lib/supabase';

interface NavItem {
  sportId: string;
  sportLabel: string;
  cutId: string;
  cutLabel: string;
  garmentType: 'jersey' | 'shorts';
}

interface Sport {
  id: string;
  label: string;
  cuts: Array<{
    id: string;
    label: string;
  }>;
}

interface Template {
  id: string;
  slug: string;
  label: string;
  displayOrder: number;
  isPublished: boolean;
  layerCount: number;
}

export const AdminDashboard = ({ onExit }: { onExit: () => void }) => {
  const [tab, setTab] = useState<'orders' | 'library' | 'builder' | 'templates' | 'visual'>('templates');
  const [editContext, setEditContext] = useState<EditContext | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedNav, setSelectedNav] = useState<NavItem | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadSportsAndCuts();
  }, []);

  useEffect(() => {
    if (selectedNav) {
      loadTemplates(selectedNav.sportId);
    }
  }, [selectedNav]);

  const loadSportsAndCuts = async () => {
    try {
      setLoading(true);
      const { data: sportsData, error: sportsError } = await supabase
        .from('sports')
        .select('id, label, display_order')
        .eq('is_active', true)
        .order('display_order');

      if (sportsError) throw sportsError;

      const sportsWithCuts = await Promise.all(
        (sportsData || []).map(async (sport) => {
          const { data: cutsData } = await supabase
            .from('product_cuts')
            .select('id, label, display_order')
            .eq('sport_id', sport.id)
            .order('display_order');

          return {
            id: sport.id,
            label: sport.label,
            cuts: cutsData || []
          };
        })
      );

      setSports(sportsWithCuts);
    } catch (error) {
      console.error('Error loading sports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async (sportId: string) => {
    try {
      const { data: templatesData, error } = await supabase
        .from('sport_templates')
        .select(`
          id,
          slug,
          label,
          display_order,
          is_published,
          template_layers (
            id
          )
        `)
        .eq('sport_id', sportId)
        .order('display_order');

      if (error) throw error;

      const formattedTemplates: Template[] = (templatesData || []).map((t: any) => ({
        id: t.id,
        slug: t.slug,
        label: t.label,
        displayOrder: t.display_order,
        isPublished: t.is_published,
        layerCount: t.template_layers?.length || 0
      }));

      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleEdit = (context: EditContext) => {
    setEditContext(context);
    setTab('builder');
  };

  const handleBuilderExit = () => {
    setEditContext(null);
    setTab('library');
  };

  const handleNavSelect = (item: NavItem) => {
    setSelectedNav(item);
    setEditingTemplateId(null);
  };

  const handleEditTemplate = (templateId: string) => {
    setEditingTemplateId(templateId);
  };

  const handleBackToGrid = () => {
    setEditingTemplateId(null);
    if (selectedNav) {
      loadTemplates(selectedNav.sportId);
    }
  };

  const handleCreateTemplate = () => {
    setShowCreateModal(true);
  };

  const handleSubmitNewTemplate = async (slug: string, label: string) => {
    if (!selectedNav) return;

    try {
      const nextDisplayOrder = templates.length > 0
        ? Math.max(...templates.map(t => t.displayOrder)) + 1
        : 1;

      const { data, error } = await supabase
        .from('sport_templates')
        .insert({
          sport_id: selectedNav.sportId,
          slug,
          label,
          display_order: nextDisplayOrder,
          is_published: false
        })
        .select()
        .single();

      if (error) throw error;

      await loadTemplates(selectedNav.sportId);

      if (data) {
        setEditingTemplateId(data.id);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create template');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col text-white overflow-hidden animate-fade-in" style={{ backgroundColor: '#000000' }}>
      <div className="h-16 shrink-0 border-b border-neutral-800 flex items-center justify-between px-6" style={{ backgroundColor: '#171717' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Exit Portal
          </button>
          <div className="h-6 w-px bg-neutral-800" />
          <h1 className="font-display text-xl italic text-white">
            VORTEX <span className="text-brand-accent">ADMIN</span>
          </h1>
        </div>

        <div className="flex gap-2 bg-black p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setTab('orders')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
              tab === 'orders' ? 'bg-brand-accent text-black shadow-lg' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={14} /> Orders
          </button>
          <button
            onClick={() => {
              setEditingTemplateId(null);
              setTab('templates');
            }}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
              tab === 'templates' ? 'bg-brand-accent text-black shadow-lg' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Palette size={14} /> Templates
          </button>
          <button
            onClick={() => setTab('library')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
              tab === 'library' ? 'bg-brand-accent text-black shadow-lg' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Database size={14} /> Library View
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
        {tab === 'orders' ? (
          <div className="h-full max-w-7xl mx-auto flex flex-col p-6">
            <OrdersOverview />
          </div>
        ) : tab === 'templates' ? (
          editingTemplateId ? (
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 border-b border-neutral-800">
                <button
                  onClick={handleBackToGrid}
                  className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  <ArrowLeft size={16} /> Back to Templates
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <VisualEditor templateId={editingTemplateId} />
              </div>
            </div>
          ) : (
            <div className="h-full flex">
              <HierarchicalNav
                sports={sports}
                selectedItem={selectedNav}
                onSelect={handleNavSelect}
              />
              {selectedNav ? (
                <TemplateGrid
                  sportLabel={selectedNav.sportLabel}
                  cutLabel={selectedNav.cutLabel}
                  garmentType={selectedNav.garmentType}
                  templates={templates}
                  onEditTemplate={handleEditTemplate}
                  onCreateTemplate={handleCreateTemplate}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-neutral-500">
                  <div className="text-center">
                    <Palette className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a garment to view templates</p>
                    <p className="text-sm mt-2">Choose a sport, cut, and garment from the left sidebar</p>
                  </div>
                </div>
              )}
            </div>
          )
        ) : tab === 'library' ? (
          <div className="h-full max-w-7xl mx-auto flex flex-col p-6">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <LibraryViewer onEdit={handleEdit} />
            </div>
          </div>
        ) : (
          <div className="h-full max-w-7xl mx-auto flex flex-col p-6">
            <TemplateBuilder editContext={editContext} onExit={handleBuilderExit} />
          </div>
        )}
      </div>

      {showCreateModal && selectedNav && (
        <CreateTemplateModal
          sportId={selectedNav.sportId}
          sportLabel={selectedNav.sportLabel}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleSubmitNewTemplate}
        />
      )}
    </div>
  );
};
