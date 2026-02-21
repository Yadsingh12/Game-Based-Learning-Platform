// src/pages/SignTypePage.jsx
// Displays available sign packs for a selected category.
// Handles JSON fetch + media preload with progress UI here,
// caches result in mediaCache so packLoader never re-fetches.

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import LoadingScreen from './LoadingScreen';
import { preloadPackMedia } from '../utils/mediaCache';
import categoriesData from '../data/categories.json';

export default function SignTypePage() {
  const { category: categoryId } = useParams();
  const navigate = useNavigate();

  const category = categoriesData.categories.find(c => c.id === categoryId);

  const [loadingPack, setLoadingPack] = useState(null);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Category not found.</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handlePackClick = async (pack) => {
    setLoadingPack(pack.name);
    setProgress({ loaded: 0, total: 0 });

    // 1. Fetch pack JSON
    const res = await fetch(`/data/packs/${pack.dataFile}`);
    if (!res.ok) {
      console.error('Failed to fetch pack:', pack.dataFile);
      setLoadingPack(null);
      return;
    }
    const packJson = await res.json();

    // 2. Preload all media with progress — result is cached in mediaCache.
    //    packLoader will find it in cache and skip re-fetching entirely.
    await preloadPackMedia(pack.id, packJson, (loaded, total) => {
      setProgress({ loaded, total });
    });

    setLoadingPack(null);
    navigate(`/${categoryId}/${pack.id}`);
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
          onClick={() => navigate('/')}
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