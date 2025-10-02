
import React, { useRef, useState } from 'react';
import { UploadIcon, TransformIcon, SettingsIcon, ResetIcon } from './icons';
import { TransformSettings } from '../App';

interface ControlsProps {
  onImageUpload: (file: File) => void;
  preview: string | null;
  onTransform: () => void;
  isLoading: boolean;
  settings: TransformSettings;
  onSettingsChange: (settings: TransformSettings) => void;
  onReset: () => void;
}

const SettingsPanel: React.FC<{ settings: TransformSettings, onSettingsChange: (settings: TransformSettings) => void}> = ({ settings, onSettingsChange }) => {
  
    const Slider = ({ label, value, onChange, helpText }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; helpText: string; }) => (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-300">{label}</label>
                <span className="text-sm font-mono bg-gray-700 text-indigo-300 px-2 py-0.5 rounded">{value}</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={onChange}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg"
                aria-label={label}
            />
            {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
        </div>
    );
  
    const ButtonGroup = ({ label, options, selected, onChange, helpText }: { label: string; options: string[]; selected: string; onChange: (value: any) => void; helpText: string; }) => (
        <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">{label}</label>
            <div className="grid grid-cols-4 gap-2">
                {options.map((option) => (
                    <button
                        key={option}
                        onClick={() => onChange(option)}
                        className={`text-center text-sm font-medium py-2 px-1 rounded-md transition-colors duration-200 ${
                            selected === option
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                        aria-pressed={selected === option}
                    >
                        {option}
                    </button>
                ))}
            </div>
            {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
        </div>
    );


    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
            <Slider
                label="Realism"
                value={settings.realism}
                onChange={(e) => onSettingsChange({ ...settings, realism: parseInt(e.target.value) })}
                helpText="Controls how photorealistic the output is."
            />
            <Slider
                label="Detail Enhancement"
                value={settings.detail}
                onChange={(e) => onSettingsChange({ ...settings, detail: parseInt(e.target.value) })}
                helpText="Sharpens and refines small details and textures."
            />
            <ButtonGroup
                label="Upscale Quality"
                options={['2x', '4x', '8K+']}
                selected={settings.quality}
                onChange={(quality) => onSettingsChange({ ...settings, quality })}
                helpText="Target resolution for the output image."
            />
            <ButtonGroup
                label="Aspect Ratio"
                options={['Original', '1:1', '4:3', '16:9']}
                selected={settings.aspectRatio}
                onChange={(aspectRatio) => onSettingsChange({ ...settings, aspectRatio })}
                helpText="Adjusts the final image dimensions."
            />
        </div>
    );
};


export const Controls: React.FC<ControlsProps> = ({ onImageUpload, preview, onTransform, isLoading, settings, onSettingsChange, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(true);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  if (!preview) {
    return (
        <div 
          role="button"
          tabIndex={0}
          className="w-full h-full bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center space-y-4 transition-all duration-300 hover:border-indigo-500 min-h-[400px] cursor-pointer"
          onClick={handleAreaClick}
          onKeyDown={(e) => e.key === 'Enter' && handleAreaClick()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
            />
            <div className="flex flex-col items-center justify-center text-gray-400 text-center py-12 pointer-events-none">
                <UploadIcon className="w-12 h-12 mb-2" />
                <p className="font-semibold">Click to upload or drag & drop</p>
                <p className="text-sm">PNG, JPG, or WEBP</p>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col space-y-4">
        <div className="relative w-full aspect-square max-h-[300px] overflow-hidden rounded-md group">
            <img src={preview} alt="Original preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-500 transition-colors"
                >
                    <ResetIcon className="w-5 h-5" />
                    Reset
                </button>
            </div>
        </div>

        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-200">Settings</h3>
            <button onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-white" aria-expanded={showSettings}>
                <SettingsIcon className="w-6 h-6" />
                <span className="sr-only">Toggle Settings</span>
            </button>
        </div>

        {showSettings && <SettingsPanel settings={settings} onSettingsChange={onSettingsChange} />}

        <button
            onClick={onTransform}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-indigo-500 transition-colors duration-200 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
            <TransformIcon className="w-5 h-5" />
            {isLoading ? 'Transforming...' : 'Make it Real'}
        </button>
    </div>
  );
};
