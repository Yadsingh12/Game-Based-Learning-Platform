// src/games/BucketGame.jsx

import React, { useState } from "react";

export default function BucketGame({ data, pack, category, assets, onExit }) {
  const signs     = data?.signs ?? [];
  const maxNumber = signs.length - 1;
  const colors    = category?.colorScheme ?? {
    primary: "#7c3aed", secondary: "#3b82f6",
    gradient: "from-purple-600 to-blue-600",
  };

  const [currentRound, setCurrentRound] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * signs.length));
  const [waterLevel, setWaterLevel]     = useState(0);
  const [message, setMessage]           = useState(null); // null | 'correct' | 'wrong'
  const [locked, setLocked]             = useState(false);
  const [score, setScore]               = useState(0);

  const TOTAL_ROUNDS = 5;

  if (!signs.length) return (
    <div className="h-full flex items-center justify-center">
      <p className="text-red-500 font-semibold">No data available</p>
    </div>
  );

  const currentSign  = signs[currentIndex];
  const targetNumber = parseInt(currentSign.id);
  const waterPct     = (waterLevel / maxNumber) * 100;

  const handleConfirm = () => {
    if (locked) return;
    setLocked(true);

    if (waterLevel === targetNumber) {
      setScore(s => s + 1);
      setMessage("correct");
      setTimeout(nextRound, 1400);
    } else {
      setMessage("wrong");
      setTimeout(() => { setLocked(false); setMessage(null); }, 1000);
    }
  };

  const nextRound = () => {
    if (currentRound >= TOTAL_ROUNDS) {
      onExit(Math.round((score + (message === "correct" ? 1 : 0)) / TOTAL_ROUNDS * 100));
      return;
    }
    setCurrentIndex(Math.floor(Math.random() * signs.length));
    setCurrentRound(r => r + 1);
    setWaterLevel(0);
    setLocked(false);
    setMessage(null);
  };

  // Water colour shifts blue→teal as it fills
  const waterColor = `linear-gradient(to top,
    hsl(${195 + waterPct * 0.3}, 90%, 48%),
    hsl(${205 + waterPct * 0.2}, 85%, 68%))`;

  return (
    <div className={`h-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center p-3 sm:p-5`}>
      <div className="w-full max-w-3xl h-full flex flex-col lg:flex-row gap-4 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-4 sm:p-6 overflow-hidden">

        {/* ── Left / Top: Video + header ──────────────────── */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">

          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Bucket Game</h2>
              <p className="text-xs text-gray-500">{category?.name} · {pack?.name}</p>
            </div>
            {/* Score pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
              <span>Round <span className="text-gray-800">{currentRound}/{TOTAL_ROUNDS}</span></span>
              <div className="w-px h-3 bg-gray-300" />
              <span>Score <span className="text-gray-800">{score}</span></span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-shrink-0 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(currentRound / TOTAL_ROUNDS) * 100}%`,
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
              }}
            />
          </div>

          {/* Prompt */}
          <div className="flex-shrink-0 bg-gray-50 rounded-2xl px-4 py-2.5 text-center border border-gray-100">
            <p className="text-sm sm:text-base font-semibold text-gray-600">
              Watch the sign — fill the bucket to match the number
            </p>
          </div>

          {/* Video */}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <video
              key={currentSign.id}
              src={currentSign.videoUrl ? (assets?.videos?.[currentSign.videoUrl] ?? currentSign.videoUrl) : null}
              autoPlay loop muted playsInline
              className="w-full h-full max-h-full rounded-2xl shadow-lg object-contain bg-black/5"
            />
          </div>
        </div>

        {/* ── Right / Bottom: Bucket + controls ───────────── */}
        <div className="flex-1 flex flex-col items-center justify-between gap-3 min-h-0">

          {/* Bucket + level number side by side — frees up vertical space */}
          <div className="flex-1 flex items-center justify-center min-h-0 w-full py-2 gap-4">

            {/* Tick labels */}
            <div className="flex flex-col justify-between text-right h-full max-h-72 py-0.5 flex-shrink-0">
              <span className="text-xs font-bold text-gray-500">{maxNumber}</span>
              <span className="text-xs font-bold text-gray-400">{Math.round(maxNumber / 2)}</span>
              <span className="text-xs font-bold text-gray-500">0</span>
            </div>

            {/* Bucket */}
            <div className="relative w-24 sm:w-32 h-full max-h-72 flex-shrink-0">
              {/* Rim */}
              <div
                className="absolute -top-1.5 -left-1 -right-1 h-3 rounded-full z-10"
                style={{ background: colors.primary + '33', border: `2px solid ${colors.primary}66` }}
              />
              {/* Body */}
              <div
                className="absolute inset-0 rounded-b-3xl overflow-hidden"
                style={{ border: `3px solid ${colors.primary}44`, background: '#f1f5f9' }}
              >
                <div
                  className="absolute bottom-0 w-full transition-all duration-300 ease-out"
                  style={{ height: `${waterPct}%`, background: waterColor }}
                />
                {waterPct > 2 && (
                  <div
                    className="absolute w-full h-1.5 rounded-full"
                    style={{
                      bottom: `${waterPct}%`,
                      background: 'rgba(255,255,255,0.55)',
                      transform: 'translateY(50%)',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Current level number */}
            <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
              <span
                className="text-5xl sm:text-6xl font-black tabular-nums leading-none"
                style={{ color: colors.primary }}
              >
                {waterLevel}
              </span>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">level</p>
            </div>

          </div>

          {/* Slider */}
          <div className="flex-shrink-0 w-full space-y-2">
            <input
              type="range"
              min="0"
              max={maxNumber}
              value={waterLevel}
              onChange={e => !locked && setWaterLevel(parseInt(e.target.value))}
              disabled={locked}
              className="w-full h-3 rounded-full appearance-none cursor-pointer disabled:opacity-50"
              style={{ accentColor: colors.primary }}
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-medium px-0.5">
              <span>0</span>
              <span>{maxNumber}</span>
            </div>
          </div>

          {/* Confirm button + feedback */}
          <div className="flex-shrink-0 w-full space-y-2">
            <button
              onClick={handleConfirm}
              disabled={locked}
              className="w-full py-3 rounded-2xl font-bold text-white text-base tracking-wide
                         shadow-lg transition-all hover:scale-[1.02] active:scale-95
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              Confirm
            </button>

            {/* Feedback */}
            <div className="h-8 flex items-center justify-center">
              {message === "correct" && (
                <p className="text-green-600 font-bold text-base animate-bounce">✅ Correct!</p>
              )}
              {message === "wrong" && (
                <p className="text-red-500 font-bold text-base">❌ Not quite — try again!</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}