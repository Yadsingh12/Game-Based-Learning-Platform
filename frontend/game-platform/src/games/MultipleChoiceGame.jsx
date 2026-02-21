// src/components/games/MultipleChoiceGame.jsx
// Multiple choice game with video and 4 options (text + image)

import React, { useState, useEffect } from "react";
import { HelpCircle, Play } from "lucide-react";
import SignVisual from '../components/SignVisual';

const TOTAL_ROUNDS = 5;

export default function MultipleChoiceGame(props) {
  // Extract data from props
  const signs = props.signs || props.data?.signs || props.data || [];
  const onComplete = props.onComplete || props.onExit;
  const category = props.category || {};
  const assets = props.assets || {};
  
  // Extract color scheme from category or use defaults
  const colors = category.colorScheme || {
    primary: "#7c3aed",
    secondary: "#3b82f6",
    light: "#c4b5fd",
    dark: "#5b21b6",
    gradient: "from-purple-600 to-blue-600"
  };

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [roundOver, setRoundOver] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [usedSigns, setUsedSigns] = useState(new Set());
  const [gameCompletelyOver, setGameCompletelyOver] = useState(false);
  const [message, setMessage] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  // Filter valid signs
  const getValidSigns = (items) => {
    return items.filter(sign => sign.name && sign.videoUrl);
  };

  // Pick random sign that hasn't been used
  const pickRandomSign = (items) => {
    const valid = getValidSigns(items);
    const available = valid.filter(sign => !usedSigns.has(sign.name));
    
    if (available.length === 0) {
      // If all signs used, reset
      setUsedSigns(new Set());
      return valid[Math.floor(Math.random() * valid.length)];
    }
    
    return available[Math.floor(Math.random() * available.length)];
  };

  // Generate 4 options with one correct answer
  const generateOptions = (correctSign, allSigns) => {
    const options = [correctSign];
    const available = allSigns.filter(s => s.name !== correctSign.name);
    
    // Pick 3 random wrong answers
    while (options.length < 4 && available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      const wrongSign = available.splice(randomIndex, 1)[0];
      options.push(wrongSign);
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  };

  // Start a new round
  const startRound = () => {
    const validSigns = getValidSigns(signs);
    if (validSigns.length < 4) {
      console.error("Need at least 4 signs for multiple choice");
      return;
    }

    const correctSign = pickRandomSign(validSigns);
    const roundOptions = generateOptions(correctSign, validSigns);
    
    setCurrentQuestion(correctSign);
    setOptions(roundOptions);
    setUsedSigns(prev => new Set([...prev, correctSign.name]));
    setSelectedOption(null);
    setRoundOver(false);
    setIsCorrect(false);
    setMessage("");
  };

  // Initialize first round
  useEffect(() => {
    if (signs.length >= 4) {
      startRound();
    }
  }, [signs.length]);

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (roundOver || gameCompletelyOver) return;
    
    setSelectedOption(option);
    const correct = option.name === currentQuestion.name;
    setIsCorrect(correct);
    setRoundOver(true);
    
    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      
      if (currentRound >= TOTAL_ROUNDS) {
        setGameCompletelyOver(true);
        setMessage(`🎉 Game Complete! You got ${newScore} out of ${TOTAL_ROUNDS} correct!`);
      } else {
        setMessage(`🎉 Correct! Round ${currentRound}/${TOTAL_ROUNDS}`);
      }
    } else {
      if (currentRound >= TOTAL_ROUNDS) {
        setGameCompletelyOver(true);
        setMessage(`Game Complete! You got ${score} out of ${TOTAL_ROUNDS} correct!`);
      } else {
        setMessage(`Wrong! The correct answer was "${currentQuestion.name}". Round ${currentRound}/${TOTAL_ROUNDS}`);
      }
    }
  };

  const nextRound = () => {
    if (currentRound >= TOTAL_ROUNDS) return;
    
    setCurrentRound(prev => prev + 1);
    startRound();
  };

  const restartGame = () => {
    setScore(0);
    setCurrentRound(1);
    setUsedSigns(new Set());
    setGameCompletelyOver(false);
    startRound();
  };

  const handleExit = () => {
    if (onComplete) {
      const percentage = Math.round((score / TOTAL_ROUNDS) * 100);
      onComplete(percentage);
    }
  };

  if (!signs || signs.length < 4) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <p className="text-red-600 font-semibold">Need at least 4 signs for this game.</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 w-full px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
        <div className="flex justify-center items-center gap-2 sm:gap-3">
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent font-sans drop-shadow-sm`}>
            Multiple Choice
          </h1>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/50 transition-all duration-200 backdrop-blur-sm"
            style={{ color: colors.primary }}
          >
            <HelpCircle size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Score & Round - Always visible */}
        <div className="text-center mt-1.5 sm:mt-2">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/60 backdrop-blur-sm shadow-sm border border-white/40">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold" style={{ color: colors.dark }}>Round:</span>
              <span className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">{currentRound}/{TOTAL_ROUNDS}</span>
            </div>
            <div className="w-px h-3 sm:h-4 bg-gray-300"></div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold" style={{ color: colors.dark }}>Score:</span>
              <span className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="flex flex-col items-center min-h-full max-w-4xl mx-auto">
          {/* Instructions - Collapsible */}
          {showInstructions && (
            <div className="text-xs sm:text-sm bg-white/80 backdrop-blur-md shadow-xl p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-2 sm:mb-3 w-full border border-white/60 animate-in fade-in slide-in-from-top duration-300">
              <p className="mb-2 font-semibold text-gray-700">Watch the video and select the correct answer from the 4 options!</p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Watch the sign language video carefully</li>
                <li>Click on the option that matches the video</li>
                <li>You have {TOTAL_ROUNDS} rounds to complete</li>
                <li>Try to get the highest score!</li>
              </ul>
            </div>
          )}

          {!roundOver ? (
            <>
              {/* Question prompt */}
              <div className="mb-3 sm:mb-4 w-full">
                <div className="bg-white/80 backdrop-blur-sm shadow-lg p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-white/60">
                  <p className="text-sm sm:text-lg md:text-xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
                    <Play size={20} className="sm:w-6 sm:h-6" style={{ color: colors.primary }} />
                    <span className="text-sm sm:text-base md:text-lg">Watch the video and select the correct answer</span>
                  </p>
                </div>
              </div>

              {/* Video */}
              {currentQuestion?.videoUrl && (
                <div className="flex justify-center items-center mb-4 sm:mb-6 w-full">
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/50 bg-white/30 backdrop-blur-sm">
                    <video
                      key={currentQuestion.name}
                      src={currentQuestion.videoUrl ? (assets?.videos?.[currentQuestion.videoUrl] ?? currentQuestion.videoUrl) : null}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[450px] h-auto max-h-[180px] sm:max-h-[250px] object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full mb-4">
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className="group relative p-3 sm:p-6 bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border-2 border-white/60 hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                    style={{ 
                      borderColor: selectedOption?.name === option.name 
                        ? colors.primary 
                        : 'rgba(255,255,255,0.6)'
                    }}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3">
                      {/* Visual */}
                      {option.visual && (
                        <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32">
                          <SignVisual 
                            visual={option.visual} 
                            assets={assets}
                            className="w-full h-full"
                          />
                        </div>
                      )}
                      
                      {/* Text */}
                      <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 text-center break-words">
                        {option.name}
                      </span>
                    </div>
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                    ></div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Round Over Message */
            <div className="text-center mb-4 mt-4 sm:mt-8 animate-in fade-in zoom-in duration-500 w-full">
              <div className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/60 mb-4 sm:mb-6">
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">{isCorrect ? '🎉' : '❌'}</div>
                <p className="text-xl sm:text-2xl font-black mb-2" style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>
                  {isCorrect ? 'Correct!' : 'Wrong Answer!'}
                </p>
                <p className="text-base sm:text-lg font-bold mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {message}
                </p>
                
                {/* Show correct answer with visual */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Correct Answer:</p>
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    {currentQuestion.visual && (
                      <div className="w-24 h-24 sm:w-32 sm:h-32">
                        <SignVisual 
                          visual={currentQuestion.visual} 
                          assets={assets}
                          className="w-full h-full"
                        />
                      </div>
                    )}
                    <span className="text-lg sm:text-xl font-bold text-gray-800">{currentQuestion.name}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
                {!gameCompletelyOver ? (
                  <button
                    onClick={nextRound}
                    className="group relative px-6 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base rounded-xl sm:rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
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
                      className="group relative px-6 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base rounded-xl sm:rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
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
                        className="group relative px-6 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
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