// src/components/games/WordScrambleGame.jsx
// Modern word scramble game with 5 rounds and Tailwind CSS

import React, { useEffect, useState } from "react";
import { HelpCircle, Timer, Shuffle } from "lucide-react";

const TOTAL_ROUNDS = 5;
const TIME_PER_ROUND = 30;

export default function WordScrambleGame(props) {
  // Extract data from props
  const signs = props.signs || props.data?.signs || props.data || [];
  const onComplete = props.onComplete || props.onExit;
  const category = props.category || {};
  
  // Extract color scheme from category or use defaults
  const colors = category.colorScheme || {
    primary: "#7c3aed",
    secondary: "#3b82f6",
    light: "#c4b5fd",
    dark: "#5b21b6",
    gradient: "from-purple-600 to-blue-600"
  };

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [chars, setChars] = useState([]);
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

  // Filter valid words
  const getValidWords = (items) => {
    return items.filter(
      (sign) => sign.name && sign.name.length >= 3 && sign.name.length <= 12
    );
  };

  // Pick random word that hasn't been used
  const pickRandomWord = (items) => {
    const valid = getValidWords(items);
    const available = valid.filter(sign => !usedWords.has(sign.name.toUpperCase()));
    
    if (available.length === 0) {
      // If all words used, reset and start over
      setUsedWords(new Set());
      return valid[Math.floor(Math.random() * valid.length)];
    }
    
    return available[Math.floor(Math.random() * available.length)];
  };

  // Shuffle word
  const shuffle = (word) => {
    const cleaned = word.replace(/\s+/g, '').toUpperCase();
    let arr = cleaned.split("");
    // Keep shuffling until it's different from original
    let shuffled;
    do {
      shuffled = arr.sort(() => Math.random() - 0.5);
    } while (shuffled.join('') === cleaned && cleaned.length > 1);
    return shuffled;
  };

  // Start a new round
  const startGame = (question) => {
    const cleanName = question.name.replace(/\s+/g, '').toUpperCase();
    setCurrentQuestion({ ...question, cleanName });
    setChars(shuffle(question.name));
    setUsedWords(prev => new Set([...prev, cleanName]));
    setTimeLeft(TIME_PER_ROUND);
    setRoundOver(false);
    setIsCorrect(false);
    setMessage("");
  };

  // Initialize first question
  useEffect(() => {
    if (signs.length > 0) {
      const randomSign = pickRandomWord(signs);
      if (randomSign) {
        startGame(randomSign);
      }
    }
  }, [signs.length]);

  // Timer countdown
  useEffect(() => {
    if (!roundOver && !gameCompletelyOver && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !roundOver) {
      endRound(false);
    }
  }, [timeLeft, roundOver, gameCompletelyOver]);

  const handleDragStart = (index) => {
    if (roundOver || gameCompletelyOver) return;
    setDragIndex(index);
  };

  const handleDrop = (index) => {
    if (roundOver || gameCompletelyOver || dragIndex === null) return;
    const newChars = [...chars];
    const temp = newChars[dragIndex];
    newChars[dragIndex] = newChars[index];
    newChars[index] = temp;
    setChars(newChars);
    setDragIndex(null);
  };

  const handleTouchStart = (index) => {
    if (roundOver || gameCompletelyOver) return;
    setDragIndex(index);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  const handleTouchEnd = (index) => {
    if (roundOver || gameCompletelyOver || dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      return;
    }
    const newChars = [...chars];
    const temp = newChars[dragIndex];
    newChars[dragIndex] = newChars[index];
    newChars[index] = temp;
    setChars(newChars);
    setDragIndex(null);
  };

  const shuffleLetters = () => {
    if (roundOver || gameCompletelyOver) return;
    setChars(shuffle(currentQuestion.name));
  };

  const checkAnswer = () => {
    if (roundOver || gameCompletelyOver) return;
    const userAnswer = chars.join("");
    if (userAnswer === currentQuestion.cleanName) {
      endRound(true);
    } else {
      endRound(false);
    }
  };

  const endRound = (correct) => {
    setRoundOver(true);
    setIsCorrect(correct);
    
    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      
      if (currentRound >= TOTAL_ROUNDS) {
        setGameCompletelyOver(true);
        setMessage(`🎉 Game Complete! You got ${newScore} out of ${TOTAL_ROUNDS} words!`);
      } else {
        setMessage(`🎉 Correct! Round ${currentRound}/${TOTAL_ROUNDS}`);
      }
    } else {
      if (currentRound >= TOTAL_ROUNDS) {
        setGameCompletelyOver(true);
        setMessage(`Game Complete! You got ${score} out of ${TOTAL_ROUNDS} words!`);
      } else {
        setMessage(`The word was "${currentQuestion.cleanName}". Round ${currentRound}/${TOTAL_ROUNDS}`);
      }
    }
  };

  const nextRound = () => {
    if (currentRound >= TOTAL_ROUNDS) return;
    
    const randomSign = pickRandomWord(signs);
    if (!randomSign) return;
    
    startGame(randomSign);
    setCurrentRound(prev => prev + 1);
  };

  const restartGame = () => {
    const randomSign = pickRandomWord(signs);
    if (!randomSign) return;
    
    startGame(randomSign);
    setUsedWords(new Set([randomSign.name.replace(/\s+/g, '').toUpperCase()]));
    setScore(0);
    setCurrentRound(1);
    setGameCompletelyOver(false);
  };

  const handleExit = () => {
    if (onComplete) {
      // Calculate percentage: (score / total rounds) * 100
      const percentage = Math.round((score / TOTAL_ROUNDS) * 100);
      onComplete(percentage);
    }
  };

  if (!signs || signs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">No word data available for this game.</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-start bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 w-full px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
        <div className="flex justify-center items-center gap-3">
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent font-sans drop-shadow-sm`}>
            Word Scramble
          </h1>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2 rounded-full hover:bg-white/50 transition-all duration-200 backdrop-blur-sm"
            style={{ color: colors.primary }}
          >
            <HelpCircle size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Score & Round - Always visible */}
        <div className="text-center mt-2">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm shadow-sm border border-white/40">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold" style={{ color: colors.dark }}>Round:</span>
              <span className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{currentRound}/{TOTAL_ROUNDS}</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold" style={{ color: colors.dark }}>Score:</span>
              <span className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions - Fixed overlay */}
      {showInstructions && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-24 sm:pt-28 px-4 animate-in fade-in duration-200"
          onClick={() => setShowInstructions(false)}
        >
          <div 
            className="text-sm bg-white/95 backdrop-blur-md shadow-2xl p-4 sm:p-5 rounded-2xl max-w-md w-full border border-white/60 animate-in slide-in-from-top duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-3">
              <p className="font-semibold text-gray-700 text-base">How to Play</p>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-500 hover:text-gray-700 font-bold text-xl leading-none -mt-1 -mr-1 p-1"
              >
                ×
              </button>
            </div>
            <p className="mb-2 text-gray-600">Unscramble the word by dragging letters to their correct positions!</p>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5 list-disc list-inside">
              <li>Drag and drop letters to rearrange them</li>
              <li>You have {TIME_PER_ROUND} seconds per word</li>
              <li>Use the shuffle button to randomize letters</li>
              <li>Submit your answer when ready</li>
            </ul>
          </div>
        </div>
      )}

      {/* Main content area - No scrolling, centered */}
      <div className="flex-1 w-full px-4 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center w-full max-w-2xl">
          {!roundOver ? (
            <>
              {/* Video */}
              {currentQuestion?.videoUrl && (
                <div className="flex justify-center items-center mb-3 sm:mb-4 w-full">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 bg-white/30 backdrop-blur-sm">
                    <video
                      src={currentQuestion.videoUrl}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="w-full max-w-[240px] sm:max-w-[300px] md:max-w-[380px] h-auto max-h-[160px] sm:max-h-[200px] object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Timer */}
              <div className="mb-3 sm:mb-4">
                <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/70 backdrop-blur-sm shadow-lg border border-white/60">
                  <Timer size={18} style={{ color: timeLeft <= 10 ? '#ef4444' : colors.primary }} />
                  <span className={`text-lg sm:text-xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`} style={{ color: timeLeft > 10 ? colors.dark : undefined }}>
                    {timeLeft}s
                  </span>
                </div>
              </div>

              {/* Scrambled Letters */}
              <div className="mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 sm:mb-3 text-center">Arrange the letters:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center max-w-md">
                  {chars.map((ch, i) => (
                    <div
                      key={i}
                      className={`
                        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex justify-center items-center
                        rounded-xl font-black uppercase text-lg sm:text-xl md:text-2xl
                        cursor-grab active:cursor-grabbing
                        transition-all duration-200
                        ${dragIndex === i ? 'scale-110 rotate-6 shadow-2xl' : 'shadow-lg hover:scale-105'}
                      `}
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        color: 'white'
                      }}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(i)}
                      onTouchStart={() => handleTouchStart(i)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={() => handleTouchEnd(i)}
                    >
                      {ch}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                <button
                  onClick={shuffleLetters}
                  className="group relative px-4 sm:px-6 py-2.5 sm:py-3 text-sm rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Shuffle size={16} />
                    Shuffle
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </button>
                
                <button
                  onClick={checkAnswer}
                  className="group relative px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  <span className="relative z-10">Submit Answer</span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </button>
              </div>
            </>
          ) : (
            /* Round Over / Game Over Message */
            <div className="text-center animate-in fade-in zoom-in duration-500 w-full max-w-md">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/60 mb-4">
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">{isCorrect ? '🎉' : '❌'}</div>
                <p className="text-xl sm:text-2xl font-black mb-2" style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>
                  {isCorrect ? 'Correct!' : (timeLeft === 0 ? 'Time\'s Up!' : 'Wrong Answer!')}
                </p>
                <p className="text-base sm:text-lg font-bold mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {message}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-gray-600 mt-2">
                    Correct answer: <span className="font-bold text-gray-800">{currentQuestion.cleanName}</span>
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
                {!gameCompletelyOver ? (
                  <button
                    onClick={nextRound}
                    className="group relative px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Next Round →
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={restartGame}
                      className="group relative px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        🎮 Play Again
                      </span>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    </button>
                    {onComplete && (
                      <button
                        onClick={handleExit}
                        className="group relative px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          ← Exit
                        </span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
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