import React, { useState } from 'react';
import { PRESET_CATEGORIES } from '../presets';
import { Preset } from '../types';

interface PresetSelectorProps {
  selectedPreset: Preset | null;
  onSelectPreset: (preset: Preset) => void;
}

const PresetTile: React.FC<{ preset: Preset; isSelected: boolean; onSelect: () => void; }> = ({ preset, isSelected, onSelect }) => (
  <button 
    onClick={onSelect} 
    className={`relative aspect-square rounded-lg overflow-hidden group transition-all duration-200 border-2 ${
      isSelected ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/20' : 'border-transparent hover:border-white/50'
    }`}
  >
    <img src={preset.thumbnail} alt={preset.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
      <p className="text-white text-xs font-bold truncate drop-shadow-md">{preset.name}</p>
    </div>
    {isSelected && <div className="absolute inset-0 ring-2 ring-purple-500 ring-inset rounded-lg pointer-events-none" />}
  </button>
);

export const PresetSelector: React.FC<PresetSelectorProps> = ({ selectedPreset, onSelectPreset }) => {
  const [activeCategory, setActiveCategory] = useState(PRESET_CATEGORIES[0].id);

  const activePresets = PRESET_CATEGORIES.find(c => c.id === activeCategory)?.presets || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {PRESET_CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors duration-200 ${
              activeCategory === category.id 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <category.icon size={14} />
            {category.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pr-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
        {activePresets.map(preset => (
          <PresetTile 
            key={preset.id}
            preset={preset}
            isSelected={selectedPreset?.id === preset.id}
            onSelect={() => onSelectPreset(preset)}
          />
        ))}
      </div>
    </div>
  );
};
