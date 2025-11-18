import React from 'react';
import { ArtStyle } from '../types';

interface StyleSelectorProps {
  styles: ArtStyle[];
  selectedStyle: ArtStyle;
  onSelectStyle: (style: ArtStyle) => void;
  disabled?: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyle, onSelectStyle, disabled = false }) => {
  return (
    <div className={`grid grid-cols-3 gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {styles.map(style => {
        const isSelected = selectedStyle.id === style.id;
        return (
          <button
            key={style.id}
            onClick={() => !disabled && onSelectStyle(style)}
            disabled={disabled}
            className={`relative p-2 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all duration-200 text-xs font-semibold
              ${isSelected
                ? 'bg-purple-600/20 border border-purple-500 text-white'
                : 'bg-white/5 border border-transparent hover:bg-white/10 text-gray-300'
              }
            `}
          >
            {isSelected && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 opacity-50 -z-10" />
            )}
            <style.icon size={20} />
            <span>{style.name}</span>
          </button>
        );
      })}
    </div>
  );
};