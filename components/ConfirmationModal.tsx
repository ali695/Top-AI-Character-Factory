import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] animate-fadeIn p-4">
      <div className="glass-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl transform transition-all scale-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          
          <p className="text-gray-300 mb-8 leading-relaxed pl-1">
            {message}
          </p>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-all duration-200 border border-white/5 hover:border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold shadow-lg shadow-red-500/20 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};