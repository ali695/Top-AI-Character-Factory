import React, { useState } from 'react';
import { Download, Trash2, Clapperboard } from 'lucide-react';
import { GeneratedItem } from '../types';
import { downloadAllAsZip } from '../utils/fileUtils';
import { ItemCard } from './ItemCard';
import { ConfirmationModal } from './ConfirmationModal';

interface GalleryProps {
  items: GeneratedItem[];
  setItems: React.Dispatch<React.SetStateAction<GeneratedItem[]>>;
  onUpscale: (id: string) => void;
  onEdit: (id: string) => void;
  upscalingId: string | null;
  onDelete: (id: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ items, setItems, onUpscale, onEdit, upscalingId, onDelete }) => {
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleClearAllClick = () => {
    setConfirmationState({
      isOpen: true,
      title: 'Clear Gallery',
      message: 'Are you sure you want to delete all generated items? This action cannot be undone.',
      onConfirm: () => setItems([]),
    });
  };

  const handleDeleteItemClick = (id: string) => {
    setConfirmationState({
      isOpen: true,
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      onConfirm: () => onDelete(id),
    });
  };

  const closeConfirmation = () => {
    setConfirmationState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="relative glass-card rounded-2xl p-6 lg:p-8 h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-gray-100">Your Creations</h2>
        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadAllAsZip(items)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              <Download size={16} /> Download All
            </button>
            <button
              onClick={handleClearAllClick}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              <Trash2 size={16} /> Clear All
            </button>
          </div>
        )}
      </div>
      <div className="relative flex-1 overflow-y-auto">
        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pr-2">
            {items.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onUpscale={onUpscale}
                onEdit={onEdit}
                onDelete={handleDeleteItemClick}
                isUpscaling={upscalingId === item.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 border-2 border-dashed border-white/10 rounded-lg p-8">
            <Clapperboard size={48} className="mb-4 text-gray-600"/>
            <p className="text-lg font-medium text-gray-400">Your gallery is empty</p>
            <p className="text-sm">Use the controls on the left to start creating!</p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={closeConfirmation}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
      />
    </div>
  );
};