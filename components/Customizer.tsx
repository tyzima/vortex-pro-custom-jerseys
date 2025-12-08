import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { DesignState, ViewSide, PatternType, COLORS, FONTS, Sport, Cut, TemplateId, ZoneStyle, CartItem } from '../types';
import { JerseySVG } from './JerseySVG';
import { Type, Upload, ChevronRight, ChevronLeft, Shirt, Layout, PaintBucket, ChevronDown, ChevronUp, Droplets, Ghost, History, Sun, Moon, ShoppingBag, Plus, X, Check, Link, Unlink, Dices, Trash2, Users } from 'lucide-react';
import { FaBasketballBall, FaFutbol, FaRunning } from 'react-icons/fa';
import { LacrosseIcon } from './icons/SportsIcons';
import { Tooltip } from './ui/Tooltip';
import { useTheme } from './ThemeContext';
import { useTemplateLibrary } from '../contexts/TemplateLibraryContext';

// Initial Default State
const DEFAULT_ZONES: Record<string, ZoneStyle> = {
    body: { color: '#ffffff', pattern: 'none', patternColor: '#000000', patternMode: 'ghost' },
    trim: { color: '#0a0a0a', pattern: 'none', patternColor: '#ffffff', patternMode: 'ghost' },
    sides: { color: '#0a0a0a', pattern: 'none', patternColor: '#ffffff', patternMode: 'ghost' },
    shoulders: { color: '#0a0a0a', pattern: 'none', patternColor: '#ffffff', patternMode: 'ghost' },
    chevron: { color: '#D2F802', pattern: 'none', patternColor: '#000000', patternMode: 'ghost' },
};

const STEPS = [
    { id: 1, label: 'Setup', icon: Shirt },
    { id: 2, label: 'Design', icon: Layout },
    { id: 3, label: 'Colors', icon: PaintBucket },
    { id: 4, label: 'Identity', icon: Type },
];

const SPORT_ICONS: Record<string, React.ElementType> = {
    basketball: FaBasketballBall,
    soccer: FaFutbol,
    lacrosse: LacrosseIcon,
    general: FaRunning,
};

interface CustomizerProps {
    onAddToCart?: (item: CartItem) => void;
    onUpdateCartItem?: (itemId: string, item: CartItem) => void;
    editingItemId?: string | null;
    editingItem?: CartItem;
    onCheckout?: () => void;
}

// Memoized Thumbnail Component to prevent re-renders
interface ThumbnailProps {
    id: string;
    sport: Sport;
    cut: Cut;
    template: string;
    colors: string[];
    garmentType: 'jersey' | 'shorts';
}

const Thumbnail = React.memo(({ id, sport, cut, template, colors, garmentType }: ThumbnailProps) => {
    const design: DesignState = {
        sport,
        cut,
        garmentType,
        template,
        zones: {
            body: { color: colors[0], pattern: 'none', patternColor: '#000000', patternMode: 'ghost' },
            trim: { color: colors[1], pattern: 'none', patternColor: '#000000', patternMode: 'ghost' },
            sides: { color: colors[1], pattern: 'none', patternColor: '#000000', patternMode: 'ghost' },
            shoulders: { color: colors[1], pattern: 'none', patternColor: '#000000', patternMode: 'ghost' },
            chevron: { color: colors[1], pattern: 'none', patternColor: '#000000', patternMode: 'ghost' }
        },
        textElements: [],
        logos: []
    };

    return (
        <JerseySVG
            design={design}
            view="front"
            id={`template-preview-${id}`}
        />
    );
}, (prev, next) => {
    return (
        prev.id === next.id &&
        prev.sport === next.sport &&
        prev.cut === next.cut &&
        prev.template === next.template &&
        prev.garmentType === next.garmentType &&
        prev.colors[0] === next.colors[0] &&
        prev.colors[1] === next.colors[1]
    );
});

export const Customizer: React.FC<CustomizerProps> = ({ onAddToCart, onUpdateCartItem, editingItemId, editingItem, onCheckout }) => {
    const { theme, toggleTheme } = useTheme();
    const { library: SPORTS_LIBRARY, loading: libraryLoading, error: libraryError } = useTemplateLibrary();
    const [view, setView] = useState<ViewSide>('front');
    const [currentStep, setCurrentStep] = useState(1);
    const [activeIdentitySection, setActiveIdentitySection] = useState<'style' | 'team' | 'player'>('team');
    const [activePaintSection, setActivePaintSection] = useState<'base' | 'pattern'>('base');
    const [recentColors, setRecentColors] = useState<string[]>(['#ffffff', '#0a0a0a', '#D2F802']); // Defaults: White, Black, Volt
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [activePopover, setActivePopover] = useState<'fill' | 'outline' | 'base' | 'pattern' | 'font' | 'patternType' | null>(null);
    const [textStyleGroups, setTextStyleGroups] = useState<{ [key: string]: string[] }>({
        'numbers': ['frontNumber', 'backNumber'],
        'names': ['frontTeam', 'backName']
    });
    const [activeIdentityControl, setActiveIdentityControl] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deletedItem, setDeletedItem] = useState<{ item: any, index: number, timeoutId: NodeJS.Timeout } | null>(null);
    const [showAddColorPopover, setShowAddColorPopover] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showVariationsModal, setShowVariationsModal] = useState(false);
    const [variationSeed, setVariationSeed] = useState(0); // Used to force regeneration of variations

    const [design, setDesign] = useState<DesignState>({
        sport: 'basketball',
        cut: 'mens',
        garmentType: 'jersey',
        template: 'classic',
        zones: JSON.parse(JSON.stringify(DEFAULT_ZONES)), // Deep copy
        textElements: [
            { id: 'frontTeam', text: 'VORTEX', font: 'Anton', color: '#0a0a0a', outline: '#ffffff', outlineWidth: 2, position: { x: 200, y: 180 }, size: 32, rotation: 0, view: 'front', isLocked: true, isDynamic: false },
            { id: 'frontNumber', text: '24', font: 'Anton', color: '#0a0a0a', outline: '#ffffff', outlineWidth: 2, position: { x: 200, y: 320 }, size: 120, rotation: 0, view: 'front', isLocked: true, isDynamic: true },
            { id: 'backName', text: 'CHAMPION', font: 'Anton', color: '#0a0a0a', outline: '#ffffff', outlineWidth: 2, position: { x: 200, y: 150 }, size: 36, rotation: 0, view: 'back', isLocked: true, isDynamic: true },
            { id: 'backNumber', text: '24', font: 'Anton', color: '#0a0a0a', outline: '#ffffff', outlineWidth: 2, position: { x: 200, y: 320 }, size: 140, rotation: 0, view: 'back', isLocked: true, isDynamic: true }
        ],
        logos: []
    });

    // Load editing item data when editing
    useEffect(() => {
        if (editingItem) {
            setDesign(JSON.parse(JSON.stringify(editingItem.design)));
        }
    }, [editingItem]);

    // State for the "Colors" step - which zone is currently being edited
    const [activeZoneId, setActiveZoneId] = useState<string>('body');

    const updateZone = (zoneId: string, updates: Partial<ZoneStyle>) => {
        setDesign(prev => ({
            ...prev,
            zones: {
                ...prev.zones,
                [zoneId]: { ...prev.zones[zoneId] || DEFAULT_ZONES.body, ...updates }
            }
        }));
    };

    // Wrapper to handle color updates and track history
    const applyColor = (color: string, type: 'base' | 'pattern' = 'base') => {
        // Update History (Unshift to front, remove duplicates, keep max 7)
        setRecentColors(prev => {
            const filtered = prev.filter(c => c !== color);
            return [color, ...filtered].slice(0, 7);
        });

        if (type === 'base') {
            updateZone(activeZoneId, { color });
        } else {
            updateZone(activeZoneId, { patternColor: color });
        }
    };

    const handleLogoUpdate = (id: string, field: 'size' | 'rotation', value: number) => {
        setDesign(prev => {
            const updatedLogos = prev.logos.map(logo => {
                if (logo.id === id) {
                    return { ...logo, [field]: value };
                }
                // Update mirrored logo if this logo has a mirror
                if (logo.mirroredFrom === id) {
                    // For rotation, apply opposite rotation to mirrored logo
                    if (field === 'rotation') {
                        return { ...logo, [field]: -value };
                    }
                    return { ...logo, [field]: value };
                }
                return logo;
            });
            return { ...prev, logos: updatedLogos };
        });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, view: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                const newLogo = {
                    id: `logo-${Date.now()}`,
                    url,
                    position: { x: 200, y: 100 },
                    size: 40,
                    rotation: 0,
                    view
                };
                setDesign(prev => ({
                    ...prev,
                    logos: [...prev.logos, newLogo]
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogoRemove = (id: string) => {
        setDesign(prev => ({
            ...prev,
            logos: prev.logos.filter(logo => logo.id !== id && logo.mirroredFrom !== id)
        }));
    };

    const handleLogoMirror = (id: string) => {
        const logo = design.logos.find(l => l.id === id);
        if (!logo) return;

        // Check if this logo already has a mirror
        const existingMirror = design.logos.find(l => l.mirroredFrom === id);

        if (existingMirror) {
            // Remove the mirror
            setDesign(prev => ({
                ...prev,
                logos: prev.logos.filter(l => l.id !== existingMirror.id)
            }));
        } else {
            // Create a new mirror
            const mirroredX = 400 - logo.position.x;

            const mirroredLogo = {
                id: `logo-${Date.now()}`,
                url: logo.url,
                position: { x: mirroredX, y: logo.position.y },
                size: logo.size,
                rotation: logo.rotation || 0,
                view: logo.view,
                mirroredFrom: id
            };

            setDesign(prev => ({
                ...prev,
                logos: [...prev.logos, mirroredLogo]
            }));
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent, view: 'front' | 'back') => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                const newLogo = {
                    id: `logo-${Date.now()}`,
                    url,
                    position: { x: 200, y: 100 },
                    size: 40,
                    rotation: 0,
                    view
                };
                setDesign(prev => ({
                    ...prev,
                    logos: [...prev.logos, newLogo]
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePositionChange = (id: string, pos: { x: number, y: number }) => {
        // Check if it's a logo
        if (id.startsWith('logo-')) {
            setDesign(prev => {
                const updatedLogos = prev.logos.map(logo => {
                    if (logo.id === id) {
                        return { ...logo, position: pos };
                    }
                    // Update mirrored logo if this logo has a mirror
                    if (logo.mirroredFrom === id) {
                        const mirroredX = 400 - pos.x;
                        return { ...logo, position: { x: mirroredX, y: pos.y } };
                    }
                    return logo;
                });
                return { ...prev, logos: updatedLogos };
            });
        } else {
            // It's a text element
            setDesign(prev => ({
                ...prev,
                textElements: prev.textElements.map(t =>
                    t.id === id ? { ...t, position: pos } : t
                )
            }));
        }
    };

    // Handle library loading states
    if (libraryLoading || !SPORTS_LIBRARY) {
        return (
            <div className="fixed inset-0 bg-brand-black flex items-center justify-center">
                <div className="text-brand-accent text-xl font-bold uppercase tracking-widest animate-pulse">
                    Loading Templates...
                </div>
            </div>
        );
    }

    if (libraryError) {
        return (
            <div className="fixed inset-0 bg-brand-black flex items-center justify-center">
                <div className="text-red-500 text-xl font-bold uppercase tracking-widest">
                    Error: {libraryError}
                </div>
            </div>
        );
    }

    // Dynamic Data Retrieval
    const availableSports = Object.values(SPORTS_LIBRARY);
    const sportDef = SPORTS_LIBRARY[design.sport] || SPORTS_LIBRARY['basketball'];
    const availableCuts = Object.keys(sportDef.cuts);
    const currentTemplate = sportDef.templates.find(t => t.id === design.template) || sportDef.templates[0];

    // Derive Active Zones based on Template
    // The Template tells us what layers exist.
    // Note: 'body' and 'trim' are always present on the Cut, so we prepend/append them.
    const activeZonesList = useMemo(() => {
        return [
            { id: 'body', label: 'Main Body' },
            ...currentTemplate.layers.map(l => ({ id: l.id, label: l.label })),
            { id: 'trim', label: 'Trim' }
        ];
    }, [currentTemplate]);

    const handleSelection = (id: string) => {
        setSelectedItemId(id);
        setActivePopover(null); // Reset popover on new selection

        // Auto-switch tabs logic
        const isZone = Object.keys(design.zones).includes(id);
        const isText = design.textElements.some(t => t.id === id);
        const isLogo = design.logos.some(l => l.id === id);

        if (isZone) {
            setCurrentStep(3); // Colors tab
            setActiveZoneId(id);
        } else if (isText || isLogo) {
            setCurrentStep(4); // Identity tab
            // For text/logos, we might need to set the active section too
            if (isText) {
                const textElement = design.textElements.find(t => t.id === id);
                if (textElement) {
                    // Determine if it's a player element or team element to switch sub-tabs
                    if (['frontNumber', 'backName', 'backNumber'].includes(textElement.id)) {
                        setActiveIdentitySection('player');
                    } else {
                        setActiveIdentitySection('team');
                    }
                }
            } else if (isLogo) {
                setActiveIdentitySection('team'); // Logos are usually in team section
            }
        }
    };

    // Auto-scroll effect
    React.useEffect(() => {
        if (selectedItemId) {
            // Small timeout to allow tab switch and DOM update
            setTimeout(() => {
                const elementId = `control-${selectedItemId}`;
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [selectedItemId, currentStep, activeIdentitySection]);

    const handleTextUpdate = (id: string, field: string, value: any) => {
        // Find which group this element belongs to
        const groupName = Object.keys(textStyleGroups).find(group =>
            textStyleGroups[group].includes(id)
        );

        // If updating font, color, or outline and element is in a group, apply to all in group
        if (groupName && ['font', 'color', 'outline', 'outlineWidth'].includes(field)) {
            const groupIds = textStyleGroups[groupName];
            setDesign(prev => ({
                ...prev,
                textElements: prev.textElements.map(t =>
                    groupIds.includes(t.id) ? { ...t, [field]: value } : t
                )
            }));
        } else {
            // Unlinked or updating text/size/position - only update the specific element
            setDesign(prev => ({
                ...prev,
                textElements: prev.textElements.map(t => t.id === id ? { ...t, [field]: value } : t)
            }));
        }
    };

    const handleAddText = (view: 'front' | 'back') => {
        const newText = {
            id: `text-${Date.now()}`,
            text: 'CUSTOM',
            font: 'Anton',
            color: '#0a0a0a',
            outline: '#ffffff',
            outlineWidth: 2,
            position: { x: 200, y: 250 },
            size: 40,
            rotation: 0,
            view,
            isLocked: false,
            isDynamic: false
        };
        setDesign(prev => ({
            ...prev,
            textElements: [...prev.textElements, newText]
        }));
    };

    const handleRemoveText = (id: string) => {
        const index = design.textElements.findIndex(el => el.id === id);
        const item = design.textElements[index];

        // Clear any existing timeout
        if (deletedItem) clearTimeout(deletedItem.timeoutId);

        // Remove item
        setDesign(prev => ({
            ...prev,
            textElements: prev.textElements.filter(el => el.id !== id)
        }));

        // Set undo state with 3s timeout
        const timeoutId = setTimeout(() => {
            setDeletedItem(null);
        }, 3000);

        setDeletedItem({ item, index, timeoutId });
    };

    const handleUndoDelete = () => {
        if (!deletedItem) return;

        clearTimeout(deletedItem.timeoutId);

        setDesign(prev => {
            const newElements = [...prev.textElements];
            newElements.splice(deletedItem.index, 0, deletedItem.item);
            return { ...prev, textElements: newElements };
        });

        setDeletedItem(null);
    };

    const handleZoneUpdate = (id: string, field: 'color' | 'pattern' | 'patternColor', value: string) => {
        setDesign(prev => ({
            ...prev,
            zones: {
                ...prev.zones,
                [id]: {
                    ...prev.zones[id],
                    [field]: value
                }
            }
        }));
    };

    // Variations Logic
    // Variations Logic
    const generateRandomColor = () => {
        // Use project palette (recentColors) if available, otherwise default set
        const palette = recentColors.length > 0 ? recentColors : COLORS.map(c => c.hex);
        return palette[Math.floor(Math.random() * palette.length)];
    };

    const generateVariations = () => {
        const sportDef = SPORTS_LIBRARY[design.sport] || SPORTS_LIBRARY['basketball'];
        // Use variationSeed to force regeneration when refresh is clicked
        const seed = variationSeed;

        return Array(6).fill(null).map((_, index) => {
            const baseColor = generateRandomColor();
            const trimColor = generateRandomColor();

            // Pick a random template from the current sport
            const templates = sportDef.templates;
            const randomTemplate = templates[Math.floor(Math.random() * templates.length)].id;

            return {
                template: randomTemplate,
                zones: {
                    body: { color: baseColor },
                    trim: { color: trimColor },
                    sides: { color: Math.random() > 0.5 ? baseColor : trimColor },
                    shoulders: { color: Math.random() > 0.5 ? baseColor : trimColor }
                }
            };
        });
    };

    const applyVariation = (variation: any) => {
        setDesign(prev => ({
            ...prev,
            template: variation.template,
            zones: {
                ...prev.zones,
                ...variation.zones
            }
        }));
        setShowVariationsModal(false);
    };

    // Ensure we default to the first zone when switching templates if current is invalid
    React.useEffect(() => {
        const validIds = activeZonesList.map(z => z.id);
        if (!validIds.includes(activeZoneId)) {
            setActiveZoneId(validIds[0]);
        }
    }, [currentTemplate, activeZonesList, activeZoneId]);

    // Smart Navigation Logic
    const handleNext = () => {
        // If in Colors step, iterate through zones first
        if (currentStep === 3) {
            const currentIndex = activeZonesList.findIndex(z => z.id === activeZoneId);
            // If there is a next zone, go to it
            if (currentIndex !== -1 && currentIndex < activeZonesList.length - 1) {
                setActiveZoneId(activeZonesList[currentIndex + 1].id);
                return;
            }
        }

        // Otherwise proceed to next step
        // Skip step 4 (Identity) for shorts since they don't have text/numbers
        const maxStep = design.garmentType === 'shorts' ? 3 : 4;
        if (currentStep < maxStep) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(p => p - 1);
    };

    const getNextButtonLabel = () => {
        if (currentStep === 3) {
            const currentIndex = activeZonesList.findIndex(z => z.id === activeZoneId);
            if (currentIndex !== -1 && currentIndex < activeZonesList.length - 1) {
                return "Next Zone";
            }
        }
        return "Next Step";
    };

    // Cart Logic
    const handleAddToBagClick = () => {
        setShowSuccessModal(true);
    };

    const confirmAdd = (action: 'add_another' | 'checkout') => {
        if (editingItemId && onUpdateCartItem) {
            // Update existing item
            const updatedItem: CartItem = {
                id: editingItemId,
                design: JSON.parse(JSON.stringify(design)),
                quantity: 1,
                price: 65,
                timestamp: Date.now()
            };
            onUpdateCartItem(editingItemId, updatedItem);
            setShowSuccessModal(false);
            if (onCheckout) onCheckout();
        } else {
            // Create new Cart Item
            const newItem: CartItem = {
                id: Math.random().toString(36).substr(2, 9),
                design: JSON.parse(JSON.stringify(design)),
                quantity: 1,
                price: 65,
                timestamp: Date.now()
            };

            if (onAddToCart) onAddToCart(newItem);
            setShowSuccessModal(false);

            if (action === 'add_another') {
                // Reset Logic
                setCurrentStep(1);
                // Reset design but keep sport/cut settings maybe? Or full reset?
                // User requested "go back to setup tab" so complete reset makes sense, 
                // but keeping the sport selected is user friendly.
                // Resetting to defaults:
                setDesign(prev => ({
                    ...prev,
                    zones: JSON.parse(JSON.stringify(DEFAULT_ZONES)),
                    textElements: [
                        { id: 'frontTeam', text: 'VORTEX', font: 'Anton', color: '#0a0a0a', outline: '#ffffff', outlineWidth: 2, position: { x: 200, y: 180 }, size: 32, rotation: 0, view: 'front', isLocked: true, isDynamic: false },
                        { id: 'frontNumber', text: '24', font: 'Anton', color: '#0a0a0a', outline: '#ffffff', outlineWidth: 2, position: { x: 200, y: 320 }, size: 120, rotation: 0, view: 'front', isLocked: true, isDynamic: true },
                        { id: 'backName', text: 'CHAMPION', font: 'Anton', color: '#0a0a0a', outline: '#ffffff', outlineWidth: 2, position: { x: 200, y: 150 }, size: 36, rotation: 0, view: 'back', isLocked: true, isDynamic: true },
                        { id: 'backNumber', text: '24', font: 'Anton', color: '#0a0a0a', outline: '#ffffff', outlineWidth: 2, position: { x: 200, y: 320 }, size: 140, rotation: 0, view: 'back', isLocked: true, isDynamic: true }
                    ],
                    logos: []
                }));
            } else {
                if (onCheckout) onCheckout();
            }
        }
    };

    // Helper to render visual preview for pattern buttons
    const renderPatternPreview = (type: PatternType) => {
        const color = 'currentColor';
        const opacity = 0.2;
        switch (type) {
            case 'stripes':
                return <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} 1px, transparent 0, transparent 8px)`, opacity }} />;
            case 'dots':
                return <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(${color} 1.5px, transparent 0)`, backgroundSize: '6px 6px', opacity }} />;
            case 'mesh':
                return <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(${color} 1px, transparent 0)`, backgroundSize: '3px 3px', opacity: opacity + 0.1 }} />;
            case 'geometric':
                return (
                    <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
                        <path d="M0 20 L20 0 L40 20 L20 40" stroke={color} fill="none" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                        <path d="M50 20 L70 0 L90 20 L70 40" stroke={color} fill="none" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    </svg>
                );
            case 'camo':
                return (
                    <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
                        <path d="M10 10 Q 20 0 30 10 T 50 20" stroke={color} fill="none" strokeWidth="2" />
                        <path d="M0 30 Q 20 20 40 30 T 80 20" stroke={color} fill="none" strokeWidth="2" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const renderTextControls = (element: any) => {
        const isFontOpen = activeIdentityControl === `${element.id}-font`;
        const isColorOpen = activeIdentityControl === `${element.id}-color`;
        const isOutlineOpen = activeIdentityControl === `${element.id}-outline`;
        const isExpanded = selectedItemId === element.id;

        const togglePopover = (type: 'font' | 'color' | 'outline') => {
            const key = `${element.id}-${type}`;
            if (activeIdentityControl === key) {
                setActiveIdentityControl(null);
            } else {
                setActiveIdentityControl(key);
            }
        };

        return (
            <div
                id={`control-${element.id}`}
                className={`p-3 bg-white dark:bg-white/5 rounded-lg border transition-all cursor-pointer relative group ${isExpanded ? 'border-brand-accent' : 'border-brand-border hover:border-brand-accent/50'
                    } ${(isFontOpen || isColorOpen || isOutlineOpen) ? 'z-[60]' : isExpanded ? 'z-50' : 'z-0'
                    }`}
                onClick={() => {
                    if (!isExpanded) {
                        setSelectedItemId(element.id);
                    }
                }}
            >
                {/* Compact Row - Always Visible */}
                <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex-shrink-0">
                        {element.id === 'frontTeam' ? 'Team Name' :
                            element.id === 'frontNumber' ? 'Front #' :
                                element.id === 'backName' ? 'Player Name' :
                                    element.id === 'backNumber' ? 'Back #' : 'Custom'}
                    </label>
                    <span className="text-sm text-neutral-900 dark:text-brand-white font-display uppercase truncate flex-1 text-right">
                        {element.text || '—'}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {!element.isLocked && (
                            <Tooltip content="Delete" position="bottom" variant="danger">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveText(element.id);
                                    }}
                                    className="text-neutral-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </Tooltip>
                        )}
                    </div>
                </div>

                {/* Expanded Controls - Only When Selected */}
                {isExpanded && (
                    <div className="mt-3 space-y-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        {/* Row 1: Text Input + Font Dropdown */}
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={element.text}
                                onChange={(e) => handleTextUpdate(element.id, 'text', e.target.value)}
                                className="flex-1 bg-neutral-50 dark:bg-brand-black border border-brand-border rounded p-2 text-neutral-900 dark:text-brand-white placeholder-neutral-600 focus:border-brand-accent focus:outline-none transition-colors font-display uppercase tracking-wider text-sm"
                                placeholder="ENTER TEXT"
                                maxLength={element.id.includes('Number') ? 3 : 20}
                            />

                            {/* Font Dropdown */}
                            <div className="relative w-32">
                                <button
                                    onClick={() => togglePopover('font')}
                                    className={`w-full p-2 rounded border text-xs text-left flex items-center justify-between transition-all ${isFontOpen ? 'border-brand-accent bg-brand-accent/10 text-brand-accent dark:text-brand-white' : 'border-brand-border text-neutral-500 dark:text-neutral-400 hover:border-neutral-500 hover:text-neutral-900 dark:hover:text-brand-white'}`}
                                >
                                    <span className="truncate text-[10px]">{FONTS.find(f => f.value === element.font)?.name || 'Font'}</span>
                                    {isFontOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>

                                {isFontOpen && (
                                    <div className="absolute top-full mt-2 left-0 w-full bg-brand-black border border-brand-border rounded-xl p-2 shadow-2xl z-[100] animate-fade-in-down max-h-[200px] overflow-y-auto no-scrollbar">
                                        <div className="flex flex-col gap-1">
                                            {FONTS.map(f => (
                                                <button
                                                    key={f.value}
                                                    onClick={() => {
                                                        handleTextUpdate(element.id, 'font', f.value);
                                                        setActiveIdentityControl(null);
                                                    }}
                                                    className={`text-left px-2 py-2 rounded text-[10px] uppercase hover:bg-brand-white/10 transition-colors ${element.font === f.value ? 'text-brand-accent' : 'text-neutral-400'}`}
                                                    style={{ fontFamily: f.value }}
                                                >
                                                    {f.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Toggle */}
                            <Tooltip content={element.isDynamic ? "Dynamic: Varies per player (Roster)" : "Static: Same on all jerseys"} position="left">
                                <button
                                    onClick={() => handleTextUpdate(element.id, 'isDynamic', !element.isDynamic)}
                                    className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all duration-200 ${element.isDynamic
                                        ? 'bg-brand-accent text-brand-black shadow-[0_0_15px_rgba(210,248,2,0.4)] scale-105'
                                        : 'bg-brand-black border border-brand-border text-neutral-500 hover:text-brand-white hover:border-brand-white/50'
                                        }`}
                                >
                                    {element.isDynamic ? <Users size={18} /> : <Type size={18} />}
                                </button>
                            </Tooltip>
                        </div>

                        {/* Row 2: Color Buttons + Rotation + Size */}
                        <div className="flex items-center gap-2">
                            {/* Color Button */}
                            <div className="relative flex-shrink-0">
                                <Tooltip content="Text Color">
                                    <button
                                        onClick={() => togglePopover('color')}
                                        className={`w-7 h-7 rounded-full border transition-all ${isColorOpen ? 'border-brand-accent scale-110' : 'border-brand-white/20 hover:border-brand-white'}`}
                                        style={{ backgroundColor: element.color }}
                                    />
                                </Tooltip>

                                {isColorOpen && (
                                    <div className="absolute top-full mt-2 left-0 bg-brand-black border border-brand-border rounded-xl p-3 shadow-2xl w-[200px] z-[100] animate-fade-in-down">
                                        <div className="grid grid-cols-5 gap-2">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c.hex}
                                                    onClick={() => {
                                                        handleTextUpdate(element.id, 'color', c.hex);
                                                        setActiveIdentityControl(null);
                                                    }}
                                                    className="w-6 h-6 rounded-full border border-transparent hover:border-brand-white transition-colors"
                                                    style={{ backgroundColor: c.hex }}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Outline Button */}
                            <div className="relative flex-shrink-0">
                                <Tooltip content="Outline" position="left">
                                    <button
                                        onClick={() => togglePopover('outline')}
                                        className={`w-7 h-7 rounded-full border-2 transition-all ${isOutlineOpen ? 'border-brand-accent scale-110' : 'border-brand-white/20 hover:border-brand-white'}`}
                                        style={{
                                            backgroundColor: 'transparent',
                                            borderColor: isOutlineOpen ? undefined : element.outline
                                        }}
                                    >
                                        <div className="w-full h-full rounded-full border border-brand-black/50" />
                                    </button>
                                </Tooltip>

                                {isOutlineOpen && (
                                    <div className="absolute top-full mt-2 left-0 bg-brand-black border border-brand-border rounded-xl p-3 shadow-2xl w-[200px] z-[100] animate-fade-in-down">
                                        <div className="grid grid-cols-5 gap-2 mb-3">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c.hex}
                                                    onClick={() => {
                                                        handleTextUpdate(element.id, 'outline', c.hex);
                                                        setActiveIdentityControl(null);
                                                    }}
                                                    className="w-6 h-6 rounded-full border-2 transition-colors hover:border-brand-white"
                                                    style={{ backgroundColor: c.hex, borderColor: 'transparent' }}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                        {/* Outline Width Slider */}
                                        <div className="pt-2 border-t border-brand-border">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-bold text-neutral-500 uppercase">Width</span>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    step="0.5"
                                                    value={element.outlineWidth}
                                                    onChange={(e) => handleTextUpdate(element.id, 'outlineWidth', parseFloat(e.target.value))}
                                                    className="flex-1 h-1 bg-brand-gray rounded-lg appearance-none cursor-pointer accent-brand-accent"
                                                />
                                                <span className="text-[8px] font-bold text-brand-white w-4 text-right">{element.outlineWidth}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rotation Slider */}
                            <div className="flex-1 flex items-center gap-1 min-w-0">
                                <span className="text-[7px] font-bold text-neutral-500 uppercase flex-shrink-0">Rot</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    step="1"
                                    value={element.rotation}
                                    onChange={(e) => handleTextUpdate(element.id, 'rotation', parseInt(e.target.value))}
                                    className="flex-1 h-1 bg-brand-gray rounded-lg appearance-none cursor-pointer accent-brand-accent min-w-0"
                                />
                                <span className="text-[7px] font-bold text-neutral-900 dark:text-brand-white w-5 text-right flex-shrink-0">{element.rotation}°</span>
                            </div>

                            {/* Size Slider */}
                            <div className="flex-1 flex items-center gap-1 min-w-0">
                                <span className="text-[7px] font-bold text-neutral-500 uppercase flex-shrink-0">Size</span>
                                <input
                                    type="range"
                                    min="12"
                                    max="200"
                                    step="2"
                                    value={element.size}
                                    onChange={(e) => handleTextUpdate(element.id, 'size', parseInt(e.target.value))}
                                    className="flex-1 h-1 bg-brand-gray rounded-lg appearance-none cursor-pointer accent-brand-accent min-w-0"
                                />
                                <span className="text-[7px] font-bold text-neutral-900 dark:text-brand-white w-5 text-right flex-shrink-0">{element.size}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Helper to render grouped text controls
    const renderGroupedTextControls = (elements: any[]) => {
        // Group elements by their style group
        const grouped: { [key: string]: any[] } = {};
        const ungrouped: any[] = [];

        elements.forEach(element => {
            const groupName = Object.keys(textStyleGroups).find(group =>
                textStyleGroups[group].includes(element.id)
            );

            if (groupName) {
                if (!grouped[groupName]) grouped[groupName] = [];
                grouped[groupName].push(element);
            } else {
                ungrouped.push(element);
            }
        });

        return (
            <>
                {Object.entries(grouped).map(([groupName, groupElements]) => (
                    <div key={groupName} className="space-y-2 p-2 border border-brand-border rounded-lg bg-neutral-100 dark:bg-neutral-900/30">
                        <div className="text-[8px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest px-1">
                            Linked: {groupName}
                        </div>
                        {groupElements.map(element => (
                            <div key={element.id}>
                                {renderTextControls(element)}
                            </div>
                        ))}
                    </div>
                ))}

                {/* Render ungrouped items */}
                {ungrouped.map(element => (
                    <div key={element.id}>
                        {renderTextControls(element)}
                    </div>
                ))}
            </>
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // SETUP
                return (
                    <div className="space-y-6 animate-fade-in pb-8">
                        {/* Gender Selection - Segmented Control Style */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Gender</h3>
                            <div className="flex bg-neutral-100 dark:bg-white/5 p-1 rounded-xl border border-brand-border">
                                {availableCuts.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setDesign(d => ({ ...d, cut: c }))}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${design.cut === c
                                            ? 'bg-brand-accent text-neutral-900 shadow-sm'
                                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-brand-white'
                                            }`}
                                    >
                                        {c === 'mens' ? 'Men' : 'Women'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sport Selection */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Sport</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {availableSports.map((s) => {
                                    const Icon = SPORT_ICONS[s.id] || FaRunning;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => setDesign(d => ({
                                                ...d,
                                                sport: s.id,
                                                cut: Object.keys(s.cuts)[0],
                                                template: s.templates[0].id
                                            }))}
                                            className={`relative p-3 rounded-lg border-2 transition-all flex items-center gap-2.5 ${design.sport === s.id
                                                ? 'border-brand-accent bg-brand-accent/10 text-neutral-900 dark:text-brand-accent scale-[1.02]'
                                                : 'border-brand-border bg-white/5 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:border-brand-accent/50 hover:bg-brand-accent/5'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5 flex-shrink-0" />
                                            <span className="block font-medium text-xs uppercase tracking-wide flex-1 text-left">{s.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Garment Type Selection */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Garment Type</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setDesign(d => ({ ...d, garmentType: 'jersey' }))}
                                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${design.garmentType === 'jersey'
                                        ? 'border-brand-accent bg-brand-accent/10 scale-[1.02]'
                                        : 'border-brand-border bg-white/5 dark:bg-white/5 hover:border-brand-accent/50 hover:bg-brand-accent/5'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`font-semibold text-sm ${design.garmentType === 'jersey' ? 'text-neutral-900 dark:text-brand-accent' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                            Jersey
                                        </span>
                                        <span className={`text-xs font-bold ${design.garmentType === 'jersey' ? 'text-neutral-900 dark:text-brand-accent' : 'text-neutral-600 dark:text-neutral-400'}`}>
                                            $65+
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                        Fully customizable jersey with team name, player numbers, and unlimited design options
                                    </p>
                                </button>

                                <button
                                    onClick={() => setDesign(d => ({ ...d, garmentType: 'shorts' }))}
                                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${design.garmentType === 'shorts'
                                        ? 'border-brand-accent bg-brand-accent/10 scale-[1.02]'
                                        : 'border-brand-border bg-white/5 dark:bg-white/5 hover:border-brand-accent/50 hover:bg-brand-accent/5'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`font-semibold text-sm ${design.garmentType === 'shorts' ? 'text-neutral-900 dark:text-brand-accent' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                            Shorts
                                        </span>
                                        <span className={`text-xs font-bold ${design.garmentType === 'shorts' ? 'text-neutral-900 dark:text-brand-accent' : 'text-neutral-600 dark:text-neutral-400'}`}>
                                            $45+
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                        Matching athletic shorts with custom colors and patterns to complete your uniform
                                    </p>
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 2: // DESIGN (Templates)
                return (
                    <div className="space-y-6 animate-fade-in pb-8">
                        <div className="space-y-4">
                            <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-widest">
                                {design.garmentType === 'shorts' ? 'Shorts Layout' : 'Jersey Layout'}
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {sportDef.templates.map((t) => {
                                    // Generate preview colors from palette
                                    const previewColors = recentColors.length >= 2
                                        ? [recentColors[0], recentColors[1]]
                                        : ['#ffffff', '#0a0a0a'];

                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setDesign(d => ({ ...d, template: t.id }))}
                                            className={`p-2 rounded-lg border flex flex-col items-center gap-2 transition-all ${design.template === t.id
                                                ? 'border-brand-accent bg-gradient-to-br from-brand-accent/20 to-brand-accent/5 text-brand-white shadow-sm'
                                                : 'border-brand-border bg-gradient-to-br from-brand-gray/30 to-brand-gray/10 text-neutral-500 hover:border-neutral-500 hover:text-brand-white hover:from-brand-gray/40 hover:to-brand-gray/20'
                                                }`}
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-full aspect-[4/5] rounded border border-brand-border overflow-hidden bg-brand-black/50 relative pointer-events-none">
                                                <Thumbnail
                                                    id={t.id}
                                                    sport={design.sport}
                                                    cut={design.cut}
                                                    template={t.id}
                                                    colors={previewColors}
                                                    garmentType={design.garmentType || 'jersey'}
                                                />
                                                {/* Active Indicator */}
                                                {/* Active Indicator */}
                                                {design.template === t.id && (
                                                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-accent shadow-lg" />
                                                )}
                                            </div>

                                            {/* Label */}
                                            <span className="font-bold uppercase text-[9px] text-center leading-tight">{t.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <p className="text-xs text-neutral-500 italic">
                            *Layouts define the color zones available in the next step.
                        </p>
                    </div>
                );

            case 3: // COLORS (Refactored with Accordion)
                return (
                    <div className="space-y-6 animate-fade-in flex flex-col pb-8">

                        {/* RECENT COLORS PALETTE (Always Visible) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                                    <History size={10} /> Project Palette
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowVariationsModal(true)}
                                        className="flex items-center gap-1 text-[9px] font-bold uppercase text-brand-accent hover:text-white transition-colors"
                                    >
                                        <Dices size={12} /> Variations
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                                {recentColors.map((c, i) => (
                                    <div key={`${c}-${i}`} className="relative shrink-0 group">
                                        <button
                                            onClick={() => applyColor(c, 'base')}
                                            className="relative w-8 h-8 rounded-md border border-brand-border shadow-sm hover:border-brand-white hover:shadow-lg hover:z-10 transition-all"
                                            style={{ backgroundColor: c }}
                                            title="Apply to Base Layer"
                                        />
                                        {/* Remove button - appears on hover */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setRecentColors(prev => prev.filter((_, idx) => idx !== i));
                                            }}
                                            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                                            title="Remove from palette"
                                        >
                                            <X size={8} className="text-white" strokeWidth={3} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Accordion: Base Layer */}
                        <div className="border border-brand-border rounded overflow-hidden bg-brand-gray/30">
                            <button
                                onClick={() => setActivePaintSection(activePaintSection === 'base' ? 'pattern' : 'base')}
                                className="w-full flex items-center justify-between p-4 bg-brand-gray hover:bg-brand-gray/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border border-brand-border shadow-sm" style={{ backgroundColor: design.zones[activeZoneId]?.color || '#fff' }} />
                                    <span className="text-xs font-bold uppercase tracking-widest text-brand-white">Base Layer</span>
                                </div>
                                {activePaintSection === 'base' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {activePaintSection === 'base' && (
                                <div className="p-4 border-t border-brand-border animate-fade-in">
                                    {/* GRID COLS 6 (18 colors / 6 = 3 rows perfectly) */}
                                    <div className="grid grid-cols-6 gap-2">
                                        {COLORS.map(c => (
                                            <Tooltip key={c.hex} content={c.name}>
                                                <button
                                                    onClick={() => applyColor(c.hex, 'base')}
                                                    className={`w-10 h-10 rounded-full border-2 transition-colors hover:border-brand-white ${design.zones[activeZoneId]?.color === c.hex ? 'border-brand-white shadow-lg' : 'border-transparent'}`}
                                                    style={{ backgroundColor: c.hex }}
                                                />
                                            </Tooltip>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Accordion: Pattern Overlay */}
                        <div className="border border-brand-border rounded overflow-hidden bg-brand-gray/30">
                            <button
                                onClick={() => setActivePaintSection(activePaintSection === 'pattern' ? 'base' : 'pattern')}
                                className="w-full flex items-center justify-between p-4 bg-brand-gray hover:bg-brand-gray/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {design.zones[activeZoneId]?.pattern && design.zones[activeZoneId]?.pattern !== 'none' ? (
                                        <div className="w-4 h-4 rounded-sm border border-brand-border bg-brand-gray flex items-center justify-center">
                                            <div className="w-2 h-2 bg-brand-accent rounded-full" />
                                        </div>
                                    ) : (
                                        <div className="w-4 h-4 rounded-sm border border-brand-border bg-transparent opacity-50" />
                                    )}
                                    <span className="text-xs font-bold uppercase tracking-widest text-brand-white">Pattern Overlay</span>
                                </div>
                                {activePaintSection === 'pattern' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {activePaintSection === 'pattern' && (
                                <div className="p-4 border-t border-brand-border animate-fade-in space-y-6">
                                    {/* Pattern Style Grid */}
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['none', 'stripes', 'dots', 'mesh', 'camo', 'geometric'] as PatternType[]).map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => updateZone(activeZoneId, { pattern: p })}
                                                    className={`relative h-12 rounded border overflow-hidden flex items-center justify-center transition-all group ${design.zones[activeZoneId]?.pattern === p ? 'border-brand-accent text-brand-accent bg-brand-accent/5' : 'border-brand-border text-neutral-500 hover:border-neutral-500 hover:text-brand-white'}`}
                                                >
                                                    {/* Pattern Preview Layer */}
                                                    {renderPatternPreview(p)}

                                                    {/* Text Label */}
                                                    <span className="relative z-10 text-[10px] font-bold uppercase">{p}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* MODE TOGGLE & COLORS */}
                                    {design.zones[activeZoneId]?.pattern !== 'none' && (
                                        <div className="space-y-4 pt-4 border-t border-brand-border">
                                            {/* Mode Toggle */}
                                            <div className="flex bg-brand-black rounded p-1 border border-brand-border">
                                                <button
                                                    onClick={() => updateZone(activeZoneId, { patternMode: 'ghost' })}
                                                    className={`flex-1 py-2 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${design.zones[activeZoneId]?.patternMode === 'ghost' ? 'bg-brand-gray text-brand-white shadow-sm' : 'text-neutral-500 hover:text-brand-white'}`}
                                                >
                                                    <Ghost size={12} /> Ghosted
                                                </button>
                                                <button
                                                    onClick={() => updateZone(activeZoneId, { patternMode: 'custom' })}
                                                    className={`flex-1 py-2 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${design.zones[activeZoneId]?.patternMode === 'custom' ? 'bg-brand-gray text-brand-white shadow-sm' : 'text-neutral-500 hover:text-brand-white'}`}
                                                >
                                                    <Droplets size={12} /> Custom Color
                                                </button>
                                            </div>

                                            {/* Conditional Color Grid - GRID COLS 6 */}
                                            {design.zones[activeZoneId]?.patternMode === 'custom' && (
                                                <div className="animate-fade-in">
                                                    <label className="text-[10px] font-bold text-neutral-500 uppercase mb-2 block">Pattern Color</label>
                                                    <div className="grid grid-cols-6 gap-2">
                                                        {COLORS.map(c => (
                                                            <Tooltip key={c.hex} content={c.name}>
                                                                <button
                                                                    onClick={() => applyColor(c.hex, 'pattern')}
                                                                    className={`w-8 h-8 rounded-full border-2 transition-colors hover:border-brand-white ${design.zones[activeZoneId]?.patternColor === c.hex ? 'border-brand-white' : 'border-transparent'}`}
                                                                    style={{ backgroundColor: c.hex }}
                                                                />
                                                            </Tooltip>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 4: // IDENTITY
                return (
                    <div className="space-y-6 animate-fade-in pb-8">
                        {/* Identity Tabs */}
                        <div className="flex bg-brand-gray p-1 rounded border border-brand-border">
                            {(['team', 'player'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveIdentitySection(tab)}
                                    className={`flex-1 py-2 rounded text-[10px] font-bold uppercase transition-all ${activeIdentitySection === tab ? 'bg-brand-accent text-black shadow-sm' : 'text-neutral-500 hover:text-brand-white'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* TEAM NAME SECTION */}
                        {activeIdentitySection === 'team' && (
                            <div className="space-y-6 animate-fade-in">
                                {renderGroupedTextControls(
                                    design.textElements.filter(t => t.view === 'front' && t.id !== 'frontNumber')
                                )}

                                <button
                                    onClick={() => handleAddText('front')}
                                    className="w-full py-3 border border-dashed border-brand-border rounded text-xs font-bold uppercase text-neutral-500 hover:text-brand-white hover:border-brand-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> Add Text to Front
                                </button>

                                {/* Logo Upload */}
                                <div className="space-y-3 pt-4 border-t border-brand-border">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Team Logos</label>

                                    {/* Upload Buttons with Drag & Drop */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, 'front')}
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = (e) => handleLogoUpload(e as any, 'front');
                                                input.click();
                                            }}
                                            className="px-3 py-2 bg-brand-white text-brand-black text-xs font-bold uppercase tracking-wider rounded hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-transparent hover:border-brand-accent"
                                        >
                                            <Plus size={12} />
                                            Front
                                        </div>
                                        <div
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, 'back')}
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = (e) => handleLogoUpload(e as any, 'back');
                                                input.click();
                                            }}
                                            className="px-3 py-2 bg-brand-white text-brand-black text-xs font-bold uppercase tracking-wider rounded hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-transparent hover:border-brand-accent"
                                        >
                                            <Plus size={12} />
                                            Back
                                        </div>
                                    </div>

                                    {/* Logo List */}
                                    {design.logos.length > 0 && (
                                        <div className="space-y-2">
                                            {design.logos.map((logo) => (
                                                <div key={logo.id} id={`control-${logo.id}`} className="flex items-center gap-3 p-3 bg-brand-black/30 rounded-lg border border-brand-border group">
                                                    <div className="w-10 h-10 rounded border border-brand-border bg-brand-black flex items-center justify-center overflow-hidden">
                                                        <img src={logo.url} alt="Logo" className="w-full h-full object-contain p-1" />
                                                    </div>
                                                    <div className="flex-1 text-xs">
                                                        <div className="text-brand-white font-semibold">{logo.view === 'front' ? 'Front' : 'Back'}</div>
                                                        <div className="text-neutral-500 text-[10px]">Size: {logo.size}px</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleLogoMirror(logo.id)}
                                                        className={`transition-colors ${design.logos.find(l => l.mirroredFrom === logo.id) ? 'text-brand-accent' : 'text-neutral-500 hover:text-brand-accent'}`}
                                                        title={design.logos.find(l => l.mirroredFrom === logo.id) ? "Remove Mirror" : "Mirror Logo"}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M12 2v20" />
                                                            <path d="M17 7l-5-5-5 5" />
                                                            <path d="M7 17l5 5 5-5" />
                                                            <circle cx="6" cy="12" r="2" />
                                                            <circle cx="18" cy="12" r="2" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleLogoRemove(logo.id)}
                                                        className="text-neutral-500 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PLAYER INFO SECTION */}
                        {activeIdentitySection === 'player' && (
                            <div className="space-y-6 animate-fade-in">
                                {renderGroupedTextControls(
                                    design.textElements.filter(t => ['frontNumber', 'backName', 'backNumber'].includes(t.id) || (t.view === 'back' && !['frontTeam', 'frontNumber', 'backName', 'backNumber'].includes(t.id)))
                                )}
                                <button
                                    onClick={() => handleAddText('back')}
                                    className="w-full py-3 border border-dashed border-brand-border rounded text-xs font-bold uppercase text-neutral-500 hover:text-brand-white hover:border-brand-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> Add Text to Back
                                </button>
                            </div>
                        )}
                    </div>
                );

            default: return null;
        }
    };

    // Scroll to selected item's control in the right panel
    useEffect(() => {
        if (selectedItemId) {
            const element = document.getElementById(`control-${selectedItemId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else if (activeZoneId && currentStep === 3) {
            const element = document.getElementById(`control-${activeZoneId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [selectedItemId, activeZoneId, currentStep]);

    return (
        <div id="builder" className="h-full w-full bg-brand-black text-white flex flex-col overflow-hidden">
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black backdrop-blur-md" onClick={() => setShowSuccessModal(false)} />
                    <div className="bg-brand-gray border border-brand-border rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag size={32} className="text-brand-accent" />
                            </div>
                            <h3 className="font-display text-3xl text-brand-white italic uppercase mb-2">Added to Bag</h3>
                            <p className="text-neutral-400 text-sm mb-8">Your design has been saved. What would you like to do next?</p>

                            <div className="grid grid-cols-1 gap-3 w-full">
                                <button
                                    onClick={() => confirmAdd('add_another')}
                                    className="w-full py-4 bg-brand-white/5 hover:bg-brand-white hover:text-brand-black text-brand-white font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2 border border-brand-border"
                                >
                                    <Plus size={16} /> Add Another Design
                                </button>
                                <button
                                    onClick={() => confirmAdd('checkout')}
                                    className="w-full py-4 bg-brand-accent hover:bg-brand-accent/90 text-brand-black font-bold uppercase tracking-widest rounded-xl transition-colors shadow-[0_0_20px_rgba(210,248,2,0.3)] flex items-center justify-center gap-2"
                                >
                                    Checkout <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Variations Modal */}
            {showVariationsModal && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div
                        className="absolute inset-0 bg-black backdrop-blur-md animate-fade-in"
                        onClick={() => setShowVariationsModal(false)}
                    />
                    <div className="bg-brand-gray border border-brand-border rounded-3xl p-6 w-full max-w-2xl relative z-10 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-display text-2xl text-brand-white italic uppercase">Design Variations</h3>
                                <p className="text-xs text-neutral-500">Generated from your project palette</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setVariationSeed(prev => prev + 1)}
                                    className="p-2 rounded-lg bg-white/5 border border-brand-border hover:border-brand-accent hover:bg-brand-accent/10 text-neutral-400 hover:text-brand-accent transition-all"
                                    title="Refresh variations"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                                    </svg>
                                </button>
                                <button onClick={() => setShowVariationsModal(false)} className="text-neutral-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Project Palette Section */}
                        {recentColors.length > 0 && (
                            <div className="mb-6 p-4 bg-white/5 dark:bg-white/5 rounded-xl border border-brand-border">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Project Palette</h4>
                                    <span className="text-[9px] text-neutral-500">{recentColors.length} color{recentColors.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {recentColors.map((color, index) => (
                                        <div key={`${color}-${index}`} className="relative group">
                                            <div
                                                className="w-10 h-10 rounded-lg border-2 border-brand-border hover:border-brand-accent transition-all shadow-sm"
                                                style={{ backgroundColor: color }}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRecentColors(prev => prev.filter((_, i) => i !== index));
                                                }}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                                title="Remove from palette"
                                            >
                                                <X size={12} className="text-white" strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Add Color Button */}
                                    <div className="relative group">
                                        <button
                                            onClick={() => setShowAddColorPopover(!showAddColorPopover)}
                                            className="w-10 h-10 rounded-lg border-2 border-dashed border-brand-border hover:border-brand-accent transition-all shadow-sm bg-white/5 flex items-center justify-center cursor-pointer group-hover:bg-brand-accent/10"
                                            title="Add color to palette"
                                        >
                                            <Plus size={20} className="text-neutral-500 group-hover:text-brand-accent transition-colors" />
                                        </button>

                                        {/* Color Picker Popover */}
                                        {showAddColorPopover && (
                                            <div className="absolute top-full mt-2 left-0 bg-brand-black border border-brand-border rounded-xl p-3 shadow-2xl w-[200px] z-[100] animate-fade-in-down">
                                                <div className="grid grid-cols-5 gap-2">
                                                    {COLORS.map(c => (
                                                        <button
                                                            key={c.hex}
                                                            onClick={() => {
                                                                setRecentColors(prev => {
                                                                    if (!prev.includes(c.hex)) {
                                                                        return [...prev, c.hex];
                                                                    }
                                                                    return prev;
                                                                });
                                                                setShowAddColorPopover(false);
                                                            }}
                                                            className="w-6 h-6 rounded-full border border-transparent hover:border-brand-white transition-colors"
                                                            style={{ backgroundColor: c.hex }}
                                                            title={c.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {generateVariations().map((variation, i) => (
                                <button
                                    key={i}
                                    onClick={() => applyVariation(variation)}
                                    className="group relative aspect-[4/5] bg-brand-black rounded-xl border border-brand-border hover:border-brand-accent overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="absolute inset-0 p-4">
                                        <JerseySVG
                                            design={{
                                                ...design,
                                                template: variation.template,
                                                zones: { ...design.zones, ...variation.zones }
                                            }}
                                            view="front"
                                            id={`variation-${i}`}
                                        />
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end h-1/2">
                                        <span className="text-[10px] font-bold uppercase text-brand-accent mb-1">{variation.template}</span>
                                        <span className="text-xs font-bold uppercase text-brand-black bg-brand-accent px-3 py-1.5 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">Apply Style</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Spacer for Fixed Navbar - Keeps content perfectly strictly inside viewport */}
            <div className="h-20 shrink-0" />

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Shared Background for Continuity */}
                {/* Dark Mode Background */}
                <div
                    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out opacity-100`}
                    style={{
                        background: `radial-gradient(circle at 35% 50%, ${design.zones.body?.color || '#333'} 0%, #171717 70%)`
                    }}
                />

                {/* Light Mode Background */}
                <div
                    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        background: `radial-gradient(circle at 35% 50%, #f5f5f5 0%, #e5e5e5 100%)`
                    }}
                />

                {/* Texture Overlay */}
                <div className={`absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] transition-opacity duration-700 ease-in-out z-0 pointer-events-none ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] transition-opacity duration-700 ease-in-out z-0 pointer-events-none invert ${theme === 'light' ? 'opacity-30' : 'opacity-0'}`} />

                {/* Left Panel: Preview */}
                <div className="flex-1 bg-transparent flex flex-col relative overflow-hidden group">

                    {/* Jersey Container - Centered, Scale In Animation */}
                    <div className="flex-1 flex items-center justify-center w-full p-6 lg:p-12 z-10 max-h-full opacity-0 animate-scale-in" style={{ animationDelay: '100ms' }}>
                        {/* Enforce aspect ratio to prevent 'too tall' look */}
                        <div className="w-full h-full max-h-[90%] aspect-[4/5] transition-all duration-500 flex items-center justify-center" onClick={() => { setSelectedItemId(null); setActivePopover(null); }}>
                            <div onClick={(e) => e.stopPropagation()} className="w-full h-full">
                                <JerseySVG
                                    design={design}
                                    view={view}
                                    onPositionChange={handlePositionChange}
                                    onSelect={handleSelection}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Exit Builder - Bottom Left */}
                    <div className="absolute bottom-6 left-6 z-20 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-4 py-2 rounded-full bg-brand-gray/80 backdrop-blur border border-brand-border text-brand-white hover:bg-brand-white hover:text-brand-black transition-colors shadow-xl group flex items-center gap-2"
                        >
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-wider">Exit Builder</span>
                        </button>
                    </div>

                    {/* View Toggles - Bottom Center of Left Panel */}
                    <div className="absolute bottom-6 right-6 z-20 bg-brand-gray/80 backdrop-blur rounded-full p-1 border border-brand-border shadow-xl opacity-0 animate-fade-in-up flex" style={{ animationDelay: '350ms' }}>
                        {/* Sliding Background */}
                        <div
                            className={`absolute top-1 bottom-1 left-1 w-[calc(33.333%-4px)] bg-brand-white rounded-full transition-transform duration-300 ease-out shadow-sm ${view === 'front' ? 'translate-x-0' :
                                view === 'both' ? 'translate-x-[calc(100%+4px)]' :
                                    'translate-x-[calc(200%+8px)]'
                                }`}
                        />

                        <button
                            onClick={() => setView('front')}
                            className={`relative z-10 px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-colors duration-300 w-20 text-center ${view === 'front' ? 'text-brand-black' : 'text-neutral-400 hover:text-brand-white'}`}
                        >
                            FRONT
                        </button>
                        <button
                            onClick={() => setView('both')}
                            className={`relative z-10 px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-colors duration-300 w-20 text-center ${view === 'both' ? 'text-brand-black' : 'text-neutral-400 hover:text-brand-white'}`}
                        >
                            BOTH
                        </button>
                        <button
                            onClick={() => setView('back')}
                            className={`relative z-10 px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-colors duration-300 w-20 text-center ${view === 'back' ? 'text-brand-black' : 'text-neutral-400 hover:text-brand-white'}`}
                        >
                            BACK
                        </button>
                    </div>

                    {/* Product Info - Top Left, slide down animation */}
                    <div className="absolute top-6 left-6 z-20 text-left pointer-events-none select-none opacity-0 animate-fade-in-down" style={{ animationDelay: '200ms' }}>
                        <h2 className={`font-display text-4xl italic uppercase drop-shadow-lg ${theme === 'light' ? 'text-neutral-800' : 'text-white'}`}>{sportDef.label}</h2>
                        <p className="text-brand-accent font-bold uppercase tracking-widest text-xs">{currentTemplate.label} Series / {design.cut}</p>
                    </div>

                    {/* Theme Toggle - Top Right */}
                    <div className="absolute top-6 right-6 z-20 opacity-0 animate-fade-in-down" style={{ animationDelay: '250ms' }}>
                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-full bg-brand-gray/80 backdrop-blur border border-brand-border text-brand-white hover:bg-brand-white hover:text-brand-black transition-colors shadow-xl group"
                            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {theme === 'dark' ? <Sun size={18} className="group-hover:rotate-90 transition-transform" /> : <Moon size={18} className="group-hover:-rotate-12 transition-transform" />}
                        </button>
                    </div>

                    {/* Floating Edit Menu - Single Row & Compact */}
                    {selectedItemId && (
                        <div
                            className="absolute top-6 left-1/2 -translate-x-1/2 z-50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-brand-black border border-brand-border rounded-full px-4 py-2 shadow-2xl flex items-center gap-4 animate-fade-in-down">
                                <span className="text-[10px] font-bold uppercase text-brand-accent tracking-widest whitespace-nowrap border-r border-brand-border pr-3">
                                    {selectedItemId.replace(/([A-Z])/g, ' $1').trim()}
                                </span>

                                {/* Render Logo Controls if it's a logo item */}
                                {selectedItemId.startsWith('logo-') ? (
                                    <>
                                        {/* Logo Size Slider */}
                                        <Tooltip content="Logo Size" position="bottom">
                                            <div className="flex items-center gap-2 w-32">
                                                <span className="text-[8px] font-bold text-neutral-500">S</span>
                                                <input
                                                    type="range"
                                                    min="20"
                                                    max="120"
                                                    value={design.logos.find(l => l.id === selectedItemId)?.size || 40}
                                                    onChange={(e) => handleLogoUpdate(selectedItemId, 'size', parseInt(e.target.value))}
                                                    className="w-full h-1 bg-brand-gray rounded-lg appearance-none cursor-pointer accent-brand-accent"
                                                />
                                                <span className="text-[8px] font-bold text-white">L</span>
                                            </div>
                                        </Tooltip>

                                        {/* Logo Rotation Slider */}
                                        <Tooltip content="Rotation" position="bottom">
                                            <div className="flex items-center gap-2 w-32">
                                                <span className="text-[8px] font-bold text-neutral-500">-180°</span>
                                                <input
                                                    type="range"
                                                    min="-180"
                                                    max="180"
                                                    value={design.logos.find(l => l.id === selectedItemId)?.rotation || 0}
                                                    onChange={(e) => handleLogoUpdate(selectedItemId, 'rotation', parseInt(e.target.value))}
                                                    className="w-full h-1 bg-brand-gray rounded-lg appearance-none cursor-pointer accent-brand-accent"
                                                />
                                                <span className="text-[8px] font-bold text-white">+180°</span>
                                            </div>
                                        </Tooltip>

                                        {/* Mirror Logo Button */}
                                        <Tooltip content={design.logos.find(l => l.mirroredFrom === selectedItemId) ? "Remove Mirror" : "Mirror Logo"} position="bottom">
                                            <button
                                                onClick={() => handleLogoMirror(selectedItemId)}
                                                className={`transition-colors ${design.logos.find(l => l.mirroredFrom === selectedItemId) ? 'text-brand-accent' : 'text-neutral-400 hover:text-brand-accent'}`}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 2v20" />
                                                    <path d="M17 7l-5-5-5 5" />
                                                    <path d="M7 17l5 5 5-5" />
                                                    <circle cx="6" cy="12" r="2" />
                                                    <circle cx="18" cy="12" r="2" />
                                                </svg>
                                            </button>
                                        </Tooltip>

                                        {/* Remove Logo Button */}
                                        <Tooltip content="Remove Logo" position="bottom">
                                            <button
                                                onClick={() => {
                                                    handleLogoRemove(selectedItemId);
                                                    setSelectedItemId(null);
                                                }}
                                                className="text-neutral-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </Tooltip>
                                    </>
                                ) : ['frontTeam', 'frontNumber', 'backName', 'backNumber'].includes(selectedItemId) ? (
                                    <>
                                        {/* Font Family - Custom Dropdown */}
                                        <Tooltip content="Font Family" position="bottom">
                                            <div className="relative">
                                                <button
                                                    // @ts-ignore
                                                    // @ts-ignore
                                                    onClick={() => setActivePopover(activePopover === 'font' ? null : 'font')}
                                                    className="text-[10px] font-bold text-white hover:text-brand-accent uppercase w-16 text-center truncate"
                                                    // @ts-ignore
                                                    style={{ fontFamily: design.textElements.find(t => t.id === selectedItemId)?.font }}
                                                >
                                                    {/* @ts-ignore */}
                                                    {FONTS.find(f => f.value === design.textElements.find(t => t.id === selectedItemId)?.font)?.name.split(' ')[0] || 'Font'}
                                                </button>

                                                {/* Font Popover */}
                                                {activePopover === 'font' && (
                                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-brand-black border border-brand-border rounded-xl p-2 shadow-2xl w-[140px] z-50 animate-fade-in-down max-h-[200px] overflow-y-auto no-scrollbar">
                                                        <div className="flex flex-col gap-1">
                                                            {FONTS.map(f => (
                                                                <button
                                                                    key={f.value}
                                                                    onClick={() => {
                                                                        handleTextUpdate(selectedItemId, 'font', f.value);
                                                                        setActivePopover(null);
                                                                    }}
                                                                    className={`text-left px-2 py-2 rounded text-[10px] uppercase hover:bg-brand-white/10 transition-colors ${design.textElements.find(t => t.id === selectedItemId)?.font === f.value ? 'text-brand-accent' : 'text-neutral-400'}`}
                                                                    style={{ fontFamily: f.value }}
                                                                >
                                                                    {f.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Tooltip>

                                        {/* Font Size Slider - Horizontal */}
                                        <Tooltip content="Font Size" position="bottom">
                                            <div className="flex items-center gap-2 w-24">
                                                <span className="text-[8px] font-bold text-neutral-500">AA</span>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="200"
                                                    // @ts-ignore
                                                    value={design.textElements.find(t => t.id === selectedItemId)?.size}
                                                    onChange={(e) => handleTextUpdate(selectedItemId, 'size', parseInt(e.target.value))}
                                                    className="w-full h-1 bg-brand-gray rounded-lg appearance-none cursor-pointer accent-brand-accent"
                                                />
                                                <span className="text-[8px] font-bold text-white">AA</span>
                                            </div>
                                        </Tooltip>

                                        {/* Color Triggers */}
                                        <div className="flex items-center gap-2 border-l border-brand-border pl-3 relative">
                                            {/* Fill Color Trigger */}
                                            <Tooltip content="Text Color" position="bottom">
                                                <button
                                                    onClick={() => setActivePopover(activePopover === 'color' ? null : 'color')}
                                                    className={`w-6 h-6 rounded-full border transition-all ${activePopover === 'color' ? 'border-brand-accent scale-110' : 'border-brand-white/20 hover:border-brand-white'}`}
                                                    // @ts-ignore
                                                    style={{ backgroundColor: design.textElements.find(t => t.id === selectedItemId)?.color }}
                                                />
                                            </Tooltip>

                                            {/* Outline Color Trigger */}
                                            <Tooltip content="Outline Color" position="bottom">
                                                <button
                                                    onClick={() => setActivePopover(activePopover === 'outline' ? null : 'outline')}
                                                    className={`w-6 h-6 rounded-full border-2 transition-all ${activePopover === 'outline' ? 'border-brand-accent scale-110' : 'border-brand-white/20 hover:border-brand-white'}`}
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        // @ts-ignore
                                                        borderColor: activePopover === 'outline' ? undefined : design.textElements.find(t => t.id === selectedItemId)?.outline
                                                    }}
                                                >
                                                    <div className="w-full h-full rounded-full border border-brand-black/50" style={{ backgroundColor: 'transparent' }} />
                                                </button>
                                            </Tooltip>

                                            {/* Color Picker Popover */}
                                            {activePopover && (activePopover === 'color' || activePopover === 'outline') && (
                                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-brand-black border border-brand-border rounded-xl p-3 shadow-2xl w-[200px] z-50 animate-fade-in-down">
                                                    <div className="grid grid-cols-5 gap-2">
                                                        {COLORS.map(c => (
                                                            <button
                                                                key={c.hex}
                                                                onClick={() => {
                                                                    handleTextUpdate(selectedItemId, activePopover === 'color' ? 'color' : 'outline', c.hex);
                                                                    setActivePopover(null);
                                                                }}
                                                                className="w-6 h-6 rounded-full border border-transparent transition-transform hover:border-brand-white"
                                                                style={{ backgroundColor: c.hex }}
                                                                title={c.name}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-brand-border text-center">
                                                        <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest">
                                                            Select {activePopover} Color
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    /* Render Zone Controls if it's a zone item */
                                    <>
                                        {/* Base Color Trigger */}
                                        <Tooltip content="Base Color" position="bottom">
                                            <div className="flex items-center gap-2 relative">
                                                <span className="text-[8px] font-bold text-neutral-500 uppercase">Base</span>
                                                <button
                                                    onClick={() => setActivePopover(activePopover === 'base' ? null : 'base')}
                                                    className={`w-6 h-6 rounded-full border transition-all ${activePopover === 'base' ? 'border-brand-accent scale-110' : 'border-brand-white/20 hover:border-brand-white'}`}
                                                    style={{ backgroundColor: design.zones[selectedItemId]?.color || '#ffffff' }}
                                                />
                                            </div>
                                        </Tooltip>

                                        {/* Pattern Dropdown */}
                                        <Tooltip content="Pattern Type" position="bottom">
                                            <div className="flex items-center gap-2 border-l border-brand-border pl-3 relative">
                                                <button
                                                    onClick={() => setActivePopover(activePopover === 'patternType' ? null : 'patternType')}
                                                    className="text-[10px] font-bold text-white hover:text-brand-accent uppercase w-20 text-center truncate"
                                                >
                                                    {design.zones[selectedItemId]?.pattern || 'Solid'}
                                                </button>

                                                {/* Pattern Popover */}
                                                {activePopover === 'patternType' && (
                                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-brand-black border border-brand-border rounded-xl p-2 shadow-2xl w-[140px] z-50 animate-fade-in-down">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {['none', 'stripes', 'dots', 'mesh', 'camo', 'geometric'].map(p => (
                                                                <button
                                                                    key={p}
                                                                    onClick={() => {
                                                                        handleZoneUpdate(selectedItemId, 'pattern', p);
                                                                        setActivePopover(null);
                                                                    }}
                                                                    className={`flex flex-col items-center gap-1 p-1 rounded border ${design.zones[selectedItemId]?.pattern === p ? 'border-brand-accent bg-brand-accent/10' : 'border-transparent hover:border-brand-white/20'}`}
                                                                >
                                                                    <div className="w-8 h-8 rounded bg-neutral-800 relative overflow-hidden">
                                                                        {/* @ts-ignore */}
                                                                        {p !== 'none' && renderPatternPreview(p)}
                                                                    </div>
                                                                    <span className="text-[8px] uppercase font-bold text-neutral-400">{p === 'none' ? 'Solid' : p}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Tooltip>

                                        {/* Pattern Color Trigger (only if pattern is not none) */}
                                        {design.zones[selectedItemId]?.pattern && design.zones[selectedItemId]?.pattern !== 'none' && (
                                            <Tooltip content="Pattern Color" position="bottom">
                                                <div className="flex items-center gap-2 border-l border-brand-border pl-3 relative">
                                                    <span className="text-[8px] font-bold text-neutral-500 uppercase">Pattern</span>
                                                    <button
                                                        onClick={() => setActivePopover(activePopover === 'pattern' ? null : 'pattern')}
                                                        className={`w-6 h-6 rounded-full border transition-all ${activePopover === 'pattern' ? 'border-brand-accent scale-110' : 'border-brand-white/20 hover:border-brand-white'}`}
                                                        style={{ backgroundColor: design.zones[selectedItemId]?.patternColor || '#000000' }}
                                                    />
                                                </div>
                                            </Tooltip>
                                        )}

                                        {/* Zone Color Picker Popover */}
                                        {activePopover && (activePopover === 'base' || activePopover === 'pattern') && (
                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-brand-black border border-brand-border rounded-xl p-3 shadow-2xl w-[200px] z-50 animate-fade-in-down">
                                                <div className="grid grid-cols-5 gap-2">
                                                    {COLORS.map(c => (
                                                        <button
                                                            key={c.hex}
                                                            onClick={() => {
                                                                handleZoneUpdate(selectedItemId, activePopover === 'base' ? 'color' : 'patternColor', c.hex);
                                                                setActivePopover(null);
                                                            }}
                                                            className="w-6 h-6 rounded-full border border-transparent transition-colors hover:border-brand-white"
                                                            style={{ backgroundColor: c.hex }}
                                                            title={c.name}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-brand-border text-center">
                                                    <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest">
                                                        Select {activePopover} Color
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Close Button */}
                                <button onClick={() => setSelectedItemId(null)} className="ml-2 text-neutral-500 hover:text-white transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Configuration Wizard - Slide In Right */}
                <div className="lg:w-[400px] bg-transparent flex flex-col h-[50%] lg:h-full max-h-full z-30 relative opacity-0 animate-slide-in-right isolate" style={{ animationDelay: '200ms' }}>

                    {/* Wizard Progress (Fixed at top) */}
                    {/* Wizard Progress (Fixed at top) - REDESIGNED */}
                    <div className="px-6 py-4 bg-transparent shrink-0 relative z-50">
                        <div className="relative flex bg-brand-black rounded-lg p-1 border border-brand-border shadow-xl overflow-hidden">
                            {/* Sliding Background Pill */}
                            <div
                                className="absolute top-1 bottom-1 left-1 w-[calc(25% - 2px)] bg-brand-accent shadow-sm transition-all duration-300 ease-out rounded-md"
                                style={{
                                    left: '4px',
                                    width: 'calc(25% - 2px)',
                                    transform: `translateX(${(currentStep - 1) * 100}%)`
                                }}
                            />

                            {STEPS.map((step) => (
                                <button
                                    key={step.id}
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`relative flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors z-10 flex items-center justify-center gap-2 ${currentStep === step.id ? 'text-brand-black' : 'text-neutral-500 hover:text-brand-white'}`}
                                >
                                    {currentStep === step.id && <step.icon size={12} className="animate-fade-in" />}
                                    {step.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area - Rounded Card Effect */}
                    <div className="flex-1 bg-brand-black rounded-t-3xl border-t border-brand-border overflow-hidden flex flex-col relative z-40 shadow-lg">
                        {/* Sticky Zone Selector - Only visible for Colors step */}
                        {currentStep === 3 && (
                            <div className="px-6 py-4 border-b border-brand-border bg-brand-black/50 shrink-0 relative z-40 flex flex-col gap-2 backdrop-blur-sm">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1 mb-2 block">Select Zone</label>
                                <div className="flex w-full overflow-x-auto no-scrollbar rounded-lg border border-brand-border divide-x divide-brand-border bg-brand-black/50">
                                    {activeZonesList.map((z, index) => {
                                        const currentIndex = activeZonesList.findIndex(zone => zone.id === activeZoneId);
                                        const isCompleted = index < currentIndex;
                                        const isSelected = activeZoneId === z.id;

                                        return (
                                            <button
                                                key={z.id}
                                                id={`control-${z.id}`}
                                                onClick={() => setActiveZoneId(z.id)}
                                                className={`flex-1 whitespace-nowrap px-4 py-3 text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2
                                                    ${isSelected ? 'bg-brand-accent text-brand-black' : ''}
                                                    ${isCompleted ? 'text-brand-white bg-white/5' : ''}
                                                    ${!isSelected && !isCompleted ? 'text-neutral-500 hover:text-brand-white hover:bg-white/5' : ''}
                                                `}
                                            >
                                                {isCompleted && <Check size={12} className="text-brand-accent" />}
                                                {z.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step Content Area - Flex 1 to scroll independent of buttons */}
                        <div className="flex-1 overflow-y-auto p-6 relative custom-scrollbar min-h-0 z-0">
                            {renderStepContent()}
                        </div>

                        {/* Navigation Actions - Fixed at bottom of sidebar */}
                        <div className="p-6 border-t border-brand-border flex gap-3 bg-brand-black/20 shrink-0 relative z-50 backdrop-blur-md">
                            {currentStep < (design.garmentType === 'shorts' ? 3 : 4) ? (
                                <button
                                    onClick={handleNext}
                                    className="flex-1 bg-brand-accent bg-gradient-to-b from-white/30 via-white/5 to-black/10 text-neutral-900 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ease-out border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_6px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_6px_12px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span>{getNextButtonLabel()}</span>
                                    <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddToBagClick}
                                    className="flex-1 bg-brand-accent bg-gradient-to-b from-white/30 via-white/5 to-black/10 text-neutral-900 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ease-out border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_6px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_6px_12px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <ShoppingBag size={18} />
                                    <span>{editingItemId ? 'Update Item' : 'Add to Bag'}</span>
                                </button>
                            )}
                        </div>

                        {/* Undo Toast */}
                        {deletedItem && (
                            <div className="absolute bottom-24 left-6 right-6 bg-neutral-900 border border-brand-border rounded-lg shadow-2xl overflow-hidden animate-fade-in-up z-[100]">
                                <div className="p-3 flex items-center justify-between">
                                    <span className="text-xs text-brand-white font-bold uppercase tracking-wide">Item Deleted</span>
                                    <button
                                        onClick={handleUndoDelete}
                                        className="text-xs font-bold text-brand-accent hover:text-white uppercase tracking-wider flex items-center gap-1"
                                    >
                                        <History size={12} /> Undo
                                    </button>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-1 bg-brand-black w-full">
                                    <div className="h-full bg-brand-accent animate-[shrink_3s_linear_forwards] origin-left" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
};
