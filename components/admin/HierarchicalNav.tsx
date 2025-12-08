import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface NavItem {
  sportId: string;
  sportLabel: string;
  cutId: string;
  cutLabel: string;
  garmentType: 'jersey' | 'shorts';
}

interface HierarchicalNavProps {
  sports: Array<{
    id: string;
    label: string;
    cuts: Array<{
      id: string;
      label: string;
    }>;
  }>;
  selectedItem: NavItem | null;
  onSelect: (item: NavItem) => void;
}

export default function HierarchicalNav({ sports, selectedItem, onSelect }: HierarchicalNavProps) {
  const [expandedSports, setExpandedSports] = useState<Set<string>>(new Set());
  const [expandedCuts, setExpandedCuts] = useState<Set<string>>(new Set());

  const toggleSport = (sportId: string) => {
    const newExpanded = new Set(expandedSports);
    if (newExpanded.has(sportId)) {
      newExpanded.delete(sportId);
    } else {
      newExpanded.add(sportId);
    }
    setExpandedSports(newExpanded);
  };

  const toggleCut = (cutId: string) => {
    const newExpanded = new Set(expandedCuts);
    if (newExpanded.has(cutId)) {
      newExpanded.delete(cutId);
    } else {
      newExpanded.add(cutId);
    }
    setExpandedCuts(newExpanded);
  };

  const isSelected = (sportId: string, cutId: string, garmentType: 'jersey' | 'shorts') => {
    return selectedItem?.sportId === sportId &&
           selectedItem?.cutId === cutId &&
           selectedItem?.garmentType === garmentType;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Template Library</h2>
        <p className="text-sm text-gray-500 mt-1">Select a garment to view designs</p>
      </div>

      <div className="p-2">
        {sports.map((sport) => (
          <div key={sport.id} className="mb-1">
            <button
              onClick={() => toggleSport(sport.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              {expandedSports.has(sport.id) ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <span className="font-medium text-gray-900">{sport.label}</span>
            </button>

            {expandedSports.has(sport.id) && (
              <div className="ml-6 mt-1 space-y-1">
                {sport.cuts.map((cut) => (
                  <div key={cut.id}>
                    <button
                      onClick={() => toggleCut(cut.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {expandedCuts.has(cut.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">{cut.label}</span>
                    </button>

                    {expandedCuts.has(cut.id) && (
                      <div className="ml-6 space-y-1">
                        <button
                          onClick={() => onSelect({
                            sportId: sport.id,
                            sportLabel: sport.label,
                            cutId: cut.id,
                            cutLabel: cut.label,
                            garmentType: 'jersey'
                          })}
                          className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                            isSelected(sport.id, cut.id, 'jersey')
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          Jersey
                        </button>
                        <button
                          onClick={() => onSelect({
                            sportId: sport.id,
                            sportLabel: sport.label,
                            cutId: cut.id,
                            cutLabel: cut.label,
                            garmentType: 'shorts'
                          })}
                          className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                            isSelected(sport.id, cut.id, 'shorts')
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          Shorts
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
