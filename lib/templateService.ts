import { supabase } from './supabase';
import { SportDefinition, ProductCut, DesignLayer, DesignTemplate } from '../types';

export interface Sport {
  id: string;
  slug: string;
  label: string;
  display_order: number;
  is_active: boolean;
}

export interface Cut {
  id: string;
  sport_id: string;
  slug: string;
  label: string;
  display_order: number;
  is_active: boolean;
}

export interface GarmentPath {
  id: string;
  cut_id: string;
  garment_type: 'jersey' | 'shorts';
  path_type: 'shape' | 'trim';
  side: 'front' | 'back';
  svg_path: string;
}

export interface Template {
  id: string;
  sport_id: string;
  slug: string;
  label: string;
  display_order: number;
  is_published: boolean;
  created_by: string | null;
}

export interface Layer {
  id: string;
  template_id: string;
  layer_slug: string;
  label: string;
  display_order: number;
}

export interface LayerPath {
  id: string;
  layer_id: string;
  garment_type: 'jersey' | 'shorts';
  side: 'front' | 'back';
  svg_path: string;
}

export async function getSports(): Promise<Sport[]> {
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data || [];
}

export async function getCutsBySport(sportId: string): Promise<Cut[]> {
  const { data, error } = await supabase
    .from('product_cuts')
    .select('*')
    .eq('sport_id', sportId)
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data || [];
}

export async function getGarmentPaths(cutId: string): Promise<GarmentPath[]> {
  const { data, error } = await supabase
    .from('garment_paths')
    .select('*')
    .eq('cut_id', cutId);

  if (error) throw error;
  return data || [];
}

export async function getTemplatesBySport(sportId: string): Promise<Template[]> {
  const { data, error } = await supabase
    .from('sport_templates')
    .select('*')
    .eq('sport_id', sportId)
    .eq('is_published', true)
    .order('display_order');

  if (error) throw error;
  return data || [];
}

export async function getLayersByTemplate(templateId: string): Promise<Layer[]> {
  const { data, error } = await supabase
    .from('template_layers')
    .select('*')
    .eq('template_id', templateId)
    .order('display_order');

  if (error) throw error;
  return data || [];
}

export async function getLayerPaths(layerId: string): Promise<LayerPath[]> {
  const { data, error } = await supabase
    .from('layer_paths')
    .select('*')
    .eq('layer_id', layerId);

  if (error) throw error;
  return data || [];
}

export async function getSportDefinition(sportSlug: string): Promise<SportDefinition> {
  const { data: sport, error: sportError } = await supabase
    .from('sports')
    .select('*')
    .eq('slug', sportSlug)
    .eq('is_active', true)
    .maybeSingle();

  if (sportError) throw sportError;
  if (!sport) throw new Error(`Sport not found: ${sportSlug}`);

  const { data: cuts, error: cutsError } = await supabase
    .from('product_cuts')
    .select(`
      *,
      garment_paths (*)
    `)
    .eq('sport_id', sport.id)
    .eq('is_active', true)
    .order('display_order');

  if (cutsError) throw cutsError;

  const { data: templates, error: templatesError } = await supabase
    .from('sport_templates')
    .select(`
      *,
      template_layers (
        *,
        layer_paths (*)
      )
    `)
    .eq('sport_id', sport.id)
    .eq('is_published', true)
    .order('display_order');

  if (templatesError) throw templatesError;

  const cutsMap: Record<string, ProductCut> = {};

  for (const cut of cuts || []) {
    const paths = (cut as any).garment_paths || [];

    const jerseyShape = {
      front: paths.find((p: GarmentPath) => p.garment_type === 'jersey' && p.path_type === 'shape' && p.side === 'front')?.svg_path || '',
      back: paths.find((p: GarmentPath) => p.garment_type === 'jersey' && p.path_type === 'shape' && p.side === 'back')?.svg_path || ''
    };

    const jerseyTrim = {
      front: paths.find((p: GarmentPath) => p.garment_type === 'jersey' && p.path_type === 'trim' && p.side === 'front')?.svg_path || '',
      back: paths.find((p: GarmentPath) => p.garment_type === 'jersey' && p.path_type === 'trim' && p.side === 'back')?.svg_path || ''
    };

    const shortsShape = {
      front: paths.find((p: GarmentPath) => p.garment_type === 'shorts' && p.path_type === 'shape' && p.side === 'front')?.svg_path || '',
      back: paths.find((p: GarmentPath) => p.garment_type === 'shorts' && p.path_type === 'shape' && p.side === 'back')?.svg_path || ''
    };

    const shortsTrim = {
      front: paths.find((p: GarmentPath) => p.garment_type === 'shorts' && p.path_type === 'trim' && p.side === 'front')?.svg_path || '',
      back: paths.find((p: GarmentPath) => p.garment_type === 'shorts' && p.path_type === 'trim' && p.side === 'back')?.svg_path || ''
    };

    cutsMap[cut.slug] = {
      dbId: cut.id,
      jersey: {
        shape: jerseyShape,
        trim: jerseyTrim
      },
      shorts: {
        shape: shortsShape,
        trim: shortsTrim
      }
    };
  }

  const designTemplates: DesignTemplate[] = (templates || []).map((template: any) => {
    const layers: DesignLayer[] = (template.template_layers || []).map((layer: any) => {
      const layerPaths = layer.layer_paths || [];

      const jerseyFrontPaths = layerPaths.filter((p: LayerPath) => p.garment_type === 'jersey' && p.side === 'front').map((p: LayerPath) => p.svg_path);
      const jerseyBackPaths = layerPaths.filter((p: LayerPath) => p.garment_type === 'jersey' && p.side === 'back').map((p: LayerPath) => p.svg_path);
      const shortsFrontPaths = layerPaths.filter((p: LayerPath) => p.garment_type === 'shorts' && p.side === 'front').map((p: LayerPath) => p.svg_path);
      const shortsBackPaths = layerPaths.filter((p: LayerPath) => p.garment_type === 'shorts' && p.side === 'back').map((p: LayerPath) => p.svg_path);

      return {
        id: layer.layer_slug,
        dbId: layer.id,
        label: layer.label,
        paths: {
          jersey: {
            front: jerseyFrontPaths,
            back: jerseyBackPaths
          },
          shorts: {
            front: shortsFrontPaths,
            back: shortsBackPaths
          }
        }
      };
    });

    return {
      id: template.slug,
      dbId: template.id,
      label: template.label,
      layers
    };
  });

  const result = {
    id: sport.slug,
    label: sport.label,
    cuts: cutsMap,
    templates: designTemplates
  };

  console.log(`getSportDefinition(${sportSlug}) result:`, JSON.stringify(result, null, 2));

  return result;
}

export async function getTemplateLibrary(): Promise<Record<string, SportDefinition>> {
  const sports = await getSports();
  const library: Record<string, SportDefinition> = {};

  for (const sport of sports) {
    try {
      library[sport.slug] = await getSportDefinition(sport.slug);
    } catch (error) {
      console.error(`Error loading sport ${sport.slug}:`, error);
    }
  }

  return library;
}

export async function createSport(data: { slug: string; label: string; display_order: number }): Promise<Sport> {
  const { data: sport, error } = await supabase
    .from('sports')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return sport;
}

export async function updateSport(id: string, data: Partial<Sport>): Promise<Sport> {
  const { data: sport, error } = await supabase
    .from('sports')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return sport;
}

export async function deleteSport(id: string): Promise<void> {
  const { error } = await supabase
    .from('sports')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createCut(sportId: string, data: { slug: string; label: string; display_order: number }): Promise<Cut> {
  const { data: cut, error } = await supabase
    .from('product_cuts')
    .insert({ ...data, sport_id: sportId })
    .select()
    .single();

  if (error) throw error;
  return cut;
}

export async function updateCut(id: string, data: Partial<Cut>): Promise<Cut> {
  const { data: cut, error } = await supabase
    .from('product_cuts')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return cut;
}

export async function deleteCut(id: string): Promise<void> {
  const { error } = await supabase
    .from('product_cuts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateGarmentPath(
  cutId: string,
  garmentType: 'jersey' | 'shorts',
  pathType: 'shape' | 'trim',
  side: 'front' | 'back',
  svgPath: string
): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from('garment_paths')
    .select('id')
    .eq('cut_id', cutId)
    .eq('garment_type', garmentType)
    .eq('path_type', pathType)
    .eq('side', side)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    const { error: updateError } = await supabase
      .from('garment_paths')
      .update({ svg_path: svgPath })
      .eq('id', existing.id);

    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase
      .from('garment_paths')
      .insert({
        cut_id: cutId,
        garment_type: garmentType,
        path_type: pathType,
        side,
        svg_path: svgPath
      });

    if (insertError) throw insertError;
  }
}

export async function createTemplate(data: {
  sport_id: string;
  slug: string;
  label: string;
  display_order: number;
  is_published?: boolean;
}): Promise<Template>;
export async function createTemplate(
  sportId: string,
  cutSlug: string,
  slug: string,
  label: string,
  displayOrder?: number,
  isPublished?: boolean
): Promise<Template>;
export async function createTemplate(
  dataOrSportId: {
    sport_id: string;
    slug: string;
    label: string;
    display_order: number;
    is_published?: boolean;
  } | string,
  cutSlug?: string,
  slug?: string,
  label?: string,
  displayOrder: number = 0,
  isPublished: boolean = true
): Promise<Template> {
  let insertData;

  if (typeof dataOrSportId === 'string') {
    insertData = {
      sport_id: dataOrSportId,
      slug: slug!,
      label: label!,
      display_order: displayOrder,
      is_published: isPublished
    };
  } else {
    insertData = dataOrSportId;
  }

  const { data: template, error } = await supabase
    .from('sport_templates')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return template;
}

export async function updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
  const { data: template, error } = await supabase
    .from('sport_templates')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return template;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('sport_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createLayer(
  templateId: string,
  data: { layer_slug: string; label: string; display_order: number }
): Promise<Layer>;
export async function createLayer(
  templateId: string,
  layerSlug: string,
  label: string,
  displayOrder?: number
): Promise<Layer>;
export async function createLayer(
  templateId: string,
  dataOrSlug: { layer_slug: string; label: string; display_order: number } | string,
  label?: string,
  displayOrder: number = 0
): Promise<Layer> {
  let insertData;

  if (typeof dataOrSlug === 'string') {
    insertData = {
      template_id: templateId,
      layer_slug: dataOrSlug,
      label: label!,
      display_order: displayOrder
    };
  } else {
    insertData = {
      template_id: templateId,
      ...dataOrSlug
    };
  }

  const { data: layer, error } = await supabase
    .from('template_layers')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return layer;
}

export async function updateLayer(id: string, data: Partial<Layer>): Promise<Layer> {
  const { data: layer, error } = await supabase
    .from('template_layers')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return layer;
}

export async function deleteLayer(id: string): Promise<void> {
  const { error } = await supabase
    .from('template_layers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateLayerPath(
  layerId: string,
  garmentType: 'jersey' | 'shorts',
  side: 'front' | 'back',
  svgPath: string | string[]
): Promise<void> {
  const paths = Array.isArray(svgPath) ? svgPath : [svgPath];

  const { error: deleteError } = await supabase
    .from('layer_paths')
    .delete()
    .eq('layer_id', layerId)
    .eq('garment_type', garmentType)
    .eq('side', side);

  if (deleteError) throw deleteError;

  if (paths.length > 0) {
    const insertData = paths.map(path => ({
      layer_id: layerId,
      garment_type: garmentType,
      side,
      svg_path: path
    }));

    const { error: insertError } = await supabase
      .from('layer_paths')
      .insert(insertData);

    if (insertError) throw insertError;
  }
}

export async function getCutById(cutId: string): Promise<Cut & { garment_paths: GarmentPath[] }> {
  const { data, error } = await supabase
    .from('product_cuts')
    .select(`
      *,
      garment_paths (*)
    `)
    .eq('id', cutId)
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Cut not found: ${cutId}`);

  return data as Cut & { garment_paths: GarmentPath[] };
}

export async function getTemplateById(templateId: string): Promise<Template & {
  template_layers: (Layer & { layer_paths: LayerPath[] })[]
}> {
  const { data, error } = await supabase
    .from('sport_templates')
    .select(`
      *,
      template_layers (
        *,
        layer_paths (*)
      )
    `)
    .eq('id', templateId)
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Template not found: ${templateId}`);

  return data as Template & {
    template_layers: (Layer & { layer_paths: LayerPath[] })[]
  };
}
