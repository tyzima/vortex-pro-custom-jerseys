import React, { useState, useRef, useMemo } from 'react';
import { DesignState, ViewSide, ZoneStyle } from '../types';
import { useTemplateLibrary } from '../contexts/TemplateLibraryContext';

interface JerseySVGProps {
  design: DesignState;
  view: ViewSide;
  onPositionChange?: (id: string, pos: { x: number, y: number }) => void;
  onSelect?: (id: string) => void;
  id?: string;
}

export const JerseySVG: React.FC<JerseySVGProps> = ({ design, view, onPositionChange, onSelect, id: componentId = 'main' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { library: SPORTS_LIBRARY } = useTemplateLibrary();

  // Local drag state now includes the current position to avoid parent re-renders
  const [dragState, setDragState] = useState<{
    id: string,
    offset: { x: number, y: number },
    currentPos: { x: number, y: number }
  } | null>(null);

  // Handle library loading
  if (!SPORTS_LIBRARY) {
    return <svg viewBox="0 0 400 500" className="w-full h-full" />;
  }

  // 1. Resolve Sport, Cut, and Template from Registry
  const sportDef = SPORTS_LIBRARY[design.sport] || SPORTS_LIBRARY.basketball;
  const currentCut = sportDef.cuts[design.cut] || Object.values(sportDef.cuts)[0];

  // Get the garment type (jersey or shorts) - default to jersey for backward compatibility
  const garmentType = design.garmentType || 'jersey';
  const garmentData = currentCut[garmentType];

  // Find the selected template or default to the first one
  const currentTemplate = sportDef.templates.find(t => t.id === design.template) || sportDef.templates[0];

  // 2. Helper to resolve fills (Color or Pattern)
  const getFill = (zoneKey: string) => {
    const zone = design.zones[zoneKey];
    if (!zone) return '#ffffff'; // Fallback color
    return zone.color;
  };

  const getFontWeight = (fontName: string) => {
    if (fontName === 'Anton') return '400';
    return '700';
  };

  const renderPatternOverlay = (zoneKey: string, pathD: string) => {
    const zone = design.zones[zoneKey];
    if (!zone || !zone.pattern || zone.pattern === 'none') return null;

    const isGhost = zone.patternMode === 'ghost' || !zone.patternMode;

    const style: React.CSSProperties = isGhost
      ? { mixBlendMode: 'multiply', opacity: 0.2, pointerEvents: 'none' }
      : { mixBlendMode: 'normal', opacity: 1.0, pointerEvents: 'none' };

    return (
      <path
        d={pathD}
        fill={`url(#${componentId}-pattern-${zone.pattern}-${zoneKey})`}
        style={style}
      />
    );
  };

  // 3. Generate Pattern Defs for EACH zone that has a pattern
  // Memoize defs generation as it only depends on zone styles
  const defs = useMemo(() => {
    const defsList: React.ReactElement[] = [];

    Object.entries(design.zones).forEach(([zoneKey, rawStyle]) => {
      const style = rawStyle as ZoneStyle;
      if (style.pattern && style.pattern !== 'none') {
        const id = `${componentId}-pattern-${style.pattern}-${zoneKey}`;
        const isGhost = style.patternMode === 'ghost' || !style.patternMode;
        const color = isGhost ? '#000000' : style.patternColor;

        if (style.pattern === 'stripes') {
          defsList.push(
            <pattern key={id} id={id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect x="0" y="0" width="10" height="20" fill={color} />
            </pattern>
          );
        } else if (style.pattern === 'dots') {
          defsList.push(
            <pattern key={id} id={id} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="3" fill={color} />
              <circle cx="12" cy="12" r="3" fill={color} />
            </pattern>
          );
        } else if (style.pattern === 'mesh') {
          defsList.push(
            <pattern key={id} id={id} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.5" fill={color} />
            </pattern>
          );
        } else if (style.pattern === 'camo') {
          defsList.push(
            <pattern key={id} id={id} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M10 10a15 15 0 0 1 20 10v10H10z" fill={color} />
              <path d="M60 60a20 20 0 0 0-20-10h-5v25z" fill={color} />
              <path d="M80 10a15 15 0 0 1-10 20v10H90z" fill={color} />
              <path d="M20 80a15 15 0 0 0 20 10v-10H20z" fill={color} />
            </pattern>
          );
        } else if (style.pattern === 'geometric') {
          defsList.push(
            <pattern key={id} id={id} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="none" stroke={color} strokeWidth="2" />
            </pattern>
          );
        }
      }
    });
    return defsList;
  }, [design.zones, componentId]);

  // --- DRAG HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent, id: string, currentX: number, currentY: number) => {
    if (onSelect) onSelect(id); // Select on click
    if (!onPositionChange) return;
    e.preventDefault();
    e.stopPropagation();

    const svg = svgRef.current;
    if (!svg) return;
    const CTM = svg.getScreenCTM();
    if (!CTM) return;

    const mouseX = (e.clientX - CTM.e) / CTM.a;
    const mouseY = (e.clientY - CTM.f) / CTM.d;

    setDragState({
      id,
      offset: { x: mouseX - currentX, y: mouseY - currentY },
      currentPos: { x: currentX, y: currentY }
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !svgRef.current || !onPositionChange) return;
    e.preventDefault();

    const svg = svgRef.current;
    const CTM = svg.getScreenCTM();
    if (!CTM) return;

    const mouseX = (e.clientX - CTM.e) / CTM.a;
    const mouseY = (e.clientY - CTM.f) / CTM.d;

    // Update local state only
    setDragState({
      ...dragState,
      currentPos: {
        x: mouseX - dragState.offset.x,
        y: mouseY - dragState.offset.y
      }
    });
  };

  const handleMouseUp = () => {
    if (dragState && onPositionChange) {
      // Commit final position to parent
      onPositionChange(dragState.id, dragState.currentPos);
    }
    setDragState(null);
  };

  // Helper to get position (either from drag state or design)
  const getRenderPosition = (id: string, designPos: { x: number, y: number }) => {
    if (dragState && dragState.id === id) {
      return dragState.currentPos;
    }
    return designPos;
  };

  // --- RENDER ---
  // Memoize the base jersey render to avoid re-calculating paths during drag
  const renderJerseyBase = (currentView: 'front' | 'back') => {
    const shapePath = garmentData.shape[currentView];
    const trimPath = garmentData.trim[currentView];

    return (
      <g>
        {/* 1. Base Shape (The Cut) - Always Zone 'body' */}
        <path
          d={shapePath}
          fill={getFill('body')}
          onClick={(e) => { e.stopPropagation(); if (onSelect) onSelect('body'); }}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        />
        {renderPatternOverlay('body', shapePath)}

        {/* 2. Dynamic Design Layers from Template */}
        {currentTemplate.layers.map((layer) => {
          const path = layer.paths[garmentType][currentView];
          if (!path) return null;
          return (
            <React.Fragment key={layer.id}>
              <path
                d={path}
                fill={getFill(layer.id)}
                onClick={(e) => { e.stopPropagation(); if (onSelect) onSelect(layer.id); }}
                className="cursor-pointer hover:opacity-90 transition-opacity"
              />
              {renderPatternOverlay(layer.id, path)}
            </React.Fragment>
          );
        })}

        {/* 3. Trim (Hardware) - Always Zone 'trim' */}
        <path
          d={trimPath}
          fill={getFill('trim')}
          onClick={(e) => { e.stopPropagation(); if (onSelect) onSelect('trim'); }}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        />
        {renderPatternOverlay('trim', trimPath)}
      </g>
    );
  };

  // Memoize the base layers so they don't re-render when dragging text
  const frontBase = useMemo(() => renderJerseyBase('front'), [design.zones, design.template, garmentType, currentCut, componentId]);
  const backBase = useMemo(() => renderJerseyBase('back'), [design.zones, design.template, garmentType, currentCut, componentId]);

  // Helper function to render text and logos (these need to update on drag)
  const renderContentLayer = (currentView: 'front' | 'back', xOffset: number) => {
    if (garmentType !== 'jersey') return null;

    return (
      <g transform={`translate(${xOffset}, 0)`} id={`ContentLayer-${currentView}`} textAnchor="middle">
        <style>{`
          .jersey-stroke {
             paint-order: stroke fill;
             stroke-linecap: square;
             stroke-linejoin: miter;
          }
          .draggable {
            cursor: grab;
            transition: opacity 0.2s;
          }
          .draggable:hover {
            opacity: 0.8;
          }
          .draggable:active {
            cursor: grabbing;
          }
        `}</style>

        {/* Text Elements */}
        {design.textElements
          .filter(el => el.view === currentView)
          .map(el => {
            const pos = getRenderPosition(el.id, el.position);
            return (
              <text
                key={el.id}
                x={pos.x}
                y={pos.y}
                className="jersey-stroke draggable"
                fontSize={el.size}
                fontWeight={getFontWeight(el.font)}
                fontFamily={el.font}
                fill={el.color}
                stroke={el.outline}
                strokeWidth={el.outlineWidth}
                style={{ letterSpacing: el.id === 'frontTeam' ? '2px' : '0px' }}
                transform={`rotate(${el.rotation}, ${pos.x}, ${pos.y})`}
                onMouseDown={(e) => handleMouseDown(e, el.id, pos.x, pos.y)}
                onClick={(e) => { e.stopPropagation(); if (onSelect) onSelect(el.id); }}
              >
                {el.text}
              </text>
            );
          })}

        {/* Logos */}
        {design.logos
          .filter(logo => logo.view === currentView)
          .map(logo => {
            const pos = getRenderPosition(logo.id, logo.position);
            return (
              <image
                key={logo.id}
                href={logo.url}
                x={pos.x - logo.size / 2}
                y={pos.y - logo.size / 2}
                width={logo.size}
                height={logo.size}
                preserveAspectRatio="xMidYMid meet"
                transform={`rotate(${logo.rotation || 0} ${pos.x} ${pos.y})`}
                className="draggable cursor-pointer"
                onMouseDown={(e) => handleMouseDown(e, logo.id, pos.x, pos.y)}
                onClick={(e) => { e.stopPropagation(); if (onSelect) onSelect(logo.id); }}
              />
            );
          })}

        {/* Back specific branding */}
        {currentView === 'back' && (
          <>
            <path d="M180 420 L220 420" stroke={design.zones.trim?.color || '#fff'} strokeWidth="2" opacity="0.5" />
            <text x="200" y="440" fontSize="10" opacity="0.6" fill="#fff">ENGINEERED BY VORTEX</text>
          </>
        )}
      </g>
    );
  };

  // Determine viewBox and content based on view mode
  const isBothView = view === 'both';
  const viewBox = isBothView ? "0 0 800 500" : "0 0 400 500";

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className="w-full h-full drop-shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <defs>
        {defs}
      </defs>

      <g id="JerseyContainer">
        {isBothView ? (
          <>
            {/* Render both front and back side-by-side */}
            <g transform="translate(0, 0)">{frontBase}</g>
            {renderContentLayer('front', 0)}

            <g transform="translate(400, 0)">{backBase}</g>
            {renderContentLayer('back', 400)}
          </>
        ) : (
          /* Render single view */
          <>
            {view === 'front' ? frontBase : backBase}
            {renderContentLayer(view as 'front' | 'back', 0)}
          </>
        )}
      </g>
    </svg>
  );
};