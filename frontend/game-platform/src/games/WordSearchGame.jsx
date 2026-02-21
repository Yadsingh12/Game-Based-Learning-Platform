// src/games/WordSearchGame.jsx
// Word search puzzle game with drag-to-select functionality

import React, { useEffect, useState } from "react";
import { HelpCircle, Trophy, Home, Eye, Timer } from "lucide-react";

const GRID_SIZE = 10;
const WORD_COUNT = 5;
const TIME_LIMIT = 90; // 90 seconds

const directions = [
  [0, 1], // right (horizontal)
  [1, 0], // down (vertical)
];

const placeWordsInGrid = (words, size) => {
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const placed = [];

  for (let wordObj of words) {
    let placedWord = false;
    const word = wordObj.name.replace(/\s/g, "").toUpperCase();

    // Try to place each word up to 100 times
    for (let tries = 0; tries < 100 && !placedWord; tries++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * size);
      const startCol = Math.floor(Math.random() * size);
      const endRow = startRow + dir[0] * (word.length - 1);
      const endCol = startCol + dir[1] * (word.length - 1);

      // Check if word fits in grid
      if (endRow >= 0 && endRow < size && endCol >= 0 && endCol < size) {
        let fits = true;

        // Check if all cells are empty or contain the same letter
        for (let i = 0; i < word.length; i++) {
          const row = startRow + dir[0] * i;
          const col = startCol + dir[1] * i;
          if (grid[row][col] && grid[row][col] !== word[i]) {
            fits = false;
            break;
          }
        }

        if (fits) {
          // Place the word in the grid
          for (let i = 0; i < word.length; i++) {
            const row = startRow + dir[0] * i;
            const col = startCol + dir[1] * i;
            grid[row][col] = word[i];
          }
          placed.push({ ...wordObj, word, startRow, startCol, dir });
          placedWord = true;
        }
      }
    }
  }

  // Fill empty cells with random letters
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!grid[row][col]) {
        grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid, words: placed };
};

const getRandomWords = (list, count) => {
  const validWords = list.filter(
    (item) => item.name && item.name.length >= 3 && item.name.length <= 10,
  );
  return [...validWords]
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(count, validWords.length));
};

export default function WordSearchGame(props) {
  // Extract data from props
  const signs = props.data?.signs || props.signs || props.data || [];
  const onComplete = props.onComplete || props.onExit;
  const category = props.category || {};

  // Extract color scheme from category or use defaults
  const colors = category.colorScheme || {
    primary: "#7c3aed",
    secondary: "#3b82f6",
    light: "#c4b5fd",
    dark: "#5b21b6",
    gradient: "from-purple-600 to-blue-600",
  };

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
      const result = placeWordsInGrid(selectedWords, GRID_SIZE);
      setGridData(result);
    }
  }, [signs.length]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameComplete) {
      handleTimeUp();
    }
  }, [timeLeft, gameComplete]);

  useEffect(() => {
    if (
      gridData.words.length > 0 &&
      foundWords.length === gridData.words.length
    ) {
      setGameComplete(true);
    }
  }, [foundWords.length, gridData.words.length]);

  const handleTimeUp = () => {
    setGameComplete(true);
  };

  const isSolved = (r, c) =>
    solvedCells.some((cell) => cell.r === r && cell.c === c);

  const isSelected = (r, c) =>
    selectedCells.some((cell) => cell.r === r && cell.c === c);

  const handleMouseDown = (r, c) => {
    if (gameComplete) return;
    setMouseDown(true);
    setSelectedCells([{ r, c }]);
  };

  const handleMouseEnter = (r, c) => {
    if (mouseDown && !gameComplete) {
      const alreadySelected = selectedCells.find(
        (cell) => cell.r === r && cell.c === c,
      );
      if (!alreadySelected) {
        setSelectedCells([...selectedCells, { r, c }]);
      }
    }
  };

  const handleMouseUp = () => {
    if (gameComplete) return;
    setMouseDown(false);

    const word = selectedCells
      .map((cell) => gridData.grid[cell.r][cell.c])
      .join("");

    const reversed = word.split("").reverse().join("");
    const matched = gridData.words.find(
      (w) => w.word === word || w.word === reversed,
    );

    if (matched && !foundWords.includes(matched.word)) {
      setSolvedCells([...solvedCells, ...selectedCells]);
      setFoundWords([...foundWords, matched.word]);
    }

    setSelectedCells([]);
  };

  const handleTouchStart = (r, c) => {
    if (gameComplete) return;
    setMouseDown(true);
    setSelectedCells([{ r, c }]);
  };

  const handleTouchMove = (e) => {
    if (gameComplete) return;
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (
      element &&
      element.dataset.row !== undefined &&
      element.dataset.col !== undefined
    ) {
      const r = parseInt(element.dataset.row);
      const c = parseInt(element.dataset.col);
      const alreadySelected = selectedCells.find(
        (cell) => cell.r === r && cell.c === c,
      );
      if (!alreadySelected) {
        setSelectedCells([...selectedCells, { r, c }]);
      }
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const handleRevealHint = (wordObj) => {
    if (!revealedHints.includes(wordObj.word)) {
      setRevealedHints([...revealedHints, wordObj.word]);
    }
  };

  const handleRestart = () => {
    const selectedWords = getRandomWords(signs, WORD_COUNT);
    const result = placeWordsInGrid(selectedWords, GRID_SIZE);
    setGridData(result);
    setSelectedCells([]);
    setSolvedCells([]);
    setFoundWords([]);
    setRevealedHints([]);
    setGameComplete(false);
    setTimeLeft(TIME_LIMIT);
  };

  const handleExit = () => {
    if (onComplete) {
      const percentage = Math.round(
        (foundWords.length / gridData.words.length) * 100,
      );
      onComplete(percentage);
    }
  };

  if (!signs || signs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <p className="text-red-600 text-lg font-semibold">
          No word data available for this game.
        </p>
      </div>
    );
  }

  if (gridData.words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <p className="text-gray-600 text-lg">Loading puzzle...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 w-full px-4 sm:px-6 pt-4 pb-3">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1
            className={`text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent font-sans drop-shadow-sm`}
          >
            Word Search
          </h1>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="p-2 rounded-full hover:bg-white/50 transition-all duration-200 backdrop-blur-sm"
              style={{ color: colors.primary }}
            >
              <HelpCircle size={22} strokeWidth={2.5} />
            </button>

            {onComplete && (
              <button
                onClick={handleExit}
                className="p-2 rounded-full hover:bg-white/50 transition-all duration-200 backdrop-blur-sm"
                style={{ color: colors.primary }}
              >
                <Home size={22} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Progress and Timer */}
        <div className="text-center mt-3 flex justify-center items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm shadow-sm border border-white/40">
            <Trophy size={18} style={{ color: colors.primary }} />
            <span
              className="text-sm sm:text-base font-bold"
              style={{ color: colors.dark }}
            >
              Found:{" "}
              <span className="text-lg font-extrabold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                {foundWords.length}
              </span>{" "}
              / {gridData.words.length}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm shadow-sm border border-white/40">
            <Timer
              size={18}
              style={{ color: timeLeft <= 10 ? "#ef4444" : colors.primary }}
            />
            <span
              className={`text-sm sm:text-base font-bold ${timeLeft <= 10 ? "text-red-500 animate-pulse" : ""}`}
              style={{ color: timeLeft > 10 ? colors.dark : undefined }}
            >
              Time: <span className="text-lg font-extrabold">{timeLeft}s</span>
            </span>
          </div>
        </div>
      </div>

      {/* Instructions overlay */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-24 sm:pt-28 px-4 animate-in fade-in duration-200"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="text-sm bg-white/95 backdrop-blur-md shadow-2xl p-5 rounded-2xl max-w-md w-full border border-white/60 animate-in slide-in-from-top duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-3">
              <p className="font-semibold text-gray-700 text-base">
                How to Play Word Search
              </p>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-500 hover:text-gray-700 font-bold text-xl leading-none -mt-1 -mr-1 p-1"
              >
                ×
              </button>
            </div>
            <p className="mb-3 text-gray-600 font-medium">
              Find all the hidden words in the grid by selecting letters!
            </p>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>
                <strong>Click and drag</strong> across letters to select them
              </li>
              <li>
                <strong>Words are hidden</strong> left-to-right (horizontal) or
                top-to-bottom (vertical)
              </li>
              <li>
                <strong>Watch the video clues</strong> to see the sign language
                for each word
              </li>
              <li>
                <strong>Click the eye icon</strong> to reveal a word hint (shows
                the word)
              </li>
              <li>
                <strong>Green cells</strong> show correctly found words
              </li>
              <li>
                <strong>You have {TIME_LIMIT} seconds</strong> to find all
                words!
              </li>
              <li>
                <strong>Goal:</strong> Find all {gridData.words.length} words
                before time runs out!
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">
                💡 Tip: Start with shorter words and use the video hints!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Game complete overlay */}
      {gameComplete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center px-4">
          <div
            className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border-2 max-w-md w-full text-center animate-in zoom-in duration-300"
            style={{ borderColor: colors.primary }}
          >
            <div className="text-6xl mb-4">
              {foundWords.length === gridData.words.length ? "🎉" : "⏰"}
            </div>
            <h2
              className="text-2xl sm:text-3xl font-black mb-2 bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
              }}
            >
              {foundWords.length === gridData.words.length
                ? "Puzzle Complete!"
                : "Time's Up!"}
            </h2>
            <p className="text-lg mb-6 text-gray-700">
              You found{" "}
              <span className="font-bold text-xl bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                {foundWords.length}
              </span>{" "}
              out of {gridData.words.length} words!
            </p>
            <p
              className="text-base mb-6 font-semibold"
              style={{ color: colors.primary }}
            >
              Score:{" "}
              {Math.round((foundWords.length / gridData.words.length) * 100)}%
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={handleRestart}
                className="group relative px-6 sm:px-8 py-3 text-base rounded-2xl text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                }}
              >
                <span className="relative z-10">🎮 Play Again</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
              {onComplete && (
                <button
                  onClick={handleExit}
                  className="group relative px-6 sm:px-8 py-3 text-base rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10">← Exit</span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main game area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Grid panel - 60% on desktop, no scrolling */}
        <div className="flex-[3] flex justify-center items-center min-h-0">
          <div
            className="w-full h-full max-w-2xl flex items-center justify-center"
            onMouseLeave={() => {
              setMouseDown(false);
              setSelectedCells([]);
            }}
            onTouchEnd={handleTouchEnd}
          >
            <table
              className="w-full h-full border-collapse select-none"
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
                          className={`
                            text-center border font-bold cursor-pointer
                            transition-colors duration-200
                            text-[2.5vw] sm:text-[1.8vw] lg:text-[1.2vw] xl:text-[1vw]
                            hover:scale-105 active:scale-95 transition-transform
                          `}
                          style={{
                            borderColor: colors.light,
                            backgroundColor: cellSolved
                              ? "#86efac"
                              : cellSelected
                                ? colors.secondary
                                : "white",
                            color: cellSolved
                              ? "#166534"
                              : cellSelected
                                ? "white"
                                : colors.dark,
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

        {/* Videos panel - 40% on desktop, scrollable */}
        <div
          className="flex-[2] flex flex-col gap-3 sm:gap-4 overflow-y-auto pr-2 border-t-2 lg:border-t-0 lg:border-l-2 pt-3 lg:pt-0 lg:pl-4"
          style={{ borderColor: colors.light }}
        >
          {gridData.words.map((word, idx) => {
            const isFound = foundWords.includes(word.word);
            const isHintRevealed = revealedHints.includes(word.word);
            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 shadow-md"
                style={{
                  backgroundColor: isFound
                    ? "#d1fae5"
                    : "rgba(255, 255, 255, 0.7)",
                  borderColor: isFound ? "#34d399" : colors.light,
                  backdropFilter: "blur(8px)",
                }}
              >
                {word.videoUrl && (
                  <div
                    className="w-full relative rounded-lg overflow-hidden shadow-md border-2"
                    style={{ borderColor: colors.light }}
                  >
                    <video
                      src={word.videoUrl ? (props.assets?.videos?.[word.videoUrl] ?? word.videoUrl) : null}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="w-full h-auto"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    {isHintRevealed || isFound ? (
                      <p
                        className={`text-sm sm:text-base font-bold text-center ${isFound ? "line-through" : ""}`}
                        style={{ color: isFound ? "#059669" : colors.dark }}
                      >
                        {word.name}
                      </p>
                    ) : (
                      <p className="text-sm sm:text-base font-bold text-gray-400">
                        ??? ({word.word.length} letters)
                      </p>
                    )}
                    {isFound && (
                      <span className="text-green-600 text-lg">✓</span>
                    )}
                  </div>
                  {!isFound && !isHintRevealed && (
                    <button
                      onClick={() => handleRevealHint(word)}
                      className="p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{
                        backgroundColor: colors.light,
                        color: colors.dark,
                      }}
                      title="Reveal word hint"
                    >
                      <Eye size={18} />
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
