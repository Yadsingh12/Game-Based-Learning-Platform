// src/games/BucketGame.jsx
import React, { useState } from "react";

const BucketGame = ({ data, pack, category, assets, onExit }) => {
  const signs = data?.signs || [];
  const maxNumber = signs.length - 1; // 0-10 for numerals pack

  const [currentRound, setCurrentRound] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * signs.length)
  );
  const [waterLevel, setWaterLevel] = useState(0);
  const [message, setMessage] = useState("");
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);

  const TOTAL_ROUNDS = 5;

  if (!signs || signs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">No data available</p>
      </div>
    );
  }

  const currentSign = signs[currentIndex];
  const targetNumber = parseInt(currentSign.id);

  const handleSliderChange = (e) => {
    if (!locked) setWaterLevel(parseInt(e.target.value));
  };

  const handleConfirm = () => {
    setLocked(true);

    if (waterLevel === targetNumber) {
      setScore(score + 1);
      setMessage("✅ Correct!");
      setTimeout(() => {
        nextRound();
      }, 1500);
    } else {
      setMessage("❌ Try again!");
      setTimeout(() => {
        setLocked(false);
        setMessage("");
      }, 1000);
    }
  };

  const nextRound = () => {
    if (currentRound >= TOTAL_ROUNDS) {
      // End game after 5 rounds
      const percentage = Math.round((score / TOTAL_ROUNDS) * 100);
      onExit(percentage);
      return;
    }

    const next = Math.floor(Math.random() * signs.length);
    setCurrentIndex(next);
    setCurrentRound(currentRound + 1);
    setWaterLevel(0);
    setLocked(false);
    setMessage("");
  };

  const waterHeight = (waterLevel / maxNumber) * 100;

  return (
    <div className={`min-h-screen h-screen overflow-hidden bg-gradient-to-br ${category.colorScheme.gradient} flex items-center justify-center p-4`}>
      <div className="w-full max-w-2xl h-full max-h-[95vh] bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-4 sm:p-6 flex flex-col">
        
        {/* Header */}
        <div className="text-center mb-3 sm:mb-4 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
            🪣 Bucket Game
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            {category.name} · {pack.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Round {currentRound}/{TOTAL_ROUNDS} | Score: {score}
          </p>
        </div>

        {/* ISL Video */}
        <div className="flex justify-center mb-3 sm:mb-4 flex-shrink-0">
          <video
            key={currentSign.id}
            src={currentSign.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-w-xs sm:max-w-sm aspect-video rounded-2xl shadow-lg object-cover bg-black"
          />
        </div>

        {/* Bucket */}
        <div className="flex justify-center mb-3 sm:mb-4 flex-shrink-0">
          <div 
            className="relative bg-gray-200 rounded-b-3xl overflow-hidden shadow-inner"
            style={{
              width: 'min(180px, 35vw)',
              height: 'min(280px, 30vh)',
              border: '3px solid #555'
            }}
          >
            <div
              className="absolute bottom-0 w-full transition-all duration-300 ease-in-out"
              style={{
                height: `${waterHeight}%`,
                background: 'linear-gradient(to top, #00bfff, #87cefa)'
              }}
            />
          </div>
        </div>

        {/* Slider */}
        <div className="mb-3 sm:mb-4 flex-shrink-0">
          <input
            type="range"
            min="0"
            max={maxNumber}
            value={waterLevel}
            onChange={handleSliderChange}
            disabled={locked}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            style={{
              accentColor: category.colorScheme.primary
            }}
          />
          <p className="text-center mt-2 text-base sm:text-lg font-semibold text-gray-700">
            Water Level: {waterLevel}
          </p>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={locked}
          className="w-full py-2.5 sm:py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          style={{
            backgroundColor: locked ? '#ccc' : category.colorScheme.primary
          }}
        >
          Confirm
        </button>

        {/* Message - Fixed height to prevent layout shift */}
        <div className="h-8 sm:h-10 flex items-center justify-center flex-shrink-0">
          {message && (
            <p className={`text-lg sm:text-xl font-bold ${
              message.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BucketGame;