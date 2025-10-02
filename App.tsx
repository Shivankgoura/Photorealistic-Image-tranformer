
import React, { useState, useCallback } from 'react';
import { Controls } from './components/Controls';
import { ComparisonDisplay } from './components/ComparisonDisplay';
import { transformImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { Header } from './components/Header';

// Define a type for our settings for better type safety
export interface TransformSettings {
  realism: number;
  detail: number;
  quality: '2x' | '4x' | '8K+';
  aspectRatio: 'Original' | '1:1' | '4:3' | '16:9';
}

const App: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<TransformSettings>({
    realism: 75,
    detail: 80,
    quality: '4x',
    aspectRatio: 'Original',
  });

  const handleImageUpload = useCallback((file: File) => {
    setOriginalFile(file);
    setTransformedImage(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleTransform = async () => {
    if (!originalFile) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTransformedImage(null);

    try {
      const { base64Data, mimeType } = await fileToBase64(originalFile);
      
      // New multi-step prompt for ultra-realism
      let prompt = `Follow this multi-step process to transform the input image into an ultra-realistic photograph.

**Phase 1: Foundational Correction & De-artifacting**
1.  Analyze the input image to identify it as AI-generated.
2.  Perform a thorough de-artifacting pass. Eliminate all digital artifacts, including banding, noise, pixelation, and unnatural smoothness. The goal is to create a clean, raw photographic base.

**Phase 2: Hyper-Realistic Human Enhancement (Conditional)**
*IMPORTANT: If human subjects are present, execute the following steps with extreme precision:*
1.  **Skin Texture:** Reconstruct skin to be hyper-realistic at a detail level of ${settings.detail}/100. Introduce lifelike imperfections: pores, subtle wrinkles, and natural tonal variations. Avoid overly smooth, 'plastic' skin.
2.  **Facial Features:** Enhance eyes for clarity, adding realistic reflections (catchlights) and depth. Ensure hair has individual strand detail.
3.  **Anatomy & Expression:** Verify and correct anatomical proportions for realism. Ensure facial expressions are natural and convey subtle emotion, not uncanny.

**Phase 3: Photographic & Cinematic Emulation**
1.  **Camera Simulation:** Simulate a high-end DSLR camera with a prime 85mm f/1.4 lens to create a natural, shallow depth of field and tack-sharp focus on the subject.
2.  **Lighting:** Apply complex, cinematic lighting with soft key lights, subtle fill lights, and rim lighting to add depth. The overall realism should be ${settings.realism}/100.
3.  **Color Grading:** Perform professional color grading for true-to-life skin tones and a balanced, natural color palette. Apply HDR for a high dynamic range.

**Phase 4: AI Pixel Enhancement & Upscaling**
1.  Execute an advanced AI pixel enhancement and upscaling process to increase the image resolution to the target quality of '${settings.quality}'.
2.  This process must generate new, plausible detail, not just enlarge existing pixels. The final output must have extreme clarity and detail suitable for 8K displays or large prints.
`;

      if (settings.aspectRatio !== 'Original') {
        prompt += `
**Phase 5: Composition**
Adjust the final aspect ratio to ${settings.aspectRatio}. If cropping is required, use a rule-of-thirds composition to keep the primary subject in focus.
`;
      }
      
      const transformedBase64 = await transformImage(base64Data, mimeType, prompt);

      if(transformedBase64) {
        setTransformedImage(`data:image/png;base64,${transformedBase64}`);
      } else {
        throw new Error("The transformation returned an empty image. Please try again.");
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during transformation.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const reset = () => {
    setOriginalFile(null);
    setOriginalImagePreview(null);
    setTransformedImage(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl">
        <Header />
        <main className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col space-y-4">
               <h2 className="text-xl font-semibold text-gray-300">1. Upload & Configure</h2>
               <Controls 
                onImageUpload={handleImageUpload}
                preview={originalImagePreview}
                onTransform={handleTransform}
                isLoading={isLoading}
                settings={settings}
                onSettingsChange={setSettings}
                onReset={reset}
              />
            </div>
            <div className="lg:col-span-2 flex flex-col space-y-4">
               <h2 className="text-xl font-semibold text-gray-300">2. Get Photorealistic Result</h2>
               <ComparisonDisplay
                  originalImage={originalImagePreview}
                  transformedImage={transformedImage}
                  isLoading={isLoading}
                  error={error}
                />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
