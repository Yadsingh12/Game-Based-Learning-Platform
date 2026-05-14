// src/components/games/CountingGame.jsx

import React, { useState, useEffect } from "react";
import { HelpCircle, Search } from "lucide-react";

const TOTAL_ROUNDS = 5;

export default function CountingGame(props) {
  const signs      = props.data?.signs ?? props.signs ?? props.data ?? [];
  const onComplete = props.onComplete ?? props.onExit;
  const category   = props.category ?? {};
  const assets     = props.assets ?? {};

  const colors = category.colorScheme ?? {
    primary: "#7c3aed", secondary: "#3b82f6",
    light: "#c4b5fd", dark: "#5b21b6",
    gradient: "from-violet-600 to-blue-600",
  };

  const [currentQuestion, setCurrentQuestion]       = useState(null);
  const [currentImage, setCurrentImage]             = useState(null);
  const [imageLabel, setImageLabel]                 = useState("");
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

  const getValidSigns = (items) =>
    items.filter(s => s.name && s.videoUrl && s.assets?.count?.images?.length > 0);

  const pickRandomSignWithImage = (items) => {
    const valid = getValidSigns(items);
    const available = valid.filter(s =>
      s.assets.count.images.some(obj => !usedImages.has(Object.values(obj)[0]))
    );
    const pool = available.length > 0 ? available : valid;
    if (!pool.length) return null;
    const sign = pool[Math.floor(Math.random() * pool.length)];
    const unusedImgs = sign.assets.count.images.filter(
      obj => !usedImages.has(Object.values(obj)[0])
    );
    const imgPool = unusedImgs.length > 0 ? unusedImgs : sign.assets.count.images;
    const imageObj = imgPool[Math.floor(Math.random() * imgPool.length)];
    return { sign, imageObj };
  };

  const generateOptions = (correct, all) => {
    const opts      = [correct];
    const available = all.filter(s => s.name !== correct.name && s.videoUrl);
    while (opts.length < 4 && available.length > 0)
      opts.push(available.splice(Math.floor(Math.random() * available.length), 1)[0]);
    return opts.sort(() => Math.random() - 0.5);
  };

  const startRound = () => {
    const valid = getValidSigns(signs);
    if (valid.length < 4) return;
    const result = pickRandomSignWithImage(valid);
    if (!result) return;
    const { sign, imageObj } = result;
    const label     = Object.keys(imageObj)[0];
    const imagePath = Object.values(imageObj)[0];
    setCurrentQuestion(sign);
    setCurrentImage(imagePath);
    setImageLabel(label);
    setOptions(generateOptions(sign, signs.filter(s => s.videoUrl)));
    setUsedImages(prev => new Set([...prev, imagePath]));
    setSelectedOption(null);
    setRoundOver(false);
    setIsCorrect(false);
    setMessage("");
  };

  useEffect(() => { if (getValidSigns(signs).length >= 4) startRound(); }, [signs.length]);

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
        : `Wrong! Correct answer: "${currentQuestion.name}". Round ${currentRound}/${TOTAL_ROUNDS}`);
    }
  };

  const nextRound    = () => { setCurrentRound(r => r + 1); startRound(); };
  const restartGame  = () => { setScore(0); setCurrentRound(1); setUsedImages(new Set()); setGameCompletelyOver(false); startRound(); };
  const handleExit   = () => onComplete?.(Math.round((score / TOTAL_ROUNDS) * 100));
  const resolveVideo = (url) => url ? (assets?.videos?.[url] ?? url) : null;
  const resolveImage = (url) => url ? (assets?.images?.[url] ?? url) : null;

  if (getValidSigns(signs).length < 4) return (
    <div className="h-full flex items-center justify-center bg-[#0f0a1e]">
      <p className="text-red-400 font-semibold">Need at least 4 numbers with counting images.</p>
    </div>
  );
  if (!currentQuestion || !currentImage) return (
    <div className="h-full flex items-center justify-center bg-[#0f0a1e]">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0f0a1e] relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex-none px-4 pt-3 pb-2 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-white">Counting Game</h1>
            <button
              onClick={() => setShowInstructions(v => !v)}
              className="p-1.5 rounded-full hover:bg-white/10 transition-all text-violet-400"
            >
              <HelpCircle size={16} strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm">
            <span className="font-bold text-white/50">Round</span>
            <span className="font-black text-white">{currentRound}/{TOTAL_ROUNDS}</span>
            <div className="w-px h-3 bg-white/20" />
            <span className="font-bold text-white/50">Score</span>
            <span className="font-black text-violet-300">{score}</span>
          </div>
        </div>

        {showInstructions && (
          <div className="max-w-5xl mx-auto mt-2 text-xs sm:text-sm bg-white/5 border border-white/10 p-3 rounded-xl text-white/60">
            Count the objects in the image, then click the video showing the correct number sign. {TOTAL_ROUNDS} rounds total.
          </div>
        )}
      </div>

      {/* ── Body ── */}
      {!roundOver ? (
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-3 p-3 sm:p-4 min-h-0">

          {/* Image pane */}
          <div className="flex-1 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-2 min-h-0 gap-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/50">
              <Search size={14} className="text-violet-400" />
              Count the {imageLabel}
            </div>
            <div className="flex-1 w-full min-h-0 rounded-xl border border-white/10 bg-black/20 p-1.5 overflow-hidden">
              <img
                src={resolveImage(currentImage)}
                alt={`Count the ${imageLabel}`}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <p className="flex-shrink-0 text-sm sm:text-base font-bold text-white/70 text-center capitalize">
              How many {imageLabel}?
            </p>
          </div>

          {/* 2×2 Video options */}
          <div className="flex-[2] grid grid-cols-2 gap-2 sm:gap-3 min-h-0">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOptionSelect(option)}
                className="group relative flex flex-col items-center justify-between
                           bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl
                           hover:bg-white/10 hover:border-white/20
                           transition-all hover:scale-[1.02] active:scale-95
                           overflow-hidden min-h-0 p-2"
              >
                <video
                  src={resolveVideo(option.videoUrl)}
                  muted loop autoPlay playsInline
                  className="flex-1 w-full min-h-0 object-contain rounded-lg"
                />
                <span className="flex-shrink-0 mt-1.5 text-xs sm:text-sm font-bold text-white/80 leading-tight">
                  {option.name}
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.1))' }} />
              </button>
            ))}
          </div>
        </div>

      ) : (
        /* ── Round over ── */
        <div className="relative z-10 flex-1 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 w-full max-w-md text-center">
            <div className="text-5xl mb-3">{isCorrect ? '🎉' : '😔'}</div>
            <p className="text-xl sm:text-2xl font-black mb-2"
               style={{ color: isCorrect ? '#34d399' : '#f87171' }}>
              {isCorrect ? 'Correct!' : 'Wrong Answer!'}
            </p>
            <p className="text-sm sm:text-base font-semibold mb-4 text-white/50">{message}</p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-5">
              <p className="text-xs text-white/30 mb-3">Correct Answer</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                  <img src={resolveImage(currentImage)} alt={imageLabel} className="w-full h-full object-contain p-1" />
                </div>
                <span className="text-3xl font-black text-white/20">=</span>
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                  <video src={resolveVideo(currentQuestion.videoUrl)} controls autoPlay className="w-full h-full object-contain" />
                </div>
              </div>
              <p className="mt-3 text-sm font-bold text-white/70">
                There {currentQuestion.name === "One" ? "is" : "are"}{" "}
                <span className="text-base text-violet-300">{currentQuestion.name}</span>{" "}
                {currentQuestion.name === "One" ? "object" : "objects"}
              </p>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              {!gameCompletelyOver ? (
                <DarkButton onClick={nextRound} colors={colors}>Next Round →</DarkButton>
              ) : (
                <>
                  <DarkButton onClick={restartGame} colors={colors}>🎮 Play Again</DarkButton>
                  <button
                    onClick={handleExit}
                    className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white/70 font-bold hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
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

function DarkButton({ onClick, colors, children }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-2.5 rounded-xl text-white font-bold transition-all hover:scale-105 active:scale-95 hover:opacity-90"
      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
    >
      {children}
    </button>
  );
}