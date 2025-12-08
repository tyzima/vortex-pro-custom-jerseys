

export type GarmentType = 'jersey' | 'shorts';
export type ViewSide = 'front' | 'back' | 'both';
export type Sport = string;
export type Cut = string;
export type PatternType = 'none' | 'stripes' | 'camo' | 'dots' | 'mesh' | 'geometric';
export type TemplateId = string;

export interface ZoneStyle {
  color: string;
  pattern: PatternType;
  patternColor: string;
  patternMode: 'ghost' | 'custom'; // 'ghost' = darker shade of base, 'custom' = specific color
}

export interface Position {
  x: number;
  y: number;
}

export interface Logo {
  id: string;
  url: string;
  position: Position;
  size: number; // width and height (logos are square)
  rotation: number; // rotation in degrees (0-360)
  view: 'front' | 'back';
  mirroredFrom?: string; // ID of the logo this is mirrored from
}

export interface TextElement {
  id: string;
  text: string;
  font: string;
  color: string;
  outline: string;
  outlineWidth: number;
  position: Position;
  size: number;
  rotation: number;
  view: 'front' | 'back';
  isLocked?: boolean; // For default elements like Team Name
  isDynamic?: boolean; // If true, this text varies per roster entry (e.g. Player Name)
}

export interface DesignState {
  sport: Sport;
  cut: Cut;
  garmentType: GarmentType;
  template: TemplateId;
  // Dynamic keys based on template (e.g., 'body', 'trim', 'sidePanel', 'shoulders')
  zones: Record<string, ZoneStyle>;
  textElements: TextElement[];
  logos: Logo[];
}

export interface RosterEntry {
  size: string;
  quantity: number;
  // Key is the textElement.id (e.g., 'frontNumber'), Value is the actual text (e.g., "23")
  dynamicValues: Record<string, string>;
}

export interface CartItem {
  id: string;
  design: DesignState;
  quantity: number;
  price: number;
  timestamp: number;
  roster?: RosterEntry[];
}

export interface ColorOption {
  name: string;
  hex: string;
}

// --- MODULAR TEMPLATE DEFINITIONS ---

// 1. The "Cut" defines the physical shape of the garment (Silhouette + Hardware/Trim)
//    These paths rarely change for a given sport/gender.
//    Now supports both jersey and shorts for each cut.
export interface ProductCut {
  dbId?: string;
  jersey: {
    shape: { front: string; back: string };
    trim: { front: string; back: string };
  };
  shorts: {
    shape: { front: string; back: string };
    trim: { front: string; back: string };
  };
}

// 2. A "Layer" is a single editable zone within a design template (e.g., "Side Panel", "Chevron")
export interface DesignLayer {
  id: string;
  dbId?: string;
  label: string;
  paths: {
    jersey: { front: string[]; back: string[] };
    shorts: { front: string[]; back: string[] };
  };
}

// 3. A "Template" is a collection of layers that make up a visual style.
//    It sits on top of the Product Cut.
export interface DesignTemplate {
  id: string;
  dbId?: string;
  label: string;
  layers: DesignLayer[];
}

// 4. The Sport Definition aggregates Cuts and Templates.
export interface SportDefinition {
  id: string;
  label: string;
  cuts: Record<string, ProductCut>; // e.g. 'mens', 'womens'
  templates: DesignTemplate[];      // List of available visual designs
}

export const COLORS: ColorOption[] = [
  { name: 'Midnight Black', hex: '#0a0a0a' },
  { name: 'Anthracite', hex: '#333333' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Silver', hex: '#e5e5e5' },
  { name: 'Varsity Red', hex: '#dc2626' },
  { name: 'Crimson', hex: '#991b1b' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Navy', hex: '#172554' },
  { name: 'University Blue', hex: '#60a5fa' },
  { name: 'Forest Green', hex: '#15803d' },
  { name: 'Kelly Green', hex: '#22c55e' },
  { name: 'Volt', hex: '#D2F802' },
  { name: 'Safety Orange', hex: '#f97316' },
  { name: 'Court Purple', hex: '#7e22ce' },
  { name: 'Gold', hex: '#fbbf24' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Hot Pink', hex: '#db2777' },
  { name: 'Maroon', hex: '#800000' },
];

export const FONTS = [
  { name: 'Modern Sans', value: 'Inter' },
  { name: 'Varsity Block', value: 'Oswald' },
  { name: 'Pro Condensed', value: 'Anton' },
];