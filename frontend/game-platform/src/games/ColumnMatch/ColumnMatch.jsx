import React, { useEffect, useState } from "react";
import "./ColumnMatch.css";

const difficulties = {
  easy: 3,
  medium: 5,
  hard: 10,
};

const ColumnMatch = () => {
  const [items, setItems] = useState([]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [matched, setMatched] = useState([]);
  const [difficulty, setDifficulty] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [gameState, setGameState] = useState("start"); // "start", "playing", "end"

  useEffect(() => {
    if (difficulty && gameState === "playing") {
      const fetchData = async () => {
        const res = await fetch("/labels.json");
        const data = await res.json();
        const filtered = data.filter((item) => item.enabled);
        const selected = shuffleArray(filtered).slice(0, difficulties[difficulty]);

        setItems(selected);
        setImages(shuffleArray([...selected]));
        setVideos(shuffleArray([...selected]));
        setStartTime(Date.now());
        setMatched([]);
        setEndTime(null);
      };
      fetchData();
    }
  }, [difficulty, gameState]);

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const handleDrop = (e, targetName) => {
    const draggedName = e.dataTransfer.getData("name");
    if (draggedName === targetName && !matched.includes(draggedName)) {
      const newMatched = [...matched, draggedName];
      setMatched(newMatched);
      if (newMatched.length === items.length) {
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

  const resetGame = () => {
    setMatched([]);
    setItems([]);
    setImages([]);
    setVideos([]);
    setStartTime(null);
    setEndTime(null);
    setDifficulty(null);
    setGameState("start");
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
      <div className="column-match start-screen">
        <h1>🎯 Column Match</h1>
        <p>Select a difficulty level to start the game:</p>
        <DifficultyButtons />
        <div className="instructions">
          <h3>How to Play:</h3>
          <ul>
            <li>Drag the correct image to the corresponding video (or vice versa).</li>
            <li>Match all pairs as fast as you can.</li>
            <li>The game ends when all pairs are correctly matched.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (gameState === "end") {
    return (
      <div className="column-match end-screen">
        <h1>🎉 Game Over!</h1>
        <p>Difficulty: {difficulty}</p>
        <p>Time taken: {formatTime(endTime - startTime)}</p>
        <p>Want to play again? Choose a new difficulty:</p>
        <DifficultyButtons />
      </div>
    );
  }

  return (
    <div className="column-match">
      <h2>Match the Videos and Images</h2>
      <div className="game-area">
        <div className="section">
          <h2>Images</h2>
          <div className="grid-container">
            {images.map((item) => (
              <img
                key={item.name}
                src={item.image}
                alt={item.name}
                draggable={!matched.includes(item.name)}
                onDragStart={(e) => handleDragStart(e, item.name)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, item.name)}
                className={matched.includes(item.name) ? "matched" : ""}
              />
            ))}
          </div>
        </div>

        <div className="section">
          <h2>Videos</h2>
          <div className="grid-container">
            {videos.map((item) => (
              <div
                key={item.name}
                draggable={!matched.includes(item.name)}
                onDragStart={(e) => handleDragStart(e, item.name)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, item.name)}
                className={`drop-target ${matched.includes(item.name) ? "matched" : ""}`}
              >
                <video
                  src={item.sample_video}
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
  );
};

export default ColumnMatch;