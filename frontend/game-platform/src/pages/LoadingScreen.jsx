// frontend/game-platform/src/components/LoadingScreen.jsx
// this component shows a loading screen with progress for loading sign packs

import React from 'react';

export default function LoadingScreen({ packName, loaded = 0, total = 0 }) {
  const progress = total > 0 ? Math.round((loaded / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
      <div className="text-center w-80">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-xl font-semibold">
          Loading {packName}...
        </p>
        <p className="text-white/80 mt-2">
          Preparing videos and content
        </p>
        {total > 0 && (
          <div className="mt-4 w-full bg-white/20 rounded-full h-4">
            <div
              className="h-4 bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        {total > 0 && <p className="text-white/80 mt-1">{loaded}/{total} assets loaded</p>}
      </div>
    </div>
  );
}
