import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Package, Loader2, Film, KeyRound, Upload, FileText, Palette, SlidersHorizontal, Eye, Compass } from 'lucide-react';
import { GeneratedItem, ArtStyle, Preset } from '../types';
import { ART_STYLES, DETAIL_LEVELS, ENHANCED_QUALITY_PROMPT } from '../constants';
import { generateImageVariations, upscaleImage, generateVideo, analyzePromptForSuggestions } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import useLocalStorage from '../hooks/useLocalStorage';
import { Gallery } from './Gallery';
import { StyleSelector } from './StyleSelector';
import { UploadBox } from './UploadBox';
import { QualityControls } from './QualityControls';
import { ImageEditorModal } from './ImageEditorModal';
import { PresetSelector } from './PresetSelector';
import { AISuggestionsBar } from './AISuggestionsBar';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

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
  const [traitsToMaintain, setTraitsToMaintain] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(ART_STYLES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedItems, setGeneratedItems] = useLocalStorage<GeneratedItem[]>('generatedItems', []);
  const [upscalingId, setUpscalingId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<GeneratedItem | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

  const [batchSize, setBatchSize] = useState<number>(50);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [detailLevel, setDetailLevel] = useState(DETAIL_LEVELS[2]);
  const [imageFormat, setImageFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [enhanceQuality, setEnhanceQuality] = useState<boolean>(false);
  
  const [hasSelectedApiKey, setHasSelectedApiKey] = useState<boolean>(false);

  const STORAGE_LIMIT = 20;
  
  const debouncedAnalyzePrompt = useCallback((p: string, preset: Preset | null) => {
    const { smartTags } = analyzePromptForSuggestions(p, preset);
    setAiSuggestions(smartTags);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedAnalyzePrompt(prompt, selectedPreset);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [prompt, selectedPreset, debouncedAnalyzePrompt]);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasSelectedApiKey(hasKey);
        } catch (e) {
          console.error("Error checking for API key:", e);
          setHasSelectedApiKey(false);
        }
      }
    };
    checkApiKey();
  }, []);
  
  const handleGenerate = async (bulk = false) => {
    const finalPrompt = [selectedPreset?.prompt, prompt].filter(Boolean).join(', ');

    if (!finalPrompt && referenceImages.length === 0) {
      setError('Please choose a preset and describe your character, or upload a reference image.');
      return;
    }
    if (referenceImages.length > 0 && !finalPrompt) {
      setError('With reference images, please choose a preset and describe the character or a scene.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);
    const usedReferenceImages = [...referenceImages];
    let caughtError: unknown = null;

    try {
      const count = bulk ? batchSize : 1;
      
      const styleSuffix = enhanceQuality
        ? ENHANCED_QUALITY_PROMPT
        : `${selectedStyle.prompt_suffix}, ${detailLevel.prompt_suffix}`;
        
      const imageResults = await generateImageVariations(
        finalPrompt, count, referenceImages, setProgress, styleSuffix, aspectRatio, imageFormat, traitsToMaintain
      );

      const newImages: GeneratedItem[] = imageResults.map(result => ({
        id: crypto.randomUUID(), type: 'image', data: result.base64, prompt: result.prompt, mimeType: result.mimeType,
      }));

      setGeneratedItems(prev => [...newImages, ...prev].slice(0, STORAGE_LIMIT));

      if (usedReferenceImages.length > 0) {
        setReferenceImages([]);
        setTraitsToMaintain('');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
    } catch (err) {
      caughtError = err;
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Error generating images: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      if (caughtError) {
        setProgress(0);
      } else {
        setTimeout(() => setProgress(0), 2000);
      }
    }
  };

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasSelectedApiKey(true);
        setError(null);
      } catch (e) {
        console.error("Error opening API key selection:", e);
        setError("Could not open the API key selection dialog.");
      }
    } else {
      setError("API key selection is not available in this environment.");
    }
  };
  
  const handleAnimate = async () => {
    if (referenceImages.length !== 1) {
      setError('Please upload exactly one reference image to animate.');
      return;
    }
    const animationPrompt = prompt || 'A neutral, subtle animation of the character.';
    const referenceImage = referenceImages[0];

    setIsVideoLoading(true);
    setError(null);
    setVideoProgress(0);
    const usedReferenceImage = referenceImage;
    let caughtError: unknown = null;
    
    try {
      const videoUrl = await generateVideo(animationPrompt, referenceImage, setVideoProgress);
      const newVideo: GeneratedItem = {
        id: crypto.randomUUID(),
        type: 'video',
        data: videoUrl,
        prompt: `Animation of: ${animationPrompt}`,
      };
      setGeneratedItems(prev => [newVideo, ...prev].slice(0, STORAGE_LIMIT));
      
       if (usedReferenceImage) {
        setReferenceImages([]);
        setTraitsToMaintain('');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }

    } catch(err) {
      caughtError = err;
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (errorMessage.includes('NOT_FOUND') || errorMessage.includes('entity was not found')) {
        setError('Video generation failed. Your API key may be invalid or missing permissions. Please select a different key.');
        setHasSelectedApiKey(false);
      } else {
        setError(`Error generating video: ${errorMessage}`);
      }
    } finally {
      setIsVideoLoading(false);
      if (caughtError) {
        setVideoProgress(0);
      } else {
        setTimeout(() => setVideoProgress(0), 2000);
      }
    }
  };


  const handleImagesUpload = async (files: File[]) => {
    const base64Promises = files.map(fileToBase64);
    const base64Images = await Promise.all(base64Promises);
    setReferenceImages(prev => [...prev, ...base64Images]);
  };
  
  const handleImageRemove = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleUpscale = async (imageId: string) => {
    setUpscalingId(imageId);
    setError(null);
    const imageToUpscale = generatedItems.find(item => item.id === imageId && item.type === 'image');
    if (!imageToUpscale) {
      setError('Image not found.');
      setUpscalingId(null);
      return;
    }
    try {
      const upscaledResult = await upscaleImage(imageToUpscale.data, imageToUpscale.mimeType);
      const upscaledImage: GeneratedItem = {
        ...imageToUpscale,
        data: upscaledResult.base64,
        mimeType: upscaledResult.mimeType,
        prompt: imageToUpscale.prompt + ' (Upscaled)',
      };
      setGeneratedItems(prev => prev.map(item => item.id === imageId ? upscaledImage : item));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to upscale image: ${errorMessage}`);
    } finally {
      setUpscalingId(null);
    }
  };
  
  const handleEditStart = (itemId: string) => {
    const itemToEdit = generatedItems.find(item => item.id === itemId && item.type === 'image');
    if (itemToEdit) {
      setEditingItem(itemToEdit);
    }
  };

  const handleEditSave = (editedImageData: string) => {
    if (!editingItem) return;

    const updatedItem: GeneratedItem = {
      ...editingItem,
      data: editedImageData.split(',')[1],
      mimeType: 'image/png',
      prompt: editingItem.prompt + ' (Edited)',
    };

    setGeneratedItems(prev => prev.map(item => (item.id === editingItem.id ? updatedItem : item)));
    setEditingItem(null);
  };
  
  const handleSuggestionClick = (tag: string) => {
    setPrompt(prev => {
        const trimmedPrev = prev.trim();
        if (!trimmedPrev) return tag;
        if (trimmedPrev.endsWith(',')) return `${trimmedPrev} ${tag}`;
        return `${trimmedPrev}, ${tag}`;
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setGeneratedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - (button.offsetLeft + radius)}px`;
    circle.style.top = `${event.clientY - (button.offsetTop + radius)}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();
    
    button.appendChild(circle);
  };
  
  const renderGenerateButtonContent = (isBulk: boolean) => {
    if (isLoading) {
      return (
        <>
          <Loader2 size={20} className="animate-spin" />
          <span>Generating ({progress.toFixed(0)}%)...</span>
        </>
      );
    }
    return isBulk ? (
      <>
        <Package size={20} /> Generate {batchSize} Variations
      </>
    ) : (
      <>
        <Sparkles size={20} /> Generate Single Image
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 h-full">
      {showSuccessToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fadeInOut">
          Reference item(s) used and cleared successfully!
        </div>
      )}
      
      <div className="lg:col-span-1 xl:col-span-1 flex flex-col animate-fadeIn" style={{ animationDelay: '100ms' }}>
        
        <div className="flex-1 space-y-6 overflow-y-auto pr-4 pb-6 -mr-4">
          <ControlModule icon={<Upload size={18} className="text-gray-300" />} title="Upload References">
              <UploadBox onImagesUpload={handleImagesUpload} referenceImages={referenceImages} onImageRemove={handleImageRemove}/>
              {referenceImages.length > 0 && (
                  <p className="text-center text-sm text-green-300 mt-4 p-2 bg-green-500/10 rounded-md border border-green-500/20">
                  Using {referenceImages.length} reference image(s).
                  </p>
              )}
          </ControlModule>

          <ControlModule icon={<Compass size={18} className="text-gray-300" />} title="Choose a Preset">
            <PresetSelector 
              selectedPreset={selectedPreset}
              onSelectPreset={setSelectedPreset}
            />
          </ControlModule>

          <ControlModule icon={<FileText size={18} className="text-gray-300" />} title="Describe your Character">
             <div className="relative">
                <textarea
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none h-28 placeholder-gray-500"
                    placeholder={selectedPreset ? "Add details, e.g., a brave knight with a silver sword, realistic textures..." : "First, choose a preset above, then describe your character..."}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
             </div>
              <AISuggestionsBar suggestions={aiSuggestions} onSuggestionClick={handleSuggestionClick} />
          </ControlModule>

          {referenceImages.length > 0 && (
            <ControlModule icon={<Eye size={18} className="text-gray-300" />} title="Maintain Traits" className="animate-fadeIn">
                <p className="text-sm text-gray-400 mb-3">List specific features to keep consistent, separated by commas.</p>
                <input
                    type="text"
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 placeholder-gray-500"
                    placeholder="e.g., blue eyes, scar over left eye"
                    value={traitsToMaintain}
                    onChange={(e) => setTraitsToMaintain(e.target.value)}
                />
            </ControlModule>
          )}

          <ControlModule icon={<Palette size={18} className="text-gray-300" />} title="Choose a Style">
              <StyleSelector styles={ART_STYLES} selectedStyle={selectedStyle} onSelectStyle={setSelectedStyle} disabled={enhanceQuality}/>
          </ControlModule>
                  
          <ControlModule icon={<SlidersHorizontal size={18} className="text-gray-300" />} title="Advanced Quality Controls">
            <QualityControls 
              batchSize={batchSize} setBatchSize={setBatchSize}
              aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
              detailLevel={detailLevel} setDetailLevel={setDetailLevel}
              imageFormat={imageFormat} setImageFormat={setImageFormat}
              enhanceQuality={enhanceQuality} setEnhanceQuality={setEnhanceQuality}
            />
          </ControlModule>
        </div>
        
        <div className="flex-shrink-0 pt-6">
          <div className="flex flex-col gap-4">
            <button
              onClick={(e) => {createRipple(e); handleGenerate(false);}}
              disabled={isLoading || isVideoLoading || !!upscalingId}
              style={{'--glow-color': 'rgba(139, 92, 246, 0.6)'} as React.CSSProperties}
              className={`relative overflow-hidden w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${(isLoading) ? 'animate-pulse-glow' : ''}`}
            >
              {renderGenerateButtonContent(false)}
            </button>
            <button
              onClick={(e) => {createRipple(e); handleGenerate(true);}}
              disabled={isLoading || isVideoLoading || !!upscalingId}
              style={{'--glow-color': 'rgba(22, 163, 74, 0.6)'} as React.CSSProperties}
              className={`relative overflow-hidden w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${(isLoading) ? 'animate-pulse-glow' : ''}`}
            >
              {renderGenerateButtonContent(true)}
            </button>
            {hasSelectedApiKey ? (
              <button
                onClick={(e) => {createRipple(e); handleAnimate();}}
                disabled={isLoading || isVideoLoading || !!upscalingId || referenceImages.length !== 1}
                style={{'--glow-color': 'rgba(225, 29, 72, 0.6)'} as React.CSSProperties}
                className={`relative overflow-hidden w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${(isVideoLoading) ? 'animate-pulse-glow' : ''}`}
              >
                {isVideoLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Animating ({videoProgress.toFixed(0)}%)...</span>
                  </>
                ) : (
                    <>
                      <Film size={20} /> Animate Character (8s)
                    </>
                )}
              </button>
            ) : (
              <div className="flex flex-col items-center text-center gap-2 p-4 glass-card rounded-2xl">
                  <h3 className="font-semibold text-gray-100">Enable Video Generation</h3>
                  <p className="text-xs text-gray-400 mb-2">
                      Select an API key to enable this premium feature. See the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300">billing docs</a> for details.
                  </p>
                  <button
                      onClick={(e) => {createRipple(e); handleSelectApiKey();}}
                      className={`relative overflow-hidden w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/30`}
                  >
                      <KeyRound size={20} /> Select API Key
                  </button>
              </div>
            )}
          </div>
          {(isLoading || isVideoLoading) && (
            <div className="mt-4 space-y-3">
              {isLoading && (
                <div>
                  <p className="text-sm text-center mb-1">Image Generation Progress</p>
                  <div className="w-full bg-white/10 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}
              {isVideoLoading && (
                <div>
                  <p className="text-sm text-center mb-1">Video Generation Progress</p>
                  <div className="w-full bg-white/10 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${videoProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          )}
          {error && <p className="text-red-400 mt-4 text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">{error}</p>}
        </div>
      </div>

      <div className="lg:col-span-2 xl:col-span-3 animate-fadeIn" style={{ animationDelay: '200ms' }}>
        <Gallery items={generatedItems} setItems={setGeneratedItems} onUpscale={handleUpscale} onEdit={handleEditStart} upscalingId={upscalingId} onDelete={handleDeleteItem} />
      </div>

      <ImageEditorModal
        imageSrc={editingItem ? `data:${editingItem.mimeType || 'image/png'};base64,${editingItem.data}` : null}
        onClose={() => setEditingItem(null)}
        onSave={handleEditSave}
      />

    </div>
  );
};
