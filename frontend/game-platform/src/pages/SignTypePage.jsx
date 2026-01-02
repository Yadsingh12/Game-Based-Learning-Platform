// frontend/game-platform/src/components/SignTypePage.jsx
// this component displays available sign packs for a selected category

import React, { useState } from 'react';
import { Play } from 'lucide-react';
import LoadingScreen from '../pages/LoadingScreen';
import { loadPack } from '../utils/storage';

export default function SignTypePage({ category, onSelectPack, onBack }) {
  const [loadingPack, setLoadingPack] = useState(null);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });

  const handlePackClick = async (pack) => {
    setLoadingPack(pack.name);
    setProgress({ loaded: 0, total: 0 });

    const { data, assets } = await loadPack(pack.dataFile, (loaded, total) => {
      setProgress({ loaded, total });
    });

    if (data) {
      onSelectPack({ ...pack, data, assets });
    }

    setLoadingPack(null);
  };

  if (loadingPack) {
    return (
      <LoadingScreen
        packName={loadingPack}
        loaded={progress.loaded}
        total={progress.total}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${category.colorScheme.gradient} p-6`}>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
        >
          ← Back
        </button>

        <h2 className="text-3xl font-bold text-white mb-6">{category.name}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.packs.map(pack => (
            <div
              key={pack.id}
              onClick={() => handlePackClick(pack)}
              className="card card-interactive"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">{pack.name}</h3>
              <p className="text-gray-600 mb-3">{pack.range}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{pack.signCount} signs</span>
                <Play style={{ color: category.colorScheme.primary }} size={24} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
