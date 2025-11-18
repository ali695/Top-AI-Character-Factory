import React from 'react';
import { ChevronDown } from 'lucide-react';
import { BATCH_SIZES, ASPECT_RATIOS, DETAIL_LEVELS } from '../constants';

interface QualityControlsProps {
  batchSize: number;
  setBatchSize: (size: number) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  detailLevel: { id: string, name: string, prompt_suffix: string };
  setDetailLevel: (level: { id: string, name: string, prompt_suffix: string }) => void;
  imageFormat: 'image/png' | 'image/jpeg';
  setImageFormat: (format: 'image/png' | 'image/jpeg') => void;
  enhanceQuality: boolean;
  setEnhanceQuality: (enhanced: boolean) => void;
}

const ControlWrapper: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    {children}
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string; disabled?: boolean; }> = ({ checked, onChange, label, disabled = false }) => (
  <div className="flex items-center justify-between">
    <span className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-300'}`}>{label}</span>
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        checked ? 'bg-purple-600' : 'bg-black/20'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

const CustomSelect: React.FC<{ value: string | number; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; }> = ({ value, onChange, children }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-black/20 border border-white/10 rounded-lg p-2 appearance-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-sm"
    >
      {children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
      <ChevronDown size={16} />
    </div>
  </div>
);

export const QualityControls: React.FC<QualityControlsProps> = (props) => {

  return (
    <div className="grid grid-cols-2 gap-4">
      <ControlWrapper label="Batch Size">
        <CustomSelect value={props.batchSize} onChange={(e) => props.setBatchSize(Number(e.target.value))}>
          {BATCH_SIZES.map(size => <option key={size} value={size} className="bg-gray-900">{size} Images</option>)}
        </CustomSelect>
      </ControlWrapper>
      <ControlWrapper label="Aspect Ratio">
         <CustomSelect value={props.aspectRatio} onChange={(e) => props.setAspectRatio(e.target.value)}>
          {ASPECT_RATIOS.map(ratio => <option key={ratio.id} value={ratio.id} className="bg-gray-900">{ratio.name}</option>)}
        </CustomSelect>
      </ControlWrapper>
      <ControlWrapper label="Detail Level">
         <CustomSelect value={props.detailLevel.id} onChange={(e) => props.setDetailLevel(DETAIL_LEVELS.find(l => l.id === e.target.value) || DETAIL_LEVELS[2])}>
          {DETAIL_LEVELS.map(level => <option key={level.id} value={level.id} className="bg-gray-900">{level.name}</option>)}
        </CustomSelect>
      </ControlWrapper>
      <ControlWrapper label="Image Format">
        <div className="flex items-center bg-black/20 border border-white/10 rounded-lg p-1">
          <button onClick={() => props.setImageFormat('image/png')} className={`flex-1 text-xs font-semibold py-1 rounded-md transition-colors ${props.imageFormat === 'image/png' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}>PNG</button>
          <button onClick={() => props.setImageFormat('image/jpeg')} className={`flex-1 text-xs font-semibold py-1 rounded-md transition-colors ${props.imageFormat === 'image/jpeg' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}>JPG</button>
        </div>
      </ControlWrapper>
      <div className="col-span-2 mt-2">
        <Toggle 
          label="Enhance Quality (3D Style)" 
          checked={props.enhanceQuality} 
          onChange={props.setEnhanceQuality}
        />
      </div>
    </div>
  );
};