// src/components/games/MultipleChoiceGame.jsx

import React, { useState, useEffect } from "react";
import { HelpCircle, Play } from "lucide-react";
import SignVisual from '../components/SignVisual';

const TOTAL_ROUNDS = 5;

export default function MultipleChoiceGame(props) {
  const signs      = props.data?.signs ?? props.signs ?? props.data ?? [];
  const onComplete = props.onComplete ?? props.onExit;
  const category   = props.category ?? {};
  const assets     = props.assets ?? {};

  const colors = category.colorScheme ?? {
    primary: "#7c3aed", secondary: "#3b82f6",
    light: "#c4b5fd", dark: "#5b21b6",
    gradient: "from-purple-600 to-blue-600",
  };

  const [currentQuestion, setCurrentQuestion]       = useState(null);
  const [options, setOptions]                       = useState([]);
  const [selectedOption, setSelectedOption]         = useState(null);
  const [roundOver, setRoundOver]                   = useState(false);
  const [isCorrect, setIsCorrect]                   = useState(false);
  const [score, setScore]                           = useState(0);
  const [currentRound, setCurrentRound]             = useState(1);
  const [usedSigns, setUsedSigns]                   = useState(new Set());
  const [gameCompletelyOver, setGameCompletelyOver] = useState(false);
  const [message, setMessage]                       = useState("");
  const [showInstructions, setShowInstructions]     = useState(false);

  const getValidSigns = (items) => items.filter(s => s.name && s.videoUrl);

  const pickRandomSign = (items) => {
    const valid     = getValidSigns(items);
    const available = valid.filter(s => !usedSigns.has(s.name));
    if (available.length === 0) { setUsedSigns(new Set()); return valid[Math.floor(Math.random() * valid.length)]; }
    return available[Math.floor(Math.random() * available.length)];
  };

  const generateOptions = (correct, all) => {
    const opts      = [correct];
    const available = all.filter(s => s.name !== correct.name);
    while (opts.length < 4 && available.length > 0)
      opts.push(available.splice(Math.floor(Math.random() * available.length), 1)[0]);
    return opts.sort(() => Math.random() - 0.5);
  };

  const startRound = () => {
    const valid = getValidSigns(signs);
    if (valid.length < 4) return;
    const correct = pickRandomSign(valid);
    setCurrentQuestion(correct);
    setOptions(generateOptions(correct, valid));
    setUsedSigns(prev => new Set([...prev, correct.name]));
    setSelectedOption(null);
    setRoundOver(false);
    setIsCorrect(false);
    setMessage("");
  };

  useEffect(() => { if (signs.length >= 4) startRound(); }, [signs.length]);

  const handleOptionSelect = (option) => {
    if (roundOver || gameCompletelyOver) return;
    setSelectedOption(option);
    const correct  = option.name === currentQuestion.name;
    const newScore = correct ? score + 1 : score;
    setIsCorrect(correct);
    setRoundOver(true);
    if (correct) setScore(newScore);

    const done = currentRound >= TOTAL_ROUNDS;
    if (done) {
      setGameCompletelyOver(true);
      setMessage(`Game Complete! You got ${newScore} out of ${TOTAL_ROUNDS} correct!`);
    } else {
      setMessage(correct
        ? `Correct! Round ${currentRound}/${TOTAL_ROUNDS}`
        : `Wrong! Correct answer: "${currentQuestion.name}". Round ${currentRound}/${TOTAL_ROUNDS}`);
    }
  };

  const nextRound    = () => { setCurrentRound(r => r + 1); startRound(); };
  const restartGame  = () => { setScore(0); setCurrentRound(1); setUsedSigns(new Set()); setGameCompletelyOver(false); startRound(); };
  const handleExit   = () => onComplete?.(Math.round((score / TOTAL_ROUNDS) * 100));
  const resolveVideo = (url) => url ? (assets?.videos?.[url] ?? url) : null;

  // ── Guard states ──────────────────────────────────────────────
  if (!signs || signs.length < 4) return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <p className="text-red-600 font-semibold">Need at least 4 signs for this game.</p>
    </div>
  );
  if (!currentQuestion) return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <p className="text-gray-600">Loading...</p>
    </div>
  );

  // ── Layout: h-full fills the content pane below the navbar ───
  // Divide into: header (shrink) | body (flex-1, no scroll)
  // Body splits: video (left, landscape) | options grid (right)
  // On portrait/mobile: video top, options bottom
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex-none px-4 pt-3 pb-2 bg-white/60 backdrop-blur-sm border-b border-white/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">

          {/* Title + help */}
          <div className="flex items-center gap-2">
            <h1 className={`text-lg sm:text-2xl font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
              Multiple Choice
            </h1>
            <button
              onClick={() => setShowInstructions(v => !v)}
              className="p-1.5 rounded-full hover:bg-white/50 transition-all"
              style={{ color: colors.primary }}
            >
              <HelpCircle size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Score pill */}
          <div className="flex items-center gap-2 sm:gap-3 px-3 py-1 rounded-full bg-white/70 backdrop-blur-sm shadow-sm border border-white/50 text-xs sm:text-sm">
            <span className="font-bold" style={{ color: colors.dark }}>Round</span>
            <span className="font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {currentRound}/{TOTAL_ROUNDS}
            </span>
            <div className="w-px h-3 bg-gray-300" />
            <span className="font-bold" style={{ color: colors.dark }}>Score</span>
            <span className="font-extrabold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              {score}
            </span>
          </div>
        </div>

        {/* Collapsible instructions */}
        {showInstructions && (
          <div className="max-w-5xl mx-auto mt-2 text-xs sm:text-sm bg-white/80 p-3 rounded-xl border border-white/60">
            Watch the sign language video and click the correct answer. {TOTAL_ROUNDS} rounds total.
          </div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      {!roundOver ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 sm:p-4 min-h-0">

          {/* Video pane */}
          <div className="flex-1 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-3 min-h-0">
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-600">
              <Play size={16} style={{ color: colors.primary }} />
              What sign is this?
            </div>
            <video
              key={currentQuestion.name}
              src={resolveVideo(currentQuestion.videoUrl)}
              muted loop autoPlay playsInline
              className="rounded-xl shadow-lg max-w-full max-h-full object-contain"
              style={{ maxHeight: 'min(240px, 35vh)' }}
            />
          </div>

          {/* Options grid */}
          <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 min-h-0">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOptionSelect(option)}
                className="group relative flex flex-col items-center justify-center gap-1 sm:gap-2
                           bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl border-2
                           shadow-md hover:shadow-xl transition-all hover:scale-[1.03] active:scale-95
                           overflow-hidden p-2 sm:p-4"
                style={{ borderColor: selectedOption?.name === option.name ? colors.primary : 'rgba(255,255,255,0.6)' }}
              >
                {option.visual && (
                  <div className="w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0">
                    <SignVisual visual={option.visual} assets={assets} className="w-full h-full object-contain" />
                  </div>
                )}
                <span className="text-xs sm:text-sm lg:text-base font-bold text-gray-800 text-center leading-tight">
                  {option.name}
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                />
              </button>
            ))}
          </div>
        </div>

      ) : (
        /* ── Round over ─────────────────────────────────────── */
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/60 w-full max-w-md text-center">
            <div className="text-5xl mb-3">{isCorrect ? '🎉' : '😔'}</div>
            <p className="text-xl sm:text-2xl font-black mb-2"
               style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>
              {isCorrect ? 'Correct!' : 'Wrong Answer!'}
            </p>
            <p className="text-sm sm:text-base font-semibold mb-4 text-gray-600">{message}</p>

            {/* Correct answer visual */}
            <div className="bg-gray-50 rounded-xl p-3 mb-5">
              <p className="text-xs text-gray-500 mb-2">Correct Answer</p>
              <div className="flex flex-col items-center gap-2">
                {currentQuestion.visual && (
                  <div className="w-20 h-20 sm:w-28 sm:h-28">
                    <SignVisual visual={currentQuestion.visual} assets={assets} className="w-full h-full object-contain" />
                  </div>
                )}
                <span className="text-base sm:text-lg font-bold text-gray-800">{currentQuestion.name}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              {!gameCompletelyOver ? (
                <GradButton onClick={nextRound} colors={colors}>Next Round →</GradButton>
              ) : (
                <>
                  <GradButton onClick={restartGame} colors={colors}>🎮 Play Again</GradButton>
                  <button
                    onClick={handleExit}
                    className="px-6 py-2.5 rounded-xl bg-gray-600 text-white font-bold hover:bg-gray-700 transition-all hover:scale-105 active:scale-95"
                  >
                    ← Exit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GradButton({ onClick, colors, children }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-2.5 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
    >
      {children}
    </button>
  );
}