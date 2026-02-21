import React, { useState } from 'react';
import SignVisual from '../components/SignVisual';

export default function LearnGame({ data, pack, category, assets, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const signs = data?.signs ?? [];
  const currentSign = signs[currentIndex];

  if (!currentSign) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        Loading sign...
      </div>
    );
  }

  const total = signs.length;
  const isLast = currentIndex === total - 1;

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br ${category.colorScheme.gradient} overflow-hidden`}>

      {/* ── Header ── */}
      <div className="flex-none bg-white/20 backdrop-blur-sm px-4 pt-3 pb-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow">Learn</h2>
            <p className="text-xs text-white/70">{category.name} · {pack.name}</p>
          </div>
          <span className="text-sm font-semibold text-white/80 bg-white/20 px-3 py-1 rounded-full">
            {currentIndex + 1} / {total}
          </span>
        </div>
        {/* Progress bar */}
        <div className="max-w-5xl mx-auto mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / total) * 100}%`,
              backgroundColor: 'white',
            }}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 min-h-0">
        <div className="w-full max-w-5xl h-full flex flex-col bg-white/90 backdrop-blur rounded-3xl shadow-2xl overflow-hidden">

          {/* Content area */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden gap-0">

            {/* Video — left on lg, top on mobile */}
            <div className="flex-1 flex items-center justify-center p-3 sm:p-4 min-h-0 lg:border-r border-b lg:border-b-0 border-gray-100">
              <div className={"w-full h-full max-h-full rounded-2xl overflow-hidden shadow-lg"}>
                {currentSign.videoUrl ? (
                  <video
                    key={assets?.videos?.[currentSign.videoUrl] ?? currentSign.videoUrl}
                    src={assets?.videos?.[currentSign.videoUrl] ?? currentSign.videoUrl}
                    autoPlay loop muted playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                    No video available
                  </div>
                )}
              </div>
            </div>

            {/* Right panel — visual + text */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-3 sm:p-5 min-h-0">

              {/* Visual */}
              <div className="flex-1 w-full min-h-0 rounded-2xl bg-gray-100 shadow-inner overflow-hidden flex items-center justify-center">
                <SignVisual
                  visual={currentSign.visual}
                  assets={assets}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Text info */}
              <div className="flex-shrink-0 text-center w-full">
                <h3
                  className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-wide"
                >
                  {currentSign.name}
                </h3>

                {currentSign.description && (
                  <p className="mt-1 text-sm sm:text-base text-gray-600 line-clamp-2">
                    {currentSign.description}
                  </p>
                )}

                {currentSign.meta && (
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5 text-xs sm:text-sm">
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

          {/* ── Controls — always pinned at bottom ── */}
          <div className="flex-none flex gap-3 px-4 py-3 border-t border-gray-100 bg-white/60">
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex-1 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-semibold disabled:opacity-40 hover:bg-gray-300 transition-colors"
            >
              ← Previous
            </button>
            {isLast ? (
              <button
                onClick={() => onExit(100)}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: category.colorScheme.primary }}
              >
                ✓ Complete
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(i => i + 1)}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: category.colorScheme.primary }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}