import React, { useState } from 'react';
import SignVisual from '../components/SignVisual';

export default function LearnGame({ data, pack, category, assets, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const signs = data?.signs ?? [];
  const currentSign = signs[currentIndex];

  if (!currentSign) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0f0a1e] text-white/50">
        Loading sign...
      </div>
    );
  }

  const total = signs.length;
  const isLast = currentIndex === total - 1;
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="h-full flex flex-col bg-[#0f0a1e] overflow-hidden relative">

      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px]
                      bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px]
                      bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex-none px-4 pt-4 pb-3 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">Learn</h2>
            <p className="text-xs text-white/40 font-medium">{category.name} · {pack.name}</p>
          </div>
          <span className="text-sm font-bold text-white/60 bg-white/10 border border-white/10 px-3 py-1 rounded-full">
            {currentIndex + 1} / {total}
          </span>
        </div>
        {/* Progress bar */}
        <div className="max-w-5xl mx-auto mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
            }}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-4 min-h-0">
        <div className="w-full max-w-5xl h-full flex flex-col bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl overflow-hidden">

          {/* Content */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

            {/* Video */}
            <div className="flex-1 flex items-center justify-center p-3 sm:p-4 min-h-0 lg:border-r border-b lg:border-b-0 border-white/10">
              <div className="w-full h-full max-h-full rounded-2xl overflow-hidden ring-1 ring-white/10">
                {currentSign.videoUrl ? (
                  <video
                    key={assets?.videos?.[currentSign.videoUrl] ?? currentSign.videoUrl}
                    src={assets?.videos?.[currentSign.videoUrl] ?? currentSign.videoUrl}
                    autoPlay loop muted playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
                    No video available
                  </div>
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-3 sm:p-5 min-h-0">

              {/* Visual */}
              <div className="flex-1 w-full min-h-0 rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden flex items-center justify-center">
                <SignVisual
                  visual={currentSign.visual}
                  assets={assets}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Text info */}
              <div className="flex-shrink-0 text-center w-full">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                  {currentSign.name}
                </h3>

                {currentSign.description && (
                  <p className="mt-1 text-sm sm:text-base text-white/50 line-clamp-2">
                    {currentSign.description}
                  </p>
                )}

                {currentSign.meta && (
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5 text-xs sm:text-sm">
                    {Object.entries(currentSign.meta).map(([k, v]) => (
                      <span key={k} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/60">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-none flex gap-3 px-4 py-3 border-t border-white/10 bg-white/5">
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex-1 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white/60 font-bold
                         disabled:opacity-30 hover:bg-white/15 hover:text-white transition-all"
            >
              ← Previous
            </button>
            {isLast ? (
              <button
                onClick={() => onExit(100)}
                className="flex-1 py-2.5 rounded-xl font-bold text-white shadow-lg
                           bg-gradient-to-r from-violet-600 to-blue-600
                           hover:opacity-90 active:scale-[0.98] transition-all"
              >
                ✓ Complete
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(i => i + 1)}
                className="flex-1 py-2.5 rounded-xl font-bold text-white shadow-lg
                           bg-gradient-to-r from-violet-600 to-blue-600
                           hover:opacity-90 active:scale-[0.98] transition-all"
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