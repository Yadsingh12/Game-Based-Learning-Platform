import React, { useState } from 'react';
import SignVisual from '../components/SignVisual';

export default function LearnGame({ data, pack, category, assets, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSign = data?.signs?.[currentIndex];

  if (!currentSign) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading sign...
      </div>
    );
  }

  const total = data.signs.length;
  const isLast = currentIndex === total - 1;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${category.colorScheme.gradient} px-4 py-6`}>
      <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-5 sm:p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Learn</h2>
            <p className="text-sm text-gray-600">
              {category.name} · {pack.name}
            </p>
          </div>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / total) * 100}%`,
              backgroundColor: category.colorScheme.primary,
            }}
          />
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">

          {/* VIDEO (Primary) */}
          <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
            {currentSign.videoUrl && assets?.videos?.[currentSign.videoUrl] && (
              <video
                src={assets.videos[currentSign.videoUrl].src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="flex flex-col gap-4">

            {/* VISUAL */}
            <div className="h-48 rounded-xl bg-gray-100 flex items-center justify-center shadow-inner">
              <SignVisual
                visual={currentSign.visual}
                assets={assets}
                className="w-full h-full object-contain"
              />
            </div>

            {/* TEXT */}
            <div className="text-center">
              <h3 className="text-3xl font-extrabold text-gray-800 tracking-wide">
                {currentSign.name}
              </h3>

              {currentSign.description && (
                <p className="mt-2 text-gray-600">
                  {currentSign.description}
                </p>
              )}

              {currentSign.meta && (
                <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm">
                  {Object.entries(currentSign.meta).map(([k, v]) => (
                    <span
                      key={k}
                      className="px-3 py-1 rounded-full bg-gray-200 text-gray-700"
                    >
                      {k}: {v}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* CONTROLS */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            Previous
          </button>

          {isLast ? (
            <button
              onClick={() => onExit(100)}
              className="flex-1 py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: category.colorScheme.primary }}
            >
              Complete
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(i => i + 1)}
              className="flex-1 py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: category.colorScheme.primary }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
