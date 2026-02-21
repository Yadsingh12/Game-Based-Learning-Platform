// src/components/games/ColorMatchGame.jsx
import React, { useState, useEffect } from "react";
import { HelpCircle, Palette } from "lucide-react";

const TOTAL_ROUNDS = 5;

export default function ColorMatchGame(props) {
  const signs      = props.signs || props.data?.signs || props.data || [];
  const onComplete = props.onComplete || props.onExit;
  const category   = props.category || {};
  const assets     = props.assets || {};

  const colors = category.colorScheme || {
    primary: "#7c3aed", secondary: "#3b82f6",
    light: "#c4b5fd", dark: "#5b21b6",
    gradient: "from-purple-600 to-blue-600",
  };

  const [currentQuestion, setCurrentQuestion]       = useState(null);
  const [currentImage, setCurrentImage]             = useState(null);
  const [questionText, setQuestionText]             = useState("");
  const [options, setOptions]                       = useState([]);
  const [selectedOption, setSelectedOption]         = useState(null);
  const [roundOver, setRoundOver]                   = useState(false);
  const [isCorrect, setIsCorrect]                   = useState(false);
  const [score, setScore]                           = useState(0);
  const [currentRound, setCurrentRound]             = useState(1);
  const [usedImages, setUsedImages]                 = useState(new Set());
  const [gameCompletelyOver, setGameCompletelyOver] = useState(false);
  const [message, setMessage]                       = useState("");
  const [showInstructions, setShowInstructions]     = useState(false);

  const resolveVideo = (url) => url ? (assets?.videos?.[url] ?? url) : null;
  const resolveImage = (url) => url ? (assets?.images?.[url] ?? url) : null;

  const getValidSigns = (items) =>
    items.filter(s =>
      s.name && s.videoUrl &&
      s.assets?.match?.images?.length > 0
    );

  const pickRandomSignWithImage = (valid) => {
    const available = valid.filter(s =>
      s.assets.match.images.some(obj => !usedImages.has(obj.path))
    );
    const pool = available.length > 0 ? available : valid;
    const sign = pool[Math.floor(Math.random() * pool.length)];
    const unusedImgs = sign.assets.match.images.filter(obj => !usedImages.has(obj.path));
    const imgPool = unusedImgs.length > 0 ? unusedImgs : sign.assets.match.images;
    const imageObj = imgPool[Math.floor(Math.random() * imgPool.length)];
    return { sign, imageObj };
  };

  const generateOptions = (correct, all) => {
    const opts      = [correct];
    const available = all.filter(s => s.id !== correct.id && s.videoUrl);
    while (opts.length < 4 && available.length > 0)
      opts.push(available.splice(Math.floor(Math.random() * available.length), 1)[0]);
    return opts.sort(() => Math.random() - 0.5);
  };

  const startRound = () => {
    const valid = getValidSigns(signs);
    if (valid.length < 4) return;
    const { sign, imageObj } = pickRandomSignWithImage(valid);
    setCurrentQuestion(sign);
    setCurrentImage(imageObj.path);
    setQuestionText(imageObj.question);
    setOptions(generateOptions(sign, signs.filter(s => s.videoUrl)));
    setUsedImages(prev => new Set([...prev, imageObj.path]));
    setSelectedOption(null);
    setRoundOver(false);
    setIsCorrect(false);
    setMessage("");
  };

  useEffect(() => {
    if (getValidSigns(signs).length >= 4) startRound();
  }, [signs.length]);

  const handleOptionSelect = (option) => {
    if (roundOver || gameCompletelyOver) return;
    setSelectedOption(option);
    const correct  = option.id === currentQuestion.id;
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
        : `Wrong! The correct answer was "${currentQuestion.name}". Round ${currentRound}/${TOTAL_ROUNDS}`);
    }
  };

  const nextRound   = () => { setCurrentRound(r => r + 1); startRound(); };
  const restartGame = () => { setScore(0); setCurrentRound(1); setUsedImages(new Set()); setGameCompletelyOver(false); startRound(); };
  const handleExit  = () => onComplete?.(Math.round((score / TOTAL_ROUNDS) * 100));

  if (getValidSigns(signs).length < 4) return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <p className="text-red-600 font-semibold">Need at least 4 colors with match images for this game.</p>
    </div>
  );
  if (!currentQuestion || !currentImage) return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <p className="text-gray-600">Loading...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex-none px-4 pt-3 pb-2 bg-white/60 backdrop-blur-sm border-b border-white/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className={`text-lg sm:text-2xl font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
              Color Match
            </h1>
            <button
              onClick={() => setShowInstructions(v => !v)}
              className="p-1.5 rounded-full hover:bg-white/50 transition-all"
              style={{ color: colors.primary }}
            >
              <HelpCircle size={18} strokeWidth={2.5} />
            </button>
          </div>
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

        {showInstructions && (
          <div className="max-w-5xl mx-auto mt-2 text-xs sm:text-sm bg-white/80 p-3 rounded-xl border border-white/60">
            Look at the image and read the question, you need to choose the correct color sign of the prominent object in the image, and then click the corresponding video showing it. {TOTAL_ROUNDS} rounds total.
          </div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      {!roundOver ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 sm:p-4 min-h-0">

          {/* Image pane */}
          <div className="flex-1 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-2 min-h-0 gap-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600">
              <Palette size={14} style={{ color: colors.primary }} />
              {questionText}
            </div>
            <div className="flex-1 w-full min-h-0 rounded-xl border-4 border-white shadow-xl bg-white p-1.5 overflow-hidden">
              <img
                src={resolveImage(currentImage)}
                alt={questionText}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <p className="flex-shrink-0 text-sm sm:text-base font-bold text-gray-700 text-center">
              What color is it?
            </p>
          </div>

          {/* 2×2 Video options */}
          <div className="flex-[2] grid grid-cols-2 gap-2 sm:gap-3 min-h-0">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOptionSelect(option)}
                className="group relative flex flex-col items-center justify-between
                           bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl border-2
                           shadow-md hover:shadow-xl transition-all hover:scale-[1.03] active:scale-95
                           overflow-hidden min-h-0 p-2"
                style={{ borderColor: selectedOption?.id === option.id ? colors.primary : 'rgba(255,255,255,0.6)' }}
              >
                <video
                  src={resolveVideo(option.videoUrl)}
                  muted loop autoPlay playsInline
                  className="flex-1 w-full min-h-0 object-contain rounded-lg"
                />
                <span className="flex-shrink-0 mt-1.5 text-xs sm:text-sm font-bold text-gray-700 leading-tight">
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
        <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/60 w-full max-w-md text-center">
            <div className="text-5xl mb-3">{isCorrect ? '🎉' : '😔'}</div>
            <p className="text-xl sm:text-2xl font-black mb-2"
               style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>
              {isCorrect ? 'Correct!' : 'Wrong Answer!'}
            </p>
            <p className="text-sm sm:text-base font-semibold mb-4 text-gray-600">{message}</p>

            {/* Image = Video side by side */}
            <div className="bg-gray-50 rounded-xl p-3 mb-5">
              <p className="text-xs text-gray-500 mb-3">Correct Answer</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={resolveImage(currentImage)}
                    alt={questionText}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <span className="text-3xl font-black text-gray-300">=</span>
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden border-2 border-gray-200">
                  <video
                    src={resolveVideo(currentQuestion.videoUrl)}
                    controls autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <p className="mt-3 text-base font-bold text-gray-800">
                The color is{" "}
                <span className="text-lg" style={{ color: colors.primary }}>
                  {currentQuestion.name}
                </span>
              </p>
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