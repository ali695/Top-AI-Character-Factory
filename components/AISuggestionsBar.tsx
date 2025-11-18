import React from 'react';
import { Sparkles } from 'lucide-react';

interface AISuggestionsBarProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const AISuggestionsBar: React.FC<AISuggestionsBarProps> = ({ suggestions, onSuggestionClick }) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 animate-fadeIn">
        <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-purple-400" />
            <h4 className="text-sm font-semibold text-gray-300">AI Suggestions</h4>
        </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            style={{ animationDelay: `${index * 50}ms` }}
            className="animate-fadeIn text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 px-2.5 py-1 rounded-full transition-all"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
