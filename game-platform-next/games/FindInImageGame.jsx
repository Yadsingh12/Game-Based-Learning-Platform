// src/games/FindInImageGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

const FindInImageGame = ({ data, pack, category, assets, onExit }) => {
  const signs = data?.signs || [];

  const [svgContent, setSvgContent]           = useState('');
  const [gameState, setGameState]             = useState('loading');
  const [questions, setQuestions]             = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore]                     = useState(0);
  const [feedback, setFeedback]               = useState(null);
  const [showHint, setShowHint]               = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const svgContainerRef = useRef(null);
  const svgPath   = category?.gameAssets?.findInImage?.svgPath;
  const imagePath = category?.gameAssets?.findInImage?.imagePath;

  if (!signs.length) return (
    <div className="h-full w-full flex items-center justify-center bg-[#0f0a1e]">
      <p className="text-red-400 text-lg font-semibold">No data available</p>
    </div>
  );

  if (!svgPath) return (
    <div className="h-full w-full flex items-center justify-center bg-[#0f0a1e]">
      <div className="text-center p-6 bg-white/5 border border-white/10 rounded-2xl max-w-sm">
        <p className="text-red-400 text-base font-semibold mb-4">
          This category does not support the Find In Image game
        </p>
        <button onClick={() => onExit(0)}
          className="px-6 py-2.5 bg-white/10 border border-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all">
          ← Go Back
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    const shuffled = [...signs].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, Math.min(5, signs.length)));
    setGameState('loading');
  }, [signs]);

  useEffect(() => { setShowHint(false); }, [currentQuestionIndex]);

  useEffect(() => {
    fetch(svgPath)
      .then(res => res.text())
      .then(raw => {
        let svg = raw;
        if (imagePath) svg = svg.replace(/href="[^"]*\.(png|jpg|jpeg)"/gi, `href="${imagePath}"`);
        if (!/viewBox=/.test(svg)) svg = svg.replace(/<svg([^>]*)>/, '<svg$1 viewBox="0 0 1536 1024">');
        svg = svg.replace(/<svg([^>]*)>/, match =>
          match
            .replace(/\s*width="[^"]*"/gi, '')
            .replace(/\s*height="[^"]*"/gi, '')
            .replace('<svg', '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;"')
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

  const handleExit = () => onExit(Math.round((score / questions.length) * 100));
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="h-full bg-[#0f0a1e] relative flex flex-col overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Instructions overlay */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 sm:pt-28 px-4"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-[#0f0a1e] border border-white/15 shadow-2xl p-5 rounded-2xl max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-3">
              <p className="font-bold text-white text-base">How to Play</p>
              <button onClick={() => setShowInstructions(false)}
                className="text-white/40 hover:text-white font-bold text-xl leading-none p-1">×</button>
            </div>
            <p className="mb-3 text-white/60 text-sm">
              Watch the sign language video and find the matching item in the image!
            </p>
            <ul className="text-xs sm:text-sm text-white/50 space-y-1.5 list-disc list-inside">
              <li>Watch the video on the right to see the sign</li>
              <li>Click the matching item in the image to the left</li>
              <li>Use the 💡 Hint button if you're stuck</li>
              <li>5 questions per game — try to get them all right!</li>
            </ul>
          </div>
        </div>
      )}

      {gameState === 'loading' && (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-3 text-white/50">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold">Loading...</span>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentQuestion && (
        <>
          {/* Header */}
          <div className="relative z-10 flex-shrink-0 bg-white/5 border-b border-white/10 backdrop-blur-sm px-3 py-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                Find the correct sign
              </h2>
              <button onClick={() => setShowInstructions(true)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-all text-violet-400">
                <HelpCircle size={16} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 mt-1.5">
              <span className="text-xs font-bold text-white/50 whitespace-nowrap">
                Q {currentQuestionIndex + 1}/{questions.length}
              </span>

              <div className="flex-1 flex justify-center">
                {!showHint ? (
                  <button onClick={() => setShowHint(true)}
                    className="px-3 py-1 text-xs bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-lg transition-all">
                    💡 Hint
                  </button>
                ) : (
                  <span className="text-sm font-bold text-violet-300 truncate max-w-[180px] sm:max-w-xs">
                    🍎 {currentQuestion.name}
                  </span>
                )}
              </div>

              <span className="text-xs font-bold text-white/50 whitespace-nowrap">
                Score: <span className="text-violet-300">{score}/{questions.length}</span>
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
            {/* SVG image */}
            <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center p-2 sm:p-3">
              <div
                ref={svgContainerRef}
                className="w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-black/20"
                style={{ maxHeight: '100%' }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>

            {/* Video panel */}
            <div className="flex-shrink-0 h-28 sm:h-36 lg:h-auto lg:w-48 xl:w-64
              flex items-center justify-center p-2 bg-black/20 border-t border-white/10 lg:border-t-0 lg:border-l lg:border-white/10">
              <div className="w-full h-full rounded-xl overflow-hidden border border-white/10">
                <video
                  key={currentQuestion.videoUrl}
                  src={currentQuestion.videoUrl ? (assets?.videos?.[currentQuestion.videoUrl] ?? currentQuestion.videoUrl) : null}
                  autoPlay loop muted playsInline
                  className="w-full h-full object-contain bg-black/50"
                />
              </div>
            </div>
          </div>

          {/* Feedback overlay */}
          {feedback && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className={`text-2xl sm:text-3xl font-black px-8 py-5 rounded-2xl text-white border ${
                feedback.includes('✅')
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-500/20 border-red-500/40 text-red-300'
              }`} style={{ backdropFilter: 'blur(12px)' }}>
                {feedback}
              </div>
            </div>
          )}
        </>
      )}

      {gameState === 'result' && (
        <div className="relative z-10 flex items-center justify-center h-full p-4">
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md w-full">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-black text-white mb-3">Game Complete!</h2>
            <p className="text-4xl font-black text-violet-300 mb-1">{score} / {questions.length}</p>
            <p className="text-white/40 text-sm mb-6">
              {Math.round((score / questions.length) * 100)}% Correct
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleRestart}
                className="px-6 py-2.5 font-bold text-white rounded-xl transition-all hover:scale-105 active:scale-95 hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${category.colorScheme.primary}, ${category.colorScheme.secondary ?? '#3b82f6'})` }}>
                🔄 Play Again
              </button>
              <button onClick={handleExit}
                className="px-6 py-2.5 font-bold bg-white/10 border border-white/10 text-white/70 rounded-xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
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