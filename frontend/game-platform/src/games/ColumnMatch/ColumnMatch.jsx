// ColumnMatch.jsx
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
  const [gameState, setGameState] = useState("start");
  const [wrongDropTarget, setWrongDropTarget] = useState(null);

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

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
        setMatched([]);
        setStartTime(Date.now());
        setEndTime(null);
        setWrongDropTarget(null);
      };
      fetchData();
    }
  }, [difficulty, gameState]);

  const handleDragStart = (e, name, imgSrc) => {
    e.dataTransfer.setData("name", name);

    const dragImg = document.createElement("img");
    dragImg.src = imgSrc;
    dragImg.style.width = "120px";
    dragImg.style.height = "120px";
    dragImg.style.objectFit = "contain";

    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, 60, 60);

    setTimeout(() => document.body.removeChild(dragImg), 0);
  };

  const handleDrop = (e, targetName) => {
    e.preventDefault();
    const draggedName = e.dataTransfer.getData("name");

    if (draggedName === targetName && !matched.includes(draggedName)) {
      const newMatched = [...matched, draggedName];
      setMatched(newMatched);

      if (newMatched.length === items.length) {
        setEndTime(Date.now());
        setGameState("end");
      }
      return;
    }

    setWrongDropTarget(targetName);
    setTimeout(() => setWrongDropTarget(null), 700);
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const startGame = (level) => {
    setDifficulty(level);
    setGameState("playing");
  };

  const restartGame = () => {
    setGameState("start");
    setDifficulty(null);
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

  // Start Screen
  if (gameState === "start") {
    return (
      <div className="column-match start-screen">
        <h1>🎯 Column Match</h1>
        <p>Select a difficulty level to start the game:</p>

        <DifficultyButtons />

        <div className="instructions">
          <h3>How to Play:</h3>
          <ul>
            <li>Drag the correct image and drop it onto the matching video.</li>
            <li>Match all pairs as fast as you can.</li>
            <li>The game ends when all pairs are correctly matched.</li>
          </ul>
        </div>
      </div>
    );
  }

  // Result Screen
  if (gameState === "end") {
    const timeTaken = endTime - startTime;
    const seconds = Math.floor(timeTaken / 1000);
    
    return (
      <div className="column-match end-screen">
        <h1>🎉 Congratulations!</h1>
        <p style={{ fontSize: "1.3rem", color: "#495057" }}>
          <strong>Difficulty:</strong> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </p>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f97316" }}>
          Time taken: {formatTime(timeTaken)}
        </p>
        <p style={{ color: "#6c757d" }}>
          {seconds < 30 ? "Lightning fast! ⚡" : seconds < 60 ? "Great job! 👍" : "Well done! 🌟"}
        </p>
        <p style={{ marginTop: "1rem" }}>Want to play again? Choose a new difficulty:</p>

        <DifficultyButtons />
      </div>
    );
  }

  // Game Screen
  return (
    <div className="column-match">
      <button 
        className="back-to-difficulty-btn"
        onClick={restartGame}
      >
        ↩ Back to Menu
      </button>

      <h2>Match the Videos and Images</h2>

      <div className="game-area">
        <div className="sections">
          {/* IMAGES */}
          <div className="section">
            <h2>Images</h2>
            <div className="grid-container">
              {images.map((item) => (
                <img
                  key={item.name}
                  src={item.image}
                  alt={item.name}
                  draggable={!matched.includes(item.name)}
                  onDragStart={(e) => handleDragStart(e, item.name, item.image)}
                  className={`grid-item ${matched.includes(item.name) ? "matched" : ""}`}
                />
              ))}
            </div>
          </div>

          {/* VIDEOS */}
          <div className="section">
            <h2>Videos</h2>
            <div className="grid-container">
              {videos.map((item) => (
                <div
                  key={item.name}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, item.name)}
                  className={`grid-item drop-target 
                    ${matched.includes(item.name) ? "correct" : ""} 
                    ${wrongDropTarget === item.name ? "wrong" : ""}
                  `}
                >
                  <video
                    src={item.sample_video ?? item.video ?? item.sampleVideo}
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

export default ColumnMatch;