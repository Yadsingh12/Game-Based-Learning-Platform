// src/components/games/CrosswordGame.jsx
// Standardized crossword/wordle-style game with Tailwind CSS

import React, { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_TRIES = 3;
const MAX_WORD_LENGTH = 8;
const TOTAL_ROUNDS = 5;

export default function CrossWordGame(props) {
  // Extract data from props - flexible to handle different formats
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
  
  const [targetWord, setTargetWord] = useState("");
  const [targetSign, setTargetSign] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]); // Array to track each position
  const [lockedPositions, setLockedPositions] = useState(new Set()); // Use Set for locked positions
  const [roundOver, setRoundOver] = useState(false);
  const [message, setMessage] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [usedWords, setUsedWords] = useState(new Set());
  const [gameCompletelyOver, setGameCompletelyOver] = useState(false);

  // Filter valid words for the game
  const getValidWords = (items) => {
    return items.filter(
      (sign) => {
        if (!sign.name) return false;
        // Remove spaces and check length
        const cleanName = sign.name.replace(/\s+/g, '');
        return cleanName.length <= MAX_WORD_LENGTH && cleanName.length >= 3;
      }
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

  useEffect(() => {
    if (signs.length > 0) {
      const randomSign = pickRandomWord(signs);
      if (randomSign) {
        // Remove spaces from the target word
        const cleanWord = randomSign.name.replace(/\s+/g, '').toUpperCase();
        setTargetWord(cleanWord);
        setTargetSign(randomSign);
        setUsedWords(prev => new Set([...prev, cleanWord]));
      }
    }
  }, [signs.length]);

  const handleKeyPress = (letter) => {
    if (roundOver || gameCompletelyOver) return;
    
    // Find the next unlocked position
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
    
    // Find the last filled unlocked position and remove it
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
    
    // Check if all unlocked positions are filled
    for (let i = 0; i < targetWord.length; i++) {
      if (!lockedPositions.has(i) && !currentGuess[i]) {
        return; // Not all positions filled
      }
    }

    // Build complete guess including locked positions
    const completeGuess = targetWord.split('').map((char, i) => {
      if (lockedPositions.has(i)) {
        return char; // Use the correct locked letter
      }
      return currentGuess[i] || '';
    }).join('');

    const newGuesses = [...guesses, completeGuess];
    setGuesses(newGuesses);

    // Update locked positions - add any newly correct positions
    const newLockedPositions = new Set(lockedPositions);
    for (let i = 0; i < targetWord.length; i++) {
      if (completeGuess[i] === targetWord[i]) {
        newLockedPositions.add(i);
      }
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
    
    // Reset current guess array but keep locked positions
    setCurrentGuess([]);
  };

  const getLetterStatus = (guess, index) => {
    const letter = guess[index];
    if (targetWord[index] === letter) return "green";
    if (targetWord.includes(letter)) return "yellow";
    return "red";
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

  if (!targetWord) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 w-full px-4 pt-4 pb-3">
        <div className="flex justify-center items-center gap-3">
          <h1 className={`text-2xl sm:text-3xl font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent font-sans drop-shadow-sm`}>
            Word Guess
          </h1>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2 rounded-full hover:bg-white/50 transition-all duration-200 backdrop-blur-sm"
            style={{ color: colors.primary }}
          >
            <HelpCircle size={22} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Score - Always visible */}
        <div className="text-center mt-2">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm shadow-sm border border-white/40">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: colors.dark }}>Round:</span>
              <span className="text-lg font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{currentRound}/{TOTAL_ROUNDS}</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: colors.dark }}>Score:</span>
              <span className="text-lg font-extrabold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden px-4 pb-2">
        <div className="flex flex-col items-center min-h-full">
          {/* Instructions - Collapsible */}
          {showInstructions && (
            <div className="text-sm bg-white/80 backdrop-blur-md shadow-xl p-4 rounded-2xl mb-3 max-w-md w-full border border-white/60 animate-in fade-in slide-in-from-top duration-300">
              <p className="mb-3 font-semibold text-gray-700">Guess the word in <span className="text-lg font-bold" style={{ color: colors.primary }}>{MAX_TRIES}</span> tries!</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-md flex items-center justify-center">
                    <span className="text-white font-bold text-xs">A</span>
                  </div>
                  <span className="text-xs text-gray-600">Correct position (locked)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg shadow-md flex items-center justify-center">
                    <span className="text-gray-800 font-bold text-xs">B</span>
                  </div>
                  <span className="text-xs text-gray-600">In word, wrong position</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg shadow-md flex items-center justify-center">
                    <span className="text-white font-bold text-xs">C</span>
                  </div>
                  <span className="text-xs text-gray-600">Not in word</span>
                </div>
              </div>
            </div>
          )}

          {/* Video - Flexible but constrained */}
          {targetSign?.videoUrl && (
            <div className="flex justify-center items-center mb-4 w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 bg-white/30 backdrop-blur-sm">
                <video
                  src={targetSign.videoUrl ? (props.assets?.videos?.[targetSign.videoUrl] ?? targetSign.videoUrl) : null}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="w-full max-w-[300px] sm:max-w-[380px] h-auto max-h-[200px] object-contain"
                />
              </div>
            </div>
          )}

          {/* Guesses Grid */}
          <div className="flex flex-col gap-2 mb-4">
            {Array.from({ length: MAX_TRIES }).map((_, rowIndex) => {
              const guess = guesses[rowIndex] || "";
              const isCurrentRow = rowIndex === guesses.length && !roundOver;
              
              return (
                <div key={rowIndex} className="flex justify-center gap-1.5">
                  {Array.from({ length: targetWord.length }).map((_, i) => {
                    let char = "";
                    let bgColor = "bg-white border-gray-200";
                    let textColor = "text-gray-800";
                    let extraClasses = "";
                    const isLocked = lockedPositions.has(i);
                    
                    if (guess && guess[i]) {
                      // This is a submitted guess
                      char = guess[i];
                      const status = getLetterStatus(guess, i);
                      if (status === "green") {
                        bgColor = "bg-gradient-to-br from-green-400 to-green-600";
                        textColor = "text-white";
                        extraClasses = "shadow-lg shadow-green-500/50 border-green-400";
                      } else if (status === "yellow") {
                        bgColor = "bg-gradient-to-br from-yellow-300 to-yellow-500";
                        textColor = "text-gray-800";
                        extraClasses = "shadow-lg shadow-yellow-500/50 border-yellow-400";
                      } else if (status === "red") {
                        bgColor = "bg-gradient-to-br from-gray-300 to-gray-400";
                        textColor = "text-white";
                        extraClasses = "shadow-md border-gray-300";
                      }
                    } else if (isCurrentRow) {
                      // This is the current input row
                      if (isLocked) {
                        // Show locked letter in green
                        char = targetWord[i];
                        bgColor = "bg-gradient-to-br from-green-400 to-green-600";
                        textColor = "text-white";
                        extraClasses = "shadow-lg shadow-green-500/50 border-green-400";
                      } else {
                        // Show current input for this position
                        char = currentGuess[i] || "";
                        if (char) {
                          bgColor = "bg-gradient-to-br from-blue-100 to-blue-200";
                          textColor = "text-gray-800";
                          extraClasses = "border-blue-300 shadow-md scale-105";
                        }
                      }
                    } else if (rowIndex > guesses.length && isLocked) {
                      // Future rows show locked letters in green
                      char = targetWord[i];
                      bgColor = "bg-gradient-to-br from-green-400 to-green-600";
                      textColor = "text-white";
                      extraClasses = "shadow-lg shadow-green-500/50 border-green-400";
                    }
                    
                    return (
                      <div
                        key={i}
                        className={`w-9 h-9 sm:w-11 sm:h-11 flex justify-center items-center border-2 rounded-xl font-black uppercase text-xl sm:text-2xl ${bgColor} ${textColor} ${extraClasses} transition-all duration-300`}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Round Over / Game Over Message */}
          {roundOver && (
            <div className="text-center mb-4 animate-in fade-in zoom-in duration-500">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/60 mb-4">
                <p className="text-lg font-bold mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{message}</p>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                {!gameCompletelyOver ? (
                  <button
                    onClick={nextRound}
                    className="group relative px-8 py-3.5 text-base rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
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
                      className="group relative px-8 py-3.5 text-base rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
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
                        className="group relative px-8 py-3.5 text-base rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
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

      {/* Keyboard - Fixed at bottom */}
      {!roundOver && (
        <div className="flex-shrink-0 w-full px-4 pb-4 bg-gradient-to-t from-white/40 to-transparent backdrop-blur-sm">
          {/* Tries Left */}
          <div className="text-center mb-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm shadow-sm border border-white/40">
              <span className="text-xs font-semibold text-gray-600">Tries left:</span>
              <span className="text-lg font-black" style={{ color: colors.primary }}>{MAX_TRIES - guesses.length}</span>
            </div>
          </div>
          
          {/* Keyboard */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(30px,1fr))] gap-1.5 w-full max-w-2xl mx-auto">
            {ALPHABETS.map((letter) => (
              <button
                key={letter}
                onClick={() => handleKeyPress(letter)}
                className="relative group p-2 text-white rounded-xl font-bold text-sm sm:text-base hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl min-h-[38px] sm:min-h-[44px] overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
              >
                <span className="relative z-10">{letter}</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
            ))}
            <button
              onClick={handleBackspace}
              className="relative group p-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl font-bold text-sm sm:text-base hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl min-h-[38px] sm:min-h-[44px] overflow-hidden"
            >
              <span className="relative z-10">⌫</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
            <button
              onClick={handleEnter}
              className="relative group p-2 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl min-h-[38px] sm:min-h-[44px] overflow-hidden"
            >
              <span className="relative z-10">ENTER</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}