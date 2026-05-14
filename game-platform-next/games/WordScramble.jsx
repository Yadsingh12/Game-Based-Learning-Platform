// src/components/games/WordScrambleGame.jsx
// Dark cosmic restyled version

import React, { useEffect, useState } from "react";
import { HelpCircle, Timer, Shuffle } from "lucide-react";

const TOTAL_ROUNDS = 5;
const TIME_PER_ROUND = 30;

export default function WordScrambleGame(props) {
  const signs = props.signs || props.data?.signs || props.data || [];
  const onComplete = props.onComplete || props.onExit;
  const category = props.category || {};

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [slots, setSlots] = useState([]);
  const [letterChars, setLetterChars] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [roundOver, setRoundOver] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [usedWords, setUsedWords] = useState(new Set());
  const [gameCompletelyOver, setGameCompletelyOver] = useState(false);
  const [message, setMessage] = useState("");

  const getValidWords = (items) =>
    items.filter(sign => sign.name && sign.name.replace(/\s+/g, "").length >= 3 && sign.name.length <= 20);

  const pickRandomWord = (items) => {
    const valid = getValidWords(items);
    const available = valid.filter(sign => !usedWords.has(sign.name.toUpperCase()));
    if (available.length === 0) { setUsedWords(new Set()); return valid[Math.floor(Math.random() * valid.length)]; }
    return available[Math.floor(Math.random() * available.length)];
  };

  const buildSlots = (word) => {
    const upper = word.toUpperCase();
    const slots = [];
    let letterCount = 0;
    for (const ch of upper) {
      if (ch === " ") slots.push({ type: "space" });
      else { slots.push({ type: "letter", letterIndex: letterCount }); letterCount++; }
    }
    return slots;
  };

  const shuffleLetters = (letters) => {
    let arr = [...letters];
    let shuffled;
    do { shuffled = arr.sort(() => Math.random() - 0.5); }
    while (shuffled.join("") === letters.join("") && letters.length > 1);
    return [...shuffled];
  };

  const extractLetters = (word) => word.toUpperCase().split("").filter(ch => ch !== " ");

  const startGame = (question) => {
    const upperName = question.name.toUpperCase();
    const newSlots = buildSlots(question.name);
    const letters = extractLetters(question.name);
    const scrambled = shuffleLetters(letters);
    setCurrentQuestion({ ...question, upperName });
    setSlots(newSlots);
    setLetterChars(scrambled);
    setUsedWords(prev => new Set([...prev, upperName]));
    setTimeLeft(TIME_PER_ROUND);
    setRoundOver(false);
    setIsCorrect(false);
    setMessage("");
  };

  useEffect(() => {
    if (signs.length > 0) { const r = pickRandomWord(signs); if (r) startGame(r); }
  }, [signs.length]);

  useEffect(() => {
    if (!roundOver && !gameCompletelyOver && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !roundOver) {
      endRound(false);
    }
  }, [timeLeft, roundOver, gameCompletelyOver]);

  const buildAnswerFromLetters = (letters, slotsArr) => {
    let li = 0;
    return slotsArr.map(slot => { if (slot.type === "space") return " "; return letters[li++] ?? ""; }).join("");
  };

  const handleDragStart = (index) => { if (roundOver || gameCompletelyOver) return; setDragIndex(index); };
  const handleDrop = (index) => {
    if (roundOver || gameCompletelyOver || dragIndex === null) return;
    const newChars = [...letterChars];
    [newChars[dragIndex], newChars[index]] = [newChars[index], newChars[dragIndex]];
    setLetterChars(newChars);
    setDragIndex(null);
  };
  const handleTouchStart = (index) => { if (roundOver || gameCompletelyOver) return; setDragIndex(index); };
  const handleTouchMove = (e) => e.preventDefault();
  const handleTouchEnd = (index) => {
    if (roundOver || gameCompletelyOver || dragIndex === null || dragIndex === index) { setDragIndex(null); return; }
    const newChars = [...letterChars];
    [newChars[dragIndex], newChars[index]] = [newChars[index], newChars[dragIndex]];
    setLetterChars(newChars);
    setDragIndex(null);
  };

  const handleShuffle = () => { if (roundOver || gameCompletelyOver) return; setLetterChars(shuffleLetters(letterChars)); };

  const checkAnswer = () => {
    if (roundOver || gameCompletelyOver) return;
    const userAnswer = buildAnswerFromLetters(letterChars, slots);
    endRound(userAnswer === currentQuestion.upperName);
  };

  const endRound = (correct) => {
    setRoundOver(true);
    setIsCorrect(correct);
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    if (currentRound >= TOTAL_ROUNDS) {
      setGameCompletelyOver(true);
      setMessage(`${correct ? "🎉 " : ""}Game Complete! You got ${correct ? newScore : score} out of ${TOTAL_ROUNDS} words!`);
    } else {
      setMessage(correct
        ? `🎉 Correct! Round ${currentRound}/${TOTAL_ROUNDS}`
        : `The word was "${currentQuestion.upperName}". Round ${currentRound}/${TOTAL_ROUNDS}`);
    }
  };

  const nextRound = () => {
    if (currentRound >= TOTAL_ROUNDS) return;
    const r = pickRandomWord(signs);
    if (!r) return;
    startGame(r);
    setCurrentRound(prev => prev + 1);
  };

  const restartGame = () => {
    const r = pickRandomWord(signs);
    if (!r) return;
    startGame(r);
    setUsedWords(new Set([r.name.toUpperCase()]));
    setScore(0);
    setCurrentRound(1);
    setGameCompletelyOver(false);
  };

  const handleExit = () => onComplete?.(Math.round((score / TOTAL_ROUNDS) * 100));

  const progress = ((currentRound - 1) / TOTAL_ROUNDS) * 100;

  if (!signs || signs.length === 0) return (
    <div className="h-full flex items-center justify-center bg-[#0f0a1e]">
      <p className="text-white/50">No word data available for this game.</p>
    </div>
  );
  if (!currentQuestion) return (
    <div className="h-full flex items-center justify-center bg-[#0f0a1e]">
      <p className="text-white/40">Loading...</p>
    </div>
  );

  const getTileSize = (letterCount) => {
    if (letterCount <= 6)  return { tile: "w-12 h-12 sm:w-14 sm:h-14", text: "text-xl sm:text-2xl" };
    if (letterCount <= 9)  return { tile: "w-10 h-10 sm:w-12 sm:h-12", text: "text-lg sm:text-xl" };
    if (letterCount <= 12) return { tile: "w-8 h-8 sm:w-10 sm:h-10", text: "text-base sm:text-lg" };
    if (letterCount <= 16) return { tile: "w-7 h-7 sm:w-8 sm:h-8", text: "text-sm sm:text-base" };
    return { tile: "w-6 h-6 sm:w-7 sm:h-7", text: "text-xs sm:text-sm" };
  };

  const renderLetterTiles = () => {
    const { tile: tileClass, text: textClass } = getTileSize(letterChars.length);
    let letterIdx = 0;
    const groups = [];
    let currentGroup = [];
    for (const slot of slots) {
      if (slot.type === "space") { groups.push(currentGroup); currentGroup = []; }
      else { currentGroup.push({ letterIdx: letterIdx++ }); }
    }
    groups.push(currentGroup);

    return (
      <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center max-w-lg">
        {groups.map((group, gi) => (
          <React.Fragment key={gi}>
            <div className="flex gap-1 sm:gap-1.5">
              {group.map(({ letterIdx: li }) => (
                <div
                  key={li}
                  className={`
                    ${tileClass} flex justify-center items-center
                    rounded-xl font-black uppercase ${textClass}
                    cursor-grab active:cursor-grabbing
                    border border-white/20
                    transition-all duration-200
                    ${dragIndex === li ? "scale-110 rotate-6 shadow-2xl shadow-violet-500/30" : "hover:scale-105"}
                  `}
                  style={{
                    background: dragIndex === li
                      ? 'linear-gradient(135deg, #7c3aed, #3b82f6)'
                      : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    backdropFilter: 'blur(8px)',
                  }}
                  draggable
                  onDragStart={() => handleDragStart(li)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(li)}
                  onTouchStart={() => handleTouchStart(li)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => handleTouchEnd(li)}
                >
                  {letterChars[li]}
                </div>
              ))}
            </div>
            {gi < groups.length - 1 && (
              <div className="flex items-center px-1">
                <div className={`w-6 ${tileClass.match(/h-\S+/)?.[0] ?? "h-10"} flex items-center justify-center`}>
                  <div className="w-0.5 h-6 rounded-full opacity-30 bg-violet-400" />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const timerUrgent = timeLeft <= 10;

  return (
    <div className="h-full flex flex-col items-center justify-start bg-[#0f0a1e] overflow-hidden relative">

      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px]
                      bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px]
                      bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 w-full px-4 pt-4 pb-3 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-white">Word Scramble</h1>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
            >
              <HelpCircle size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/40 font-semibold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              Round <span className="text-white font-black">{currentRound}</span>/{TOTAL_ROUNDS}
            </span>
            <span className="text-white/40 font-semibold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              ⭐ <span className="text-white font-black">{score}</span>
            </span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7c3aed, #3b82f6)' }}
          />
        </div>
      </div>

      {/* Instructions overlay */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-[#1a1035] border border-white/15 shadow-2xl p-5 rounded-3xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <p className="font-black text-white text-base">How to Play</p>
              <button onClick={() => setShowInstructions(false)} className="text-white/40 hover:text-white font-black text-xl p-1">×</button>
            </div>
            <p className="mb-3 text-white/60 text-sm">Unscramble the word by dragging letters!</p>
            <ul className="text-sm text-white/50 space-y-1.5 list-disc list-inside">
              <li>Drag and drop letters to rearrange them</li>
              <li>Spaces between words are fixed — only letters move</li>
              <li>You have {TIME_PER_ROUND} seconds per word</li>
              <li>Use the shuffle button to randomize letters</li>
            </ul>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex-1 w-full px-4 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center w-full max-w-2xl">
          {!roundOver ? (
            <>
              {/* Video */}
              {currentQuestion?.videoUrl && (
                <div className="flex justify-center items-center mb-4 w-full">
                  <div className="rounded-2xl overflow-hidden ring-1 ring-white/15 bg-black/30">
                    <video
                      src={currentQuestion.videoUrl}
                      muted loop autoPlay playsInline
                      className="w-full max-w-[240px] sm:max-w-[300px] h-auto max-h-[160px] sm:max-h-[200px] object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Timer */}
              <div className="mb-4">
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full
                                 border transition-all
                                 ${timerUrgent
                                   ? 'bg-red-500/10 border-red-500/30'
                                   : 'bg-white/5 border-white/10'}`}>
                  <Timer size={16} className={timerUrgent ? 'text-red-400' : 'text-violet-400'} />
                  <span className={`text-lg font-black ${timerUrgent ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>

              {/* Letter tiles */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-white/30 mb-3 text-center uppercase tracking-widest">
                  Arrange the letters
                </p>
                {renderLetterTiles()}
                {slots.some(s => s.type === "space") && (
                  <p className="text-xs text-center mt-2 text-white/25 italic">
                    The thin bar represents a space between words
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={handleShuffle}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm
                             bg-white/10 border border-white/10 text-white/70
                             hover:bg-white/15 hover:text-white active:scale-95 transition-all"
                >
                  <Shuffle size={15} />
                  Shuffle
                </button>
                <button
                  onClick={checkAnswer}
                  className="px-7 py-2.5 rounded-2xl font-black text-sm text-white
                             bg-gradient-to-r from-violet-600 to-blue-600
                             shadow-lg shadow-violet-500/20
                             hover:opacity-90 active:scale-95 transition-all"
                >
                  Submit Answer
                </button>
              </div>
            </>
          ) : (
            <div className="text-center w-full max-w-md">
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-5 sm:p-6 mb-4">
                <div className="text-5xl mb-3">{isCorrect ? "🎉" : "❌"}</div>
                <p className="text-xl sm:text-2xl font-black mb-2"
                   style={{ color: isCorrect ? '#34d399' : '#f87171' }}>
                  {isCorrect ? "Correct!" : timeLeft === 0 ? "Time's Up!" : "Wrong Answer!"}
                </p>
                <p className="text-sm font-semibold mb-1 text-white/50">{message}</p>
                {!isCorrect && (
                  <p className="text-sm text-white/40 mt-2">
                    Correct answer: <span className="font-black text-white">{currentQuestion.upperName}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                {!gameCompletelyOver ? (
                  <DarkButton onClick={nextRound}>Next Round →</DarkButton>
                ) : (
                  <>
                    <DarkButton onClick={restartGame}>🎮 Play Again</DarkButton>
                    {onComplete && (
                      <button
                        onClick={handleExit}
                        className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/10
                                   text-white/70 font-bold hover:bg-white/15 hover:text-white
                                   transition-all hover:scale-105 active:scale-95"
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