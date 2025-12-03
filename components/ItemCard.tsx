
import React from 'react';
import { Download, ChevronsUp, Loader2, PlayCircle, Pencil, Trash2, Maximize2, Lock } from 'lucide-react';
import { GeneratedItem } from '../types';
import { downloadImage, downloadVideoFromUrl } from '../utils/fileUtils';

interface ItemCardProps {
  item: GeneratedItem;
  onUpscale: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (item: GeneratedItem) => void;
  onLock: (item: GeneratedItem) => void;
  isUpscaling: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onUpscale, onEdit, onDelete, onView, onLock, isUpscaling }) => {
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const safePrompt = item.prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    if (item.type === 'image') {
      downloadImage(item.data, `character_${safePrompt}.png`, item.mimeType);
    } else {
      downloadVideoFromUrl(item.data, `character_${safePrompt}.mp4`);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const handleUpscaleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpscale(item.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item.id);
  };

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLock(item);
  }

  return (
    <div 
      className="group relative aspect-square rounded-xl overflow-hidden bg-black/20 border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
      onClick={() => onView(item)}
    >
      {/* Media Content */}
      <div className="w-full h-full relative">
        {item.type === 'image' ? (
          <img
            src={`data:${item.mimeType || 'image/png'};base64,${item.data}`}
            alt={item.prompt}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <>
            <video
              src={item.data}
              className="w-full h-full object-cover"
              muted
              loop
              onMouseOver={e => e.currentTarget.play()}
              onMouseOut={e => e.currentTarget.pause()}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <PlayCircle size={40} className="text-white/80 drop-shadow-lg" />
            </div>
          </>
        )}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Upscaling Loading Overlay */}
      {isUpscaling && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <p className="text-white mt-2 text-xs font-bold tracking-wider uppercase">Upscaling...</p>
        </div>
      )}

      {/* Content Container (Visible on Hover) */}
      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10 flex flex-col gap-2">
        
        {/* Professional Toolbar */}
        <div className="flex items-center justify-between gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg">
           <div className="flex items-center gap-1">
             {item.type === 'image' && (
               <>
                 <button
                    onClick={handleLockClick}
                    className="p-1.5 rounded-md hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 transition-colors"
                    title="Lock as Character Reference"
                 >
                   <Lock size={14} />
                 </button>
                 <div className="w-px h-3 bg-white/20 mx-0.5"></div>
                 <button
                    onClick={handleEditClick}
                    className="p-1.5 rounded-md hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                    title="Edit"
                 >
                   <Pencil size={14} />
                 </button>
                 <button
                    onClick={handleUpscaleClick}
                    disabled={isUpscaling}
                    className="p-1.5 rounded-md hover:bg-white/20 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
                    title="Upscale"
                 >
                   <ChevronsUp size={14} />
                 </button>
               </>
             )}
           </div>
           
           <div className="flex items-center gap-1">
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-md hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
                title="Download"
              >
                <Download size={14} />
              </button>
              <div className="w-px h-3 bg-white/20 mx-0.5"></div>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
           </div>
        </div>
        
        {/* Prompt Text */}
        <p className="text-[10px] text-gray-300 line-clamp-1 opacity-80 px-1">{item.prompt}</p>
      </div>

      {/* View Indicator */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 p-1.5 rounded-full backdrop-blur-sm">
        <Maximize2 size={14} className="text-white" />
      </div>
    </div>
  );
};
