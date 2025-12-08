import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit2, User, Users } from 'lucide-react';
import type { ProductCut, Template } from '../../types';

interface CanvasViewerProps {
  sportId: string;
  sportLabel: string;
  garmentType: 'jersey' | 'shorts';
  templates: Template[];
  cuts: Record<string, ProductCut>;
  onEditTemplate: (template: Template) => void;
}

export const CanvasViewer: React.FC<CanvasViewerProps> = ({
  sportId,
  sportLabel,
  garmentType,
  templates,
  cuts,
  onEditTemplate
}) => {
  const [selectedCutSlug, setSelectedCutSlug] = useState<string>(() => {
    return Object.keys(cuts)[0] || 'mens';
  });
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

  useEffect(() => {
    if (selectedTemplateIndex >= templates.length) {
      setSelectedTemplateIndex(0);
    }
  }, [templates, selectedTemplateIndex]);

  const currentCut = cuts[selectedCutSlug];
  const validTemplateIndex = Math.min(selectedTemplateIndex, Math.max(0, templates.length - 1));
  const currentTemplate = templates.length > 0 && templates[validTemplateIndex]?.colors
    ? templates[validTemplateIndex]
    : null;

  const garment = garmentType === 'jersey' ? currentCut?.jersey : currentCut?.shorts;

  if (!currentCut || !garment) {
    return (
      <div className="h-full bg-neutral-950 flex items-center justify-center">
        <div className="text-center text-neutral-500">
          <p className="text-lg">Invalid product configuration</p>
          <p className="text-sm">Please select a valid product</p>
        </div>
      </div>
    );
  }

  const nextTemplate = () => {
    if (templates.length > 0) {
      setSelectedTemplateIndex((prev) => (prev + 1) % templates.length);
    }
  };

  const prevTemplate = () => {
    if (templates.length > 0) {
      setSelectedTemplateIndex((prev) => (prev - 1 + templates.length) % templates.length);
    }
  };

  const cutOptions = useMemo(() => {
    return Object.entries(cuts).map(([slug, cut]) => ({
      slug,
      label: cut.label,
      icon: slug.includes('womens') || slug.includes('women') ? Users : User
    }));
  }, [cuts]);

  return (
    <div className="h-full bg-neutral-950 flex flex-col">
      {/* HEADER */}
      <div className="bg-black border-b border-neutral-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white uppercase">
                {garmentType === 'jersey' ? 'Jersey' : 'Shorts'} Designer
              </h2>
              <span className="px-3 py-1 bg-brand-accent/20 text-brand-accent text-xs font-bold uppercase rounded-full border border-brand-accent/30">
                {sportLabel}
              </span>
            </div>
            <p className="text-sm text-neutral-400">
              {templates.length} design{templates.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Cut Selector */}
          <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
            {cutOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.slug}
                  onClick={() => setSelectedCutSlug(option.slug)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md font-bold uppercase text-sm transition-all
                    ${selectedCutSlug === option.slug
                      ? 'bg-brand-accent text-black'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }
                  `}
                >
                  <Icon size={16} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN CANVAS AREA */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Canvas Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #404040 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevTemplate}
          disabled={templates.length <= 1}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center hover:border-brand-accent hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          title="Previous Design"
        >
          <ChevronLeft size={24} className="text-neutral-400 group-hover:text-brand-accent transition-colors" />
        </button>

        <button
          onClick={nextTemplate}
          disabled={templates.length <= 1}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center hover:border-brand-accent hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          title="Next Design"
        >
          <ChevronRight size={24} className="text-neutral-400 group-hover:text-brand-accent transition-colors" />
        </button>

        {/* Garment Display */}
        {currentTemplate ? (
          <div className="relative z-10 flex gap-8">
            {/* Front View */}
            <div className="flex flex-col items-center">
              <div className="mb-3">
                <span className="text-xs font-bold uppercase text-neutral-500 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                  Front
                </span>
              </div>
              <div className="bg-gradient-to-br from-neutral-200 via-white to-neutral-200 rounded-2xl p-12 shadow-2xl border-4 border-neutral-800">
                <svg
                  viewBox="0 0 400 500"
                  className="w-[300px] h-[375px] drop-shadow-2xl"
                >
                  {/* Base Shape */}
                  <path
                    d={garment.shape.front}
                    fill={currentTemplate.colors.primary}
                    stroke="#1a1a1a"
                    strokeWidth="2"
                  />

                  {/* Secondary Color Panels */}
                  {currentTemplate.panels?.front && (
                    <path
                      d={currentTemplate.panels.front}
                      fill={currentTemplate.colors.secondary}
                    />
                  )}

                  {/* Accent Details */}
                  {currentTemplate.accents?.front && (
                    <path
                      d={currentTemplate.accents.front}
                      fill={currentTemplate.colors.accent}
                    />
                  )}

                  {/* Trim */}
                  {garment.trim.front && (
                    <path
                      d={garment.trim.front}
                      fill="none"
                      stroke={currentTemplate.colors.trim}
                      strokeWidth="3"
                    />
                  )}
                </svg>
              </div>
            </div>

            {/* Back View */}
            <div className="flex flex-col items-center">
              <div className="mb-3">
                <span className="text-xs font-bold uppercase text-neutral-500 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                  Back
                </span>
              </div>
              <div className="bg-gradient-to-br from-neutral-200 via-white to-neutral-200 rounded-2xl p-12 shadow-2xl border-4 border-neutral-800">
                <svg
                  viewBox="0 0 400 500"
                  className="w-[300px] h-[375px] drop-shadow-2xl"
                >
                  {/* Base Shape */}
                  <path
                    d={garment.shape.back}
                    fill={currentTemplate.colors.primary}
                    stroke="#1a1a1a"
                    strokeWidth="2"
                  />

                  {/* Secondary Color Panels */}
                  {currentTemplate.panels?.back && (
                    <path
                      d={currentTemplate.panels.back}
                      fill={currentTemplate.colors.secondary}
                    />
                  )}

                  {/* Accent Details */}
                  {currentTemplate.accents?.back && (
                    <path
                      d={currentTemplate.accents.back}
                      fill={currentTemplate.colors.accent}
                    />
                  )}

                  {/* Trim */}
                  {garment.trim.back && (
                    <path
                      d={garment.trim.back}
                      fill="none"
                      stroke={currentTemplate.colors.trim}
                      strokeWidth="3"
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-neutral-500">
            <p className="text-lg">No templates available</p>
            <p className="text-sm">Create a new design to get started</p>
          </div>
        )}
      </div>

      {/* BOTTOM PANEL - Template Info & Thumbnails */}
      {currentTemplate && (
        <div className="bg-black border-t border-neutral-800">
          {/* Template Info */}
          <div className="px-6 py-4 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white uppercase mb-1">
                  {currentTemplate.name}
                </h3>
                <p className="text-sm text-neutral-400">
                  Design {validTemplateIndex + 1} of {templates.length}
                </p>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 uppercase font-bold">Colors:</span>
                  <div className="flex gap-1">
                    {Object.entries(currentTemplate.colors).map(([key, color]) => (
                      <div
                        key={key}
                        className="w-8 h-8 rounded-md border-2 border-neutral-700 shadow-md"
                        style={{ backgroundColor: color }}
                        title={`${key}: ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onEditTemplate(currentTemplate)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-black font-bold uppercase text-sm rounded-lg hover:bg-brand-accent/90 transition-all"
                >
                  <Edit2 size={16} />
                  Edit Design
                </button>
              </div>
            </div>
          </div>

          {/* Template Thumbnails */}
          <div className="px-6 py-4 overflow-x-auto">
            <div className="flex gap-3">
              {templates.map((template, index) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateIndex(index)}
                  className={`
                    flex-shrink-0 w-24 h-32 rounded-lg border-2 transition-all
                    ${index === selectedTemplateIndex
                      ? 'border-brand-accent shadow-lg shadow-brand-accent/20 scale-110'
                      : 'border-neutral-800 hover:border-neutral-600 opacity-60 hover:opacity-100'
                    }
                    bg-gradient-to-br from-neutral-200 via-white to-neutral-200 p-2
                  `}
                >
                  <svg viewBox="0 0 400 500" className="w-full h-full">
                    <path
                      d={garment.shape.front}
                      fill={template.colors.primary}
                      stroke="#1a1a1a"
                      strokeWidth="2"
                    />
                    {template.panels?.front && (
                      <path
                        d={template.panels.front}
                        fill={template.colors.secondary}
                      />
                    )}
                    {garment.trim.front && (
                      <path
                        d={garment.trim.front}
                        fill="none"
                        stroke={template.colors.trim}
                        strokeWidth="3"
                      />
                    )}
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
