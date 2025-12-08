import React from 'react';
import { Palette } from 'lucide-react';

interface NavItem {
  sportId: string;
  sportLabel: string;
}

interface HierarchicalNavProps {
  sports: Array<{
    id: string;
    label: string;
    templateCount?: number;
  }>;
  selectedItem: NavItem | null;
  onSelect: (item: NavItem) => void;
}

export default function HierarchicalNav({ sports, selectedItem, onSelect }: HierarchicalNavProps) {
  const isSelected = (sportId: string) => {
    return selectedItem?.sportId === sportId;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Template Library</h2>
        <p className="text-sm text-gray-500 mt-1">Select a sport to view templates</p>
      </div>

      <div className="p-2">
        {sports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => onSelect({
              sportId: sport.id,
              sportLabel: sport.label
            })}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left rounded-lg transition-colors mb-1 ${
              isSelected(sport.id)
                ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isSelected(sport.id) ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Palette className={`w-5 h-5 ${
                  isSelected(sport.id) ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <div className="font-medium">{sport.label}</div>
                {sport.templateCount !== undefined && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {sport.templateCount} {sport.templateCount === 1 ? 'template' : 'templates'}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
