import React from 'react';
import { Download, ChevronsUp, Loader2, PlayCircle, Pencil, Trash2 } from 'lucide-react';
import { GeneratedItem } from '../types';
import { downloadImage, downloadVideoFromUrl } from '../utils/fileUtils';

interface ItemCardProps {
  item: GeneratedItem;
  onUpscale: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isUpscaling: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onUpscale, onEdit, onDelete, isUpscaling }) => {
  const handleDownload = () => {
    const safePrompt = item.prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    if (item.type === 'image') {
      downloadImage(item.data, `character_${safePrompt}.png`, item.mimeType);
    } else {
      downloadVideoFromUrl(item.data, `character_${safePrompt}.mp4`);
    }
  };

  const handleDelete = () => {
    onDelete(item.id);
  };

  return (
    <div 
      className="item-card relative aspect-square group animate-fadeIn"
      style={{'--glow-color': 'rgba(139, 92, 246, 0.4)'} as React.CSSProperties}
    >
      <div className="item-card-content relative w-full h-full rounded-lg shadow-lg overflow-hidden border border-white/10">
        {item.type === 'image' ? (
          <img
            src={`data:${item.mimeType || 'image/png'};base64,${item.data}`}
            alt={item.prompt}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              src={item.data}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <PlayCircle size={48} className="text-white/80 drop-shadow-lg" />
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {isUpscaling && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="text-white mt-2 text-sm font-semibold">Upscaling...</p>
        </div>
      )}

      <div className={`absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-center z-10 ${isUpscaling ? '!opacity-0' : ''}`}>
        <p className="text-white text-xs line-clamp-2 drop-shadow-md flex-1 mr-2">{item.prompt}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
           {item.type === 'image' && (
             <>
                <button
                  onClick={() => onEdit(item.id)}
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-full transition-all transform hover:scale-110"
                  aria-label="Edit image"
                  title="Edit Image"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => onUpscale(item.id)}
                  disabled={isUpscaling}
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-full transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Upscale image"
                  title="Upscale Image"
                >
                  <ChevronsUp size={16} />
                </button>
             </>
           )}
          <button
            onClick={handleDelete}
            className="bg-red-500/20 backdrop-blur-md hover:bg-red-500/40 text-red-300 p-2 rounded-full transition-all transform hover:scale-110"
            aria-label="Delete item"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={handleDownload}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-full transition-all transform hover:scale-110"
            aria-label="Download item"
            title="Download"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};