// src/games/FindInImageGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

const FindInImageGame = ({ data, pack, category, assets, onExit }) => {
  const signs = data?.signs || [];

  const [svgContent, setSvgContent] = useState('');
  const [gameState, setGameState] = useState('loading');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const svgContainerRef = useRef(null);

  const svgPath = category?.gameAssets?.findInImage?.svgPath;
  const imagePath = category?.gameAssets?.findInImage?.imagePath;

  if (!signs.length) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900">
        <p className="text-red-600 text-xl">No data available</p>
      </div>
    );
  }

  if (!svgPath) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-900">
        <div className="text-center p-4">
          <p className="text-red-600 text-xl mb-4">
            This category does not support the Find In Image game
          </p>
          <button onClick={() => onExit(0)} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const shuffled = [...signs].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, Math.min(5, signs.length)));
    setGameState('loading');
  }, [signs]);

  useEffect(() => {
    setShowHint(false);
  }, [currentQuestionIndex]);

  useEffect(() => {
    fetch(svgPath)
      .then(res => res.text())
      .then(raw => {
        let svg = raw;
        if (imagePath) {
          svg = svg.replace(/href="[^"]*\.(png|jpg|jpeg)"/gi, `href="${imagePath}"`);
        }
        if (!/viewBox=/.test(svg)) {
          svg = svg.replace(/<svg([^>]*)>/, '<svg$1 viewBox="0 0 1536 1024">');
        }
        svg = svg.replace(/<svg([^>]*)>/, match =>
          match
            .replace(/\s*width="[^"]*"/gi, '')
            .replace(/\s*height="[^"]*"/gi, '')
            .replace(
              '<svg',
              '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;"'
            )
        );
        svg = svg.replace(/<g /g, '<g style="pointer-events:all;cursor:pointer;" ');
        svg = svg.replace(/<(path|circle|rect|polygon|ellipse) /g, '<$1 style="pointer-events:all;cursor:pointer;" ');
        setSvgContent(svg);
        setTimeout(() => setGameState('playing'), 100);
      })
      .catch(err => console.error(err));
  }, [svgPath, imagePath]);

  useEffect(() => {
    if (!svgContent || gameState !== 'playing' || !svgContainerRef.current) return;
    const container = svgContainerRef.current;
    const handleClick = e => {
      if (feedback) return;
      const current = questions[currentQuestionIndex];
      let el = e.target;
      let correct = false;
      while (el && el !== container) {
        if (el.id?.toLowerCase() === current.id.toLowerCase()) { correct = true; break; }
        el = el.parentElement;
      }
      setFeedback(correct ? '✅ Correct!' : '❌ Wrong!');
      if (correct) setScore(s => s + 1);
      setTimeout(() => {
        setFeedback(null);
        if (currentQuestionIndex + 1 >= questions.length) setGameState('result');
        else setCurrentQuestionIndex(i => i + 1);
      }, 1000);
    };
    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [svgContent, gameState, currentQuestionIndex, questions, feedback]);

  const handleRestart = () => {
    const shuffled = [...signs].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, Math.min(5, signs.length)));
    setCurrentQuestionIndex(0);
    setScore(0);
    setFeedback(null);
    setShowHint(false);
    setGameState('playing');
  };

  const handleExit = () => {
    onExit(Math.round((score / questions.length) * 100));
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={`h-full bg-gradient-to-br ${category.colorScheme.gradient} flex flex-col overflow-hidden`}>

      {/* Instructions overlay */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-24 sm:pt-28 px-4"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-white/95 backdrop-blur-md shadow-2xl p-4 sm:p-5 rounded-2xl max-w-md w-full border border-white/60"
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
            <p className="mb-2 text-gray-600">
              Watch the sign language video and find the matching item in the image!
            </p>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5 list-disc list-inside">
              <li>Watch the video on the right to see the sign</li>
              <li>Click the matching item in the image to the left</li>
              <li>Use the 💡 Hint button to reveal the word if you're stuck</li>
              <li>5 questions per game — try to get them all right!</li>
            </ul>
          </div>
        </div>
      )}

      {gameState === 'loading' && (
        <div className="flex items-center justify-center h-full text-white text-2xl font-bold">
          Loading...
        </div>
      )}

      {gameState === 'playing' && currentQuestion && (
        <>
          {/* HEADER */}
          <div className="flex-shrink-0 bg-white/90 backdrop-blur shadow-lg px-3 py-2">
            {/* Title row with ? button */}
            <div className="flex items-center justify-center gap-2">
              <h2
                className="text-base sm:text-lg font-bold leading-tight"
                style={{ color: category.colorScheme.primary }}
              >
                Find the correct fruit
              </h2>
              <button
                onClick={() => setShowInstructions(true)}
                className="p-1.5 rounded-full hover:bg-white/50 transition-all duration-200"
                style={{ color: category.colorScheme.primary }}
              >
                <HelpCircle size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Stats + hint row */}
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                Q {currentQuestionIndex + 1}/{questions.length}
              </span>

              <div className="flex-1 flex justify-center">
                {!showHint ? (
                  <button
                    onClick={() => setShowHint(true)}
                    className="px-3 py-1 text-xs sm:text-sm bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg shadow"
                  >
                    💡 Hint
                  </button>
                ) : (
                  <span className="text-sm sm:text-base font-bold text-gray-800 truncate max-w-[180px] sm:max-w-xs">
                    🍎 {currentQuestion.name}
                  </span>
                )}
              </div>

              <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                Score: {score}/{questions.length}
              </span>
            </div>
          </div>

          {/* BODY */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

            {/* SVG image */}
            <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center p-2 sm:p-3">
              <div
                ref={svgContainerRef}
                className="w-full h-full"
                style={{ maxHeight: '100%' }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>

            {/* Video panel */}
            <div className="
              flex-shrink-0
              h-28 sm:h-36
              lg:h-auto lg:w-48 xl:w-64
              bg-black/20
              flex items-center justify-center
              p-2
            ">
              <div className={`w-full h-full rounded-xl overflow-hidden shadow-xl bg-${category.colorScheme.primary}`}>
                <video
                  key={currentQuestion.videoUrl}
                  src={currentQuestion.videoUrl
                    ? (assets?.videos?.[currentQuestion.videoUrl] ?? currentQuestion.videoUrl)
                    : null}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Feedback overlay */}
          {feedback && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className={`text-3xl sm:text-4xl font-bold px-8 py-5 rounded-2xl text-white shadow-2xl ${
                feedback.includes('✅') ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {feedback}
              </div>
            </div>
          )}
        </>
      )}

      {gameState === 'result' && (
        <div className="flex items-center justify-center h-full p-4">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-8 shadow-2xl text-center max-w-md w-full">
            <h2 className="text-4xl font-bold mb-4" style={{ color: category.colorScheme.primary }}>
              🎉 Game Complete!
            </h2>
            <p className="text-3xl font-bold mb-4">Score: {score} / {questions.length}</p>
            <p className="text-xl text-gray-600 mb-6">
              {Math.round((score / questions.length) * 100)}% Correct
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="px-6 py-3 font-bold text-white rounded-xl shadow-lg"
                style={{ backgroundColor: category.colorScheme.primary }}
              >
                🔄 Play Again
              </button>
              <button
                onClick={handleExit}
                className="px-6 py-3 font-bold bg-gray-600 text-white rounded-xl shadow-lg"
              >
                ← Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindInImageGame;