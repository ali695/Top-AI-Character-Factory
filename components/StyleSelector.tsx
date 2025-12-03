
import React from 'react';
import { ArtStyle } from '../types';
import { Check } from 'lucide-react';

interface StyleSelectorProps {
  styles: ArtStyle[];
  selectedStyles: ArtStyle[];
  onSelectStyles: (styles: ArtStyle[]) => void;
  disabled?: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyles, onSelectStyles, disabled = false }) => {
  
  const handleStyleClick = (style: ArtStyle) => {
    if (disabled) return;

    const isSelected = selectedStyles.some(s => s.id === style.id);
    let newStyles: ArtStyle[];

    if (isSelected) {
      // Deselect: remove if it's not the last one, or allow clearing all? 
      // Let's allow clearing all to rely purely on custom styles if desired.
      newStyles = selectedStyles.filter(s => s.id !== style.id);
    } else {
      // Select: Add to array
      newStyles = [...selectedStyles, style];
    }
    onSelectStyles(newStyles);
  };

  return (
    <div className={`grid grid-cols-3 gap-2 ${disabled ? 'opacity-50' : ''}`}>
      {styles.map(style => {
        const isSelected = selectedStyles.some(s => s.id === style.id);
        return (
          <button
            key={style.id}
            type="button"
            onClick={() => handleStyleClick(style)}
            disabled={disabled}
            className={`group relative p-2 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all duration-200 text-xs font-semibold overflow-hidden
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              ${isSelected
                ? 'border-purple-500 text-white bg-purple-500/20'
                : 'border-transparent hover:bg-white/10 text-gray-300 bg-white/5'
              }
              border
            `}
          >
            {isSelected && (
               <div className="absolute top-1 right-1 text-purple-400 animate-fadeIn">
                  <Check size={12} strokeWidth={3} />
               </div>
            )}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
               <style.icon size={20} className={isSelected ? "text-purple-300" : "text-gray-400"} />
               <span className="text-center leading-tight">{style.name}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
