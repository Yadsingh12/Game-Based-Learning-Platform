// src/components/games/CrosswordGame.jsx

import React, { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_TRIES = 3;
const MAX_WORD_LENGTH = 8;
const TOTAL_ROUNDS = 5;

export default function CrossWordGame(props) {
  const signs      = props.signs || props.data?.signs || props.data || [];
  const onComplete = props.onComplete || props.onExit;
  const category   = props.category || {};

  const colors = category.colorScheme || {
    primary: "#7c3aed", secondary: "#3b82f6",
    light: "#c4b5fd", dark: "#5b21b6",
    gradient: "from-violet-600 to-blue-600",
  };

  const [targetWord, setTargetWord]               = useState("");
  const [targetSign, setTargetSign]               = useState(null);
  const [guesses, setGuesses]                     = useState([]);
  const [currentGuess, setCurrentGuess]           = useState([]);
  const [lockedPositions, setLockedPositions]     = useState(new Set());
  const [roundOver, setRoundOver]                 = useState(false);
  const [message, setMessage]                     = useState("");
  const [showInstructions, setShowInstructions]   = useState(false);
  const [score, setScore]                         = useState(0);
  const [currentRound, setCurrentRound]           = useState(1);
  const [usedWords, setUsedWords]                 = useState(new Set());
  const [gameCompletelyOver, setGameCompletelyOver] = useState(false);

  const getValidWords = (items) =>
    items.filter(sign => {
      if (!sign.name) return false;
      const clean = sign.name.replace(/\s+/g, '');
      return clean.length <= MAX_WORD_LENGTH && clean.length >= 3;
    });

  const pickRandomWord = (items) => {
    const valid     = getValidWords(items);
    const available = valid.filter(sign => !usedWords.has(sign.name.toUpperCase()));
    if (available.length === 0) { setUsedWords(new Set()); return valid[Math.floor(Math.random() * valid.length)]; }
    return available[Math.floor(Math.random() * available.length)];
  };

  useEffect(() => {
    if (signs.length > 0) {
      const randomSign = pickRandomWord(signs);
      if (randomSign) {
        const cleanWord = randomSign.name.replace(/\s+/g, '').toUpperCase();
        setTargetWord(cleanWord);
        setTargetSign(randomSign);
        setUsedWords(prev => new Set([...prev, cleanWord]));
      }
    }
  }, [signs.length]);

  const handleKeyPress = (letter) => {
    if (roundOver || gameCompletelyOver) return;
    for (let i = 0; i < targetWord.length; i++) {
      if (!lockedPositions.has(i) && !currentGuess[i]) {
        const newGuess = [...currentGuess];
        newGuess[i] = letter;
        setCurrentGuess(newGuess);
        break;
      }
    }
  };

  const handleBackspace = () => {
    if (roundOver || gameCompletelyOver) return;
    for (let i = targetWord.length - 1; i >= 0; i--) {
      if (!lockedPositions.has(i) && currentGuess[i]) {
        const newGuess = [...currentGuess];
        newGuess[i] = undefined;
        setCurrentGuess(newGuess);
        break;
      }
    }
  };

  const handleEnter = () => {
    if (roundOver || gameCompletelyOver) return;
    for (let i = 0; i < targetWord.length; i++) {
      if (!lockedPositions.has(i) && !currentGuess[i]) return;
    }

    const completeGuess = targetWord.split('').map((char, i) => {
      if (lockedPositions.has(i)) return char;
      return currentGuess[i] || '';
    }).join('');

    const newGuesses = [...guesses, completeGuess];
    setGuesses(newGuesses);

    const newLockedPositions = new Set(lockedPositions);
    for (let i = 0; i < targetWord.length; i++) {
      if (completeGuess[i] === targetWord[i]) newLockedPositions.add(i);
    }
    setLockedPositions(newLockedPositions);

    if (completeGuess === targetWord) {
      const newScore = score + 1;
      setScore(newScore);
      setRoundOver(true);
      if (currentRound >= TOTAL_ROUNDS) {
        setGameCompletelyOver(true);
        setMessage(`🎉 Game Complete! You got ${newScore} out of ${TOTAL_ROUNDS} words!`);
      } else {
        setMessage(`🎉 Correct! Round ${currentRound}/${TOTAL_ROUNDS}`);
      }
    } else if (newGuesses.length >= MAX_TRIES) {
      setRoundOver(true);
      if (currentRound >= TOTAL_ROUNDS) {
        setGameCompletelyOver(true);
        setMessage(`Game Complete! You got ${score} out of ${TOTAL_ROUNDS} words!`);
      } else {
        setMessage(`The word was "${targetWord}". Round ${currentRound}/${TOTAL_ROUNDS}`);
      }
    }
    setCurrentGuess([]);
  };

  const getLetterStatus = (guess, index) => {
    const letter = guess[index];
    if (targetWord[index] === letter) return "green";
    if (targetWord.includes(letter)) return "yellow";
    return "gray";
  };

  const nextRound = () => {
    if (currentRound >= TOTAL_ROUNDS) return;
    const randomSign = pickRandomWord(signs);
    if (!randomSign) return;
    const cleanWord = randomSign.name.replace(/\s+/g, '').toUpperCase();
    setTargetWord(cleanWord);
    setTargetSign(randomSign);
    setUsedWords(prev => new Set([...prev, cleanWord]));
    setGuesses([]);
    setCurrentGuess([]);
    setLockedPositions(new Set());
    setRoundOver(false);
    setMessage("");
    setCurrentRound(prev => prev + 1);
  };

  const restartGame = () => {
    const randomSign = pickRandomWord(signs);
    if (!randomSign) return;
    const cleanWord = randomSign.name.replace(/\s+/g, '').toUpperCase();
    setTargetWord(cleanWord);
    setTargetSign(randomSign);
    setUsedWords(new Set([cleanWord]));
    setGuesses([]);
    setCurrentGuess([]);
    setLockedPositions(new Set());
    setRoundOver(false);
    setGameCompletelyOver(false);
    setMessage("");
    setScore(0);
    setCurrentRound(1);
  };

  const handleExit = () => onComplete?.(Math.round((score / TOTAL_ROUNDS) * 100));

  if (!signs || signs.length === 0) return (
    <div className="h-full flex items-center justify-center bg-[#0f0a1e]">
      <p className="text-red-400 font-semibold">No word data available for this game.</p>
    </div>
  );

  if (!targetWord) return (
    <div className="h-full flex items-center justify-center bg-[#0f0a1e]">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Letter tile styles
  const getTileStyle = (guess, rowIndex, i) => {
    const isCurrentRow = rowIndex === guesses.length && !roundOver;
    const isLocked = lockedPositions.has(i);

    if (guess && guess[i]) {
      const status = getLetterStatus(guess, i);
      if (status === "green")  return { bg: 'rgba(52,211,153,0.2)',  border: 'rgba(52,211,153,0.6)',  text: '#34d399' };
      if (status === "yellow") return { bg: 'rgba(251,191,36,0.2)',  border: 'rgba(251,191,36,0.6)',  text: '#fbbf24' };
      return                          { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.15)', text: 'rgba(255,255,255,0.4)' };
    }
    if (isCurrentRow) {
      if (isLocked)       return { bg: 'rgba(52,211,153,0.2)',  border: 'rgba(52,211,153,0.6)',  text: '#34d399' };
      if (currentGuess[i]) return { bg: 'rgba(124,58,237,0.2)', border: 'rgba(124,58,237,0.6)',  text: '#a78bfa' };
      return                      { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.1)', text: 'transparent' };
    }
    if (rowIndex > guesses.length && isLocked)
      return { bg: 'rgba(52,211,153,0.2)', border: 'rgba(52,211,153,0.6)', text: '#34d399' };
    return { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', text: 'transparent' };
  };

  const getChar = (guess, rowIndex, i) => {
    const isCurrentRow = rowIndex === guesses.length && !roundOver;
    const isLocked = lockedPositions.has(i);
    if (guess && guess[i]) return guess[i];
    if (isCurrentRow) {
      if (isLocked) return targetWord[i];
      return currentGuess[i] || '';
    }
    if (rowIndex > guesses.length && isLocked) return targetWord[i];
    return '';
  };

  return (
    <div className="h-full flex flex-col items-center bg-[#0f0a1e] relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex-shrink-0 w-full px-4 pt-4 pb-3 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex justify-center items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Word Guess
          </h1>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2 rounded-full hover:bg-white/10 transition-all text-violet-400"
          >
            <HelpCircle size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="text-center mt-2">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-sm font-bold text-white/50">Round</span>
            <span className="text-lg font-black text-white">{currentRound}/{TOTAL_ROUNDS}</span>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-sm font-bold text-white/50">Score</span>
            <span className="text-lg font-black text-violet-300">{score}</span>
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="relative z-10 flex-1 w-full overflow-y-auto overflow-x-hidden px-4 pb-2">
        <div className="flex flex-col items-center min-h-full">

          {showInstructions && (
            <div className="text-sm bg-white/5 border border-white/10 p-4 rounded-2xl mt-3 max-w-md w-full">
              <p className="mb-3 font-semibold text-white/70">
                Guess the word in <span className="text-violet-300 font-black">{MAX_TRIES}</span> tries!
              </p>
              <div className="space-y-2">
                {[
                  { bg: 'rgba(52,211,153,0.2)',  border: 'rgba(52,211,153,0.5)',  text: '#34d399', label: 'A', desc: 'Correct position (locked)' },
                  { bg: 'rgba(251,191,36,0.2)',  border: 'rgba(251,191,36,0.5)',  text: '#fbbf24', label: 'B', desc: 'In word, wrong position' },
                  { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.15)', text: 'rgba(255,255,255,0.4)', label: 'C', desc: 'Not in word' },
                ].map(({ bg, border, text, label, desc }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0"
                      style={{ background: bg, border: `1px solid ${border}`, color: text }}>
                      {label}
                    </div>
                    <span className="text-xs text-white/50">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {targetSign?.videoUrl && (
            <div className="flex justify-center items-center my-4 w-full">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/30">
                <video
                  src={targetSign.videoUrl ? (props.assets?.videos?.[targetSign.videoUrl] ?? targetSign.videoUrl) : null}
                  muted loop autoPlay playsInline
                  className="w-full max-w-[300px] sm:max-w-[380px] h-auto max-h-[200px] object-contain"
                />
              </div>
            </div>
          )}

          {/* Guesses Grid */}
          <div className="flex flex-col gap-2 mb-4">
            {Array.from({ length: MAX_TRIES }).map((_, rowIndex) => {
              const guess = guesses[rowIndex] || "";
              return (
                <div key={rowIndex} className="flex justify-center gap-1.5">
                  {Array.from({ length: targetWord.length }).map((_, i) => {
                    const style = getTileStyle(guess, rowIndex, i);
                    const char  = getChar(guess, rowIndex, i);
                    return (
                      <div key={i}
                        className="w-9 h-9 sm:w-11 sm:h-11 flex justify-center items-center rounded-xl font-black uppercase text-xl sm:text-2xl transition-all duration-200"
                        style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Round over message */}
          {roundOver && (
            <div className="text-center mb-4 w-full max-w-sm">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4">
                <p className="text-base font-bold text-white/70">{message}</p>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                {!gameCompletelyOver ? (
                  <DarkButton onClick={nextRound} colors={colors}>Next Round →</DarkButton>
                ) : (
                  <>
                    <DarkButton onClick={restartGame} colors={colors}>🎮 Play Again</DarkButton>
                    {onComplete && (
                      <button
                        onClick={handleExit}
                        className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white/70 font-bold hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                      >
                        ← Exit
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Keyboard ── */}
      {!roundOver && (
        <div className="relative z-10 flex-shrink-0 w-full px-4 pb-4 pt-2 bg-white/5 border-t border-white/10 backdrop-blur-sm">
          <div className="text-center mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="text-xs text-white/40">Tries left:</span>
              <span className="text-sm font-black text-violet-300">{MAX_TRIES - guesses.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(30px,1fr))] gap-1.5 w-full max-w-2xl mx-auto">
            {ALPHABETS.map((letter) => (
              <button
                key={letter}
                onClick={() => handleKeyPress(letter)}
                className="relative group py-2 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all min-h-[38px] sm:min-h-[44px] text-white/80 hover:text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onMouseEnter={e => e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary}66, ${colors.secondary}66)`}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                {letter}
              </button>
            ))}
            <button
              onClick={handleBackspace}
              className="py-2 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all min-h-[38px] sm:min-h-[44px] text-red-400"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              ⌫
            </button>
            <button
              onClick={handleEnter}
              className="py-2 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all min-h-[38px] sm:min-h-[44px] text-emerald-400"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}
            >
              ↩
            </button>
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