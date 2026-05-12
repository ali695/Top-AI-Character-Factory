'use client';

import React from 'react';
import { ArtStyle } from '@/types';
import { ART_STYLES } from '@/constants';

interface StyleSelectorProps {
  selectedStyles: ArtStyle[];
  onSelectStyles: (styles: ArtStyle[]) => void;
  styleStrength: number;
  onStyleStrengthChange: (strength: number) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyles,
  onSelectStyles,
  styleStrength,
  onStyleStrengthChange,
}) => {
  const toggleStyle = (style: ArtStyle) => {
    const isSelected = selectedStyles.some(s => s.id === style.id);
    if (isSelected) {
      onSelectStyles(selectedStyles.filter(s => s.id !== style.id));
    } else {
      onSelectStyles([...selectedStyles, style]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ART_STYLES.slice(0, 6).map((style) => {
          const Icon = style.icon;
          const isSelected = selectedStyles.some(s => s.id === style.id);
          return (
            <button
              key={style.id}
              onClick={() => toggleStyle(style)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
              }`}
            >
              <Icon size={12} />
              {style.name}
            </button>
          );
        })}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Style Strength</span>
          <span>{styleStrength}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={styleStrength}
          onChange={(e) => onStyleStrengthChange(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Subtle</span>
          <span>Balanced</span>
          <span>Intense</span>
        </div>
      </div>
    </div>
  );
};
