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
    <div className={`grid grid-cols-3 gap-2 ${disabled ? 'opacity-50' : ''}`}>
      {styles.map(style => {
        const isSelected = selectedStyle.id === style.id;
        return (
          <button
            key={style.id}
            type="button"
            onClick={() => !disabled && onSelectStyle(style)}
            disabled={disabled}
            className={`group relative p-2 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all duration-200 text-xs font-semibold overflow-hidden
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              ${isSelected
                ? 'border-purple-500 text-white'
                : 'border-transparent hover:bg-white/10 text-gray-300'
              }
              bg-white/5 border
            `}
          >
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-50" />
            )}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
               <style.icon size={20} />
               <span className="text-center leading-tight">{style.name}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
