'use client';

import React from 'react';
import { Trash2, Download } from 'lucide-react';
import { GeneratedItem } from '@/types';

interface GalleryProps {
  items: GeneratedItem[];
  onDeleteItem: (id: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ items, onDeleteItem }) => {
  const handleDownload = (item: GeneratedItem) => {
    const link = document.createElement('a');
    link.href = `data:${item.mimeType || 'image/jpeg'};base64,${item.data}`;
    link.download = `ai-character-${item.id.slice(0, 8)}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (items.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
          <span className="text-3xl">🎨</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Images Yet</h3>
        <p className="text-gray-500">Generate your first AI character to see it here!</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-100 mb-6">Generated Images ({items.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          item.type === 'image' && (
            <div key={item.id} className="group relative bg-black/20 rounded-xl overflow-hidden aspect-square">
              <img
                src={`data:${item.mimeType || 'image/jpeg'};base64,${item.data}`}
                alt={item.prompt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs text-gray-300 line-clamp-2 mb-2">{item.prompt}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(item)}
                      className="flex-1 py-1.5 px-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs text-white flex items-center justify-center gap-1 transition-colors"
                    >
                      <Download size={12} /> Download
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="py-1.5 px-2 bg-red-500/80 hover:bg-red-600 rounded-lg text-xs text-white flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};
