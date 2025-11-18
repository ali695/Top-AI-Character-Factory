import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { RotateCcw, RotateCw, Sun, Contrast, X } from 'lucide-react';
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
}> = ({ icon, value, onChange, min = 0, max = 200, step = 1 }) => {
  const displayValue = value - 100;
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
      />
      <span className="text-sm w-12 text-center">
        {displayValue > 0 ? '+' : ''}{displayValue}%
      </span>
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 animate-fadeIn">
      <div className="glass-card rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-100">Image Editor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Crop Area */}
          <div className="relative flex-1 bg-black/50">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Controls */}
          <div className="w-full md:w-72 p-6 bg-black/20 flex flex-col gap-6 overflow-y-auto">
            <div>
              <h3 className="text-lg font-medium mb-3">Transform</h3>
              <div className="flex items-center justify-between">
                <button onClick={() => setRotation(r => (r - 90) % 360)} className="p-2 bg-white/10 rounded-md hover:bg-white/20 transition-colors"><RotateCcw size={20} /></button>
                <span className="text-center">{rotation}°</span>
                <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-2 bg-white/10 rounded-md hover:bg-white/20 transition-colors"><RotateCw size={20} /></button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Adjust</h3>
              <div className="space-y-4">
                <Slider icon={<Sun size={20} />} value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} />
                <Slider icon={<Contrast size={20} />} value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} />
              </div>
            </div>
            
            <div className="mt-auto pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
