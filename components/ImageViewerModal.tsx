
import React from 'react';
import { X, Download, Trash2, Pencil, ChevronsUp, PlayCircle, Share2, Calendar, FileImage, Lock } from 'lucide-react';
import { GeneratedItem } from '../types';
import { downloadImage, downloadVideoFromUrl } from '../utils/fileUtils';

interface ImageViewerModalProps {
  item: GeneratedItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onUpscale: (id: string) => void;
  onLock: (item: GeneratedItem) => void;
  isUpscaling: boolean;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ 
  item, 
  onClose, 
  onDelete, 
  onEdit, 
  onUpscale,
  onLock,
  isUpscaling 
}) => {
  if (!item) return null;

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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn p-4">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-50"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-7xl h-full flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Media Display Area */}
        <div className="flex-1 flex items-center justify-center relative bg-black/20 rounded-2xl overflow-hidden border border-white/5">
          {item.type === 'image' ? (
            <img 
              src={`data:${item.mimeType || 'image/png'};base64,${item.data}`} 
              alt={item.prompt} 
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
          ) : (
            <video 
              src={item.data} 
              controls 
              autoPlay 
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
          )}
        </div>

        {/* Sidebar Info & Tools */}
        <div className="w-full md:w-96 flex-shrink-0 flex flex-col glass-card rounded-2xl border-l border-white/10 overflow-hidden">
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              {item.type === 'image' ? <FileImage size={18} className="text-purple-400"/> : <PlayCircle size={18} className="text-purple-400"/>}
              Details
            </h3>
            
            <div className="space-y-4">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Prompt</p>
                <p className="text-gray-200 text-sm leading-relaxed">{item.prompt}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="text-sm font-medium text-gray-300 capitalize">{item.type}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Format</p>
                  <p className="text-sm font-medium text-gray-300 uppercase">
                    {item.type === 'image' ? (item.mimeType === 'image/jpeg' ? 'JPG' : 'PNG') : 'MP4'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Toolbar */}
          <div className="p-6 bg-black/40 border-t border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-3">
               {item.type === 'image' && (
                <>
                   <button 
                    onClick={() => { onClose(); onEdit(item.id); }}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all hover:border-white/20"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => onUpscale(item.id)}
                    disabled={isUpscaling}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 border border-white/10 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsUp size={16} /> {isUpscaling ? 'Upscaling...' : 'Upscale'}
                  </button>
                </>
               )}
            </div>

            {item.type === 'image' && (
              <button
                onClick={() => { onLock(item); onClose(); }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold rounded-xl hover:bg-purple-500/30 transition-all transform active:scale-95"
              >
                <Lock size={18} /> Use as Character Reference
              </button>
            )}
            
            <button 
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all transform active:scale-95"
            >
              <Download size={18} /> Download {item.type === 'image' ? 'Image' : 'Video'}
            </button>

            <button 
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-sm font-medium"
            >
              <Trash2 size={16} /> Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
