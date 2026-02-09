// src/games/FindInImageGame.jsx
import React, { useState, useEffect, useRef } from 'react';

const FindInImageGame = ({ data, pack, category, assets, onExit }) => {
  const signs = data?.signs || [];

  const [svgContent, setSvgContent] = useState('');
  const [gameState, setGameState] = useState('loading'); // loading | playing | result
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const svgContainerRef = useRef(null);

  const svgPath = category?.gameAssets?.findInImage?.svgPath;
  const imagePath = category?.gameAssets?.findInImage?.imagePath;

  if (!signs.length) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <p className="text-red-600 text-xl">No data available</p>
      </div>
    );
  }

  if (!svgPath) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-4">
          <p className="text-red-600 text-xl mb-4">
            This category does not support the Find In Image game
          </p>
          <button
            onClick={() => onExit(0)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // Init questions
  useEffect(() => {
    const shuffled = [...signs].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, Math.min(5, signs.length)));
    setGameState('loading');
  }, [signs]);

  // Reset hint per question
  useEffect(() => {
    setShowHint(false);
  }, [currentQuestionIndex]);

  // Load SVG
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

  // SVG click logic
  useEffect(() => {
    if (!svgContent || gameState !== 'playing' || !svgContainerRef.current) return;

    const container = svgContainerRef.current;

    const handleClick = e => {
      if (feedback) return;

      const current = questions[currentQuestionIndex];
      let el = e.target;
      let correct = false;

      while (el && el !== container) {
        if (el.id?.toLowerCase() === current.id.toLowerCase()) {
          correct = true;
          break;
        }
        el = el.parentElement;
      }

      setFeedback(correct ? '✅ Correct!' : '❌ Wrong!');
      if (correct) setScore(s => s + 1);

      setTimeout(() => {
        setFeedback(null);
        if (currentQuestionIndex + 1 >= questions.length) {
          setGameState('result');
        } else {
          setCurrentQuestionIndex(i => i + 1);
        }
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
    const percentage = Math.round((score / questions.length) * 100);
    onExit(percentage);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={`h-screen w-screen bg-gradient-to-br ${category.colorScheme.gradient} flex flex-col`}>

      {gameState === 'loading' && (
        <div className="flex items-center justify-center h-full text-white text-2xl font-bold">
          Loading...
        </div>
      )}

      {gameState === 'playing' && currentQuestion && (
        <>
          {/* HEADER */}
          <div className="bg-white/90 backdrop-blur px-4 py-4 shadow-lg text-center space-y-2">
            <h2
              className="text-xl sm:text-2xl font-bold"
              style={{ color: category.colorScheme.primary }}
            >
              Find the correct fruit
            </h2>

            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="mx-auto px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg shadow"
              >
                💡 Show Hint
              </button>
            ) : (
              <div className="text-lg sm:text-xl font-bold text-gray-800">
                🍎 {currentQuestion.name}
              </div>
            )}

            <div className="flex justify-between text-sm sm:text-base font-semibold text-gray-700 mt-2">
              <span>Question {currentQuestionIndex + 1} / {questions.length}</span>
              <span>Score: {score} / {questions.length}</span>
            </div>
          </div>

          {/* MAIN */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-4">
              <div
                ref={svgContainerRef}
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>

            <div className="w-full lg:w-96 p-4 bg-black/10 flex items-center justify-center">
              <div className="w-full h-full max-w-md max-h-96 bg-white/90 backdrop-blur rounded-xl shadow-xl p-4">
                <video
                  src={currentQuestion.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full rounded-lg object-contain bg-black"
                />
              </div>
            </div>
          </div>

          {feedback && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className={`text-4xl font-bold px-10 py-6 rounded-2xl text-white shadow-2xl ${
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
            <p className="text-3xl font-bold mb-4">
              Score: {score} / {questions.length}
            </p>
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
