// src/games/WordSearchGame.jsx
// Dark cosmic restyled version

import React, { useEffect, useState } from "react";
import { HelpCircle, Trophy, Eye, Timer } from "lucide-react";

const GRID_SIZE = 10;
const WORD_COUNT = 5;
const TIME_LIMIT = 90;

const directions = [[0, 1], [1, 0]];

const placeWordsInGrid = (words, size) => {
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const placed = [];
  for (let wordObj of words) {
    let placedWord = false;
    const word = wordObj.name.replace(/\s/g, "").toUpperCase();
    for (let tries = 0; tries < 100 && !placedWord; tries++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * size);
      const startCol = Math.floor(Math.random() * size);
      const endRow = startRow + dir[0] * (word.length - 1);
      const endCol = startCol + dir[1] * (word.length - 1);
      if (endRow >= 0 && endRow < size && endCol >= 0 && endCol < size) {
        let fits = true;
        for (let i = 0; i < word.length; i++) {
          const row = startRow + dir[0] * i;
          const col = startCol + dir[1] * i;
          if (grid[row][col] && grid[row][col] !== word[i]) { fits = false; break; }
        }
        if (fits) {
          for (let i = 0; i < word.length; i++) {
            grid[startRow + dir[0] * i][startCol + dir[1] * i] = word[i];
          }
          placed.push({ ...wordObj, word, startRow, startCol, dir });
          placedWord = true;
        }
      }
    }
  }
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let row = 0; row < size; row++)
    for (let col = 0; col < size; col++)
      if (!grid[row][col]) grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
  return { grid, words: placed };
};

const getRandomWords = (list, count) => {
  const validWords = list.filter(item => item.name && item.name.length >= 3 && item.name.length <= 10);
  return [...validWords].sort(() => 0.5 - Math.random()).slice(0, Math.min(count, validWords.length));
};

export default function WordSearchGame(props) {
  const signs = props.data?.signs || props.signs || props.data || [];
  const onComplete = props.onComplete || props.onExit;

  const [gridData, setGridData] = useState({ grid: [], words: [] });
  const [mouseDown, setMouseDown] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [solvedCells, setSolvedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [revealedHints, setRevealedHints] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  useEffect(() => {
    if (signs.length > 0) {
      const selectedWords = getRandomWords(signs, WORD_COUNT);
      setGridData(placeWordsInGrid(selectedWords, GRID_SIZE));
    }
  }, [signs.length]);

  useEffect(() => {
    if (timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameComplete) {
      setGameComplete(true);
    }
  }, [timeLeft, gameComplete]);

  useEffect(() => {
    if (gridData.words.length > 0 && foundWords.length === gridData.words.length) setGameComplete(true);
  }, [foundWords.length, gridData.words.length]);

  const isSolved = (r, c) => solvedCells.some(cell => cell.r === r && cell.c === c);
  const isSelected = (r, c) => selectedCells.some(cell => cell.r === r && cell.c === c);

  const handleMouseDown = (r, c) => {
    if (gameComplete) return;
    setMouseDown(true);
    setSelectedCells([{ r, c }]);
  };
  const handleMouseEnter = (r, c) => {
    if (mouseDown && !gameComplete && !selectedCells.find(cell => cell.r === r && cell.c === c))
      setSelectedCells([...selectedCells, { r, c }]);
  };
  const handleMouseUp = () => {
    if (gameComplete) return;
    setMouseDown(false);
    const word = selectedCells.map(cell => gridData.grid[cell.r][cell.c]).join("");
    const reversed = word.split("").reverse().join("");
    const matched = gridData.words.find(w => w.word === word || w.word === reversed);
    if (matched && !foundWords.includes(matched.word)) {
      setSolvedCells([...solvedCells, ...selectedCells]);
      setFoundWords([...foundWords, matched.word]);
    }
    setSelectedCells([]);
  };
  const handleTouchStart = (r, c) => { if (gameComplete) return; setMouseDown(true); setSelectedCells([{ r, c }]); };
  const handleTouchMove = (e) => {
    if (gameComplete) return;
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element?.dataset.row !== undefined && element?.dataset.col !== undefined) {
      const r = parseInt(element.dataset.row), c = parseInt(element.dataset.col);
      if (!selectedCells.find(cell => cell.r === r && cell.c === c))
        setSelectedCells([...selectedCells, { r, c }]);
    }
  };
  const handleTouchEnd = () => handleMouseUp();
  const handleRevealHint = (wordObj) => { if (!revealedHints.includes(wordObj.word)) setRevealedHints([...revealedHints, wordObj.word]); };

  const handleRestart = () => {
    const selectedWords = getRandomWords(signs, WORD_COUNT);
    setGridData(placeWordsInGrid(selectedWords, GRID_SIZE));
    setSelectedCells([]); setSolvedCells([]); setFoundWords([]);
    setRevealedHints([]); setGameComplete(false); setTimeLeft(TIME_LIMIT);
  };
  const handleExit = () => onComplete?.(Math.round((foundWords.length / gridData.words.length) * 100));

  const timerUrgent = timeLeft <= 10;

  if (!signs || signs.length === 0) return (
    <div className="h-full flex items-center justify-center bg-[#0f0a1e]">
      <p className="text-white/50">No word data available for this game.</p>
    </div>
  );
  if (gridData.words.length === 0) return (
    <div className="h-full flex items-center justify-center bg-[#0f0a1e]">
      <p className="text-white/40">Loading puzzle...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0f0a1e] overflow-hidden relative">

      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px]
                      bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px]
                      bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 w-full px-4 pt-4 pb-3 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-white">Word Search</h1>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
            >
              <HelpCircle size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/40 font-semibold">
              <Trophy size={13} className="text-violet-400" />
              <span className="text-white font-black">{foundWords.length}</span>/{gridData.words.length}
            </span>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold border transition-all
                              ${timerUrgent ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-white/40'}`}>
              <Timer size={13} className={timerUrgent ? 'text-red-400' : 'text-violet-400'} />
              <span className={`font-black ${timerUrgent ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</span>
            </span>
          </div>
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
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <p className="font-black text-white text-base">How to Play Word Search</p>
              <button onClick={() => setShowInstructions(false)} className="text-white/40 hover:text-white font-black text-xl p-1">×</button>
            </div>
            <ul className="text-sm text-white/50 space-y-2 list-disc list-inside">
              <li>Click and drag across letters to select them</li>
              <li>Words are hidden left-to-right or top-to-bottom</li>
              <li>Watch the video clues to see the sign language</li>
              <li>Click the eye icon to reveal a word hint</li>
              <li>You have {TIME_LIMIT} seconds to find all words!</li>
            </ul>
          </div>
        </div>
      )}

      {/* Game complete overlay */}
      {gameComplete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center px-4">
          <div className="bg-[#1a1035] border border-white/15 rounded-3xl p-6 sm:p-8
                          shadow-2xl max-w-md w-full text-center">
            <div className="text-6xl mb-4">
              {foundWords.length === gridData.words.length ? "🎉" : "⏰"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-white">
              {foundWords.length === gridData.words.length ? "Puzzle Complete!" : "Time's Up!"}
            </h2>
            <p className="text-lg mb-2 text-white/60">
              You found <span className="font-black text-white">{foundWords.length}</span> of {gridData.words.length} words
            </p>
            <p className="text-base mb-6 font-bold text-violet-400">
              Score: {Math.round((foundWords.length / gridData.words.length) * 100)}%
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <DarkButton onClick={handleRestart}>🎮 Play Again</DarkButton>
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
            </div>
          </div>
        </div>
      )}

      {/* Main game area */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-3 px-3 sm:px-4 pb-3 pt-3 overflow-hidden max-w-7xl mx-auto w-full">

        {/* Grid panel */}
        <div className="flex-[3] flex justify-center items-center min-h-0">
          <div
            className="w-full h-full max-w-2xl flex items-center justify-center"
            onMouseLeave={() => { setMouseDown(false); setSelectedCells([]); }}
            onTouchEnd={handleTouchEnd}
          >
            <table
              className="w-full h-full border-collapse select-none rounded-2xl overflow-hidden"
              style={{ maxHeight: "100%", aspectRatio: "1/1" }}
            >
              <tbody>
                {gridData.grid.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((letter, cIdx) => {
                      const cellSolved = isSolved(rIdx, cIdx);
                      const cellSelected = isSelected(rIdx, cIdx);
                      return (
                        <td
                          key={cIdx}
                          data-row={rIdx}
                          data-col={cIdx}
                          className="text-center border font-black cursor-pointer transition-all duration-150
                                     text-[2.5vw] sm:text-[1.8vw] lg:text-[1.2vw] xl:text-[1vw]"
                          style={{
                            borderColor: 'rgba(255,255,255,0.06)',
                            backgroundColor: cellSolved
                              ? 'rgba(124,58,237,0.35)'
                              : cellSelected
                              ? 'rgba(124,58,237,0.5)'
                              : 'rgba(255,255,255,0.03)',
                            color: cellSolved
                              ? '#c4b5fd'
                              : cellSelected
                              ? '#fff'
                              : 'rgba(255,255,255,0.5)',
                          }}
                          onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                          onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                          onMouseUp={handleMouseUp}
                          onTouchStart={() => handleTouchStart(rIdx, cIdx)}
                          onTouchMove={handleTouchMove}
                        >
                          {letter}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Videos / words panel */}
        <div className="flex-[2] flex flex-col gap-2 overflow-y-auto border-t-2 lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-3">
          {gridData.words.map((word, idx) => {
            const isFound = foundWords.includes(word.word);
            const isHintRevealed = revealedHints.includes(word.word);
            return (
              <div
                key={idx}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300
                            ${isFound ? 'bg-violet-600/15 border-violet-500/30' : 'bg-white/5 border-white/10'}`}
              >
                {word.videoUrl && (
                  <div className="w-full rounded-xl overflow-hidden ring-1 ring-white/10">
                    <video
                      src={word.videoUrl ? (props.assets?.videos?.[word.videoUrl] ?? word.videoUrl) : null}
                      muted loop autoPlay playsInline
                      className="w-full h-auto"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    {isHintRevealed || isFound ? (
                      <p className={`text-sm font-black ${isFound ? 'line-through text-violet-400' : 'text-white'}`}>
                        {word.name}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-white/30">
                        ??? ({word.word.length} letters)
                      </p>
                    )}
                    {isFound && <span className="text-violet-400 text-base">✓</span>}
                  </div>
                  {!isFound && !isHintRevealed && (
                    <button
                      onClick={() => handleRevealHint(word)}
                      className="p-1.5 rounded-lg bg-white/10 text-white/40 hover:bg-white/20 hover:text-white/70
                                 transition-all hover:scale-110"
                      title="Reveal word hint"
                    >
                      <Eye size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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