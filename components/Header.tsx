
import React from 'react';
import { SparklesIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-3">
        <SparklesIcon className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
          Photorealistic Transformer
        </h1>
      </div>
      <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
        Turn your AI-generated images into stunningly real photos. Artifacts removed, quality enhanced.
      </p>
    </header>
  );
};
