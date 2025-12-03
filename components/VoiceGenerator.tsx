
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Wand2, Mic, Upload, Sliders, Volume2, FileAudio, ChevronDown, Check, Layers, Activity, Info, Sparkles, KeyRound, Clock, Music, CloudRain, Flame, Ghost, Moon, BookHeart, Swords, User, Heart, Speaker, Globe, TrendingUp } from 'lucide-react';
import { VOICE_CATEGORIES, VOICE_EMOTIONS, BACKGROUND_LAYERS } from '../constants';
import { VoicePreset } from '../types';
import { generateSpeech } from '../services/geminiService';
import { mixAudio } from '../utils/audioUtils';

// --- Reusable UI Components (Matching ImageGenerator Styles) ---

const ControlModule: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }> = ({ icon, title, children, className = '', action }) => (
  <div className={`relative glass-card rounded-2xl flex flex-col ${className}`}>
    <div className="p-6 flex-shrink-0 border-b border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg text-gray-300">{icon}</div>
          <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
        </div>
        {action}
      </div>
    </div>
    <div className="p-6 flex-1">
      {children}
    </div>
  </div>
);

const AccordionItem: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    isOpen: boolean; 
    onToggle: () => void; 
    children: React.ReactNode 
}> = ({ title, icon, isOpen, onToggle, children }) => (
    <div className="mb-3 overflow-hidden rounded-xl border border-white/5 bg-black/20 transition-all duration-300">
        <button 
            onClick={onToggle}
            className={`w-full flex items-center justify-between p-4 transition-colors ${isOpen ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`${isOpen ? 'text-purple-400' : 'text-gray-500'}`}>{icon}</div>
                <span className="text-sm font-bold tracking-wide uppercase">{title}</span>
            </div>
            <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-3 pt-0 space-y-1">
                {children}
            </div>
        </div>
    </div>
);

const VoiceOption: React.FC<{ voice: any; isSelected: boolean; onClick: () => void }> = ({ voice, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 relative group ${
            isSelected 
            ? 'bg-purple-600/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
            : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
        }`}
    >
        <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{voice.name}</p>
                    {voice.gender && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 bg-white/10 rounded text-gray-400 font-medium">{voice.gender}</span>
                    )}
                </div>
                <p className="text-xs text-gray-500 truncate">{voice.description}</p>
            </div>
            {isSelected && <div className="bg-purple-500 text-white p-1 rounded-full ml-2 flex-shrink-0"><Check size={10} strokeWidth={4}/></div>}
        </div>
    </button>
);

const RangeSlider: React.FC<{ label: string; value: number; onChange: (val: number) => void; min?: number; max?: number }> = ({ label, value, onChange, min=0, max=100 }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">{value}%</span>
    </div>
    <div className="relative h-1.5 w-full bg-gray-800 rounded-full overflow-hidden group cursor-pointer">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full group-hover:from-purple-500 group-hover:to-indigo-400 transition-colors" style={{ width: `${value}%` }}></div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
    </div>
  </div>
);

const BackgroundLayerTile: React.FC<{ layer: any; isSelected: boolean; onClick: () => void }> = ({ layer, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 aspect-square ${
            isSelected 
            ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
    >
        <layer.icon size={24} className={isSelected ? 'text-purple-300' : 'opacity-70'}/>
        <span className="text-[10px] font-bold uppercase text-center leading-tight">{layer.name}</span>
    </button>
);

// --- Main Component ---

export const VoiceGenerator: React.FC = () => {
  // Library State
  const [selectedVoice, setSelectedVoice] = useState<VoicePreset | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>(['recitation']);
  
  // Builder State
  const [description, setDescription] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState(VOICE_EMOTIONS[0]);
  const [selectedBgLayer, setSelectedBgLayer] = useState('none');
  const [bgVolume, setBgVolume] = useState(30);
  
  // Sliders
  const [speed, setSpeed] = useState(50);
  const [pitch, setPitch] = useState(50);
  const [emotionStrength, setEmotionStrength] = useState(50);
  const [reverb, setReverb] = useState(20);
  const [breathing, setBreathing] = useState(10);
  const [clarity, setClarity] = useState(80);
  
  // Output State
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [systemLog, setSystemLog] = useState<string[]>(['System initialized.', 'Ready to generate.']);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  // --- Helpers ---

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSystemLog(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [systemLog]);

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (!script.trim()) {
        addLog("Error: Script is empty.");
        return;
    }
    setIsGenerating(true);
    setGeneratedAudio(null);
    addLog(`Generating audio with voice: ${selectedVoice?.name || 'Default'}...`);
    
    try {
      // 1. Generate Voice via Gemini
      const rawVoicePcm = await generateSpeech(script, {
          voiceName: selectedVoice?.name || 'Kore'
      });
      
      if (rawVoicePcm) {
          addLog("Voice synthesis complete. Processing effects...");
          
          // 2. Decode base64 to Uint8Array
          const binaryString = atob(rawVoicePcm);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
             bytes[i] = binaryString.charCodeAt(i);
          }

          // 3. Mix with Audio Engine (Reverb, Backgrounds, Speed, Pitch)
          const finalWavBlob = await mixAudio(bytes, selectedBgLayer === 'none' ? null : selectedBgLayer, {
              reverbAmount: reverb,
              backgroundVolume: bgVolume,
              speed: speed,
              pitch: pitch
          });

          // 4. Create URL for playback
          const audioUrl = URL.createObjectURL(finalWavBlob);
          // Convert Blob to Base64 for internal consistency if needed, but URL is better for playback
          const reader = new FileReader();
          reader.readAsDataURL(finalWavBlob);
          reader.onloadend = () => {
              const base64data = reader.result as string;
              // strip data:audio/wav;base64,
              const b64 = base64data.split(',')[1];
              setGeneratedAudio(b64); // Storing as base64 to match audioRef logic below
          };

          addLog("Audio processing complete. Ready.");
      } else {
          addLog("Generation completed but no audio returned.");
      }
    } catch (error) {
      console.error("Voice generation failed", error);
      addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (generatedAudio) {
        // We generated a WAV, so use correct mime type
        const audioSrc = `data:audio/wav;base64,${generatedAudio}`;
        if (audioRef.current) {
            audioRef.current.src = audioSrc;
            audioRef.current.load();
        } else {
            audioRef.current = new Audio(audioSrc);
        }
        audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [generatedAudio]);

  const togglePlay = () => {
    if (!audioRef.current || !generatedAudio) return;
    if (isPlaying) {
        audioRef.current.pause();
    } else {
        audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const downloadAudio = () => {
      if (!generatedAudio) return;
      const link = document.createElement('a');
      link.href = `data:audio/wav;base64,${generatedAudio}`;
      link.download = `voice_generation_${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- Render ---

  return (
    <div className="relative flex flex-col">
        
        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-32">
            
            {/* LEFT COLUMN: VOICE LIBRARY (25%) */}
            <div className="col-span-1 md:col-span-3 flex flex-col animate-fadeIn" style={{ animationDelay: '100ms' }}>
                <ControlModule title="Voice Library" icon={<BookHeart size={18}/>}>
                    <div className="space-y-1">
                        {VOICE_CATEGORIES.map(cat => (
                            <AccordionItem 
                                key={cat.id} 
                                title={cat.name} 
                                icon={<cat.icon size={14}/>}
                                isOpen={openCategories.includes(cat.id)}
                                onToggle={() => toggleCategory(cat.id)}
                            >
                                {cat.voices.map(voice => (
                                    <VoiceOption 
                                        key={voice.id} 
                                        voice={voice} 
                                        isSelected={selectedVoice?.id === voice.id} 
                                        onClick={() => setSelectedVoice(voice)} 
                                    />
                                ))}
                            </AccordionItem>
                        ))}
                    </div>
                </ControlModule>
            </div>

            {/* CENTER COLUMN: VOICE BUILDER (50%) */}
            <div className="col-span-1 md:col-span-6 flex flex-col animate-fadeIn space-y-6" style={{ animationDelay: '200ms' }}>
                
                {/* Description & Vibe */}
                <ControlModule title="Voice Builder" icon={<Sliders size={18}/>}>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Voice Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the voice style, accent, and tone you want..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 placeholder-gray-600 resize-none h-24 transition-all"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                             <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Personality / Vibe</label>
                            <div className="relative">
                                <select 
                                    value={selectedEmotion}
                                    onChange={(e) => setSelectedEmotion(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-gray-200 appearance-none cursor-pointer hover:bg-white/5 transition-colors focus:ring-2 focus:ring-purple-500"
                                >
                                    {VOICE_EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-3.5 text-gray-500 pointer-events-none"/>
                            </div>
                        </div>
                         <div className="col-span-2 md:col-span-1">
                             <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Voice Cloning</label>
                             <div className="border border-dashed border-white/20 rounded-xl p-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors h-[46px]">
                                <Upload size={16} className="text-purple-400" />
                                <span className="text-xs text-gray-400 font-medium">Drop audio to clone...</span>
                             </div>
                        </div>
                    </div>
                </ControlModule>

                {/* Parameters Sliders */}
                <ControlModule title="Fine-Tuning Parameters" icon={<Activity size={18}/>}>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-8 px-2 py-2">
                        <RangeSlider label="Speed" value={speed} onChange={setSpeed} />
                        <RangeSlider label="Pitch" value={pitch} onChange={setPitch} />
                        <RangeSlider label="Emotion Strength" value={emotionStrength} onChange={setEmotionStrength} />
                        <RangeSlider label="Reverb / Echo" value={reverb} onChange={setReverb} />
                        <RangeSlider label="Breathing" value={breathing} onChange={setBreathing} />
                        <RangeSlider label="Clarity" value={clarity} onChange={setClarity} />
                    </div>
                </ControlModule>

                {/* Background Audio Layer Grid */}
                <ControlModule title="Background Audio Layer" icon={<Layers size={18}/>}>
                     <div className="space-y-6">
                         <div className="grid grid-cols-4 lg:grid-cols-5 gap-3">
                            {BACKGROUND_LAYERS.map(bg => (
                                <BackgroundLayerTile 
                                    key={bg.id}
                                    layer={bg}
                                    isSelected={selectedBgLayer === bg.id}
                                    onClick={() => setSelectedBgLayer(bg.id)}
                                />
                            ))}
                         </div>
                         {selectedBgLayer !== 'none' && (
                            <div className="pt-4 border-t border-white/5">
                                <RangeSlider label="Background Volume" value={bgVolume} onChange={setBgVolume} />
                            </div>
                         )}
                     </div>
                </ControlModule>
            </div>

            {/* RIGHT COLUMN: SCRIPT + OUTPUT (25%) */}
            <div className="col-span-1 md:col-span-3 flex flex-col gap-6 animate-fadeIn" style={{ animationDelay: '300ms' }}>
                
                {/* Script Editor */}
                <ControlModule title="Script Editor" icon={<FileAudio size={18}/>} className="min-h-[300px]" 
                    action={<span className="text-[10px] font-mono text-gray-500 bg-black/40 px-2 py-0.5 rounded border border-white/5">{script.length} chars</span>}>
                    <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="Enter the text you want the AI to speak..."
                        className="w-full h-full min-h-[200px] bg-transparent border-none focus:ring-0 text-sm text-gray-200 placeholder-gray-600 resize-none leading-relaxed font-mono p-0"
                    />
                </ControlModule>

                {/* Audio Player */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-lg bg-black/40 relative overflow-hidden">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Music size={14} className="text-purple-400"/> Audio Preview
                    </h3>
                    
                    {/* Visualizer */}
                    <div className="h-32 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center gap-1 mb-6 overflow-hidden relative">
                         {generatedAudio ? (
                             <>
                                {Array.from({ length: 50 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-1 rounded-full transition-all duration-100 ${isPlaying ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'bg-purple-900/40'}`}
                                        style={{ 
                                            height: `${Math.max(10, Math.random() * 80)}%`,
                                            opacity: isPlaying ? 1 : 0.5
                                        }} 
                                    />
                                ))}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <button onClick={togglePlay} className="bg-white text-black rounded-full p-4 hover:scale-110 transition-transform shadow-xl">
                                        {isPlaying ? <Pause size={24} fill="black"/> : <Play size={24} fill="black" className="ml-1"/>}
                                    </button>
                                </div>
                             </>
                         ) : (
                             <div className="flex flex-col items-center gap-3 opacity-30">
                                 <Activity size={32} />
                                 <span className="text-xs font-bold tracking-widest">NO AUDIO</span>
                             </div>
                         )}
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={downloadAudio} disabled={!generatedAudio} className="col-span-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            <Download size={16} /> Export Audio File
                        </button>
                        <button disabled className="bg-black/20 text-gray-500 border border-white/5 rounded-lg py-2 text-[10px] font-bold">MP3 (Pro)</button>
                        <button disabled className="bg-black/20 text-gray-300 border border-white/5 rounded-lg py-2 text-[10px] font-bold">WAV</button>
                    </div>
                </div>

                {/* System Log */}
                <div className="h-40 bg-black/60 rounded-2xl border border-white/10 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar shadow-inner">
                    <div className="text-gray-500 mb-2 font-bold uppercase">System Console</div>
                    {systemLog.map((log, i) => (
                        <div key={i} className="mb-1 text-gray-400 border-l-2 border-purple-500/30 pl-2 leading-tight">
                            {log}
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>

        </div>

        {/* BOTTOM BAR: GLOBAL CONTROLS (Fixed) */}
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#0c0a09]/95 backdrop-blur-xl border-t border-white/10 px-8 flex items-center justify-between z-50 shadow-[0_-5px_30px_rgba(0,0,0,0.5)]">
            
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-3 text-gray-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    <Clock size={18} className="text-purple-400" />
                    <span className="text-sm font-bold">Max Duration: <span className="text-white">2 Hours</span></span>
                </div>
                <div className="hidden md:flex items-center gap-3">
                   <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">API Key</span>
                   <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-300 transition-colors font-medium">
                      <KeyRound size={14} /> Select Key
                   </button>
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 ml-auto">
                <div className="hidden md:flex items-center gap-3 mr-4">
                    <input type="checkbox" id="long-gen" className="w-4 h-4 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-0 cursor-pointer"/>
                    <label htmlFor="long-gen" className="text-sm text-gray-300 font-medium cursor-pointer select-none">Enable Long Generation</label>
                </div>

                <button 
                    className="hidden md:flex px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all transform hover:scale-105 active:scale-95 items-center gap-2 text-sm"
                >
                    <Layers size={18} /> Variations
                </button>

                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`px-6 md:px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${isGenerating ? 'animate-pulse' : ''}`}
                >
                    {isGenerating ? <Wand2 size={18} className="animate-spin"/> : <Sparkles size={18} />} 
                    {isGenerating ? 'Generating...' : 'Generate Voice'}
                </button>
            </div>

        </div>
    </div>
  );
};
