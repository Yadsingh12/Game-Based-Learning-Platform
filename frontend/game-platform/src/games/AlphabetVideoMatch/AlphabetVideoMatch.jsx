import React, { useState, useEffect } from "react";
import "./AlphabetVideoMatch.css";

const difficulties = {
  easy: 4,
  medium: 6,
  hard: 8,
};

const AlphabetVideoMatch = () => {
  const [alphabets, setAlphabets] = useState([]);
  const [letters, setLetters] = useState([]);
  const [videos, setVideos] = useState([]);
  const [matched, setMatched] = useState([]);
  const [difficulty, setDifficulty] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [gameState, setGameState] = useState("start"); // "start", "playing", "end"

  useEffect(() => {
    if (difficulty && gameState === "playing") {
      const alphabetArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch) => ({
        name: ch,
        video: `/videos/Alphabets/${ch}.mp4`,
      }));

      const selected = shuffleArray(alphabetArray).slice(0, difficulties[difficulty]);

      setAlphabets(selected);
      setLetters(shuffleArray(selected));
      setVideos(shuffleArray(selected));
      setMatched([]);
      setStartTime(Date.now());
      setEndTime(null);
    }
  }, [difficulty, gameState]);

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const handleDrop = (e, targetName) => {
    const draggedName = e.dataTransfer.getData("name");
    if (draggedName === targetName && !matched.includes(draggedName)) {
      const newMatched = [...matched, draggedName];
      setMatched(newMatched);
      if (newMatched.length === alphabets.length) {
        setEndTime(Date.now());
        setGameState("end");
      }
    }
  };

  const handleDragStart = (e, name) => {
    e.dataTransfer.setData("name", name);
  };

  const formatTime = (ms) => `${Math.floor(ms / 1000)}s`;

  const startGame = (level) => {
    setDifficulty(level);
    setGameState("playing");
  };

  const DifficultyButtons = () => (
    <div className="difficulty-buttons">
      {Object.keys(difficulties).map((level) => (
        <button key={level} onClick={() => startGame(level)}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </button>
      ))}
    </div>
  );

  if (gameState === "start") {
    return (
      <div className="alphabet-match start-screen">
        <h1>🔠 Alphabet Match</h1>
        <p>Select a difficulty to start the game:</p>
        <DifficultyButtons />
        <div className="instructions">
          <h3>How to Play:</h3>
          <ul>
            <li>Drag the alphabet onto the correct video.</li>
            <li>Match all pairs as fast as you can.</li>
            <li>The game ends when all pairs are correctly matched.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (gameState === "end") {
    return (
      <div className="alphabet-match end-screen">
        <h1>🎉 Game Over!</h1>
        <p>Difficulty: {difficulty}</p>
        <p>Time taken: {formatTime(endTime - startTime)}</p>
        <p>Want to play again? Choose a difficulty:</p>
        <DifficultyButtons />
      </div>
    );
  }

  return (
    <div className="alphabet-match">
      <h2>Match Alphabets with Videos</h2>
      <p className="difficulty-label">Difficulty: {difficulty}</p>
      <div className="game-area">
        <div className="sections">
          {/* Left side - Letters */}
          <div className="section">
            <h2>Alphabets</h2>
            <div className="grid-container">
              {letters.map((item) => (
                <div
                  key={item.name}
                  draggable={!matched.includes(item.name)}
                  onDragStart={(e) => handleDragStart(e, item.name)}
                  className={`grid-item letter ${
                    matched.includes(item.name) ? "matched" : ""
                  }`}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Videos */}
          <div className="section">
            <h2>Videos</h2>
            <div className="grid-container">
              {videos.map((item) => (
                <div
                  key={item.name}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, item.name)}
                  className={`grid-item drop-target ${
                    matched.includes(item.name) ? "matched" : ""
                  }`}
                >
                  <video
                    src={item.video}
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlphabetVideoMatch;
