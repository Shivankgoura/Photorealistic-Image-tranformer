
import React, { useState } from 'react';
import { DownloadIcon, PhotoIcon, SpinnerIcon, ErrorIcon, ShareIcon } from './icons';

interface ComparisonDisplayProps {
  originalImage: string | null;
  transformedImage: string | null;
  isLoading: boolean;
  error: string | null;
}

const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) {
        return null;
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        return null;
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

export const ComparisonDisplay: React.FC<ComparisonDisplayProps> = ({ originalImage, transformedImage, isLoading, error }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleShare = async () => {
    if (navigator.share && transformedImage) {
        const file = dataURLtoFile(transformedImage, 'transformed-image.png');
        if (file) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Photorealistic Image',
                    text: 'Check out this image I transformed!',
                });
            } catch (err) {
                console.error("Share failed:", err);
            }
        }
    } else {
        alert('Web Share API is not supported in your browser, or there is no image to share.');
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <SpinnerIcon className="w-12 h-12 animate-spin text-indigo-400" />
          <p className="mt-4 text-lg font-medium">Enhancing Realism...</p>
          <p className="text-sm text-gray-500">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-red-400 text-center">
            <ErrorIcon className="w-12 h-12 mb-2" />
            <p className="font-semibold">Transformation Failed</p>
            <p className="text-sm text-red-500 max-w-sm">{error}</p>
        </div>
      );
    }

    if (originalImage && transformedImage) {
      return (
        <div className="w-full h-full flex flex-col space-y-4">
            <div className="relative w-full aspect-video rounded-md overflow-hidden select-none group bg-gray-900/50">
                <img src={originalImage} alt="Original" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                    <img src={transformedImage} alt="Transformed" className="absolute inset-0 w-full h-full object-contain" />
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full cursor-col-resize opacity-0"
                    aria-label="Before and after image comparison slider"
                />
                <div className="absolute top-0 bottom-0 bg-white w-1 transition-opacity duration-300 opacity-50 group-hover:opacity-100" style={{ left: `${sliderPosition}%`, pointerEvents: 'none', transform: 'translateX(-50%)' }}>
                    <div className="absolute top-1/2 -translate-y-1/2 -left-4 bg-white rounded-full p-1 shadow-lg border-2 border-gray-800">
                        <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                    </div>
                </div>
                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">BEFORE</div>
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded" style={{ clipPath: `inset(0 0 0 ${100-sliderPosition}%)` }}>AFTER</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <a
                    href={transformedImage}
                    download="transformed-image.png"
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Download
                </a>
                <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-sky-500 transition-colors duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed"
                    disabled={typeof navigator.share === 'undefined'}
                >
                    <ShareIcon className="w-5 h-5" />
                    Share
                </button>
            </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-gray-500 text-center">
        <PhotoIcon className="w-16 h-16" />
        <p className="mt-2 font-medium">Your transformed image will appear here</p>
        <p className="text-sm mt-1">Use the slider to compare before and after.</p>
      </div>
    );
  };

  return (
    <div className="w-full h-full min-h-[400px] lg:aspect-video lg:max-h-[570px] bg-gray-800 border-2 border-gray-700 rounded-lg p-4 flex items-center justify-center">
      {renderContent()}
    </div>
  );
};
