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

  const progress = ((currentRound - 1) / TOTAL_ROUNDS) * 100;

  if (!signs || signs.length < 4) return (
    <div className="h-full flex items-center justify-center bg-[#0f0a1e]">
      <p className="text-white/50 font-semibold">Need at least 4 signs for this game.</p>
    </div>
  );
  if (!currentQuestion) return (
    <div className="h-full flex items-center justify-center bg-[#0f0a1e]">
      <p className="text-white/40">Loading...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0f0a1e] overflow-hidden relative">

      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px]
                      bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px]
                      bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex-none px-4 pt-4 pb-3 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-white">Multiple Choice</h1>
            <button
              onClick={() => setShowInstructions(v => !v)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
            >
              <HelpCircle size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/40 font-semibold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              Round <span className="text-white font-black">{currentRound}</span>/{TOTAL_ROUNDS}
            </span>
            <span className="text-white/40 font-semibold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              ⭐ <span className="text-white font-black">{score}</span>
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7c3aed, #3b82f6)' }}
          />
        </div>

        {showInstructions && (
          <div className="max-w-5xl mx-auto mt-3 text-sm bg-white/5 border border-white/10 p-3 rounded-2xl text-white/60">
            Watch the sign language video and click the correct answer. {TOTAL_ROUNDS} rounds total.
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        {!roundOver ? (
          <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 sm:p-4 min-h-0">

            {/* Video pane */}
            <div className="flex-1 flex flex-col items-center justify-center
                            bg-white/5 border border-white/10 rounded-2xl p-3 min-h-0">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-white/40">
                <Play size={14} className="text-violet-400" />
                What sign is this?
              </div>
              <video
                key={currentQuestion.name}
                src={resolveVideo(currentQuestion.videoUrl)}
                muted loop autoPlay playsInline
                className="rounded-xl max-w-full max-h-full object-contain ring-1 ring-white/10"
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
                             bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl
                             hover:bg-white/10 hover:border-white/20
                             hover:scale-[1.02] active:scale-[0.98]
                             transition-all duration-200 overflow-hidden p-2 sm:p-4"
                >
                  {/* Hover gradient glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                  bg-gradient-to-br from-violet-600/10 to-blue-600/10 pointer-events-none" />

                  {option.visual && (
                    <div className="relative z-10 w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0">
                      <SignVisual visual={option.visual} assets={assets} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <span className="relative z-10 text-xs sm:text-sm font-black text-white text-center leading-tight">
                    {option.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-6 sm:p-8
                            shadow-2xl w-full max-w-md text-center">
              <div className="text-5xl mb-3">{isCorrect ? '🎉' : '😔'}</div>
              <p className="text-xl sm:text-2xl font-black mb-2"
                 style={{ color: isCorrect ? '#34d399' : '#f87171' }}>
                {isCorrect ? 'Correct!' : 'Wrong Answer!'}
              </p>
              <p className="text-sm font-semibold mb-5 text-white/50">{message}</p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-5">
                <p className="text-xs text-white/30 mb-2">Correct Answer</p>
                <div className="flex flex-col items-center gap-2">
                  {currentQuestion.visual && (
                    <div className="w-20 h-20 sm:w-28 sm:h-28">
                      <SignVisual visual={currentQuestion.visual} assets={assets} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <span className="text-base sm:text-lg font-black text-white">{currentQuestion.name}</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                {!gameCompletelyOver ? (
                  <DarkButton onClick={nextRound}>Next Round →</DarkButton>
                ) : (
                  <>
                    <DarkButton onClick={restartGame}>🎮 Play Again</DarkButton>
                    <button
                      onClick={handleExit}
                      className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/10
                                 text-white/70 font-bold hover:bg-white/15 hover:text-white
                                 transition-all hover:scale-105 active:scale-95"
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
    </div>
  );
}

function DarkButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-2.5 rounded-xl font-black text-white shadow-lg
                 bg-gradient-to-r from-violet-600 to-blue-600
                 hover:opacity-90 hover:scale-105 active:scale-95 transition-all"
    >
      {children}
    </button>
  );
}