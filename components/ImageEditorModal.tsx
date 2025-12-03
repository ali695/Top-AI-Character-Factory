
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { RotateCcw, RotateCw, Sun, Contrast, X, Check } from 'lucide-react';
import { applyImageEdits } from '../utils/imageUtils';

interface ImageEditorModalProps {
  imageSrc: string | null;
  onClose: () => void;
  onSave: (editedImage: string) => void;
}

const Slider: React.FC<{
  icon: React.ReactNode;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}> = ({ icon, value, onChange, min = 0, max = 200, step = 1, label }) => {
  const displayValue = value - 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">{icon} <span>{label}</span></div>
        <span>{displayValue > 0 ? '+' : ''}{displayValue}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
      />
    </div>
  );
};

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ imageSrc, onClose, onSave }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const editedImage = await applyImageEdits(
        imageSrc,
        croppedAreaPixels,
        rotation,
        brightness,
        contrast
      );
      onSave(editedImage);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[80] animate-fadeIn p-4">
      <div className="glass-card rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0 bg-black/20">
          <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            Image Editor
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Editor Area */}
          <div className="relative flex-1 bg-[#1a1a1a] overflow-hidden">
             {/* Custom filter application for preview using CSS */}
            <div 
                className="absolute inset-0 w-full h-full"
                style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
            >
                <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={undefined} // Free crop by default
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                classes={{
                    containerClassName: 'bg-transparent',
                    mediaClassName: '',
                }}
                />
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="w-full lg:w-80 bg-black/40 border-l border-white/10 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Transform Controls */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Transform</h3>
                
                <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                    <button onClick={() => setRotation(r => (r - 90) % 360)} className="p-2 hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors" title="Rotate Left">
                        <RotateCcw size={18} />
                    </button>
                    <span className="text-sm font-mono text-gray-400">{rotation}°</span>
                    <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-2 hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors" title="Rotate Right">
                        <RotateCw size={18} />
                    </button>
                </div>
              </div>

              {/* Adjustment Controls */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Adjustments</h3>
                
                <Slider 
                    icon={<Sun size={16} />} 
                    label="Brightness"
                    value={brightness} 
                    onChange={(e) => setBrightness(parseInt(e.target.value))} 
                />
                <Slider 
                    icon={<Contrast size={16} />} 
                    label="Contrast"
                    value={contrast} 
                    onChange={(e) => setContrast(parseInt(e.target.value))} 
                />
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10 space-y-3 bg-black/20">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                    'Processing...'
                ) : (
                    <>
                        <Check size={18} /> Apply Changes
                    </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isSaving}
                className="w-full py-3 px-4 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
