// src/components/games/DragDropMatchGame.jsx
// Drag and drop matching game with responsive layout

import React, { useState, useEffect } from "react";
import { HelpCircle, Timer, Trophy } from "lucide-react";
import SignVisual from "../components/SignVisual";

const GAME_TIME = 60;
const TOTAL_PAIRS = 5;
const POINTS_PER_CORRECT = 20;
const PENALTY_PER_WRONG = 5;

export default function DragDropMatchGame(props) {
  const signs = props.signs || props.data?.signs || props.data || [];
  const onComplete = props.onComplete || props.onExit;
  const category = props.category || {};
  const assets = props.assets || {};
  
  const colors = category.colorScheme || {
    primary: "#7c3aed",
    secondary: "#3b82f6",
    light: "#c4b5fd",
    dark: "#5b21b6",
    gradient: "from-purple-600 to-blue-600"
  };

  const [gameItems, setGameItems] = useState([]);
  const [shuffledVideos, setShuffledVideos] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [draggedItem, setDraggedItem] = useState(null);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [wrongMatchFlash, setWrongMatchFlash] = useState({ image: null, video: null });

  const selectGameItems = () => {
    const validSigns = signs.filter(sign => sign.name && sign.videoUrl && sign.visual);
    if (validSigns.length < TOTAL_PAIRS) return [];
    const shuffled = [...validSigns].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, TOTAL_PAIRS);
  };

  useEffect(() => {
    if (signs.length >= TOTAL_PAIRS) {
      const items = selectGameItems();
      setGameItems(items);
      setShuffledVideos([...items].sort(() => Math.random() - 0.5));
    }
  }, [signs.length]);

  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      endGame();
    }
  }, [timeLeft, gameStarted, gameOver]);

  useEffect(() => {
    if (matchedPairs.size === TOTAL_PAIRS && gameStarted) {
      endGame();
    }
  }, [matchedPairs.size]);

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(GAME_TIME);
    setScore(0);
    setMatchedPairs(new Set());
    setWrongAttempts(0);
    setGameOver(false);
  };

  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
  };

  const handleDragStart = (e, item, type) => {
    if (matchedPairs.has(item.id)) return;
    setDraggedItem({ ...item, type });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetItem, targetType) => {
    e.preventDefault();
    if (!draggedItem || matchedPairs.has(targetItem.id)) return;

    if (draggedItem.type !== targetType && draggedItem.id === targetItem.id) {
      setMatchedPairs(prev => new Set([...prev, targetItem.id]));
      setScore(prev => Math.max(0, prev + POINTS_PER_CORRECT));
    } else {
      setScore(prev => Math.max(0, prev - PENALTY_PER_WRONG));
      setWrongAttempts(prev => prev + 1);
      setWrongMatchFlash({
        image: draggedItem.type === 'image' ? draggedItem.id : targetItem.id,
        video: draggedItem.type === 'video' ? draggedItem.id : targetItem.id
      });
      setTimeout(() => setWrongMatchFlash({ image: null, video: null }), 1000);
    }
    setDraggedItem(null);
  };

  const restartGame = () => {
    const items = selectGameItems();
    setGameItems(items);
    setShuffledVideos([...items].sort(() => Math.random() - 0.5));
    setGameStarted(false);
    setGameOver(false);
    setTimeLeft(GAME_TIME);
    setScore(0);
    setMatchedPairs(new Set());
    setWrongAttempts(0);
    setWrongMatchFlash({ image: null, video: null });
  };

  const handleExit = () => {
    if (onComplete) {
      const percentage = Math.min(100, Math.max(0, score));
      onComplete(percentage);
    }
  };

  if (!gameItems || gameItems.length < TOTAL_PAIRS) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <p className="text-red-600 font-semibold">Need at least {TOTAL_PAIRS} signs for this game.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="flex-shrink-0 w-full px-2 sm:px-4 pt-2 pb-2 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm border-b border-white/60 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className={`text-lg sm:text-xl md:text-2xl font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
            Match & Drop
          </h1>
          
          {gameStarted && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white shadow-sm">
                <Timer size={14} className={timeLeft <= 10 ? 'text-red-500' : ''} style={{ color: timeLeft > 10 ? colors.primary : undefined }} />
                <span className={`text-xs sm:text-sm font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`} style={{ color: timeLeft > 10 ? colors.dark : undefined }}>
                  {timeLeft}s
                </span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white shadow-sm">
                <Trophy size={14} style={{ color: colors.primary }} />
                <span className="text-xs sm:text-sm font-bold" style={{ color: colors.dark }}>{score}</span>
              </div>
              <div className="px-2 py-0.5 rounded-full bg-white shadow-sm">
                <span className="text-xs font-semibold text-gray-700">{matchedPairs.size}/{TOTAL_PAIRS}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-1 rounded-full hover:bg-white/70 transition-all"
            style={{ color: colors.primary }}
          >
            <HelpCircle size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {showInstructions && (
        <div className="mx-2 sm:mx-4 mt-1 text-xs bg-white/90 backdrop-blur-sm shadow-sm p-2 rounded-lg border border-white/60">
          <div className="flex flex-wrap gap-2 justify-center items-center text-gray-700">
            <span className="font-semibold">🎯 Drag & match!</span>
            <span>✅ +{POINTS_PER_CORRECT}</span>
            <span>❌ -{PENALTY_PER_WRONG}</span>
            <span>⏱️ {GAME_TIME}s</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <div className="w-full h-full max-w-7xl">
          {!gameStarted && !gameOver ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-10 shadow-2xl border-2 border-white/60 max-w-md">
                <div className="text-5xl sm:text-7xl mb-4">🎯</div>
                <h2 className="text-2xl sm:text-4xl font-black mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ready to Match?
                </h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Match {TOTAL_PAIRS} pairs in {GAME_TIME} seconds!
                </p>
                <button
                  onClick={startGame}
                  className="px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-xl rounded-xl sm:rounded-2xl text-white font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  Start Game 🚀
                </button>
              </div>
            </div>
          ) : gameOver ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-white/60 max-w-lg">
                <div className="text-5xl sm:text-7xl mb-4">
                  {matchedPairs.size === TOTAL_PAIRS ? '🎉' : '⏰'}
                </div>
                <h2 className="text-2xl sm:text-4xl font-black mb-3" style={{ 
                  color: matchedPairs.size === TOTAL_PAIRS ? '#10b981' : '#f59e0b' 
                }}>
                  {matchedPairs.size === TOTAL_PAIRS ? 'Perfect!' : 'Time\'s Up!'}
                </h2>
                <div className="mb-4 sm:mb-6">
                  <p className="text-gray-600 mb-1 text-sm">Final Score</p>
                  <p className="text-4xl sm:text-6xl font-black mb-2" style={{ color: colors.primary }}>{score}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-2">
                    <div 
                      className="h-2 sm:h-3 rounded-full transition-all duration-500"
                      style={{ width: `${score}%`, background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }}
                    ></div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">out of 100</p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 text-xs sm:text-sm">
                  <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{matchedPairs.size}</div>
                    <div className="text-gray-600">Matched</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 sm:p-3">
                    <div className="text-xl sm:text-2xl font-bold text-red-600">{wrongAttempts}</div>
                    <div className="text-gray-600">Wrong</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{GAME_TIME - timeLeft}s</div>
                    <div className="text-gray-600">Time</div>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3 justify-center">
                  <button
                    onClick={restartGame}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl text-white font-bold shadow-xl transition-all transform hover:scale-105 active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                  >
                    🎮 Play Again
                  </button>
                  {onComplete && (
                    <button
                      onClick={handleExit}
                      className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-gray-500 text-white font-bold shadow-xl hover:bg-gray-600 transition-all transform hover:scale-105 active:scale-95"
                    >
                      ← Exit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full grid grid-cols-2 md:grid-rows-2 md:grid-cols-1 gap-2 overflow-hidden">
              {/* Images Column/Row */}
              <div className="flex flex-col overflow-hidden">
                <div className="text-center py-1 bg-white/70 backdrop-blur-sm rounded-lg mb-1">
                  <span className="text-xs sm:text-sm font-bold text-gray-700">Images</span>
                </div>
                <div className="flex-1 flex flex-col md:flex-row gap-1 sm:gap-2 overflow-y-auto md:overflow-y-hidden md:overflow-x-auto md:justify-center">
                  {gameItems.map((item) => {
                    const isMatched = matchedPairs.has(item.id);
                    const hasWrongFlash = wrongMatchFlash.image === item.id;
                    return (
                      <div
                        key={`img-${item.id}`}
                        draggable={!isMatched}
                        onDragStart={(e) => handleDragStart(e, item, 'image')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, item, 'image')}
                        className={`relative flex-shrink-0 p-2 bg-white/90 rounded-lg shadow-md border-2 transition-all 
                          w-full md:w-44 lg:w-52 h-20 sm:h-24 md:h-auto
                          ${isMatched ? 'opacity-50 border-green-400 cursor-not-allowed' : hasWrongFlash ? 'border-red-500 border-4 animate-pulse' : 'border-white cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-105'}`}
                      >
                        <div className="h-full flex md:flex-col items-center md:justify-center gap-2">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex-shrink-0 bg-gray-50 rounded p-1">
                            <SignVisual visual={item.visual} assets={assets} className="w-full h-full" />
                          </div>
                          <span className="text-xs sm:text-sm md:text-base font-bold text-gray-800">{item.name}</span>
                        </div>
                        {isMatched && (
                          <div className="absolute inset-0 flex items-center justify-center bg-green-500/30 rounded-lg backdrop-blur-sm">
                            <div className="bg-green-500 rounded-full p-1 sm:p-2">
                              <span className="text-xl sm:text-2xl text-white">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Videos Column/Row */}
              <div className="flex flex-col overflow-hidden">
                <div className="text-center py-1 bg-white/70 backdrop-blur-sm rounded-lg mb-1">
                  <span className="text-xs sm:text-sm font-bold text-gray-700">Videos</span>
                </div>
                <div className="flex-1 flex flex-col md:flex-row gap-1 sm:gap-2 overflow-y-auto md:overflow-y-hidden md:overflow-x-auto md:justify-center">
                  {shuffledVideos.map((item) => {
                    const isMatched = matchedPairs.has(item.id);
                    const hasWrongFlash = wrongMatchFlash.video === item.id;
                    return (
                      <div
                        key={`vid-${item.id}`}
                        draggable={!isMatched}
                        onDragStart={(e) => handleDragStart(e, item, 'video')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, item, 'video')}
                        className={`relative flex-shrink-0 p-2 bg-white/90 rounded-lg shadow-md border-2 transition-all
                          w-full md:w-44 lg:w-52 h-20 sm:h-24 md:h-auto
                          ${isMatched ? 'opacity-50 border-green-400 cursor-not-allowed' : hasWrongFlash ? 'border-red-500 border-4 animate-pulse' : 'border-white cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-105'}`}
                      >
                        <video src={item.videoUrl ? (assets?.videos?.[item.videoUrl] ?? item.videoUrl) : null} muted loop autoPlay playsInline className="w-full h-full object-contain rounded bg-gray-50" />
                        {isMatched && (
                          <div className="absolute inset-0 flex items-center justify-center bg-green-500/30 rounded-lg backdrop-blur-sm">
                            <div className="bg-green-500 rounded-full p-1 sm:p-2">
                              <span className="text-xl sm:text-2xl text-white">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}