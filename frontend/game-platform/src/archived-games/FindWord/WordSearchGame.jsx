import React, { useEffect, useState } from "react";
import "./WordSearchGame.css";

const GRID_SIZE = 10;  // Smaller grid
const WORD_COUNT = 5;  // Fewer words to find

const getEnabledLabels = (labels) => labels.filter((item) => item.enabled);
const getRandomWords = (list, count) =>
  [...list].sort(() => 0.5 - Math.random()).slice(0, count);

const directions = [
  [0, 1], // right
  [1, 0], // down
  [1, 1], // diagonal right down
  [-1, 1], // diagonal right up
];

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
          if (grid[row][col] && grid[row][col] !== word[i]) {
            fits = false;
            break;
          }
        }
        if (fits) {
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

export default function WordSearchGame() {
  const [gridData, setGridData] = useState({ grid: [], words: [] });
  const [mouseDown, setMouseDown] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [solvedCells, setSolvedCells] = useState([]);

  useEffect(() => {
    fetch("/labels.json")
      .then((res) => res.json())
      .then((data) => {
        const enabled = getEnabledLabels(data);
        const selectedWords = getRandomWords(enabled, WORD_COUNT);
        const result = placeWordsInGrid(selectedWords, GRID_SIZE);
        setGridData(result);
      });
  }, []);

  const isSolved = (r, c) =>
    solvedCells.some((cell) => cell.r === r && cell.c === c);

  const isSelected = (r, c) =>
    selectedCells.some((cell) => cell.r === r && cell.c === c);

  const handleMouseDown = (r, c) => {
    setMouseDown(true);
    setSelectedCells([{ r, c }]);
  };

  const handleMouseEnter = (r, c) => {
    if (mouseDown) {
      const alreadySelected = selectedCells.find(
        (cell) => cell.r === r && cell.c === c
      );
      if (!alreadySelected) {
        setSelectedCells([...selectedCells, { r, c }]);
      }
    }
  };

  const handleMouseUp = () => {
    setMouseDown(false);

    const word = selectedCells
      .map((cell) => gridData.grid[cell.r][cell.c])
      .join("");

    const reversed = word.split("").reverse().join("");
    const matched = gridData.words.find(
      (w) => w.word === word || w.word === reversed
    );

    if (matched) {
      setSolvedCells([...solvedCells, ...selectedCells]);
    }

    setSelectedCells([]);
  };

  return (
    <div
      className="word-search-container"
      onMouseLeave={() => {
        setMouseDown(false);
        setSelectedCells([]);
      }}
    >
      <div className="videos-panel">
        {gridData.words.map((word, idx) => (
          <div className="video-clue" key={idx}>
            <video
              src={word.sample_video}
              width="100%"
              muted
              loop
              autoPlay
              playsInline
              onLoadedMetadata={(e) => (e.target.currentTime = 0)}
            />
            <p>{word.name}</p>
          </div>
        ))}
      </div>
      <div className="grid-panel">
        <table className="grid-table">
          <tbody>
            {gridData.grid.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((letter, cIdx) => {
                  const cellSolved = isSolved(rIdx, cIdx);
                  const cellSelected = isSelected(rIdx, cIdx);
                  return (
                    <td
                      key={cIdx}
                      className={
                        cellSolved
                          ? "solved-cell"
                          : cellSelected
                          ? "selected-cell"
                          : ""
                      }
                      onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                      onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                      onMouseUp={handleMouseUp}
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
  );
}
