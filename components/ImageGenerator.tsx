'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Upload } from 'lucide-react';
import { GeneratedItem } from '@/types';
import { generateImage } from '@/lib/imageService';
import { Gallery } from './Gallery';
import { StyleSelector } from './StyleSelector';
import { ART_STYLES, ASPECT_RATIOS } from '@/constants';

const ControlModule: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }> = ({ icon, title, children, className = '' }) => (
  <div className={`relative glass-card rounded-2xl ${className}`}>
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg">{icon}</div>
        <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
      </div>
      {children}
    </div>
  </div>
);

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState([ART_STYLES[0]]);
  const [styleStrength, setStyleStrength] = useState<number>(50);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);

  const handleGenerate = async () => {
    if (!prompt && referenceImages.length === 0) {
      setError('Please describe your character or upload a reference image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Build the final prompt with style modifiers
      let finalPrompt = prompt;
      if (selectedStyles.length > 0) {
        const styleSuffix = selectedStyles.map(s => s.prompt_suffix).join(', ');
        finalPrompt = `${prompt}, ${styleSuffix}`;
      }

      // Parse aspect ratio
      const [width, height] = aspectRatio.split(':').map(Number);
      const aspectMultiplier = 1024;
      const imgWidth = Math.round(aspectMultiplier * (width / height));
      const imgHeight = aspectMultiplier;

      setProgress(20);
      
      const result = await generateImage({
        prompt: finalPrompt,
        width: imgWidth,
        height: imgHeight,
        seed: Math.floor(Math.random() * 10000)
      });

      setProgress(100);

      const newImage: GeneratedItem = {
        id: crypto.randomUUID(),
        type: 'image',
        data: result.base64,
        prompt: finalPrompt,
        mimeType: result.mimeType
      };

      setGeneratedItems(prev => [newImage, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Error generating image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const handleImagesUpload = async (files: File[]) => {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setReferenceImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      <div className="lg:col-span-1 xl:col-span-1 flex flex-col animate-fadeIn" style={{ animationDelay: '100ms' }}>
        <div className="space-y-6">
          <ControlModule icon={<Upload size={18} className="text-gray-300" />} title="Reference Images">
            <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleImagesUpload(Array.from(e.target.files))}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-400">Click to upload reference images</p>
              </label>
            </div>
            {referenceImages.length > 0 && (
              <div className="mt-4 space-y-2">
                {referenceImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Reference ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      onClick={() => handleImageRemove(idx)}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="text-white text-xs">×</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ControlModule>

          <ControlModule icon={<Sparkles size={18} className="text-gray-300" />} title="Art Style">
            <StyleSelector
              selectedStyles={selectedStyles}
              onSelectStyles={setSelectedStyles}
              styleStrength={styleStrength}
              onStyleStrengthChange={setStyleStrength}
            />
          </ControlModule>

          <ControlModule icon={<Sparkles size={18} className="text-gray-300" />} title="Aspect Ratio">
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 text-gray-100"
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio.id} value={ratio.id}>{ratio.name}</option>
              ))}
            </select>
          </ControlModule>

          <ControlModule icon={<Sparkles size={18} className="text-gray-300" />} title="Describe Your Character">
            <textarea
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 transition duration-200 resize-none h-28 placeholder-gray-500 text-gray-100"
              placeholder="Describe your character in detail..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </ControlModule>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-medium text-white shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Generating ({progress.toFixed(0)}%)...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Generate Image</span>
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 xl:col-span-3">
        <Gallery 
          items={generatedItems} 
          onDeleteItem={(id) => setGeneratedItems(prev => prev.filter(item => item.id !== id))}
        />
      </div>
    </div>
  );
};
