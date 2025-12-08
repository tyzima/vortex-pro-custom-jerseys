import React from 'react';
import { Edit, Plus, Eye, Shirt, AlertCircle } from 'lucide-react';

interface Template {
  id: string;
  slug: string;
  label: string;
  displayOrder: number;
  isPublished: boolean;
  layerCount: number;
}

interface TemplateGridProps {
  sportLabel: string;
  templates: Template[];
  onEditTemplate: (templateId: string) => void;
  onCreateTemplate: () => void;
}

export default function TemplateGrid({
  sportLabel,
  templates,
  onEditTemplate,
  onCreateTemplate
}: TemplateGridProps) {
  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {sportLabel} Templates
              </h1>
              <p className="text-gray-600 mt-1">
                Manage design templates for {sportLabel.toLowerCase()} jerseys and shorts
              </p>
            </div>
            <button
              onClick={onCreateTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Template
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>Note:</strong> Templates are design patterns that work across all cuts. Each template contains layers that can have paths for both jerseys and shorts.
            </div>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shirt className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No templates yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first design template for {sportLabel.toLowerCase()}. Templates are reusable design patterns that work on both jerseys and shorts.
              </p>
              <button
                onClick={onCreateTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Template
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center gap-4">
                    <svg viewBox="0 0 400 500" className="w-24 h-32">
                      <path
                        d="M140 20 C170 30 230 30 260 20 L380 80 L350 120 L320 100 L320 480 L80 480 L80 100 L50 120 L20 80 L140 20 Z"
                        fill="#e5e7eb"
                        stroke="#9ca3af"
                        strokeWidth="2"
                      />
                    </svg>
                    <svg viewBox="0 0 400 500" className="w-24 h-32">
                      <path
                        d="M80 50 L90 60 C95 120 100 200 105 280 L105 380 C105 400 110 420 120 430 L130 440 L170 440 L180 430 C185 420 185 400 185 380 L185 280 C190 200 195 120 200 60 L210 60 C215 120 220 200 215 280 L215 380 C215 400 215 420 220 430 L230 440 L270 440 L280 430 C290 420 295 400 295 380 L295 280 C300 200 305 120 310 60 L320 50 L80 50 Z"
                        fill="#e5e7eb"
                        stroke="#9ca3af"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  {!template.isPublished && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                      Draft
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {template.label}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {template.layerCount} {template.layerCount === 1 ? 'layer' : 'layers'}
                  </p>

                  <button
                    onClick={() => onEditTemplate(template.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
