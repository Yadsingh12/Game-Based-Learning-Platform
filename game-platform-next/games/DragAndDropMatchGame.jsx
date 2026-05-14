// src/components/games/DragDropMatchGame.jsx

import React, { useState, useEffect } from "react";
import { HelpCircle, Timer, Trophy } from "lucide-react";
import SignVisual from "../components/SignVisual";

const GAME_TIME = 60;
const TOTAL_PAIRS = 5;
const POINTS_PER_CORRECT = 20;
const PENALTY_PER_WRONG = 5;

export default function DragDropMatchGame(props) {
  const signs      = props.signs || props.data?.signs || props.data || [];
  const onComplete = props.onComplete || props.onExit;
  const category   = props.category || {};
  const assets     = props.assets || {};

  const colors = category.colorScheme || {
    primary: "#7c3aed", secondary: "#3b82f6",
    light: "#c4b5fd", dark: "#5b21b6",
    gradient: "from-violet-600 to-blue-600",
  };

  const [gameItems, setGameItems]           = useState([]);
  const [shuffledVideos, setShuffledVideos] = useState([]);
  const [matchedPairs, setMatchedPairs]     = useState(new Set());
  const [draggedItem, setDraggedItem]       = useState(null);
  const [timeLeft, setTimeLeft]             = useState(GAME_TIME);
  const [score, setScore]                   = useState(0);
  const [gameStarted, setGameStarted]       = useState(false);
  const [gameOver, setGameOver]             = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [wrongAttempts, setWrongAttempts]   = useState(0);
  const [wrongMatchFlash, setWrongMatchFlash] = useState({ image: null, video: null });

  const selectGameItems = () => {
    const valid = signs.filter(s => s.name && s.videoUrl && s.visual);
    if (valid.length < TOTAL_PAIRS) return [];
    return [...valid].sort(() => Math.random() - 0.5).slice(0, TOTAL_PAIRS);
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
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) endGame();
  }, [timeLeft, gameStarted, gameOver]);

  useEffect(() => {
    if (matchedPairs.size === TOTAL_PAIRS && gameStarted) endGame();
  }, [matchedPairs.size]);

  const startGame = () => {
    setGameStarted(true); setTimeLeft(GAME_TIME); setScore(0);
    setMatchedPairs(new Set()); setWrongAttempts(0); setGameOver(false);
  };

  const endGame = () => { setGameOver(true); setGameStarted(false); };

  const handleDragStart = (e, item, type) => {
    if (matchedPairs.has(item.id)) return;
    setDraggedItem({ ...item, type });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

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
        video: draggedItem.type === 'video' ? draggedItem.id : targetItem.id,
      });
      setTimeout(() => setWrongMatchFlash({ image: null, video: null }), 1000);
    }
    setDraggedItem(null);
  };

  const restartGame = () => {
    const items = selectGameItems();
    setGameItems(items);
    setShuffledVideos([...items].sort(() => Math.random() - 0.5));
    setGameStarted(false); setGameOver(false); setTimeLeft(GAME_TIME);
    setScore(0); setMatchedPairs(new Set()); setWrongAttempts(0);
    setWrongMatchFlash({ image: null, video: null });
  };

  const handleExit = () => onComplete?.(Math.min(100, Math.max(0, score)));

  if (!gameItems || gameItems.length < TOTAL_PAIRS) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f0a1e]">
      <p className="text-red-400 font-semibold">Need at least {TOTAL_PAIRS} signs for this game.</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0f0a1e] relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex-shrink-0 w-full px-3 sm:px-4 pt-3 pb-2 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-lg sm:text-xl font-extrabold text-white">Match & Drop</h1>

          {gameStarted && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                <Timer size={13} className={timeLeft <= 10 ? 'text-red-400' : 'text-violet-400'} />
                <span className={`text-xs font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                <Trophy size={13} className="text-violet-400" />
                <span className="text-xs font-bold text-white">{score}</span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="text-xs font-bold text-white/60">{matchedPairs.size}/{TOTAL_PAIRS}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-all text-violet-400"
          >
            <HelpCircle size={17} strokeWidth={2.5} />
          </button>
        </div>

        {showInstructions && (
          <div className="mt-2 text-xs bg-white/5 border border-white/10 p-2.5 rounded-xl text-white/60 text-center">
            Drag an image onto its matching video (or vice versa).
            ✅ +{POINTS_PER_CORRECT} pts · ❌ −{PENALTY_PER_WRONG} pts · ⏱ {GAME_TIME}s
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-2 sm:p-3 overflow-hidden">
        <div className="w-full h-full max-w-7xl">

          {/* Start screen */}
          {!gameStarted && !gameOver && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-8 sm:p-12 max-w-md">
                <div className="text-6xl mb-5">🎯</div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Ready to Match?</h2>
                <p className="text-white/50 mb-8 text-sm sm:text-base">
                  Match {TOTAL_PAIRS} pairs in {GAME_TIME} seconds!
                </p>
                <button
                  onClick={startGame}
                  className="px-10 py-3.5 text-base rounded-2xl text-white font-black transition-all hover:scale-105 active:scale-95 hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  Start Game 🚀
                </button>
              </div>
            </div>
          )}

          {/* Game over screen */}
          {gameOver && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-8 sm:p-10 max-w-md w-full">
                <div className="text-6xl mb-4">
                  {matchedPairs.size === TOTAL_PAIRS ? '🎉' : '⏰'}
                </div>
                <h2 className="text-3xl font-black mb-3"
                  style={{ color: matchedPairs.size === TOTAL_PAIRS ? '#34d399' : '#fbbf24' }}>
                  {matchedPairs.size === TOTAL_PAIRS ? 'Perfect!' : "Time's Up!"}
                </h2>

                <div className="mb-6">
                  <p className="text-white/40 text-sm mb-1">Final Score</p>
                  <p className="text-5xl font-black text-violet-300 mb-3">{score}</p>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${score}%`, background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }} />
                  </div>
                  <p className="text-xs text-white/30">out of 100</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[
                    { val: matchedPairs.size, label: 'Matched',  color: '#34d399' },
                    { val: wrongAttempts,     label: 'Wrong',    color: '#f87171' },
                    { val: `${GAME_TIME - timeLeft}s`, label: 'Time', color: '#60a5fa' },
                  ].map(({ val, label, color }) => (
                    <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="text-xl font-black" style={{ color }}>{val}</div>
                      <div className="text-xs text-white/40">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-center">
                  <button onClick={restartGame}
                    className="px-6 py-2.5 rounded-xl text-white font-bold transition-all hover:scale-105 active:scale-95 hover:opacity-90 text-sm"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                    🎮 Play Again
                  </button>
                  {onComplete && (
                    <button onClick={handleExit}
                      className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white/70 font-bold hover:bg-white/20 transition-all hover:scale-105 active:scale-95 text-sm">
                      ← Exit
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Active game */}
          {gameStarted && !gameOver && (
            <div className="h-full grid grid-cols-2 md:grid-rows-2 md:grid-cols-1 gap-2 overflow-hidden">

              {/* Images column */}
              <div className="flex flex-col overflow-hidden">
                <div className="text-center py-1.5 mb-1">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Images</span>
                </div>
                <div className="flex-1 flex flex-col md:flex-row gap-1.5 sm:gap-2 overflow-y-auto md:overflow-y-hidden md:overflow-x-auto md:justify-center">
                  {gameItems.map((item) => {
                    const isMatched    = matchedPairs.has(item.id);
                    const hasWrongFlash = wrongMatchFlash.image === item.id;
                    return (
                      <div
                        key={`img-${item.id}`}
                        draggable={!isMatched}
                        onDragStart={e => handleDragStart(e, item, 'image')}
                        onDragOver={handleDragOver}
                        onDrop={e => handleDrop(e, item, 'image')}
                        className={`relative flex-shrink-0 p-2 rounded-xl border transition-all
                          w-full md:w-44 lg:w-52 h-20 sm:h-24 md:h-auto
                          ${isMatched
                            ? 'opacity-40 border-emerald-500/40 bg-emerald-500/10 cursor-not-allowed'
                            : hasWrongFlash
                              ? 'border-red-500 border-2 bg-red-500/10 animate-pulse cursor-grab'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] cursor-grab active:cursor-grabbing'
                          }`}
                      >
                        <div className="h-full flex md:flex-col items-center md:justify-center gap-2">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex-shrink-0 rounded-lg bg-black/20 p-1">
                            <SignVisual visual={item.visual} assets={assets} className="w-full h-full" />
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-white/80">{item.name}</span>
                        </div>
                        {isMatched && (
                          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 rounded-xl backdrop-blur-sm">
                            <div className="bg-emerald-500 rounded-full p-1.5">
                              <span className="text-white text-lg">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Videos column */}
              <div className="flex flex-col overflow-hidden">
                <div className="text-center py-1.5 mb-1">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Videos</span>
                </div>
                <div className="flex-1 flex flex-col md:flex-row gap-1.5 sm:gap-2 overflow-y-auto md:overflow-y-hidden md:overflow-x-auto md:justify-center">
                  {shuffledVideos.map((item) => {
                    const isMatched     = matchedPairs.has(item.id);
                    const hasWrongFlash = wrongMatchFlash.video === item.id;
                    return (
                      <div
                        key={`vid-${item.id}`}
                        draggable={!isMatched}
                        onDragStart={e => handleDragStart(e, item, 'video')}
                        onDragOver={handleDragOver}
                        onDrop={e => handleDrop(e, item, 'video')}
                        className={`relative flex-shrink-0 p-1.5 rounded-xl border transition-all
                          w-full md:w-44 lg:w-52 h-20 sm:h-24 md:h-auto
                          ${isMatched
                            ? 'opacity-40 border-emerald-500/40 bg-emerald-500/10 cursor-not-allowed'
                            : hasWrongFlash
                              ? 'border-red-500 border-2 bg-red-500/10 animate-pulse cursor-grab'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] cursor-grab active:cursor-grabbing'
                          }`}
                      >
                        <video
                          src={item.videoUrl ? (assets?.videos?.[item.videoUrl] ?? item.videoUrl) : null}
                          muted loop autoPlay playsInline
                          className="w-full h-full object-contain rounded-lg bg-black/30"
                        />
                        {isMatched && (
                          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 rounded-xl backdrop-blur-sm">
                            <div className="bg-emerald-500 rounded-full p-1.5">
                              <span className="text-white text-lg">✓</span>
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